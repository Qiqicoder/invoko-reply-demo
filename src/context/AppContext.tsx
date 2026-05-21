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
 *   replyPageOpen  – is the main Reply page overlay visible (Cmd+R)
 *
 * Later modules (F/G/H) will add helpers like `advanceFrame`, `addPerson`,
 * `addDoc`, etc. For Module A we expose just enough to wire the foundation.
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
  replyPageOpen: boolean;
}

export interface AppContextValue extends AppState {
  setCurrentStory: (story: StoryId | null) => void;
  setCurrentFrame: (frame: number) => void;
  setPanelState: (state: PanelState) => void;
  setReplyPageOpen: (open: boolean) => void;
  resetPanel: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentStory, setCurrentStory] = useState<StoryId | null>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [panelState, setPanelState] = useState<PanelState>("idle");
  const [replyPageOpen, setReplyPageOpen] = useState<boolean>(false);

  const resetPanel = useCallback(() => {
    setCurrentFrame(0);
    setPanelState("idle");
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      currentStory,
      currentFrame,
      panelState,
      replyPageOpen,
      setCurrentStory,
      setCurrentFrame,
      setPanelState,
      setReplyPageOpen,
      resetPanel,
    }),
    [currentStory, currentFrame, panelState, replyPageOpen, resetPanel],
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
