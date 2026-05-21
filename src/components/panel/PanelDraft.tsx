import { Fragment, type ReactNode } from "react";
import type { Attachment, FrameOf } from "../../stories/types";
import { MemoryHighlight } from "../shared/MemoryHighlight";

/**
 * PanelDraft — renders a `draft` frame (PRD §E + visual spec §10 +
 * Module E fix 3).
 *
 * Visual:
 *   - Card: bg #f5efe4 (cream), 1px #e2d8c2 border, 14px radius, padding 18/20
 *   - Body: Inter Tight 14px #1d1916, line-height 1.6, ¶ spacing 8px
 *   - Memory fields (wrapped via `[mem: text]` syntax) get the gradient
 *     fill + dotted underline via <MemoryHighlight>
 *   - Optional attachment chip below body
 *   - Single Send pill button (right-aligned). The Edit button was
 *     intentionally removed — the user edits by typing feedback in the
 *     input bar, which the engine treats as a userMessage + regen path.
 */
export function PanelDraft({
  frame,
  isActive,
  onSend,
}: {
  frame: FrameOf<"draft">;
  isActive: boolean;
  onSend: () => void;
}) {
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
        {/* Body */}
        <div
          style={{
            fontFamily:
              '"Inter Tight", ui-sans-serif, system-ui, sans-serif',
            fontSize: 14,
            color: "#1d1916",
            lineHeight: 1.6,
          }}
        >
          {renderDraftBody(frame.body)}
        </div>

        {/* Attachment */}
        {frame.attachment && (
          <div style={{ marginTop: 14 }}>
            <AttachmentChip att={frame.attachment} />
          </div>
        )}

        {/* Actions — only Send remains (fix 3). The user edits by typing
            feedback into the Panel input bar instead. */}
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
      out.push(<Fragment key={`t${key++}`}>{text.slice(lastIdx, m.index)}</Fragment>);
    }
    out.push(
      <MemoryHighlight key={`m${key++}`}>{m[1].trim()}</MemoryHighlight>,
    );
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) {
    out.push(<Fragment key={`t${key++}`}>{text.slice(lastIdx)}</Fragment>);
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
