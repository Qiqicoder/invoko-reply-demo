import { Upload } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "../../context/AppContext";
import {
  ADDED_DOCS_BY_ID,
  DOCS_DEFAULT,
  type Doc,
  type DocType,
} from "../../data/docs";

const DOC_TYPE_STYLES: Record<
  DocType,
  { label: string; bg: string }
> = {
  pdf: { label: "PDF", bg: "#b3261e" },
  docx: { label: "DOC", bg: "#2b579a" },
  gdoc: { label: "GDOC", bg: "#4285f4" },
  pptx: { label: "PPT", bg: "#d24726" },
  xlsx: { label: "XLS", bg: "#217346" },
};

/**
 * Docs list + upload placeholder (PRD H2 + H3).
 * Merges `DOCS_DEFAULT` with docs revealed via `addedDocs` (Q2 roadmap after Story 2).
 */
export function DocsSection() {
  const { addedDocs } = useApp();

  const docs = useMemo(() => {
    // Added docs first (newest on top), then defaults in PRD order.
    const added = [...addedDocs]
      .map((id) => ADDED_DOCS_BY_ID[id])
      .filter((d): d is Doc => d != null);
    const defaults = DOCS_DEFAULT.filter((d) => !addedDocs.has(d.id));
    return [...added, ...defaults];
  }, [addedDocs]);

  return (
    <div className="grid grid-cols-[1fr_minmax(200px,0.42fr)] gap-4">
      <section className="rounded-2xl border border-ink-4/20 bg-paper p-4">
        <h3 className="font-display text-[18px] font-medium text-ink">Docs</h3>
        <ul className="mt-3 divide-y divide-ink-4/15">
          {docs.map((doc) => (
            <DocRow key={doc.id} doc={doc} isNew={addedDocs.has(doc.id)} />
          ))}
        </ul>
        <button
          type="button"
          className="mt-3 font-sans text-[12px] font-medium text-ink-3 transition hover:text-accent"
        >
          View all docs →
        </button>
      </section>

      <section
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-4/35 bg-cream/30 px-4 py-8 text-center"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-2 text-ink-3">
          <Upload size={18} strokeWidth={1.8} />
        </div>
        <p className="mt-3 font-sans text-[14px] font-medium text-ink">
          Add document
        </p>
        <p className="mt-1 font-sans text-[12px] text-ink-3">
          Drag &amp; drop or click to upload
        </p>
      </section>
    </div>
  );
}

function DocRow({ doc, isNew }: { doc: Doc; isNew: boolean }) {
  const style = DOC_TYPE_STYLES[doc.type];

  return (
    <li className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-[9px] font-bold text-white"
        style={{ background: style.bg }}
      >
        {style.label}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-sans text-[13px] font-medium text-ink">
          {doc.name}
        </div>
        <div className="truncate font-sans text-[11px] text-ink-3">
          {doc.source}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className={`font-sans text-[11px] ${isNew ? "font-medium text-accent" : "text-ink-3"}`}
        >
          {doc.meta.split(" · ")[0]}
        </div>
        {doc.meta.includes(" · ") && (
          <div className="font-sans text-[10px] text-ink-4">
            {doc.meta.split(" · ").slice(1).join(" · ")}
          </div>
        )}
      </div>
    </li>
  );
}
