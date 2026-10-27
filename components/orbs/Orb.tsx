"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { Project } from "@/lib/projects";
import { ABOUT_ID, CENTER, photoSrcFor, type Face } from "./orbFaces";
import OrbMark from "./OrbMark";
import type { OrbHandlers } from "./useOrbPhysics";
import styles from "./Orb.module.css";

/** Step 13: velocity squash. The hook writes `rotate(θ) scale(1+s, 1−s) rotate(−θ)` to a `.squash` span
 *  that wraps the visual layers only, so the name text is never deformed. Set to false to drop the layer. */
export const SQUASH = true;

type Common = {
  selected: boolean;
  handlers: OrbHandlers;
  orbRef: (el: HTMLButtonElement | null) => void;
  squashRef?: (el: HTMLSpanElement | null) => void;
};
type ProjectOrbProps = Common & { kind: "project"; project: Project; face: Face };
type CenterOrbProps = Common & { kind: "center" };
export type OrbProps = ProjectOrbProps | CenterOrbProps;

export default function Orb(props: OrbProps) {
  if (props.kind === "center") return <CenterOrb {...props} />;
  return <ProjectOrb {...props} />;
}

/** Visual layers, wrapped in the squash span when enabled. */
function Layers({ squashRef, children }: { squashRef?: (el: HTMLSpanElement | null) => void; children: ReactNode }) {
  if (!SQUASH) return <>{children}</>;
  return (
    <span className={styles.squash} ref={squashRef} aria-hidden="true">
      {children}
    </span>
  );
}

function ProjectOrb({ project, face, selected, handlers, orbRef, squashRef }: ProjectOrbProps) {
  const photo = photoSrcFor(project.slug);
  const style = {
    "--hue": face.hue,
    "--photo-pos": face.photoPosition ?? "50% 50%",
    "--photo-opacity": face.photoOpacity ?? 0.55,
  } as CSSProperties;
  const label = `${face.label}${project.subtitle ? ", " + project.subtitle : ""}. ${project.category}. Open project`;

  return (
    <button
      type="button"
      ref={orbRef}
      className={styles.orb}
      data-orb={project.slug}
      data-kind="project"
      data-tier={face.tier}
      data-selected={selected ? "true" : "false"}
      style={style}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={selected}
      {...handlers}
    >
      <span className={styles.inner}>
        <Layers squashRef={squashRef}>
          <span className={styles.body} />
          {photo && (
            <span className={styles.photo} aria-hidden="true">
              <Image src={photo} alt="" fill sizes="160px" draggable={false} />
            </span>
          )}
          <span className={styles.tint} aria-hidden="true" />
          <span className={styles.gloss} aria-hidden="true" />
        </Layers>
        <span className={styles.content}>
          <OrbMark face={face} className={face.logo ? styles.markLogo : styles.mark} />
          <span className={styles.name}>{face.label}</span>
          <span className={styles.caption}>{project.number}</span>
        </span>
      </span>
      <span className={styles.pill} aria-hidden="true">
        {face.label}
      </span>
    </button>
  );
}

function CenterOrb({ selected, handlers, orbRef, squashRef }: CenterOrbProps) {
  const style = { "--hue": CENTER.hue } as CSSProperties;
  return (
    <button
      type="button"
      ref={orbRef}
      className={styles.orb}
      data-orb={ABOUT_ID}
      data-kind="center"
      data-tier="center"
      data-selected={selected ? "true" : "false"}
      style={style}
      aria-label="Caden Polk. Engineer and founder. Open about"
      aria-haspopup="dialog"
      aria-expanded={selected}
      {...handlers}
    >
      <span className={styles.inner}>
        <Layers squashRef={squashRef}>
          <span className={styles.centerBody} />
          <span className={styles.sheen} aria-hidden="true" />
          <span className={styles.gloss} aria-hidden="true" />
        </Layers>
        <span className={styles.content}>
          <span className={styles.centerName}>{CENTER.name}</span>
          <span className={styles.centerRole}>{CENTER.role}</span>
          <span className={styles.centerLoc}>{CENTER.location}</span>
          <span className={styles.centerCue}>{CENTER.cue}</span>
        </span>
      </span>
    </button>
  );
}
