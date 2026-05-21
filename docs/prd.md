# Invoko Reply Panel — Demo PRD

**Version**: 1.0
**Purpose**: Interactive, deployable demo of the Reply Panel feature for founder review
**Deployment**: Vercel
**Owner**: Ziying Qi (Design)

---

## 0. Project Overview

### 0.1 What this demo is

A **deployable interactive web demo** that shows the Reply Panel feature of Invoko (a Mac-native AI agent). The demo runs in a browser, mimics a macOS desktop with a fake Slack/Gmail window in the background, and lets the user trigger the Reply Panel to walk through three real interactive scenarios.

This is **not** a real product. All data is mocked. AI responses are scripted. But every interaction (clicking, typing, navigating) is real and feels real.

### 0.2 What this demo is NOT

- Not a backend project. No database, no API calls, no real AI.
- Not pixel-perfect production code. Optimize for clarity over performance.
- Not multi-user. Single-user demo, no authentication, no persistence beyond `useState`.
- Not mobile-responsive. Desktop-only (1440×900 baseline).

### 0.3 Success criteria

A founder, opening the Vercel URL, can:
1. Press a key (Fn or its substitute) and see the Panel appear
2. Walk through 3 distinct scenarios end-to-end without breaking
3. See the main Reply page change after Panel actions (state continuity)
4. Type freely where typing is enabled
5. Click freely where clicking is enabled
6. Return to any scenario at any time

---

## 1. Tech Stack

### 1.1 Required

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: lucide-react
- **Brand logos**: Use `https://cdn.simpleicons.org/{name}` via `<img>` tag
- **State**: React `useState` + `useContext` for cross-component state (no Redux, no Zustand needed)
- **Routing**: None. Single-page app. Use state-driven view switching.

### 1.2 Why this stack

- Vite is fastest to scaffold
- TypeScript prevents Cursor from making sloppy state mistakes
- Tailwind is fastest for Cursor to iterate on styling
- Framer Motion handles all panel/toast animations cleanly
- No router → simpler, fewer moving parts

### 1.3 File structure

```
src/
├── App.tsx                          # Root component, manages global state
├── main.tsx                         # Vite entry
├── index.css                        # Tailwind imports + global resets
│
├── components/
│   ├── desktop/
│   │   ├── Desktop.tsx              # Fake macOS desktop background
│   │   ├── SlackWindow.tsx          # Fake Slack window (Story 2, 3)
│   │   ├── GmailWindow.tsx          # Fake Gmail window (Story 1)
│   │   └── ScenarioSwitcher.tsx     # Floating UI to jump between stories
│   │
│   ├── panel/
│   │   ├── Panel.tsx                # The Reply Panel container
│   │   ├── PanelInput.tsx           # Bottom input box with logo + Send button
│   │   ├── ScreenshotOverlay.tsx    # Drag-to-screenshot UI
│   │   ├── PanelMessage.tsx         # Single agent/user message in panel
│   │   ├── PanelOptions.tsx         # Multi-choice selector component
│   │   ├── PanelDraft.tsx           # Reply draft preview with Send/Edit
│   │   └── PanelToast.tsx           # Post-action toast notification
│   │
│   ├── replyPage/
│   │   ├── ReplyPage.tsx            # Main Reply page (overlay window)
│   │   ├── HeroAvatar.tsx           # Mascot + traits hero section
│   │   ├── SourcesSection.tsx       # Sources list
│   │   ├── PeopleSection.tsx        # People cards
│   │   └── DocsSection.tsx          # Docs list (dynamic — updates from Panel actions)
│   │
│   └── shared/
│       ├── MemoryHighlight.tsx      # Renders ✨ rainbow text for memory-pulled fields
│       └── KeyboardHint.tsx         # Bottom-of-screen "Press Fn to summon" hint
│
├── stories/
│   ├── story1.ts                    # Story 1 script (Sarah Liu)
│   ├── story2.ts                    # Story 2 script (Nick → Bei)
│   ├── story3.ts                    # Story 3 script (proactive Bei outreach)
│   └── types.ts                     # Story step/frame types
│
├── data/
│   ├── people.ts                    # People mock data
│   ├── docs.ts                      # Docs mock data
│   ├── sources.ts                   # Sources mock data
│   └── voice.ts                     # Voice/avatar mock data
│
├── context/
│   └── AppContext.tsx               # Global state: which story, which frame, panel open?
│
└── lib/
    ├── audio.ts                     # Screenshot shutter sound trigger
    └── playback.ts                  # Frame advancement utility
```

