"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  P,
  applyImpulse,
  createWorld,
  grab,
  isAtRest,
  layoutWorld,
  release,
  setDragTarget,
  spawnWorld,
  stepWorld,
  type PointerInput,
  type Tier,
  type World,
} from "./physics";

export type OrbHandlers = {
  onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onLostPointerCapture: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
};

/** How an orb was opened: a pointer tap, or Enter/Space (the panel decides where focus lands). */
export type OpenVia = "pointer" | "keyboard";

export type UseOrbPhysicsOptions = {
  ids: string[];
  tiers: Tier[];
  rightInset: number;
  /** Read in the mount effect (never during render): true skips the bloom, e.g. for a deep link. */
  skipBloom: () => boolean;
  onTap: (id: string, via: OpenVia) => void;
  onStageTap: () => void;
};

type Drag = {
  id: string;
  pointerId: number;
  el: HTMLButtonElement;
  x0: number;
  y0: number;
  t0: number;
  lastMoveT: number;
  maxMove: number;
};

type Controller = {
  relayout: () => void;
  wake: () => void;
  clearPointer: () => void;
};

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function useOrbPhysics(opts: UseOrbPhysicsOptions) {
  const { ids, tiers, rightInset } = opts;

  const optsRef = useRef(opts);
  optsRef.current = opts;
  const rightInsetRef = useRef(rightInset);
  rightInsetRef.current = rightInset;

  const worldRef = useRef<World | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const ellipseRef = useRef<SVGEllipseElement | null>(null);
  const orbEls = useRef(new Map<string, HTMLButtonElement>());
  const lineEls = useRef(new Map<string, SVGLineElement>());
  const orbRefCbs = useRef(new Map<string, (el: HTMLButtonElement | null) => void>());
  const lineRefCbs = useRef(new Map<string, (el: SVGLineElement | null) => void>());
  const squashEls = useRef(new Map<string, HTMLSpanElement>()); // step 13 (empty when SQUASH is off)
  const squashRefCbs = useRef(new Map<string, (el: HTMLSpanElement | null) => void>());
  const lastSquash = useRef(new Map<string, number>());
  const handlerCache = useRef(new Map<string, OrbHandlers>());

  const inputRef = useRef<PointerInput>({ active: false, x: 0, y: 0, speed: 0 });
  const moveRef = useRef({ t: 0, x: 0, y: 0 }); // last pointermove, client coords
  const dragRef = useRef<Drag | null>(null);
  const suppressClickUntil = useRef(0);
  const stageTapRef = useRef<{ pointerId: number; x: number; y: number; t: number } | null>(null);
  const ctrlRef = useRef<Controller | null>(null);

  const [ready, setReady] = useState(false);

  const getWorld = useCallback((): World => {
    if (!worldRef.current) worldRef.current = createWorld(ids, tiers);
    return worldRef.current;
    // ids/tiers are static for the life of the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toStage = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return { x: clientX, y: clientY, inside: false };
    const r = stage.getBoundingClientRect();
    return {
      x: clientX - r.left,
      y: clientY - r.top,
      inside: clientX >= r.left && clientX < r.right && clientY >= r.top && clientY < r.bottom,
    };
  }, []);

  const wake = useCallback(() => ctrlRef.current?.wake(), []);
  const clearPointer = useCallback(() => ctrlRef.current?.clearPointer(), []);

  // ---- mount: world, layout, spawn, loop, listeners -------------------------------------------
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const world = getWorld();
    const input = inputRef.current;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    world.reduced = mq.matches;

    let raf = 0;
    let running = false;
    let last = 0;
    let acc = 0;

    const writeFrame = () => {
      for (const b of world.bodies) {
        const el = orbEls.current.get(b.id);
        if (el) el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
      }
      const ell = ellipseRef.current;
      if (ell) {
        ell.setAttribute("cx", String(world.ringX));
        ell.setAttribute("cy", String(world.ringY));
      }
      // step 13: velocity squash on the visual layers (skipped under reduced motion and at rest)
      if (squashEls.current.size > 0) {
        for (const b of world.bodies) {
          const sq = squashEls.current.get(b.id);
          if (!sq) continue;
          const sp = world.reduced ? 0 : Math.hypot(b.vx, b.vy);
          const s = Math.min(sp / P.SQUASH_V, 1) * P.SQUASH_MAX;
          const prev = lastSquash.current.get(b.id) ?? 0;
          if (s < 0.002 && prev < 0.002) continue; // still identity: no write
          lastSquash.current.set(b.id, s);
          if (s < 0.002) {
            sq.style.transform = "";
          } else {
            const th = Math.atan2(b.vy, b.vx);
            sq.style.transform = `rotate(${th}rad) scale(${1 + s}, ${1 - s}) rotate(${-th}rad)`;
          }
        }
      }
      const c = world.centre;
      for (const b of world.projects) {
        const line = lineEls.current.get(b.id);
        if (!line) continue;
        let ux = b.x - c.x;
        let uy = b.y - c.y;
        const d = Math.hypot(ux, uy);
        if (d < 1e-3) { ux = 1; uy = 0; } else { ux /= d; uy /= d; }
        line.setAttribute("x1", String(c.x + c.r * ux));
        line.setAttribute("y1", String(c.y + c.r * uy));
        line.setAttribute("x2", String(b.x - b.r * ux));
        line.setAttribute("y2", String(b.y - b.r * uy));
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      let dt = Math.max(0, (now - last) / 1000);
      last = now;
      if (dt > P.MAX_FRAME_DT) dt = P.MAX_FRAME_DT;
      if (now - moveRef.current.t > P.SPEED_STALE_MS) input.speed *= Math.exp(-P.SPEED_DECAY * dt);
      acc += dt;
      let steps = 0;
      while (acc >= P.DT && steps < P.MAX_SUBSTEPS) {
        stepWorld(world, P.DT, input);
        acc -= P.DT;
        steps++;
      }
      if (steps === P.MAX_SUBSTEPS) acc = 0; // the sim slows, never spirals
      writeFrame();
      if (world.reduced && !dragRef.current && !input.active && isAtRest(world)) stop();
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const relayout = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w === 0 || h === 0) return;
      layoutWorld(world, w, h, rightInsetRef.current);
      for (const b of world.bodies) {
        const el = orbEls.current.get(b.id);
        if (el) {
          el.style.width = `${2 * b.r}px`;
          el.style.height = `${2 * b.r}px`;
        }
      }
      const ell = ellipseRef.current;
      if (ell) {
        ell.setAttribute("rx", String(world.Rx));
        ell.setAttribute("ry", String(world.Ry));
      }
      // The effective orb scale sizes the in-orb type (CSS calc on --s) and picks the compact face
      // (names in the rim pill) when orbs are too small for in-orb names. Layout-time only, like width/height.
      stage.style.setProperty("--s", world.fit.toFixed(3));
      if (world.fit < P.COMPACT_FIT) stage.dataset.compact = "true";
      else delete stage.dataset.compact;
      // First layout spawns. A relayout before the first step (a deep link setting rightInset in the
      // same task as mount) re-spawns in the new layout instead of gliding 240 px on load; after the
      // first step bodies are never teleported, their homes move and the tethers glide them.
      if (!world.spawned || world.t === 0) spawnWorld(world, { bloom: !optsRef.current.skipBloom() });
      writeFrame();
      start();
    };

    ctrlRef.current = {
      relayout,
      wake: start,
      clearPointer: () => {
        input.active = false;
        input.speed = 0;
      },
    };

    const onMq = () => {
      world.reduced = mq.matches;
      start();
    };
    mq.addEventListener("change", onMq);

    // ---- stage pointer input ----
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const p = toStage(e.clientX, e.clientY);
      input.x = p.x;
      input.y = p.y;
      input.active = true;
      start();
    };
    const onMove = (e: PointerEvent) => {
      const p = toStage(e.clientX, e.clientY);
      const m = moveRef.current;
      const dtMs = e.timeStamp - m.t;
      if (m.t > 0 && dtMs > 0) {
        const v = Math.hypot(e.clientX - m.x, e.clientY - m.y) / Math.max(dtMs / 1000, 0.004);
        input.speed = P.SPEED_EMA * input.speed + (1 - P.SPEED_EMA) * v;
      }
      m.t = e.timeStamp;
      m.x = e.clientX;
      m.y = e.clientY;
      input.x = p.x;
      input.y = p.y;
      if (e.pointerType === "mouse") input.active = p.inside;
      const drag = dragRef.current;
      if (drag && drag.pointerId === e.pointerId) {
        setDragTarget(world, drag.id, p.x, p.y);
        drag.lastMoveT = e.timeStamp;
        drag.maxMove = Math.max(drag.maxMove, Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0));
      }
      start();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") input.active = false;
    };
    const onDown = (e: PointerEvent) => {
      const p = toStage(e.clientX, e.clientY);
      const m = moveRef.current;
      m.t = e.timeStamp;
      m.x = e.clientX;
      m.y = e.clientY;
      input.x = p.x;
      input.y = p.y;
      if (e.pointerType !== "mouse") {
        input.active = true;
        input.speed = 0;
      }
      const primary = e.pointerType !== "mouse" || e.button === 0; // a right/middle click never closes the panel
      stageTapRef.current =
        primary && e.target === stage ? { pointerId: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp } : null;
      start();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") input.active = false;
      const tap = stageTapRef.current;
      stageTapRef.current = null;
      if (
        tap &&
        tap.pointerId === e.pointerId &&
        e.target === stage &&
        Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < P.TAP_MAX_PX &&
        e.timeStamp - tap.t < P.TAP_MAX_MS
      ) {
        optsRef.current.onStageTap();
      }
    };
    const onCancel = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") input.active = false;
      stageTapRef.current = null;
    };
    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onCancel);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => relayout());
    ro.observe(stage);

    relayout();
    setReady(true);
    start();

    return () => {
      stop();
      ro.disconnect();
      mq.removeEventListener("change", onMq);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onCancel);
      document.removeEventListener("visibilitychange", onVisibility);
      const drag = dragRef.current;
      if (drag) {
        try { drag.el.releasePointerCapture(drag.pointerId); } catch { /* already released */ }
        drag.el.removeAttribute("data-held");
        release(world, drag.id, { fling: false });
        dragRef.current = null;
      }
      input.active = false;
      stageTapRef.current = null;
      ctrlRef.current = null;
    };
  }, [getWorld, toStage]);

  // ---- rightInset: homes move, tethers glide ---------------------------------------------------
  useEffect(() => {
    ctrlRef.current?.relayout();
  }, [rightInset]);

  // ---- refs and handlers per orb ------------------------------------------------------------
  const orbRef = useCallback((id: string) => {
    let cb = orbRefCbs.current.get(id);
    if (!cb) {
      cb = (el) => {
        if (el) orbEls.current.set(id, el);
        else orbEls.current.delete(id);
      };
      orbRefCbs.current.set(id, cb);
    }
    return cb;
  }, []);

  const lineRef = useCallback((id: string) => {
    let cb = lineRefCbs.current.get(id);
    if (!cb) {
      cb = (el) => {
        if (el) lineEls.current.set(id, el);
        else lineEls.current.delete(id);
      };
      lineRefCbs.current.set(id, cb);
    }
    return cb;
  }, []);

  const squashRef = useCallback((id: string) => {
    let cb = squashRefCbs.current.get(id);
    if (!cb) {
      cb = (el) => {
        if (el) squashEls.current.set(id, el);
        else squashEls.current.delete(id);
      };
      squashRefCbs.current.set(id, cb);
    }
    return cb;
  }, []);

  const orbHandlers = useCallback(
    (id: string): OrbHandlers => {
      const cached = handlerCache.current.get(id);
      if (cached) return cached;

      const endDrag = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== e.pointerId) return;
        const world = getWorld();
        dragRef.current = null;
        try { drag.el.releasePointerCapture(drag.pointerId); } catch { /* not captured */ }
        drag.el.removeAttribute("data-held");
        if (cancelled) {
          release(world, drag.id, { fling: false });
          suppressClickUntil.current = 0;
          return;
        }
        const moved = Math.max(drag.maxMove, Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0));
        const heldMs = e.timeStamp - drag.t0;
        suppressClickUntil.current = performance.now() + 50;
        if (moved < P.TAP_MAX_PX && heldMs < P.TAP_MAX_MS) {
          release(world, drag.id, { fling: false });
          optsRef.current.onTap(drag.id, "pointer");
        } else {
          const stale = e.timeStamp - drag.lastMoveT > P.FLING_STALE_MS; // stopped, then let go: place
          release(world, drag.id, { fling: !stale });
        }
        ctrlRef.current?.wake();
      };

      const handlers: OrbHandlers = {
        onPointerDown: (e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          if (dragRef.current) return; // one orb at a time
          e.preventDefault(); // kills mouse-compat events, image drag, double-tap zoom
          const el = e.currentTarget;
          try { el.setPointerCapture(e.pointerId); } catch { /* unsupported */ }
          const p = toStage(e.clientX, e.clientY);
          grab(getWorld(), id, p.x, p.y);
          dragRef.current = {
            id, pointerId: e.pointerId, el,
            x0: e.clientX, y0: e.clientY, t0: e.timeStamp, lastMoveT: e.timeStamp, maxMove: 0,
          };
          el.dataset.held = "true";
          ctrlRef.current?.wake();
        },
        onPointerUp: (e) => endDrag(e, false),
        onPointerCancel: (e) => endDrag(e, true),
        onLostPointerCapture: (e) => {
          // Capture taken away by the browser (element removed, system gesture): clean up as a cancel.
          const drag = dragRef.current;
          if (drag && drag.pointerId === e.pointerId) endDrag(e, true);
        },
        onClick: () => {
          if (performance.now() < suppressClickUntil.current) return; // the synthetic click after a tap/drag
          optsRef.current.onTap(id, "keyboard"); // keyboard Enter/Space path
        },
        onKeyDown: (e) => {
          const dir = ARROWS[e.key];
          if (!dir) return;
          e.preventDefault();
          const world = getWorld();
          const v = P.KEY_IMPULSE * world.s;
          applyImpulse(world, id, dir[0] * v, dir[1] * v);
          ctrlRef.current?.wake();
        },
      };
      handlerCache.current.set(id, handlers);
      return handlers;
    },
    [getWorld, toStage],
  );

  return { stageRef, ellipseRef, orbRef, lineRef, squashRef, orbHandlers, ready, wake, clearPointer };
}
