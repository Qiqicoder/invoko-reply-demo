import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { playShutterSound } from "../../lib/audio";

/**
 * Screenshot drag overlay (PRD §D1–D6 + visual spec §2).
 *
 * Layers on top of the desktop while in screenshot mode (no dim backdrop —
 * the desktop stays at full brightness):
 *   - Transparent capture layer at z-30 that intercepts mousedown so the
 *     browser doesn't initiate native text selection on the underlying
 *     desktop content. `cursor: crosshair` here is the affordance.
 *   - The live drag rectangle while the user is dragging (z-35)
 *   - A floating "Drag to take a screenshot" tooltip following the cursor
 *     with smooth spring lag (z-50, above the Panel per spec)
 *   - White flash overlay during the snap (z-60)
 *
 * The capture layer is z-30 — below the Panel (z-40) and ScenarioSwitcher
 * (z-50), so those remain interactive. mousemove + mouseup still listen on
 * `window` so we never lose drag state when the cursor passes over Panel
 * or Switcher mid-drag.
 *
 * On mouseup the overlay finds the nearest `[data-mock-target]` element to
 * the drag's center, snaps the rect to that element's bounds, plays the
 * shutter sound, runs a 200ms white flash, then dispatches the captured
 * target to AppContext and exits screenshot mode (panelState='idle').
 */

type Phase = "awaiting" | "dragging" | "flashing";

interface DragRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function ScreenshotOverlay() {
  const { setCapturedTarget, setPanelState } = useApp();
  const [phase, setPhase] = useState<Phase>("awaiting");
  const [rect, setRect] = useState<DragRect | null>(null);

  // Refs so the global mouse listeners can read live state without
  // re-binding on every state change.
  const phaseRef = useRef<Phase>("awaiting");
  const rectRef = useRef<DragRect | null>(null);
  const captureLayerRef = useRef<HTMLDivElement | null>(null);

