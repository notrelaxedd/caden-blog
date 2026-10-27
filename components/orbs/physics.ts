// Pure TypeScript physics for the /orbs constellation. No React, no DOM: steppable in Node.
// Semi-implicit (symplectic) Euler on a fixed 1/120 s step; see docs/orb-prototype-plan.md §3.

export const P = {
  // integrator
  DT: 1 / 120, MAX_SUBSTEPS: 4, MAX_FRAME_DT: 0.05,
  // chrome + layout
  TOP_BAR: 56, HINT_BAND: 40, REFLOW_MIN_FREE_W: 480,
  FIT_REF: 820, FIT_MIN: 0.66, FIT_MAX: 1.15,
  COMPACT_FIT: 0.6,                                 // below this effective scale (s × ringFit) in-orb names move to the rim pill
  R_CENTER: 110, R_BIG: 76, R_SMALL: 64,            // L  (desktop 220 / 152 / 128 px orbs)
  RING_RX_MAX: 360, RING_RY_MAX: 300, RING_MARGIN: 16, // L
  ANGLE_JITTER_DEG: 6, RADIAL_JITTER: 0.03, RING_CLEARANCE: 8,
  RING_FOLLOW: 0.7,
  DRIFT_AMP: 7, DRIFT_W1: 0.37, DRIFT_W2: 0.29,     // L (amp)
  // tethers
  TETHER_K: 26, TETHER_ZETA: 0.55,                  // projects: one soft overshoot (12 %), settles ~2 s
  CENTER_K: 60, CENTER_ZETA: 0.9, CENTER_MASS: 4,   // the hub: stiffer, heavier, finite
  FLING_FREE_S: 0.35, FREE_DAMP: 1.5, KEY_FREE_S: 0.2,
  // pointer field (lengths L, accelerations L)
  POINTER_REACH: 380, POINTER_ACCEL: 1600, POINTER_CORE: 60,
  PUSH_REACH: 300, PUSH_ACCEL: 16000, PUSH_CORE: 60, PUSH_SPEED_SCALE_MAX: 2,
  GAIN_V0: 600, GAIN_V1: 1500,                      // L: pointer speed where the field blends attract -> push
  SPEED_EMA: 0.5, SPEED_DECAY: 20, SPEED_STALE_MS: 50,
  HOVER_K: 60, HOVER_MAX: 10,                       // L (max)
  CENTER_FIELD_SCALE: 0.25,
  // drag / tap / fling / keys
  DRAG_K: 1600, DRAG_C: 80,                          // critically damped, omega 40 rad/s
  TAP_MAX_PX: 8, TAP_MAX_MS: 350, FLING_STALE_MS: 100, FLING_GAIN: 1.0,
  KEY_IMPULSE: 700,                                  // L
  // collisions, walls, limits
  COLLIDE_GAP: 2, COLLIDE_REST: 0.35, COLLIDE_CORRECT: 0.4, COLLIDE_SLOP: 0.5,
  WALL_INSET: 8, WALL_REST: 0.25, MAX_V: 2600,
  // bloom
  BLOOM_CLEARANCE: 4, CONTACT_RAMP_START: 0.3, CONTACT_RAMP_END: 0.9,
  // step 13 velocity squash: s = min(|v| / SQUASH_V, 1) * SQUASH_MAX (visual layers only)
  SQUASH_V: 1600, SQUASH_MAX: 0.10,
} as const;

export type Tier = "center" | "big" | "small";
export type Kind = "center" | "project";

export type Body = {
  id: string;                     // 'about' | project slug
  kind: Kind;
  tier: Tier;
  r: number;                      // current radius (set at layout, never per frame)
  x: number; y: number; vx: number; vy: number;
  px: number; py: number;         // position at the start of the current substep (wall-crossing test)
  hx: number; hy: number;         // home (recomputed every substep: ring follow + drift)
  offX: number; offY: number;     // ring offset from the ring centre (set at layout)
  theta0: number;                 // un-jittered slot angle (bloom spawn direction), radians
  phase: number;                  // drift phase = 1.7 * index
  invMass: number;                // project 1, centre 1/4
  held: boolean;
  tx: number; ty: number;         // drag target (stage px) while held
  ramp: number;                   // tether engagement 0..1 (free flight after a fling)
  rampDur: number;                // seconds for ramp to reach 1
};

