import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Pillar = {
  letter: string;
  /** vertical offset in px for the staggered composition */
  offset: number;
  /** height as a fraction of the composition height */
  height: number;
  /** interior gradient variant */
  tone: 1 | 2 | 3;
};

const PILLARS: Pillar[] = [
  { letter: "D", offset: -30, height: 0.93, tone: 1 },
  { letter: "E", offset: 42, height: 0.84, tone: 2 },
  { letter: "V", offset: -12, height: 1, tone: 1 },
  { letter: "C", offset: 56, height: 0.78, tone: 3 },
  { letter: "A", offset: -40, height: 0.9, tone: 2 },
  { letter: "V", offset: 22, height: 0.87, tone: 1 },
  { letter: "E", offset: -18, height: 0.96, tone: 3 },
];

const BASE_FLEX = 1;
const ACTIVE_FLEX = 1.95;
const NEAR_FLEX = 0.84;
const FAR_FLEX = 0.94;

const HIDDEN_LETTER = { opacity: 0.1, filter: "blur(3px)", yPercent: 0, scale: 1 };

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const pillarRefs = useRef<Array<HTMLDivElement | null>>([]);
  const faceRefs = useRef<Array<HTMLDivElement | null>>([]);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const activeRef = useRef<number | null>(null);
  const lastXRef = useRef(0);
  const reducedRef = useRef(false);
  const setActiveRef = useRef<(index: number | null) => void>(() => {});
  const parallaxRef = useRef<{ x?: (v: number) => void; y?: (v: number) => void }>({});

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      reducedRef.current = prefersReduced;

      const pillars = pillarRefs.current.filter(Boolean) as HTMLDivElement[];
      const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];

      /**
       * Reveal / hide a single letter with a soft fade + rise (no flipping).
       */
      const revealLetter = (i: number, show: boolean) => {
        const face = faceRefs.current[i];
        const letter = letterRefs.current[i];
        if (!face || !letter) return;

        gsap.to(face, { z: show ? 80 : 0, duration: 1.1, ease: "power2.out", overwrite: "auto" });
        gsap.to(
          letter,
          show
            ? {
                opacity: 1,
                filter: "blur(0px)",
                yPercent: 0,
                scale: 1,
                duration: 0.85,
                ease: "power2.out",
                overwrite: "auto",
              }
            : { ...HIDDEN_LETTER, duration: 0.8, ease: "sine.inOut", overwrite: "auto" },
        );
      };


      // ---------- hover / active-state orchestration ----------
      setActiveRef.current = (index: number | null) => {
        if (activeRef.current === index) return;
        activeRef.current = index;

        pillarRefs.current.forEach((el, i) => {
          const face = faceRefs.current[i];
          const letter = letterRefs.current[i];
          if (!el || !face || !letter) return;

          const isActive = i === index;
          const dist = index === null ? 99 : Math.abs(i - index);
          const push = index === null || isActive ? 0 : (i < index ? -1 : 1) * (dist === 1 ? 14 : 6);

          gsap.to(el, {
            flexGrow: isActive ? ACTIVE_FLEX : dist === 1 ? NEAR_FLEX : dist === 2 ? FAR_FLEX : 1,
            x: push,
            scale: isActive ? 1.035 : 1,
            duration: prefersReduced ? 0.3 : 1.1,
            ease: "power2.out",
            overwrite: "auto",
          });

          gsap.to(el, {
            "--edge": isActive ? 0.75 : dist === 1 ? 0.32 : 0.18,
            "--sheen": isActive ? 0.18 : 0.04,
            duration: 0.9,
            ease: "sine.out",
            overwrite: "auto",
          });

          if (prefersReduced) {
            gsap.to(letter, {
              opacity: isActive ? 1 : 0.14,
              filter: "blur(0px)",
              duration: 0.35,
              overwrite: "auto",
            });
            return;
          }

          // only the hovered pillar shows its letter
          revealLetter(i, isActive);
        });
      };


      // ---------- mouse parallax on the whole composition ----------
      if (!prefersReduced && row.current) {
        parallaxRef.current = {
          x: gsap.quickTo(row.current, "x", { duration: 1.3, ease: "power2.out" }),
          y: gsap.quickTo(row.current, "y", { duration: 1.5, ease: "power2.out" }),
        };
      }

      // ---------- intro ----------
      if (prefersReduced) {
        gsap.set(pillars, { opacity: 1, y: 0 });
        gsap.set(letters, { opacity: 0.16, filter: "blur(0px)" });
      } else {
        gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .from(".dc-atmos", { opacity: 0, duration: 1.6, ease: "sine.inOut" }, 0)
          .from(".dc-eyebrow", { y: -16, opacity: 0, duration: 1.1, stagger: 0.12 }, 0.1)
          .from(
            pillars,
            { yPercent: 14, opacity: 0, scaleY: 0.94, duration: 1.6, stagger: 0.11 },
            0.2,
          )
          .from(letters, { opacity: 0, yPercent: 20, duration: 1.2, stagger: 0.09 }, 0.6)
          .from(".dc-caption", { opacity: 0, y: 14, duration: 1.1 }, 0.95);
      }

    },
    { scope: root },
  );

  /** mouse parallax on the composition */
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    lastXRef.current = e.clientX;
    if (reducedRef.current) return;

    const bounds = root.current?.getBoundingClientRect();
    if (bounds) {
      const nx = (e.clientX - bounds.left) / bounds.width - 0.5;
      const ny = (e.clientY - bounds.top) / bounds.height - 0.5;
      parallaxRef.current.x?.(nx * 26);
      parallaxRef.current.y?.(ny * 14);
    }
  };


  const activate = (i: number) => setActiveRef.current(activeRef.current === i ? null : i);

  return (
    <section
      ref={root}
      aria-label="DEVCAVE — creative technology studio"
      className="dc-hero relative flex h-screen flex-col overflow-hidden"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setActiveRef.current(null)}
    >
      <div className="dc-atmos" aria-hidden="true" />
      <div className="dc-grain" aria-hidden="true" />


      <div className="dc-eyebrow relative z-10 flex items-start justify-between px-6 pt-28 text-[0.6rem] uppercase tracking-[0.34em] text-[color:var(--dc-dim)] sm:px-10 md:px-14">
        <span>Devcave — creative technology studio</span>
        <span className="hidden sm:inline">Digital experiences</span>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-3 sm:px-8 md:px-14">
        <div
          ref={row}
          className="dc-row flex h-[52vh] w-full max-w-5xl items-center justify-center gap-2 sm:h-[58vh] sm:gap-3 md:gap-4"
        >
          {PILLARS.map((p, i) => (
            <div
              key={`${p.letter}-${i}`}
              ref={(el) => {
                pillarRefs.current[i] = el;
              }}
              role="button"
              tabIndex={0}
              aria-label={`Reveal letter ${p.letter}`}
              style={{
                flexGrow: BASE_FLEX,
                flexBasis: 0,
                height: `${p.height * 100}%`,
                marginTop: p.offset,
              }}
              className="dc-pillar"
              data-tone={p.tone}
              onPointerEnter={() => setActiveRef.current(i)}
              onPointerDown={() => activate(i)}
              onFocus={() => setActiveRef.current(i)}
              onBlur={() => setActiveRef.current(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activate(i);
                }
              }}
            >
              <div
                className="dc-face"
                ref={(el) => {
                  faceRefs.current[i] = el;
                }}
              >
                <span
                  ref={(el) => {
                    letterRefs.current[i] = el;
                  }}
                  aria-hidden="true"
                  className="dc-letter"
                  data-letter={p.letter}
                >
                  {p.letter}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dc-caption relative z-10 flex items-end justify-between px-6 pb-10 text-[0.6rem] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)] sm:px-10 md:px-14">
        <span>Design × Development</span>
        <span className="hidden sm:inline">Est. Studio — Worldwide</span>
        <span>Scroll</span>
      </div>
    </section>
  );
}
