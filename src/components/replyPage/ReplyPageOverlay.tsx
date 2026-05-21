import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useApp } from "../../context/AppContext";

/**
 * Main Reply page overlay (PRD Module H).
 *
 * Summoned with ⌘R (toggle). Shows the design mock as a windowed overlay
 * (~80% width, centered). Esc or click on the dim backdrop closes it.
 */
export function ReplyPageOverlay() {
  const { replyPageOpen, setReplyPageOpen } = useApp();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        Boolean(target?.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        setReplyPageOpen(!replyPageOpen);
        return;
      }

      if (e.key === "Escape" && replyPageOpen) {
        e.preventDefault();
        setReplyPageOpen(false);
        return;
      }

      if (inField) return;
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [replyPageOpen, setReplyPageOpen]);

  function close() {
    setReplyPageOpen(false);
  }

  return (
    <AnimatePresence>
      {replyPageOpen && (
        <motion.div
          key="reply-page-overlay"
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Backdrop — click outside to close (PRD H4) */}
          <button
            type="button"
            aria-label="Close Reply page"
            className="absolute inset-0 cursor-default bg-[rgba(29,25,22,0.45)]"
            onClick={close}
          />

          {/* Windowed frame (~80% width, PRD H1 + H5) */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Invoko Reply"
            className="relative max-h-[90vh] overflow-hidden rounded-2xl bg-paper shadow-[0_24px_64px_-12px_rgba(29,25,22,0.35)]"
            style={{
              width: "min(80vw, 1280px)",
              border: "1px solid rgba(29,25,22,0.1)",
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/reply-main-page.png"
              alt="Invoko Reply — People, Docs, and voice summary"
              className="block h-auto max-h-[90vh] w-full object-contain object-top"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
