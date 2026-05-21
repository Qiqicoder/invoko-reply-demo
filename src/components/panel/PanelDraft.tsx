import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { Attachment } from "../../stories/types";
import { THINKING_STEP_MS } from "./PanelMessage";
import { MemoryHighlight } from "../shared/MemoryHighlight";

/**
 * PanelDraft (PRD §E + visual spec §10 + Module E in-place update + Module F
 * fix 2: warmer multi-line reasoning).
 *
 * Renders the reply draft card and animates revisions in-place. When the
 * Panel advances draft → draftUpdate, this same card stays mounted and:
 *
 *   1. `thinkingLines` (if any) stagger in above the body at 1500ms intervals
 *      (matches the thinking frame's pacing — feels like the same AI thinking)
 *   2. 800ms pause after the LAST line finishes entering
 *   3. Body cross-fades to the new content (~220ms)
 *   4. Lines linger ~600ms post-swap, then fade out together — leaving the
 *      updated draft alone on screen
 *
 * Visual (unchanged):
 *   - Card: bg #f5efe4, 1px #e2d8c2, 14px radius, padding 18/20
 *   - Body: Inter Tight 14px #1d1916, line-height 1.6
 *   - Memory fields ([mem: text]) rendered via <MemoryHighlight>
 *   - Optional attachment chip below body
 *   - Single Send pill (right-aligned)
 *
 * Props are intentionally flat (not `frame: Frame`) because draft state is
 * a *merge* of one `draft` frame plus any subsequent `draftUpdate` frames;
 * the merging happens in Panel.tsx and we receive the merged result here.
 */

/** Stagger between draft-update thinking lines (matches PanelMessage). */
const DRAFT_THINKING_STEP_MS = THINKING_STEP_MS;
/** Each thinking line's enter duration. */
const DRAFT_THINKING_ENTER_MS = 600;
/** Pause after the LAST thinking line finishes entering, before body swaps. */
const DRAFT_THINKING_PAUSE_MS = 800;
/** How long thinking lines linger AFTER the body has swapped, before fading. */
const DRAFT_THINKING_LINGER_MS = 600;

