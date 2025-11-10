export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="strip strip-animated" />
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-400">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="glow text-zinc-300">This isn’t just a site. It’s a signal.</p>
          <p>© {new Date().getFullYear()} R.M.ABIR.71</p>
        </div>
      </div>
    </footer>
  );
}
