import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Frame } from "../stories/types";

/* ---------------------------------------------------------------------------
 * Global app state (PRD §A6 + Module E engine extensions + Module F state
 * continuity).
 *
 *   currentStory       – which story is active (1, 2, 3) or null when idle
 *   panelState         – Panel lifecycle (drives which sub-UI shows)
 *   panelOpen          – is the Panel currently visible (F / Esc / etc.)
 *   replyPageOpen      – is the main Reply page overlay visible (Cmd+R)
 *   capturedTarget     – which `data-mock-target` was just screenshot-captured
 *
 *   --- Module E (Conversation Engine) ---
 *   storyFrames        – full Frame[] for the active story (null when idle)
 *   frameHistory       – frames the user has progressed through
 *   currentFrame       – derived: last item of frameHistory (or null)
 *
 *   --- Module F (state continuity, PRD §F7 + §6.3) ---
 *   addedPeople        – ids of People revealed by a story action (Sarah after
 *                        Story 1). Persists across story switches so Module H's
 *                        Reply page reflects them after the user replays.
 *   completedStories   – ids of stories the user has played to the toast.
 *                        Used by ScenarioSwitcher to highlight the next story.
 * --------------------------------------------------------------------------- */

export type StoryId = 1 | 2 | 3;

export type PanelState =
  | "idle"
  | "screenshotting"
  | "thinking"
  | "choosing"
  | "drafting"
  | "editing"
  | "sent";

export interface AppState {
  currentStory: StoryId | null;
  panelState: PanelState;
  panelOpen: boolean;
  replyPageOpen: boolean;
  capturedTarget: string | null;
  storyFrames: Frame[] | null;
  frameHistory: Frame[];
  /**
   * Position in `storyFrames`. Independent of frameHistory.length because
   * live-inserted frames (user messages typed into the input bar) live in
   * history but don't consume a script slot.
   */
  scriptIndex: number;
  /** Derived from frameHistory: the last item or null. */
  currentFrame: Frame | null;
  /** PRD §F7 — people revealed by a story action (e.g. Sarah after Story 1). */
  addedPeople: ReadonlySet<string>;
  /** Stories the user has played to completion (toast → close). */
  completedStories: ReadonlySet<StoryId>;
  /**
   * Story to surface as the natural next step in the ScenarioSwitcher.
   * Derived from completedStories: 1 done → 2; 2 done → 3; 3 done → null.
   */
  suggestedNextStory: StoryId | null;
}

export interface AppContextValue extends AppState {
  setCurrentStory: (story: StoryId | null) => void;
  setPanelState: (state: PanelState) => void;
  setPanelOpen: (open: boolean) => void;
  setReplyPageOpen: (open: boolean) => void;
  setCapturedTarget: (target: string | null) => void;

  /** Reset Panel content state (clears frames + capturedTarget). */
  resetPanel: () => void;
  /** Clear frameHistory and storyFrames (used by close + story switch). */
  resetFrames: () => void;
  /** Open the Panel and reset its content state. Used by F key. */
  openPanel: () => void;
  /** Close the Panel and reset its content state. */
  closePanel: () => void;
  /** Start a story by id (PRD §D5 revised): sets currentStory, closes Panel. */
  startStory: (story: StoryId) => void;

  /**
   * Module F entry point — start a story AND immediately load its frames
   * into the engine (PRD §F2 + §F3). The Panel opens, panelState reflects
   * the first frame (typically `screenshotting`), and the user is dropped
   * directly into the experience. Use this from the ScenarioSwitcher.
   */
  startStoryWithFrames: (story: StoryId, frames: Frame[]) => void;

  /**
   * Module E — load a Frame[] as the active script. Opens the Panel,
   * pushes the first frame to history, and adjusts panelState based on
   * that frame's type (screenshot → 'screenshotting', else 'idle').
   */
  loadStory: (frames: Frame[]) => void;

  /** Append a specific Frame to history. (Story scripts use this.) */
  advanceFrame: (next: Frame) => void;

  /**
   * Advance to the next frame in `storyFrames` (the most common path —
   * used by all auto-advancing frames and most user-triggered transitions).
   * If we've reached the end of the script, closes the Panel.
   */
  advanceToNext: () => void;

  /**
   * Submit free text from the Panel input bar.
   *
   * The typed text is consumed (not echoed as a user bubble — the Panel
   * intentionally suppresses that visual). The story is expected to
   * follow the user's input with a thinking + draft regeneration, so we
   * just advance to the next scripted frame.
   *
   * Module F will route the consumed text into the regen prompt; for
   * Module E the text is dropped after triggering advance.
   */
  submitUserInput: (text: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentStory, setCurrentStory] = useState<StoryId | null>(null);
  const [panelState, setPanelState] = useState<PanelState>("idle");
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [replyPageOpen, setReplyPageOpen] = useState<boolean>(false);
  const [capturedTarget, setCapturedTarget] = useState<string | null>(null);

  const [storyFrames, setStoryFrames] = useState<Frame[] | null>(null);
  const [frameHistory, setFrameHistory] = useState<Frame[]>([]);
  const [scriptIndex, setScriptIndex] = useState<number>(0);

  const [addedPeople, setAddedPeople] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [completedStories, setCompletedStories] = useState<
    ReadonlySet<StoryId>
  >(() => new Set<StoryId>());

  const currentFrame = useMemo<Frame | null>(
    () =>
      frameHistory.length > 0 ? frameHistory[frameHistory.length - 1] : null,
    [frameHistory],
  );

