import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SunMark } from "./SunMark";
import { Magnetic } from "./motion-primitives";

const links = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Journal", href: "#journal" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 220 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(() => setEntered(true), 2050);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y: entered ? (hidden ? -110 : 0) : -80,
        opacity: entered ? 1 : 0,
        scale: scrolled ? 0.97 : 1,
      }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-6 ${
          scrolled
            ? "border border-border bg-card/80 shadow-[var(--shadow-soft)] backdrop-blur-xl"
            : "dc-nav-over-hero border border-transparent"
        }`}

      >
        <Magnetic strength={0.25}>
          <a href="#top" className="flex items-center gap-2.5 text-ink">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="inline-flex"
            >
              <SunMark className="h-5 w-8" />
            </motion.span>
            <span className="font-display text-lg tracking-[0.3em]">DEVCAVE</span>
          </a>
        </Magnetic>
        <ul className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a className="link-underline transition-colors hover:text-foreground" href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Magnetic>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="shine dc-cta-light inline-block rounded-full px-5 py-2 text-sm font-medium"
          >
            Hello
          </motion.a>
        </Magnetic>
      </nav>
    </motion.header>
  );
}
