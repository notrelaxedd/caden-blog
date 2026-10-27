# /orbs prototype — implementation plan

> **Update:** the orbs are now the site's root page (`/`); `/orbs` redirects there, and the long-form page moved to `/projects`. HapBe and Lecturly have real logos in `public/orbs/`, and the About panel shows the contact cards under the design philosophy.

**Design:** Constellation (dark-glass orbs on a breathing orbit), with the judges' grafts folded in.
**Repo:** `/home/user/caden-blog` (Next.js 16.2 App Router, React 19.2, TypeScript strict, Tailwind 3.4.19, framer-motion 11.18, lucide-react 0.468).
**New dependencies:** none. The physics is a ~230-line custom fixed-step integrator; matter-js was rejected (see §3.1).
**Nothing on the home page changes.** All new code lives in `app/orbs/page.tsx` and `components/orbs/`.

---

## 1. Overview

### 1.1 The idea, in Caden's words

> There would be a central orb with my name, information, and when you click on it, it has my about section. Surrounding the central orb would be orbs for each project, with each orb having the logo and the name. When you click them, it shows about the project and a link to the site if applicable. Every orb would have physics and move with the cursor.

### 1.2 What gets built

One non-scrolling screen at `/orbs`:

- A **220 px blue-cored "sun" orb** in the middle reading *Caden Polk / Engineer & Founder / Rocky River, Ohio*. Click → a panel with the existing `<About />` component.
- **Seven project orbs** on a gently jittered ellipse around it, in `lib/projects.ts` order, each a dark-glass sphere with its photo melted into the glass, a mark (Emmett's real logo; a lucide icon for the rest, PNG drop-in ready) and its name. Click → a panel with the full write-up from `lib/projects.ts`, a `Visit <host> ↗` button when `href` exists, and prev/next to browse.
- **Physics on every orb**: tethered to its orbit slot by a soft spring; leans toward a slow cursor or finger and snaps gently under it so clicks never miss; a *fast* sweep parts the field like water; any orb can be grabbed, dragged and flung into its neighbours (circle collisions, mass, restitution); dragging the sun tows the whole constellation; on load the ring blooms outward from the sun; hairline links from the sun to each orb stretch as they move.
- Desktop: a right-hand drawer, and the constellation glides left to stay visible beside it. Phones: a bottom sheet with a scrim. `prefers-reduced-motion` honoured throughout.

### 1.3 Verified facts this plan relies on (checked in the repo on 2026-10-27)

| Fact | Status |
|---|---|
| `npx tsc --noEmit` passes on the current tree | yes (exit 0) |
| lucide-react 0.468 exports `Vibrate, Activity, Bike, Ship, Server, GraduationCap, TreePine, X, ArrowUpRight, ChevronLeft, ChevronRight, FileText` | yes |
| `@types/react` 19.2.14 types the `inert?: boolean` prop | yes |
| Tailwind 3.4.19 ships `h-dvh` / `h-svh` and arbitrary variants (`[&>section]:!py-6`) | yes |
| framer-motion 11.18 has `AnimatePresence`, `useReducedMotion`, `useDragControls`, `dragListener` | yes |
| Only real logo: `public/orbs/emmetts-logo-light.png` (960×839, cream on transparent). `emmetts-logo.png` is near-black and unusable on dark glass | yes |
| Photo luminance audit (mean 0–255): hapbe-1 **220**, lecturly-2 **226**, lecturly-3 **224** (white pages: unusable as glass texture); lecturly-1 55, cluster-1 29, jetboat-1 86, rowtech-1 101, bikecomputer-1 131, bikecomputer-2 127 | measured |
| `About.tsx` root is `<section id="about" className="py-32 px-6">` with a `<h2>` "About" and `sm:` two-column grids keyed to viewport width | yes |
| `Nav.tsx` links to `#about/#projects/#contact` (dead on `/orbs`), so `/orbs` needs its own header | yes |

---

## 2. Architecture

### 2.1 Route and files

```
app/orbs/page.tsx                  server component: metadata + <Background/> + <OrbsPage/>
components/orbs/
  orbFaces.ts                      per-slug presentation map (label, tier, hue, icon, logo?, photo, mono), CENTER config, PANEL_ORDER, hostOf()
  physics.ts                       pure TS engine: P constants, Body/World types, createWorld, layoutWorld, spawn, stepWorld, grab/release/applyImpulse
  useOrbPhysics.ts                 client hook: rAF accumulator, pointer input, tap/drag/fling, keyboard, resize, visibility, reduced motion, DOM writes
  OrbMark.tsx                      the logo-or-icon slot shared by orb faces and panel headers
  Orb.tsx + Orb.module.css         one orb <button> with its layered glass face
  OrbField.tsx                     the stage: SVG guide + link lines, 8 orbs, hint band; wires the hook
  OrbsPage.tsx                     client shell: selection state, hash sync, breakpoint + panel mode, top bar, <OrbField/>, <DetailPanel/>
  DetailPanel.tsx                  drawer / sheet shell: framer enter/exit, scrim, focus, Esc, ←/→, swipe-to-close
  ProjectPanel.tsx                 project content rendered from a Project
  AboutPanel.tsx                   identity header + the existing <About/> inside an override wrapper
docs/orb-prototype-plan.md         this document
```

### 2.2 Data flow

```
lib/projects.ts ──► orbFaces.ts (adds label/tier/hue/icon/logo/photo per slug; never copies prose)
                └─► ProjectPanel.tsx (title, subtitle, category, years, role, status, summary, tags, href, images, specs, sections)
components/About.tsx ──► AboutPanel.tsx (rendered unchanged inside a wrapper)
components/Background.tsx ──► app/orbs/page.tsx (reused unchanged)

OrbsPage (state: selected: 'about' | slug | null; vw; isDesktop)
  ├─ computes panelMode + rightInset ──► OrbField ──► useOrbPhysics (layout free rect)
  ├─ <OrbField selected onSelect onClose rightInset skipBloom/>   (stage; orbs call onSelect on tap/Enter)
  └─ <DetailPanel selected mode onClose onNavigate/>               (renders ProjectPanel or AboutPanel)
```

- **Selection** lives in `OrbsPage`. Orbs are controlled: `data-selected` and `aria-expanded` come from props.
- **Physics state** lives in a ref inside `useOrbPhysics`; React never re-renders per frame. The hook writes `style.transform` on the eight buttons and the SVG line/ellipse attributes directly.
- **Layout inputs** to the hook: stage size (ResizeObserver) and `rightInset` (drawer width when the stage reflows, else 0).

### 2.3 Reuse rules

- Every project string comes from `lib/projects.ts`. `orbFaces.ts` adds only labels (`"HapBe"`, `"Trading Cluster"`, `"Emmett's"`), hues, icons and photo picks.
- The About body is `<About />` itself. The About panel header adds only the name, the role line and three links (these five words of identity are not the About content).
- `Background` is imported as is. `Nav` is **not** imported.

---

## 3. Physics model

### 3.1 Engine choice

Custom semi-implicit (symplectic) Euler in `components/orbs/physics.ts`, pure TypeScript, no React/DOM imports, so it can be unit-tested in Node.

Why not matter-js: eight circles, four force types and 28 collision pairs are ~230 lines; matter-js (~90 KB) needs an SSR guard, a renderer bridge, its own clock, and gives rigid billiard contacts with none of the soft spring, hover-magnet, speed-gated push or ring-follow behaviour we want.

**Fixed timestep (graft from Design 0):** `DT = 1/120 s`, accumulator with at most 4 substeps per frame, frame delta clamped to 50 ms, remainder dropped when the cap is hit (the sim slows, never spirals). The feel is identical on 60 Hz and 120 Hz displays and on throttled phones. Clock reset on `visibilitychange`. Stability margin: stiffest spring is the drag spring, ω·DT = √1600/120 = 0.33 (limit 2).

### 3.2 Units, bodies, masses

Units are px and seconds; stiffness `k` is per unit mass (s⁻²), so mass only enters collisions and the pointer field.

```ts
type Body = {
  id: string;                     // 'about' | project slug
  kind: 'center' | 'project';
  tier: 'center' | 'big' | 'small';
  r: number;                      // current radius (set at layout, never per frame)
  x: number; y: number; vx: number; vy: number;
  hx: number; hy: number;         // home (recomputed every substep: ring follow + drift)
  offX: number; offY: number;     // ring offset from the ring centre (set at layout)
  theta0: number;                 // un-jittered slot angle (bloom spawn direction)
  phase: number;                  // drift phase = 1.7 * index
  invMass: number;                // project 1, centre 1/4
  held: boolean;
  ramp: number;                   // tether engagement 0..1 (free flight after a fling)
  rampDur: number;                // seconds for ramp to reach 1
};
type PointerInput = { active: boolean; x: number; y: number; speed: number };  // stage coords, speed px/s
type World = { bodies: Body[]; centre: Body; free: Rect; cx: number; cy: number; s: number; Rx: number; Ry: number; t: number; bloomAt: number | null; reduced: boolean };
```

### 3.3 Constants (`export const P` in physics.ts — the only place numbers live)

Lengths marked **L** are multiplied by the fit scale `s` at layout time (`L(v) = v * world.s`). Stiffness (s⁻²), damping (s⁻¹) and ratios are not scaled.

```ts
export const P = {
  // integrator
  DT: 1 / 120, MAX_SUBSTEPS: 4, MAX_FRAME_DT: 0.05,
  // chrome + layout
  TOP_BAR: 56, HINT_BAND: 40, REFLOW_MIN_FREE_W: 480,
  FIT_REF: 820, FIT_MIN: 0.66, FIT_MAX: 1.15,
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
} as const;
```

**Reduced-motion overrides** (applied inside `stepWorld` when `world.reduced`): `DRIFT_AMP = 0`, `POINTER_ACCEL = 0`, `PUSH_ACCEL = 0`, `HOVER_K = 0`, `TETHER_ZETA = CENTER_ZETA = 1.0`, `COLLIDE_REST = 0`, `FLING_FREE_S = KEY_FREE_S = 0`, no bloom (spawn at home).

### 3.4 Layout (`layoutWorld(world, stageW, stageH, rightInset)`)

Runs on mount, on every ResizeObserver callback, and whenever `rightInset` changes. Bodies are never teleported; their homes move and the tethers glide them (~1 s), which is the panel-open "constellation slides left" animation for free.

```
free = { x: 0, y: TOP_BAR, w: stageW - rightInset, h: stageH - TOP_BAR - HINT_BAND }
s    = clamp(min(free.w, free.h) / FIT_REF, FIT_MIN, FIT_MAX)
rC = round(R_CENTER*s); rBig = round(R_BIG*s); rSmall = round(R_SMALL*s)
Rx = min(free.w/2 - rBig - RING_MARGIN*s, RING_RX_MAX*s)
Ry = min(free.h/2 - rBig - RING_MARGIN*s, RING_RY_MAX*s)
C  = (free.x + free.w/2, free.y + free.h/2)
for i in 0..6 (data order):
  theta0_i = -90° + i*360°/7
  theta_i  = theta0_i + (((i*7919) % 13) - 6)°                 // deterministic ±6° jitter
  kr_i     = 1 + 2*RADIAL_JITTER*((((i*104729) % 7)/6) - 0.5)  // 0.97..1.03
  off_i    = (kr_i*Rx*cos theta_i, kr_i*Ry*sin theta_i)
// ringFit guard: the nearest slot must clear the sun
minD = min_i |off_i|;  need = rC + rBig + RING_CLEARANCE
if minD < need: f = (minD - RING_CLEARANCE) / (rC + rBig); rC *= f; rBig *= f; rSmall *= f
write r per body; write width/height = 2r on each orb button (only here, never per frame)
```

Verified results of this exact procedure:

| Viewport | inset | s | rC / rBig / rSmall | Rx × Ry | note |
|---|---|---|---|---|---|
| 1440×900 | 0 | 0.98 | 108 / 75 / 63 | 353 × 294 | |
| 1440×900 | 480 (project drawer) | 0.98 | 108 / 75 / 63 | 353 × 294 | glides left 240 px, no shrink |
| 1440×900 | 640 (About drawer) | 0.98 | 107 / 74 / 62 | 310 × 293 | |
| 1280×720 | 480 | 0.76 | 84 / 58 / 49 | 274 × 228 | |
| 1024×768 | 480 | 0.66 | 73 / 50 / 42 | 206 × 199 | free.w 544 ≥ 480 → reflow |
| 1024×768 | 640 | — | — | — | free.w would be 384 < 480 → **overlay mode**, inset 0 |
| 390×844 | 0 | 0.66 | 73 / 50 / 42 | 129 × 198 | nearest slot 133 px ≥ 131 needed |
| 360×740 | 0 | 0.66 | 66 / 45 / 38 | 114 × 198 | ringFit 0.91 applied |
| 844×390 (landscape phone) | 0 | 0.66 | 43 / 30 / 25 | 238 × 81 | ringFit 0.59; small but valid |
| 1920×1080 | 0 | 1.15 | 126 / 87 / 74 | 414 × 345 | |

**Floor rule (graft):** the stage reflows only when `stageW - drawerW >= REFLOW_MIN_FREE_W (480)`. Otherwise the drawer overlays the stage with a scrim and `rightInset` stays 0 (see §5.1 panel modes).

### 3.5 Spawn and bloom (`spawnWorld`)

- Normal: each project orb spawns **just outside the sun along its un-jittered slot direction**: `p_i = C + (rC + r_i + BLOOM_CLEARANCE) · (cos θ0_i, sin θ0_i)`, `v = 0`, `ramp = 1`. On a 187 px spawn ring the seven orbs are 162 px apart centre-to-centre versus 140 needed, so there is no overlap pop. `world.bloomAt = world.t`. The tethers carry them out with one 21 px overshoot; everything is at rest at ~1.9 s. Verified in 2-D with collisions: max transient overlap 26 px (hidden by the contact ramp), farthest excursion 420 px vs the wall at 444 px.
- Contact ramp: collision correction and impulses are multiplied by `clamp((t - bloomAt - 0.3) / 0.6, 0, 1)`; 1 when `bloomAt` is null.
- Reduced motion **or** a deep-link hash present at mount: spawn exactly at home, `bloomAt = null`.

### 3.6 The step (`stepWorld(world, dt, input)`), run once per substep

```
t += dt
ringC = C + RING_FOLLOW * (centre.p - C)                     // graft: homes follow the hub
for each project b: b.home = ringC + b.off + drift(b)         // drift = DRIFT_AMP*(cos(W1 t + phase), sin(W2 t + 1.7 phase)); 0 for the centre / reduced
centre.home = C

for each body b:
  if b.held:
    a = DRAG_K*(ptr - p) - DRAG_C*v                            // critically damped follow; lag 25 px at 600 px/s, 50 px at 1200
  else:
    k = b.kind==='center' ? CENTER_K : TETHER_K;  zeta likewise;  c = 2*zeta*sqrt(k)
    damp = b.ramp*c + (1 - b.ramp)*FREE_DAMP                    // free flight right after a fling
    a = b.ramp*k*(home - p) - damp*v
    if input.active:
      f    = b.kind==='center' ? CENTER_FIELD_SCALE : 1
      d    = ptr - p;  dist = |d|  (if dist < 1e-3 skip the field)
      gain = clamp((input.speed - GAIN_V0) / (GAIN_V1 - GAIN_V0), 0, 1)   // 0 = slow pointer, 1 = fast sweep
      // attraction with a soft core (slow pointer): lean ≤ ~27 px
      if dist < POINTER_REACH:
        a += f*(1-gain) * POINTER_ACCEL * (1 - dist/POINTER_REACH)^2 / sqrt(dist^2 + POINTER_CORE^2) * d
      // velocity-gated shove (fast pointer): parts the field
      if gain > 0 and dist < PUSH_REACH:
        a -= f*gain * clamp(input.speed/GAIN_V1, 1, PUSH_SPEED_SCALE_MAX) * PUSH_ACCEL * (1 - dist/PUSH_REACH)^2 / sqrt(dist^2 + PUSH_CORE^2) * d
      // hover magnet: only the orb the pointer is inside, only when the pointer is slow
      if dist < b.r:
        a += (1-gain) * HOVER_K * d * min(1, HOVER_MAX/dist)
  v += a*dt;  if |v| > MAX_V: v *= MAX_V/|v|;  p += v*dt
  b.ramp = min(1, b.ramp + dt / b.rampDur)   (rampDur > 0 only after a fling or key impulse)

collisions, all 28 pairs (i<j):
  d = pj - pi; dist = |d|; if dist < 1e-3: d = (1,0), dist = 1e-3        // NaN guard (Design 1 defect fixed)
  minD = ri + rj + COLLIDE_GAP
  if dist < minD:
    n = d/dist; ov = minD - dist
    imi = held_i ? 0 : invMass_i; imj likewise; tot = imi+imj; if tot == 0: continue
    corr = COLLIDE_CORRECT * max(ov - COLLIDE_SLOP, 0) * contactRamp     // fractional, not full-overlap (graft)
    pi -= n*corr*imi/tot; pj += n*corr*imj/tot
    vn = (vj - vi)·n
    if vn < 0: J = -(1 + COLLIDE_REST)*vn/tot * contactRamp; vi -= n*J*imi; vj += n*J*imj

walls (free rect inset WALL_INSET): clamp x to [free.x+8+r, free.x+free.w-8-r], y likewise;
  on a clamp where v points outward: v_n *= -WALL_REST
```

Pointer accelerations and the push are divided by nothing else: the centre's `CENTER_FIELD_SCALE` plays the role of its mass in the field; `invMass` plays it in collisions.

### 3.7 Pointer and touch model (in `useOrbPhysics`)

- **Position/presence.** Stage-level `pointermove` sets `input.x/y` (clientX/Y − stage rect; the rect is read per event, cheap because the loop only mutates transforms). Mouse: `active` from `pointerenter` to `pointerleave` of the stage (the drawer and the top bar are siblings, so entering them switches the field off). Touch/pen: `active` from `pointerdown` (anywhere on the stage) to `pointerup`/`pointercancel`. Nothing stays leaning toward a lifted finger.
- **Speed estimate.** On each move: `v = hypot(dx,dy) / max((e.timeStamp - lastT)/1000, 0.004)`; `speed = SPEED_EMA*speed + (1-SPEED_EMA)*v`. Each frame, if the last move is older than `SPEED_STALE_MS`, `speed *= exp(-SPEED_DECAY*frameDt)`. So a fast sweep (≥ 1500 px/s) parts the field; stop moving and within ~100 ms the field is an attractor again.
- **Grab.** `pointerdown` on an orb: `e.preventDefault()` (kills mouse-compat events, image drag, double-tap zoom), `setPointerCapture`, `body.held = true`, record `{x, y, t}`, set `data-held="true"` on the button (state change, not per frame). The held orb ignores all forces except the drag spring and has inverse mass 0 in collisions (it bulldozes neighbours, including the sun).
- **Release.** `pointerup`: `held = false`, `data-held` removed. If moved `< TAP_MAX_PX` and held `< TAP_MAX_MS` → **tap** → `onTap(id)`. Else → **fling**: keep the body's velocity × `FLING_GAIN`, unless the last pointermove is older than `FLING_STALE_MS` (the user stopped, then let go → "place", `v = 0`); set `ramp = 0, rampDur = FLING_FREE_S` so the orb flies freely for a third of a second before the tether reels it in. In both cases set `suppressClickUntil = now + 50 ms`.
- **`pointercancel`** (system gesture, palm rejection): release with `v = 0`, no tap, clear `suppressClickUntil`.
- **Native click.** `onClick` on the orb: ignore if `performance.now() < suppressClickUntil`; otherwise open (this is the keyboard Enter/Space path).
- **Stage tap to close (desktop, reflow mode).** `pointerdown` whose target is the stage element itself records an origin; `pointerup` within 8 px / 350 ms calls `onStageTap()`.
- **Keyboard.** `onKeyDown` on a focused orb: Arrow keys → `applyImpulse(id, dir * KEY_IMPULSE*s)` with `ramp = 0, rampDur = KEY_FREE_S`, `preventDefault()` (no page scroll). The orb hops ~115 px and glides back (verified).
- **Visibility.** `document.hidden` → cancel rAF; visible → `last = performance.now()`, restart.
- **Sleep (reduced motion only).** If nothing is held, no pointer is active and every body is within 0.5 px of home with |v| < 1 px/s, stop the loop; `wake()` on any pointerdown, orb keydown, relayout or selection change. In normal mode the drift keeps the loop alive (8 transforms per frame, compositor-only).

### 3.8 What the numbers do (simulated with the constants above, 1/120 step)

| Scenario | Result |
|---|---|
| Cursor approaches a 76 px orb at 150 / 400 / 800 / 2000 px/s and stops on it | hovered every time; the orb settles 24–49 px from the cursor, inside its own radius; lean from home 43–52 px (attraction + magnet) |
| Cursor parked on the orb, then departs at 200 / 500 / 1000 px/s | the orb follows 52 / 32 / 16 px before the cursor leaves it (was ~75 px with the old 90/14 magnet) |
| Fast sweep at 1500 px/s past orbs 0 / 40 / 80 / 120 / 160 px off the path | displaced 105 / 163 / 127 / 87 / 52 px, settled within ~2.5 s; at 2500 px/s the same within ±10 % |
| Slow sweep at 400 px/s | no push (gain 0); orbs lean ≤ 48 px toward the passing cursor |
| Drag 100 px off home, release at 1200 px/s | coasts 175 px more (free flight), returns with 33 px overshoot, at rest 2.2 s after release |
| Max-speed fling (2600 px/s) from home | flies 420 px, 52 px overshoot on return, settles 2.3 s |
| Project orb at 1500 px/s hits the resting sun (mass 4) | max overlap 8.7 px for a frame or two, sun knocked 16 px, ring follows 11 px, project rebounds at ~100 px/s |
| Project orb at 1500 px/s hits a resting neighbour | neighbour knocked 116 px, max overlap 9.4 px |
| Drag the sun 300 px over 0.5 s and release | ring homes shift 196 px, projects trail their homes by up to 114 px (the whip), sun back at rest 0.9 s after release |
| Bloom | one 21 px overshoot, all at rest by 1.9 s |

Tuning ranges for the live pass (edit `P` only): `POINTER_ACCEL` 1200–2000, `PUSH_ACCEL` 10000–20000, `HOVER_K` 40–80, `TETHER_ZETA` 0.45–0.65, `DRAG_K` 1200–2500 (keep `DRAG_C = 2√DRAG_K`), `FLING_FREE_S` 0.25–0.45, `COLLIDE_CORRECT` 0.3–0.5. Rejected after simulation: speed-saturated damping (55 % return overshoot for ~35 px of extra coast) and lower `TETHER_K` (floaty, 3 s settles).

---

## 4. Visuals

### 4.1 Sizes

| | Desktop (s = 1) | Phone 390 px (s = 0.66) |
|---|---|---|
| Central orb | 220 px | 146 px |
| Big tier (projects with a public site: HapBe, RowTech, Lecturly, Emmett's) | 152 px | 100 px |
| Small tier (BikeComputer, RC Jetboat, Trading Cluster) | 128 px | 84 px |
| Name inside orb | 14 / 12 px Space Grotesk 600 | hidden; name in a rim pill |
| Caption (project number) | 9 px mono #666, md+ only | hidden |

Z-order (CSS, changed only by state): small tier 1, big tier 2, `:hover` 3, `[data-selected]` 4, `[data-held]` 5.

### 4.2 Orb anatomy (`Orb.tsx` + `Orb.module.css`)

```html
<button class="orb" data-orb="rowtech" data-kind="project" data-tier="big" data-selected="false"
        style="--hue:24; --photo-pos:50% 32%; --photo-opacity:.55; width:152px; height:152px"
        aria-label="RowTech. Data analytics for crew teams and athletes. Open project" aria-haspopup="dialog" aria-expanded="false">
  <span class="inner">                 <!-- CSS hover/selected scale lives here, with a transition -->
    <span class="body" />              <!-- glass gradient + shadow stack + tinted halo -->
    <span class="photo"><Image fill sizes="160px" alt="" draggable={false} /></span>   <!-- optional, masked -->
    <span class="tint" />
    <span class="gloss" />
    <span class="content"><OrbMark/><span class="name">RowTech</span><span class="caption">02</span></span>
  </span>
  <span class="pill" aria-hidden="true">RowTech</span>   <!-- phones only -->
</button>
```

**Ownership rule:** the physics loop writes `transform` on `.orb` only; every CSS transition lives on `.inner`/`.photo`/`.body`. Never put a transition on `.orb`.

CSS module (hex values are the site's):

- `.orb`: `position:absolute; left:0; top:0; border-radius:9999px; padding:0; border:0; background:none; will-change:transform; opacity:0; transition:opacity .4s; cursor:grab; touch-action:none; user-select:none; -webkit-tap-highlight-color:transparent; z-index:1`. `.ready .orb { opacity:1 }` (the stage gets `.ready` after the first layout). `[data-tier="big"]{z-index:2}` `:hover{z-index:3}` `[data-selected="true"]{z-index:4}` `[data-held="true"]{z-index:5; cursor:grabbing}`. `:focus-visible{outline:2px solid #60a5fa; outline-offset:4px}`.
- `.inner`: `position:absolute; inset:0; border-radius:inherit; transition: transform .35s cubic-bezier(.2,.8,.2,1)`. `@media (hover:hover){ .orb:hover .inner { transform:scale(1.06) } }`. `.orb[data-selected="true"] .inner { transform:scale(1.12) }`.
- `.body` (project): `background: radial-gradient(circle at 35% 28%, #272727 0%, #141414 42%, #0a0a0a 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.09), inset 0 -22px 34px rgba(0,0,0,.6), 0 0 0 1px #1e1e1e, 0 28px 48px -24px rgba(0,0,0,.9), 0 0 48px -10px hsl(var(--hue) 45% 60% / .22)`. Hover: last shadow `0 0 64px -10px hsl(var(--hue) 45% 60% / .40)`. Selected: add `0 0 0 2px #60a5fa` and the halo becomes `rgba(96,165,250,.45)`. Halos stay desaturated and ≤ .40 so the page stays near-monochrome; hues never colour text.
- `.photo`: `position:absolute; inset:0; border-radius:inherit; overflow:hidden; opacity:var(--photo-opacity,.55); filter:saturate(.25) brightness(.55) contrast(1.05); -webkit-mask-image/mask-image: radial-gradient(circle, #000 52%, transparent 72%); transition: opacity .4s, filter .4s`. Hover (hover:hover): `opacity:.85; filter:saturate(.95) brightness(.7)`. The img: `object-fit:cover; object-position:var(--photo-pos); pointer-events:none; -webkit-user-drag:none; -webkit-touch-callout:none`.
- `.tint`: `radial-gradient(circle at 50% 115%, hsl(var(--hue) 45% 55% / .30), transparent 58%)`. `.gloss`: `radial-gradient(ellipse 60% 40% at 30% 20%, rgba(255,255,255,.13), transparent)`.
- `.content`: `position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:0 12%; text-align:center; pointer-events:none`. `.name`: `font-family:var(--font-space-grotesk); font-weight:600; font-size:14px; line-height:1.15; color:#f0f0f0; text-wrap:balance` (`[data-tier="small"] .name{font-size:12px}`). `.caption`: `font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:9px; letter-spacing:.08em; color:#666`.
- `.pill`: `display:none`. `@media (max-width:767px){ .orb[data-kind="project"] .name, .caption {display:none} .pill{display:block; position:absolute; left:50%; top:calc(100% - 10px); transform:translateX(-50%); white-space:nowrap; border:1px solid #1e1e1e; background:rgba(12,12,12,.9); border-radius:9999px; padding:2px 8px; font:10px ui-monospace,monospace; letter-spacing:.08em; text-transform:uppercase; color:#888; pointer-events:none} }`.
- Reduced motion: `@media (prefers-reduced-motion:reduce){ .inner,.photo{transition:none} .orb:hover .inner{transform:none} .sheen{animation:none} }`.

### 4.3 Face map (`orbFaces.ts`) — the one place to drop real logos

```ts
// Real logo? Drop public/orbs/<slug>.png (light-on-transparent, ~512 px square) and add
// `logo: '/orbs/<slug>.png'` to that slug's entry. The icon stays as the fallback.
// Resolution chain for the mark: logo -> icon -> mono (explicit two letters, never derived).
// Photo: index into project.images, or null for glass + mark only.
export type Face = { label: string; tier: 'big' | 'small'; hue: number; icon: LucideIcon; mono: string;
                     logo?: string; photo: number | null; photoPosition?: string; photoOpacity?: number };

export const FACES: Record<string, Face> = {
  hapbe:             { label: 'HapBe',           tier: 'big',   hue: 268, icon: Vibrate,       mono: 'HB', photo: null },                                      // hapbe-1 is a white CAD render
  rowtech:           { label: 'RowTech',         tier: 'big',   hue: 24,  icon: Activity,      mono: 'RT', photo: 0, photoPosition: '50% 32%' },               // rowtech-1: hub display, orange cable
  bikecomputer:      { label: 'BikeComputer',    tier: 'small', hue: 205, icon: Bike,          mono: 'BC', photo: 1, photoPosition: '50% 45%', photoOpacity: 0.45 }, // bikecomputer-2: powered on
  'rc-jetboat':      { label: 'RC Jetboat',      tier: 'small', hue: 32,  icon: Ship,          mono: 'RJ', photo: 0, photoPosition: '42% 45%' },               // jetboat-1: sunset lake
  'trading-cluster': { label: 'Trading Cluster', tier: 'small', hue: 192, icon: Server,        mono: 'AT', photo: 0, photoPosition: '50% 50%' },               // cluster-1: dark cyan dashboard
  lecturly:          { label: 'Lecturly',        tier: 'big',   hue: 160, icon: GraduationCap, mono: 'LY', photo: 0, photoPosition: '18% 60%' },               // lecturly-1: dark classroom (index 2 is a white page)
  emmetts:           { label: "Emmett's",        tier: 'big',   hue: 135, icon: TreePine,      mono: 'EP', photo: null, logo: '/orbs/emmetts-logo-light.png' },
};
export const CENTER = { name: 'Caden Polk', role: 'Engineer & Founder', location: 'Rocky River, Ohio', cue: 'about ↗', hue: 213 };
export const PANEL_ORDER = ['about', ...projects.map(p => p.slug)];      // prev/next cycles through everything
export const hostOf = (href: string) => new URL(href).host;              // 'Visit rowtech.app'
```

Photo src is `projects.find(p => p.slug === slug)!.images[face.photo]?.src` (Emmett's has no images; `photo: null` plus the guard keeps it safe).

### 4.4 OrbMark (`OrbMark.tsx`)

`<OrbMark face size />`: with `face.logo` → a square `0.46 × orb diameter` (in the panel: `size` px) `next/image` `object-contain` with `alt=""` (the orb's `aria-label` carries the name) and no ring; otherwise a circle (`size` 44 px big / 36 px small on desktop, 36 / 30 on phones, 56 in panel headers) with `background:rgba(255,255,255,.05); box-shadow:0 0 0 1px rgba(255,255,255,.10)` containing the lucide icon at half the circle size, `strokeWidth 1.5`, `#f0f0f0`; if neither logo nor icon, the `mono` letters in Space Grotesk 600.

### 4.5 The central orb

Same shell with `.centerBody`: `background: radial-gradient(circle at 35% 28%, #1b2638 0%, #0e141f 48%, #080a0e 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -28px 44px rgba(0,0,0,.65), 0 0 0 1px #1e2a3a, 0 36px 60px -28px rgba(0,0,0,.95), 0 0 110px -16px rgba(96,165,250,.45)`; a `.sheen` layer `conic-gradient(from 0deg, transparent 0 70%, rgba(96,165,250,.10) 85%, transparent)` rotating 22 s linear (off under reduced motion). Hover scale 1.03 (not 1.06), halo alpha .6. No photo: the blue core is what makes it read as the sun.

Content (all inside `.content`, measured to fit):

| | Desktop (220 px orb) | Phone (146 px orb) |
|---|---|---|
| `Caden Polk` | Space Grotesk 700, 28 px, tracking −.02em, #f0f0f0 (~150 px wide) | 18 px (~100 px) |
| `Engineer & Founder` | mono 10 px uppercase, tracking .16em, #60a5fa (~137 px) | 9 px, tracking .08em (~110 px) |
| `Rocky River, Ohio` | mono 10 px #555 | 9 px |
| `about ↗` | mono 10 px #444, absolutely placed at `bottom:14%`, #f0f0f0 on hover | hidden |

Acceptance test 15 checks that none of these overflow the orb.

### 4.6 Stage and chrome

- `<Background />` reused (dot grid + vignette).
- Stage: `relative h-screen h-dvh w-full overflow-hidden overscroll-none` with `touch-action:none` and `user-select:none` (CSS, never toggled in JS). The page root is also `h-dvh overflow-hidden`, so there is no page scroll at all.
- SVG layer `absolute inset-0 w-full h-full pointer-events-none` (`aria-hidden`), no viewBox so user units are px: (a) the orbit guide `<ellipse>` `stroke #161616 stroke-width 1 stroke-dasharray 2 8 fill none`, `rx/ry` set at layout, `cx/cy` set per frame to the ring centre; (b) seven `<line>`s `stroke #1c1c1c stroke-width 1`, endpoints per frame from the sun's edge to each orb's edge (`u = normalize(orb − sun)`, `x1 = sun + rC·u`, `x2 = orb − r·u`); the selected orb's line has `data-selected="true"` → `stroke #60a5fa; opacity .5` (set on state change).
- Top bar (`OrbsPage`, not `Nav`): `fixed top-0 inset-x-0 h-14 z-40`, inner `max-w-4xl mx-auto px-6 flex items-center justify-between`, mono `text-[13px] sm:text-sm text-[#555] hover:text-[#f0f0f0]`: left `caden polk` → `/`; right `← home` → `/` and `pdf` → `/Caden_Polk_Engineering_Portfolio.pdf` (`target="_blank" rel="noopener noreferrer"`).
- Hint band (inside the stage, bottom 40 px, `pointer-events-none`, `aria-hidden`, mono 11 px #333): bottom-left `drag to fling · click to open` under `@media (hover:hover)`, else `drag an orb · tap to open` (two spans toggled by the CSS module); bottom-right `/orbs — prototype`.
- A visually hidden `<h1>` "Caden Polk — projects as orbs" heads the stage.

---

## 5. Detail UX

### 5.1 Panel modes (decided in `OrbsPage` from `vw`, `isDesktop = (min-width: 768px)`, and the selection)

```
drawerW   = selected === 'about' ? min(640, vw - 48) : min(480, vw - 48)
reflow    = isDesktop && vw - drawerW >= 480
panelMode = !isDesktop ? 'sheet' : reflow ? 'drawer-reflow' : 'drawer-overlay'
rightInset = panelMode === 'drawer-reflow' && selected ? drawerW : 0
overlay   = panelMode !== 'drawer-reflow'
```

| | `drawer-reflow` (desktop, wide) | `drawer-overlay` (desktop, narrow) | `sheet` (< 768 px) |
|---|---|---|---|
| Surface | right drawer, full height under the top bar | right drawer | bottom sheet `h-[88dvh]` |
| Scrim | none; the stage stays live and glides left | `fixed inset-0 bg-[#0c0c0c]/60 backdrop-blur-sm`, click closes | same |
| Stage + top bar wrapper | interactive | `inert` | `inert` |
| `aria-modal` | `false` | `true` | `true` |
| Clicking another orb while open | swaps content in place | n/a (inert) | n/a |

### 5.2 Opening

Tap (pointer moved < 8 px, held < 350 ms) or Enter/Space on an orb → `setSelected(id)` → `history.replaceState(null, '', '#' + id)`. The orb keeps `data-selected="true"` (scale 1.12, 2 px #60a5fa ring, blue link line) while open.

Drawer: `motion.aside` `fixed top-14 right-0 bottom-0 z-50 w-[var(--w)] bg-[#0f0f0f]/[0.92] backdrop-blur-md border-l border-[#1e1e1e] flex flex-col`; `initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring', stiffness:300, damping:34, mass:0.9}}`. Sheet: `fixed inset-x-0 bottom-0 z-50 h-[88dvh] rounded-t-2xl bg-[#0f0f0f] border-t border-[#1e1e1e]`, `y` instead of `x`. Under reduced motion (`useReducedMotion()`): opacity 0→1 over 150 ms instead.

The shell is mounted via `<AnimatePresence>{selected && <DetailPanel key="panel" …/>}</AnimatePresence>` (one key, so switching projects does not remount the shell). Inside, the content is `<AnimatePresence mode="wait"><motion.div key={selected} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}>` so prev/next crossfades.

Scrolling: the content div is `flex-1 overflow-y-auto overscroll-contain px-6 py-6` with `touch-action:pan-y` and `pb-[env(safe-area-inset-bottom)]`; it starts at scrollTop 0 on every open because the shell remounts.

### 5.3 Project panel content (`ProjectPanel.tsx`, every string from `lib/projects.ts`)

1. **Top row**: mono 11 px #444 `02 / 07` (`project.number` / `projects.length`), the status chip (`font-mono text-[10px] text-[#888] border border-[#1e1e1e] px-2 py-0.5 rounded`), close button top-right (lucide `X`, 40×40 hit area, `aria-label="Close"`).
2. **Identity**: `<OrbMark face size={56}/>` beside `<h2 id="orb-panel-title">` title (`font-display text-2xl font-semibold text-[#f0f0f0]`), subtitle (`text-sm text-[#555]`), meta line `category · years · role` (`font-mono text-[11px] text-[#444] uppercase tracking-wider`).
3. **Summary**: `text-base text-[#f0f0f0] leading-relaxed`.
4. **Tags**: exactly the chip markup of `Projects.tsx`.
5. **Actions** (above the images on purpose): if `project.href` → `<a href target="_blank" rel="noopener noreferrer">` `Visit {hostOf(href)} ↗` styled `inline-flex items-center gap-2 h-11 px-5 rounded text-sm font-medium text-[#f0f0f0] border border-[#60a5fa]/40 bg-[#60a5fa]/10 hover:bg-[#60a5fa]/20 transition-colors` with `ArrowUpRight 14`; always a secondary `Full write-up on the home page →` to `/#${slug}` (`font-mono text-[11px] text-[#555] hover:text-[#f0f0f0]`). BikeComputer, RC Jetboat and Trading Cluster have no `href` and simply omit the button.
6. **Images** (omitted when empty): horizontal scroll row `flex gap-3 overflow-x-auto snap-x`; each `relative shrink-0 rounded-md overflow-hidden border border-[#1e1e1e] bg-[#111]` sized `w-28 aspect-[3/4]` (portrait) / `w-60 aspect-[16/10]` (landscape), `next/image fill sizes="(max-width:768px) 60vw, 240px"` with the **real alt** from the data.
7. **Specs** stacked single-column (the drawer is 480 px): `dl` with per-row `div.py-3.border-b.border-[#161616]` > `dt font-mono text-[11px] text-[#444] uppercase tracking-wider` + `dd text-sm text-[#888] leading-relaxed mt-1`.
8. **Sections**: heading `font-mono text-[11px] text-[#60a5fa] uppercase tracking-wider`, body `text-sm text-[#888] leading-relaxed`, optional list as `Projects.tsx` renders it (`grid grid-cols-1 sm:grid-cols-2`).
9. **Footer** `flex justify-between border-t border-[#1e1e1e] pt-4`: `← {prevLabel}` / `{nextLabel} →` buttons (`font-mono text-[11px] text-[#555] hover:text-[#f0f0f0]`), labels from `FACES[slug].label` or `About`, cycling through `PANEL_ORDER` (Emmett's → next is About; About → prev is Emmett's).

### 5.4 About panel content (`AboutPanel.tsx`)

Header: `Caden Polk` (`font-display text-[28px] font-bold`), `Electrical / Mechanical Engineer & Founder` (`text-[#555]`), a mono link row: `Get in touch →` (`/#contact`), `Portfolio (PDF)` (`/Caden_Polk_Engineering_Portfolio.pdf`, new tab), `@notrelaxedd` (`https://x.com/notrelaxedd`). Then

```tsx
<div className="[&>section]:!py-6 [&>section]:!px-0 [&_h2]:hidden">
  <About />
</div>
```

The 640 px drawer (592 px content) keeps About's `sm:` two-column grids readable (144 px label column; nested glance values get ~240 px and wrap to 2–3 lines — acceptable). Below 640 px viewport About collapses to one column by itself. Its `whileInView` reveals fire as the drawer scrolls (IntersectionObserver clips by the scrolling ancestor); if any block stays hidden in testing, gate `<About />` behind the shell's `onAnimationComplete` so it mounts after the drawer has entered.

### 5.5 Closing, switching, deep links, keys

- **Close**: the X, `Esc` (document keydown while open), scrim click (overlay modes), a clean pointerup on empty stage (reflow mode), swipe-down on the sheet (`offset.y > 110 || velocity.y > 600`). On close: `setSelected(null)`, `history.replaceState(null, '', location.pathname + location.search)`, `rightInset` → 0 so the constellation glides back, the ring fades, and **focus returns to the orb that opened the panel** (`document.querySelector('[data-orb="<id>"]')`).
- **Switch in place**: prev/next buttons, `←`/`→` keys while focus is inside the panel (keydown listener on the panel root), or clicking another orb in reflow mode. The shell stays, the content crossfades, the ring and blue line move to the new orb, the hash is replaced. Focus is not moved on a switch.
- **Deep links**: `/orbs#about` and `/orbs#<slug>` open that panel on mount (read `location.hash` in a `useEffect`, never during render; unknown hashes such as `#contact` open nothing). A hash at mount also skips the bloom. Because we use `replaceState`, the phone Back button leaves the page rather than closing the sheet; this is accepted for the prototype.
- **Focus on open**: `requestAnimationFrame(() => closeBtn.focus({ preventScroll: true }))`. The panel is `role="dialog" aria-labelledby="orb-panel-title"`. A strict focus trap on desktop reflow mode is out of scope (the stage is intentionally usable); in overlay modes the inert wrapper is the trap.
- **Sheet drag**: `drag="y" dragControls={controls} dragListener={false} dragConstraints={{top:0,bottom:0}} dragElastic={{top:0,bottom:0.6}}`, and only the 36×4 px `#2a2a2a` handle row calls `controls.start(e)` on `pointerDown`, so scrolling the body never fights the drag.

---

## 6. Mobile and touch

- Sizes at 390 px: sun 146 px, big 100 px, small 84 px; ring 129 × 198 px between the 56 px top bar and the 40 px hint band; nearest slot 133 px from the sun vs 131 px needed (verified). 360 px phones apply the ringFit guard (×0.91).
- Names move to the rim pill below md; captions hidden; sun text 18 / 9 / 9 px, cue hidden.
- `touch-action:none` + `overscroll-behavior:none` on the stage: a finger sweeping empty space drives the field (slow = lean, fast = part), a finger on an orb captures and drags it; `preventDefault` on pointerdown suppresses double-tap zoom and mouse-compat events; images are `draggable={false}` with `-webkit-user-drag:none; -webkit-touch-callout:none` so a long-press opens no menu. Trade-off: pinch-zoom is disabled on the stage only; the sheet and top bar zoom normally.
- Hover styles are gated by `@media (hover:hover)` so nothing sticks after a tap.
- `pointercancel` (system gesture) releases with zero velocity. `pointerup` of a touch clears the field so nothing stays displaced.
- Bottom sheet as in §5; `rightInset` is always 0 below md (the sheet covers the scene, no reflow).
- No horizontal overflow is possible: the stage is `w-full overflow-hidden`, orbs are clamped inside the free rect, pills that poke past the stage edge are clipped, `body` already has `overflow-x:hidden`.
- Performance: per frame 8 `transform` writes and 7 × 4 + 2 SVG attribute writes, no layout properties; `width/height` only on relayout; images have `sizes` and no `priority`.

---

## 7. Accessibility and reduced motion

- Every orb is a native `<button>`; DOM order = tab order = sun first, then projects 01–07. `aria-label` is built from data: `` `${face.label}${project.subtitle ? ', ' + project.subtitle : ''}. ${project.category}. Open project` ``, and `Caden Polk. Engineer and founder. Open about`. `aria-haspopup="dialog"`, `aria-expanded` reflects selection.
- Enter/Space open via native `onClick`; the tap path suppresses the duplicate click for 50 ms. Arrow keys nudge the focused orb; `Esc` closes; `←/→` inside the panel step prev/next.
- `focus-visible`: 2 px `#60a5fa` outline, 4 px offset, follows the circle.
- Focus moves to the close button on open and back to the opener on close.
- Decorative layers (SVG, gloss, tint, face photos, hint band) are `aria-hidden` / `alt=""`; panel images carry the real alt text; Emmett's logo in the panel header has `alt="Emmett's Property Services"`.
- Contrast: names `#f0f0f0` on glass darker than `#272727` (> 12:1); pill text `#888` on `#0c0c0c` (~5:1); hues never colour text.
- **Reduced motion** (`matchMedia('(prefers-reduced-motion: reduce)')` with a change listener in the hook; `useReducedMotion()` for framer): orbs spawn at home, no drift, no pointer field, no magnet, no push, critical damping, zero restitution, no free flight; no hover scale, no photo wake, no sheen; panel transitions are 150 ms fades. Dragging and keyboard nudges still work (they mirror the user's own input) and glide home without overshoot. The loop sleeps at rest (§3.7).

---

## 8. File-by-file build order

Build in this order; each step leaves `npx tsc --noEmit` green. After step 8 the stage is demoable; after step 11 the whole prototype is.

| # | File | Contains | ~LOC | Done when |
|---|---|---|---|---|
| 1 | `components/orbs/orbFaces.ts` | `Face` type, `FACES`, `CENTER`, `PANEL_ORDER`, `hostOf`, `photoSrcFor(slug)` guard, the logo drop-in comment | 70 | compiles; `FACES` has all 7 slugs (add a `satisfies Record<ProjectSlug, Face>`-style check against `projects.map(p => p.slug)` in a dev assertion) |
| 2 | `components/orbs/physics.ts` | `P`, types, `createWorld(ids, tiers)`, `layoutWorld`, `spawnWorld(world, {bloom})`, `stepWorld`, `grab(world,id)`, `release(world,id,{fling})`, `applyImpulse(world,id,vx,vy)`, `isAtRest(world)` | 230 | a 20-line Node script (`npx tsx` or `node --experimental-strip-types`) steps the world 480 times from a bloom spawn and prints every body within 2 px of home with no NaN |
| 3 | `components/orbs/useOrbPhysics.ts` | the hook (§3.7): refs for stage/orbs/lines/ellipse, ResizeObserver + `rightInset` relayout, rAF accumulator, pointer input + speed EMA, orb handlers (`onPointerDown/Up/Cancel/Click/KeyDown`), stage listeners (`pointerenter/move/leave/down/up`), visibility pause, reduced-motion flag, sleep/wake, `ready` state, per-frame DOM writes. Returns `{ stageRef, svgRefs, orbRef(id), lineRef(id), orbHandlers(id), ready }`. StrictMode-safe (world created lazily in a ref; cleanup cancels rAF, disconnects observers, removes listeners) | 260 | — |
| 4 | `components/orbs/OrbMark.tsx` | logo / icon / mono slot with `size` prop | 40 | |
| 5 | `components/orbs/Orb.module.css` then `components/orbs/Orb.tsx` | layered face for `kind='project'` and `kind='center'`, data attributes, aria, `--hue/--photo-pos/--photo-opacity`, pill | 140 + 120 | an orb renders statically with a photo, a mark and a name |
| 6 | `components/orbs/OrbField.tsx` | the stage: hidden `h1`, SVG guide + 7 lines, sun + 7 orbs in data order, hint band; calls the hook with `{ids, tiers, rightInset, skipBloom, onTap, onStageTap}`; sets `data-selected` on orbs and lines from props; `.ready` class | 150 | |
| 7 | `components/orbs/OrbsPage.tsx` | `'use client'`; state `selected`, `vw`, `isDesktop` (matchMedia via `useSyncExternalStore`, server snapshot `false`); hash read on mount + `replaceState` on change; `panelMode`/`rightInset`; `<div inert={overlay && !!selected}>` around top bar + `<OrbField/>`; `<AnimatePresence>` + `<DetailPanel/>` (stubbed until step 11) | 130 | |
| 8 | `app/orbs/page.tsx` | `export const metadata = { title: 'Orbs — Caden Polk', description: 'Caden Polk’s projects as a constellation of orbs: drag, fling, click to open.' }`; renders `<main className="h-dvh overflow-hidden"><Background /><OrbsPage /></main>` | 25 | **checkpoint:** `/orbs` blooms, hover/magnet/drag/fling/tow work on mouse and in Chrome device emulation; `npm run build` passes |
| 9 | `components/orbs/ProjectPanel.tsx` | §5.3 | 160 | |
| 10 | `components/orbs/AboutPanel.tsx` | §5.4 | 50 | |
| 11 | `components/orbs/DetailPanel.tsx` | §5.1–5.5 shell: props `{ selected, mode, onClose, onNavigate(dir) }`; framer enter/exit (drawer x / sheet y / reduced fade), scrim, `useDragControls` sheet, focus in/out, Esc + ←/→, content crossfade, renders `ProjectPanel` or `AboutPanel` | 170 | **checkpoint:** all acceptance criteria below |
| 12 | tuning + device pass | one pass on `P` (ranges in §3.8), iOS Safari and Android Chrome: tap vs drag, long-press, sheet swipe, address-bar collapse relayout | — | |
| 13 | optional polish, behind `const SQUASH = true` in `Orb.tsx` | velocity squash: add a `.squash` span between `.orb` and `.inner` that the hook writes `rotate(θ) scale(1+s,1−s) rotate(−θ)` to, `s = min(|v|/1600, 1) × 0.10`, text layer untouched; skip if time is short or if Safari shows clipping artefacts | 30 | |
| 14 | `docs/orb-prototype-plan.md` | this document | — | |

Dropped on purpose: the fly-mark ghost (reads layout rects mid-spring; both judges flagged it), per-frame proximity glow (hover halo via CSS covers it), orbit rotation.

---

## 9. Acceptance criteria (Playwright, Chromium; `npm run build && npm start`, or `next dev`)

1. **Build.** `npm run build` and `npx tsc --noEmit` exit 0. `git status` shows no changes under `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `components/*.tsx` (top level), `lib/`, `tailwind.config.ts`, `package.json`.
2. **Route and order.** `GET /orbs` → 200. `button[data-orb]` count is 8; their `data-orb` values in DOM order are `about, hapbe, rowtech, bikecomputer, rc-jetboat, trading-cluster, lecturly, emmetts`.
3. **Settled layout (1440×900).** 2.5 s after load every orb's bounding box lies inside the viewport, below `y = 56` and above `y = 860`; for every pair of orbs, centre distance ≥ `r1 + r2 − 4`; the sun's centre is within 12 px of the free-rect centre (720, 458) = (1440/2, 56 + (900 − 56 − 40)/2).
4. **Bloom.** Orb positions sampled at 150 ms and at 2500 ms after load differ by more than 60 px for at least five project orbs (they moved outward), and at 2500 ms all are within 10 px of their 4000 ms positions (at rest, drift allowed).
5. **Hover magnet.** Move the mouse to the RowTech orb's centre, wait 1 s: the orb's centre is within 50 px of the mouse and the orb's `.inner` has a non-identity transform (hover scale).
6. **Click opens a project.** `mouse.down()`/`mouse.up()` on RowTech without moving → `[role="dialog"]` visible; `#orb-panel-title` text is `RowTech`; a link with `href="https://rowtech.app"` and text `Visit rowtech.app ↗` exists; a link with `href="/#rowtech"` exists; `location.hash === '#rowtech'`; the RowTech button has `aria-expanded="true"` and `data-selected="true"`; the text `A load cell inside the rigger` (from `sections[1].body`) is present in the dialog.
7. **Reflow.** 1.5 s after opening, every orb's right edge is `< 1440 − 480`; the dialog is `aria-modal="false"`; the stage wrapper has no `inert` attribute; clicking the Lecturly orb swaps the title to `Lecturly` without the dialog unmounting (same element handle).
8. **Prev/next.** Clicking `next` from Lecturly shows `Emmett's Property Services` with a link to `https://eodlawns.com` and an `img[src*="emmetts-logo-light"]` in the header; pressing `ArrowRight` shows the About panel; `ArrowLeft` returns to Emmett's.
9. **Close and focus.** `Escape` removes the dialog, clears the hash (`location.hash === ''`), and `document.activeElement` is the orb that opened it.
10. **About.** Clicking the sun opens a dialog whose title is `Caden Polk`, containing the texts `Design philosophy`, `At a glance`, `Hardware & fabrication` and `Based in`; the dialog has no visible `h2` with text exactly `About`; dialog width is 640 px at 1440 wide.
11. **Drag and fling, no open.** `mouse.down()` on BikeComputer, move 300 px right in 15 steps over ~150 ms, `mouse.up()`: no `[role="dialog"]` appears within 500 ms; 100 ms after release the orb is > 250 px from its pre-drag position; within 3.5 s it is back within 12 px of it.
12. **Keyboard.** Starting from `body`, `Tab` × 4 (three top-bar links first) focuses `[data-orb="about"]`; `Tab` → `hapbe`; `Enter` on HapBe opens the dialog with `Visit hapbe.net ↗` and **no** image strip (HapBe's panel has one image, so the strip exists; assert instead that the Trading Cluster panel has no Visit button); `Escape`; `ArrowRight` on the focused HapBe orb moves it ≥ 40 px within 300 ms and it returns within 10 px by 3 s.
13. **Deep link.** `/orbs#lecturly` → dialog open with title `Lecturly` within 1 s; `/orbs#contact` → no dialog, no console errors.
14. **Mobile (390×844, `hasTouch: true`, `isMobile: true`).** `document.documentElement.scrollWidth <= 390` and `scrollHeight <= 844 + 1`; all 8 orbs inside the viewport; every project orb shows a `.pill` and no visible in-orb name; a `tap()` on RowTech opens a dialog whose top edge is ≥ 60 px below the viewport top (bottom sheet), `aria-modal="true"`, a scrim exists, and the stage wrapper has the `inert` attribute; tapping the scrim closes it.
15. **Sun text fits.** At 390 and at 1440 wide, each text element inside `[data-orb="about"]` has `scrollWidth <= clientWidth` and its bounding box is inside the sun's bounding box.
16. **Faces.** `[data-orb="emmetts"] img[src*="emmetts-logo-light"]` exists; `[data-orb="hapbe"]` contains an `svg` and no `img`; `[data-orb="rowtech"] img[src*="rowtech-1"]`, `[data-orb="lecturly"] img[src*="lecturly-1"]`, `[data-orb="bikecomputer"] img[src*="bikecomputer-2"]` exist; no `<link rel="preload" as="image">` for any `/projects/` image.
17. **Reduced motion.** With `page.emulateMedia({ reducedMotion: 'reduce' })`: orb positions at 200 ms and 2000 ms after load differ by < 1 px; hovering an orb for 1 s moves it < 1 px; a 300 px drag still moves the orb > 250 px and it glides back within 10 px by 3 s without ever overshooting the home side by more than 2 px; opening a panel takes < 300 ms and the dialog has no `transform` other than identity.
18. **Tab hidden.** After `page.evaluate` dispatching `visibilitychange` with `document.hidden` stubbed true then false, the page keeps animating (positions change over the next second) and no orb jumped more than 30 px across the resume.

---

## 10. Judge input: adopted or rejected

| Item | Decision |
|---|---|
| J1 graft 1 / J1 concern: velocity-gated shove with soft core | **Adopted.** Blend `gain(speed)` from attractor to push (§3.6); constants from simulation. |
| J1 graft 2 / J1 concern: RING_FOLLOW 0.7, heavy finite centre | **Adopted.** `CENTER_MASS 4`, `CENTER_K 60` (2.3× projects), homes follow the hub; the sun is draggable and towable. |
| J1 graft 3 / both judges' drawer-crush concern | **Adopted.** Fit scale `s` (floor 0.66, not 0.7, so seven orbs fit a 390 px phone), 480 px reflow floor, About drawer capped at 640 px. |
| J1 graft 4 / concern: fixed 1/120 accumulator | **Adopted.** |
| J1 graft 5: velocity squash + proximity glow | **Partially adopted.** Squash is optional step 13 on its own layer; the per-frame glow is replaced by the CSS hover halo. |
| J1 graft 6: arrow-key impulse, project number, pointercancel, inert during the sheet, swipe-down | **Adopted** (number is the md+ caption). |
| J1 graft 7 / J2 concern: face chain, `photo: null`, host-derived CTA, PANEL_ORDER | **Adopted.** Explicit monos (HB, RT, BC, RJ, AT, LY, EP) are the last fallback; icons render today. |
| J1 graft 8: keep-mounted dialog, inert on desktop too | **Rejected in part.** `inert`/scrim/`aria-modal=true` only in overlay modes: the desktop reflow exists so the stage stays usable and other orbs can be clicked (J2 graft 8, J1's own aria-modal concern). Keep-mounted is replaced by a single `AnimatePresence` shell keyed once: scroll reset, focus path and About's reveals come free, framer drag needs no reset bookkeeping. |
| J1 graft 9: reduced motion never starts the loop | **Rejected.** The loop runs with ambient forces zeroed and sleeps at rest (J2 graft 10), so drag and keyboard nudges still work. |
| J1 grafts 10–11: `h-dvh`, sizes on relayout only, rim pill on phones | **Adopted** (pill for all project orbs below md, for consistency). |
| J1 concern: Lecturly photo index, photo audit | **Adopted.** lecturly-1, hapbe null, bikecomputer-2 at opacity .45, cluster-1, jetboat-1, rowtech-1 (luminance measured). |
| J1 concern: bloom pop | **Adopted.** Tight-cluster spawn outside the sun + contact ramp; verified. |
| J1 concern: fractional positional correction | **Adopted.** 0.4 per substep with 0.5 px slop. |
| J1 concern: magnet stickiness | **Adopted.** `HOVER_K 60 / HOVER_MAX 10`, magnet and attraction scaled by `(1 − gain)`. |
| J1 concern: centre text on phones | **Adopted.** 18 / 9 px, tracking .08em; acceptance test 15. |
| J1 concern: pointer lifecycle | **Adopted.** `pointercancel`, timestamp-based click suppression, listener cleanup. |
| J1 concern: fly-mark ghost; per-frame z-index | **Dropped / adopted** (z-index only on state change). |
| J1 concern: monochrome halos | **Adopted.** Desaturated hues, alpha .22 rest / .40 hover, never on text. |
| J1 concern: About reuse | **Adopted** with the `onAnimationComplete` fallback. |
| J1 concern: hash/back button | **Stated** in §5.5. |
| J2 grafts 1–12 (fling, pointer hardening, free rect, bloom ramp, face material, OrbMark, selected state, live desktop stage, visibility pause, RM loop, arrow keys + hint swap, tiers + CTA) | **All adopted.** |
| J2 concerns: suppressClick, free-rect bounds, explicit monograms, selected state, visibility, centre draggable, no `priority`, RM drag, transform ownership, hash in effect, `[&_h2]:hidden`, own header | **All adopted.** |
| Design 1's own defects: NaN normal at zero distance, centre with inverse mass 0, `photoIndex 2`, 760 px About drawer | **Fixed** (§3.6 guard, finite mass, index 0, 640 px). |

---

## 11. Risks and how to handle them

1. **Feel is numeric, not played.** Every constant was simulated, not felt. Do one tuning pass on `P` only, in this order: `POINTER_ACCEL`, `HOVER_K`, `PUSH_ACCEL`, `TETHER_ZETA`, `FLING_FREE_S`. Do not touch the integrator.
2. **Synthetic click after a drag.** Chrome fires `click` on the captured button after `pointerup`. The `suppressClickUntil` timestamp (50 ms) handles it; `pointercancel` clears it. If a fling ever opens the panel, this is the first place to look.
3. **`preventDefault` on pointerdown stops focus-on-click.** Expected; the opener is tracked explicitly (`data-orb` lookup) so focus restore still works, and keyboard focus is unaffected.
4. **Transform fights.** Physics owns `transform` on `.orb`; every CSS transition is on `.inner`/`.photo`/`.body`. Adding a transition to `.orb` will make hover scale jitter.
5. **`<About />` inside the drawer.** The arbitrary-variant overrides compile under Tailwind 3.4.19; `whileInView` fires inside a clipped scroll ancestor. Fallback: mount About after `onAnimationComplete`. Its `sm:` grids key off the viewport, so at 768–1023 px the nested glance values are narrow; acceptable.
6. **iOS specifics.** `touch-action:none` must be in CSS before the first touch (it is, in the module); `100dvh` needs Safari 15.4+ (`h-screen` fallback is declared first); the address bar collapsing changes the stage height, which the ResizeObserver relayouts; long-press is suppressed by `-webkit-touch-callout:none` and `draggable={false}`. Budget an hour of device testing.
7. **Light photos read dead.** Switching any slug to `photo: null` is one edit. If BikeComputer still looks flat at opacity .45, null it.
8. **Short or landscape viewports.** The ringFit guard shrinks orbs (844×390 → 86 px sun). Valid, just small. Not worth special-casing in a prototype.
9. **Hash deep links use `replaceState`.** Phone Back leaves the page. Switching to `pushState` + `popstate` is ~15 lines if the demo needs it.
10. **Tab visibility.** Resume resets the clock; the 50 ms frame clamp and 4-substep cap stop any catch-up burst. Do not raise `MAX_SUBSTEPS`.
11. **Per-frame cost on low-end phones.** 8 transforms + 30 SVG attributes per frame. If jank appears, write the lines every other frame; never write `width/height` per frame.
12. **framer drag vs. scroll on the sheet.** Only the handle row starts the drag (`dragListener={false}` + `useDragControls`). If the body still fights, remove drag and rely on the scrim/X to close.
13. **Hydration.** Server HTML renders orbs at `translate(0,0)` with `opacity:0`; nothing reads `window` during render; `.ready` flips after the first layout. A visible jump from the top-left means an effect ran before layout.
14. **Pointer leave while dragging.** Pointer capture keeps delivering moves to the orb even outside the stage; the stage's `pointerleave` may fire mid-drag and switch the field off for the *other* orbs, which is fine. Do not clear `held` on stage leave.
15. **StrictMode double effects** in dev. The hook creates the world lazily in a ref and its cleanup is complete (rAF, observers, listeners), so the second mount is clean.
16. **Hover magnet geometry vs. DOM hover.** The magnet uses geometric containment (`dist < r`) in the engine, independent of `:hover`, so it also works for a stationary touch; CSS hover handles visuals only.
