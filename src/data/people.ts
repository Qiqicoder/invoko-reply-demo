/**
 * People mock data (PRD §5.1).
 *
 * Each person has an `inPeopleByDefault` flag. Sarah Liu starts with
 * `false` — she's added to People at the end of Story 1 (PRD §F7). Module
 * H's ReplyPage will read both the static list and the `addedPeople` set
 * in AppContext to decide who to render.
 */

export type PersonRole =
  | "boss"
  | "peer"
  | "hr"
  | "investor"
  | "vendor"
  | "team";

export interface Person {
  id: string;
  name: string;
  role: PersonRole;
  company: string;
  /** Single-letter avatar initial. */
  initial: string;
  /** Avatar background color (muted, matches mockup palette). */
  color: string;
  latestReply: string;
  latestTime: string;
  /** False = revealed dynamically by a story action. */
  inPeopleByDefault: boolean;
}

export const PEOPLE: Person[] = [
  {
    id: "nick",
    name: "Nick",
    role: "boss",
    company: "Internal",
    initial: "N",
    color: "#7a3537",
    latestReply: "Sure, I can take a pass after the vendor…",
    latestTime: "2h ago",
    inPeopleByDefault: true,
  },
  {
    id: "bei",
    name: "Bei",
    role: "peer",
    company: "Design team",
    initial: "B",
    color: "#3d5673",
    latestReply: "sick lmk next time, down to join",
    latestTime: "5d ago",
    inPeopleByDefault: true,
  },
  {
    id: "luna",
    name: "Luna",
    role: "hr",
    company: "Internal",
    initial: "L",
    color: "#a89c84",
    latestReply: "Thanks! I'll review this today.",
    latestTime: "4h ago",
    inPeopleByDefault: true,
  },
  {
    id: "vendor",
    name: "Vendor team",
    role: "vendor",
    company: "Supplier",
    initial: "V",
    color: "#5e6b58",
    latestReply: "We can confirm by Friday — sending PO shortly.",
    latestTime: "Yesterday",
    inPeopleByDefault: true,
  },
  {
    id: "jing",
    name: "Jing",
    role: "team",
    company: "Operations",
    initial: "J",
    color: "#7d6135",
    latestReply: "Looped Mira in — she has more context.",
    latestTime: "2d ago",
    inPeopleByDefault: true,
  },
  {
    id: "mira",
    name: "Mira",
    role: "team",
    company: "Engineering",
    initial: "M",
    color: "#5d4775",
    latestReply: "Pushing the fix tonight, will tag you when live.",
    latestTime: "3d ago",
    inPeopleByDefault: true,
  },
  {
    id: "sarah",
    name: "Sarah Liu",
    role: "investor",
    company: "Sequoia",
    initial: "S",
    color: "#4f5e7a",
    latestReply: "Hey Sarah — good to hear from you…",
    latestTime: "just now",
    // PRD §F7: revealed at the end of Story 1.
    inPeopleByDefault: false,
  },
];

/** Lookup helper — module-local + cheap; called from a handful of places. */
export function findPerson(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}
