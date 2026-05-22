import { SOURCES } from "../../data/sources";

/**
 * Connected IM sources list (PRD H2). Static mock — no AppContext wiring.
 */
export function SourcesSection() {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-ink-4/20 bg-paper p-4">
      <h3 className="font-display text-[18px] font-medium text-ink">
        Sources
      </h3>
      <ul className="mt-3 flex flex-1 flex-col gap-1">
        {SOURCES.map((src) => (
          <li
            key={src.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-cream/60"
          >
            <img
              src={src.logo}
              alt=""
              className="h-7 w-7 shrink-0 rounded-md object-contain"
            />
            <span className="min-w-0 flex-1 truncate font-sans text-[13px] font-medium text-ink">
              {src.name}
            </span>
            {src.status === "connected" ? (
              <span className="shrink-0 font-sans text-[12px] font-medium text-ink-3">
                Open
              </span>
            ) : (
              <button
                type="button"
                className="shrink-0 rounded-full border border-ink-4/40 px-3 py-1 font-sans text-[12px] font-medium text-ink-2 transition hover:border-accent/40 hover:text-accent"
              >
                Connect
              </button>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-2 self-start font-sans text-[12px] font-medium text-ink-3 transition hover:text-accent"
      >
        Manage sources →
      </button>
    </section>
  );
}
