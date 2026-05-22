import { useMemo } from "react";
import { useApp, type SentReply, type StoryId } from "../../context/AppContext";
import { PEOPLE, type Person, type PersonRole } from "../../data/people";
import { previewText } from "../../utils/text";

const CHAT_COUNTS: Record<string, number> = {
  nick: 12,
  luna: 42,
  vendor: 8,
  bei: 31,
  jing: 19,
  mira: 24,
  sarah: 3,
};

const ROLE_LABELS: Record<PersonRole, string> = {
  boss: "BOSS",
  peer: "PEER",
  hr: "HR",
  investor: "INVESTOR",
  vendor: "VENDOR",
  team: "TEAM",
};

/** Story-driven preview overrides for latest reply / time. */
function enrichPerson(
  person: Person,
  sentReplies: Partial<Record<StoryId, SentReply>>,
): Person {
  const storyReply =
    person.id === "sarah"
      ? sentReplies[1]
      : person.id === "nick"
        ? sentReplies[2]
        : person.id === "bei"
          ? sentReplies[3]
          : undefined;

  if (!storyReply) return person;

  return {
    ...person,
    latestReply: previewText(storyReply.body, 52),
    latestTime: storyReply.sentAt,
  };
}

/**
 * People grid (PRD H2 + H3). Visibility + previews driven by AppContext:
 *   - `addedPeople` reveals Sarah after Story 1
 *   - `sentReplies` updates Nick / Bei / Sarah card previews after Send
 */
export function PeopleSection() {
  const { addedPeople, sentReplies } = useApp();

  const displayPeople = useMemo(() => {
    const visible = PEOPLE.filter(
      (p) => p.inPeopleByDefault || addedPeople.has(p.id),
    ).map((p) => enrichPerson(p, sentReplies));

    if (addedPeople.has("sarah")) {
      const sarah = visible.find((p) => p.id === "sarah");
      const rest = visible.filter((p) => p.id !== "sarah").slice(0, 5);
      return sarah ? [sarah, ...rest] : visible.slice(0, 6);
    }

    return visible.filter((p) => p.inPeopleByDefault).slice(0, 6);
  }, [addedPeople, sentReplies]);

  const totalCount = PEOPLE.filter(
    (p) => p.inPeopleByDefault || addedPeople.has(p.id),
  ).length;

  const seeAllCount = Math.max(12, totalCount + 5);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-ink-4/20 bg-paper p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-[18px] font-medium text-ink">
          People
        </h3>
        <button
          type="button"
          className="shrink-0 font-sans text-[12px] font-medium text-ink-3 transition hover:text-accent"
        >
          See all ({seeAllCount}) →
        </button>
      </div>

      <div className="mt-3 grid flex-1 grid-cols-2 gap-2.5">
        {displayPeople.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    </section>
  );
}

function PersonCard({ person }: { person: Person }) {
  const chats = CHAT_COUNTS[person.id] ?? 10;

  return (
    <article
      className="flex flex-col rounded-xl border border-ink-4/20 bg-cream/40 px-3 py-2.5 transition hover:border-accent/25 hover:bg-cream/70"
      style={{ minHeight: 108 }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-[13px] font-semibold text-white"
          style={{ background: person.color }}
        >
          {person.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-1">
            <span className="truncate font-sans text-[13px] font-semibold text-ink">
              {person.name}
            </span>
            <span className="shrink-0 font-sans text-[10px] text-ink-3">
              {person.latestTime}
            </span>
          </div>
          <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-ink-3">
            {ROLE_LABELS[person.role]}
          </span>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 font-sans text-[11px] leading-snug text-ink-3">
        {person.latestReply}
      </p>
      <p className="mt-auto pt-2 font-sans text-[10px] text-ink-4">
        {chats} chats
      </p>
    </article>
  );
}
