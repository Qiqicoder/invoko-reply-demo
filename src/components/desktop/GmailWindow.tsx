import {
  Archive,
  ArrowLeft,
  Clock,
  CornerUpLeft,
  CornerUpRight,
  Forward,
  Inbox,
  Pencil,
  Reply,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { WindowChrome } from "./WindowChrome";

/**
 * Fake Gmail window (PRD §B3). Renders Sarah Liu's "Following up" email
 * already open in the reading pane. Mock UI only — nothing is interactive
 * outside the Reply Panel demo flow.
 *
 * Visual layout (rough):
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ TitleBar: Gmail header (logo, search)                        │
 *   ├────────────┬─────────────────────────────────────────────────┤
 *   │ Sidebar    │ Open email                                      │
 *   │ Compose +  │   subject, sender row, body, action buttons     │
 *   │ Inbox      │                                                 │
 *   │ Starred    │                                                 │
 *   │ ...        │                                                 │
 *   └────────────┴─────────────────────────────────────────────────┘
 */
export function GmailWindow() {
  return (
    <WindowChrome
      titleBar={<GmailHeader />}
      width={1080}
      height={680}
    >
      <Sidebar />
      <EmailReadingPane />
    </WindowChrome>
  );
}

/* ------------------------------ Header ------------------------------ */

function GmailHeader() {
  return (
    <div className="flex w-full items-center gap-4">
      <div className="flex items-center gap-2">
        <img
          src="https://cdn.simpleicons.org/gmail/EA4335"
          alt="Gmail"
          className="h-4 w-4"
        />
        <span className="font-sans text-[13px] font-semibold text-ink-2">
          Mail
        </span>
      </div>
      <div className="flex max-w-[460px] flex-1 items-center gap-2 rounded-md bg-cream/60 px-3 py-1 text-[12px] text-ink-3">
        <Search className="h-3.5 w-3.5" />
        <span>Search mail</span>
      </div>
    </div>
  );
}

/* ------------------------------ Sidebar ------------------------------ */

function Sidebar() {
  return (
    <aside
      className="flex h-full w-[200px] shrink-0 flex-col gap-1 px-3 py-4"
      style={{ borderRight: "1px solid rgba(29,25,22,0.06)" }}
    >
      <button
        type="button"
        className="mb-2 flex items-center gap-2 self-start rounded-2xl bg-[#c2e7ff] px-4 py-2 text-[13px] font-medium text-[#001d35] shadow-sm transition hover:brightness-105"
      >
        <Pencil className="h-4 w-4" />
        Compose
      </button>
      <SidebarItem icon={<Inbox className="h-4 w-4" />} active label="Inbox" count={12} />
      <SidebarItem icon={<Star className="h-4 w-4" />} label="Starred" />
      <SidebarItem icon={<Clock className="h-4 w-4" />} label="Snoozed" />
      <SidebarItem icon={<Send className="h-4 w-4" />} label="Sent" />
      <SidebarItem icon={<Pencil className="h-4 w-4" />} label="Drafts" count={3} />
      <SidebarItem icon={<Archive className="h-4 w-4" />} label="Archive" />
      <SidebarItem icon={<Trash2 className="h-4 w-4" />} label="Trash" />
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  count,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-r-full px-3 py-1.5 text-[13px] ${
        active
          ? "bg-[#fce8e6] font-semibold text-[#b3261e]"
          : "text-ink-2 hover:bg-cream/70"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {count !== undefined && (
        <span className={`text-[11px] ${active ? "text-[#b3261e]" : "text-ink-3"}`}>
          {count}
        </span>
      )}
    </div>
  );
}

/* ----------------------------- Reading Pane ----------------------------- */

function EmailReadingPane() {
  return (
    <main className="flex h-full flex-1 flex-col overflow-hidden bg-white">
      {/* Toolbar above email */}
      <div
        className="flex items-center gap-2 px-5 py-2 text-ink-3"
        style={{ borderBottom: "1px solid rgba(29,25,22,0.05)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="ml-2 inline-block h-4 w-px bg-ink-4/30" />
        <Archive className="h-4 w-4" />
        <Trash2 className="h-4 w-4" />
        <Clock className="h-4 w-4" />
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto px-10 py-6">
        <h1 className="font-display text-[24px] font-medium leading-tight text-ink">
          Following up
        </h1>
        <div className="mt-1 flex items-center gap-2 text-[12px] text-ink-3">
          <span className="rounded bg-cream-2 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink-2">
            INBOX
          </span>
        </div>

        {/* Sender row */}
        <div
          data-mock-target="sarah-email"
          className="mt-6 flex items-start gap-3"
        >
          <Avatar
            initial="S"
            color="#5d4775"
            ariaLabel="Sarah Liu avatar"
          />
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-sans text-[14px] font-semibold text-ink">
                  Sarah Liu
                </span>
                <span className="ml-2 text-[12px] text-ink-3">
                  &lt;sarah@sequoiacap.com&gt;
                </span>
              </div>
              <span className="text-[12px] text-ink-3">2:14 PM (32 min ago)</span>
            </div>
            <div className="text-[12px] text-ink-3">to me</div>

            <div className="mt-5 space-y-4 font-sans text-[14px] leading-[1.65] text-ink-2">
              <p>
                Hey Ziying — it&apos;s been a few weeks since we last chatted with
                Marcus. Curious how things have been progressing on your end.
                Would love to find time for a deeper look. Let me know when
                works.
              </p>
              <p>— Sarah</p>
            </div>

            {/* Reply/forward action row */}
            <div className="mt-8 flex items-center gap-2">
              <ActionButton icon={<Reply className="h-4 w-4" />} label="Reply" />
              <ActionButton
                icon={<CornerUpLeft className="h-4 w-4" />}
                label="Reply all"
              />
              <ActionButton
                icon={<CornerUpRight className="h-4 w-4" />}
                label="Forward"
              />
              <ActionButton
                icon={<Forward className="h-4 w-4" />}
                label="Forward as attachment"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-ink-4/30 px-3 py-1.5 text-[12px] text-ink-2 hover:bg-cream/70"
    >
      {icon}
      {label}
    </button>
  );
}

function Avatar({
  initial,
  color,
  ariaLabel,
}: {
  initial: string;
  color: string;
  ariaLabel: string;
}) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-[13px] font-semibold text-white"
      style={{ background: color }}
    >
      {initial}
    </div>
  );
}
