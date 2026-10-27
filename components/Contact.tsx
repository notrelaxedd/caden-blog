"use client";

import { motion } from "framer-motion";
import ContactCards from "./ContactCards";

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
            Pick a platform, or email me directly. Based in Rocky River, Ohio.
          </p>

          <ContactCards />
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
