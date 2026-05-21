import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FrameOf, ToastMemoryItem } from "../../stories/types";

/**
 * PanelToast — renders a `toast` frame (visual spec §12, Module E fix 1,
 * Module F fix 3).
 *
 * Two shapes (union on the frame):
 *
 *   1. Simple — `frame.lines: string[]`. Three quick ✓ lines, all visible
 *      at once. Used by Story 2/3 confirmation toasts.
 *
 *   2. Memory — `frame.header + frame.items[]`. The "MEMORY UPDATED" card
 *      used at the end of Story 1: small mono-caps gold header, then a
 *      list of 3 memory items, each with a green ✓ that springs in 200ms
 *      after the line text fades up. Items stagger at 0 / 600 / 1200 ms.
 *
 * Both shapes share the same warm-dark surface (#2d2722 + faint terracotta
 * border) and bottom-center placement, and both auto-dismiss after
 * `duration` ms (default 5000; Story 1 sets 6000).
 *
 * Lifecycle:
 *   - Enter: y=20 → 0, opacity 0 → 1, spring (damping 24, stiffness 220)
 *   - Visible for `duration` ms
 *   - Exit: opacity 1 → 0, 400ms easeOut (no translate — quiet fade in place)
 *   - After exit completes, fires `onDismiss` (Panel uses this to advance,
 *     which closes the Panel at story end).
 */
export function PanelToast({
  frame,
  onDismiss,
}: {
  frame: FrameOf<"toast">;
  /** Called once the fade-out exit animation has finished. */
  onDismiss: () => void;
}) {
  const isMemoryShape = "items" in frame;
  const duration = frame.duration ?? (isMemoryShape ? 6000 : 5000);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <AnimatePresence onExitComplete={onDismiss}>
      {show && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.4, ease: "easeOut" },
          }}
          transition={{ type: "spring", damping: 24, stiffness: 220 }}
          style={{
            position: "fixed",
            left: "50%",
            bottom: 32,
            transform: "translateX(-50%)",
            background: "#2d2722",
            color: "#f0e8d8",
            border: "1px solid rgba(156, 74, 42, 0.15)",
            padding: isMemoryShape ? "20px 24px" : "14px 18px",
            borderRadius: 12,
            minWidth: 320,
            maxWidth: isMemoryShape ? 480 : 520,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 13,
            lineHeight: 1.55,
            zIndex: 60,
          }}
          role="status"
        >
          {isMemoryShape ? (
            <MemoryToastBody header={frame.header} items={frame.items} />
          ) : (
            <SimpleToastBody lines={frame.lines} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------- Simple toast ----------------------------- */

function SimpleToastBody({ lines }: { lines: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <span
            aria-hidden
            style={{
              color: "#6b8868",
              fontWeight: 700,
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            ✓
          </span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- Memory toast ----------------------------- *
 * Per-item enter:
 *   - Item delay: 0 / 600 / 1200 ms (so all three feel sequential)
 *   - Each item's text: y 8 → 0, opacity 0 → 1, 400ms ease-out
 *   - Check icon: scale 0 → 1 spring (damping 18, stiffness 280)
 *     delayed 200ms after the line text starts entering — the founder
 *     reads the line, then the ✓ snaps in to confirm it
 * --------------------------------------------------------------------- */

function MemoryToastBody({
  header,
  items,
}: {
  header: string;
  items: ToastMemoryItem[];
}) {
  const STAGGER_MS = 600;

  return (
    <div>
      <div
        style={{
          fontFamily:
            '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
          fontSize: 10.5,
          letterSpacing: "0.12em",
          color: "#d4a373",
          fontWeight: 600,
          marginBottom: 14,
        }}
      >
        {header}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <MemoryItem
            key={i}
            item={item}
            delayMs={i * STAGGER_MS}
          />
        ))}
      </div>
    </div>
  );
}

function MemoryItem({
  item,
  delayMs,
}: {
  item: ToastMemoryItem;
  delayMs: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: delayMs / 1000,
      }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      {/* ✓ — springs in 200ms AFTER the line starts entering. */}
      <motion.span
        aria-hidden
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          damping: 18,
          stiffness: 280,
          delay: (delayMs + 200) / 1000,
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          borderRadius: 999,
          background: "rgba(107, 136, 104, 0.18)",
          color: "#7fa07a",
          fontSize: 11,
          fontWeight: 800,
          flexShrink: 0,
          marginTop: 1,
          lineHeight: 1,
        }}
      >
        ✓
      </motion.span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 13.5,
            fontWeight: 500,
            color: "#f0e8d8",
            lineHeight: 1.4,
          }}
        >
          {item.primary}
        </span>
        <span
          style={{
            fontFamily:
              '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
            fontSize: 11.5,
            color: "#a89c84",
            lineHeight: 1.45,
            letterSpacing: "0.01em",
          }}
        >
          {item.secondary}
        </span>
      </div>
    </motion.div>
  );
}
