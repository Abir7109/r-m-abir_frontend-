import type { Project, GalleryItem } from "@/types";

export const placeholderProjects: Project[] = [
  {
    title: "Neon Interface Prototype",
    description: "Animated neon UI with strip lights and glow interactions.",
    tech: ["Next.js", "Tailwind", "Framer Motion"],
    liveUrl: "#",
    repoUrl: "#",
    tags: ["UI/UX", "Experimental"],
  },
  {
    title: "Portfolio Core",
    description: "Base layout, theme toggle, and components scaffold.",
    tech: ["Next.js", "Tailwind"],
    tags: ["Full-stack"],
  },
];

export const placeholderGallery: GalleryItem[] = [
  { url: "/vercel.svg", caption: "Signal", date: "2025-01-01" },
  { url: "/next.svg", caption: "Core", date: "2025-02-02" },
];