  // Safety net (in addition to mousedown preventDefault and the
  // app-wide `user-select: none` CSS class): swallow the native
  // `selectstart` event on the capture layer. Wired via a ref because
  // React's HTMLAttributes type doesn't expose `onSelectStart` for div.
  useEffect(() => {
    const node = captureLayerRef.current;
    if (!node) return;
    const handler = (e: Event) => e.preventDefault();
    node.addEventListener("selectstart", handler);
    return () => node.removeEventListener("selectstart", handler);
  }, []);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    rectRef.current = rect;
  }, [rect]);

  /* ------------------------ Tooltip cursor follow ----------------------- */

  // Per visual spec §2: smooth follow with ~50ms ease lag. useSpring with
  // a modest damping/stiffness combo gives a natural soft trail.
  const cursorX = useMotionValue(-9999);
  const cursorY = useMotionValue(-9999);
  const tooltipX = useSpring(cursorX, {
    damping: 28,
    stiffness: 320,
    mass: 0.4,
  });
  const tooltipY = useSpring(cursorY, {
    damping: 28,
    stiffness: 320,
    mass: 0.4,
  });

  /* ---------------------------- Mouse logic ---------------------------- */

  // Drag-start handler now lives as a React event handler on the capture
  // layer (see render below) so we can call `e.preventDefault()` synchronously
  // and stop the browser from beginning a text selection. Pulled out of the
  // window-listener effect for that reason.
  function handleCaptureMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (phaseRef.current !== "awaiting") return;
    e.preventDefault(); // suppress native text-selection / drag initiation

    const initial: DragRect = {
      x1: e.clientX,
      y1: e.clientY,
      x2: e.clientX,
      y2: e.clientY,
    };
    rectRef.current = initial;
    phaseRef.current = "dragging";
    setRect(initial);
    setPhase("dragging");
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      // Tooltip follows even during drag — it'll just be hidden visually.
      cursorX.set(e.clientX + 16);
      cursorY.set(e.clientY + 16);

      if (phaseRef.current === "dragging" && rectRef.current) {
        const next: DragRect = {
          ...rectRef.current,
          x2: e.clientX,
          y2: e.clientY,
        };
        rectRef.current = next;
        setRect(next);
      }
    }

    function onUp() {
      if (phaseRef.current !== "dragging") return;
      const dragged = rectRef.current;
      if (!dragged) return;

      // Reject trivial drags (treat as cancelled): under 8px diagonal.
      const dx = dragged.x2 - dragged.x1;
      const dy = dragged.y2 - dragged.y1;
      if (Math.hypot(dx, dy) < 8) {
        rectRef.current = null;
        phaseRef.current = "awaiting";
        setRect(null);
        setPhase("awaiting");
        return;
      }

      const cx = (dragged.x1 + dragged.x2) / 2;
      const cy = (dragged.y1 + dragged.y2) / 2;
      const snap = findClosestTarget(cx, cy);

      if (!snap) {
        rectRef.current = null;
        phaseRef.current = "awaiting";
        setRect(null);
        setPhase("awaiting");
        return;
      }

      // Snap the visible rectangle to the target's bounding box; this is
      // what the user briefly sees during the flash and gives the
      // "smart selection" effect.
      const snappedRect: DragRect = {
        x1: snap.rect.left,
        y1: snap.rect.top,
        x2: snap.rect.right,
        y2: snap.rect.bottom,
      };
      rectRef.current = snappedRect;
      phaseRef.current = "flashing";
      setRect(snappedRect);
      setPhase("flashing");
      playShutterSound();

      // After the flash, hand the captured target to AppContext and exit
      // screenshot mode (overlay unmounts).
      window.setTimeout(() => {
        setCapturedTarget(snap.target);
        setPanelState("idle");
      }, 420);
    }

    // mousemove + mouseup on window so we still track the drag if the
    // cursor passes over Panel (z-40) or ScenarioSwitcher (z-50). The
    // capture layer (z-30) handles mousedown via React's onMouseDown.
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [cursorX, cursorY, setCapturedTarget, setPanelState]);

  /* -------------------------------- UI -------------------------------- */

  const normRect = rect ? normalize(rect) : null;

  return (
    <>
      {/* Transparent capture layer — intercepts mousedown so the browser
          doesn't start a native text selection on the underlying desktop
          content. z-30 puts it above the desktop but below the Panel
          (z-40) and ScenarioSwitcher (z-50). */}
      <div
        ref={captureLayerRef}
        onMouseDown={handleCaptureMouseDown}
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          cursor: "crosshair",
          zIndex: 30,
        }}
      />

      {/* Drag rectangle (visible during dragging + flashing phases). */}
      {normRect && (phase === "dragging" || phase === "flashing") && (
        <motion.div
          // Animate the rect's size/position so the snap-to-target reads as
          // a smooth "smart selection" rather than a teleport.
          animate={{
            left: normRect.left,
            top: normRect.top,
            width: normRect.width,
            height: normRect.height,
          }}
          transition={
            phase === "flashing"
              ? { type: "spring", damping: 22, stiffness: 280 }
              : { duration: 0 }
          }
          style={{
            position: "fixed",
            zIndex: 35,
            pointerEvents: "none",
            border: "2px solid #9c4a2a",
            background: "rgba(156, 74, 42, 0.12)",
            borderRadius: 6,
          }}
        />
      )}

      {/* Tooltip (only while awaiting drag). */}
      {phase === "awaiting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            x: tooltipX,
            y: tooltipY,
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 8,
              padding: "8px 14px",
              boxShadow: "0 2px 8px rgba(29, 25, 22, 0.1)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              color: "#1d1916",
              whiteSpace: "nowrap",
            }}
          >
            Drag to take a screenshot
          </div>
        </motion.div>
      )}

      {/* Flash overlay — 200ms total (100ms in, 100ms out). */}
      {phase === "flashing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.2, times: [0, 0.5, 1], ease: "linear" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#ffffff",
            zIndex: 60,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}

/* ----------------------------- Utilities ----------------------------- */

function normalize(r: DragRect): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const left = Math.min(r.x1, r.x2);
  const top = Math.min(r.y1, r.y2);
  const width = Math.abs(r.x2 - r.x1);
  const height = Math.abs(r.y2 - r.y1);
  return { left, top, width, height };
}

interface ScoredTarget {
  target: string;
  rect: DOMRect;
  dist: number;
}

/**
 * Find the `[data-mock-target]` element whose center is closest to the
 * given point. Since each story shows only one mock target at a time, this
 * effectively always picks the correct snap region.
 */
function findClosestTarget(
  centerX: number,
  centerY: number,
): { target: string; rect: DOMRect } | null {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-mock-target]"),
  );

  const scored = els
    .map((el): ScoredTarget | null => {
      const target = el.dataset.mockTarget;
      if (!target) return null;
      const r = el.getBoundingClientRect();
      // Skip detached / zero-size nodes.
      if (r.width === 0 || r.height === 0) return null;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return { target, rect: r, dist: Math.hypot(cx - centerX, cy - centerY) };
    })
    .filter((x): x is ScoredTarget => x !== null);

  if (scored.length === 0) return null;
  scored.sort((a, b) => a.dist - b.dist);
  return { target: scored[0].target, rect: scored[0].rect };
}
