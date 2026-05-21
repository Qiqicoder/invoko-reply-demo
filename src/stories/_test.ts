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
 * Flow (each non-draft frame REPLACES the previous one with a cross-fade.
 * The draft card persists across draft → draftUpdate; PanelDraft animates
 * its body in place):
 *   1. screenshot      — drag Sarah's email
 *   2. quickActions    — three cards, "Reply" recommended
 *   3. thinking        — three staggered lines
 *   4. options         — three options, "Option C" recommended
 *   5. draft (v1)      — body with one [mem: …] highlight
 *   6. draftUpdate     — same card; body smoothly swaps to v2 with a
 *                        transient "Got it — adjusting tone…" line above
 *   7. toast           — confirmation, auto-dismisses after 5s
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
    type: "draftUpdate",
    thinkingLine: "Got it — adjusting tone and rewriting.",
    newBody:
      "Hi! Quick update — wanted to share a tighter version using your " +
      "[mem: warm tone] preference. Let me know what you think.",
    newAttachment: { name: "Test.pdf", type: "pdf" },
  },
  {
    type: "toast",
    lines: ["Sent", "Test complete", "Memory updated"],
  },
];