export type PointerInput = { active: boolean; x: number; y: number; speed: number }; // stage coords, speed px/s

export type Rect = { x: number; y: number; w: number; h: number };

export type World = {
  bodies: Body[];
  centre: Body;
  projects: Body[];
  free: Rect;
  cx: number; cy: number;         // free-rect centre C
  ringX: number; ringY: number;   // ring centre for this step (C + RING_FOLLOW * (centre - C))
  s: number;                      // fit scale
  fit: number;                    // effective orb scale: s × the ringFit factor (drives the in-orb type via --s)
  Rx: number; Ry: number;         // ring radii
  t: number;
  bloomAt: number | null;
  reduced: boolean;
  spawned: boolean;
};

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const DEG = Math.PI / 180;

export function createWorld(ids: string[], tiers: Tier[]): World {
  if (ids.length !== tiers.length) throw new Error("createWorld: ids and tiers must match");
  const bodies: Body[] = [];
  let projectIndex = 0;
  for (let i = 0; i < ids.length; i++) {
    const tier = tiers[i];
    const kind: Kind = tier === "center" ? "center" : "project";
    const index = kind === "center" ? 0 : projectIndex++;
    bodies.push({
      id: ids[i], kind, tier,
      r: 0, x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, hx: 0, hy: 0, offX: 0, offY: 0,
      theta0: 0, phase: 1.7 * index,
      invMass: kind === "center" ? 1 / P.CENTER_MASS : 1,
      held: false, tx: 0, ty: 0, ramp: 1, rampDur: 0,
    });
  }
  const centre = bodies.find((b) => b.kind === "center");
  if (!centre) throw new Error("createWorld: a 'center' tier body is required");
  return {
    bodies, centre, projects: bodies.filter((b) => b.kind === "project"),
    free: { x: 0, y: 0, w: 0, h: 0 }, cx: 0, cy: 0, ringX: 0, ringY: 0,
    s: 1, fit: 1, Rx: 0, Ry: 0, t: 0, bloomAt: null, reduced: false, spawned: false,
  };
}

/** Lengths marked L in the plan are multiplied by the fit scale at layout time. */
export const L = (world: World, v: number) => v * world.s;

/** Radii, ring and homes. Bodies are never teleported here: homes move and the tethers glide them. */
export function layoutWorld(world: World, stageW: number, stageH: number, rightInset: number): void {
  const free: Rect = {
    x: 0, y: P.TOP_BAR,
    w: Math.max(1, stageW - rightInset),
    h: Math.max(1, stageH - P.TOP_BAR - P.HINT_BAND),
  };
  const s = clamp(Math.min(free.w, free.h) / P.FIT_REF, P.FIT_MIN, P.FIT_MAX);
  let rC = Math.round(P.R_CENTER * s);
  let rBig = Math.round(P.R_BIG * s);
  let rSmall = Math.round(P.R_SMALL * s);
  const Rx = Math.max(1, Math.min(free.w / 2 - rBig - P.RING_MARGIN * s, P.RING_RX_MAX * s));
  const Ry = Math.max(1, Math.min(free.h / 2 - rBig - P.RING_MARGIN * s, P.RING_RY_MAX * s));
  world.free = free;
  world.s = s;
  world.Rx = Rx;
  world.Ry = Ry;
  world.cx = free.x + free.w / 2;
  world.cy = free.y + free.h / 2;

  const n = world.projects.length;
  let minD = Infinity;
  for (let i = 0; i < n; i++) {
    const b = world.projects[i];
    const theta0 = (-90 + (i * 360) / n) * DEG;
    const theta = theta0 + (((i * 7919) % 13) - 6) * DEG;                        // deterministic ±6° jitter
    const kr = 1 + 2 * P.RADIAL_JITTER * ((((i * 104729) % 7) / 6) - 0.5);      // 0.97..1.03
    b.theta0 = theta0;
    b.offX = kr * Rx * Math.cos(theta);
    b.offY = kr * Ry * Math.sin(theta);
    minD = Math.min(minD, Math.hypot(b.offX, b.offY));
  }
  // ringFit guard: the nearest slot must clear the sun
  const need = rC + rBig + P.RING_CLEARANCE;
  let f = 1;
  if (n > 0 && minD < need) {
    f = Math.max(0.2, (minD - P.RING_CLEARANCE) / (rC + rBig));
    rC = Math.max(1, Math.round(rC * f));
    rBig = Math.max(1, Math.round(rBig * f));
    rSmall = Math.max(1, Math.round(rSmall * f));
  }
  world.fit = s * f;
  for (const b of world.bodies) {
    b.r = b.tier === "center" ? rC : b.tier === "big" ? rBig : rSmall;
  }
  updateHomes(world);
}

