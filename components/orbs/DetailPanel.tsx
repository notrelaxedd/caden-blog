"use client";

import { useEffect, useRef, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import AboutPanel from "./AboutPanel";
import { ABOUT_ID, PANEL_ORDER, faceFor, labelFor, projectFor } from "./orbFaces";
import ProjectPanel from "./ProjectPanel";

export type PanelMode = "drawer-reflow" | "drawer-overlay" | "sheet";
/** Where focus lands on open: the Close button (keyboard opens, deep links) or the panel itself (pointer opens). */
export type InitialFocus = "close" | "panel";

export type DetailPanelProps = {
  selected: string;
  mode: PanelMode;
  /** Drawer width in px (ignored by the sheet). */
  width: number;
  initialFocus: InitialFocus;
  onClose: () => void;
  onNavigate: (dir: 1 | -1) => void;
};

const SPRING = { type: "spring", stiffness: 300, damping: 34, mass: 0.9 } as const;

/** Drawer / sheet shell: framer enter/exit, scrim, focus in, Esc, ←/→, content crossfade, swipe-to-close (§5). */
export default function DetailPanel({ selected, mode, width, initialFocus, onClose, onNavigate }: DetailPanelProps) {
  const reduced = useReducedMotion() ?? false;
  const controls = useDragControls();
  const asideRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrimArmed = useRef(false);
  const isSheet = mode === "sheet";
  const overlay = mode !== "drawer-reflow";

  // Focus moves into the panel on open (the opener gets it back on close, see OrbsPage): to the Close button
  // after a keyboard open, to the panel itself after a pointer open (Chrome treats programmatic focus that
  // follows a preventDefault-ed pointerdown as keyboard-like and would draw the focus ring on Close).
  // Tab from the panel lands on Close first; Esc and the arrow keys work from either.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const target = initialFocus === "close" ? closeRef.current : asideRef.current;
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
    // mount only: a switch in place keeps focus where it is (§5.5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Esc closes from anywhere while the panel is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // A switch in place starts the new content at the top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [selected]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onNavigate(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onNavigate(-1);
    }
  };

  const motionProps = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : isSheet
      ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: SPRING }
      : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" }, transition: SPRING };

  const dragProps = isSheet
    ? {
        drag: "y" as const,
        dragControls: controls,
        dragListener: false,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.6 },
        onDragEnd: (_e: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
          if (info.offset.y > 110 || info.velocity.y > 600) onClose();
        },
      }
    : {};

  const project = selected === ABOUT_ID ? undefined : projectFor(selected);

  return (
    <>
      {overlay && (
        <motion.div
          data-scrim
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-[#0c0c0c]/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.25 }}
          // Close only on a press that started on the scrim. The tap that opened the panel is followed
          // by a synthetic click that the browser retargets to the scrim once the stage is inert.
          onPointerDown={() => { scrimArmed.current = true; }}
          onClick={() => { if (scrimArmed.current) onClose(); scrimArmed.current = false; }}
        />
      )}
      <motion.aside
        ref={asideRef}
        tabIndex={-1}
        role="dialog"
        aria-modal={overlay}
        aria-labelledby="orb-panel-title"
        data-panel-mode={mode}
        onKeyDown={onKeyDown}
        style={{ "--w": `${width}px` } as CSSProperties}
        className={
          isSheet
            ? "fixed inset-x-0 bottom-0 z-50 h-[88dvh] rounded-t-2xl bg-[#0f0f0f] border-t border-[#1e1e1e] flex flex-col outline-none"
            : // /[0.92]: Tailwind 3.4 only accepts opacity steps or a bracketed value here; a bare /92 emits nothing
              "fixed top-14 right-0 bottom-0 z-50 w-[var(--w)] max-w-full bg-[#0f0f0f]/[0.92] backdrop-blur-md border-l border-[#1e1e1e] flex flex-col outline-none"
        }
        {...motionProps}
        {...dragProps}
      >
        {isSheet && (
          <div
            className="flex justify-center py-3 cursor-grab touch-none select-none shrink-0"
            onPointerDown={(e) => controls.start(e)}
            aria-hidden="true"
          >
            <span className="block w-9 h-1 rounded-full bg-[#2a2a2a]" />
          </div>
        )}

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded bg-[#0f0f0f]/90 text-[#555] hover:text-[#f0f0f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#60a5fa] transition-colors"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          style={{ touchAction: "pan-y" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {project ? <ProjectPanel project={project} face={faceFor(project.slug)} /> : <AboutPanel />}
            </motion.div>
          </AnimatePresence>
          {/* Outside the crossfade so a clicked prev/next button keeps focus across the switch. */}
          <PanelNav selected={selected} onNavigate={onNavigate} />
        </div>
      </motion.aside>
    </>
  );
}

/** Footer: ← prev / next →, cycling through PANEL_ORDER (Emmett's → About → HapBe …). */
function PanelNav({ selected, onNavigate }: { selected: string; onNavigate: (dir: 1 | -1) => void }) {
  const n = PANEL_ORDER.length;
  const i = Math.max(0, PANEL_ORDER.indexOf(selected));
  const prev = labelFor(PANEL_ORDER[(i - 1 + n) % n]);
  const next = labelFor(PANEL_ORDER[(i + 1) % n]);
  return (
    <div className="flex justify-between border-t border-[#1e1e1e] pt-4 mt-10">
      <button
        type="button"
        data-nav="prev"
        aria-label={`Previous: ${prev}`}
        onClick={() => onNavigate(-1)}
        className="font-mono text-[11px] text-[#555] hover:text-[#f0f0f0] transition-colors"
      >
        ← {prev}
      </button>
      <button
        type="button"
        data-nav="next"
        aria-label={`Next: ${next}`}
        onClick={() => onNavigate(1)}
        className="font-mono text-[11px] text-[#555] hover:text-[#f0f0f0] transition-colors"
      >
        {next} →
      </button>
    </div>
  );
}
