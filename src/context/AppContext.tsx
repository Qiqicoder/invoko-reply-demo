import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ---------------------------------------------------------------------------
 * Global app state (PRD §A6).
 *
 *   currentStory   – which story is active (1, 2, 3) or null when idle
 *   currentFrame   – index into the active story's frame array
 *   panelState     – high-level Panel lifecycle (drives which sub-UI shows)
 *   panelOpen      – is the Panel currently visible (toggled by F / Esc / etc.)
 *   replyPageOpen  – is the main Reply page overlay visible (Cmd+R)
 *
 * `panelOpen` is intentionally separate from `panelState`: a Panel can be
 * closed entirely (panelOpen=false) or open in any of the lifecycle states.
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
  currentFrame: number;
  panelState: PanelState;
  panelOpen: boolean;
  replyPageOpen: boolean;
  /** Which `data-mock-target` was just screenshot-captured, or null. */
  capturedTarget: string | null;
}

export interface AppContextValue extends AppState {
  setCurrentStory: (story: StoryId | null) => void;
  setCurrentFrame: (frame: number) => void;
  setPanelState: (state: PanelState) => void;
  setPanelOpen: (open: boolean) => void;
  setReplyPageOpen: (open: boolean) => void;
  setCapturedTarget: (target: string | null) => void;
  /** Reset Panel content state (frame=0, panelState='idle'); leaves visibility alone. */
  resetPanel: () => void;
  /** Open the Panel and reset its content state. Used by F key + Module F auto-open. */
  openPanel: () => void;
  /** Close the Panel and reset its content state. */
  closePanel: () => void;
  /** Start a story (PRD §D5): set story id, open Panel, enter screenshot mode. */
  startStory: (story: StoryId) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentStory, setCurrentStory] = useState<StoryId | null>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [panelState, setPanelState] = useState<PanelState>("idle");
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [replyPageOpen, setReplyPageOpen] = useState<boolean>(false);
  const [capturedTarget, setCapturedTarget] = useState<string | null>(null);

  const resetPanel = useCallback(() => {
    setCurrentFrame(0);
    setPanelState("idle");
    setCapturedTarget(null);
  }, []);

  const openPanel = useCallback(() => {
    setCurrentFrame(0);
    setPanelState("idle");
    setCapturedTarget(null);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    // Per PRD §C6: when Panel is closed and re-opened, reset to idle state.
    setCurrentFrame(0);
    setPanelState("idle");
    setCapturedTarget(null);
  }, []);

  const startStory = useCallback((story: StoryId) => {
    setCurrentStory(story);
    setCurrentFrame(0);
    setCapturedTarget(null);
    setPanelState("screenshotting");
    setPanelOpen(true);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      currentStory,
      currentFrame,
      panelState,
      panelOpen,
      replyPageOpen,
      capturedTarget,
      setCurrentStory,
      setCurrentFrame,
      setPanelState,
      setPanelOpen,
      setReplyPageOpen,
      setCapturedTarget,
      resetPanel,
      openPanel,
      closePanel,
      startStory,
    }),
    [
      currentStory,
      currentFrame,
      panelState,
      panelOpen,
      replyPageOpen,
      capturedTarget,
      resetPanel,
      openPanel,
      closePanel,
      startStory,
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
