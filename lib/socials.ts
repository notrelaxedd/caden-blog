export interface Social {
  label: string;
  handle: string;
  href: string;
  /** Path to an SVG in public/logos, or null for the built-in icon (email, PDF). */
  logo: string | null;
}

export const socials: Social[] = [
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
