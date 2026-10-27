"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { Face } from "./orbFaces";

type Props = {
  face: Face;
  /** Pixel size (panel headers: 56). Omit inside an orb and size it with `className` instead. */
  size?: number;
  /** Alt for a real logo; the orb's aria-label carries the name, so orbs pass "". */
  alt?: string;
  className?: string;
};

/** The logo-or-icon slot shared by orb faces and panel headers. Chain: logo -> icon -> mono. */
export default function OrbMark({ face, size, alt = "", className = "" }: Props) {
  const style = size !== undefined ? { width: size, height: size } : undefined;

  if (face.logo) {
    return (
      <span className={`relative block shrink-0 ${className}`} style={style} data-mark="logo">
        <Image
          src={face.logo}
          alt={alt}
          fill
          sizes={size !== undefined ? `${size}px` : "120px"}
          className="object-contain"
          draggable={false}
        />
      </span>
    );
  }

  // Chain: logo -> icon -> mono. The type requires an icon; the mono letters guard a missing one at runtime.
  const Icon = face.icon as LucideIcon | undefined;
  return (
    <span
      className={`flex items-center justify-center rounded-full shrink-0 ${className}`}
      style={{ ...style, background: "rgba(255,255,255,.05)", boxShadow: "0 0 0 1px rgba(255,255,255,.10)" }}
      data-mark={Icon ? "icon" : "mono"}
    >
      {Icon ? (
        <Icon strokeWidth={1.5} color="#f0f0f0" aria-hidden="true" style={{ width: "50%", height: "50%" }} />
      ) : (
        <span
          className="font-display font-semibold text-[#f0f0f0] leading-none"
          style={{ fontSize: size !== undefined ? Math.round(size * 0.36) : "40%" }}
        >
          {face.mono}
        </span>
      )}
    </span>
  );
}
