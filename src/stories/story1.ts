import type { Frame } from "./types";

/**
 * Story 1 — Sarah Liu (mid-stage investor check-in). PRD §4.1.
 *
 * Background baked into the script:
 *   • Sarah Liu is NOT yet in People (this story adds her at the end).
 *   • 3 weeks ago, Marcus Wei DM'd you: "Sarah from Sequoia will probably
 *     reach out — gave her a heads up about what you're building."
 *   • 5 days ago, you sent Marcus a copy of Pitch Deck v3.pdf.
 *   • Sarah just emailed (visible in GmailWindow).
 *
 * Flow (Module E single-frame engine; PRD §F4):
 *   1. screenshot     — drag Sarah's email
 *   2. quickActions   — Reply / Summarize / Forward (Reply recommended)
 *   3. thinking       — 4-step reasoning, 0.4s stagger
 *   4. options        — A / B / C, C recommended; Skip available
 *   5. draft (v1)     — formal version, three [mem: …] highlights,
 *                       Pitch Deck v3.pdf attached
 *   6. draftUpdate    — same card; thinkingLine "Got it — adjusting tone…"
 *                       and body swaps to v2 (casual rewrite)
 *   7. toast          — 3 confirmation lines, auto-dismisses after 5s
 *
 * PRD §4.1 originally had a distinct Frame 5 ("Edit input") between the
 * two drafts. Module E removed the Edit button and made the input bar
 * always-editable, so that step is now implicit — the user types feedback
 * into the input bar (or just clicks Send on v1) and `submitUserInput` /
 * Send both advance to the draftUpdate, which keeps the card mounted and
 * animates v1 → v2 in place. PRD §F4's intent (regenerate from feedback)
 * is preserved; only the UX surface changed.
 *
 * Original PRD frame counts in comments below for traceability.
 */
export const STORY_1: Frame[] = [
  // Frame 1 (PRD): screenshot.
  { type: "screenshot" },

  // Frame 2 (Module E): quickActions — user picks Reply or types in input bar.
  {
    type: "quickActions",
    actions: [
      { title: "Reply", sub: "TO SARAH LIU", recommended: true },
      { title: "Summarize", sub: "THIS EMAIL" },
      { title: "Forward", sub: "TO SOMEONE" },
    ],
  },

  // Frame 3 (PRD): thinking — 4 lines, ~0.4s stagger handled by PanelMessage.
  {
    type: "thinking",
    lines: [
      "Reading message from Sarah Liu…",
      "This name came up in your chat with Marcus 3 weeks ago — he mentioned a Sequoia partner who'd reach out.",
      "Looks like that's her. She's checking in on progress.",
      "Pulling Pitch Deck v3 — your latest, sent to Marcus 5 days ago.",
    ],
  },

  // Frame 4 (PRD): options. C is the recommended mid-stage check-in path.
  // TODO: align with designer — PRD shows "✓ recommended for mid-stage
  // check-in" as a per-option hint. OptionItem doesn't carry a hint field
  // yet; for now the recommendation badge is binary and the contextual
  // copy lives in the label.
  {
    type: "options",
    question: "What should I include in the reply?",
    options: [
      { label: "Current progress + expected timeline" },
      {
        label:
          "Current progress + a short re-intro (it's been a while since you spoke)",
      },
      { label: "Both — full update", recommended: true },
    ],
    skipLabel: "Skip — just acknowledge for now",
  },

  // Frame 5 (PRD): Draft v1 — formal, three memory fields, deck attached.
  {
    type: "draft",
    body: [
      "Hi Sarah — great to hear from you, thanks for following up.",
      "",
      "Quick re-intro since it's been a few weeks: I'm a [mem: product designer focused on AI tools] building Invoko, an AI agent for Mac.",
      "",
      "On progress: we're [mem: in early beta with ~50 active users] and targeting [mem: public launch end of Q3]. The deck attached (v3) has the latest numbers and roadmap detail.",
      "",
      "Free for a deeper look this week — Tue or Thu afternoon?",
      "",
      "— Ziying",
    ].join("\n"),
    attachment: { name: "Pitch Deck v3.pdf", type: "pdf" },
  },

  // Frame 6 (Module E pattern): draftUpdate — replaces v1 body in place.
  // The thinkingLine is what PRD §4.1 Frame 6 prefixed with "·".
  {
    type: "draftUpdate",
    thinkingLine: "Got it — adjusting tone and rewriting the progress part.",
    newBody: [
      "Hey Sarah — good to hear from you.",
      "",
      "Quick context since it's been a minute: I'm a [mem: designer building AI tools], currently working on Invoko, an AI agent for Mac.",
      "",
      "We're [mem: in early beta with ~50 users right now], aiming for [mem: public launch end of Q3]. Deck v3 has the full breakdown if you want the details.",
      "",
      "Up for a real look this week? Tue or Thu afternoon would work on my end.",
      "",
      "— Ziying",
    ].join("\n"),
    newAttachment: { name: "Pitch Deck v3.pdf", type: "pdf" },
  },

  // Frame 7 (PRD Frame 7): toast — three confirmation lines. PanelToast
  // renders the checkmark glyphs, so the strings are plain text.
  {
    type: "toast",
    lines: [
      "Sent to Sarah Liu  ·  Pitch Deck v3 attached",
      "Sarah added to your People as Investor",
      "Voice learned: casual + chatty preferred for follow-ups",
    ],
  },
];
