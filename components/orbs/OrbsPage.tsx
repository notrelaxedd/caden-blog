"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence } from "framer-motion";
import DetailPanel, { type InitialFocus, type PanelMode } from "./DetailPanel";
import OrbField from "./OrbField";
import { ABOUT_ID, PANEL_ORDER, isPanelId } from "./orbFaces";
import { P } from "./physics";
import type { OpenVia } from "./useOrbPhysics";

// ---- viewport stores (server snapshots are the SSR values; never touch window during render) ----
const subscribeResize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const getVw = () => window.innerWidth;
const getVwServer = () => 0;

const DESKTOP_MQ = "(min-width: 768px)";
const subscribeDesktop = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getDesktop = () => window.matchMedia(DESKTOP_MQ).matches;
const getDesktopServer = () => false;

/** The panel id named by the current hash, or null (unknown hashes such as #contact open nothing). */
function hashId(): string | null {
  const h = window.location.hash.slice(1);
  return isPanelId(h) ? h : null;
}
const skipBloom = () => hashId() !== null;

function setHash(id: string | null) {
  if (id) window.history.replaceState(null, "", "#" + id);
  else window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

export default function OrbsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  // Keyboard opens (and deep links) focus the Close button (§5.5); pointer opens focus the panel itself so no
  // focus ring appears after a click or tap.
  const [initialFocus, setInitialFocus] = useState<InitialFocus>("close");
  const vw = useSyncExternalStore(subscribeResize, getVw, getVwServer);
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktop, getDesktopServer);

  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const openerRef = useRef<string | null>(null); // the orb that opened the panel (focus returns here)
  const restoreFocusRef = useRef<string | null>(null);

  // Deep links: /orbs#about and /orbs#<slug> open that panel on mount. A hash typed or navigated to
  // while the page is open (a fragment navigation, no reload) is honoured the same way; our own
  // replaceState writes never fire hashchange.
  useEffect(() => {
    const apply = () => {
      const id = hashId();
      if (id) {
        openerRef.current = id;
        setInitialFocus("close");
        setSelected(id);
      } else if (selectedRef.current !== null) {
        restoreFocusRef.current = openerRef.current;
        setSelected(null);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  // ---- panel mode (§5.1) ----
  const drawerW = Math.max(280, selected === ABOUT_ID ? Math.min(640, vw - 48) : Math.min(480, vw - 48));
  const reflow = isDesktop && vw - drawerW >= P.REFLOW_MIN_FREE_W;
  const panelMode: PanelMode = !isDesktop ? "sheet" : reflow ? "drawer-reflow" : "drawer-overlay";
  const rightInset = panelMode === "drawer-reflow" && selected ? drawerW : 0;
  const overlay = panelMode !== "drawer-reflow";
  const inert = overlay && !!selected;

  const open = useCallback((id: string, via: OpenVia) => {
    openerRef.current = id;
    setInitialFocus(via === "pointer" ? "panel" : "close");
    setSelected(id);
    setHash(id);
  }, []);

  const close = useCallback(() => {
    if (selectedRef.current === null) return;
    restoreFocusRef.current = openerRef.current;
    setSelected(null);
    setHash(null);
  }, []);

  const navigate = useCallback((dir: 1 | -1) => {
    const cur = selectedRef.current;
    if (!cur) return;
    const n = PANEL_ORDER.length;
    const next = PANEL_ORDER[(PANEL_ORDER.indexOf(cur) + dir + n) % n];
    setSelected(next);
    setHash(next);
  }, []);

  // Focus returns to the opener once the panel is closed and the wrapper is no longer inert.
  useEffect(() => {
    if (selected !== null) return;
    const id = restoreFocusRef.current;
    if (!id) return;
    restoreFocusRef.current = null;
    const el = document.querySelector<HTMLElement>(`[data-orb="${id}"]`);
    el?.focus({ preventScroll: true });
  }, [selected]);

  return (
    <>
      <div inert={inert} data-stage-wrapper>
        <header className="fixed top-0 inset-x-0 h-14 z-40">
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between font-mono text-[13px] sm:text-sm">
            <a href="/" className="text-[#555] hover:text-[#f0f0f0] transition-colors whitespace-nowrap">
              caden polk
            </a>
            <nav className="flex items-center gap-3.5 sm:gap-6">
              <a href="/projects" className="text-[#555] hover:text-[#f0f0f0] transition-colors whitespace-nowrap">
                list view →
              </a>
              <a
                href="/Caden_Polk_Engineering_Portfolio.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#555] hover:text-[#f0f0f0] transition-colors"
              >
                pdf
              </a>
            </nav>
          </div>
        </header>
        <OrbField
          selected={selected}
          onSelect={open}
          onClose={close}
          rightInset={rightInset}
          skipBloom={skipBloom}
          inert={inert}
        />
      </div>
      <AnimatePresence>
        {selected && (
          <DetailPanel
            key="panel"
            selected={selected}
            mode={panelMode}
            width={drawerW}
            initialFocus={initialFocus}
            onClose={close}
            onNavigate={navigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
