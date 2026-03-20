"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  status: string;
}

const projects: Project[] = [
  {
    title: "HapBe",
    description:
      "Wearable haptic device for deaf users. Translates environmental audio and speech into vibration patterns on the wrist. Working prototype — currently iterating on the encoding scheme.",
    tags: ["Hardware", "Embedded", "Accessibility"],
    status: "WIP",
  },
  {
    title: "GradeAI",
    description:
      "Grading and lesson planning tool for teachers. Gemini handles rubric-based grading and first-draft lesson plans so educators spend less time on admin.",
    tags: ["Next.js", "Supabase", "Gemini"],
    status: "WIP",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-mono text-[#444] uppercase tracking-widest mb-12"
        >
          Projects
        </motion.h2>

        <div className="flex flex-col">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group py-8 border-t border-[#1e1e1e] first:border-t-0"
            >
              <div className="flex items-start justify-between gap-8">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold font-display text-[#f0f0f0]">
                      {project.title}
                    </h3>
                    <span className="font-mono text-xs text-[#444]">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-[#666] text-sm leading-relaxed mb-4 max-w-xl">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[11px] text-[#444] border border-[#1e1e1e] px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right — link */}
                {project.href && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-[#333] hover:text-[#f0f0f0] transition-colors shrink-0"
                  >
                    <ArrowUpRight size={18} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}

          {/* Placeholder */}
          <div className="py-8 border-t border-[#1e1e1e]">
            <p className="font-mono text-xs text-[#2a2a2a]">more soon</p>
          </div>
        </div>

      </div>
    </section>
  );
}
