import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Thin sunrise progress bar pinned to the top of the page */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[image:var(--gradient-sunrise)]"
    />
  );
}

/* Word-by-word masked reveal for headings */
export function TextReveal({
  text,
  className,
  delay = 0,
  as = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = motion[as];

  return (
    <MotionTag ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={reduced ? { opacity: 0 } : { y: "110%", opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : reduced ? { opacity: 0 } : { y: "110%", opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.045 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </MotionTag>
  );
}

/* Cursor-following magnetic wrapper for buttons / marks */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/* 3D tilt + light sheen that follows the pointer */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 180, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 180, damping: 20 });
  const glowX = useTransform(px, (v) => `${v * 100}%`);
  const glowY = useTransform(py, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(340px circle at ${glowX} ${glowY}, color-mix(in oklab, var(--sun) 30%, transparent), transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      className={`relative [transform-style:preserve-3d] ${className ?? ""}`}
      {...(reduced ? {} : { style: { rotateX: rx, rotateY: ry, perspective: 900 } })}
      onPointerMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      {...(reduced ? {} : { whileHover: { y: -6 } })}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 hover:opacity-100"
        style={{ backgroundImage: glow }}
      />
    </motion.div>
  );
}

/* Scroll-linked parallax for any block */
export function Parallax({
  children,
  className,
  distance = 60,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={className}>
      <motion.div {...(reduced ? {} : { style: { y } })}>{children}</motion.div>
    </div>
  );
}

/* Counts a numeric value up when scrolled into view */
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]!) : 0;
  const suffix = match ? match[2]! : value;
  const [n, setN] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1400, 1);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, target]);

  const decimals = match && match[1]!.includes(".") ? 1 : 0;
  return (
    <p ref={ref} className={className}>
      {n.toFixed(decimals)}
      {suffix}
    </p>
  );
}

/* Card that scales/fades as it enters and leaves the viewport */
export function ScrollCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.96, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* Scroll-linked stage: whole sections lift, scale and rotate in 3D as they pass */
export function ScrollStage({
  children,
  className,
  intensity = 1,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const rotateX = useTransform(p, [0, 0.5, 1], [10 * intensity, 0, -8 * intensity]);
  const scale = useTransform(p, [0, 0.5, 1], [0.94, 1, 0.96]);
  const y = useTransform(p, [0, 0.5, 1], [70 * intensity, 0, -50 * intensity]);
  const opacity = useTransform(p, [0, 0.22, 0.8, 1], [0.25, 1, 1, 0.35]);
  const blur = useTransform(p, [0, 0.22, 0.82, 1], [6, 0, 0, 5]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={`[perspective:1400px] ${className ?? ""}`}>
      <motion.div style={{ rotateX, scale, y, opacity, filter, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}

/* Skews content based on scroll velocity — classic premium studio touch */
export function VelocitySkew({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 220, damping: 40, mass: 0.35 });
  const skewY = useTransform(smooth, [-2500, 0, 2500], [max, 0, -max], { clamp: true });
  const scaleY = useTransform(smooth, [-2500, 0, 2500], [1.04, 1, 1.04], { clamp: true });
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} style={{ skewY, scaleY }}>
      {children}
    </motion.div>
  );
}

/* Slides content in horizontally, tied to scroll position */
export function ScrollSlide({
  children,
  className,
  from = -80,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.35 });
  const x = useTransform(p, [0, 1], [from, 0]);
  const opacity = useTransform(p, [0, 0.6], [0, 1]);
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ x, opacity }}>{children}</motion.div>
    </div>
  );
}

/* Scroll-linked 3D depth: blocks swing in from a tilted plane in Z space */
export function Depth3D({
  children,
  className,
  rotate = 12,
  depth = 220,
  axis = "x",
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  depth?: number;
  axis?: "x" | "y";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const rot = useTransform(p, [0, 1], [rotate, 0]);
  const z = useTransform(p, [0, 1], [-depth, 0]);
  const opacity = useTransform(p, [0, 0.65], [0.25, 1]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={`[perspective:1200px] [perspective-origin:50%_20%] ${className ?? ""}`}>
      <motion.div
        className="[transform-style:preserve-3d]"
        style={axis === "x" ? { rotateX: rot, z, opacity } : { rotateY: rot, z, opacity }}
      >
        {children}
      </motion.div>
    </div>
  );
}
