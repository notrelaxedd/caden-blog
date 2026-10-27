"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "about", href: "#about" },
  { label: "projects", href: "#projects" },
  { label: "contact", href: "#contact" },
  { label: "pdf", href: "/Caden_Polk_Engineering_Portfolio.pdf", external: true },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-[#1e1e1e] bg-[#0c0c0c]/90 backdrop-blur-sm" : ""
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#" className="font-mono text-[13px] sm:text-sm text-[#555] hover:text-[#f0f0f0] transition-colors whitespace-nowrap mr-4">
          caden polk
        </a>
        <nav className="flex items-center gap-3.5 sm:gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className="text-[13px] sm:text-sm text-[#555] hover:text-[#f0f0f0] transition-colors font-mono"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