export function PanelDraft({
  body,
  attachment,
  thinkingLines,
  isActive,
  onSend,
}: {
  /** Target body text (already merged with any pending updates). */
  body: string;
  attachment?: Attachment;
  /**
   * When non-empty, shown one-by-one above the body during a draft update,
   * then dismissed after the body has swapped. Stagger = 1500ms.
   */
  thinkingLines?: string[];
  isActive: boolean;
  onSend: () => void;
}) {
  /* ---------------- In-place update sequencing ----------------
   *
   * `displayedBody` lags `body` while a draft update is in flight. The
   * timeline is owned here (a single useEffect re-runs whenever upstream
   * `body` or `thinkingLines` change). React 19's `set-state-in-effect`
   * rule is satisfied by deferring each setState into a setTimeout.
   */
  const [displayedBody, setDisplayedBody] = useState(body);
  const [showThinking, setShowThinking] = useState(false);
  const [goldFlash, setGoldFlash] = useState(false);

  /** Body text when the card first mounted — v1 baseline for upgrade detection. */
  const initialBodyRef = useRef(body);
  const isUpgraded = displayedBody !== initialBodyRef.current;

  const lines = thinkingLines ?? [];
  const hasLines = lines.length > 0;

  useEffect(() => {
    if (hasLines) {
      const tShow = setTimeout(() => setShowThinking(true), 0);
      // Last line starts entering at (N-1) * STEP, finishes ENTER_MS later.
      // Body swaps PAUSE_MS after that. Lines linger LINGER_MS longer.
      const swapAt =
        (lines.length - 1) * DRAFT_THINKING_STEP_MS +
        DRAFT_THINKING_ENTER_MS +
        DRAFT_THINKING_PAUSE_MS;
      let tGoldEnd: ReturnType<typeof setTimeout> | undefined;
      const tSwap = setTimeout(() => {
        setGoldFlash(true);
        setDisplayedBody(body);
        tGoldEnd = setTimeout(() => setGoldFlash(false), 500);
      }, swapAt);
      const tHide = setTimeout(
        () => setShowThinking(false),
        swapAt + DRAFT_THINKING_LINGER_MS,
      );
      return () => {
        clearTimeout(tShow);
        clearTimeout(tSwap);
        clearTimeout(tHide);
        if (tGoldEnd) clearTimeout(tGoldEnd);
      };
    }
    // No thinking lines: snap into sync. Initial mount of v1 takes this
    // path (lines is empty), and so does any future bodyswap without
    // narration.
    const tSync = setTimeout(() => {
      setShowThinking(false);
      setDisplayedBody(body);
    }, 0);
    return () => clearTimeout(tSync);
    // `lines.length` not `lines` itself — story-defined arrays are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, hasLines, lines.length]);

  return (
    <div style={{ padding: "16px 22px" }}>
      <div
        style={{
          position: "relative",
          background: "#f5efe4",
          border: "1px solid #e2d8c2",
          borderRadius: 14,
          padding: "18px 20px",
        }}
      >
        {/* V2 label — only after draftUpdate body swap (Module F fix 5b).
            Top-right so it never overlaps the body opener ("Hey Sarah…"). */}
        <AnimatePresence>
          {isUpgraded && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: 16,
                right: 20,
                fontFamily:
                  '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.1em",
                color: "#9c4a2a",
                background: "rgba(156, 74, 42, 0.08)",
                padding: "3px 8px",
                borderRadius: 4,
                zIndex: 2,
              }}
            >
              V2
            </motion.span>
          )}
        </AnimatePresence>

        {/* Transient thinking lines above the body during a draft update.
            The whole block fades out as one when `showThinking` flips back
            to false; individual lines stagger in on enter. */}
        <AnimatePresence>
          {showThinking && hasLines && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: DRAFT_THINKING_ENTER_MS / 1000,
                    ease: "easeOut",
                    delay: (i * DRAFT_THINKING_STEP_MS) / 1000,
                  }}
                  style={{
                    display: "flex",
                    gap: 8,
                    fontFamily:
                      '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
                    fontSize: 12.5,
                    fontStyle: "italic",
                    color: "#786d5b",
                    lineHeight: 1.55,
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
                      fontStyle: "normal",
                    }}
                  >
                    ·
                  </span>
                  <span>{line}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body — cross-fades when displayedBody swaps; gold wash on upgrade. */}
        <div style={{ position: "relative" }}>
          <AnimatePresence>
            {goldFlash && (
              <motion.div
                key="gold-flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                  times: [0, 0.4, 0.6, 1],
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, rgba(212, 163, 115, 0.25) 0%, rgba(201, 117, 80, 0.18) 50%, rgba(156, 74, 42, 0.12) 100%)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={displayedBody}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{
                position: "relative",
                zIndex: 0,
                fontFamily:
                  '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
                fontSize: 14,
                color: "#1d1916",
                lineHeight: 1.6,
              }}
            >
              {renderDraftBody(displayedBody)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Attachment */}
        {attachment && (
          <div style={{ marginTop: 14 }}>
            <AttachmentChip att={attachment} />
          </div>
        )}

        {/* Actions — only Send. The card persists across draft updates;
            the Send button stays mounted throughout. */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 18,
          }}
        >
          <button
            type="button"
            disabled={!isActive}
            onClick={onSend}
            style={{
              padding: "7px 18px",
              borderRadius: 999,
              border: "none",
              background: "#9c4a2a",
              color: "#ffffff",
              fontFamily:
                '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              cursor: isActive ? "pointer" : "default",
              opacity: isActive ? 1 : 0.6,
              transition: "background 120ms ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) return;
              e.currentTarget.style.background = "#6e2f18";
            }}
            onMouseLeave={(e) => {
              if (!isActive) return;
              e.currentTarget.style.background = "#9c4a2a";
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Helpers ---------------------- */

/**
 * Parse a draft body string:
 *   - Paragraph breaks on `\n\n`
 *   - Inline `[mem: text]` wrapped in <MemoryHighlight>
 */
function renderDraftBody(body: string): ReactNode {
  const paragraphs = body.split(/\n\n+/);
  return paragraphs.map((para, pIdx) => (
    <p
      key={pIdx}
      style={{
        margin: 0,
        marginTop: pIdx === 0 ? 0 : 8,
      }}
    >
      {parseMemoryInline(para)}
    </p>
  ));
}

function parseMemoryInline(text: string): ReactNode {
  const out: ReactNode[] = [];
  const regex = /\[mem:\s*([^\]]+)\]/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      out.push(
        <Fragment key={`t${key++}`}>{text.slice(lastIdx, m.index)}</Fragment>,
      );
    }
    out.push(
      <MemoryHighlight key={`m${key++}`}>{m[1].trim()}</MemoryHighlight>,
    );
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) {
    out.push(<Fragment key={`t${key}`}>{text.slice(lastIdx)}</Fragment>);
  }
  return out;
}

/* ---------------------- Attachment chip ---------------------- */

function AttachmentChip({ att }: { att: Attachment }) {
  const typeLabel =
    att.type === "pdf"
      ? "PDF"
      : att.type === "docx"
        ? "DOC"
        : att.type === "gdoc"
          ? "GDOC"
          : att.type === "pptx"
            ? "PPT"
            : "XLS";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "#faf7ef",
        border: "1px solid #d6cab2",
        borderRadius: 999,
        padding: "6px 12px 6px 8px",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#9c4a2a",
          color: "#ffffff",
          fontFamily:
            '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.05em",
          minWidth: 26,
          height: 18,
          padding: "0 4px",
          borderRadius: 4,
        }}
      >
        {typeLabel}
      </span>
      <span
        style={{
          fontFamily:
            '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
          fontSize: 12,
          color: "#4d4438",
        }}
      >
        {att.name}
      </span>
    </span>
  );
}
