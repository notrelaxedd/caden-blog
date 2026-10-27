"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 pt-14">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div variants={container} initial="hidden" animate="visible">

          {/* Name */}
          <motion.h1
            variants={item}
            className="text-[clamp(3rem,10vw,7rem)] font-bold leading-[0.95] tracking-tight text-[#f0f0f0] font-display mb-6"
          >
            Caden Polk
          </motion.h1>

          {/* Role + handle + location */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-10"
          >
            <span className="text-base text-[#555]">
              Electrical / Mechanical Engineer &amp; Founder
            </span>
            <span className="text-[#2a2a2a] hidden sm:inline">—</span>
            <a
              href="https://x.com/notrelaxedd"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-[#444] hover:text-[#60a5fa] transition-colors"
            >
              @notrelaxedd
            </a>
            <span className="text-[#2a2a2a] hidden sm:inline">—</span>
            <span className="font-mono text-sm text-[#444]">Rocky River, Ohio</span>
          </motion.div>

          {/* Bio */}
          <motion.p
            variants={item}
            className="text-[#888] text-lg leading-relaxed max-w-xl mb-12"
          >
            Technology grows faster than most people&apos;s understanding of it,
            so a lot of products get away with charging far more than they
            should. Most of what I build is a cheaper, better alternative to one
            of those: assistive hardware, data tools for crew athletes, and
            software for teachers and small businesses.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#projects"
              className="text-sm font-medium text-[#f0f0f0] border border-[#2a2a2a] px-5 py-2.5 rounded hover:border-[#444] hover:bg-[#161616] transition-all duration-150"
            >
              See the work
            </a>
            <a
              href="/Caden_Polk_Engineering_Portfolio.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#555] hover:text-[#f0f0f0] transition-colors"
            >
              <FileText size={14} aria-hidden="true" />
              Portfolio (PDF)
            </a>
            <a
              href="#contact"
              className="text-sm text-[#555] hover:text-[#f0f0f0] transition-colors"
            >
              Get in touch →
            </a>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
