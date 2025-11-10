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
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="#home" className="text-base font-semibold tracking-wide text-white">
          R.M.ABIR.71
        </Link>
        <nav className="hidden gap-6 md:flex">
          {nav.map((i) => (
            <a key={i.href} href={i.href} className="text-zinc-300 hover:text-white hover:underline underline-offset-4">
              {i.label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-200 hover:bg-white/5">Contact</a>
      </div>
    </header>
  );
}
