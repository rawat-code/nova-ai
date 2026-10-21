"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 350, mass: 0.15 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only activate cursor if pointer is fine (desktop mouse) and motion is not reduced
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!finePointer || reducedMotion) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = Boolean(
        target.closest("button") ||
          target.closest("a") ||
          target.closest('[data-cursor="pointer"]') ||
          target.tagName === "BUTTON" ||
          target.tagName === "A"
      );
      setIsHovered(isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleElementHover, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleElementHover);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      {/* Outer Glow Halo */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-cyan-400/50 bg-cyan-400/10 backdrop-blur-[1px]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          width: isHovered ? 48 : 28,
          height: isHovered ? 48 : 28,
          opacity: isVisible ? 1 : 0,
          boxShadow: isHovered
            ? "0 0 25px 2px rgba(0, 245, 212, 0.45)"
            : "0 0 15px 1px rgba(0, 245, 212, 0.25)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />

      {/* Center Precise Dot */}
      <motion.div
        className="fixed top-0 left-0 size-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f5d4]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  );
}
