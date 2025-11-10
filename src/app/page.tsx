import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import Projects from "@/components/Projects";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main className="min-h-[100svh] w-full">
      <Header />
      <Hero />

      <section id="gallery" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">Gallery</h2>
          <div className="mt-4">
            <Gallery />
          </div>
        </div>
      </section>

      <section id="projects" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">Projects</h2>
          <div className="mt-4">
            <Projects />
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">About</h2>
          <p className="mt-2 text-zinc-300">Bio, timeline, and more.</p>
        </div>
      </section>

      <section id="contact" className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">Contact</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
