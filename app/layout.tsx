import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Caden Polk — Electrical / Mechanical Engineer & Founder",
  description:
    "Electrical and mechanical engineer in Rocky River, Ohio. I build cheaper, better alternatives to overpriced products: assistive hardware, data tools for crew athletes, and software for teachers and small businesses.",
  openGraph: {
    title: "Caden Polk — Electrical / Mechanical Engineer & Founder",
    description:
      "Assistive hardware, data tools for crew athletes, and software for teachers and small businesses. HapBe, RowTech, Lecturly, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
