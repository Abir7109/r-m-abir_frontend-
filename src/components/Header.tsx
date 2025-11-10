"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const nav = [
  { href: "#home", label: "Home" },
  { href: "#gallery", label: "Gallery" },
  { href: "#projects", label: "Projects" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="strip strip-animated" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="#home" className="glow text-lg font-bold tracking-wide">
          R.M.ABIR.71
        </Link>
        <nav className="hidden gap-6 md:flex">
          {nav.map((i) => (
            <a key={i.href} href={i.href} className="text-zinc-200/80 hover:text-white">
              {i.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              className="button-neon rounded-full px-3 py-1 text-sm"
              onClick={() => setTheme(theme === "magenta" ? "dark" : "magenta")}
              aria-label="Toggle theme"
            >
              {theme === "magenta" ? "Cyan" : "Magenta"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