function updateHomes(world: World): void {
  const c = world.centre;
  c.hx = world.cx;
  c.hy = world.cy;
  const ringX = world.cx + P.RING_FOLLOW * (c.x - world.cx);
  const ringY = world.cy + P.RING_FOLLOW * (c.y - world.cy);
  world.ringX = ringX;
  world.ringY = ringY;
  const amp = world.reduced ? 0 : P.DRIFT_AMP * world.s;
  const t = world.t;
  for (const b of world.projects) {
    const dx = amp * Math.cos(P.DRIFT_W1 * t + b.phase);
    const dy = amp * Math.sin(P.DRIFT_W2 * t + 1.7 * b.phase);
    b.hx = ringX + b.offX + dx;
    b.hy = ringY + b.offY + dy;
  }
}

/** Place every body. Bloom: projects start just outside the sun along their slot direction and the tethers carry them out. */
export function spawnWorld(world: World, opts: { bloom: boolean }): void {
  const c = world.centre;
  c.x = world.cx; c.y = world.cy; c.px = c.x; c.py = c.y; c.vx = 0; c.vy = 0; c.ramp = 1; c.rampDur = 0; c.held = false;
  const bloom = opts.bloom && !world.reduced;
  updateHomes(world);
  for (const b of world.projects) {
    if (bloom) {
      const d = c.r + b.r + P.BLOOM_CLEARANCE;
      b.x = world.cx + d * Math.cos(b.theta0);
      b.y = world.cy + d * Math.sin(b.theta0);
    } else {
      b.x = b.hx;
      b.y = b.hy;
    }
    b.px = b.x; b.py = b.y;
    b.vx = 0; b.vy = 0; b.ramp = 1; b.rampDur = 0; b.held = false;
  }
  world.bloomAt = bloom ? world.t : null;
  world.spawned = true;
}

