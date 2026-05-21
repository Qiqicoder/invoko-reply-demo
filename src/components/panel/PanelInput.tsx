import { ArrowUp, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { InvokoLogo } from "./InvokoLogo";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

/**
 * Bottom input bar inside the Panel (PRD §C2 + visual spec §4 +
 * Module E fix 2).
 *
 * Layout (left → right):
 *   [InvokoLogo]  [thumbnail (optional)]  [text input fills space]
 *   [New Chat ⌄]  [Send ↑]
 *
 * Behavior (fix 2 + 4):
 *   - Input field is ALWAYS editable, regardless of which conversation
 *     frame is active. Pointer events / focus are uninhibited.
 *   - Pressing Enter (no shift) submits the typed text.
 *   - Clicking the Send button also submits.
 *   - Submitting calls `submitUserInput(text)` which either substitutes
 *     into a scripted `userMessage` slot or live-inserts a user bubble
 *     (engine details live in AppContext).
 *   - Empty / whitespace-only submissions are ignored.
 *   - After submit, the field clears.
 *
 * Props:
 *   hasContentAbove – when the Panel has content above the input bar a 1px
 *     top divider is drawn per spec §4.
 */
export function PanelInput({
  hasContentAbove = false,
}: {
  hasContentAbove?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { capturedTarget, submitUserInput, frameHistory } = useApp();
  const [value, setValue] = useState("");

  /**
   * "New Chat" until the user has actually interacted with the AI — which
   * we infer from frameHistory progressing past its initial entry. Resets
   * automatically when the Panel closes (closePanel clears frameHistory).
   */
  const chatLabel = frameHistory.length > 1 ? "Current Chat" : "New Chat";

  // Re-clear on unmount safety + clear if the parent toggles `hasContentAbove`
  // back to false (which happens on full reset → next loadStory). Keeps the
  // field truly fresh between demo runs.
  useEffect(() => {
    return () => setValue("");
  }, []);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue("");
    submitUserInput(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }

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
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent font-sans outline-none placeholder:text-ink-4"
        style={{ fontSize: 14, color: "#1d1916" }}
      />

      {/* TODO: align with designer — dropdown content is out-of-scope for Module C/E.
          Label flips to "Current Chat" once the user has interacted (PRD §x1).
          We don't animate the swap — the dropdown is intentionally quiet. */}
      <button
        type="button"
        className="flex items-center gap-1 rounded-md font-sans transition-colors hover:bg-cream-2 hover:text-ink"
        style={{
          padding: "6px 10px",
          fontSize: 13,
          color: "#786d5b",
        }}
      >
        {chatLabel}
        <ChevronDown size={14} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        aria-label="Send"
        onClick={handleSubmit}
        disabled={value.trim().length === 0}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent transition-colors hover:bg-accent-deep disabled:cursor-default disabled:opacity-50 disabled:hover:bg-accent"
      >
        <ArrowUp size={16} className="text-white" strokeWidth={2.4} />
      </button>
    </div>
  );
}