### 1.4 Naming conventions

- **Components**: PascalCase, one component per file
- **Functions/variables**: camelCase
- **Types/interfaces**: PascalCase, prefixed with nothing (e.g. `StoryFrame`, not `IStoryFrame`)
- **Constants**: SCREAMING_SNAKE_CASE
- **Story scripts**: each frame is a step object (see Section 4)

---

## 2. Visual Design System

### 2.1 Reference

The main Reply page is already designed (the GPT-generated mockup with the peach mascot, cream background, real logos). **The Panel should use the same color system but feel slightly more "agent-like"** — Panel sits on top of any background, so it needs to be visually self-contained.

### 2.2 Color tokens (Tailwind config)

```css
/* Background */
--cream: #f5efe4
--cream-2: #ede5d4
--paper: #faf7ef

/* Ink */
--ink: #1d1916
--ink-2: #4d4438
--ink-3: #786d5b
--ink-4: #a89c84

/* Accent — terracotta */
--accent: #9c4a2a
--accent-faint: #f1e3df
--accent-deep: #6e2f18

/* Memory highlight gradient (the ✨ rainbow text) */
--memory-gradient: linear-gradient(135deg, #9c4a2a 0%, #c97550 50%, #d4a373 100%)

/* Status */
--success: #4b6849
--warning: #d97706
```

### 2.3 Type

- **Display serif**: Fraunces (Google Fonts) — for hero, page titles
- **Body sans**: Inter Tight — for everything else
- **Mono**: JetBrains Mono — for meta labels

### 2.4 Panel-specific design

- **Position**: Top center of screen (the "notch" position, ~80px from top edge)
- **Size when collapsed**: ~600px wide, ~56px tall (just the input bar)
- **Size when active**: Expands to ~720px wide, height auto based on content (max ~600px)
- **Background**: Cream `#faf7ef` with subtle shadow
- **Border radius**: 20px
- **Animation**: Spring (Framer Motion `type: "spring", damping: 22`)

### 2.5 Items needing visual alignment (NOT locked in this PRD)

Mark in code as `// TODO: align with designer` and we'll discuss separately:
- Memory-pulled text styling (the ✨ rainbow effect — gradient direction, animation if any)
- Screenshot flash color and duration
- Toast notification position and style
- Sound effect file (shutter)

---

## 3. Module Structure & Development Order

8 modules, in development order. Each must be ✅ checked before moving to the next.

### Module A — Foundation
**Goal**: Working dev environment, design tokens applied, fake desktop visible.

