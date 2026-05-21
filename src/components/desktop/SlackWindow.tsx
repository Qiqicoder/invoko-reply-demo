import {
  AtSign,
  Bell,
  Bookmark,
  ChevronDown,
  Hash,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Smile,
  Bot,
} from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { useApp, type SentReply } from "../../context/AppContext";
import { WindowChrome } from "./WindowChrome";

export type SlackView = "nickChannel" | "beiDM";

/**
 * Fake Slack window (PRD §B2).
 *
 *   view="nickChannel" — shows #design with Nick's Q2 roadmap message (Story 2)
 *   view="beiDM"       — shows Bei Chen DM thread with casual hiking chat (Story 3)
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ TitleBar: workspace switcher etc.                            │
 *   ├──────┬─────────────────────┬─────────────────────────────────┤
 *   │ Rail │ Channels / DMs      │ Conversation                    │
 *   │ (W)  │ sidebar             │ (header + messages + composer)  │
 *   └──────┴─────────────────────┴─────────────────────────────────┘
 */
export function SlackWindow({ view = "nickChannel" }: { view?: SlackView }) {
  return (
    <WindowChrome titleBar={<SlackTitleBar view={view} />} width={1080} height={680}>
      <WorkspaceRail />
      <ChannelSidebar view={view} />
      {view === "nickChannel" ? <NickChannelPane /> : <BeiDmPane />}
    </WindowChrome>
  );
}

/* ---------------------------- TitleBar ---------------------------- */

function SlackTitleBar({ view }: { view: SlackView }) {
  const label =
    view === "nickChannel" ? "Invoko · #design" : "Invoko · Bei Chen";
  return (
    <div className="flex w-full items-center gap-3">
      <img
        src="https://cdn.simpleicons.org/slack/4A154B"
        alt="Slack"
        className="h-3.5 w-3.5"
      />
      <span className="font-sans text-[12px] font-semibold text-ink-2">
        {label}
      </span>
      <div className="ml-auto flex max-w-[420px] flex-1 items-center gap-2 rounded-md bg-cream/60 px-3 py-1 text-[12px] text-ink-3">
        <Search className="h-3.5 w-3.5" />
        <span>Search Invoko</span>
      </div>
    </div>
  );
}

/* ------------------------- Left workspace rail ------------------------ */

