"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FileText } from "lucide-react";

const socials = [
  {
    label: "GitHub",
    handle: "@notrelaxedd",
    href: "https://github.com/notrelaxedd",
    logo: "/logos/github.svg",
  },
  {
    label: "X",
    handle: "@notrelaxedd",
    href: "https://x.com/notrelaxedd",
    logo: "/logos/x.svg",
  },
  {
    label: "Instagram",
    handle: "@polk.caden",
    href: "https://instagram.com/polk.caden",
    logo: "/logos/instagram.svg",
  },
  {
    label: "LinkedIn",
    handle: "caden-polk",
    href: "https://www.linkedin.com/in/caden-polk-b904263b3",
    logo: "/logos/linkedin.svg",
  },
  {
    label: "Email",
    handle: "caden@cadenpolk.com",
    href: "mailto:caden@cadenpolk.com",
    logo: null,
  },
  {
    label: "Portfolio",
    handle: "PDF",
    href: "/Caden_Polk_Engineering_Portfolio.pdf",
    logo: null,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-mono text-[#444] uppercase tracking-widest mb-12"
        >
          Contact
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#888] text-base mb-8 leading-relaxed max-w-xl">
            I&apos;m <span className="text-[#f0f0f0]">@notrelaxedd</span> almost
            everywhere. Pick a platform, or email me directly. Based in Rocky
            River, Ohio.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {socials.map((s) => {
              const external = s.href.startsWith("http");
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target={external || s.href.endsWith(".pdf") ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex flex-col gap-3 border border-[#1e1e1e] bg-[#111] rounded-lg p-4 hover:border-[#333] hover:bg-[#161616] transition-all duration-150"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {s.logo ? (
                      <Image
                        src={s.logo}
                        alt=""
                        width={20}
                        height={20}
                        className="object-contain opacity-60 group-hover:opacity-90 transition-opacity"
                      />
                    ) : s.label === "Portfolio" ? (
                      <FileText
                        size={20}
                        className="text-[#555] group-hover:text-[#888] transition-colors"
                        aria-hidden="true"
                      />
                    ) : (
                      /* Email — inline envelope icon */
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[#555] group-hover:text-[#888] transition-colors"
                        aria-hidden="true"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#888] group-hover:text-[#f0f0f0] transition-colors leading-none mb-1">
                      {s.label}
                    </p>
                    <p className="font-mono text-[10px] text-[#333] group-hover:text-[#555] transition-colors truncate">
                      {s.handle}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-24 pt-8 border-t border-[#1a1a1a] flex items-center justify-between">
        <p className="font-mono text-xs text-[#2a2a2a]">Caden Polk {new Date().getFullYear()}</p>
        <p className="font-mono text-xs text-[#2a2a2a]">Next.js · Framer Motion</p>
      </div>
    </section>
  );
}
