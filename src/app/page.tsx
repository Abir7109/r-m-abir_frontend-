import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import Projects from "@/components/Projects";
import Shortcuts from "@/components/Shortcuts";
import Social from "@/components/Social";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main className="min-h-[100svh] w-full">
      <Shortcuts />
      <Social />
      <Header />
      <Hero />

      <section id="gallery" className="px-6 py-16">
        <h2 className="glow mx-auto max-w-6xl text-2xl font-semibold">Gallery</h2>
        <div className="mt-4">
          <Gallery />
        </div>
      </section>

      <section id="projects" className="px-6 py-16">
        <h2 className="glow mx-auto max-w-6xl text-2xl font-semibold">Projects</h2>
        <div className="mt-4">
          <Projects />
        </div>
      </section>

      <section id="about" className="px-6 py-16">
        <h2 className="glow mx-auto max-w-6xl text-2xl font-semibold">About</h2>
        <p className="mx-auto mt-2 max-w-6xl text-zinc-300/80">Bio, timeline, and neon-framed media.</p>
      </section>

      <section id="contact" className="px-6 pb-16">
        <h2 className="glow mx-auto max-w-6xl text-2xl font-semibold">Contact</h2>
        <div className="mx-auto mt-4 max-w-6xl">
          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
