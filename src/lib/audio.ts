/**
 * Shutter sound trigger (PRD §D3).
 *
 * For now this is a placeholder that just logs to the console. When the
 * real shutter clip is dropped into `public/sounds/shutter.mp3`, replace
 * the body with the commented-out playback code below.
 */
export function playShutterSound(): void {
  console.log("shutter sound");

  // TODO: drop a free .mp3 (~0.3s) into /public/sounds/shutter.mp3 and
  // enable the real playback path below.
  //
  // const audio = new Audio("/sounds/shutter.mp3");
  // audio.volume = 0.55;
  // // Browsers throw on play() if the page hasn't been interacted with yet.
  // // We silently ignore that — the visual flash is the primary feedback.
  // audio.play().catch(() => {});
}
