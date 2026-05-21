import { X } from "lucide-react";

/**
 * Continuing-context banner (PRD §4.3 + PRD_visual_updates §7).
 *
 * Shown at the top of the Panel while a Story 3 `continuingContext` frame
 * is present in `frameHistory`. Persists through screenshot and later
 * frames until the user dismisses it with X.
 */
export function PanelContinuingBanner({
  label,
  onDismiss,
}: {
  /** Task name from the story script, e.g. "Q2 Roadmap follow-up from Nick". */
  label: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        background: "#f1e3df",
        borderBottom: "1px solid rgba(156, 74, 42, 0.15)",
        padding: "8px 18px",
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="shrink-0 font-mono"
          style={{ fontSize: 11, color: "#9c4a2a" }}
          aria-hidden
        >
          ↳
        </span>
        <span
          className="truncate font-mono"
          style={{ fontSize: 11, color: "#6e2f18" }}
        >
          Continuing: {label}
        </span>
      </div>
      <button
        type="button"
        aria-label="Dismiss continuing context"
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 transition-colors hover:text-accent"
        style={{ color: "#a89c84" }}
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
