import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SunMark } from "./SunMark";

export function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="sunrise-bg fixed inset-0 z-100 flex items-center justify-center"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <motion.span
              className="inline-flex"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <SunMark className="h-10 w-16 text-ink" />
            </motion.span>
            <div className="overflow-hidden pt-1 pb-3">
              <motion.span
                className="block font-display text-4xl leading-[1.15] tracking-tight text-ink sm:text-5xl"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                DEVCAVE
              </motion.span>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
