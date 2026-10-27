import Background from "@/components/Background";
import OrbsPage from "@/components/orbs/OrbsPage";

/** The orbs are the home page. The long-form version of the site lives at /projects. */
export default function Home() {
  return (
    <main className="h-dvh overflow-hidden">
      <Background />
      <OrbsPage />
    </main>
  );
}
