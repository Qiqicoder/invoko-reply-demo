import { useApp } from "../../context/AppContext";

/**
 * Bottom-of-screen hint (PRD §A8 + §4.3 Frame 8).
 *
 * Default: Press F to summon Invoko.
 * After Story 3 completes: Press ⌘R to open the Reply page (Module H).
 * Hidden while the Panel is open.
 */
export function KeyboardHint() {
  const { panelOpen, replyPageOpen, showReplyPageHint } = useApp();
  if (panelOpen || replyPageOpen) return null;

  if (showReplyPageHint) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div className="flex items-center gap-2 rounded-full bg-paper/80 px-4 py-2 text-sm text-ink-3 shadow-sm backdrop-blur">
          <span className="font-sans">Press</span>
          <Kbd>⌘</Kbd>
          <Kbd>R</Kbd>
          <span className="font-sans">
            to see what Reply has learned today →
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
      <div className="flex items-center gap-2 rounded-full bg-paper/80 px-4 py-2 text-sm text-ink-3 shadow-sm backdrop-blur">
        <Kbd>F</Kbd>
        <span className="font-sans">to summon Invoko</span>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-ink-4/40 bg-cream-2 px-1.5 font-mono text-xs text-ink-2 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]"
    >
      {children}
    </kbd>
  );
}
