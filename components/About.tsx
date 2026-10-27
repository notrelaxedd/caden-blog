"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Box,
  CircuitBoard,
  Code,
  Cpu,
  Microchip,
  Printer,
  Terminal,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const glance = [
  { label: "Focus", value: "Electrical / Mechanical Engineering" },
  { label: "Building since", value: "2024" },
  {
    label: "Fabrication",
    value: "3D printing: 8 years · CAD: 3 years · Soldering: 3 years · PCB design: 1 year",
  },
  { label: "Firmware / languages", value: "Arduino, C/C++" },
  {
    label: "Software",
    value: "Onshape for 3D design · Arduino IDE and Claude Code for code · Next.js and Tailwind CSS for software design",
  },
  { label: "Based in", value: "Rocky River, Ohio" },
];

type Tool = { name: string; logo?: string; icon?: LucideIcon };

const toolGroups: { title: string; tools: Tool[] }[] = [
  {
    title: "Hardware & fabrication",
    tools: [
      { name: "3D printing (Bambu Lab P1S)", icon: Printer },
      { name: "CAD (Onshape)", icon: Box },
      { name: "PCB design", icon: CircuitBoard },
      { name: "Soldering", icon: Wrench },
      { name: "ESP32", icon: Cpu },
      { name: "Raspberry Pi", icon: Microchip },
    ],
  },
  {
    title: "Firmware",
    tools: [
      { name: "Arduino", icon: Code },
      { name: "C / C++", icon: Code },
      { name: "Debian / Linux", icon: Terminal },
    ],
  },
  {
    title: "Software",
    tools: [
      { name: "Next.js", logo: "/logos/nextjs.svg" },
      { name: "TypeScript", logo: "/logos/typescript.svg" },
      { name: "Supabase", logo: "/logos/supabase.svg" },
      { name: "Vercel", logo: "/logos/vercel.svg" },
      { name: "GitHub", logo: "/logos/github.svg" },
      { name: "Claude Code", logo: "/logos/claude.svg" },
    ],
  },
];

export default function About({ contact }: { contact?: React.ReactNode }) {
  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-mono text-[#444] uppercase tracking-widest mb-12"
        >
          About
        </motion.h2>

        {/* Design philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-3 mb-16"
        >
          <h3 className="font-mono text-[11px] text-[#60a5fa] uppercase tracking-wider pt-1">
            Design philosophy
          </h3>
          <p className="text-[#f0f0f0] text-lg leading-relaxed max-w-2xl">
            I believe that the exponential growth of technology, combined with
            the slow growth toward the understanding of it amongst the general
            population, creates many imbalances, causing many consumers to
            overpay for or overvalue products and services that can be done
            cheaper, better, or more efficiently. Many of my projects aim to
            &ldquo;level the playing field&rdquo; by providing alternatives to
            the current solutions that hold a monopoly over the market.
          </p>
        </motion.div>

        {/* Contact (only where a caller supplies it, e.g. the orb's About panel) */}
        {contact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-3 mb-16"
          >
            <h3 className="font-mono text-[11px] text-[#60a5fa] uppercase tracking-wider pt-1">
              Contact
            </h3>
            <div>{contact}</div>
          </motion.div>
        )}

        {/* At a glance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-3 mb-16"
        >
          <h3 className="font-mono text-[11px] text-[#60a5fa] uppercase tracking-wider pt-3">
            At a glance
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-6 border-t border-[#1e1e1e]">
            {glance.map((row) => (
              <div key={row.label} className="contents">
                <dt className="font-mono text-[11px] text-[#444] uppercase tracking-wider pt-3 sm:py-3 sm:border-b sm:border-[#161616]">
                  {row.label}
                </dt>
                <dd className="text-sm text-[#888] leading-relaxed pb-3 pt-1 sm:py-3 border-b border-[#161616]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-8"
        >
          {toolGroups.map((group) => (
            <div
              key={group.title}
              className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-3"
            >
              <h3 className="font-mono text-[11px] text-[#60a5fa] uppercase tracking-wider pt-3">
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-3">
                {group.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-center gap-2.5 border border-[#1e1e1e] bg-[#111] px-4 py-2.5 rounded hover:border-[#333] transition-colors duration-150"
                  >
                    {tool.logo ? (
                      <Image
                        src={tool.logo}
                        alt=""
                        width={16}
                        height={16}
                        className="object-contain opacity-80"
                      />
                    ) : tool.icon ? (
                      <tool.icon size={16} className="text-[#666]" aria-hidden="true" />
                    ) : null}
                    <span className="text-sm text-[#888] font-medium">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
