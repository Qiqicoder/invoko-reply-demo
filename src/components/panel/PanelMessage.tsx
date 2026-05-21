import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { FrameOf } from "../../stories/types";

/**
 * PanelMessage — renders a single `thinking` frame (PRD §E + visual spec §8
 * + Module F: deliberate pacing + "actively reasoning" affordances).
 *
 * Visual:
 *   - Inter Tight 13px, color #786d5b, line-height 1.55
 *   - Each line prefixed with "·" bullet in terracotta (#9c4a2a, weight 700)
 *   - 4px gap between lines
 *
 * Animation:
 *   - Each line enters: opacity 0→1 + translateY 4→0, 600ms ease-out
 *   - Stagger between line *starts*: 2000ms (signature demo moment)
 *   - The CURRENT (most recent) line breathes (opacity 0.6↔1, 1800ms cycle)
 *   - Settled lines snap to full opacity and stop breathing
 *   - Current line shows animated "•••" dots until the next line appears
 *
 * Auto-advance: Panel.tsx — `lines × STEP_MS + TRAILING_PAUSE_MS`
 * (4 lines → ~10.5s visible).
 */
export const THINKING_STEP_MS = 2000;
export const THINKING_ENTER_MS = 600;
/** Pause after the last line is on screen, before auto-advancing. */
export const THINKING_TRAILING_PAUSE_MS = 2500;

/** Total dwell time for a thinking frame (used by Panel auto-advance). */
export function thinkingFrameDurationMs(lineCount: number): number {
  return lineCount * THINKING_STEP_MS + THINKING_TRAILING_PAUSE_MS;
}

export function PanelMessage({
  frame,
  isActive,
}: {
  frame: FrameOf<"thinking">;
  isActive: boolean;
  /** @deprecated Panel.tsx owns the auto-advance timer. */
  onComplete?: () => void;
}) {
  const lineCount = frame.lines.length;
  const currentLineIndex = useThinkingLineIndex(lineCount, isActive);

  const stepSeconds = useMemo(() => THINKING_STEP_MS / 1000, []);
  const enterSeconds = useMemo(() => THINKING_ENTER_MS / 1000, []);

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
        <ThinkingLine
          key={i}
          line={line}
          isActive={isActive}
          isSettled={isActive && currentLineIndex > i}
          isCurrent={isActive && currentLineIndex === i}
          showDots={isActive && currentLineIndex === i && i < lineCount - 1}
          enterDelay={isActive ? i * stepSeconds : 0}
          enterDuration={enterSeconds}
        />
      ))}
    </div>
  );
}

/* ----------------------- Per-line component ----------------------- */

function ThinkingLine({
  line,
  isActive,
  isSettled,
  isCurrent,
  showDots,
  enterDelay,
  enterDuration,
}: {
  line: string;
  isActive: boolean;
  isSettled: boolean;
  isCurrent: boolean;
  showDots: boolean;
  enterDelay: number;
  enterDuration: number;
}) {
  return (
    <motion.div
      initial={isActive ? { opacity: 0, y: 4 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: enterDuration,
        ease: "easeOut",
        delay: enterDelay,
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
      <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "baseline", gap: 2 }}>
        {/* Breathing: only the in-progress line pulses; settled lines are solid. */}
        <motion.span
          animate={
            isCurrent && isActive && !isSettled
              ? { opacity: [0.6, 1, 0.6] }
              : { opacity: 1 }
          }
          transition={
            isCurrent && isActive && !isSettled
              ? {
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                }
              : { duration: 0.15, ease: "easeOut" }
          }
        >
          {renderInlineMarkdown(line)}
        </motion.span>
        {showDots && <ThinkingDots />}
      </span>
    </motion.div>
  );
}

/* ----------------------- Animated ••• dots ----------------------- */

function ThinkingDots() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        gap: 2,
        marginLeft: 4,
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i * 0.3) / 1, // 300ms offset between dots
          }}
          style={{
            color: "#9c4a2a",
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          •
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Tracks which thinking line is "current" (most recent, still in progress).
 * Line i becomes current at t = i × STEP_MS. During the trailing pause the
 * last line stays current so it keeps breathing until auto-advance.
 */
function useThinkingLineIndex(lineCount: number, isActive: boolean): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive || lineCount === 0) {
      setIndex(Math.max(0, lineCount - 1));
      return;
    }

    setIndex(0);
    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;
      const idx = Math.min(
        Math.floor(elapsed / THINKING_STEP_MS),
        lineCount - 1,
      );
      setIndex(idx);
    };

    tick();
    const id = window.setInterval(tick, 50);
    return () => clearInterval(id);
  }, [isActive, lineCount]);

  return index;
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
