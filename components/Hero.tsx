"use client";

import { motion } from "framer-motion";

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

          {/* Role + handle */}
          <motion.div variants={item} className="flex items-center gap-4 mb-10">
            <span className="text-base text-[#555]">Founder &amp; Engineer</span>
            <span className="text-[#2a2a2a]">—</span>
            <a
              href="https://x.com/notrelaxedd"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-[#444] hover:text-[#60a5fa] transition-colors"
            >
              @notrelaxedd
            </a>
          </motion.div>

          {/* Bio */}
          <motion.p
            variants={item}
            className="text-[#888] text-lg leading-relaxed max-w-lg mb-12"
          >
            I build things that either help people or get out of their way.
            Right now that means assistive hardware and tools for teachers.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex items-center gap-6">
            <a
              href="#projects"
              className="text-sm font-medium text-[#f0f0f0] border border-[#2a2a2a] px-5 py-2.5 rounded hover:border-[#444] hover:bg-[#161616] transition-all duration-150"
            >
              See the work
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
