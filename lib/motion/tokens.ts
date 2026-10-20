import type { Transition, Variants } from "framer-motion";

/**
 * Nova Motion Tokens
 * Centralized easing curves, durations, springs, and variants across the application.
 * All animations MUST consume these tokens to maintain a consistent cinematic feel.
 */

// -----------------------------------------------------------------------------
// 1. Durations (in seconds)
// -----------------------------------------------------------------------------
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.35,
  slow: 0.6,
  deliberate: 0.9,
  ambient: 1.6,
} as const;

export type DurationKey = keyof typeof durations;

// -----------------------------------------------------------------------------
// 2. Easing Curves
// -----------------------------------------------------------------------------
export const easings = {
  /**
   * Cinematic Deceleration: Clean, refined curve for major page elements and modals.
   */
  smooth: [0.22, 1, 0.36, 1] as const,

  /**
   * Snappy Feedback: High initial velocity, swift settle for hover/focus/tap micro-interactions.
   */
  snappy: [0.16, 1, 0.3, 1] as const,

  /**
   * Micro Overshoot: Tactile bounce for badges, toggles, and celebratory cards.
   */
  bounce: [0.34, 1.56, 0.64, 1] as const,

  /**
   * Natural Ease-In-Out: Balanced symmetric curve for state transitions and fades.
   */
  gentle: [0.4, 0, 0.2, 1] as const,

  /**
   * Expressive: Dramatic entry for hero text reveals and showcase banners.
   */
  expressive: [0.65, 0, 0.35, 1] as const,
} as const;

export type EasingKey = keyof typeof easings;

// GSAP equivalents for ScrollTrigger and timeline animations
export const gsapEasings = {
  smooth: "power3.out",
  snappy: "power2.out",
  bounce: "back.out(1.7)",
  gentle: "power1.inOut",
  expressive: "expo.out",
} as const;

// -----------------------------------------------------------------------------
// 3. Spring Configurations
// -----------------------------------------------------------------------------
export const springs = {
  stiff: {
    type: "spring" as const,
    stiffness: 450,
    damping: 32,
    mass: 0.8,
  },
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 24,
    mass: 1,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 18,
    mass: 0.9,
  },
  wobbly: {
    type: "spring" as const,
    stiffness: 180,
    damping: 12,
  },
} as const;

// -----------------------------------------------------------------------------
// 4. Standard Transition Presets
// -----------------------------------------------------------------------------
export const transitions = {
  smooth: {
    duration: durations.normal,
    ease: easings.smooth,
  } satisfies Transition,

  snappy: {
    duration: durations.fast,
    ease: easings.snappy,
  } satisfies Transition,

  slowFade: {
    duration: durations.slow,
    ease: easings.gentle,
  } satisfies Transition,

  reducedMotion: {
    duration: 0.01,
    ease: "linear",
  } satisfies Transition,
} as const;

// -----------------------------------------------------------------------------
// 5. Reusable Motion Variants
// -----------------------------------------------------------------------------
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast, ease: easings.gentle },
  },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: durations.fast, ease: easings.gentle },
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: durations.instant },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Returns a motion transition that automatically collapses duration when reduced-motion is requested.
 */
export function createAccessibleTransition(
  transition: Transition,
  prefersReducedMotion: boolean
): Transition {
  if (prefersReducedMotion) {
    return transitions.reducedMotion;
  }
  return transition;
}
