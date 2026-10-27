import type { Metadata } from "next";
import Background from "@/components/Background";
import OrbsPage from "@/components/orbs/OrbsPage";

export const metadata: Metadata = {
  title: "Orbs — Caden Polk",
  description: "Caden Polk’s projects as a constellation of orbs: drag, fling, click to open.",
};

export default function Page() {
  return (
    <main className="h-dvh overflow-hidden">
      <Background />
      <OrbsPage />
    </main>
  );
}
