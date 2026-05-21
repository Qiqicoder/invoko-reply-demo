import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FrameOf } from "../../stories/types";

/**
 * PanelToast — renders a `toast` frame (visual spec §12 + Module E fix 1).
 *
 * A quiet confirmation, not an alert. Positioned bottom-center, 32px from
 * the bottom edge. Warm dark surface that reads as part of the cream
 * palette rather than a separate harsh element.
 *
 * Visual:
 *   - bg #2d2722 (warm dark brown), 1px border rgba(156,74,42,0.15)
 *   - text #f0e8d8 (warm off-white), check #6b8868 (light moss green)
 *   - 12px radius, padding 14/18, shadow `0 8px 32px rgba(0,0,0,0.15)`
 *   - min-width 320, max-width 520
 *   - Inter Tight 13px, line-height 1.55
 *
 * Lifecycle / animation:
 *   - Enter: y=20 → 0 + opacity 0 → 1, spring damping=24 stiffness=220
 *     (gentle — feels like a settle rather than a slam)
 *   - Visible for `duration` ms (default 5000 — Module E fix 1)
 *   - Exit: opacity 1 → 0, 400ms easeOut. No translate on exit — the
 *     toast quietly fades in place.
 *   - After exit animation completes, fires `onDismiss`. The engine uses
 *     that to advance (typically closes the Panel at story end).
 */
export function PanelToast({
  frame,
  onDismiss,
}: {
  frame: FrameOf<"toast">;
  /** Called once the fade-out exit animation has finished. */
  onDismiss: () => void;
}) {
  const duration = frame.duration ?? 5000;
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
            padding: "14px 18px",
            borderRadius: 12,
            minWidth: 320,
            maxWidth: 520,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 13,
            lineHeight: 1.55,
            zIndex: 60,
          }}
          role="status"
        >
          {frame.lines.map((line, i) => (
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
