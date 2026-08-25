import { lazy, Suspense, useEffect, useRef, useState } from "react";

const SunriseScene = lazy(() => import("./SunriseScene"));

/**
 * Mounts the WebGL sunrise shader only in the browser, after hydration,
 * and only when the device isn't asking for reduced motion.
 */
export function WebGLBackdrop({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  const scrollRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // skip on devices without a WebGL context
    try {
      const canvas = document.createElement("canvas");
      if (!canvas.getContext("webgl2") && !canvas.getContext("webgl")) return;
    } catch {
      return;
    }
    setReady(true);

    const onScroll = () => {
      scrollRef.current = Math.min(window.scrollY / (window.innerHeight || 1), 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!ready) return null;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className ?? ""}`}>
      <Suspense fallback={null}>
        <SunriseScene scrollRef={scrollRef} />
      </Suspense>
    </div>
  );
}
