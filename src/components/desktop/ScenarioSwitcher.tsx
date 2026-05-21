import { Beaker, Inbox, Mail, MessageCircle } from "lucide-react";
import { useApp, type StoryId } from "../../context/AppContext";
import { TEST_STORY } from "../../stories/_test";

/**
 * Floating scenario switcher (PRD §B4) — bottom-right corner.
 *
 * Three buttons jump between the three demo stories. Clicking a button:
 *   - sets `currentStory` in AppContext
 *   - resets Panel (frame=0, panelState='idle') via `resetPanel`
 *
 * Module A built the context; Module F+ will hook Panel auto-open + Story
 * prep onto these clicks. For Module B we just need the window-switching
 * behavior to work.
 */

interface Scenario {
  id: StoryId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Story 1",
    subtitle: "Investor reply",
    icon: <Mail className="h-4 w-4" strokeWidth={1.8} />,
  },
  {
    id: 2,
    title: "Story 2",
    subtitle: "Boss assigns task",
    icon: <Inbox className="h-4 w-4" strokeWidth={1.8} />,
  },
  {
    id: 3,
    title: "Story 3",
    subtitle: "Reach out to teammate",
    icon: <MessageCircle className="h-4 w-4" strokeWidth={1.8} />,
  },
];

export function ScenarioSwitcher() {
  const { currentStory, startStory, setCurrentStory, loadStory } = useApp();

  function pick(id: StoryId) {
    // PRD §D5 (revised): clicking a story sets context + closes the Panel.
    // User presses F to summon Panel into screenshot mode.
    startStory(id);
  }

  function pickTest() {
    // Module E temporary: use Story 1's Gmail backdrop so the screenshot
    // frame has something (Sarah's email) to snap to, then load the
    // synthetic TEST_STORY frames directly into the engine.
    setCurrentStory(1);
    loadStory(TEST_STORY);
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
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => pick(s.id)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
              active
                ? "bg-accent text-white shadow-sm"
                : "bg-white text-ink-2 hover:bg-cream"
            }`}
            style={{
              border: active
                ? "1px solid var(--color-accent-deep)"
                : "1px solid rgba(29,25,22,0.06)",
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
          </button>
        );
      })}

      {/* Temporary Module E test button — remove once Module F ships. */}
      <button
        type="button"
        onClick={pickTest}
        className="mt-1 flex items-center gap-3 rounded-xl border border-dashed px-3 py-2 text-left transition hover:bg-cream"
        style={{
          borderColor: "rgba(156,74,42,0.45)",
          background: "rgba(156,74,42,0.05)",
        }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-2 text-ink-2">
          <Beaker className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <span className="flex-1 leading-tight">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-3">
            Module E
          </span>
          <span className="block font-sans text-[13px] font-medium text-ink">
            Test all frames
          </span>
        </span>
      </button>
    </div>
  );
}
