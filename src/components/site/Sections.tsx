import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Reveal } from "./Reveal";
import {
  Counter,
  Parallax,
  ScrollCard,
  ScrollSlide,
  ScrollStage,
  Depth3D,
  TextReveal,
  Tilt,
  VelocitySkew,
} from "./motion-primitives";
import { SunMark } from "./SunMark";
import workBrand from "@/assets/work-brand.jpg";
import workWeb from "@/assets/work-web.jpg";



const testimonials = [
  {
    quote:
      "They brought a thoughtful approach to every detail and built a site that reflects the craftsmanship our studio is known for.",
    name: "Craig Treattu",
    role: "Founder, Left Coast Design Studio",
  },
  {
    quote:
      "From start to finish the experience was professional and efficient. The final result exceeded our expectations.",
    name: "Shaun Olson",
    role: "President, COBE Construction",
  },
  {
    quote:
      "A game changer. They transformed our ideas into a website that feels genuinely true to our brand.",
    name: "Chasen McNaughton",
    role: "Co-Founder, Milk & Cookies",
  },
  {
    quote:
      "They captured the personality of our brand and delivered something that feels authentic and fast.",
    name: "Tanner Balisky",
    role: "Bad Birdie",
  },
];

const stats = [
  { value: "15+", label: "Projects", body: "Delivered to ambitious brands." },
  { value: "2", label: "Running Projects", body: "" },
  { value: "100K+", label: "Views", body: "Monthly across the websites we build." },
];

const work = [
  { name: "Milk & Cookies", tags: "Brand, Web", image: workBrand },
  { name: "Left Coast Design Studio", tags: "Brand, Web", image: workWeb },
];

const journal = [
  { title: "How motion turns websites into premium products", date: "May 28, 2026" },
  { title: "Why the best brands feel instantly trustworthy", date: "March 9, 2026" },
  { title: "Why some websites are impossible to ignore", date: "February 17, 2026" },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">{children}</p>
  );
}

export function Awards() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.4 });
  const rotateX = useTransform(p, [0, 0.5, 1], [9, 0, -6]);
  const rotateY = useTransform(p, [0, 0.5, 1], [-5, 0, 3]);
  const z = useTransform(p, [0, 0.5, 1], [-180, 0, -70]);
  const y = useTransform(p, [0, 0.5, 1], [40, 0, -26]);
  const scale = useTransform(p, [0, 0.5, 1], [0.955, 1, 0.98]);

  const style = reduced ? undefined : { rotateX, rotateY, z, y, scale };

  return (
    <section id="our-dna" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal>
        <SectionLabel>Our DNA</SectionLabel>
      </Reveal>
      <Reveal>
        <TextReveal
          text="Our DNA"
          className="mt-4 max-w-2xl text-[clamp(1.9rem,4vw,3rem)] leading-[1.05]"
        />
      </Reveal>

      <div ref={ref} className="mt-12 [perspective:1400px] [perspective-origin:50%_35%]">
        <motion.div className="[transform-style:preserve-3d] will-change-transform" style={style as never}>
          <article className="surface-card grain-overlay relative overflow-hidden bg-[image:var(--gradient-dawn)] p-8 sm:p-14 lg:p-20">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                background:
                  "radial-gradient(120% 90% at 12% 0%, color-mix(in oklab, var(--sun) 16%, transparent), transparent 65%)",
              }}
            />
            <div className="relative flex items-center justify-between text-[0.7rem] tracking-[0.28em] text-muted-foreground uppercase">
              <span>Manifesto</span>
              <SunMark className="h-4 w-7 text-sun" />
            </div>
            <p className="relative mt-8 max-w-4xl text-[clamp(1.05rem,2.1vw,1.6rem)] leading-[1.65] tracking-[0.005em] text-ink">
              We’re DevCave — a place where ambitious ideas find the room to become real. We work
              somewhere between imagination and execution, turning complex problems, bold visions,
              and untapped possibilities into digital products people can experience and businesses
              can grow with. Design gives them form. Technology gives them power. And our way of
              thinking gives them a reason to be different.
            </p>
            <span aria-hidden className="relative mt-10 block h-px w-16 bg-border" />
          </article>
        </motion.div>
      </div>
    </section>
  );
}


