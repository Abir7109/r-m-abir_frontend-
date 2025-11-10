"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { GalleryItem } from "@/types";

async function fetchGallery(): Promise<GalleryItem[]> {
  try {
    const res = await fetch("/api/gallery");
    if (!res.ok) throw new Error("failed");
    return res.json();
  } catch {
    const { placeholderGallery } = await import("@/data/placeholder");
    return placeholderGallery;
  }
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  useEffect(() => { fetchGallery().then(setItems); }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((g, i) => (
          <motion.a key={i} href={g.url} target={g.url.startsWith("http")?"_blank":"_self"}
            className="group relative block overflow-hidden rounded-lg border border-white/10 bg-white/5"
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url} alt={g.caption ?? ""} className="h-32 w-full object-contain" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5 group-hover:ring-white/15" />
            {g.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-zinc-200">
                {g.caption}
              </div>
            )}
          </motion.a>
        ))}
      </div>
    </div>
  );
}
