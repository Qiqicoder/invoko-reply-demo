import { useApp } from "../../context/AppContext";

/**
 * Bottom-of-screen hint telling the user how to summon the Reply Panel.
 *
 * Per PRD §A8 we use `F` instead of `Fn` because Fn doesn't fire keydown
 * events reliably in browsers. Hidden when the Panel is already open, since
 * the hint would otherwise contradict reality.
 */
export function KeyboardHint({ text = "Press F to summon Invoko" }: { text?: string }) {
  const { panelOpen } = useApp();
  if (panelOpen) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
      <div className="flex items-center gap-2 rounded-full bg-paper/80 px-4 py-2 text-sm text-ink-3 shadow-sm backdrop-blur">
        <Kbd>F</Kbd>
        <span className="font-sans">{text.replace(/^Press F\s+/, "")}</span>
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
