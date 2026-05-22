/**
 * Voice / ReplyDNA mock data (PRD §5.4).
 */

export interface VoiceTrait {
  id: string;
  label: string;
}

export const VOICE = {
  trainedOn: 1234,
  traits: [
    { id: "brief", label: "brief" },
    { id: "direct", label: "direct" },
    { id: "bilingual", label: "mixes EN / 中文" },
    { id: "hey", label: 'opens with "Hey"' },
    { id: "no-signoffs", label: "no sign-offs" },
    { id: "emoji", label: "emoji only if matched" },
  ] satisfies VoiceTrait[],
  selfIntro: "product designer focused on AI tools",
  currentProgress: "in early beta with ~50 active users",
  launchTimeline: "public launch end of Q3",
};
