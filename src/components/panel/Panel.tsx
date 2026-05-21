import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import type { Frame } from "../../stories/types";
import { PanelCalendarConfirm } from "./PanelCalendarConfirm";
import { PanelDraft } from "./PanelDraft";
import { PanelInput } from "./PanelInput";
import { PanelMessage } from "./PanelMessage";
import { PanelOptions } from "./PanelOptions";
import { PanelQuickActions } from "./PanelQuickActions";
import { PanelToast } from "./PanelToast";
import { PanelUserMessage } from "./PanelUserMessage";

/**
 * Reply Panel (PRD §C + Module E conversation engine).
 *
 * Responsibilities:
 *   - Top-center floating container with spring slide-in / fade-out
 *   - Keyboard: F toggles, Esc closes
 *   - Click outside closes (except during screenshot mode — overlay owns it)
 *
 *   --- Module E ---
 *   - Renders `frameHistory` above the input bar as a stacked conversation
 *   - Dispatches by frame.type to the right child component
 *   - Auto-advances for the four "passive" frame types:
 *       • screenshot   → fires when ScreenshotOverlay sets capturedTarget
 *       • thinking     → PanelMessage fires onComplete after stagger finishes
 *       • userMessage  → 600ms after the bubble appears (Module E fix 2/4)
 *       • toast        → PanelToast fires onDismiss after `duration` ms
 *   - Quick actions / options / draft / calendar wait on user input.
 */
export function Panel() {
  const {
    panelOpen,
    panelState,
    openPanel,
    closePanel,
    frameHistory,
    currentFrame,
    capturedTarget,
    advanceToNext,
  } = useApp();
  const panelRef = useRef<HTMLDivElement | null>(null);

  /** Per-frame selection cache (e.g. which option was clicked) so settled
   * frames can stay visually selected even after we've advanced. */
  const [selections, setSelections] = useState<Record<number, number>>({});

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

  /* ----------- Reset per-frame selection cache when Panel closes ---------- */
  useEffect(() => {
    if (!panelOpen) setSelections({});
  }, [panelOpen]);

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

  /* --------- Auto-advance: userMessage frame after a beat ---------
   * Whether scripted or live-inserted via the input bar, a userMessage
   * bubble shows for ~600ms before we move to the next scripted frame —
   * gives the user a moment to register their message before the AI
   * "responds". */
  useEffect(() => {
    if (!panelOpen) return;
    if (currentFrame?.type !== "userMessage") return;
    const t = setTimeout(() => advanceToNext(), 600);
    return () => clearTimeout(t);
  }, [panelOpen, currentFrame, advanceToNext]);

  /* ----------------- Compute inline-renderable frames ---------------- */

  /**
   * Frames that show up in the conversation area. `screenshot` is handled
   * by Module D's overlay (no inline UI), and `toast` is rendered as a
   * fixed-position overlay outside the Panel container.
   */
  const inlineFrames = useMemo(() => {
    return frameHistory
      .map((frame, i) => ({ frame, originalIndex: i }))
      .filter(
        ({ frame }) => frame.type !== "screenshot" && frame.type !== "toast",
      );
  }, [frameHistory]);

  const hasContentAbove = inlineFrames.length > 0;
  const activeFrameIndex = frameHistory.length - 1;

  /** Toast frame to render (if current is a toast). */
  const activeToast =
    currentFrame?.type === "toast" ? currentFrame : null;

  /* --------------- Action handlers, memoised for child use --------------- */

  const handleSelect = useCallback(
    (frameIndex: number, choice: number) => {
      setSelections((prev) => ({ ...prev, [frameIndex]: choice }));
      advanceToNext();
    },
    [advanceToNext],
  );

  const handleAdvance = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

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
              {hasContentAbove && (
                <div
                  // Scrollable conversation area — caps near viewport height
                  style={{
                    maxHeight: "calc(100vh - 200px)",
                    overflowY: "auto",
                  }}
                >
                  {inlineFrames.map(({ frame, originalIndex }) => (
                    <FrameRouter
                      key={originalIndex}
                      frame={frame}
                      isActive={originalIndex === activeFrameIndex}
                      selection={selections[originalIndex]}
                      onSelect={(c) => handleSelect(originalIndex, c)}
                      onAdvance={handleAdvance}
                    />
                  ))}
                </div>
              )}
              <PanelInput hasContentAbove={hasContentAbove} />
            </div>
            <VoiceHint />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast is rendered outside the Panel container so it can sit at the
          bottom-center while the rest of the conversation stays at the top.
          PanelToast manages its own slide-up/slide-down animation; onDismiss
          fires after the slide-down exit completes — that drives advanceToNext
          which (at end-of-story) closes the Panel. */}
      {activeToast && (
        <PanelToast
          // Key on history length so re-using the same toast frame (rare —
          // would only happen if a story re-emits a toast) gives us a fresh
          // animation cycle rather than reusing the old one.
          key={frameHistory.length}
          frame={activeToast}
          onDismiss={handleAdvance}
        />
      )}
    </>
  );
}

/* --------------------------------------------------------------------------- *
 * FrameRouter — dispatches a single Frame to the right component.
 * Lives in the same file because every frame type calls back into actions
 * defined on Panel; co-locating avoids a 7-prop dance through a separate file.
 * --------------------------------------------------------------------------- */

function FrameRouter({
  frame,
  isActive,
  selection,
  onSelect,
  onAdvance,
}: {
  frame: Frame;
  isActive: boolean;
  selection: number | undefined;
  /** Called when the frame has a "choice" associated (options, quickActions). */
  onSelect: (choice: number) => void;
  /** Called for choice-less advances (thinking auto-complete, Send, etc.). */
  onAdvance: () => void;
}) {
  switch (frame.type) {
    case "screenshot":
    case "toast":
      // Handled outside the inline-render path. Shouldn't get here, but
      // return null defensively.
      return null;
    case "quickActions":
      return (
        <PanelQuickActions
          frame={frame}
          isActive={isActive}
          selection={selection}
          onSelect={onSelect}
        />
      );
    case "thinking":
      return (
        <PanelMessage
          frame={frame}
          isActive={isActive}
          onComplete={isActive ? onAdvance : undefined}
        />
      );
    case "options":
      return (
        <PanelOptions
          frame={frame}
          isActive={isActive}
          selection={selection}
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
    case "userMessage":
      return <PanelUserMessage frame={frame} />;
    case "draft":
      return (
        <PanelDraft frame={frame} isActive={isActive} onSend={onAdvance} />
      );
    case "calendarConfirm":
      return (
        <PanelCalendarConfirm
          frame={frame}
          isActive={isActive}
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
