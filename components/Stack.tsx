"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const stack = [
  { name: "Next.js",     logo: "/logos/nextjs.svg" },
  { name: "TypeScript",  logo: "/logos/typescript.svg" },
  { name: "Supabase",    logo: "/logos/supabase.svg" },
  { name: "Vercel",      logo: "/logos/vercel.svg" },
  { name: "Framer",      logo: "/logos/framer.svg" },
  { name: "GitHub",      logo: "/logos/github.svg" },
  { name: "Claude Code", logo: "/logos/claude.svg" },
];

export default function Stack() {
  return (
    <section id="stack" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-mono text-[#444] uppercase tracking-widest mb-12"
        >
          Stack
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-3"
        >
          {stack.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2.5 border border-[#1e1e1e] bg-[#111] px-4 py-2.5 rounded hover:border-[#333] transition-colors duration-150"
            >
              <Image
                src={tech.logo}
                alt={tech.name}
                width={16}
                height={16}
                className="object-contain opacity-80"
              />
              <span className="text-sm text-[#888] font-medium">{tech.name}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
