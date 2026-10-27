"use client";

import Image from "next/image";
import { projects, type Project } from "@/lib/projects";
import { hostOf, type Face } from "./orbFaces";
import OrbMark from "./OrbMark";

type Props = { project: Project; face: Face };

/** Project content rendered from lib/projects.ts (§5.3). Every string comes from the data. */
export default function ProjectPanel({ project, face }: Props) {
  return (
    <div className="flex flex-col gap-8">
      {/* 1. top row (the close button is the shell's, top-right) */}
      <div className="flex items-center gap-3 pr-12">
        <span className="font-mono text-[11px] text-[#444]">
          {project.number} / {String(projects.length).padStart(2, "0")}
        </span>
        <span className="font-mono text-[10px] text-[#888] border border-[#1e1e1e] px-2 py-0.5 rounded">
          {project.status}
        </span>
      </div>

      {/* 2. identity */}
      <div className="flex items-start gap-4">
        <OrbMark face={face} size={56} alt={face.logo ? project.title : ""} />
        <div className="min-w-0">
          <h2 id="orb-panel-title" className="font-display text-2xl font-semibold text-[#f0f0f0] leading-tight">
            {project.title}
          </h2>
          {project.subtitle && <p className="text-sm text-[#555] mt-0.5">{project.subtitle}</p>}
          <p className="font-mono text-[11px] text-[#444] uppercase tracking-wider mt-2">
            {project.category} · {project.years} · {project.role}
          </p>
        </div>
      </div>

      {/* 3. summary */}
      <p className="text-base text-[#f0f0f0] leading-relaxed">{project.summary}</p>

      {/* 4. tags (chip markup of Projects.tsx) */}
      <div className="flex flex-wrap items-center gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="font-mono text-[11px] text-[#444] border border-[#1e1e1e] px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>

      {/* 5. actions, above the images on purpose */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {project.href && (
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-5 rounded text-sm font-medium text-[#f0f0f0] border border-[#60a5fa]/40 bg-[#60a5fa]/10 hover:bg-[#60a5fa]/20 transition-colors"
          >
            Visit {hostOf(project.href)} <span aria-hidden="true">↗</span>
          </a>
        )}
        <a
          href={`/#${project.slug}`}
          className="font-mono text-[11px] text-[#555] hover:text-[#f0f0f0] transition-colors"
        >
          Full write-up on the home page →
        </a>
      </div>

      {/* 6. images */}
      {project.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto snap-x pb-1 -mx-1 px-1" style={{ touchAction: "pan-x pan-y" }}>
          {project.images.map((img) => (
            <div
              key={img.src}
              className={`relative shrink-0 snap-start rounded-md overflow-hidden border border-[#1e1e1e] bg-[#111] ${
                img.orientation === "portrait" ? "w-28 aspect-[3/4]" : "w-60 aspect-[16/10]"
              }`}
            >
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 60vw, 240px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* 7. specs, single column */}
      <dl className="border-t border-[#1e1e1e]">
        {project.specs.map((spec) => (
          <div key={spec.label} className="py-3 border-b border-[#161616]">
            <dt className="font-mono text-[11px] text-[#444] uppercase tracking-wider">{spec.label}</dt>
            <dd className="text-sm text-[#888] leading-relaxed mt-1">{spec.value}</dd>
          </div>
        ))}
      </dl>

      {/* 8. sections */}
      <div className="flex flex-col gap-7">
        {project.sections.map((section) => (
          <div key={section.heading} className="flex flex-col gap-2">
            <h3 className="font-mono text-[11px] text-[#60a5fa] uppercase tracking-wider">{section.heading}</h3>
            <p className="text-sm text-[#888] leading-relaxed">{section.body}</p>
            {section.list && (
              <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {section.list.map((item) => (
                  <li key={item} className="text-sm text-[#666] border-b border-[#161616] py-1">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
