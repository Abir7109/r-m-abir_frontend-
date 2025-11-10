"use client";

import { useEffect } from "react";

const ids = ["home", "gallery", "projects", "about", "contact"];

export default function Shortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const idx = parseInt(e.key, 10) - 1;
      if (!Number.isNaN(idx) && ids[idx]) {
        document.getElementById(ids[idx])?.scrollIntoView({ behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
