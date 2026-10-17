"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";

function useCountUp(target: number, run: boolean, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = reduce ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return value;
}

function Stat({ value, suffix, label, run, delay }: { value: number; suffix: string; label: string; run: boolean; delay: number }) {
  const n = useCountUp(value, run, 900 + delay);
  return (
    <div className="flex flex-col">
      <span className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
        {n}
        {suffix}
      </span>
      <span className="mt-1 text-sm text-ink-2">{label}</span>
    </div>
  );
}

/** Vier belegbare Kennzahlen mit Zähl-Animation beim Erscheinen. */
export function StatStrip() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setRun(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="grid grid-cols-2 gap-8 lg:grid-cols-4">
      {t.landingExtra.stats.map((s, i) => (
        <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} run={run} delay={i * 120} />
      ))}
    </div>
  );
}
