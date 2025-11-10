"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/types";
import Modal from "@/components/Modal";

async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("failed");
    return res.json();
  } catch {
    const { placeholderProjects } = await import("@/data/placeholder");
    return placeholderProjects;
  }
}

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => { fetchProjects().then(setItems); }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = {
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      tech: String(form.get("tech") || "").split(",").map(s=>s.trim()).filter(Boolean),
      liveUrl: String(form.get("liveUrl") || ""),
      repoUrl: String(form.get("repoUrl") || ""),
      tags: String(form.get("tags") || "").split(",").map(s=>s.trim()).filter(Boolean),
    };
    try {
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [created, ...prev]);
        setOpen(false);
      } else {
        alert("Failed to add project (check MONGODB_URI on server)");
      }
    } catch {
      alert("Network error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-zinc-300/80">Interactive cards with tech stack and previews.</p>
        <button className="button-neon rounded-full px-4 py-1" onClick={()=>setOpen(true)}>Add New Project</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((p, i) => (
          <motion.article key={(p._id||"")+i}
            className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4"
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2 }}
          >
            <h3 className="glow text-lg font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-zinc-300/80">{p.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-cyan-200/80">
              {p.tech?.map((t) => (
                <span key={t} className="rounded-full border border-cyan-400/30 px-2 py-0.5">{t}</span>
              ))}
            </div>
            <div className="mt-3 flex gap-3 text-sm">
              {p.liveUrl && <a className="button-neon rounded px-2 py-0.5" href={p.liveUrl} target="_blank">Live</a>}
              {p.repoUrl && <a className="button-neon rounded px-2 py-0.5" href={p.repoUrl} target="_blank">Repo</a>}
            </div>
          </motion.article>
        ))}
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title="Add Project">
        <form className="space-y-3" onSubmit={onSubmit}>
          <input name="title" placeholder="Title" className="w-full rounded border border-white/10 bg-black/20 px-3 py-2" required />
          <textarea name="description" placeholder="Description" className="w-full rounded border border-white/10 bg-black/20 px-3 py-2" required />
          <input name="tech" placeholder="Tech (comma separated)" className="w-full rounded border border-white/10 bg-black/20 px-3 py-2" />
          <input name="tags" placeholder="Tags (comma separated)" className="w-full rounded border border-white/10 bg-black/20 px-3 py-2" />
          <input name="liveUrl" placeholder="Live URL" className="w-full rounded border border-white/10 bg-black/20 px-3 py-2" />
          <input name="repoUrl" placeholder="Repo URL" className="w-full rounded border border-white/10 bg-black/20 px-3 py-2" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={()=>setOpen(false)} className="rounded border border-white/10 px-3 py-1">Cancel</button>
            <button type="submit" className="button-neon rounded px-3 py-1">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
