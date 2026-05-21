# PRD Visual Updates

This document supplements `PRD.md` with detailed visual specifications. It does NOT replace any part of the original PRD — only adds visual detail.

Reference images:
- `docs/panel_mock_idle.png` — Panel idle/screenshot state with Quick Actions
- `docs/panel_mock_options.png` — Options frame visual spec

---

## 1. Panel Container

- **Width**: 720px (max)
- **Background**: `#faf7ef` (paper, slightly lighter than the page cream `#f5efe4`)
- **Border**: 1px solid `#d6cab2`
- **Border radius**: 20px
- **Shadow**: `0 4px 24px rgba(29, 25, 22, 0.08), 0 1px 3px rgba(29, 25, 22, 0.04)`
- **Position**: top center of screen, ~80px from top edge
- **Padding**: 0 (children handle their own padding)
- **Animation in**: spring slide from y=-40 to y=0, opacity 0 to 1, damping 22, stiffness 280
- **Animation out**: reverse, faster (200ms ease)

## 2. Drag-to-Screenshot Tooltip

- **Position**: floats ABOVE the Panel, follows the mouse cursor with smooth lag (~50ms ease)
- **Cursor offset**: about 16px right and 16px below the cursor (not directly on top)
- **Style**: white pill with subtle shadow
  - Background: `#ffffff`
  - Border-radius: 8px
  - Padding: 8px 14px
  - Shadow: `0 2px 8px rgba(29, 25, 22, 0.1)`
  - Font: Inter Tight, 13px, color `#1d1916`, weight 500
- **Text**: "Drag to take a screenshot"
- **Behavior**:
  - Appears when Panel enters screenshot mode (auto-triggered at start of each story)
  - Follows cursor on `mousemove`
  - Disappears when:
    - User starts dragging (mousedown begins selection)
    - User clicks anywhere outside the Panel
    - Screenshot is completed
    - User types in the input field

## 3. Quick Action Cards (NEW frame type)

Three horizontal cards rendered ABOVE the Panel's input bar (inside the same Panel container, with ~16px gap between cards and input bar).

### Layout
- 3 cards in a row, equal width
- Gap between cards: 12px
- Card size: ~220px wide × ~80px tall
- Cards live inside the Panel, with ~20px horizontal padding from Panel edges

### Card style (default)
- Background: `#ffffff` or very pale cream
- Border: 1px solid `#e2d8c2`
- Border radius: 12px
- Padding: 14px 16px
- Layout inside card:
  - Top-right corner: number "1", "2", or "3" — JetBrains Mono, 11px, color `#a89c84`
  - Title: Fraunces serif, 16px, weight 500, color `#1d1916`
  - Subtitle below title: JetBrains Mono, 10px, uppercase, letter-spacing 0.12em, color `#786d5b`

### Card style (recommended — first card only)
- Border: 1px solid `#9c4a2a` (terracotta)
- Bottom-right corner: small "↵" return arrow icon, 14px, color `#9c4a2a`
- Title color stays `#1d1916`

### Behavior
- Cards stay visible until user interaction
- Click any card → advance to next frame (Frame 2: thinking)
- Press Enter → triggers the recommended (first) card → advance to Frame 2
- User can also type in the input bar instead — typing also advances to Frame 2
- Cards do NOT auto-dismiss

### Frame type definition (update `stories/types.ts`)
```typescript
{
  type: 'quickActions';
  actions: {
    title: string;
    sub: string;
    recommended?: boolean
  }[]
}
```

### Story-specific content

