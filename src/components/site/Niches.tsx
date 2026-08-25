import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Reveal } from "./Reveal";
import { TextReveal } from "./motion-primitives";
import { SunMark } from "./SunMark";

/* existing service content, reused verbatim */
const niches = [
  { name: "SaaS", tone: "from-peach/70 to-card" },
  { name: "Custom Software", tone: "from-sky/70 to-card" },
  { name: "Apps & Websites", tone: "from-sun/40 to-card" },
  { name: "Data & AI Solutions", tone: "from-peach/70 to-card" },
  { name: "Professional Training", tone: "from-sky/70 to-card" },
  { name: "SEO", tone: "from-sun/40 to-card" },
  { name: "UI/UX Design", tone: "from-peach/70 to-card" },
  { name: "Graphics Design", tone: "from-sky/70 to-card" },
];

type Geometry = { spacing: number; lift: number; tilt: number };

function useGeometry(): Geometry {
  const [g, setG] = useState<Geometry>({ spacing: 380, lift: 26, tilt: 8 });
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setG({ spacing: 220, lift: 16, tilt: 6 });
      else if (w < 1024) setG({ spacing: 300, lift: 22, tilt: 7 });
      else setG({ spacing: 400, lift: 26, tilt: 8 });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return g;
}

function NicheCard({
  niche,
  index,
  focus,
  geo,
  reduced,
}: {
  niche: (typeof niches)[number];
  index: number;
  focus: MotionValue<number>;
  geo: Geometry;
  reduced: boolean | null;
}) {
  /* signed distance from the focus slot — horizontal, organized, reversible */
  const d = useTransform(focus, (f) => index - f);

  const x = useTransform(d, (v) => v * geo.spacing);
  const y = useTransform(d, (v) => Math.abs(v) * geo.lift);
  const z = useTransform(d, (v) => -Math.abs(v) * 140);
  const rotateY = useTransform(d, (v) => Math.max(-1, Math.min(1, v)) * -geo.tilt);
  const scale = useTransform(d, (v) => Math.max(0.72, 1 - Math.abs(v) * 0.14));
  const opacity = useTransform(d, (v) => Math.max(0.18, 1 - Math.abs(v) * 0.3));
  const filter = useTransform(d, (v) => `blur(${Math.min(4, Math.abs(v) * 1.6).toFixed(2)}px)`);
  const zIndex = useTransform(d, (v) => 100 - Math.round(Math.abs(v) * 10));
  const glow = useTransform(d, (v) => Math.max(0, 1 - Math.abs(v) * 1.8));

  const style = reduced
    ? { opacity: 1 }
    : { x, y, z, rotateY, scale, opacity, filter, zIndex };

  return (
    <motion.article
      className="absolute w-[min(74vw,15rem)] will-change-transform sm:w-[18rem] lg:w-[22rem] [transform-style:preserve-3d]"
      style={style as never}
    >
      <div
        className={`surface-card grain-overlay relative flex min-h-[18rem] flex-col justify-between overflow-hidden bg-linear-to-br p-7 sm:min-h-[22rem] sm:p-9 ${niche.tone}`}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            ...(reduced ? { opacity: 0 } : { opacity: glow }),
            boxShadow: "0 30px 90px -30px color-mix(in oklab, var(--sun) 55%, transparent)",
          }}
        />
        <div className="flex items-center justify-between text-[0.7rem] tracking-[0.28em] text-muted-foreground uppercase">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <SunMark className="h-4 w-7 text-sun" />
        </div>
        <div>
          <h3 className="text-[clamp(1.35rem,2.6vw,2.1rem)] leading-[1.08] text-balance">
            {niche.name}
          </h3>
        </div>
      </div>
    </motion.article>
  );
}

export function Niches() {
  const reduced = useReducedMotion();
  const geo = useGeometry();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const eased = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.4 });
  const focus = useTransform(eased, [0, 1], [0, niches.length - 1]);
  const [active, setActive] = useState(0);
  useMotionValueEvent(focus, "change", (v) => {
    const i = Math.round(Math.min(niches.length - 1, Math.max(0, v)));
    setActive((prev) => (prev === i ? prev : i));
  });

  return (
    <section id="niches" className="relative">
      <span id="services" aria-hidden className="block" />
      <div ref={trackRef} style={{ height: reduced ? undefined : `${niches.length * 75}vh` }}>
        <div className="sticky top-0 flex min-h-screen items-center overflow-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="relative">
              <Reveal>
                <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Service</p>
              </Reveal>
              <Reveal>
                <TextReveal
                  text="Eight disciplines, one coherent result."
                  className="mt-4 max-w-xl text-[clamp(1.7rem,3.6vw,2.9rem)] leading-[1.05]"
                />
              </Reveal>

              <div className="mt-6 flex items-center gap-3 text-xs tracking-[0.22em] text-muted-foreground uppercase">
                <span className="text-foreground">{String(active + 1).padStart(2, "0")}</span>
                <span className="h-px w-8 bg-border" />
                <span>{String(niches.length).padStart(2, "0")}</span>
              </div>

              {/* horizontal scroll-driven stage */}
              <div className="relative mt-6 h-[24rem] overflow-hidden [perspective:1600px] [perspective-origin:50%_50%] sm:h-[28rem] lg:h-[32rem]">
                <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
                  {niches.map((n, i) => (
                    <NicheCard
                      key={n.name}
                      niche={n}
                      index={i}
                      focus={focus}
                      geo={geo}
                      reduced={reduced}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
