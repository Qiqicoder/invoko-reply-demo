import type { Frame } from "../stories/types";

/**
 * Frame-advancement helpers (Module E).
 *
 * The Panel engine doesn't *need* these — it can compute the next frame
 * directly from `storyFrames` + `frameHistory.length`. But these helpers
 * keep the call sites readable and provide a stable place to add more
 * sophisticated playback logic (branching, delays, etc.) in later modules.
 */

/**
 * Return the frame at `currentIndex + 1` in `story`, or `null` if the story
 * has been fully played.
 */
export function nextFrame(
  currentIndex: number,
  story: Frame[],
): Frame | null {
  if (currentIndex < -1 || currentIndex >= story.length - 1) return null;
  return story[currentIndex + 1];
}

/**
 * Sequentially deliver a list of frames to `onAdvance`, with a fixed delay
 * between each. Returns a cancel function — calling it stops the schedule
 * and prevents any pending deliveries.
 *
 * Used by the thinking-step auto-advance flow: each "· …" line is its own
 * delivery so it can fade in with a stagger.
 *
 * Note: For the Panel runtime in Module E, thinking lines are part of a
 * SINGLE `thinking` frame and the stagger is handled by Framer Motion's
 * `staggerChildren`. `playFrames` is provided as the documented utility
 * (per PRD §E5) for stories that want to dispatch multiple separate frames
 * over time (e.g. Story 1 Frame 6 → revised draft after edit input).
 */
export function playFrames(
  frames: Frame[],
  onAdvance: (frame: Frame) => void,
  options: { delayMs?: number } = {},
): () => void {
  const delay = options.delayMs ?? 600;
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;

  frames.forEach((frame, i) => {
    const t = setTimeout(() => {
      if (cancelled) return;
      onAdvance(frame);
    }, delay * (i + 1));
    timers.push(t);
  });

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}
