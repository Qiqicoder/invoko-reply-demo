import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import type { FrameOf } from "../../stories/types";

/**
 * PanelMessage — renders a single `thinking` frame (PRD §E + visual spec §8).
 *
 * Visual:
 *   - Inter Tight 13px, color #786d5b, line-height 1.55
 *   - Each line prefixed with "·" bullet in terracotta (#9c4a2a, weight 700)
 *   - 4px gap between lines
 *   - Lines fade in with 0.4s stagger (when `isActive`)
 *
 * Markdown convention: `**bold**` inside a line renders weight 500 in
 * darker ink (#4d4438) — spec §8 "Strong/bold parts".
 *
 * Auto-advance: when active, fires `onComplete` ~0.4s AFTER the last line
 * has appeared. The engine listens for this and pushes the next frame.
 */
export function PanelMessage({
  frame,
  isActive,
  onComplete,
}: {
  frame: FrameOf<"thinking">;
  isActive: boolean;
  onComplete?: () => void;
}) {
  // Stagger timing
  const STEP_DELAY = 0.4; // seconds between line appearances
  const TRAILING_DELAY = 0.5; // pause after the final line before auto-advance

  const totalMs = useMemo(
    () => (frame.lines.length * STEP_DELAY + TRAILING_DELAY) * 1000,
    [frame.lines.length],
  );

  useEffect(() => {
    if (!isActive || !onComplete) return;
    const t = setTimeout(() => onComplete(), totalMs);
    return () => clearTimeout(t);
  }, [isActive, onComplete, totalMs]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "16px 22px",
        fontFamily: '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {frame.lines.map((line, i) => (
        <motion.div
          key={i}
          // When inactive (past frame replayed in conversation history),
          // skip the staggered animation and render instantly.
          initial={isActive ? { opacity: 0, y: 4 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
            delay: isActive ? i * STEP_DELAY : 0,
          }}
          style={{
            display: "flex",
            gap: 8,
            fontSize: 13,
            lineHeight: 1.55,
            color: "#786d5b",
          }}
        >
          <span
            aria-hidden
            style={{
              color: "#9c4a2a",
              fontWeight: 700,
              flexShrink: 0,
              width: 8,
              textAlign: "center",
            }}
          >
            ·
          </span>
          <span>{renderInlineMarkdown(line)}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- Lightweight **bold** parser ---------------- */

function renderInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t${key++}`}>{text.slice(lastIndex, match.index)}</span>,
      );
    }
    parts.push(
      <span
        key={`b${key++}`}
        style={{ fontWeight: 500, color: "#4d4438" }}
      >
        {match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={`t${key++}`}>{text.slice(lastIndex)}</span>);
  }
  return parts;
}
