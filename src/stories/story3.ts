import type { Frame } from "./types";

/**
 * Story 3 — Proactive reach to Bei (continuing context). PRD §4.3 + visual §3/§7.
 *
 * Flow:
 *   1. continuingContext — banner (auto-advance → screenshot)
 *   2. screenshot        — Bei DM thread
 *   3. quickActions      — Reply / Schedule / Forward
 *   4. thinking          — casual tone, bridge context
 *   5. options           — brief vs Zoom sync (B recommended)
 *   6. thinking          — confirm Wed afternoon Zoom
 *   7. calendarConfirm   — meeting card
 *   8. draft             — casual EN/中文 + Zoom chip
 *   9. toast             — 3 lines → ⌘R hint (Module G5)
 */
export const STORY_3: Frame[] = [
  {
    type: "continuingContext",
    label: "Q2 Roadmap follow-up from Nick",
  },

  { type: "screenshot" },

  {
    type: "quickActions",
    actions: [
      { title: "Reply", sub: "TO BEI", recommended: true },
      { title: "Schedule", sub: "SYNC MEETING" },
      { title: "Forward", sub: "TO SOMEONE" },
    ],
  },

  {
    type: "thinking",
    lines: [
      "Bei's DM — you've been planning to reach out about the Q2 roadmap review.",
      "She's a peer, casual tone — short messages, lowercase, mixed English/Chinese.",
      "Drafting an intro that bridges the context.",
    ],
  },

  {
    type: "options",
    question: "How should I frame this?",
    options: [
      { label: "Quick heads-up — keep it brief, no meeting yet" },
      { label: "Suggest a sync — propose a Zoom this week", recommended: true },
    ],
    skipLabel: "Skip the question",
  },

  {
    type: "thinking",
    lines: ["Got it — proposing a 30-min Zoom for Wed afternoon."],
  },

  {
    type: "calendarConfirm",
    title: "Suggesting Zoom meeting:",
    time: "Wed, May 22  ·  2:00 PM – 2:30 PM",
    with: "Bei Chen",
    topic: "Q2 Roadmap sync",
  },

  {
    type: "draft",
    body: "hey — nick 让我看 Q2 roadmap，想周三下午拉你 30 min 对齐下，你时间方便吗？我建了个 zoom，到时候直接进。",
    attachment: { name: "Wed 2:00 PM · Zoom · Q2 Roadmap sync", type: "zoom" },
  },

  {
    type: "toast",
    lines: [
      "Sent to Bei",
      "Zoom meeting added to your Calendar — Wed 2pm",
      "Bei's reply queue cleared",
    ],
    duration: 5000,
  },
];
