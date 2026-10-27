"use client";

import { useEffect } from "react";
import { projects } from "@/lib/projects";
import { ABOUT_ID, faceFor } from "./orbFaces";
import Orb from "./Orb";
import type { Tier } from "./physics";
import { useOrbPhysics, type OpenVia } from "./useOrbPhysics";
import styles from "./Orb.module.css";

type Props = {
  selected: string | null;
  onSelect: (id: string, via: OpenVia) => void;
  onClose: () => void;
  rightInset: number;
  /** Read in the hook's mount effect; true means a deep link is present, so spawn at home. */
  skipBloom: () => boolean;
  /** True while the stage wrapper is inert (overlay panel modes); clears any stale pointer field. */
  inert?: boolean;
};

const IDS: string[] = [ABOUT_ID, ...projects.map((p) => p.slug)];
const TIERS: Tier[] = ["center", ...projects.map((p) => faceFor(p.slug).tier)];

export default function OrbField({ selected, onSelect, onClose, rightInset, skipBloom, inert = false }: Props) {
  const { stageRef, ellipseRef, orbRef, lineRef, squashRef, orbHandlers, ready, wake, clearPointer } = useOrbPhysics({
    ids: IDS,
    tiers: TIERS,
    rightInset,
    skipBloom,
    onTap: onSelect,
    onStageTap: onClose,
  });

  useEffect(() => {
    wake();
  }, [selected, wake]);

  useEffect(() => {
    if (inert) clearPointer();
  }, [inert, clearPointer]);

  return (
    <div
      ref={stageRef}
      data-stage
      className={`relative h-screen h-dvh w-full overflow-hidden overscroll-none ${styles.stage} ${ready ? styles.ready : ""}`}
    >
      <h1 className="sr-only">Caden Polk — projects as orbs</h1>

      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none">
        <ellipse ref={ellipseRef} className={styles.guide} />
        {projects.map((p) => (
          <line
            key={p.slug}
            ref={lineRef(p.slug)}
            className={styles.line}
            data-selected={selected === p.slug ? "true" : "false"}
          />
        ))}
      </svg>

      <Orb
        kind="center"
        selected={selected === ABOUT_ID}
        handlers={orbHandlers(ABOUT_ID)}
        orbRef={orbRef(ABOUT_ID)}
        squashRef={squashRef(ABOUT_ID)}
      />
      {projects.map((p) => (
        <Orb
          key={p.slug}
          kind="project"
          project={p}
          face={faceFor(p.slug)}
          selected={selected === p.slug}
          handlers={orbHandlers(p.slug)}
          orbRef={orbRef(p.slug)}
          squashRef={squashRef(p.slug)}
        />
      ))}

      <div className={styles.hint} aria-hidden="true">
        <span>
          <span className={styles.hintMouse}>drag to fling · click to open</span>
          <span className={styles.hintTouch}>drag an orb · tap to open</span>
        </span>
      </div>
    </div>
  );
}