  /**
   * Suggested next story — surfaces in the ScenarioSwitcher as a "Next"
   * badge. Only meaningful AFTER the user has finished a story; before
   * any completion the default Story 1 entry already reads as the
   * obvious starting point, so a "Next" cue there would be redundant.
   */
  const suggestedNextStory = useMemo<StoryId | null>(() => {
    if (completedStories.size === 0) return null;
    const order: StoryId[] = [1, 2, 3];
    for (const id of order) {
      if (!completedStories.has(id)) return id;
    }
    return null;
  }, [completedStories]);

  /* ----------------------- Internal helpers ----------------------- */

  const resetFrames = useCallback(() => {
    setStoryFrames(null);
    setFrameHistory([]);
    setScriptIndex(0);
  }, []);

  /* -------------------------- Public actions -------------------------- */

  const resetPanel = useCallback(() => {
    setPanelState("idle");
    setCapturedTarget(null);
    resetFrames();
  }, [resetFrames]);

  const openPanel = useCallback(() => {
    // PRD §D5 (revised): with no active story, just plain idle; with a story
    // selected, F-press enters screenshot mode. (Module F will replace this
    // with a per-story `loadStory(...)` call from the ScenarioSwitcher.)
    setCapturedTarget(null);
    setPanelState(currentStory != null ? "screenshotting" : "idle");
    resetFrames();
    setPanelOpen(true);
  }, [currentStory, resetFrames]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setPanelState("idle");
    setCapturedTarget(null);
    resetFrames();
  }, [resetFrames]);

  const startStory = useCallback(
    (story: StoryId) => {
      setCurrentStory(story);
      setCapturedTarget(null);
      setPanelState("idle");
      setPanelOpen(false);
      resetFrames();
    },
    [resetFrames],
  );

  const startStoryWithFrames = useCallback(
    (story: StoryId, frames: Frame[]) => {
      // PRD §F2 + §F3: set story context AND drop the user straight into
      // the script. React batches these state updates into one render so
      // GmailWindow, Panel, and ScreenshotOverlay all mount together.
      if (frames.length === 0) return;
      const first = frames[0];
      setCurrentStory(story);
      setStoryFrames(frames);
      setFrameHistory([first]);
      setScriptIndex(0);
      setCapturedTarget(null);
      setPanelState(first.type === "screenshot" ? "screenshotting" : "idle");
      setPanelOpen(true);
    },
    [],
  );

  /* --------------------- Module E: frame engine --------------------- */

  const loadStory = useCallback((frames: Frame[]) => {
    if (frames.length === 0) return;
    const first = frames[0];
    setStoryFrames(frames);
    setFrameHistory([first]);
    setScriptIndex(0);
    setCapturedTarget(null);
    setPanelState(first.type === "screenshot" ? "screenshotting" : "idle");
    setPanelOpen(true);
  }, []);

  const advanceFrame = useCallback((next: Frame) => {
    setFrameHistory((prev) => [...prev, next]);
    if (next.type === "screenshot") {
      setPanelState("screenshotting");
    }
  }, []);

  const advanceToNext = useCallback(() => {
    if (!storyFrames) return;
    const nextIdx = scriptIndex + 1;
    const next = storyFrames[nextIdx];
    if (!next) {
      // End of story — defer panel close + side effects so we don't
      // setState during another component's render.
      const justFinished = currentStory;
      queueMicrotask(() => {
        setPanelOpen(false);
        setPanelState("idle");
        if (justFinished !== null) {
          setCompletedStories((prev) => {
            if (prev.has(justFinished)) return prev;
            const next = new Set(prev);
            next.add(justFinished);
            return next;
          });
          // PRD §F7: Sarah is "added to People as Investor" at the end
          // of Story 1. Module H's ReplyPage will read `addedPeople` to
          // render her card.
          if (justFinished === 1) {
            setAddedPeople((prev) => {
              if (prev.has("sarah")) return prev;
              const next = new Set(prev);
              next.add("sarah");
              return next;
            });
          }
          // Story 2 / 3 side effects (docs, calendar, etc.) land here in
          // Module G — keeping the dispatch shape consistent.
        }
      });
      return;
    }
    setScriptIndex(nextIdx);
    setFrameHistory((prev) => [...prev, next]);
    if (next.type === "screenshot") {
      setPanelState("screenshotting");
    } else {
      setPanelState((curr) =>
        curr === "screenshotting" ? "idle" : curr,
      );
    }
  }, [storyFrames, scriptIndex, currentStory]);

  const submitUserInput = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      // Module E: text is consumed; no user-message bubble is rendered.
      // Advance to the next scripted frame (typically a thinking/draft
      // regen). Module F will instead route `trimmed` into the regen
      // prompt before advancing.
      advanceToNext();
    },
    [advanceToNext],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      currentStory,
      panelState,
      panelOpen,
      replyPageOpen,
      capturedTarget,
      storyFrames,
      frameHistory,
      scriptIndex,
      currentFrame,
      addedPeople,
      completedStories,
      suggestedNextStory,
      setCurrentStory,
      setPanelState,
      setPanelOpen,
      setReplyPageOpen,
      setCapturedTarget,
      resetPanel,
      resetFrames,
      openPanel,
      closePanel,
      startStory,
      startStoryWithFrames,
      loadStory,
      advanceFrame,
      advanceToNext,
      submitUserInput,
    }),
    [
      currentStory,
      panelState,
      panelOpen,
      replyPageOpen,
      capturedTarget,
      storyFrames,
      frameHistory,
      scriptIndex,
      currentFrame,
      addedPeople,
      completedStories,
      suggestedNextStory,
      resetPanel,
      resetFrames,
      openPanel,
      closePanel,
      startStory,
      startStoryWithFrames,
      loadStory,
      advanceFrame,
      advanceToNext,
      submitUserInput,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an <AppProvider>");
  }
  return ctx;
}
