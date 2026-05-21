import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { PanelInput } from "./PanelInput";

/**
 * Reply Panel container (PRD §C1–C6 + visual spec §1).
 *
 * Responsibilities:
 *   - Fixed-position floating element at top-center (~80px from top edge)
 *   - Spring slide-in / opacity-fade on open; quick fade on close
 *   - Keyboard: `F` toggles visibility, `Esc` closes
 *   - Click outside closes
 *   - On close (and re-open), reset to idle state (frame=0, panelState='idle')
 *
 * Module C only renders the input bar inside. Module D will add the
 * ScreenshotOverlay; Module E will mount frame-driven content (Quick
 * Actions, thinking, options, draft, etc.) above the input bar.
 */
export function Panel() {
  const { panelOpen, panelState, openPanel, closePanel } = useApp();
  const panelRef = useRef<HTMLDivElement | null>(null);

  /* ------------------------ Keyboard: F + Esc ------------------------ */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        Boolean(target?.isContentEditable);

      if (e.key === "Escape" && panelOpen) {
        e.preventDefault();
        closePanel();
        return;
      }

      // Don't intercept `F` while the user is typing in any field — let it
      // through so they can actually type the letter. (PRD §C3 substitutes
      // F for the unsupported Fn key.)
      if (inField) return;

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        if (panelOpen) closePanel();
        else openPanel();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelOpen, openPanel, closePanel]);

  /* ----------------------- Click outside to close ---------------------- */
  useEffect(() => {
    if (!panelOpen) return;
    // During screenshot mode the user drags from outside the Panel — that
    // mousedown should NOT close the Panel. The ScreenshotOverlay owns
    // mouse semantics while it's active.
    if (panelState === "screenshotting") return;

    function onMouseDown(e: MouseEvent) {
      const node = panelRef.current;
      if (!node) return;
      if (!node.contains(e.target as Node)) {
        closePanel();
      }
    }

    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [panelOpen, panelState, closePanel]);

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.div
          // Wrapper is pointer-events-none so the empty margin around the
          // pill doesn't block clicks on the desktop below; the actual Panel
          // re-enables pointer events.
          className="pointer-events-none absolute left-1/2 top-[80px] z-40 -translate-x-1/2"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{
            y: -20,
            opacity: 0,
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
        >
          <div
            ref={panelRef}
            data-invoko-panel
            className="pointer-events-auto overflow-hidden bg-paper"
            style={{
              width: 720,
              borderRadius: 20,
              border: "1px solid #d6cab2",
              boxShadow:
                "0 4px 24px rgba(29, 25, 22, 0.08), 0 1px 3px rgba(29, 25, 22, 0.04)",
            }}
          >
            {/* Module E will mount Quick Actions / conversation here */}
            <PanelInput hasContentAbove={false} />
          </div>
          <VoiceHint />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------- Voice hint (spec §5) ------------------------- */

function VoiceHint() {
  return (
    <div
      className="pointer-events-none mt-3 text-center font-mono"
      style={{
        fontSize: 11,
        color: "#a89c84",
        letterSpacing: "0.06em",
      }}
    >
      Press F+Space for voice
    </div>
  );
}
