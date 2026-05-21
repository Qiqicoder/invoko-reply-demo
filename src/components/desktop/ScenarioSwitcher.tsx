import { Inbox, Mail, MessageCircle } from "lucide-react";
import { useApp, type StoryId } from "../../context/AppContext";
import { STORY_1 } from "../../stories/story1";
import type { Frame } from "../../stories/types";

/**
 * Floating scenario switcher (PRD §B4 + §F2 + §F7) — bottom-right corner.
 *
 * Module F wiring:
 *   - Clicking Story 1 → `startStoryWithFrames(1, STORY_1)` which sets
 *     currentStory, loads the frames, opens the Panel, and drops the user
 *     into screenshot mode in a single batched update.
 *   - Story 2 / 3 still call the legacy `startStory(id)` (no frames yet);
 *     Module G will swap those over.
 *   - After Story 1 completes, `suggestedNextStory` flips to 2; we render
 *     a small "NEXT" badge on the suggested button so the founder always
 *     knows what to click next.
 */

interface Scenario {
  id: StoryId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  /** Frames for this story; null while the story is still a stub. */
  frames: Frame[] | null;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Story 1",
    subtitle: "Investor reply",
    icon: <Mail className="h-4 w-4" strokeWidth={1.8} />,
    frames: STORY_1,
  },
  {
    id: 2,
    title: "Story 2",
    subtitle: "Boss assigns task",
    icon: <Inbox className="h-4 w-4" strokeWidth={1.8} />,
    // TODO (Module G): swap in STORY_2.
    frames: null,
  },
  {
    id: 3,
    title: "Story 3",
    subtitle: "Reach out to teammate",
    icon: <MessageCircle className="h-4 w-4" strokeWidth={1.8} />,
    // TODO (Module G): swap in STORY_3.
    frames: null,
  },
];

export function ScenarioSwitcher() {
  const { currentStory, startStory, startStoryWithFrames, suggestedNextStory } =
    useApp();

  function pick(scenario: Scenario) {
    if (scenario.frames) {
      // PRD §F3: Story 1 (and later 2/3) auto-opens the Panel directly
      // into screenshot mode. No intermediate idle Panel.
      startStoryWithFrames(scenario.id, scenario.frames);
    } else {
      // Legacy path for stories not yet implemented — just sets the
      // backdrop window so the founder can preview Module B's layout.
      startStory(scenario.id);
    }
  }

  return (
    <div
      // `data-invoko-no-drag` lets ScreenshotOverlay ignore mousedowns that
      // happen here, so users can still switch stories mid-screenshot.
      data-invoko-no-drag
      className="absolute bottom-6 right-6 z-50 flex flex-col gap-2 rounded-2xl bg-paper/85 p-3 shadow-[0_18px_40px_-18px_rgba(29,25,22,0.35)] backdrop-blur"
      style={{ border: "1px solid rgba(29,25,22,0.08)", width: 240 }}
    >
      <div className="px-1 pb-1 font-mono text-[10px] uppercase tracking-wider text-ink-3">
        Demo scenarios
      </div>
      {SCENARIOS.map((s) => {
        const active = currentStory === s.id;
        const isNext = !active && suggestedNextStory === s.id;
        const stub = s.frames === null;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => pick(s)}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
              active
                ? "bg-accent text-white shadow-sm"
                : "bg-white text-ink-2 hover:bg-cream"
            }`}
            style={{
              border: active
                ? "1px solid var(--color-accent-deep)"
                : isNext
                  ? "1px solid rgba(156,74,42,0.45)"
                  : "1px solid rgba(29,25,22,0.06)",
              boxShadow: isNext
                ? "0 0 0 3px rgba(156,74,42,0.12)"
                : undefined,
            }}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                active ? "bg-white/15" : "bg-cream-2 text-ink-2"
              }`}
            >
              {s.icon}
            </span>
            <span className="flex-1 leading-tight">
              <span
                className={`block font-mono text-[10px] uppercase tracking-wider ${
                  active ? "text-white/80" : "text-ink-3"
                }`}
              >
                {s.title}
              </span>
              <span
                className={`block font-sans text-[13px] font-medium ${
                  active ? "text-white" : "text-ink"
                }`}
              >
                {s.subtitle}
              </span>
            </span>
            {/* "NEXT" badge — PRD §F7. Only when this story is the
                suggested next AND not currently active. */}
            {isNext && (
              <span
                className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                style={{
                  background: "#9c4a2a",
                  color: "#ffffff",
                  letterSpacing: "0.06em",
                }}
              >
                Next
              </span>
            )}
            {/* Stub badge — Module G will remove this when stories 2/3
                are wired. Helps the founder know what's playable. */}
            {stub && !isNext && (
              <span
                className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                style={{
                  background: "rgba(29,25,22,0.06)",
                  color: "#786d5b",
                  letterSpacing: "0.06em",
                }}
              >
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
