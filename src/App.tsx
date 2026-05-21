import { Desktop } from "./components/desktop/Desktop";
import { KeyboardHint } from "./components/shared/KeyboardHint";
import { AppProvider } from "./context/AppContext";

/**
 * Root component. Module A only renders the foundation:
 *   1. Global state provider
 *   2. Fake desktop background
 *   3. Keyboard hint
 *
 * Subsequent modules will mount Panel, ScenarioSwitcher, ReplyPage overlay,
 * etc. as siblings inside <AppProvider>.
 */
export default function App() {
  return (
    <AppProvider>
      <div className="relative h-screen w-screen">
        <Desktop />
        <KeyboardHint />
      </div>
    </AppProvider>
  );
}
