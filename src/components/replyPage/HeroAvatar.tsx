import {
  Ban,
  Globe,
  MessageSquare,
  Smile,
  Sparkles,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { VOICE } from "../../data/voice";

const TRAIT_ICONS: Record<string, ReactNode> = {
  brief: <MessageSquare size={12} strokeWidth={2} />,
  direct: <User size={12} strokeWidth={2} />,
  bilingual: <Globe size={12} strokeWidth={2} />,
  hey: <Sparkles size={12} strokeWidth={2} />,
  "no-signoffs": <Ban size={12} strokeWidth={2} />,
  emoji: <Smile size={12} strokeWidth={2} />,
};

/** Floating pill positions around the mascot (percent within hero graphic). */
const TRAIT_POSITIONS: Record<string, { top: string; left: string }> = {
  brief: { top: "8%", left: "6%" },
  direct: { top: "18%", left: "62%" },
  bilingual: { top: "42%", left: "2%" },
  hey: { top: "58%", left: "68%" },
  "no-signoffs": { top: "72%", left: "12%" },
  emoji: { top: "78%", left: "52%" },
};

/**
 * ReplyDNA hero — peach mascot + floating trait pills + CTA (PRD H2 + H6).
 */
export function HeroAvatar() {
  return (
    <section
      className="flex gap-8 rounded-2xl border border-ink-4/20 bg-paper px-6 py-5"
      style={{ boxShadow: "0 1px 3px rgba(29,25,22,0.04)" }}
    >
      {/* Mascot + trait pills */}
      <div className="relative h-[200px] w-[280px] shrink-0">
        <div
          className="absolute left-1/2 top-1/2 h-[120px] w-[130px] -translate-x-1/2 -translate-y-[45%]"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 35% 30%, #f8d4c4 0%, #e8a88a 45%, #d4896f 100%)",
            borderRadius: "48% 52% 55% 45% / 52% 48% 52% 48%",
            boxShadow:
              "inset -8px -12px 24px rgba(180,90,60,0.25), 0 12px 32px rgba(156,74,42,0.12)",
          }}
          aria-hidden
        >
          {/* Sleeping face */}
          <div className="absolute left-[28%] top-[38%] h-2 w-7 rounded-full bg-[#c47555]/50" />
          <div className="absolute right-[28%] top-[38%] h-2 w-7 rounded-full bg-[#c47555]/50" />
          <div className="absolute bottom-[32%] left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-[#c47555]/35" />
        </div>

        {VOICE.traits.map((trait) => {
          const pos = TRAIT_POSITIONS[trait.id];
          if (!pos) return null;
          return (
            <div
              key={trait.id}
              className="absolute flex items-center gap-1.5 rounded-full border border-ink-4/25 bg-white px-2.5 py-1 shadow-sm"
              style={{ top: pos.top, left: pos.left }}
            >
              <span className="text-accent">{TRAIT_ICONS[trait.id]}</span>
              <span className="font-sans text-[11px] font-medium text-ink-2">
                {trait.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Copy + CTA */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h2 className="font-display text-[32px] font-medium leading-tight text-ink">
          The voice replying as you.
        </h2>
        <button
          type="button"
          className="mt-5 w-fit rounded-full bg-ink px-5 py-2.5 font-sans text-[13px] font-medium text-paper transition hover:bg-ink-2"
          onClick={() => {
            /* PRD H6 — aspirational only */
          }}
        >
          Customize this voice →
        </button>
        <p className="mt-4 font-sans text-[13px] text-ink-3">
          Trained on{" "}
          <span className="font-medium text-ink-2">
            {VOICE.trainedOn.toLocaleString()}
          </span>{" "}
          messages
        </p>
      </div>
    </section>
  );
}
