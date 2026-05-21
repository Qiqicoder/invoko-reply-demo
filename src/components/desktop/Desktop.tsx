import { useEffect, useState } from "react";
import { Battery, Search, Wifi } from "lucide-react";
import { useApp } from "../../context/AppContext";

/**
 * Fake macOS desktop background (PRD §B1).
 *
 * Provides:
 *   - Cream gradient backdrop
 *   - Top menubar (~28px) with Apple logo, adaptive app name, and right-side
 *     control-center icons + live clock
 *   - Slot for the active window (Gmail/Slack) passed in as children
 */
export function Desktop({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-2) 100%)",
      }}
    >
      <Menubar />
      {/* Window stage: sits below the menubar, fills remaining space. */}
      <div className="absolute inset-x-0 bottom-0 top-7 flex items-start justify-center px-12 pt-10">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------ Menubar ------------------------------ */

function Menubar() {
  const { currentStory } = useApp();
  const appName = activeAppName(currentStory);

  return (
    <div
      className="absolute inset-x-0 top-0 z-30 flex h-7 items-center justify-between bg-paper/70 px-3 text-[12px] text-ink-2 backdrop-blur"
      style={{
        borderBottom: "1px solid rgba(29,25,22,0.06)",
      }}
    >
      {/* Left cluster */}
      <div className="flex items-center gap-4">
        <AppleLogo />
        <span className="font-sans font-semibold text-ink">{appName}</span>
        <MenubarItem>File</MenubarItem>
        <MenubarItem>Edit</MenubarItem>
        <MenubarItem>View</MenubarItem>
        <MenubarItem>Window</MenubarItem>
        <MenubarItem>Help</MenubarItem>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3 text-ink-2">
        <Battery className="h-3.5 w-3.5" strokeWidth={1.5} />
        <Wifi className="h-3.5 w-3.5" strokeWidth={1.5} />
        <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
        <ControlCenterIcon />
        <Clock />
      </div>
    </div>
  );
}

function MenubarItem({ children }: { children: React.ReactNode }) {
  return <span className="cursor-default font-sans text-ink-2">{children}</span>;
}

/** Adaptive app name in the menubar based on which story (window) is active. */
function activeAppName(currentStory: 1 | 2 | 3 | null): string {
  if (currentStory === 1) return "Mail";
  if (currentStory === 2 || currentStory === 3) return "Slack";
  return "Finder";
}

/* ------------------------------- Apple ------------------------------- */

function AppleLogo() {
  // Small monochrome Apple glyph for the menubar. Inline so we have full
  // control over color via currentColor.
  return (
    <svg
      viewBox="0 0 14 16"
      className="h-3.5 w-3.5 text-ink"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10.18 8.5c-.02-2.04 1.66-3.02 1.74-3.07-.95-1.39-2.43-1.58-2.96-1.6-1.26-.13-2.46.74-3.1.74-.65 0-1.63-.72-2.69-.7-1.38.02-2.66.8-3.37 2.03C-1.66 8.48-.42 12.13.99 14.13c.69.98 1.51 2.07 2.59 2.03 1.04-.04 1.43-.67 2.69-.67 1.26 0 1.61.67 2.71.65 1.12-.02 1.83-.99 2.51-1.98.79-1.13 1.12-2.23 1.14-2.29-.02-.01-2.19-.84-2.21-3.33zM8.18 2.51c.57-.69.96-1.65.85-2.61-.83.03-1.83.55-2.42 1.24-.53.61-1 1.59-.87 2.53.92.07 1.87-.47 2.44-1.16z" />
    </svg>
  );
}

function ControlCenterIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 text-ink-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="2" y="2.5" width="12" height="5" rx="2.5" />
      <rect x="2" y="8.5" width="12" height="5" rx="2.5" />
      <circle cx="11" cy="5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="5" cy="11" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ------------------------------- Clock ------------------------------- */

function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const dayLabel = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = now
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
    .replace(/\s?(AM|PM)/i, (m) => m.toUpperCase());

  return (
    <span className="ml-1 font-sans tabular-nums text-ink-2">
      {dayLabel}&nbsp;&nbsp;{timeLabel}
    </span>
  );
}
