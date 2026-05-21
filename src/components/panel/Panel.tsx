import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import type { Frame } from "../../stories/types";
import { PanelCalendarConfirm } from "./PanelCalendarConfirm";
import { PanelDraft } from "./PanelDraft";
import { PanelInput } from "./PanelInput";
import { PanelMessage } from "./PanelMessage";
import { PanelOptions } from "./PanelOptions";
import { PanelQuickActions } from "./PanelQuickActions";
import { PanelToast } from "./PanelToast";

/**
 * Reply Panel (PRD §C + Module E conversation engine).
 *
 * Responsibilities:
 *   - Top-center floating container with spring slide-in / fade-out
 *   - Keyboard: F toggles, Esc closes
 *   - Click outside closes (except during screenshot mode — overlay owns it)
 *
 *   --- Module E (single-frame render) ---
 *   - Only the CURRENT frame is rendered in the conversation area; previous
 *     frames fade out as the next one fades in. `frameHistory` in context
 *     still tracks the full sequence for state purposes, but the Panel
 *     visualises just `currentFrame` (PRD §13 — Frame transition: 0.25s,
 *     ease easeOut).
 *   - Auto-advances for the "passive" frame types — all owned here so the
 *     timers are cancelled cleanly when AnimatePresence swaps frames:
 *       • screenshot  → fires when ScreenshotOverlay sets capturedTarget
 *       • thinking    → Panel timer matches PanelMessage stagger length
 *       • toast       → PanelToast fires onDismiss after `duration` ms
 *   - Quick actions / options / draft / calendar wait on user input.
 *   - Toast renders OUTSIDE the Panel container at bottom-center.
 *   - `userMessage` frames (if any reach this engine) are intentionally
 *     hidden — typed feedback is consumed by `submitUserInput` and the
 *     story is expected to follow with a thinking/draft frame.
 */
