/**
 * Docs mock data (PRD §5.2). Module G: Story 2 adds Q2_ROADMAP_DOC via
 * `addedDocs` in AppContext; Module H merges with DOCS_DEFAULT.
 */

export type DocType = "pdf" | "docx" | "gdoc" | "pptx" | "xlsx";

export interface Doc {
  id: string;
  name: string;
  type: DocType;
  source: string;
  meta: string;
}

export const DOCS_DEFAULT: Doc[] = [
  {
    id: "pitch",
    name: "Pitch Deck v3",
    type: "pdf",
    source: "You uploaded",
    meta: "5 days ago · sent to Marcus",
  },
  {
    id: "onboarding",
    name: "Onboarding Playbook",
    type: "docx",
    source: "Shared by Luna",
    meta: "1 week ago",
  },
  {
    id: "q1budget",
    name: "Q1 Budget Overview",
    type: "xlsx",
    source: "You uploaded",
    meta: "3 weeks ago",
  },
  {
    id: "allhands",
    name: "All Hands Summary – May",
    type: "pptx",
    source: "Shared by Jing",
    meta: "1 month ago",
  },
];

/** Nick's PDF — added when Story 2 toast fires (screenshot source file). */
export const Q2_ROADMAP_DOC: Doc = {
  id: "q2roadmap",
  name: "Product Roadmap Q2 2024.pdf",
  type: "pdf",
  source: "Received from Nick",
  meta: "just now",
};

/** Docs revealed by story actions — keyed by `addedDocs` id in AppContext. */
export const ADDED_DOCS_BY_ID: Record<string, Doc> = {
  q2roadmap: Q2_ROADMAP_DOC,
};
