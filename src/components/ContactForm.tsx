"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<string|undefined>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(undefined);
    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name")||""),
      email: String(form.get("email")||""),
      message: String(form.get("message")||""),
    };
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        setStatus("Sent. I’ll get back to you soon.");
        (e.currentTarget as HTMLFormElement).reset();
      } else {
        setStatus("Failed to send. Try again later.");
      }
    } catch {
      setStatus("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mx-auto max-w-3xl space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" placeholder="Your Name" className="rounded border border-white/10 bg-black/20 px-3 py-2" required />
        <input name="email" type="email" placeholder="Email" className="rounded border border-white/10 bg-black/20 px-3 py-2" required />
      </div>
      <textarea name="message" placeholder="Message" className="min-h-32 w-full rounded border border-white/10 bg-black/20 px-3 py-2" required />
      <div className="flex items-center gap-3">
        <button type="submit" className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/15" disabled={loading}>{loading?"Sending...":"Send"}</button>
        {status && <span className="text-sm text-zinc-300/80">{status}</span>}
      </div>
    </form>
  );
}
