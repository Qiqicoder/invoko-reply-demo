import type { Frame } from "./types";

/**
 * TEST_STORY (PRD §E6 + Module E fixes) — synthetic script that exercises
 * every Frame type so we can verify the conversation engine end-to-end.
 * Remove this once Module F lands.
 *
 * Pairs with the temporary "Test" button in ScenarioSwitcher. Clicking it
 * loads this script + sets `currentStory = 1` so the Gmail window with
 * Sarah's email is visible (gives the screenshot something to snap to).
 *
 * Flow:
 *   1. screenshot      — drag Sarah's email
 *   2. quickActions    — three cards, "Reply" recommended
 *   3. thinking        — three staggered lines
 *   4. options         — three options, "Option C" recommended
 *   5. draft v1        — body with one [mem: …] highlight
 *   6. userMessage     — placeholder text; substituted with the user's
 *                        typed feedback if they type in the input bar
 *   7. draft v2        — regenerated draft incorporating the feedback
 *   8. toast           — confirmation, auto-dismisses after 5s
 */
export const TEST_STORY: Frame[] = [
  { type: "screenshot" },
  {
    type: "quickActions",
    actions: [
      { title: "Reply", sub: "TEST RECIPIENT", recommended: true },
      { title: "Summarize", sub: "TEST CONTENT" },
      { title: "Forward", sub: "TO SOMEONE" },
    ],
  },
  {
    type: "thinking",
    lines: [
      "First thinking step here.",
      "Second thinking step here.",
      "Third thinking step here.",
    ],
  },
  {
    type: "options",
    question: "Test question?",
    options: [
      { label: "Option A" },
      { label: "Option B" },
      { label: "Option C", recommended: true },
    ],
    skipLabel: "Skip",
  },
  {
    type: "draft",
    body: "Hello test, this is a [mem: memory field] inside a draft.",
    attachment: { name: "Test.pdf", type: "pdf" },
  },
  {
    // Placeholder text — overwritten by whatever the user actually types
    // into the input bar (see AppContext.submitUserInput).
    type: "userMessage",
    text: "Make it more concise and warmer.",
  },
  {
    type: "draft",
    body:
      "Hi! Quick update — wanted to share a tighter version using your " +
      "[mem: warm tone] preference. Let me know what you think.",
    attachment: { name: "Test.pdf", type: "pdf" },
  },
  {
    type: "toast",
    lines: ["Sent", "Test complete", "Memory updated"],
  },
];
