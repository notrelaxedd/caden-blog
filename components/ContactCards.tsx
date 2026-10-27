import Image from "next/image";
import { FileText } from "lucide-react";
import { socials } from "@/lib/socials";

/** The grid of contact cards used by the Contact section and by the orb's About panel. */
export default function ContactCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 sm:grid-cols-3 gap-3"}>
      {socials.map((s) => {
        const external = s.href.startsWith("http");
        return (
          <a
            key={s.label}
            href={s.href}
            target={external || s.href.endsWith(".pdf") ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={`group flex flex-col border border-[#1e1e1e] bg-[#111] rounded-lg hover:border-[#333] hover:bg-[#161616] transition-all duration-150 ${
              compact ? "gap-2 p-3" : "gap-3 p-4"
            }`}
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
            <div className="min-w-0">
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
  );
}
