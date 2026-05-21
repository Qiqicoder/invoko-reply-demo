/**
 * Shared types for story scripts (PRD §5.5).
 *
 * Module A stubs only the types we already know we need. Concrete handler
 * shapes (onSend / onEdit / onSubmit) will likely move into a runner in
 * Module E once we know exactly how the engine dispatches actions.
 */

export interface Option {
  label: string;
  value: string;
  recommended?: boolean;
}

export interface Attachment {
  name: string;
  type: string;
}

export type Frame =
  | { type: "screenshot" }
  | { type: "thinking"; lines: string[] }
  | { type: "options"; question: string; options: Option[]; skipLabel?: string }
  | { type: "input"; prompt: string; placeholder: string }
  | { type: "draft"; body: string; attachment?: Attachment }
  | {
      type: "calendarConfirm";
      title: string;
      time: string;
      with: string;
      topic: string;
    }
  | { type: "toast"; lines: string[]; duration?: number };
