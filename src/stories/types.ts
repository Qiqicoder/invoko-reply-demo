/**
 * Shared types for story scripts (PRD §5.5 + PRD_visual_updates.md).
 *
 * The Frame type is a discriminated union — each story is a `Frame[]` and
 * the Panel runtime (Module E) renders frames by switching on `type`.
 *
 * Frame types:
 *   - screenshot       : trigger Module D's ScreenshotOverlay (no inline UI)
 *   - quickActions     : 3 action cards above input bar (visual spec §3)
 *   - thinking         : list of "· step" lines that fade in with stagger
 *   - options          : "What should I include?" picker (visual spec §6)
 *   - input            : free-text input prompt (used for Edit / clarifying Q)
 *   - draft            : reply draft card with body + attachment + Send/Edit
 *   - continuingContext: Story 3 banner (persists through screenshot; PRD §7)
 *   - calendarConfirm  : inline meeting confirmation card
 *   - toast            : bottom-center notification, auto-dismisses
 */

/* ----------------------------- Sub-types ----------------------------- */

export interface QuickAction {
  title: string;
  /** Short uppercase subtitle (e.g. "TO SARAH LIU"). */
  sub: string;
  recommended?: boolean;
}

export interface OptionItem {
  label: string;
  recommended?: boolean;
}

export type AttachmentType =
  | "pdf"
  | "docx"
  | "gdoc"
  | "pptx"
  | "xlsx"
  | "zoom";

export interface Attachment {
  name: string;
  type: AttachmentType;
}

/* ------------------------------ Frames ------------------------------ */

export type Frame =
  | { type: "screenshot" }
  | {
      /**
       * Continuing-context banner (PRD §4.3 + visual spec §7). Shown at the
       * top of the Panel; auto-advances to the next frame (typically
       * screenshot) while the banner stays visible via frameHistory.
       */
      type: "continuingContext";
      /** Task name, e.g. "Q2 Roadmap follow-up from Nick". */
      label: string;
    }
  | { type: "quickActions"; actions: QuickAction[] }
  | { type: "thinking"; lines: string[] }
  | {
      type: "options";
      question: string;
      options: OptionItem[];
      skipLabel?: string;
    }
  | { type: "input"; prompt: string; placeholder: string }
  | { type: "userMessage"; text: string }
  | { type: "draft"; body: string; attachment?: Attachment }
  | {
      /**
       * In-place revision of the most recent `draft` frame. The Panel keeps
       * the existing draft card mounted; PanelDraft animates its body text
       * to `newBody` and (optionally) shows transient `thinkingLines` above
       * the body before swapping. The Send button stays.
       *
       * Timing (PanelDraft owns the choreography):
       *   - Lines stagger in at 1500ms intervals (matches thinking frame)
       *   - 800ms pause after the LAST line finishes entering
       *   - Body swaps (cross-fade ~220ms)
       *   - Lines persist ~600ms post-swap, then fade out together —
       *     leaves only the new body visible
       */
      type: "draftUpdate";
      newBody: string;
      newAttachment?: Attachment;
      thinkingLines?: string[];
    }
  | {
      type: "calendarConfirm";
      title: string;
      time: string;
      with: string;
      topic: string;
    }
  | ToastFrame;

/* ------------------------------- Toast ------------------------------- *
 * Two shapes — kept as a union so simple "✓ line / ✓ line" toasts and the
 * richer "MEMORY UPDATED" memory-summary card (Module F fix 3) both
 * compile against `Frame`. PanelToast branches at render time on whether
 * `items` is present.
 *
 *   Simple:  { type: 'toast', lines: ['Sent', 'Saved', ...] }
 *   Memory:  { type: 'toast', header: 'MEMORY UPDATED',
 *               items: [{ primary, secondary }, ...] }
 *
 * `duration` controls dwell time before the exit animation starts.
 * --------------------------------------------------------------------- */

export interface ToastMemoryItem {
  /** Bold primary line (Inter Tight ~13.5px). */
  primary: string;
  /** Soft secondary line (JetBrains Mono ~11.5px). */
  secondary: string;
}

export type ToastFrame =
  | {
      type: "toast";
      /** Simple-mode body. */
      lines: string[];
      duration?: number;
    }
  | {
      type: "toast";
      /** Mono caps header (e.g. "MEMORY UPDATED"). */
      header: string;
      /** Memory items rendered with a staggered ✓ scale-in. */
      items: ToastMemoryItem[];
      duration?: number;
    };

/** Convenience: extract the variant matching a given type literal. */
export type FrameOf<T extends Frame["type"]> = Extract<Frame, { type: T }>;
