import type { Metadata } from "next";
import Background from "@/components/Background";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Projects — Caden Polk",
};

export default function ProjectsPage() {
  return (
    <main>
      <Background />
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Contact />
    </main>
  );
}
