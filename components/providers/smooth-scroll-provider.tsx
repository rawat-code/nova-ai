"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (
    target: string | HTMLElement | number,
    options?: {
      offset?: number;
      immediate?: boolean;
      duration?: number;
      easing?: (t: number) => number;
    }
  ) => void;
  isReducedMotion: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  isReducedMotion: false,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

import { usePathname } from "next/navigation";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionChange);

    // Completely bypass Lenis on dashboard, auth, and inner app routes, or when reduced motion is preferred.
    // Lenis is only intended for the cinematic storytelling landing page (/).
    if (!isLandingPage || mediaQuery.matches) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return () => {
        mediaQuery.removeEventListener("change", handleMotionChange);
      };
    }

    // Register GSAP ScrollTrigger for landing page
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis strictly on landing page with nested scroll protection
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      prevent: (node) => {
        if (!node || !(node instanceof HTMLElement)) return false;
        return (
          node.hasAttribute("data-lenis-prevent") ||
          node.closest("[data-lenis-prevent]") !== null ||
          node.closest("main") !== null ||
          node.closest("[role='dialog']") !== null
        );
      },
    });

    lenisRef.current = lenis;

    // Wire Lenis on scroll to ScrollTrigger
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Wire Lenis raf to GSAP ticker so animations and scroll stay synchronized
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isLandingPage]);

  const scrollTo = useCallback(
    (
      target: string | HTMLElement | number,
      options?: {
        offset?: number;
        immediate?: boolean;
        duration?: number;
        easing?: (t: number) => number;
      }
    ) => {
      if (lenisRef.current && !isReducedMotion) {
        lenisRef.current.scrollTo(target, options);
      } else {
        if (typeof target === "number") {
          window.scrollTo({
            top: target,
            behavior: isReducedMotion ? "auto" : "smooth",
          });
        } else if (typeof target === "string") {
          const el = document.querySelector(target);
          if (el) {
            el.scrollIntoView({
              behavior: isReducedMotion ? "auto" : "smooth",
            });
          }
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({
            behavior: isReducedMotion ? "auto" : "smooth",
          });
        }
      }
    },
    [isReducedMotion]
  );

  const contextValue = useMemo<SmoothScrollContextType>(
    () => ({
      get lenis() {
        return lenisRef.current;
      },
      scrollTo,
      isReducedMotion,
    }),
    [scrollTo, isReducedMotion]
  );

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
