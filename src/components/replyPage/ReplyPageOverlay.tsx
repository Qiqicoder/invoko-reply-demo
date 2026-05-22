import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { ReplyPage } from "./ReplyPage";

/**
 * Main Reply page overlay (PRD Module H).
 *
 * Summoned with ⌘R (toggle). Renders dynamic `ReplyPage` (~80% width).
 * Esc or click on the dim backdrop closes it.
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
          <button
            type="button"
            aria-label="Close Reply page"
            className="absolute inset-0 cursor-default bg-[rgba(29,25,22,0.45)]"
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Invoko Reply"
            className="relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-cream shadow-[0_24px_64px_-12px_rgba(29,25,22,0.35)]"
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
            <ReplyPage />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
