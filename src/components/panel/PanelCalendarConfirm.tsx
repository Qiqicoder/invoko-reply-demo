import type { FrameOf } from "../../stories/types";

/**
 * PanelCalendarConfirm — renders a `calendarConfirm` frame (visual spec §11).
 *
 * Small inline card shown in the Panel conversation area for Story 3's
 * meeting confirmation step.
 *
 * Visual:
 *   - bg #faf7ef, 1px #e2d8c2 border, 14px radius, padding 16/18
 *   - small mono caps "MEETING" / "ZOOM" label in terracotta
 *   - Date/time: Fraunces serif 15px #1d1916
 *   - "with [person]" line: Inter Tight 13px #786d5b
 *   - Topic line: Inter Tight 13px #786d5b
 *   - Buttons: "Looks good" (solid terracotta) + "Adjust time" (ghost)
 */
export function PanelCalendarConfirm({
  frame,
  isActive,
  onConfirm,
  onAdjust,
}: {
  frame: FrameOf<"calendarConfirm">;
  isActive: boolean;
  onConfirm: () => void;
  onAdjust: () => void;
}) {
  return (
    <div style={{ padding: "16px 22px" }}>
      <div
        style={{
          background: "#faf7ef",
          border: "1px solid #e2d8c2",
          borderRadius: 14,
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            fontFamily:
              '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "#9c4a2a",
            marginBottom: 8,
          }}
        >
          {frame.title}
        </div>

        <div
          style={{
            fontFamily: '"Fraunces", ui-serif, Georgia, serif',
            fontSize: 15,
            fontWeight: 500,
            color: "#1d1916",
            lineHeight: 1.35,
            marginBottom: 6,
          }}
        >
          {frame.time}
        </div>

        <div
          style={{
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 13,
            color: "#786d5b",
            lineHeight: 1.5,
          }}
        >
          with {frame.with}
        </div>

        <div
          style={{
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 13,
            color: "#786d5b",
            lineHeight: 1.5,
          }}
        >
          {frame.topic}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 14,
          }}
        >
          <button
            type="button"
            disabled={!isActive}
            onClick={onAdjust}
            style={{
              padding: "7px 16px",
              borderRadius: 999,
              border: "1px solid #d6cab2",
              background: "transparent",
              color: "#1d1916",
              fontFamily:
                '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              cursor: isActive ? "pointer" : "default",
              opacity: isActive ? 1 : 0.6,
            }}
          >
            Adjust time
          </button>
          <button
            type="button"
            disabled={!isActive}
            onClick={onConfirm}
            style={{
              padding: "7px 18px",
              borderRadius: 999,
              border: "none",
              background: "#9c4a2a",
              color: "#ffffff",
              fontFamily:
                '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              cursor: isActive ? "pointer" : "default",
              opacity: isActive ? 1 : 0.6,
            }}
          >
            Looks good
          </button>
        </div>
      </div>
    </div>
  );
}