export function Testimonials() {
  const loop = [...testimonials, ...testimonials];
  return (
    <section className="overflow-hidden py-16">
      <Depth3D rotate={14} depth={260}>
      <VelocitySkew max={5}>
      <div className="marquee-track marquee-hover gap-4 px-2">
        {loop.map((t, i) => (
          <figure
            key={`${t.name}-${i}`}
            className="surface-card w-[min(88vw,26rem)] shrink-0 p-7 transition-transform duration-500 hover:-translate-y-2"
          >
            <blockquote className="text-[1.05rem] leading-relaxed text-foreground">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 text-sm">
              <span className="font-medium">{t.name}</span>
              <span className="block text-muted-foreground">{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      </VelocitySkew>
      </Depth3D>
    </section>
  );
}

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Depth3D rotate={16} depth={300}>
      <ScrollStage intensity={1.2}>
      <div className="surface-card grain-overlay grid gap-10 bg-[image:var(--gradient-dawn)] p-10 sm:grid-cols-3 sm:p-14">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <Counter
              value={s.value}
              className="font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-ink"
            />
            <p className="mt-3 text-lg">{s.label}</p>
            {s.body ? <p className="mt-1 text-sm text-muted-foreground">{s.body}</p> : null}
          </Reveal>
        ))}
      </div>
      </ScrollStage>
      </Depth3D>
    </section>
  );
}

export function Work() {
  return (
    <section id="work" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal>
        <SectionLabel>Selected work</SectionLabel>
      </Reveal>
      <Reveal>
        <TextReveal
          text="Recent projects."
          className="mt-4 max-w-2xl text-[clamp(1.9rem,4vw,3rem)] leading-[1.05]"
        />
      </Reveal>
      <Depth3D rotate={12} depth={240}>
      <ScrollStage>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {work.map((w, i) => (
            <ScrollCard key={w.name} delay={i * 0.08}>
              <Tilt max={5} className="group surface-card overflow-hidden">
                <div className="overflow-hidden">
                  <Parallax distance={22}>
                  <img
                    src={w.image}
                    alt={`${w.name} case study`}
                    loading="lazy"
                    width={1200}
                    height={912}
                    className="aspect-4/3 w-full scale-[1.06] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.12]"
                  />
                  </Parallax>
                </div>
                <div className="flex items-center justify-between p-6">
                  <h3 className="text-lg transition-transform duration-500 group-hover:translate-x-1">
                    {w.name}
                  </h3>
                  <span className="text-sm text-muted-foreground">{w.tags}</span>
                </div>
              </Tilt>
            </ScrollCard>
          ))}
        </div>
      </ScrollStage>
      </Depth3D>
    </section>
  );
}

export function Journal() {
  return (
    <section id="journal" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal>
        <SectionLabel>Journal</SectionLabel>
      </Reveal>
      <Depth3D rotate={10} depth={200} className="mt-8">
      <div className="border-t border-border">
        {journal.map((p, i) => (
          <ScrollSlide key={p.title} from={i % 2 === 0 ? -70 : 70}>
            <a
              href="#journal"
              className="group flex flex-col gap-2 border-b border-border py-7 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <h3 className="max-w-2xl text-[1.35rem] leading-snug transition-transform duration-500 group-hover:translate-x-3">
                {p.title}
              </h3>
              <span className="flex items-center gap-3 text-sm text-muted-foreground">
                {p.date}
                <span className="inline-block translate-x-[-6px] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                  →
                </span>
              </span>
            </a>
          </ScrollSlide>
        ))}
      </div>
      </Depth3D>
    </section>
  );
}
