import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { SunMark } from "./SunMark";
import { WebGLBackdrop } from "./webgl/WebGLBackdrop";
import { Magnetic } from "./motion-primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

function Letter({ char, index, progress }: { char: string; index: number; progress: any }) {
  const start = 0.02 + index * 0.05;
  const y = useTransform(progress, [start, start + 0.22], ["110%", "0%"]);
  const opacity = useTransform(progress, [start, start + 0.18], [0, 1]);
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span style={{ y, opacity }} className="inline-block">
        {char}
      </motion.span>
    </span>
  );
}

export function Contact() {
  const trackRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  const [dropped, setDropped] = useState(!!reduced);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [unit, setUnit] = useState(240); // resolved font-size of the word, in px

  useEffect(() => {
    const measure = () => {
      if (wordRef.current) setUnit(parseFloat(getComputedStyle(wordRef.current).fontSize));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useMotionValueEvent(p, "change", (v) => setDropped(v > 0.76));

  // the "I" IS the button: it drops first, then morphs into a pill (px, derived from word size)
  const barY = useTransform(p, [0.34, 0.6], [0, unit * 1.05]);
  const barW = useTransform(p, [0.62, 0.78], [unit * 0.2, unit * 1.7]);
  const barH = useTransform(p, [0.62, 0.78], [unit * 0.72, unit * 0.24]);
  const barR = useTransform(p, [0.62, 0.78], [unit * 0.02, unit * 0.2]);
  const barRotate = useTransform(p, [0.34, 0.47, 0.6], [0, -8, 0]);
  const fillOpacity = useTransform(p, [0.6, 0.74], [0, 1]);
  const labelOpacity = useTransform(p, [0.76, 0.86], [0, 1]);
  const wordScale = useTransform(p, [0, 0.5, 1], [0.9, 1, 1.04]);
  // the "I" reveals in step with the other letters before it drops
  const iOpacity = useTransform(p, [0.12, 0.3], [0, 1]);
  const iEnter = useTransform(p, [0.12, 0.34], ["110%", "0%"]);



  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormOpen(false);
    setConfirmed(true);
    window.setTimeout(() => setConfirmed(false), 4200);
  }

  return (
    <footer id="contact" className="sunrise-bg grain-overlay relative mt-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <WebGLBackdrop className="absolute inset-0 opacity-40" />
      </div>

      {/* scroll track drives the BUILD reveal + letter drop */}
      <div ref={trackRef} className="relative h-[260vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-4">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <SunMark className="mx-auto h-8 w-14 text-ink" />
          </motion.div>

          <motion.div
            style={{ scale: wordScale }}
            ref={wordRef}
            className="relative mt-10 font-display text-[clamp(4rem,20vw,15rem)] leading-[0.85] font-bold tracking-tight text-ink select-none"
          >
            <span className="pointer-events-none flex items-end gap-[0.04em]">
              <Letter char="B" index={0} progress={p} />
              <Letter char="U" index={1} progress={p} />

              {/* the "I" — it IS the button: drops down, then morphs into the pill */}
              <span className="relative inline-block align-bottom">
                <span className="invisible" aria-hidden>I</span>
                <motion.span
                  style={{ opacity: iOpacity, y: iEnter }}
                  className="pointer-events-auto absolute top-0 left-1/2 z-30 flex leading-none"
                >
                <Magnetic strength={dropped ? 0.3 : 0}>
                  <motion.button
                    type="button"
                    onClick={() => dropped && setFormOpen((v) => !v)}
                    aria-label="Book a call"
                    style={{
                      x: "-50%",
                      y: barY,
                      width: barW,
                      height: barH,
                      borderRadius: barR,
                      rotate: barRotate,
                    }}
                    whileHover={{ scale: dropped ? 1.05 : 1 }}
                    whileTap={{ scale: dropped ? 0.95 : 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    className={`shine relative grid origin-top place-items-center overflow-hidden bg-ink text-primary-foreground ${
                      dropped ? "cursor-pointer" : "pointer-events-none"
                    }`}
                  >
                    <motion.span
                      aria-hidden
                      style={{ opacity: fillOpacity, borderRadius: "inherit" }}
                      className="absolute inset-0 bg-primary"
                    />
                    <motion.span
                      style={{ opacity: labelOpacity }}
                      className="relative px-[0.2em] text-[1rem] font-medium tracking-wide whitespace-nowrap"
                    >
                      Book a Call
                    </motion.span>
                  </motion.button>
                </Magnetic>
                </motion.span>
              </span>


              <Letter char="L" index={3} progress={p} />
              <Letter char="D" index={4} progress={p} />
            </span>
          </motion.div>

          {/* drop-down contact form */}
          <div className="mt-[24vh] w-full max-w-lg">
            <AnimatePresence mode="wait">
              {formOpen && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: -40, scaleY: 0.8, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scaleY: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30, scale: 0.95, filter: "blur(12px)" }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="surface-card grain-overlay origin-top space-y-3 p-6 text-left backdrop-blur-xl"
                >
                  {[
                    { name: "email", type: "email", placeholder: "your@email.com" },
                    { name: "subject", type: "text", placeholder: "Subject" },
                  ].map((f, i) => (
                    <motion.input
                      key={f.name}
                      required
                      name={f.name}
                      type={f.type}
                      placeholder={f.placeholder}
                      initial={{ opacity: 0, y: -14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: EASE }}
                      className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  ))}
                  <motion.textarea
                    required
                    name="message"
                    rows={4}
                    placeholder="Tell us about the project…"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.31, duration: 0.5, ease: EASE }}
                    className="w-full resize-none rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  <motion.button
                    type="submit"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="shine w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                  >
                    Submit
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* confirmation popup */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.94, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="surface-card fixed bottom-8 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 px-6 py-4 shadow-xl backdrop-blur-xl"
            role="status"
          >
            <motion.span
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <SunMark className="h-4 w-7 text-sun" />
            </motion.span>
            <p className="text-sm">
              <span className="font-medium">Message sent.</span>{" "}
              <span className="text-muted-foreground">We&apos;ll reply within 24 hours.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-border/60 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} DevCave Studio</p>
        <ul className="flex gap-6">
          {["Instagram", "LinkedIn", "X"].map((s) => (
            <li key={s}>
              <a href="#contact" className="link-underline transition-colors hover:text-foreground">
                {s}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
