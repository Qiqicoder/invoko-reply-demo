import { motion } from "framer-motion";
import type { FrameOf } from "../../stories/types";

/**
 * PanelUserMessage — renders a `userMessage` frame (visual spec §9).
 *
 * Right-aligned chat bubble showing something the user typed (either via
 * the Panel input bar or scripted by a story). The bottom-right corner is
 * cut (4px radius) to read like a chat tail.
 *
 * Visual:
 *   - max-width: 80% of Panel width
 *   - bg #ede5d4 (cream-2), 14/14/4/14 corner radii
 *   - padding 9px 14px
 *   - Inter Tight 13px, color #1d1916
 */
export function PanelUserMessage({
  frame,
}: {
  frame: FrameOf<"userMessage">;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: "8px 22px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          maxWidth: "80%",
          background: "#ede5d4",
          borderRadius: "14px 14px 4px 14px",
          padding: "9px 14px",
          fontFamily:
            '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
          fontSize: 13,
          color: "#1d1916",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {frame.text}
      </motion.div>
    </div>
  );
}
