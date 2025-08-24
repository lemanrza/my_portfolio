import React, { useRef } from "react";
import { motion } from "framer-motion";

type MagneticButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export default function MagneticButton({ children, className = "" }: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  function onMove(e: React.MouseEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.setProperty("--tx", `${x * 0.12}px`);
    el.style.setProperty("--ty", `${y * 0.12}px`);
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", `0px`);
    el.style.setProperty("--ty", `0px`);
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ scale: 0.9, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      style={{ translateX: "var(--tx)", translateY: "var(--ty)", translateZ: 0 }}
      className={`inline-flex items-center rounded-full border border-white/15 bg-white/10 px-8 py-4 text-white shadow-xl transition-colors hover:bg-white/20 cursor-pointer select-none ${className}`}
      role="button"
      tabIndex={0}
    >
      <span className="pointer-events-none font-semibold tracking-wide">{children}</span>
    </motion.span>
  );
}
