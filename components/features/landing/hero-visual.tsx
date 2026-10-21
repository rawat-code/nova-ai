"use client";

import React, { useState, useEffect } from "react";
import { HeroBackground } from "./hero-background";

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SplineErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("Spline failed to render, falling back to React Bits Aurora:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function isPlaceholderUrl(url?: string): boolean {
  if (!url) return true;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.length === 0 ||
    trimmed.includes("your_scene_id") ||
    trimmed.includes("your-scene-id") ||
    trimmed.includes("placeholder") ||
    trimmed.includes("example")
  );
}

/**
 * HeroVisual
 * Renders the React Bits Aurora canvas by default.
 * If a valid NEXT_PUBLIC_SPLINE_SCENE_URL is configured, client-loads Spline seamlessly.
 */
export function HeroVisual() {
  const [SplineComponent, setSplineComponent] = useState<React.ComponentType<{
    scene: string;
    onError?: () => void;
  }> | null>(null);
  const [hasSpline, setHasSpline] = useState(false);

  const splineUrl = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL?.trim();
  const isValidSpline = !isPlaceholderUrl(splineUrl);

  useEffect(() => {
    if (!isValidSpline || !splineUrl) return;

    import("@splinetool/react-spline")
      .then((mod) => {
        setSplineComponent(() => mod.default);
        setHasSpline(true);
      })
      .catch(() => {
        setHasSpline(false);
      });
  }, [isValidSpline, splineUrl]);

  if (hasSpline && SplineComponent && splineUrl && isValidSpline) {
    return (
      <SplineErrorBoundary fallback={<HeroBackground />}>
        <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-hidden">
          <div className="h-full w-full opacity-80 transition-opacity duration-1000">
            <SplineComponent
              scene={splineUrl}
              onError={() => setHasSpline(false)}
            />
          </div>
        </div>
      </SplineErrorBoundary>
    );
  }

  return <HeroBackground />;
}
