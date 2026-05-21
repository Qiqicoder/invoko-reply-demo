import { CornerDownLeft } from "lucide-react";
import { useEffect } from "react";
import type { FrameOf } from "../../stories/types";

/**
 * PanelQuickActions — renders a `quickActions` frame (visual spec §3 +
 * `docs/panel_mock_idle.png`).
 *
 * Three horizontal cards in a row, equal width, gap 12px. Lives ABOVE the
 * Panel input bar with ~16px breathing room below the cards.
 *
 * Card style:
 *   - bg white, 1px #e2d8c2 border, 12px radius, padding 14px 16px
 *   - title: Fraunces 16px weight 500, color #1d1916
 *   - subtitle: mono 10px uppercase, letter-spacing 0.12em, #786d5b
 *   - top-right number: mono 11px, #a89c84
 *   - recommended: terracotta border #9c4a2a + ↵ icon bottom-right
 *
 * Behavior:
 *   - Click any card → onSelect(index)
 *   - Press Enter → triggers the first recommended card (or index 0)
 *   - Inactive (settled) cards stay visible but lose hover/keyboard.
 */
export function PanelQuickActions({
  frame,
  isActive,
  selection,
  onSelect,
}: {
  frame: FrameOf<"quickActions">;
  isActive: boolean;
  selection?: number;
  onSelect: (index: number) => void;
}) {
  useEffect(() => {
    if (!isActive) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        Boolean(target?.isContentEditable);
      if (inField) return;
      if (e.key === "Enter") {
        e.preventDefault();
        const recIdx = frame.actions.findIndex((a) => a.recommended);
        onSelect(recIdx >= 0 ? recIdx : 0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, frame.actions, onSelect]);

  return (
    <div
      style={{
        // 20px horizontal padding from Panel edges (spec §3)
        padding: "20px 20px 16px",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {frame.actions.map((a, i) => {
        const isRec = !!a.recommended;
        const isSel = selection === i;
        return (
          <button
            key={i}
            type="button"
            disabled={!isActive && !isSel}
            onClick={() => isActive && onSelect(i)}
            style={{
              position: "relative",
              padding: "14px 16px",
              minHeight: 80,
              background: "#ffffff",
              border: `1px solid ${isRec ? "#9c4a2a" : "#e2d8c2"}`,
              borderRadius: 12,
              cursor: isActive ? "pointer" : "default",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
              boxShadow: isSel
                ? "0 0 0 2px rgba(156,74,42,0.18)"
                : "none",
              transition:
                "box-shadow 120ms ease, background 120ms ease, transform 120ms ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) return;
              e.currentTarget.style.background = "#faf7ef";
            }}
            onMouseLeave={(e) => {
              if (!isActive) return;
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            {/* Top-right number */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 10,
                right: 12,
                fontFamily:
                  '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                fontSize: 11,
                color: "#a89c84",
              }}
            >
              {i + 1}
            </span>

            {/* Title */}
            <span
              style={{
                fontFamily: '"Fraunces", ui-serif, Georgia, serif',
                fontSize: 16,
                fontWeight: 500,
                color: "#1d1916",
                lineHeight: 1.25,
              }}
            >
              {a.title}
            </span>

            {/* Subtitle */}
            <span
              style={{
                fontFamily:
                  '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                fontSize: 10,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#786d5b",
              }}
            >
              {a.sub}
            </span>

            {/* Recommended ↵ icon */}
            {isRec && (
              <CornerDownLeft
                aria-hidden
                size={14}
                strokeWidth={2}
                color="#9c4a2a"
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 12,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
