import {
  Activity,
  Bike,
  GraduationCap,
  Server,
  Ship,
  TreePine,
  Vibrate,
  type LucideIcon,
} from "lucide-react";
import { projects, type Project } from "@/lib/projects";

// Real logo? Drop public/orbs/<slug>.png (light-on-transparent, ~512 px square) and add
// `logo: '/orbs/<slug>.png'` to that slug's entry. The icon stays as the fallback.
// Resolution chain for the mark: logo -> icon -> mono (explicit two letters, never derived).
// Photo: index into project.images, or null for glass + mark only. `photoSrc` swaps in a texture under
// public/orbs (a crop of that image without copy) when the source frame carries legible text.
export type Face = {
  label: string;
  tier: "big" | "small";
  hue: number;
  icon: LucideIcon;
  mono: string;
  logo?: string;
  photo: number | null;
  photoSrc?: string;
  photoPosition?: string;
  photoOpacity?: number;
};

export const FACES: Record<string, Face> = {
  hapbe: { label: "HapBe", tier: "big", hue: 268, icon: Vibrate, mono: "HB", photo: null }, // hapbe-1 is a white CAD render
  rowtech: { label: "RowTech", tier: "big", hue: 24, icon: Activity, mono: "RT", photo: 0, photoPosition: "50% 32%" }, // rowtech-1: hub display, orange cable
  bikecomputer: { label: "BikeComputer", tier: "small", hue: 205, icon: Bike, mono: "BC", photo: 1, photoPosition: "50% 45%", photoOpacity: 0.45 }, // bikecomputer-2: powered on
  "rc-jetboat": { label: "RC Jetboat", tier: "small", hue: 32, icon: Ship, mono: "RJ", photo: 0, photoPosition: "42% 45%" }, // jetboat-1: sunset lake
  "trading-cluster": { label: "Trading Cluster", tier: "small", hue: 192, icon: Server, mono: "AT", photo: 0, photoPosition: "50% 50%" }, // cluster-1: dark cyan dashboard
  lecturly: { label: "Lecturly", tier: "big", hue: 160, icon: GraduationCap, mono: "LY", photo: 0, photoSrc: "/orbs/lecturly-1-orb.webp", photoPosition: "50% 50%" }, // lecturly-1 hero: the headline spans its middle, so the orb uses a text-free classroom crop of it (index 2 is a white page)
  emmetts: { label: "Emmett's", tier: "big", hue: 135, icon: TreePine, mono: "EP", photo: null, logo: "/orbs/emmetts-logo-light.png" },
};

export const CENTER = {
  name: "Caden Polk",
  role: "Engineer & Founder",
  location: "Rocky River, Ohio",
  cue: "about ↗",
  hue: 213,
} as const;

/** The id of the central orb / About panel. */
export const ABOUT_ID = "about";

/** prev/next cycles through everything: About first, then the projects in data order. */
export const PANEL_ORDER: string[] = [ABOUT_ID, ...projects.map((p) => p.slug)];

export const hostOf = (href: string) => new URL(href).host; // 'Visit rowtech.app'

export function isPanelId(id: string | null | undefined): id is string {
  return !!id && PANEL_ORDER.includes(id);
}

export function projectFor(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function faceFor(slug: string): Face {
  const face = FACES[slug];
  if (!face) throw new Error(`orbFaces: no face for slug "${slug}"`);
  return face;
}

/** Photo src for an orb face, or undefined (Emmett's has no images; `photo: null` + this guard keeps it safe). */
export function photoSrcFor(slug: string): string | undefined {
  const face = FACES[slug];
  if (!face || face.photo === null) return undefined;
  return face.photoSrc ?? projectFor(slug)?.images[face.photo]?.src;
}

/** Label for a panel id: a face label or "About". */
export function labelFor(id: string): string {
  return id === ABOUT_ID ? "About" : FACES[id]?.label ?? id;
}

// Dev assertion: every project slug has a face, and every face has a project.
if (process.env.NODE_ENV !== "production") {
  for (const p of projects) {
    if (!FACES[p.slug]) console.error(`orbFaces: FACES is missing an entry for "${p.slug}"`);
  }
  for (const slug of Object.keys(FACES)) {
    if (!projects.some((p) => p.slug === slug)) console.error(`orbFaces: FACES has "${slug}" but lib/projects.ts does not`);
  }
}
