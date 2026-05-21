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

export type AttachmentType = "pdf" | "docx" | "gdoc" | "pptx" | "xlsx";

export interface Attachment {
  name: string;
  type: AttachmentType;
}

/* ------------------------------ Frames ------------------------------ */

export type Frame =
  | { type: "screenshot" }
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
       * to `newBody` and (optionally) shows a transient `thinkingLine` above
       * the body for ~800ms before swapping. The Send button stays.
       */
      type: "draftUpdate";
      newBody: string;
      newAttachment?: Attachment;
      thinkingLine?: string;
    }
  | {
      type: "calendarConfirm";
      title: string;
      time: string;
      with: string;
      topic: string;
    }
  | { type: "toast"; lines: string[]; duration?: number };

/** Convenience: extract the variant matching a given type literal. */
export type FrameOf<T extends Frame["type"]> = Extract<Frame, { type: T }>;