- [x] **A1.** Scaffold Vite + React + TS project
- [x] **A2.** Install Tailwind, configure with custom colors from Section 2.2
- [x] **A3.** Install Framer Motion, lucide-react
- [x] **A4.** Configure Fraunces, Inter Tight, JetBrains Mono via Google Fonts CDN
- [x] **A5.** Set up file structure per Section 1.3
- [x] **A6.** Create `AppContext` with state: `currentStory: 1 | 2 | 3 | null`, `currentFrame: number`, `panelState: 'idle' | 'screenshotting' | 'thinking' | 'choosing' | 'drafting' | 'editing' | 'sent'`, `replyPageOpen: boolean`
- [x] **A7.** Build empty `Desktop.tsx` with a placeholder gradient background (just to confirm rendering works)
- [x] **A8.** Add `KeyboardHint` at bottom of screen: *"Press F to summon Invoko"* (using F instead of Fn because Fn doesn't fire keydown events reliably in browsers)

**Acceptance**: `npm run dev` opens to a cream-colored desktop with a small hint at the bottom. No console errors.

---

### Module B — Fake Desktop & Windows
**Goal**: Realistic-looking fake macOS desktop with a Slack window and a Gmail window.

- [x] **B1.** Build `Desktop.tsx`: subtle gradient (cream → slightly deeper cream), macOS-style menubar at top with Apple logo, current time, control center icons
- [x] **B2.** Build `SlackWindow.tsx`: a window with traffic light buttons, sidebar with channels/DMs, main chat area. Hardcode two views: `nickChannel` (boss) and `beiDM` (peer). Each view shows mock messages.
- [x] **B3.** Build `GmailWindow.tsx`: a window with Gmail-like header, sidebar (Inbox/Sent/etc), email list, one open email (Sarah's). Mock UI only.
- [x] **B4.** Build `ScenarioSwitcher.tsx`: a small floating UI in the bottom-right corner with three buttons: *"Story 1 — Investor reply"*, *"Story 2 — Boss assigns task"*, *"Story 3 — Reach out to teammate"*. Clicking switches the active window and resets the story state.
- [x] **B5.** Add window-switching logic: Story 1 shows GmailWindow; Story 2 + 3 show SlackWindow (with different views).

**Acceptance**: Open the page, click "Story 1" → Gmail window appears with Sarah's email visible. Click "Story 2" → Slack window appears with Nick's channel and his message visible. Click "Story 3" → Slack window switches to Bei's DM.

---

### Module C — Reply Panel Shell
**Goal**: The Panel appears on F key press, with the input bar visible. No content logic yet.

- [ ] **C1.** Build `Panel.tsx`: a fixed-position floating element at top center, hidden by default, appears with spring animation when triggered.
- [ ] **C2.** Build `PanelInput.tsx`: the bottom input bar. Includes:
  - Left: small Invoko logo (terracotta starburst, ~24px)
  - Center: input field placeholder *"What can I help you with today?"*
  - Right: *"New Chat ⌄"* dropdown indicator + send button (terracotta square with arrow)
  - Below the bar (small gray text): *"Press F+Space for voice"*
- [ ] **C3.** Wire keyboard listener: pressing **F** toggles Panel visibility.
- [ ] **C4.** Add **Esc** key to close Panel.
- [ ] **C5.** Click outside Panel also closes it.
- [ ] **C6.** When Panel is closed and re-opened, reset to idle state.

**Acceptance**: Press F → Panel slides in from top with spring animation. Press F or Esc or click outside → Panel slides out. The input bar shows correctly with all elements positioned properly.

---

### Module D — Screenshot Interaction
**Goal**: When Panel is open, user can drag-to-screenshot. Selection box, flash, sound, thumbnail in input bar.

- [ ] **D1.** Build `ScreenshotOverlay.tsx`: when Panel enters screenshot mode, a semi-transparent dark overlay covers the desktop (but not the Panel). A "Drag to take a screenshot" tooltip follows the cursor.
- [ ] **D2.** Add drag-to-select rectangle: mousedown starts a rectangle, mousemove resizes it, mouseup completes.
- [ ] **D3.** On completion: flash the screen white briefly (200ms), play a shutter sound (`/public/sounds/shutter.mp3` — use any free shutter clip).
- [ ] **D4.** The selected region "captures" — show a small thumbnail of the screenshot in the Panel's input bar (left of the input text area).
- [ ] **D5.** **Important**: Screenshot mode is auto-triggered when each story starts. User doesn't manually trigger it. The first time the Panel opens during a story, it immediately enters screenshot mode and shows the "Drag" tooltip.
- [ ] **D6.** **Smart selection**: For demo purposes, the user can drag anywhere — but when they release, the captured region "snaps" to the relevant message in the underlying window (Sarah's email, Nick's message, Bei's DM). This makes the demo feel intelligent.

**Acceptance**: Trigger Story 1 → Panel opens → overlay appears → drag anywhere → snap to Sarah's email → flash + sound → thumbnail appears in input. The thumbnail should be a tiny rendered preview of the email content.

---

### Module E — Panel Conversation Engine
**Goal**: The framework for showing AI messages, options, drafts, edits. Driven by story scripts.

- [ ] **E1.** Build `PanelMessage.tsx`: renders either a "thinking step" (mono dot-prefix line, fades in), an AI message (sans serif body text), or a user message (right-aligned, bubble style).
- [ ] **E2.** Build `PanelOptions.tsx`: renders a list of choice options (○ Label format), with one marked ✓ recommended. Clickable. Returns selected value to parent.
- [ ] **E3.** Build `PanelDraft.tsx`: renders the AI's generated reply draft. Includes:
  - Body text with memory-pulled fields wrapped in `<MemoryHighlight>`
  - Optional attached file row at bottom (📎 Pitch Deck v3.pdf)
  - Two action buttons: **Send** (terracotta solid) and **Edit** (ghost outline)
- [ ] **E4.** Build `MemoryHighlight.tsx`: renders text with the rainbow/gradient styling. Bracket-syntax in mock data: `[mem: product designer focused on AI tools]` → gets rendered as gradient text with hover tooltip "Pulled from your memory".
- [ ] **E5.** Build `PanelToast.tsx`: a small notification that appears at bottom-center of screen, fades in then auto-dismisses after 3 seconds. Multi-line capable.
- [ ] **E6.** Wire all of these to be **frame-driven**: the current story file defines an array of frames; the Panel renders the current frame's content. Advance frames on user action (option click, Send click, etc.).

**Acceptance**: Build a test story with 3 frames: an AI thinking step, an option choice, and a draft. Click through → see each frame render correctly. The MemoryHighlight gradient text should be visibly different from regular text.

---

### Module F — Story 1 (Sarah Liu)
**Goal**: Full Story 1 plays through end-to-end.

See **Section 4.1** for the complete frame-by-frame script.

- [ ] **F1.** Create `story1.ts` per the script in Section 4.1
- [ ] **F2.** Wire ScenarioSwitcher's "Story 1" button to: set background = GmailWindow, reset Panel state, prep Story 1 frames.
- [ ] **F3.** Auto-open Panel on Story 1 start (Panel slides in, immediately enters screenshot mode).
- [ ] **F4.** Implement frame advancement: Frame 2 (thinking steps) → Frame 3 (options) → Frame 4 (draft v1) → on Edit click → Frame 5 (edit input) → on submit → Frame 6 (thinking step + draft v2) → on Send click → Frame 7 (toast)
- [ ] **F5.** Implement Frame 5 free-text input: a clean text area where user types their critique. On Enter or Submit, advances to Frame 6.
- [ ] **F6.** Implement Frame 7 toast with multi-line content per script.
- [ ] **F7.** After toast: Panel auto-collapses, Sarah is "added" to People (state update), ScenarioSwitcher highlights Story 2 as suggested next.

**Acceptance**: Open page → Click Story 1 → Watch and click through entire flow → See "Sarah added to People" reflected on the Reply main page if opened.

---

### Module G — Story 2 (Nick → Bei) and Story 3 (Proactive Bei)
**Goal**: Two more stories play through end-to-end.

See **Section 4.2** and **Section 4.3** for full scripts.

- [ ] **G1.** Create `story2.ts` per Section 4.2 script
- [ ] **G2.** Create `story3.ts` per Section 4.3 script
- [ ] **G3.** Wire ScenarioSwitcher to switch between stories cleanly (resetting state when needed)
- [ ] **G4.** Implement Story 2-specific behaviors:
  - Multi-step inference (reply + save doc + queue Bei)
  - User typing for completion time ("Friday afternoon")
  - One-shot satisfaction (no edit step)
  - Toast confirms 3 actions
- [ ] **G5.** Implement Story 3-specific behaviors:
  - Continuing context banner at top of Panel: *"Continuing: Q2 Roadmap task from Nick"*
  - AI uses Bei's casual voice (lowercase, mixed EN/中文)
  - Zoom calendar confirmation UI step (just a small inline card, not a real calendar)
  - Cmd+R hint at end of Story 3 to open the main Reply page and see all changes
- [ ] **G6.** State continuity: documents added in Story 2 appear in Story 3 and on the main page.

**Acceptance**: Stories 2 and 3 play through end-to-end. State changes propagate. Pressing Cmd+R after Story 3 opens the main Reply page with all updates visible.

---

### Module H — Main Reply Page Overlay
**Goal**: A windowed overlay of the Reply main page that can be summoned with Cmd+R, showing dynamic state.

- [ ] **H1.** Build `ReplyPage.tsx`: render the existing GPT-generated main Reply page design as a windowed overlay (not full screen — ~80% width, centered).
- [ ] **H2.** Components: `HeroAvatar.tsx` (mascot + traits), `SourcesSection.tsx`, `PeopleSection.tsx`, `DocsSection.tsx`
- [ ] **H3.** People and Docs sections read from `AppContext` state — so changes from Panel actions reflect here.
- [ ] **H4.** Cmd+R toggles the overlay. Esc or click outside closes it.
- [ ] **H5.** Subtle entrance/exit animation (fade + scale).
- [ ] **H6.** "Customize this voice →" button does nothing functional — but should be visible (it's an aspirational element).

**Acceptance**: Press Cmd+R at any point in any story → overlay slides in showing the latest state of People and Docs. After Story 2 completes, opening this page should show the new document in Docs.

---

## 4. Story Scripts

This section is the **source of truth** for what happens in each story. Cursor should implement exactly these frames.

### 4.1 Story 1 — Sarah Liu (mid-stage investor check-in)

**Background context to bake into mock data:**
- Sarah Liu is NOT yet in People (this story will add her).
- 3 weeks ago, in a Slack DM with Marcus Wei, Marcus mentioned: *"Sarah from Sequoia will probably reach out — gave her a heads up about what you're building."*
- 5 days ago, you sent Marcus a copy of Pitch Deck v3.pdf
- Sarah has now sent the email below.

**Sarah's email (visible in GmailWindow):**

```
From: Sarah Liu <sarah@sequoiacap.com>
Subject: Following up
─────────────────────────────────────────────────────────
Hey Ziying — it's been a few weeks since we last 
chatted with Marcus. Curious how things have been 
progressing on your end. Would love to find time for 
a deeper look. Let me know when works.

— Sarah
```

**Frames:**

**Frame 1** — Story starts. GmailWindow shows. Panel auto-opens, immediately enters screenshot mode.
- Overlay appears, tooltip "Drag to take a screenshot" follows cursor.
- User drags anywhere → snaps to Sarah's email region.
- Flash + shutter sound.
- Thumbnail appears in Panel input bar.

**Frame 2** — AI thinking steps (each fades in with 0.4s delay between):
```
· Reading message from Sarah Liu...
· This name came up in your chat with Marcus 3 weeks ago — 
  he mentioned a Sequoia partner who'd reach out.
· Looks like that's her. She's checking in on progress.
· Pulling Pitch Deck v3 — your latest, sent to Marcus 5 days ago.
```
After all lines render, brief pause (1s), then advance to Frame 3.

**Frame 3** — Option selection:
```
What should I include in the reply?

○ A. Current progress + expected timeline
○ B. Current progress + a short re-intro (it's been a 
     while since you spoke)
○ C. Both — full update     ✓ recommended for mid-stage 
                              check-in

[ Skip — just acknowledge for now ]
```
User clicks C. Advance to Frame 4.

**Frame 4** — Draft v1 appears:
```
Hi Sarah — great to hear from you, thanks for following up.

Quick re-intro since it's been a few weeks: I'm a 
[mem: product designer focused on AI tools] building 
Invoko, an AI agent for Mac.

On progress: we're [mem: in early beta with ~50 active 
users] and targeting [mem: public launch end of Q3]. 
The deck attached (v3) has the latest numbers and 
roadmap detail.

Free for a deeper look this week — Tue or Thu afternoon?

— Ziying

📎 Pitch Deck v3.pdf
─────────────────────────────────
[ Send ]   [ ✎ Edit ]
```
User clicks Edit. Advance to Frame 5.

**Frame 5** — Edit input:
```
[Panel adds AI message above input]:
How should I change it?

[Input area activates, placeholder: "Tell me what feels off..."]
```
User types: *"make it less formal, the 'On progress:' part sounds too mechanical, more like me casually chatting"*

User presses Enter. Advance to Frame 6.

**Frame 6** — AI thinking + draft v2:
```
· Got it — adjusting tone and rewriting the progress part.
```
Then draft v2 appears:
```
Hey Sarah — good to hear from you.

Quick context since it's been a minute: I'm a 
[mem: designer building AI tools], currently working 
on Invoko, an AI agent for Mac.

We're [mem: in early beta with ~50 users right now], 
aiming for [mem: public launch end of Q3]. Deck v3 
has the full breakdown if you want the details.

Up for a real look this week? Tue or Thu afternoon 
would work on my end.

— Ziying

📎 Pitch Deck v3.pdf
─────────────────────────────────
[ Send ]   [ ✎ Edit ]
```
User clicks Send. Advance to Frame 7.

**Frame 7** — Toast notification (3 lines, stays 3 seconds):
```
✓ Sent to Sarah Liu  ·  Pitch Deck v3 attached
✓ Sarah added to your People as Investor
✓ Voice learned: casual + chatty preferred for follow-ups
```
After toast dismisses, Panel auto-closes. State update: Sarah added to People.

ScenarioSwitcher highlights Story 2 as "next".

---

### 4.2 Story 2 — Nick assigns Q2 Roadmap review (boss)

**Background context:**
- Nick is your boss, already in People as BOSS.
- Bei is a peer (PEER), already in People.
- Nick just sent the message below in Slack #design channel.

**Nick's message (visible in SlackWindow):**

```
Nick · 2:34 PM
Hey — need you to take a look at the Q2 roadmap and 
give me your thoughts by EOW. I'll loop in Bei for 
coordination on the changes.

📎 Product Roadmap Q2 2024.pdf
```

**Frames:**

**Frame 1** — Story starts. SlackWindow shows Nick's channel. Panel auto-opens, screenshot mode.
- User drags → snaps to Nick's message + attached doc area.
- Flash + sound. Thumbnail in input.

**Frame 2** — AI thinking steps:
```
· Message from Nick — your boss.
· He's assigning the Q2 roadmap review, due EOW, with 
  Bei looped in.
· I see the attachment — Product Roadmap Q2 2024.pdf. 
  Saving to your Docs.
· Planning: a brief confirmation reply now, then I'll 
  queue Bei for follow-up.
```

**Frame 3** — One clarifying question (no option list, just text input):
```
[AI message]:
When do you think you'll have feedback ready? I'll 
include that in the reply so Nick knows what to expect.

[Input activates, placeholder: "e.g. Friday afternoon"]
```
User types: *"Friday afternoon"*. Presses Enter.

**Frame 4** — Draft (one-shot, no edit step in this story):
```
Got it — I'll have my thoughts on the Q2 roadmap 
by [mem: Friday afternoon]. Will sync with Bei this 
week to align on the changes.
─────────────────────────────────
[ Send ]   [ ✎ Edit ]
```
User clicks Send.

**Frame 5** — Toast (multi-line):
```
✓ Reply sent to Nick
✓ Q2 Roadmap saved to your Docs
✓ Bei queued for follow-up — I'll prep a message when 
   you're ready
```

After toast dismisses, Panel closes. State updates:
- Doc added to Docs section: `Product Roadmap Q2 2024.pdf` · `From chat (Nick)` · just now

ScenarioSwitcher highlights Story 3 as "next".

---

### 4.3 Story 3 — Proactive reach to Bei (continuing context)

**Background context:**
- Story 2 has set up the Bei follow-up.
- Bei has prior casual DMs with you (mock 2-3 lines of past casual chat: weekend hiking talk).
- Bei is in People as PEER.

**Bei's DM history (visible when SlackWindow switches to Bei DM):**

```
Bei · last Friday
yo did u end up doing that hike on saturday?

You · last Friday
ya it was perfect lol

Bei · last Friday
sick lmk next time, down to join
```

**Frames:**

**Frame 1** — Story starts. SlackWindow switches to Bei's DM. Panel opens with **a continuing-context banner** at top:
```
↳ Continuing: Q2 Roadmap follow-up from Nick
```
Below banner, immediately enters screenshot mode.
- User drags → snaps to Bei's DM (the whole conversation area).
- Flash + sound.

**Frame 2** — AI thinking steps:
```
· Bei's DM — you've been planning to reach out about 
  the Q2 roadmap review.
· She's a peer, casual tone — short messages, lowercase, 
  mixed English/Chinese.
· Drafting an intro that bridges the context.
```

**Frame 3** — One question with two structured options:
```
How should I frame this?

○ A. Quick heads-up — keep it brief, no meeting yet
○ B. Suggest a sync — propose a Zoom this week
                                   ✓ recommended

[ Skip the question ]
```
User clicks B.

**Frame 4** — AI thinking step:
```
· Got it — proposing a 30-min Zoom for Wed afternoon.
```
Then advances to Frame 5.

**Frame 5** — Calendar confirmation card (inline in Panel):
```
┌─────────────────────────────────────────────┐
│  Suggesting Zoom meeting:                    │
│                                              │
│  Wed, May 22  ·  2:00 PM – 2:30 PM           │
│  with Bei Chen                               │
│  Topic: Q2 Roadmap sync                      │
│                                              │
│  [ Looks good ]  [ Adjust time ]             │
└─────────────────────────────────────────────┘
```
User clicks "Looks good". Advance to Frame 6.

**Frame 6** — Draft appears (in Bei's casual voice):
```
hey — nick 让我看 Q2 roadmap，想周三下午拉你 30 min 
对齐下，你时间方便吗？我建了个 zoom，到时候直接进。

📎 Wed 2:00 PM · Zoom · Q2 Roadmap sync
─────────────────────────────────
[ Send ]   [ ✎ Edit ]
```
User clicks Send.

**Frame 7** — Toast (multi-line):
```
✓ Sent to Bei
✓ Zoom meeting added to your Calendar — Wed 2pm
✓ Bei's reply queue cleared
```

After toast dismisses, Panel closes. **Hint banner appears at bottom**:
```
Press ⌘R to see what Reply has learned today →
```

**Frame 8 (optional flourish)** — User presses Cmd+R, main Reply page slides in showing:
- Bei card now shows latest reply preview
- Docs has Q2 Roadmap pdf
- People has Sarah (from Story 1)

End of demo.

---

## 5. Mock Data Specification

### 5.1 `data/people.ts`

```typescript
export const PEOPLE: Person[] = [
  {
    id: 'nick',
    name: 'Nick',
    role: 'boss',
    company: 'Internal',
    initial: 'N',
    color: '#7a3537', // muted red
    latestReply: 'Sure, I can take a pass after the vendor...',
    latestTime: '2h ago',
    inPeopleByDefault: true,
  },
  {
    id: 'bei',
    name: 'Bei',
    role: 'peer',
    company: 'Design team',
    initial: 'B',
    color: '#3d5673', // muted blue
    latestReply: 'sick lmk next time, down to join',
    latestTime: '5d ago',
    inPeopleByDefault: true,
  },
  {
    id: 'luna',
    name: 'Luna',
    role: 'hr',
    company: 'Internal',
    initial: 'L',
    color: '#a89c84',
    latestReply: 'Thanks! I\'ll review this today.',
    latestTime: '4h ago',
    inPeopleByDefault: true,
  },
  // ... 3-4 more default people (Vendor team, Jing, Mira) to match the mock
  {
    id: 'sarah',
    name: 'Sarah Liu',
    role: 'investor',
    company: 'Sequoia',
    initial: 'S',
    color: '#5d4775', // muted purple
    latestReply: 'Hey Sarah — good to hear from you...',
    latestTime: 'just now',
    inPeopleByDefault: false, // added during Story 1
  },
];
```

### 5.2 `data/docs.ts`

```typescript
export const DOCS_DEFAULT: Doc[] = [
  { id: 'pitch', name: 'Pitch Deck v3', type: 'pdf', source: 'You uploaded', meta: '5 days ago · sent to Marcus' },
  { id: 'onboarding', name: 'Onboarding Playbook', type: 'docx', source: 'Shared by Luna', meta: '1 week ago' },
  { id: 'q1budget', name: 'Q1 Budget Overview', type: 'xlsx', source: 'You uploaded', meta: '3 weeks ago' },
  { id: 'allhands', name: 'All Hands Summary – May', type: 'pptx', source: 'Shared by Jing', meta: '1 month ago' },
];

export const Q2_ROADMAP_DOC: Doc = {
  id: 'q2roadmap',
  name: 'Product Roadmap Q2 2024',
  type: 'pdf',
  source: 'From chat (Nick)',
  meta: 'just now',
  // added during Story 2
};
```

### 5.3 `data/sources.ts`

```typescript
export const SOURCES = [
  { id: 'slack', name: 'Slack', logo: 'https://cdn.simpleicons.org/slack', status: 'connected' },
  { id: 'gmail', name: 'Gmail', logo: 'https://cdn.simpleicons.org/gmail', status: 'connected' },
  { id: 'whatsapp', name: 'WhatsApp', logo: 'https://cdn.simpleicons.org/whatsapp', status: 'connected' },
  { id: 'notion', name: 'Notion', logo: 'https://cdn.simpleicons.org/notion', status: 'connected' },
  { id: 'gdrive', name: 'Google Drive', logo: 'https://cdn.simpleicons.org/googledrive', status: 'connected' },
  { id: 'teams', name: 'Microsoft Teams', logo: 'https://cdn.simpleicons.org/microsoftteams', status: 'not_connected' },
];
```

### 5.4 `data/voice.ts`

```typescript
export const VOICE = {
  trainedOn: 1234,
  traits: ['brief', 'direct', 'mixes EN / 中文', 'opens with "Hey"', 'no sign-offs', 'emoji only if matched'],
  selfIntro: 'product designer focused on AI tools',
  currentProgress: 'in early beta with ~50 active users',
  launchTimeline: 'public launch end of Q3',
};
```

### 5.5 Story scripts use this type

```typescript
// stories/types.ts

type Frame =
  | { type: 'screenshot' }
  | { type: 'thinking'; lines: string[] }
  | { type: 'options'; question: string; options: Option[]; skipLabel?: string }
  | { type: 'input'; prompt: string; placeholder: string; onSubmit: (val: string) => void }
  | { type: 'draft'; body: string; attachment?: Attachment; onSend: () => void; onEdit: () => void }
  | { type: 'calendarConfirm'; title: string; time: string; with: string; topic: string; onConfirm: () => void }
  | { type: 'toast'; lines: string[]; duration?: number };

type Option = { label: string; recommended?: boolean; value: string };
type Attachment = { name: string; type: string };
```

---

## 6. Acceptance & Testing

### 6.1 Acceptance per module
Each module ✅ when:
- All checkboxes inside are done
- Module-specific acceptance criteria met (stated in each module above)
- Tested manually in Chrome at 1440×900

### 6.2 End-to-end acceptance
Final demo passes when:
- [ ] Vercel deployment URL works
- [ ] All 3 stories play through without errors
- [ ] State changes persist (Sarah added, doc added)
- [ ] Cmd+R opens main page correctly
- [ ] No console errors
- [ ] Smooth animations (no jank)
- [ ] Sound plays on screenshot (audio file present)

### 6.3 Testing methodology
- **Manual click-through**: Cursor walks each story end-to-end after building it.
- **State inspection**: Open React DevTools, verify `AppContext` updates correctly after each action.
- **Replay test**: After completing all stories, switch back to Story 1 — state should reset cleanly for that story but global "memory" (Sarah, doc) persists across the session.

---

## 7. Instructions for Cursor

### 7.1 How to read this PRD

1. Build modules **in order** A → B → C → D → E → F → G → H. Do not skip ahead.
2. After each module, **stop and run** `npm run dev` to verify the module works before proceeding.
3. If something is unclear, **prefer the simplest interpretation**. Don't over-engineer.
4. Comments in code should be minimal but meaningful. Mark visual decisions that need designer alignment with `// TODO: align with designer`.

### 7.2 Specific guidance

- **Don't add features not in this PRD.** No login pages, no settings, no toggles. Just the demo.
- **Don't build real AI.** All AI responses are scripted in `stories/*.ts`. Never call an API.
- **Don't optimize for production.** This is a demo. Inline styles, hardcoded values, magic numbers — all fine if they're clear.
- **Don't make it mobile-responsive.** Desktop only. 1440×900 baseline.
- **Use Framer Motion for every animation.** Don't write CSS keyframes.
- **Use lucide-react for all icons** (Send, Edit, Refresh, etc.). Don't use SVG strings.
- **Use simple-icons CDN for brand logos** (Slack, Gmail, etc.) via `<img src="https://cdn.simpleicons.org/slack" />`.

### 7.3 When stuck

If a frame's behavior is ambiguous after re-reading:
1. Re-read the story script in Section 4.
2. If still unclear, **build the most boring version that satisfies the spec** and mark with `// TODO: confirm with PM`.
3. Don't invent new UI flourishes.

---

## 8. Visual Assets to Align Before Module D

Before building Module D (Screenshot) and Module E (Conversation), the designer needs to provide or confirm:

- [ ] **Sound file**: shutter sound effect (`.mp3`, ~0.3s, free / royalty-free)
- [ ] **Mascot image**: the peach mascot from the GPT-generated mockup — provide as PNG (transparent background) for use on the main Reply page
- [ ] **Logo cluster style**: confirm logos use the same rounded-square + soft-shadow treatment as the main page mockup
- [ ] **Memory highlight effect**: align on exact gradient/animation for `[mem: ...]` text
- [ ] **Panel screenshot flash color**: white? cream? terracotta? — confirm
- [ ] **Panel toast position**: bottom-center vs top-right
- [ ] **Continuing context banner style (Story 3)**: small chip vs full banner

These are blockers for Module D and beyond. Schedule a 15-min review.

---

## 9. Out of Scope

Explicitly **not** in this demo:
- Real authentication
- Real Slack/Gmail integration
- Real screenshot capture (we fake it)
- Real audio recording / voice mode (just the hint text)
- Real calendar integration (Story 3's Zoom is a confirmation UI, not real)
- Settings, preferences, account pages
- Multiple Voice avatars (single avatar shown only)
- Mobile / tablet layouts
- Dark mode
- Accessibility considerations beyond basic (no full screen reader support, etc.)

---

## End of PRD

Estimated total build time for Cursor: 8-12 hours of focused work.