export function Panel() {
  const {
    panelOpen,
    panelState,
    openPanel,
    closePanel,
    scriptIndex,
    currentFrame,
    capturedTarget,
    advanceToNext,
  } = useApp();
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
    // mousedown should NOT close the Panel.
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

  /* --------- Auto-advance: screenshot frame on capturedTarget set --------- */
  useEffect(() => {
    if (!panelOpen) return;
    if (currentFrame?.type !== "screenshot") return;
    if (!capturedTarget) return;
    // Slight delay so the flash animation in ScreenshotOverlay finishes
    // and the user sees the thumbnail land in the input bar.
    const t = setTimeout(() => advanceToNext(), 250);
    return () => clearTimeout(t);
  }, [panelOpen, currentFrame, capturedTarget, advanceToNext]);

  /* --------- Auto-advance: thinking frame after stagger completes ---------
   * Owned by Panel rather than PanelMessage so that when the user types
   * feedback mid-stagger, the cleanup here cancels the timer cleanly —
   * a timer inside the unmounting PanelMessage could otherwise fire
   * during AnimatePresence's exit phase and cause a double-advance. */
  useEffect(() => {
    if (!panelOpen) return;
    if (currentFrame?.type !== "thinking") return;
    // Matches PanelMessage's stagger: STEP_DELAY=0.4s × lines + TRAILING=0.5s.
    const ms = currentFrame.lines.length * 400 + 500;
    const t = setTimeout(() => advanceToNext(), ms);
    return () => clearTimeout(t);
  }, [panelOpen, currentFrame, advanceToNext]);

  /* --------- Auto-skip: userMessage frame (kept hidden per spec) ---------
   * User-message bubbles are intentionally suppressed; the typed text is
   * consumed by submitUserInput. If a story script does land on a
   * userMessage frame anyway, advance immediately on next tick. */
  useEffect(() => {
    if (!panelOpen) return;
    if (currentFrame?.type !== "userMessage") return;
    const t = setTimeout(() => advanceToNext(), 0);
    return () => clearTimeout(t);
  }, [panelOpen, currentFrame, advanceToNext]);

  /* ----------------- Determine what to render in conversation ---------------- */

  // `screenshot`, `toast`, and `userMessage` never render inline.
  const conversationFrame: Frame | null =
    currentFrame &&
    currentFrame.type !== "screenshot" &&
    currentFrame.type !== "toast" &&
    currentFrame.type !== "userMessage"
      ? currentFrame
      : null;

  const hasContentAbove = conversationFrame !== null;

  /** Toast frame to render (if current is a toast). */
  const activeToast =
    currentFrame?.type === "toast" ? currentFrame : null;

  /* --------------- Action handlers, memoised for child use --------------- */

  const handleAdvance = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  const handleSelect = useCallback(
    // Module E (single-frame mode): selection identity isn't tracked across
    // frames because past frames no longer render. The choice is consumed
    // and we just advance. Module F may route the choice into branching
    // logic via this same hook.
    (_choice: number) => {
      advanceToNext();
    },
    [advanceToNext],
  );

  /* ----------------------------- Render ----------------------------- */

  return (
    <>
      <AnimatePresence>
        {panelOpen && (
          <motion.div
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
            <motion.div
              ref={panelRef}
              data-invoko-panel
              // `layout` smoothly animates the Panel's height when the
              // current frame swaps to one of a different size. Without
              // it, mode="wait" exits would leave the panel briefly empty
              // (height collapses) before the next frame fades in.
              layout
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="pointer-events-auto overflow-hidden bg-paper"
              style={{
                width: 720,
                borderRadius: 20,
                border: "1px solid #d6cab2",
                boxShadow:
                  "0 4px 24px rgba(29, 25, 22, 0.08), 0 1px 3px rgba(29, 25, 22, 0.04)",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {conversationFrame && (
                  <motion.div
                    // Key by scriptIndex so each frame swap triggers a
                    // mount/unmount cycle (driving enter + exit anims).
                    key={scriptIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{
                      maxHeight: "calc(100vh - 200px)",
                      overflowY: "auto",
                    }}
                  >
                    <FrameRouter
                      frame={conversationFrame}
                      onSelect={handleSelect}
                      onAdvance={handleAdvance}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <PanelInput hasContentAbove={hasContentAbove} />
            </motion.div>
            <VoiceHint />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast renders outside the Panel container at bottom-center.
          It manages its own enter/dwell/exit lifecycle and calls onDismiss
          after the exit animation completes — that drives advanceToNext
          (which at end-of-story closes the Panel). */}
      {activeToast && (
        <PanelToast
          key={`toast-${scriptIndex}`}
          frame={activeToast}
          onDismiss={handleAdvance}
        />
      )}
    </>
  );
}

/* --------------------------------------------------------------------------- *
 * FrameRouter — dispatches a single Frame to the right component. Every frame
 * rendered through here is the current one (no inactive/past renders), so
 * `isActive` is always true. We pass it through for API stability with the
 * child components — they still gate their interactive bits on it.
 * --------------------------------------------------------------------------- */

function FrameRouter({
  frame,
  onSelect,
  onAdvance,
}: {
  frame: Frame;
  /** Called when the frame has a "choice" associated (options, quickActions). */
  onSelect: (choice: number) => void;
  /** Called for choice-less advances (thinking auto-complete, Send, etc.). */
  onAdvance: () => void;
}) {
  switch (frame.type) {
    case "screenshot":
    case "toast":
    case "userMessage":
      // Handled outside the inline-render path (or intentionally hidden).
      return null;
    case "quickActions":
      return (
        <PanelQuickActions
          frame={frame}
          isActive
          onSelect={onSelect}
        />
      );
    case "thinking":
      return (
        <PanelMessage
          frame={frame}
          isActive
          // onComplete intentionally omitted — Panel.tsx owns the
          // auto-advance timer (see thinking useEffect there). Letting
          // PanelMessage fire onComplete during AnimatePresence's exit
          // phase would cause a double advance.
        />
      );
    case "options":
      return (
        <PanelOptions
          frame={frame}
          isActive
          onSelect={onSelect}
        />
      );
    case "input":
      // Free-text input frame: stub for Module E (Module F wires the edit flow).
      return (
        <div
          style={{
            padding: "16px 22px",
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 13,
            color: "#786d5b",
            lineHeight: 1.55,
          }}
        >
          {frame.prompt}
        </div>
      );
    case "draft":
      return <PanelDraft frame={frame} isActive onSend={onAdvance} />;
    case "calendarConfirm":
      return (
        <PanelCalendarConfirm
          frame={frame}
          isActive
          onConfirm={onAdvance}
          onAdjust={onAdvance}
        />
      );
  }
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