/** One fixed substep. */
export function stepWorld(world: World, dt: number, input: PointerInput): void {
  world.t += dt;
  const reduced = world.reduced;
  const s = world.s;
  updateHomes(world);

  const pointerAccel = reduced ? 0 : P.POINTER_ACCEL * s;
  const pushAccel = reduced ? 0 : P.PUSH_ACCEL * s;
  const hoverK = reduced ? 0 : P.HOVER_K;
  const hoverMax = P.HOVER_MAX * s;
  const pointerReach = P.POINTER_REACH * s;
  const pointerCore = P.POINTER_CORE * s;
  const pushReach = P.PUSH_REACH * s;
  const pushCore = P.PUSH_CORE * s;
  const gainV0 = P.GAIN_V0 * s;
  const gainV1 = P.GAIN_V1 * s;
  const gain = input.active ? clamp((input.speed - gainV0) / (gainV1 - gainV0), 0, 1) : 0;
  const pushScale = clamp(input.speed / gainV1, 1, P.PUSH_SPEED_SCALE_MAX);

  for (const b of world.bodies) {
    b.px = b.x;
    b.py = b.y;
    let ax: number;
    let ay: number;
    if (b.held) {
      ax = P.DRAG_K * (b.tx - b.x) - P.DRAG_C * b.vx;                      // critically damped follow
      ay = P.DRAG_K * (b.ty - b.y) - P.DRAG_C * b.vy;
    } else {
      const isCentre = b.kind === "center";
      const k = isCentre ? P.CENTER_K : P.TETHER_K;
      const zeta = reduced ? 1 : isCentre ? P.CENTER_ZETA : P.TETHER_ZETA;
      const c = 2 * zeta * Math.sqrt(k);
      const damp = b.ramp * c + (1 - b.ramp) * P.FREE_DAMP;               // free flight right after a fling
      ax = b.ramp * k * (b.hx - b.x) - damp * b.vx;
      ay = b.ramp * k * (b.hy - b.y) - damp * b.vy;
      if (input.active) {
        const f = isCentre ? P.CENTER_FIELD_SCALE : 1;
        const dx = input.x - b.x;
        const dy = input.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist >= 1e-3) {
          // attraction with a soft core (slow pointer)
          if (dist < pointerReach) {
            const q = 1 - dist / pointerReach;
            const coef = f * (1 - gain) * pointerAccel * q * q / Math.sqrt(dist * dist + pointerCore * pointerCore);
            ax += coef * dx;
            ay += coef * dy;
          }
          // velocity-gated shove (fast pointer): parts the field
          if (gain > 0 && dist < pushReach) {
            const q = 1 - dist / pushReach;
            const coef = f * gain * pushScale * pushAccel * q * q / Math.sqrt(dist * dist + pushCore * pushCore);
            ax -= coef * dx;
            ay -= coef * dy;
          }
          // hover magnet: only the orb the pointer is inside, only when the pointer is slow
          if (dist < b.r) {
            const coef = (1 - gain) * hoverK * Math.min(1, hoverMax / dist);
            ax += coef * dx;
            ay += coef * dy;
          }
        }
      }
    }
    b.vx += ax * dt;
    b.vy += ay * dt;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > P.MAX_V) {
      b.vx *= P.MAX_V / sp;
      b.vy *= P.MAX_V / sp;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.ramp < 1) {
      b.ramp = b.rampDur > 0 ? Math.min(1, b.ramp + dt / b.rampDur) : 1;
    }
  }

  // collisions, all pairs (i<j)
  const contactRamp = world.bloomAt === null
    ? 1
    : clamp((world.t - world.bloomAt - P.CONTACT_RAMP_START) / (P.CONTACT_RAMP_END - P.CONTACT_RAMP_START), 0, 1);
  const rest = reduced ? 0 : P.COLLIDE_REST;
  const bodies = world.bodies;
  for (let i = 0; i < bodies.length; i++) {
    const bi = bodies[i];
    for (let j = i + 1; j < bodies.length; j++) {
      const bj = bodies[j];
      let dx = bj.x - bi.x;
      let dy = bj.y - bi.y;
      let dist = Math.hypot(dx, dy);
      if (dist < 1e-3) { dx = 1; dy = 0; dist = 1e-3; }                   // NaN guard
      const minD = bi.r + bj.r + P.COLLIDE_GAP;
      if (dist >= minD) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      const ov = minD - dist;
      const imi = bi.held ? 0 : bi.invMass;
      const imj = bj.held ? 0 : bj.invMass;
      const tot = imi + imj;
      if (tot === 0) continue;
      const corr = P.COLLIDE_CORRECT * Math.max(ov - P.COLLIDE_SLOP, 0) * contactRamp;  // fractional correction
      bi.x -= nx * corr * imi / tot;
      bi.y -= ny * corr * imi / tot;
      bj.x += nx * corr * imj / tot;
      bj.y += ny * corr * imj / tot;
      const vn = (bj.vx - bi.vx) * nx + (bj.vy - bi.vy) * ny;
      if (vn < 0) {
        const J = -(1 + rest) * vn / tot * contactRamp;
        bi.vx -= nx * J * imi;
        bi.vy -= ny * J * imi;
        bj.vx += nx * J * imj;
        bj.vy += ny * J * imj;
      }
    }
  }

  // walls (free rect inset WALL_INSET). A body that crosses a wall during this substep is clamped and
  // bounced. A body that is already outside (the free rect shrank under it: a drawer opened, the window
  // got smaller) is never teleported (§3.4): only its outward velocity is dropped and the tether glides
  // it back in, which is the panel-open slide.
  const f = world.free;
  for (const b of bodies) {
    const minX = f.x + P.WALL_INSET + b.r;
    const maxX = f.x + f.w - P.WALL_INSET - b.r;
    const minY = f.y + P.WALL_INSET + b.r;
    const maxY = f.y + f.h - P.WALL_INSET - b.r;
    if (minX <= maxX) {
      if (b.x < minX) {
        if (b.px >= minX) { b.x = minX; if (b.vx < 0) b.vx *= -P.WALL_REST; }
        else if (b.vx < 0) b.vx = 0;
      } else if (b.x > maxX) {
        if (b.px <= maxX) { b.x = maxX; if (b.vx > 0) b.vx *= -P.WALL_REST; }
        else if (b.vx > 0) b.vx = 0;
      }
    } else {
      b.x = (minX + maxX) / 2;
    }
    if (minY <= maxY) {
      if (b.y < minY) {
        if (b.py >= minY) { b.y = minY; if (b.vy < 0) b.vy *= -P.WALL_REST; }
        else if (b.vy < 0) b.vy = 0;
      } else if (b.y > maxY) {
        if (b.py <= maxY) { b.y = maxY; if (b.vy > 0) b.vy *= -P.WALL_REST; }
        else if (b.vy > 0) b.vy = 0;
      }
    } else {
      b.y = (minY + maxY) / 2;
    }
  }
}

