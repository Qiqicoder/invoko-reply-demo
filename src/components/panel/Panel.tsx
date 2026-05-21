import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useApp } from "../../context/AppContext";
import type { Attachment, Frame } from "../../stories/types";
import { PanelCalendarConfirm } from "./PanelCalendarConfirm";
import { PanelContinuingBanner } from "./PanelContinuingBanner";
import { PanelDraft } from "./PanelDraft";
import { PanelInput } from "./PanelInput";
import { PanelMessage, thinkingFrameDurationMs } from "./PanelMessage";
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
 *   - DRAFT PHASE special-case: when current is `draft` OR `draftUpdate`,
 *     the AnimatePresence key stays `'draft-card'` across the swap so the
 *     SAME PanelDraft React element stays mounted. PanelDraft animates the
 *     body in place (+ shows a transient thinkingLine above the body for
 *     800ms during a draftUpdate). Conceptually there is only ONE reply
 *     draft per story; revisions update it in-place.
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
    frameHistory,
    capturedTarget,
    advanceToNext,
    continuingBannerDismissed,
    dismissContinuingBanner,
    clarifyingAnswer,
    replyPageOpen,
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

      if (e.key === "Escape" && replyPageOpen) {
        return;
      }
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
  }, [panelOpen, replyPageOpen, openPanel, closePanel]);

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
    // Matches PanelMessage: each line gets STEP_MS of "thinking" time,
    // then TRAILING_PAUSE_MS after the last line (4 lines → ~10.5s).
    const ms = thinkingFrameDurationMs(currentFrame.lines.length);
    const t = setTimeout(() => advanceToNext(), ms);
    return () => clearTimeout(t);
  }, [panelOpen, currentFrame, advanceToNext]);

  /* ---- Auto-skip: continuingContext → next frame (banner stays in history) */
  useEffect(() => {
    if (!panelOpen) return;
    if (currentFrame?.type !== "continuingContext") return;
    const t = setTimeout(() => advanceToNext(), 0);
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

  /** Draft phase = current is `draft` OR `draftUpdate` (in-place revision). */
  const isDraftPhase =
    currentFrame?.type === "draft" || currentFrame?.type === "draftUpdate";

  /**
   * Merged draft state — walks back from the current frame to find the
   * most recent `draft` and folds in any subsequent `draftUpdate` frames.
   * The `thinkingLine` is taken from the LATEST draftUpdate only (so it
   * shows during exactly one swap, then disappears for good).
   */
  const draftState = useMemo(
    () =>
      isDraftPhase
        ? computeDraftState(frameHistory, clarifyingAnswer)
        : null,
    [isDraftPhase, frameHistory, clarifyingAnswer],
  );

  const continuingLabel = useMemo(
    () =>
      continuingBannerDismissed
        ? null
        : getContinuingLabelFromHistory(frameHistory),
    [frameHistory, continuingBannerDismissed],
  );

  /**
   * Other inline frames (not screenshot/toast/userMessage/draft phase).
   * The draft phase has its own special render path that keeps PanelDraft
   * mounted across draft → draftUpdate transitions.
   */
  const inlineFrame: Frame | null =
    currentFrame &&
    !isDraftPhase &&
    currentFrame.type !== "screenshot" &&
    currentFrame.type !== "toast" &&
    currentFrame.type !== "userMessage" &&
    currentFrame.type !== "continuingContext"
      ? currentFrame
      : null;

  const hasContentAbove = isDraftPhase || inlineFrame !== null;

  /**
   * AnimatePresence key: draft + draftUpdate share `draft-card` so the
   * PanelDraft React element stays mounted across the transition (the
   * card animates its body in-place rather than unmount/remount). Other
   * frames use the scriptIndex.
   */
  const conversationKey = isDraftPhase
    ? "draft-card"
    : `frame-${scriptIndex}`;

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
              {continuingLabel && (
                <PanelContinuingBanner
                  label={continuingLabel}
                  onDismiss={dismissContinuingBanner}
                />
              )}
              <AnimatePresence mode="wait" initial={false}>
                {hasContentAbove && (
                  <motion.div
                    // Key strategy: `draft-card` for draft + draftUpdate
                    // (same React element across in-place revision); per-
                    // scriptIndex for other frames so each swap triggers
                    // a mount/unmount cycle (enter + exit anims).
                    key={conversationKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{
                      maxHeight: "calc(100vh - 200px)",
                      overflowY: "auto",
                    }}
                  >
                    {isDraftPhase && draftState ? (
                      <PanelDraft
                        body={draftState.body}
                        attachment={draftState.attachment}
                        thinkingLines={draftState.thinkingLines}
                        isActive
                        onSend={handleAdvance}
                      />
                    ) : inlineFrame ? (
                      <FrameRouter
                        frame={inlineFrame}
                        onSelect={handleSelect}
                        onAdvance={handleAdvance}
                      />
                    ) : null}
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
    case "continuingContext":
    case "draft":
    case "draftUpdate":
      // Handled outside the inline-render path:
      //   - screenshot   → Module D overlay
      //   - toast        → bottom-center sibling
      //   - userMessage  → intentionally hidden (auto-skip)
      //   - draft / draftUpdate → special path in Panel that keeps the
      //     same PanelDraft mounted for in-place revision
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

/* --------------------------------------------------------------------------- *
 * computeDraftState — merge the latest `draft` frame in history with any
 * subsequent `draftUpdate` frames into a single rendered state.
 *
 * Walks back from history's tail looking for the most recent `draft`, with
 * only `draftUpdate` frames allowed between it and the tail. The merged
 * body/attachment reflects every update applied in order; `thinkingLines`
 * come from the LATEST draftUpdate iff it's the current frame — so the
 * transient reasoning lines show during exactly one swap and disappear
 * for good after PanelDraft's fade-out (Module F fix 2).
 * --------------------------------------------------------------------------- */
function getContinuingLabelFromHistory(history: Frame[]): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const f = history[i];
    if (f.type === "continuingContext") return f.label;
  }
  return null;
}

function applyClarifyingAnswer(body: string, answer: string | null): string {
  if (!answer) return body;
  return body.replace(/\[mem:\s*([^\]]+)\]/g, `[mem: ${answer}]`);
}

function computeDraftState(
  history: Frame[],
  clarifyingAnswer: string | null,
): {
  body: string;
  attachment?: Attachment;
  thinkingLines?: string[];
} | null {
  let draftIdx = -1;
  for (let i = history.length - 1; i >= 0; i--) {
    const f = history[i];
    if (f.type === "draft") {
      draftIdx = i;
      break;
    }
    if (f.type !== "draftUpdate") {
      // Any other frame in the way means we're no longer in a draft phase.
      return null;
    }
  }
  if (draftIdx === -1) return null;

  const initial = history[draftIdx];
  if (initial.type !== "draft") return null;

  let body = initial.body;
  let attachment: Attachment | undefined = initial.attachment;
  let thinkingLines: string[] | undefined;

  for (let i = draftIdx + 1; i < history.length; i++) {
    const f = history[i];
    if (f.type !== "draftUpdate") return null;
    body = f.newBody;
    if (f.newAttachment) attachment = f.newAttachment;
    // Only the last update's thinking lines matter, and only if it's the tail.
    thinkingLines =
      i === history.length - 1 ? f.thinkingLines : undefined;
  }

  return {
    body: applyClarifyingAnswer(body, clarifyingAnswer),
    attachment,
    thinkingLines,
  };
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
