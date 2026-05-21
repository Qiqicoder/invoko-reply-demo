import type { ReactNode } from "react";

/**
 * Shared macOS-style window chrome (traffic lights + optional title bar).
 * Used by both SlackWindow and GmailWindow so the look stays consistent.
 *
 * The child is rendered immediately below the title bar with no extra padding;
 * each window can decide its own internal layout (sidebar, etc.).
 */
export function WindowChrome({
  titleBar,
  children,
  width = 1040,
  height = 660,
}: {
  /** Custom title-bar content (rendered to the right of the traffic lights). */
  titleBar?: ReactNode;
  children: ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white shadow-[0_30px_60px_-20px_rgba(29,25,22,0.35),0_8px_20px_-8px_rgba(29,25,22,0.18)]"
      style={{
        width,
        height,
        border: "1px solid rgba(29,25,22,0.08)",
      }}
    >
      <TitleBar>{titleBar}</TitleBar>
      <div className="absolute inset-x-0 bottom-0 top-9 flex">{children}</div>
    </div>
  );
}

function TitleBar({ children }: { children?: ReactNode }) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-10 flex h-9 items-center gap-2 px-3"
      style={{
        background: "linear-gradient(180deg, #f7f6f3 0%, #efece6 100%)",
        borderBottom: "1px solid rgba(29,25,22,0.07)",
      }}
    >
      <TrafficLights />
      <div className="ml-1 flex flex-1 items-center text-[12px] text-ink-3">
        {children}
      </div>
    </div>
  );
}

function TrafficLights() {
  return (
    <div className="flex items-center gap-[6px]">
      <span
        className="block h-[12px] w-[12px] rounded-full"
        style={{
          background: "#ff5f57",
          boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.18)",
        }}
      />
      <span
        className="block h-[12px] w-[12px] rounded-full"
        style={{
          background: "#febc2e",
          boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.18)",
        }}
      />
      <span
        className="block h-[12px] w-[12px] rounded-full"
        style={{
          background: "#28c840",
          boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.18)",
        }}
      />
    </div>
  );
}
