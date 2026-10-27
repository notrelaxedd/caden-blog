"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { projects, type Project } from "@/lib/projects";

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);

  // Deep links like /projects#rowtech open that project, on load and on a same-page hash change.
  useEffect(() => {
    const check = () => {
      if (window.location.hash === `#${project.slug}`) setOpen(true);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [project.slug]);

  const panelId = `${project.slug}-details`;

  return (
    <motion.article
      id={project.slug}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index, 3) * 0.08 }}
      className="border-t border-[#1e1e1e] first:border-t-0 scroll-mt-20"
    >
      <div className="flex items-start gap-4 sm:gap-8 py-8">
        {/* Number */}
        <span className="font-mono text-xs text-[#333] pt-1.5 w-6 shrink-0 select-none">
          {project.number}
        </span>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="group w-full text-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                  <h3 className="text-xl font-semibold font-display text-[#f0f0f0]">
                    {project.title}
                  </h3>
                  {project.subtitle && (
                    <span className="text-sm text-[#555]">{project.subtitle}</span>
                  )}
                  <span className="font-mono text-[11px] text-[#444]">{project.status}</span>
                </div>
                <p className="font-mono text-[11px] text-[#444] uppercase tracking-wider mb-3">
                  {project.category} · {project.years} · {project.role}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`mt-1.5 shrink-0 text-[#333] group-hover:text-[#888] transition-all duration-200 ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </div>

            <p className="text-[#888] text-sm leading-relaxed mb-4 max-w-xl">
              {project.summary}
            </p>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[11px] text-[#444] border border-[#1e1e1e] px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-[#555] hover:text-[#f0f0f0] transition-colors"
              >
                {project.href.replace(/^https?:\/\//, "")}
                <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            )}
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                key="details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <ProjectDetails project={project} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

function ProjectDetails({ project }: { project: Project }) {
  return (
    <div className="pt-8 flex flex-col gap-10">
      {project.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {project.images.map((img) => (
            <div
              key={img.src}
              className={`relative shrink-0 rounded-md overflow-hidden border border-[#1e1e1e] bg-[#111] ${
                img.orientation === "portrait" ? "w-40 sm:w-48 aspect-[3/4]" : "w-72 sm:w-96 aspect-[16/10]"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 60vw, 400px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Specs */}
      <dl className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-0 border-t border-[#1e1e1e]">
        {project.specs.map((spec) => (
          <div key={spec.label} className="contents">
            <dt className="font-mono text-[11px] text-[#444] uppercase tracking-wider pt-3 sm:py-3 sm:border-b sm:border-[#161616]">
              {spec.label}
            </dt>
            <dd className="text-sm text-[#888] leading-relaxed pb-3 pt-1 sm:py-3 border-b border-[#161616]">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Narrative */}
      <div className="flex flex-col gap-8">
        {project.sections.map((section) => (
          <div key={section.heading} className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-2">
            <h4 className="font-mono text-[11px] text-[#60a5fa] uppercase tracking-wider pt-0.5">
              {section.heading}
            </h4>
            <div>
              <p className="text-sm text-[#888] leading-relaxed max-w-2xl">{section.body}</p>
              {section.list && (
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 max-w-2xl">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-[#666] border-b border-[#161616] py-1"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-baseline justify-between mb-12"
        >
          <h2 className="text-sm font-mono text-[#444] uppercase tracking-widest">Projects</h2>
          <p className="font-mono text-[11px] text-[#333]">click a project for the full write-up</p>
        </motion.div>

        <div className="flex flex-col">
          {projects.map((project, i) => (
            <ProjectRow key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
