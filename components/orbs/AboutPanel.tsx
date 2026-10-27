"use client";

import About from "@/components/About";
import ContactCards from "@/components/ContactCards";

/** Identity header plus the existing <About/> (with the contact cards under the design philosophy) inside an override wrapper (§5.4). */
export default function AboutPanel() {
  return (
    <div>
      <div className="flex flex-col gap-2 pr-12">
        <h2 id="orb-panel-title" className="font-display text-[28px] font-bold text-[#f0f0f0] leading-tight">
          Caden Polk
        </h2>
        <p className="text-[#555]">Electrical / Mechanical Engineer &amp; Founder</p>
        <p className="font-mono text-[11px] text-[#444]">Rocky River, Ohio</p>
      </div>

      <div className="[&>section]:!py-6 [&>section]:!px-0 [&_h2]:hidden">
        <About contact={<ContactCards compact />} />
      </div>
    </div>
  );
}
