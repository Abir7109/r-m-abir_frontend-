import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="mx-auto flex min-h-[86svh] w-full max-w-6xl items-center gap-10 px-6 py-10">
      <div className="flex-1">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">R.M.ABIR.71</h1>
        <p className="mt-4 max-w-xl text-balance text-zinc-300">
          Crafting digital experiences with clarity and precision.
        </p>
        <div className="mt-6 flex gap-3">
          <a href="#projects" className="rounded-full bg-white/10 px-5 py-2 text-sm text-white hover:bg-white/15">View Projects</a>
          <a href="#contact" className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:bg-white/5">Contact</a>
        </div>
      </div>
      <div className="flex-1">
        <Image src="/portrait.jpg" alt="Portrait" width={560} height={740} priority unoptimized sizes="(min-width: 1024px) 560px, (min-width: 640px) 50vw, 90vw" className="mx-auto h-auto max-h-[520px] w-auto rounded-xl border border-white/10 object-cover shadow-2xl shadow-black/40" />
      </div>
    </section>
  );
}
