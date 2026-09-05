"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";

const LoadingRobot = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#2563EB] border-t-transparent shadow-sm" />
      <span className="text-[11px] font-bold text-slate-400">
        Menyiapkan Robot 3D...
      </span>
    </div>
  </div>
);

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: LoadingRobot,
});

export default function RobotSplineScene() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(container);

    const hydrationTimer = window.setTimeout(() => setIsHydrated(true), 150);

    return () => {
      observer.disconnect();
      window.clearTimeout(hydrationTimer);
    };
  }, []);

  const shouldRenderSpline = isHydrated && isVisible;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-[420px] w-full transform-gpu items-center justify-center lg:min-h-[500px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-blue-300/30 via-purple-300/25 to-pink-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 h-20 w-44 rounded-full bg-blue-500/10 blur-xl"
      />

      {shouldRenderSpline ? (
        <Suspense fallback={<LoadingRobot />}>
          <Spline
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="relative h-full w-full transform-gpu cursor-grab active:cursor-grabbing"
          />
        </Suspense>
      ) : (
        <div
          aria-hidden="true"
          className="h-8 w-8 rounded-full border-[3px] border-[#2563EB]/30 border-t-[#7C3AED]/50"
        />
      )}
    </div>
  );
}
