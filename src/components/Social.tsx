"use client";

import { social } from "@/data/social";
import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  WhatsApp: (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.112.544 4.1 1.5 5.843L4 29l8.37-1.46A11.86 11.86 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.74 0-3.36-.45-4.78-1.24l-.34-.19-4.04.71.7-3.95-.2-.34A8.96 8.96 0 0 1 7 15c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm5.18-6.73c-.28-.14-1.64-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.27-.74.9-.9 1.09-.17.19-.33.21-.61.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.66-1.55-1.94-.16-.27-.02-.42.12-.56.12-.12.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.55-.88-2.13-.23-.56-.47-.48-.64-.49-.17-.01-.36-.01-.55-.01-.19 0-.49.07-.75.35-.26.28-1 1-1 2.45s1.02 2.84 1.16 3.04c.14.19 2 3.05 4.86 4.28.68.29 1.21.47 1.62.6.68.21 1.3.18 1.79.11.55-.08 1.64-.67 1.87-1.31.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.53-.32z" />
    </svg>
  ),
  Instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0 0 22 12" />
    </svg>
  ),
  GitHub: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.3-1.3-3.3-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.8.1-.7.4-1.1.7-1.3-2.2-.2-4.5-1.1-4.5-5a4 4 0 0 1 1.1-2.8 3.7 3.7 0 0 1 .1-2.7s.8-.3 2.8 1.1a9.4 9.4 0 0 1 5.1 0c2-1.4 2.8-1.1 2.8-1.1.3.8.3 1.9.1 2.7A4 4 0 0 1 19 12c0 3.9-2.3 4.8-4.6 5 .4.3.8 1 .8 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2" />
    </svg>
  ),
  LinkedIn: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7 0h3.8v2.2h.1c.5-1 1.8-2.2 3.7-2.2 4 0 4.7 2.6 4.7 6V24h-4V15c0-2.1 0-4.8-3-4.8-3 0-3.4 2.3-3.4 4.6V24h-4V8z" />
    </svg>
  ),
};

export default function Social() {
  return (
    <aside className="fixed left-3 top-1/2 z-40 -translate-y-1/2">
      <ul className="flex flex-col gap-3">
        {social.map((s) => (
          <li key={s.name}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="button-neon flex items-center justify-center rounded-full p-2 text-cyan-200/90 hover:text-white"
              aria-label={s.name}
            >
              <span className="sr-only">{s.name}</span>
              {icons[s.name]}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
