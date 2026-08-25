import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Preloader } from "@/components/site/Preloader";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Awards, Testimonials, Stats, Work, Journal } from "@/components/site/Sections";
import { Niches } from "@/components/site/Niches";
import { Projects } from "@/components/site/Projects";
import { Contact } from "@/components/site/Contact";
import { ScrollProgress } from "@/components/site/motion-primitives";
import { useSmoothScroll } from "@/components/site/useLenis";

const title = "DevCave — Creative Technology & Digital Experience Studio";
const description =
  "A small studio crafting premium brands and motion-led websites for ambitious companies. Award-winning brand, web and motion design.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useSmoothScroll();
  const heroBoundaryRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroBoundaryRef,
    offset: ["end end", "end start"],
  });
  const easedProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 26, mass: 0.35 });
  const transitionProgress = reducedMotion ? scrollYProgress : easedProgress;
  const heroMix = useTransform(transitionProgress, [0, 0.4, 0.6, 0.8, 1], ["100%", "80%", "55%", "25%", "0%"]);
  const backgroundMix = useTransform(transitionProgress, [0, 0.4, 0.6, 0.8, 1], ["0%", "20%", "45%", "75%", "100%"]);
  const pageBackground = useMotionTemplate`color-mix(in oklab, var(--dc-page-hero) ${heroMix}, var(--background) ${backgroundMix})`;

  return (
    <motion.main className="dc-page-shell m-0 min-h-screen p-0" style={{ backgroundColor: pageBackground }}>
      <Preloader />
      <ScrollProgress />

      <Nav />
      <div ref={heroBoundaryRef} className="m-0 p-0">
        <Hero />
      </div>
      <div className="dc-after-hero m-0 p-0">
        <Awards />
        <Testimonials />
        <Stats />
        <Niches />
        <Work />
        <Projects />
        <Journal />

        <Contact />
      </div>
    </motion.main>
  );
}
