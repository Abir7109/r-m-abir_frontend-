"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ open, onClose, children, title }:{ open:boolean; onClose:()=>void; children: React.ReactNode; title?: string; }) {
  const [mounted, setMounted] = useState(false);
  useEffect(()=> setMounted(true), []);
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            className="relative mx-4 w-full max-w-lg rounded-lg border border-white/10 bg-[rgba(0,17,28,0.85)] p-6 text-left shadow-lg backdrop-blur"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            {title && <h3 className="mb-2 glow text-xl font-semibold">{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