export function bodyOf(world: World, id: string): Body | undefined {
  return world.bodies.find((b) => b.id === id);
}

/** Pointer down on an orb: it ignores every force except the drag spring and bulldozes neighbours. */
export function grab(world: World, id: string, tx: number, ty: number): void {
  const b = bodyOf(world, id);
  if (!b) return;
  b.held = true;
  b.tx = tx;
  b.ty = ty;
  b.ramp = 1;
  b.rampDur = 0;
}

export function setDragTarget(world: World, id: string, tx: number, ty: number): void {
  const b = bodyOf(world, id);
  if (!b) return;
  b.tx = tx;
  b.ty = ty;
}

/** Pointer up: fling keeps the velocity (× FLING_GAIN) and frees the tether briefly; otherwise the orb is placed. */
export function release(world: World, id: string, opts: { fling: boolean }): void {
  const b = bodyOf(world, id);
  if (!b) return;
  b.held = false;
  const freeS = world.reduced ? 0 : P.FLING_FREE_S;
  if (opts.fling) {
    b.vx *= P.FLING_GAIN;
    b.vy *= P.FLING_GAIN;
    if (freeS > 0) { b.ramp = 0; b.rampDur = freeS; } else { b.ramp = 1; b.rampDur = 0; }
  } else {
    b.vx = 0;
    b.vy = 0;
    b.ramp = 1;
    b.rampDur = 0;
  }
}

/** Keyboard nudge: an instantaneous velocity change plus a short free flight. */
export function applyImpulse(world: World, id: string, vx: number, vy: number): void {
  const b = bodyOf(world, id);
  if (!b || b.held) return;
  b.vx += vx;
  b.vy += vy;
  const freeS = world.reduced ? 0 : P.KEY_FREE_S;
  if (freeS > 0) { b.ramp = 0; b.rampDur = freeS; } else { b.ramp = 1; b.rampDur = 0; }
}

/** Every body within 0.5 px of home with |v| < 1 px/s and nothing held. */
export function isAtRest(world: World): boolean {
  for (const b of world.bodies) {
    if (b.held) return false;
    if (Math.abs(b.x - b.hx) > 0.5 || Math.abs(b.y - b.hy) > 0.5) return false;
    if (Math.hypot(b.vx, b.vy) >= 1) return false;
  }
  return true;
}
