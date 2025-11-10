import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-[92svh] flex-col items-center justify-center px-6 text-center">
      <div className="strip strip-animated absolute inset-x-0 top-20" />
      <h1 className="glow text-4xl font-bold tracking-tight sm:text-6xl">R.M.ABIR.71</h1>
      <p className="mt-4 max-w-2xl text-balance text-zinc-200/90">
        Crafting Digital Realities. One Pixel at a Time.
      </p>

      <div className="mt-8 flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-12">
        <div className="neon-avatar-wrapper">
          <Image
            src="/portrait.jpg"
            alt="Portrait"
            width={320}
            height={480}
            priority
            className="neon-avatar h-80 w-56 rounded-xl object-cover sm:h-96 sm:w-72"
          />
        </div>
        <div className="flex gap-4">
          <a href="#gallery" className="button-neon rounded-full px-6 py-2">Explore My Universe</a>
          <a href="#projects" className="button-neon rounded-full px-6 py-2">Projects</a>
        </div>
      </div>

      <div className="strip strip-animated absolute inset-x-0 bottom-20" />
    </section>
  );
}
