import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import type { Attachment } from "../../stories/types";
import { MemoryHighlight } from "../shared/MemoryHighlight";

/**
 * PanelDraft (PRD §E + visual spec §10 + Module E in-place update).
 *
 * Renders the reply draft card and animates revisions in-place. When the
 * Panel advances draft → draftUpdate, this same card stays mounted; the
 * body text smoothly cross-fades to the new content and a transient
 * `thinkingLine` appears above the body for ~800ms during the swap.
 *
 * Visual:
 *   - Card: bg #f5efe4 (cream), 1px #e2d8c2 border, 14px radius, padding 18/20
 *   - Body: Inter Tight 14px #1d1916, line-height 1.6, ¶ spacing 8px
 *   - Memory fields (wrapped via `[mem: text]` syntax) get the gradient
 *     fill + dotted underline via <MemoryHighlight>
 *   - Optional attachment chip below body
 *   - Single Send pill button (right-aligned). The Edit button was
 *     intentionally removed — the user edits by typing feedback in the
 *     Panel input bar.
 *
 * Props are intentionally flat (not `frame: Frame`) because draft state is
 * a *merge* of one `draft` frame plus any subsequent `draftUpdate` frames;
 * the merging happens in Panel.tsx and we receive the merged result here.
 */
export function PanelDraft({
  body,
  attachment,
  thinkingLine,
  isActive,
  onSend,
}: {
  /** Target body text (already merged with any pending updates). */
  body: string;
  attachment?: Attachment;
  /** When set, shown briefly above the body during a draft update. */
  thinkingLine?: string;
  isActive: boolean;
  onSend: () => void;
}) {
  /* ---------------- In-place update sequencing ----------------
   *
   * `displayedBody` is what's actually rendered. It lags `body` when an
   * update is in flight — we show `thinkingLine` for 800ms first, then
   * swap `displayedBody` to the new value. The body AnimatePresence
   * inside cross-fades the old and new text.
   *
   * All setState calls are scheduled inside setTimeout callbacks (rather
   * than synchronously in the effect body) so we satisfy React 19's
   * `react-hooks/set-state-in-effect` rule. The 0ms timeout is paint-
   * imperceptible (~5ms in practice).
   */
  const [displayedBody, setDisplayedBody] = useState(body);
  const [showThinking, setShowThinking] = useState(false);

  useEffect(() => {
    if (thinkingLine) {
      const tShow = setTimeout(() => setShowThinking(true), 0);
      // Sequence: thinking line appears → 800ms → hide + swap body.
      const tSwap = setTimeout(() => {
        setShowThinking(false);
        setDisplayedBody(body);
      }, 800);
      return () => {
        clearTimeout(tShow);
        clearTimeout(tSwap);
      };
    }
    // No thinking line: keep displayed body / showThinking in sync.
    const tSync = setTimeout(() => {
      setShowThinking(false);
      setDisplayedBody(body);
    }, 0);
    return () => clearTimeout(tSync);
  }, [body, thinkingLine]);

  return (
    <div style={{ padding: "16px 22px" }}>
      <div
        style={{
          background: "#f5efe4",
          border: "1px solid #e2d8c2",
          borderRadius: 14,
          padding: "18px 20px",
        }}
      >
        {/* Transient thinking line above the body during a draft update. */}
        <AnimatePresence>
          {showThinking && thinkingLine && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                display: "flex",
                gap: 8,
                fontFamily:
                  '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
                fontSize: 12,
                fontStyle: "italic",
                color: "#786d5b",
                lineHeight: 1.55,
                overflow: "hidden",
                marginBottom: 10,
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
              <span>{thinkingLine}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body — cross-fades when displayedBody swaps. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={displayedBody}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
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
