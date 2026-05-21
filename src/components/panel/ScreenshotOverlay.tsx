import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { playShutterSound } from "../../lib/audio";

/**
 * Screenshot drag overlay (PRD §D1–D6 + visual spec §2).
 *
 * Renders three visual layers on top of the desktop (but below the Panel):
 *   - A semi-transparent dim backdrop (z-31)
 *   - The live drag rectangle while the user is dragging (z-35)
 *   - A floating "Drag to take a screenshot" tooltip following the cursor
 *     with smooth spring lag (z-50, above the Panel per spec)
 *
 * On mouseup the overlay finds the nearest `[data-mock-target]` element to
 * the drag's center, snaps the rect to that element's bounds, plays the
 * shutter sound, runs a 200ms white flash, then dispatches the captured
 * target to AppContext and exits screenshot mode (panelState='idle').
 *
 * The overlay is intentionally short-lived — it mounts only while
 * `panelOpen && panelState === 'screenshotting'` and unmounts as soon as
 * capture completes or the user closes the Panel.
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

  useEffect(() => {
    function isOnNoDragArea(target: EventTarget | null) {
      const el = target as HTMLElement | null;
      return Boolean(
        el?.closest?.("[data-invoko-panel], [data-invoko-no-drag]"),
      );
    }

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

    function onDown(e: MouseEvent) {
      if (phaseRef.current !== "awaiting") return;
      if (isOnNoDragArea(e.target)) return;

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

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [cursorX, cursorY, setCapturedTarget, setPanelState]);

  /* -------------------------------- UI -------------------------------- */

  const normRect = rect ? normalize(rect) : null;

  return (
    <>
      {/* Dim backdrop. cursor:crosshair signals the drag affordance. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 12, 9, 0.32)",
          zIndex: 31,
          cursor: "crosshair",
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
            boxShadow: "0 0 0 9999px rgba(15, 12, 9, 0.08)",
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
