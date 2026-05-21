import type { Frame } from "./types";

/**
 * Story 2 — Nick assigns Q2 Roadmap review (boss). PRD §4.2 + visual §3.
 *
 * Flow:
 *   1. screenshot     — Nick's #design message + PDF
 *   2. quickActions   — Reply / Save doc / Forward (PRD_visual_updates §3)
 *   3. thinking       — save doc, queue Bei
 *   4. input          — "When will feedback be ready?"
 *   5. draft          — one-shot confirmation (no edit step)
 *   6. toast          — 3 lines
 */
export const STORY_2: Frame[] = [
  { type: "screenshot" },

  {
    type: "quickActions",
    actions: [
      { title: "Reply", sub: "TO NICK", recommended: true },
      { title: "Save doc", sub: "Q2 ROADMAP" },
      { title: "Forward", sub: "TO BEI" },
    ],
  },

  {
    type: "thinking",
    lines: [
      "Message from Nick — your boss.",
      "He's assigning the Q2 roadmap review, due EOW, with Bei looped in.",
      "I see the attachment — Product Roadmap Q2 2024.pdf. Saving to your Docs.",
      "Planning: a brief confirmation reply now, then I'll queue Bei for follow-up.",
    ],
  },

  {
    type: "input",
    prompt:
      "When do you think you'll have feedback ready? I'll include that in the reply so Nick knows what to expect.",
    placeholder: "e.g. Friday afternoon",
  },

  {
    type: "draft",
    body: "Got it — I'll have my thoughts on the Q2 roadmap by [mem: Friday afternoon]. Will sync with Bei this week to align on the changes.",
  },

  {
    type: "toast",
    lines: [
      "Reply sent to Nick",
      "Q2 Roadmap saved to your Docs",
      "Bei queued for follow-up — I'll prep a message when you're ready",
    ],
    duration: 5000,
  },
];
