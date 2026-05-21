import { useState, type ReactNode } from "react";

/**
 * MemoryHighlight (PRD_visual_updates.md §10 Memory Highlight).
 *
 * Wraps a span of "memory-pulled" text in the Invoko gradient. Stories use
 * `[mem: text]` syntax inside draft body strings and `PanelDraft` parses
 * those out and wraps each match in this component.
 *
 * Implementation:
 *   - linear-gradient text fill via `background-clip: text` (with the
 *     `-webkit-text-fill-color: transparent` Safari incantation)
 *   - 1px dotted bottom border in muted terracotta
 *   - hover shows a tiny tooltip ("Pulled from your memory")
 */
export function MemoryHighlight({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "inline",
        fontWeight: 500,
        backgroundImage:
          "linear-gradient(135deg, #9c4a2a 0%, #c97550 50%, #d4a373 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        // The dotted underline lives on a pseudo-ish layer: since we can't
        // easily render ::after on a gradient-text span, just set border.
        borderBottom: "1px dotted rgba(156, 74, 42, 0.3)",
        // Tiny breathing room so the dotted line doesn't crowd descenders.
        paddingBottom: 1,
        cursor: "help",
      }}
    >
      {children}
      {hovered && (
        <span
          // Tooltip is rendered as a sibling absolute element. It sits in
          // its own stacking context so the gradient text-fill doesn't
          // bleed into it. Tooltip text uses normal (non-gradient) fill.
          aria-hidden
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translate(-50%, -6px)",
            background: "#1d1916",
            color: "#f5efe4",
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 500,
            padding: "5px 9px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            // Cancel inherited gradient text fill on the tooltip.
            WebkitTextFillColor: "#f5efe4",
            backgroundImage: "none",
            boxShadow: "0 4px 12px rgba(29, 25, 22, 0.18)",
            letterSpacing: "0.01em",
            zIndex: 5,
          }}
        >
          Pulled from your memory
        </span>
      )}
    </span>
  );
}
