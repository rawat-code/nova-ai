"use client";

import React, { useEffect, useRef } from "react";

/**
 * HeroBackground (React Bits inspired Aurora Particle Canvas)
 * - Cursor-reactive particle field & aurora wave on desktop
 * - Lightweight static CSS aurora on mobile and reduced-motion via CSS media queries
 * - Zero hydration mismatch
 * - Automatically pauses RAF loop when scrolled off-screen
 */
export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check if on mobile or if reduced motion is requested
    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || reducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    const mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Pause canvas RAF when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(container);

    // Particle field initialization
    const particleCount = 42;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
      phase: number;
    }> = [];

    const colors = [
      "rgba(0, 245, 212,", // Aurora Cyan
      "rgba(0, 180, 216,", // Celestial Azure
      "rgba(99, 102, 241,", // Cosmic Violet
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * container.clientWidth,
        y: Math.random() * container.clientHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      if (isVisible) {
        time += 0.008;

        // Smooth mouse lerp
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        const w = container.clientWidth;
        const h = container.clientHeight;

        ctx.clearRect(0, 0, w, h);

        // Draw ambient glow blobs reacting to mouse
        const grad1 = ctx.createRadialGradient(
          mouse.x,
          mouse.y * 0.8,
          10,
          mouse.x,
          mouse.y * 0.8,
          w * 0.5
        );
        grad1.addColorStop(0, "rgba(0, 245, 212, 0.14)");
        grad1.addColorStop(0.5, "rgba(99, 102, 241, 0.07)");
        grad1.addColorStop(1, "rgba(5, 6, 11, 0)");

        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, w, h);

        // Draw undulating aurora ribbon curves
        ctx.beginPath();
        ctx.moveTo(0, h * 0.65);
        for (let x = 0; x <= w; x += 30) {
          const dy =
            Math.sin(x * 0.003 + time) * 45 +
            Math.cos(x * 0.006 - time * 0.8) * 25 +
            (1 - Math.abs(x - mouse.x) / w) * 20;
          ctx.lineTo(x, h * 0.55 + dy);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, h * 0.4, w, h);
        waveGrad.addColorStop(0, "rgba(0, 245, 212, 0.06)");
        waveGrad.addColorStop(0.5, "rgba(0, 180, 216, 0.04)");
        waveGrad.addColorStop(1, "rgba(99, 102, 241, 0.02)");
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Update and draw floating particles with connecting filaments
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.phase += 0.02;

          // Wrap edges
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          // Mouse proximity reaction
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            p.x -= (dx / dist) * 0.6;
            p.y -= (dy / dist) * 0.6;
          }

          const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${currentAlpha})`;
          ctx.shadowColor = "rgba(0, 245, 212, 0.4)";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Connect nearby particles with subtle lines
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const pdist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (pdist < 90) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(0, 245, 212, ${0.12 * (1 - pdist / 90)})`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-hidden"
    >
      {/* Static CSS aurora gradient fallback for mobile screens */}
      <div className="md:hidden absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[450px] w-[90%] rounded-full bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-2xl" />
      </div>

      {/* Interactive Canvas on Desktop */}
      <div ref={containerRef} className="hidden md:block h-full w-full">
        <canvas
          ref={canvasRef}
          className="h-full w-full block"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
