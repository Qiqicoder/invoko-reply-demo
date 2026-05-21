/**
 * Small thumbnail of the screenshot-captured target, shown in the Panel
 * input bar to the left of the input field (PRD §D4).
 *
 * Goal is a "tiny chat/email card" look that's recognizable at ~40px wide,
 * with the person's avatar color as the visual signal of who. Fancier
 * DOM-to-image rendering is out of scope per PRD §D4 fallback guidance.
 */

const TARGET_META: Record<
  string,
  { color: string; accent?: string; isEmail?: boolean }
> = {
  // Matches the avatar colors used in data/people.ts (PRD §5.1) and the
  // window mocks.
  "sarah-email": { color: "#5d4775", isEmail: true },
  "nick-message": { color: "#7a3537", accent: "#b3261e" /* attachment */ },
  "bei-dm": { color: "#3d5673" },
};

const DEFAULT_META = { color: "#a89c84" };

export function ScreenshotThumbnail({ target }: { target: string }) {
  const meta = TARGET_META[target] ?? DEFAULT_META;

  return (
    <div
      aria-label={`Screenshot of ${target}`}
      className="flex shrink-0 items-center gap-1 overflow-hidden rounded-md bg-white"
      style={{
        width: 40,
        height: 32,
        padding: 4,
        border: "1px solid #d6cab2",
      }}
    >
      {/* Avatar swatch — person's brand color */}
      <div
        className="h-full rounded-[3px]"
        style={{ width: 8, background: meta.color, flexShrink: 0 }}
      />

      {/* Fake "text content" lines */}
      <div className="flex h-full flex-1 flex-col justify-center gap-[3px]">
        <div className="h-[3px] w-full rounded-full bg-ink-4/35" />
        <div className="h-[3px] w-[80%] rounded-full bg-ink-4/35" />
        <div className="flex items-center gap-1">
          <div className="h-[3px] w-[55%] rounded-full bg-ink-4/35" />
          {meta.accent && (
            <div
              className="h-[5px] w-[5px] shrink-0 rounded-sm"
              style={{ background: meta.accent }}
              aria-hidden
            />
          )}
        </div>
      </div>
    </div>
  );
}
