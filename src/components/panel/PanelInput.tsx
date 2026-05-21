import { ArrowUp, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { useApp } from "../../context/AppContext";
import { InvokoLogo } from "./InvokoLogo";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

/**
 * Bottom input bar inside the Panel (PRD §C2 + visual spec §4).
 *
 * Layout (left → right):
 *   [InvokoLogo]  [text input fills space]  [New Chat ⌄]  [Send ↑]
 *
 * Module C is the shell only — typing and Send don't do anything yet.
 * Module D/E/F will wire submission to the story-frame engine.
 *
 * Props:
 *   hasContentAbove – when the Panel has content above the input bar (Quick
 *     Actions, conversation, etc.), a 1px top divider is drawn per spec §4.
 *     In Module C idle state we pass false (no divider).
 */
export function PanelInput({
  hasContentAbove = false,
}: {
  hasContentAbove?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { capturedTarget } = useApp();

  return (
    <div
      className="flex items-center gap-3"
      style={{
        height: 60,
        padding: "12px 18px",
        background: "#faf7ef",
        borderTop: hasContentAbove ? "1px solid #e2d8c2" : "none",
      }}
    >
      <InvokoLogo size={24} />

      {capturedTarget && <ScreenshotThumbnail target={capturedTarget} />}

      <input
        ref={inputRef}
        type="text"
        placeholder="What can I help you with today?"
        className="flex-1 bg-transparent font-sans outline-none placeholder:text-ink-4"
        style={{ fontSize: 14, color: "#1d1916" }}
      />

      {/* TODO: align with designer — dropdown content is out-of-scope for Module C. */}
      <button
        type="button"
        className="flex items-center gap-1 rounded-md font-sans transition-colors hover:bg-cream-2 hover:text-ink"
        style={{
          padding: "6px 10px",
          fontSize: 13,
          color: "#786d5b",
        }}
      >
        New Chat
        <ChevronDown size={14} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        aria-label="Send"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent transition-colors hover:bg-accent-deep"
      >
        <ArrowUp size={16} className="text-white" strokeWidth={2.4} />
      </button>
    </div>
  );
}