function WorkspaceRail() {
  // Slack's far-left workspace rail (purple square + workspace icons).
  return (
    <div
      className="flex h-full w-[58px] shrink-0 flex-col items-center gap-3 py-4 text-white"
      style={{ background: "#3f0e40" }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 font-display text-[16px] font-bold text-[#3f0e40]">
        I
      </div>
      <RailIcon icon={<MessageSquare className="h-4 w-4" />} active label="DMs" />
      <RailIcon icon={<AtSign className="h-4 w-4" />} label="Mentions" />
      <RailIcon icon={<Bookmark className="h-4 w-4" />} label="Saved" />
      <RailIcon icon={<Bell className="h-4 w-4" />} label="Activity" />
    </div>
  );
}

function RailIcon({
  icon,
  active,
  label,
}: {
  icon: React.ReactNode;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
        active ? "bg-white/15" : "text-white/70 hover:bg-white/10"
      }`}
    >
      {icon}
    </button>
  );
}

/* --------------------------- Channel sidebar -------------------------- */

function ChannelSidebar({ view }: { view: SlackView }) {
  return (
    <aside
      className="flex h-full w-[240px] shrink-0 flex-col gap-1 px-2 py-3 text-[13px] text-white/90"
      style={{ background: "#3f0e40" }}
    >
      <div className="flex items-center justify-between px-3 py-1 text-white">
        <span className="font-display text-[15px] font-bold">Invoko</span>
        <Pencil />
      </div>

      <SidebarSection title="Channels">
        <ChannelItem name="design" active={view === "nickChannel"} unread />
        <ChannelItem name="general" />
        <ChannelItem name="eng" />
        <ChannelItem name="random" />
      </SidebarSection>

      <SidebarSection title="Direct messages">
        <DmItem name="Bei Chen" initial="B" color="#3d5673" active={view === "beiDM"} />
        <DmItem name="Nick" initial="N" color="#7a3537" />
        <DmItem name="Luna" initial="L" color="#a89c84" />
        <DmItem name="Marcus Wei" initial="M" color="#5d4775" />
      </SidebarSection>
    </aside>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 flex flex-col gap-[2px]">
      <div className="flex items-center justify-between px-3 py-1 text-[11px] uppercase tracking-wider text-white/55">
        <span className="flex items-center gap-1">
          <ChevronDown className="h-3 w-3" />
          {title}
        </span>
        <Plus className="h-3 w-3" />
      </div>
      {children}
    </div>
  );
}

function ChannelItem({
  name,
  active,
  unread,
}: {
  name: string;
  active?: boolean;
  unread?: boolean;
}) {
  return (
    <div
      className={`mx-1 flex items-center gap-2 rounded px-2 py-1 ${
        active ? "bg-[#1164a3] text-white" : "text-white/75 hover:bg-white/5"
      } ${unread && !active ? "font-semibold text-white" : ""}`}
    >
      <Hash className="h-3.5 w-3.5 opacity-80" />
      <span>{name}</span>
    </div>
  );
}

function DmItem({
  name,
  initial,
  color,
  active,
}: {
  name: string;
  initial: string;
  color: string;
  active?: boolean;
}) {
  return (
    <div
      className={`mx-1 flex items-center gap-2 rounded px-2 py-1 ${
        active ? "bg-[#1164a3] text-white" : "text-white/75 hover:bg-white/5"
      }`}
    >
      <span
        className="flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold text-white"
        style={{ background: color }}
      >
        {initial}
      </span>
      <span>{name}</span>
      <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
    </div>
  );
}

function Pencil() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" />
    </svg>
  );
}

/* ---------------------------- Nick channel ---------------------------- */

function NickChannelPane() {
  const { sentReplies } = useApp();
  const story2Reply = sentReplies[2];

  return (
    <main className="flex h-full flex-1 flex-col bg-white">
      <ChannelHeader
        title="design"
        meta="38 members · Channel for product + design"
        kind="channel"
      />
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <DayDivider label="Today" />

        {/* Earlier message for visual density */}
        <Message
          name="Luna"
          color="#a89c84"
          time="9:41 AM"
          body="Morning team — quick reminder that the design review is Thursday 4pm."
        />

        {/* Nick's message — Module D snap target */}
        <div data-mock-target="nick-message">
          <Message
            name="Nick"
            color="#7a3537"
            time="2:34 PM"
            body={
              <>
                Hey — need you to take a look at the Q2 roadmap and give me
                your thoughts by EOW. I&apos;ll loop in Bei for coordination on
                the changes.
              </>
            }
            attachment={{
              name: "Product Roadmap Q2 2024.pdf",
              meta: "PDF · 14 pages",
            }}
          />
        </div>

        {story2Reply && <SentSlackReply reply={story2Reply} />}
      </div>
      <Composer placeholder="Message #design" />
    </main>
  );
}

/* ------------------------------- Bei DM ------------------------------- */

function BeiDmPane() {
  const { sentReplies } = useApp();
  const story3Reply = sentReplies[3];

  return (
    <main className="flex h-full flex-1 flex-col bg-white">
      <ChannelHeader title="Bei Chen" meta="Design · Active now" kind="dm" />
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <DayDivider label="Last Friday" />
        <div data-mock-target="bei-dm">
          <Message
            name="Bei"
            color="#3d5673"
            time="3:12 PM"
            body="yo did u end up doing that hike on saturday?"
          />
          <Message
            name="You"
            color="#9c4a2a"
            time="3:48 PM"
            body="ya it was perfect lol"
            isMe
          />
          <Message
            name="Bei"
            color="#3d5673"
            time="3:50 PM"
            body="sick lmk next time, down to join"
          />
        </div>

        {story3Reply && <SentSlackReply reply={story3Reply} />}
      </div>
      <Composer placeholder="Message Bei Chen" />
    </main>
  );
}

/* ------------------------------ Shared ------------------------------ */

function ChannelHeader({
  title,
  meta,
  kind,
}: {
  title: string;
  meta: string;
  kind: "channel" | "dm";
}) {
  return (
    <div
      className="flex items-center justify-between px-6 py-3"
      style={{ borderBottom: "1px solid rgba(29,25,22,0.07)" }}
    >
      <div className="flex items-center gap-2">
        {kind === "channel" ? (
          <Hash className="h-4 w-4 text-ink-3" />
        ) : (
          <span
            className="flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold text-white"
            style={{ background: "#3d5673" }}
          >
            B
          </span>
        )}
        <span className="font-sans text-[14px] font-semibold text-ink">
          {title}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
      </div>
      <span className="text-[12px] text-ink-3">{meta}</span>
    </div>
  );
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="my-3 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-3">
      <div className="h-px flex-1 bg-ink-4/25" />
      <span className="rounded-full border border-ink-4/30 bg-white px-3 py-0.5">
        {label}
      </span>
      <div className="h-px flex-1 bg-ink-4/25" />
    </div>
  );
}

function Message({
  name,
  color,
  time,
  body,
  attachment,
  isMe,
}: {
  name: string;
  color: string;
  time: string;
  body: React.ReactNode;
  attachment?: { name: string; meta: string };
  isMe?: boolean;
}) {
  return (
    <div className="group mt-3 flex items-start gap-3 rounded px-2 py-1 hover:bg-cream/40">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-sans text-[13px] font-semibold text-white"
        style={{ background: color }}
      >
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-[14px] font-semibold text-ink">
            {name}
          </span>
          {isMe && (
            <span className="text-[10px] uppercase tracking-wider text-ink-3">
              you
            </span>
          )}
          <span className="text-[11px] text-ink-3">{time}</span>
        </div>
        <div className="mt-0.5 font-sans text-[14px] leading-[1.55] text-ink-2">
          {body}
        </div>
        {attachment && (
          <div
            className="mt-2 flex max-w-[360px] items-center gap-3 rounded-md border border-ink-4/30 bg-cream/30 px-3 py-2"
          >
            <PdfIcon />
            <div className="flex-1 leading-tight">
              <div className="text-[13px] font-medium text-ink">
                {attachment.name}
              </div>
              <div className="text-[11px] text-ink-3">{attachment.meta}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Composer({ placeholder }: { placeholder: string }) {
  return (
    <div
      className="m-4 rounded-md px-3 py-2"
      style={{ border: "1px solid rgba(29,25,22,0.18)" }}
    >
      <div className="flex items-center gap-3 text-ink-3">
        <Bot className="h-4 w-4" />
        <input
          type="text"
          placeholder={placeholder}
          disabled
          className="flex-1 bg-transparent text-[13px] text-ink-2 placeholder:text-ink-3/80 focus:outline-none"
        />
        <Paperclip className="h-4 w-4" />
        <Smile className="h-4 w-4" />
      </div>
    </div>
  );
}

function PdfIcon() {
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-md text-[10px] font-bold text-white"
      style={{ background: "#b3261e" }}
    >
      PDF
    </div>
  );
}

/* ------------------------ Sent reply (Module G) ------------------------ *
 * Mirrors GmailWindow's sentReplies pattern: after Send → toast, the
 * merged draft is snapshotted in AppContext and rendered below the
 * thread anchor message. Slack uses a circular "Z" avatar (cream on
 * terracotta) to match the demo user's identity.
 * --------------------------------------------------------------------- */

function SentSlackReply({ reply }: { reply: SentReply }) {
  return (
    <div className="group mt-3 flex items-start gap-3 rounded px-2 py-1">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-[13px] font-semibold"
        style={{ background: "#9c4a2a", color: "#faf7ef" }}
        aria-label="You (Ziying) avatar"
      >
        Z
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-[14px] font-semibold text-ink">
            You
          </span>
          <span className="text-[11px] text-ink-3">{reply.sentAt}</span>
        </div>
        <div className="mt-0.5 font-sans text-[14px] leading-[1.55] text-ink-2">
          {renderSentBody(reply.body)}
        </div>
        {reply.attachment && (
          <div
            className="mt-2 flex max-w-[360px] items-center gap-3 rounded-md border border-ink-4/30 bg-cream/30 px-3 py-2"
          >
            {reply.attachment.type === "zoom" ? (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-md text-[10px] font-bold text-white"
                style={{ background: "#9c4a2a" }}
              >
                ZOOM
              </div>
            ) : (
              <PdfIcon />
            )}
            <div className="flex-1 leading-tight">
              <div className="text-[13px] font-medium text-ink">
                {reply.attachment.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Strip `[mem: …]` to plain text for the sent message bubble. */
function renderSentBody(body: string): ReactNode {
  const stripped = body.replace(/\[mem:\s*([^\]]+)\]/g, "$1");
  const paragraphs = stripped.split(/\n\n+/).map((p) => p.trim());
  if (paragraphs.length <= 1) {
    return <p className="m-0">{stripped.trim()}</p>;
  }
  return paragraphs.map((p, i) => (
    <Fragment key={i}>
      <p className="m-0" style={{ marginTop: i === 0 ? 0 : 8 }}>
        {p}
      </p>
    </Fragment>
  ));
}
