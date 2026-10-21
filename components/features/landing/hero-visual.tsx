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

    let isMounted = true;

    // Safety net: catch async unpacking errors from @splinetool/runtime
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason || "");
      if (reason.includes("buffer not reached") || reason.includes("spline") || reason.includes("Spline")) {
        console.warn("[HeroVisual] Caught async Spline decoding error, falling back to Aurora canvas:", reason);
        event.preventDefault();
        if (isMounted) {
          setHasSpline(false);
          setSplineComponent(null);
        }
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Preflight check the scene URL to confirm it returns HTTP 200 and binary data (not 403/404 XML or HTML)
    fetch(splineUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          console.warn(`[HeroVisual] Spline URL returned HTTP ${res.status}, falling back to Aurora canvas.`);
          return null;
        }
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("xml") || contentType.includes("html") || contentType.includes("text")) {
          console.warn(`[HeroVisual] Spline URL returned non-binary content-type (${contentType}), falling back to Aurora canvas.`);
          return null;
        }
        return import("@splinetool/react-spline");
      })
      .then((mod) => {
        if (mod && isMounted) {
          setSplineComponent(() => mod.default);
          setHasSpline(true);
        }
      })
      .catch((err) => {
        console.warn("[HeroVisual] Spline preflight/import failed, falling back to Aurora canvas:", err);
        if (isMounted) {
          setHasSpline(false);
        }
      });

    return () => {
      isMounted = false;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
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
