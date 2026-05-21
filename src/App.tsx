import { AnimatePresence } from "framer-motion";
import { Desktop } from "./components/desktop/Desktop";
import { GmailWindow } from "./components/desktop/GmailWindow";
import { ScenarioSwitcher } from "./components/desktop/ScenarioSwitcher";
import { SlackWindow } from "./components/desktop/SlackWindow";
import { Panel } from "./components/panel/Panel";
import { ScreenshotOverlay } from "./components/panel/ScreenshotOverlay";
import { KeyboardHint } from "./components/shared/KeyboardHint";
import { AppProvider, useApp } from "./context/AppContext";

/**
 * Root component.
 *
 * Layout layers (bottom → top):
 *   1. Desktop (background gradient + macOS menubar)
 *   2. ActiveWindow (Gmail/Slack — depends on currentStory)
 *   3. KeyboardHint (bottom hint)
 *   4. ScenarioSwitcher (floating bottom-right)
 *
 * Module C+ will mount the Panel, ScreenshotOverlay, Toast, and ReplyPage
 * overlay as additional layers above these.
 */
export default function App() {
  return (
    <AppProvider>
      <div className="relative h-screen w-screen">
        <Desktop>
          <ActiveWindow />
        </Desktop>
        <ScreenshotOverlayMount />
        <Panel />
        <KeyboardHint />
        <ScenarioSwitcher />
      </div>
    </AppProvider>
  );
}

/**
 * Picks the right window based on `currentStory` (PRD §B5):
 *   - Story 1 → GmailWindow with Sarah's email
 *   - Story 2 → SlackWindow on the #design channel (Nick's message)
 *   - Story 3 → SlackWindow on Bei's DM
 *   - null    → empty desktop (waiting for the user to pick a story)
 */
function ActiveWindow() {
  const { currentStory } = useApp();

  if (currentStory === 1) return <GmailWindow />;
  if (currentStory === 2) return <SlackWindow view="nickChannel" />;
  if (currentStory === 3) return <SlackWindow view="beiDM" />;
  return <EmptyDesktopHint />;
}

/**
 * Mount the ScreenshotOverlay only while we're actively in screenshot mode.
 * Wrapped in AnimatePresence so the dim backdrop can fade in/out.
 */
function ScreenshotOverlayMount() {
  const { panelOpen, panelState } = useApp();
  const active = panelOpen && panelState === "screenshotting";
  return (
    <AnimatePresence>{active && <ScreenshotOverlay />}</AnimatePresence>
  );
}

function EmptyDesktopHint() {
  return (
    <div className="pointer-events-none flex h-full flex-col items-center justify-center gap-2 text-center">
      <p className="font-display text-[28px] font-medium text-ink-2/70">
        Pick a scenario to start
      </p>
      <p className="font-sans text-[13px] text-ink-3">
        Use the panel in the bottom-right corner.
      </p>
    </div>
  );
}
