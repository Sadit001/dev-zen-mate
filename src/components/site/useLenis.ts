import { useEffect } from "react";

/**
 * Lenis (inertial smooth scroll) synchronized with GSAP ScrollTrigger.
 * One single scroll system: Lenis drives the ticker, ScrollTrigger reads from it.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        touchMultiplier: 1.6,
        autoRaf: false,
      });

      // ScrollTrigger recalculates on every Lenis frame -> accurate pin/scrub.
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const resize = () => lenis.resize();
      ScrollTrigger.addEventListener("refresh", resize);
      ScrollTrigger.refresh();

      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.off("scroll", ScrollTrigger.update);
        ScrollTrigger.removeEventListener("refresh", resize);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
}
