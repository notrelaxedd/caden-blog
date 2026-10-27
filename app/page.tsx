import Background from "@/components/Background";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
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
