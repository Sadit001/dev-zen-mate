import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Reveal } from "./Reveal";
import { TextReveal } from "./motion-primitives";

const layerOne = ["Restaurant", "Cafe", "Homebuilder", "Medical Tech"];
const layerTwo = ["Real Estate", "Influencer", "Agencys", "Courses", "Agriculture", "Legal"];

const edgeMask =
  "linear-gradient(to right, transparent, black 12%, black 88%, transparent)";

/** One infinite, transform-only marquee row with organic FLIP shuffling. */
function MarqueeRow({
  items,
  speed,
  direction,
  reduced,
  size,
}: {
  items: string[];
  /** px per second */
  speed: number;
  direction: 1 | -1;
  reduced: boolean | null;
  size: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const halfWidth = useRef(0);
  const hovering = useRef(false);
  const [order, setOrder] = useState(items);

  /* measure one copy so the loop is seamless */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      halfWidth.current = el.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [order]);

  /* organic, controlled shuffle — one adjacent swap at a time, FLIP animated */
  useEffect(() => {
    if (reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setOrder((prev) => {
          if (prev.length < 2) return prev;
          const i = Math.floor(Math.random() * (prev.length - 1));
          const next = [...prev];
          const a = next[i] as string;
          next[i] = next[i + 1] as string;
          next[i + 1] = a;
          return next;
        });
        schedule();
      }, 3200 + Math.random() * 2600);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [reduced]);

  useAnimationFrame((_, delta) => {
    const el = trackRef.current;
    if (!el || reduced || halfWidth.current === 0) return;
    const factor = hovering.current ? 0.35 : 1;
    offset.current += (direction * speed * factor * delta) / 1000;
    const w = halfWidth.current;
    /* wrap without snapping: the two copies are identical */
    if (offset.current <= -w) offset.current += w;
    if (offset.current >= 0) offset.current -= w;
    el.style.transform = `translate3d(${offset.current}px,0,0)`;
  });

  const loop = reduced ? [order] : [order, order];

  return (
    <div
      className="relative overflow-hidden py-2"
      style={{ maskImage: edgeMask, WebkitMaskImage: edgeMask }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max items-center will-change-transform"
        style={reduced ? undefined : { transform: "translate3d(0,0,0)" }}
      >
        {loop.map((copy, c) =>
          copy.map((name, i) => (
            <motion.span
              key={`${c}-${name}`}
              layout={!reduced}
              transition={{ type: "spring", stiffness: 55, damping: 18, mass: 0.7 }}
              className={`group flex shrink-0 items-baseline gap-[clamp(1.5rem,4vw,3.5rem)] px-[clamp(0.75rem,2vw,1.75rem)] ${size}`}
            >
              <span className="text-muted-foreground/85 transition-all duration-500 ease-out hover:text-foreground hover:opacity-100 hover:[transform:scale(1.04)] motion-reduce:transition-none">
                {name}
              </span>
              <span aria-hidden className="text-sun/60 text-[0.35em] leading-none">
                {i % 2 === 0 ? "◆" : "—"}
              </span>
            </motion.span>
          )),
        )}
      </div>
    </div>
  );
}

export function NichesSection() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 26, mass: 0.4 });

  /* subtle spatial depth — reverses naturally when scrolling up */
  const rotateX = useTransform(p, [0, 0.5, 1], [7, 0, -5]);
  const rowOneY = useTransform(p, [0, 1], [34, -34]);
  const rowOneZ = useTransform(p, [0, 0.5, 1], [-90, 30, -60]);
  const rowTwoY = useTransform(p, [0, 1], [-24, 24]);
  const rowTwoZ = useTransform(p, [0, 0.5, 1], [-160, -20, -120]);
  const scale = useTransform(p, [0, 0.5, 1], [0.97, 1, 0.985]);
  const opacity = useTransform(p, [0, 0.18, 0.85, 1], [0.55, 1, 1, 0.6]);

  const stage = reduced ? undefined : { rotateX, scale, opacity };

  return (
    <section id="industries" className="relative overflow-hidden py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Niches</p>
        </Reveal>
        <Reveal>
          <TextReveal
            text="Every industry speaks a different language."
            className="mt-5 max-w-3xl text-[clamp(1.85rem,4.6vw,3.4rem)] leading-[1.03] font-medium text-ink"
          />
        </Reveal>
        <Reveal>
          <TextReveal
            text="We know how to listen"
            className="max-w-3xl text-[clamp(1.85rem,4.6vw,3.4rem)] leading-[1.03] font-medium text-ink"
          />
        </Reveal>
        <Reveal>
          <p className="mt-7 max-w-2xl text-[clamp(0.92rem,1.25vw,1.05rem)] leading-[1.75] tracking-[0.01em] text-muted-foreground/90">
            Our expertise spans multiple industries, but our thinking remains limitless—allowing us
            to approach every niche with fresh perspective and bold ideas.
          </p>
        </Reveal>
      </div>

      <div
        ref={ref}
        className="mt-14 [perspective:1400px] [perspective-origin:50%_45%] sm:mt-20 sm:[perspective:1600px]"
      >
        <motion.div
          className="[transform-style:preserve-3d] will-change-transform"
          style={stage as never}
        >
          <motion.div
            className="[transform-style:preserve-3d]"
            style={reduced ? undefined : { y: rowOneY, z: rowOneZ }}
          >
            <MarqueeRow
              items={layerOne}
              speed={62}
              direction={-1}
              reduced={reduced}
              size="font-display text-[clamp(2rem,6.4vw,4.6rem)] leading-none"
            />
          </motion.div>

          <motion.div
            className="mt-3 [transform-style:preserve-3d] sm:mt-6"
            style={reduced ? undefined : { y: rowTwoY, z: rowTwoZ }}
          >
            <MarqueeRow
              items={layerTwo}
              speed={38}
              direction={1}
              reduced={reduced}
              size="font-display text-[clamp(1.6rem,5vw,3.6rem)] leading-none"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
