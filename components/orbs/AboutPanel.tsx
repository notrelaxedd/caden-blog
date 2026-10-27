"use client";

import About from "@/components/About";

/** Identity header plus the existing <About/> rendered unchanged inside an override wrapper (§5.4). */
export default function AboutPanel() {
  return (
    <div>
      <div className="flex flex-col gap-2 pr-12">
        <h2 id="orb-panel-title" className="font-display text-[28px] font-bold text-[#f0f0f0] leading-tight">
          Caden Polk
        </h2>
        <p className="text-[#555]">Electrical / Mechanical Engineer &amp; Founder</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-[#555] mt-1">
          <a href="/#contact" className="hover:text-[#f0f0f0] transition-colors">
            Get in touch →
          </a>
          <a
            href="/Caden_Polk_Engineering_Portfolio.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f0f0f0] transition-colors"
          >
            Portfolio (PDF)
          </a>
          <a
            href="https://x.com/notrelaxedd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f0f0f0] transition-colors"
          >
            @notrelaxedd
          </a>
        </div>
      </div>

      <div className="[&>section]:!py-6 [&>section]:!px-0 [&_h2]:hidden">
        <About />
      </div>
    </div>
  );
}
