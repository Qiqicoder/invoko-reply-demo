/**
 * Fake macOS desktop background.
 *
 * Module A: just a placeholder cream gradient — enough to confirm rendering
 * works and the design tokens are wired up correctly.
 *
 * Module B will add the real menubar, traffic-light styling, and host the
 * Slack / Gmail window children.
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
      {children}
    </div>
  );
}