**Story 1** (after screenshot of Sarah's email):
- Card 1: title "Reply", sub "TO SARAH LIU", recommended: true
- Card 2: title "Summarize", sub "THIS EMAIL"
- Card 3: title "Forward", sub "TO SOMEONE"

**Story 2** (after screenshot of Nick's message):
- Card 1: title "Reply", sub "TO NICK", recommended: true
- Card 2: title "Save doc", sub "Q2 ROADMAP"
- Card 3: title "Forward", sub "TO BEI"

**Story 3** (after screenshot of Bei's DM):
- Card 1: title "Reply", sub "TO BEI", recommended: true
- Card 2: title "Schedule", sub "SYNC MEETING"
- Card 3: title "Forward", sub "TO SOMEONE"

## 4. Input Bar

Inside the Panel container, at the bottom, full width of Panel.

- **Height**: ~60px
- **Padding**: 12px 18px
- **Top border**: 1px solid `#e2d8c2` (only when Panel has content above the input bar)
- **Background**: `#faf7ef` (same as Panel)
- **Layout**: horizontal flex, gap 12px, vertically centered

### Components left to right:

**Logo (Invoko)**
- ~24px square
- 8-pointed starburst shape, solid black `#1d1916` with the center showing a small terracotta accent dot OR the entire star in a deep terracotta `#6e2f18` — choose what looks best
- Recreate the 8-pointed star geometry shown in panel_mock_idle.png (8 radiating spokes forming a starburst with a central circle)
- If you need an SVG path approximation, use 8 elongated triangles or diamonds arranged radially around a central circle

**Input field**
- Flex 1 (fills available space)
- No border, no background
- Font: Inter Tight, 14px, color `#1d1916`
- Placeholder: "What can I help you with today?" — color `#a89c84`
- Outline: none on focus

**New Chat dropdown**
- Text "New Chat" + small `⌄` chevron icon
- Font: Inter Tight, 13px, color `#786d5b`
- Padding: 6px 10px
- Hover: background `#ede5d4`, color `#1d1916`, border radius 6px
- Clicking opens a dropdown (not implemented in Module C — placeholder behavior is fine)

**Send button**
- Square button, 36px × 36px
- Background: `#9c4a2a` (terracotta)
- Border radius: 8px
- Icon inside: white upward arrow `↑`, ~16px
- Hover: background `#6e2f18` (darker terracotta)
- Cursor: pointer

## 5. Voice Hint (below Panel)

Small text BELOW the Panel container (outside Panel, with ~12px gap):

- Text: "Press F+Space for voice"
- Font: JetBrains Mono, 11px, color `#a89c84`
- Centered horizontally below the Panel
- Letter-spacing: 0.06em

## 6. Options Frame (PanelOptions component)

Based on `docs/panel_mock_options.png`.

### Container
- Inside the Panel's conversation area
- Background: same as Panel (`#faf7ef`) — no inner card, it sits flush
- Padding: 20px 22px

### Header
- Question text: Fraunces serif, 16px, weight 400, color `#1d1916`
- Right side: pagination "< 2 of 2 >" (if multi-page) and X close icon
  - Pagination: JetBrains Mono, 11px, color `#a89c84`
  - X: 16px, color `#786d5b`, hover color `#1d1916`

### Option rows
Each row:
- Padding: 12px 0
- Border bottom: 1px solid `#e2d8c2` (last row no border)
- Layout: horizontal flex, gap 16px, vertically centered

**Number prefix**
- Rounded square, 24px × 24px
- Background: `#ede5d4`
- Border radius: 6px
- Text: "1", "2", "3" centered, JetBrains Mono, 12px, color `#786d5b`

**Option label**
- Flex 1
- Font: Inter Tight, 14px, color `#1d1916`

**Recommended indicator** (only on the recommended option)
- Small label after the option text: "RECOMMENDED" in JetBrains Mono, 9.5px, uppercase, color `#9c4a2a`, letter-spacing 0.12em
- OR: a small terracotta dot before/after the label

**Selected state**
- Background of the row: `#f5efe4` (pale cream highlight)
- Right side: small `↵` return arrow icon, color `#786d5b`

### Special "Something else" row
- Has a pencil ✎ icon as the prefix (lucide-react `Pencil`)
- Label: "Something else" in lighter gray color `#a89c84`
- Right side: "Skip" button (ghost outline pill, 13px Inter Tight, padding 6px 14px, border 1px solid `#d6cab2`, border-radius 999px)

### Behavior
- Click any option → advance to next frame with that selection
- Press number key (1, 2, 3) → select corresponding option
- Press Enter → select the recommended option
- Click "Skip" → advance with a "skipped" state (story handles what that means)

## 7. Continuing Context Banner (Story 3 only)

At the very top of the Panel, above all other content.

- Background: `#f1e3df` (accent-faint)
- Border bottom: 1px solid `rgba(156, 74, 42, 0.15)`
- Padding: 8px 18px
- Layout: horizontal flex, justify between, vertically centered

**Left content**
- Small arrow icon "↳" in terracotta `#9c4a2a`
- Text: "Continuing [task name] — from your chat with [person]"
- Font: JetBrains Mono, 11px, color `#6e2f18`

**Right side**
- Small X close icon (14px), color `#a89c84`, hover `#9c4a2a`
- Clicking X removes the banner (resets context to fresh)

## 8. Thinking Steps

Inside the conversation area of the Panel.

- Font: Inter Tight, 13px, color `#786d5b`
- Line height: 1.55
- Each line prefixed with "·" bullet in terracotta `#9c4a2a`, weight 700
- Gap between lines: 4px
- Each line fades in with 0.4s delay between (Framer Motion)
- Strong/bold parts: weight 500, color `#4d4438`

## 9. User Message Bubble

When user types and submits:
- Right-aligned
- Max width: 80% of Panel width
- Background: `#ede5d4` (cream-2)
- Border radius: 14px 14px 4px 14px (corner cut on bottom-right)
- Padding: 9px 14px
- Font: Inter Tight, 13px, color `#1d1916`

## 10. Reply Draft Card

The generated reply, with Send + Edit buttons.

### Container
- Background: `#f5efe4` (cream)
- Border: 1px solid `#e2d8c2`
- Border radius: 14px
- Padding: 18px 20px

### Body text
- Font: Inter Tight, 14px, color `#1d1916`
- Line height: 1.6
- Paragraph spacing: 8px

### Memory highlight (the gradient text)
Inline within body text, wrapping memory-pulled fields:
- Gradient: `linear-gradient(135deg, #9c4a2a 0%, #c97550 50%, #d4a373 100%)`
- Applied via `background-clip: text` + `-webkit-text-fill-color: transparent`
- Font weight: 500
- Dotted underline: `border-bottom: 1px dotted rgba(156, 74, 42, 0.3)`
- Tooltip on hover: "Pulled from your memory"

### Attachment chip
- Inline-flex pill, displayed below the body text
- Background: `#faf7ef`
- Border: 1px solid `#d6cab2`
- Border radius: 999px
- Padding: 6px 12px 6px 10px
- Icon (file type): small colored square with mono caps text "PDF" / "DOC" / "GDOC" — background terracotta, white text
- Filename: Inter Tight, 12px, color `#4d4438`

### Action buttons (right-aligned, bottom of card)
- **Send**: solid terracotta pill button
  - Background `#9c4a2a`, white text, border-radius 999px, padding 7px 18px
  - Font: Inter Tight, 13px, weight 500
  - Hover: background `#6e2f18`
- **Edit**: ghost outline pill button
  - Background transparent, color `#1d1916`, border 1px solid `#d6cab2`
  - Same padding and font as Send
  - Includes a pencil icon ✎ on the left
  - Hover: background `#ede5d4`

## 11. Calendar Confirmation Card (Story 3)

Small card shown inline in Panel conversation area.

- Background: `#faf7ef`
- Border: 1px solid `#e2d8c2`
- Border radius: 14px
- Padding: 16px 18px
- Content:
  - Small mono caps label "MEETING" or "ZOOM" in terracotta
  - Date/time line: Fraunces serif, 15px, color `#1d1916`
  - "with [person]" line: Inter Tight, 13px, color `#786d5b`
  - Topic line: Inter Tight, 13px, color `#786d5b`
- Two buttons at bottom: "Looks good" (solid terracotta) and "Adjust time" (ghost outline)

## 12. Toast Notification

Bottom-center of screen, 24px from bottom.

- Background: `#1d1916` (near-black)
- Color: `#f5efe4` (cream)
- Border radius: 12px
- Padding: 14px 18px
- Min width: 320px, max width: 520px
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.15)`
- Multi-line support: each line prefixed with `✓` in success green `#4b6849`
- Font: Inter Tight, 13px, line height 1.55
- Animation: slide up from y=20 with opacity 0→1 (250ms), auto-dismiss after 3000ms, slide down on exit

## 13. Animation Reference Library

Use Framer Motion. Standard transitions:

- **Panel enter**: `{ type: 'spring', damping: 22, stiffness: 280 }`
- **Frame transition** (between thinking → options → draft etc): `{ duration: 0.25, ease: 'easeOut' }`
- **Thinking step appear**: stagger children with `delayChildren: 0.4` per line
- **Toast enter**: `{ type: 'spring', damping: 18, stiffness: 240 }`
- **Tooltip cursor follow**: use `useMotionValue` for smooth cursor tracking with `transition: { duration: 0.05 }`
- **Screenshot flash**: opacity 0 → 1 → 0 in 200ms total (100ms in, 100ms out)

## 14. Critical Don'ts

- DO NOT use purple, neon, or sci-fi colors anywhere
- DO NOT use sparkle/glow effects
- DO NOT make the Quick Action cards dark/black — they are LIGHT cream
- DO NOT add additional buttons or icons not specified above
- DO NOT use rounded corners larger than 20px
- DO NOT use shadow heavier than what's specified — the design is restrained
