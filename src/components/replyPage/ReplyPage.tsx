import {
  Bookmark,
  Clock,
  Home,
  MessageSquare,
  Settings,
} from "lucide-react";
import { InvokoLogo } from "../panel/InvokoLogo";
import { DocsSection } from "./DocsSection";
import { HeroAvatar } from "./HeroAvatar";
import { PeopleSection } from "./PeopleSection";
import { SourcesSection } from "./SourcesSection";

/**
 * Main Reply page content (PRD Module H — H1 + H2).
 * Rendered inside `ReplyPageOverlay` as a windowed, scrollable layout.
 */
export function ReplyPage() {
  return (
    <div className="flex h-full max-h-[90vh] min-h-0 bg-cream">
      <ReplySidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <header
          className="flex shrink-0 items-start justify-between px-8 pb-2 pt-6"
          style={{ borderBottom: "1px solid rgba(29,25,22,0.06)" }}
        >
          <div>
            <h1 className="font-display text-[36px] font-medium leading-none text-ink">
              Reply
            </h1>
            <p className="mt-1.5 font-sans text-[14px] text-ink-3">
              Your IM memory across chats, people, and groups.
            </p>
          </div>
          <button
            type="button"
            className="font-sans text-[12px] text-ink-3 transition hover:text-ink-2"
          >
            Report
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="flex flex-col gap-5">
            <HeroAvatar />

            <div className="grid grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] gap-4">
              <SourcesSection />
              <PeopleSection />
            </div>

            <DocsSection />
          </div>
        </main>
      </div>
    </div>
  );
}

function ReplySidebar() {
  const nav = [
    { icon: <Home size={16} />, label: "Home" },
    { icon: <Clock size={16} />, label: "History" },
    { icon: <Bookmark size={16} />, label: "Collection" },
    { icon: <MessageSquare size={16} />, label: "Reply", active: true },
  ];

  return (
    <aside
      className="flex w-[200px] shrink-0 flex-col border-r border-ink-4/15 bg-paper"
    >
      {/* macOS dots */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>

      <div className="flex items-center gap-2 px-4 py-4">
        <InvokoLogo size={20} />
        <span className="font-display text-[15px] font-semibold text-ink">
          Invoko
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {nav.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-sans text-[13px] ${
              item.active
                ? "bg-accent-faint font-medium text-accent-deep"
                : "text-ink-3"
            }`}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-ink-4/15 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div
            className="h-8 w-8 shrink-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, #6b8cce 0%, #9b6bb8 50%, #c47b9a 100%)",
            }}
            aria-hidden
          />
          <span className="truncate font-sans text-[13px] font-medium text-ink">
            Ziying Qi
          </span>
          <Settings
            size={14}
            className="ml-auto shrink-0 text-ink-4"
            strokeWidth={1.8}
          />
        </div>
      </div>
    </aside>
  );
}
