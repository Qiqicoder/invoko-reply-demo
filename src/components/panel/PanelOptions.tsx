import { CornerDownLeft, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import type { FrameOf } from "../../stories/types";

/**
 * PanelOptions — renders an `options` frame (PRD §E + visual spec §6).
 *
 * Visual:
 *   - Container: flush with Panel background (#faf7ef), padding 20px 22px
 *   - Header: question text in Fraunces serif 16px
 *   - Each option row: 24×24 mono number prefix + 14px Inter Tight label
 *   - Recommended option: "RECOMMENDED" mono caps tag in terracotta
 *   - Hover/selected row: cream highlight (#f5efe4) + ↵ corner-down-left icon
 *   - Bottom "Something else" row: pencil icon + Skip pill button
 *
 * Behavior:
 *   - Click a row → call onSelect(index)
 *   - Click Skip → call onSelect(-1)  (engine treats as "skip")
 *   - Press 1/2/3 → select corresponding row
 *   - Press Enter → select the recommended row
 *   - When not active, render in settled state with the prior selection.
 */
export function PanelOptions({
  frame,
  isActive,
  selection,
  onSelect,
}: {
  frame: FrameOf<"options">;
  isActive: boolean;
  /** If a selection has already been made, render it highlighted. */
  selection?: number;
  onSelect: (index: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  /* ---------------- Keyboard shortcuts ---------------- */
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
        const recIdx = frame.options.findIndex((o) => o.recommended);
        onSelect(recIdx >= 0 ? recIdx : 0);
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= frame.options.length) {
        e.preventDefault();
        onSelect(n - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, frame.options, onSelect]);

  const lastIdx = frame.options.length - 1;

  return (
    <div style={{ padding: "20px 22px" }}>
      {/* Header — question */}
      <div
        style={{
          fontFamily: '"Fraunces", ui-serif, Georgia, serif',
          fontSize: 16,
          fontWeight: 400,
          color: "#1d1916",
          lineHeight: 1.4,
          paddingBottom: 4,
        }}
      >
        {frame.question}
      </div>

      {/* Option rows */}
      {frame.options.map((opt, i) => {
        const isSelected = selection === i;
        const isHovered = hovered === i;
        const showHighlight = isActive && (isHovered || isSelected);

        return (
          <button
            key={i}
            type="button"
            disabled={!isActive && selection !== i}
            onClick={() => isActive && onSelect(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              width: "calc(100% + 16px)",
              marginLeft: -8,
              padding: "12px 8px",
              borderRadius: 8,
              border: "none",
              borderBottom:
                i === lastIdx ? "none" : "1px solid #e2d8c2",
              background: showHighlight ? "#f5efe4" : "transparent",
              cursor: isActive ? "pointer" : "default",
              textAlign: "left",
              transition: "background 120ms ease",
            }}
          >
            {/* Number prefix */}
            <span
              aria-hidden
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "#ede5d4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily:
                  '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                fontSize: 12,
                color: "#786d5b",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>

            {/* Label + recommended tag */}
            <span
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily:
                  '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
                fontSize: 14,
                color: "#1d1916",
                lineHeight: 1.4,
              }}
            >
              {opt.label}
              {opt.recommended && (
                <span
                  style={{
                    fontFamily:
                      '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                    fontSize: 9.5,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#9c4a2a",
                  }}
                >
                  Recommended
                </span>
              )}
            </span>

            {/* ↵ arrow when this row is highlighted */}
            {showHighlight && (
              <CornerDownLeft
                size={14}
                strokeWidth={1.8}
                color="#786d5b"
                aria-hidden
              />
            )}
          </button>
        );
      })}

      {/* "Something else" row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 0 4px",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "#ede5d4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Pencil size={12} strokeWidth={1.8} color="#786d5b" />
        </span>
        <span
          style={{
            flex: 1,
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 14,
            color: "#a89c84",
          }}
        >
          Something else
        </span>
        <button
          type="button"
          disabled={!isActive}
          onClick={() => isActive && onSelect(-1)}
          style={{
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 13,
            color: "#1d1916",
            padding: "6px 14px",
            border: "1px solid #d6cab2",
            borderRadius: 999,
            background: "transparent",
            cursor: isActive ? "pointer" : "default",
          }}
        >
          {frame.skipLabel ?? "Skip"}
        </button>
      </div>
    </div>
  );
}
