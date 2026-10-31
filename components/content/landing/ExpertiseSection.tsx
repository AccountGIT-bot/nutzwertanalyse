"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Scale, ShieldCheck } from "lucide-react";
import { useT } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * Kleines Vorschaubild (24 px), damit die Fläche vor dem Laden nicht weiss bleibt.
 * Als Daten-URL direkt an `placeholder` übergeben: Next legt es dann ohne SVG-Weichzeichnungsfilter
 * als Hintergrund an. Der Filter war beim Einblenden (Skalierung) teuer zu rastern und liess im
 * Dunkelmodus kurz weisse Kacheln am linken Rand durchscheinen.
 */
const DESK_BLUR =
  "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAADQAwCdASoYAA0APtFWpkuoJKOhsAgBABoJQBgbhDd22x2J1HtE6UAA/vHLVwwXX8ZHv+2G//VmDeo8X6R2oNkncI2+1EhJGAPzHfsKkEsrP8UabbQvc+fh56o/JKwoAAA=";

const ICONS = { scale: Scale, shield: ShieldCheck } as const;

function useInView<T extends HTMLElement>(threshold = 0.35): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setSeen(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function useCountUp(target: number, run: boolean, duration = 1100): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

/** Runde Kennzahl mit sich zeichnendem Ring und Zähl-Animation. */
function Badge({ value, suffix, label, run, className }: { value: number; suffix: string; label: string; run: boolean; className?: string }) {
  const n = useCountUp(value, run);
  return (
    <div className={cn("expertise-badge relative flex h-44 w-44 flex-col items-center justify-center rounded-full bg-surface text-center shadow-lg sm:h-52 sm:w-52", run && "is-on", className)} aria-live="polite">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="47" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        <circle className="expertise-ring" cx="50" cy="50" r="47" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" pathLength={100} />
      </svg>
      <span className="text-5xl font-bold tracking-tight text-ink tabular-nums sm:text-6xl">
        {n}
        <span className="text-3xl align-top sm:text-4xl">{suffix}</span>
      </span>
      <span className="mt-1 px-6 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-2">{label}</span>
    </div>
  );
}

/**
 * Textspalte links, cinematisches Bild rechts mit Verlauf in die Seitenfarbe.
 * Auf kleinen Bildschirmen steht das Bild unter dem Text.
 */
export function ExpertiseSection() {
  const t = useT();
  const x = t.landingExtra.expertise;
  const [ref, seen] = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className="relative isolate overflow-hidden">
      {/* Desktop: Bild als Hintergrund der rechten Seite */}
      <div className="absolute inset-y-0 right-0 hidden w-[68%] overflow-hidden bg-surface-2 lg:block" aria-hidden>
        <Image src="/images/landing/desk.webp" alt="" fill sizes="(min-width: 1024px) 68vw, 100vw" placeholder={DESK_BLUR} className={cn("expertise-img object-cover object-[62%_center]", seen && "is-on")} />
        <div className="absolute inset-0 bg-gradient-to-r from-bg from-[12%] via-bg/80 via-[38%] to-transparent to-[72%]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 py-16 sm:py-24 lg:min-h-[640px] lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-center lg:py-28">
          <Reveal>
            <p className="text-sm font-semibold text-primary">{x.eyebrow}</p>
            <h2 id="expertise-h" className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
              {x.title}
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-ink-2">{x.text}</p>
            <ul className="mt-8 space-y-6">
              {x.points.map((p, i) => {
                const Icon = ICONS[p.icon as keyof typeof ICONS] ?? Scale;
                return (
                  <li key={p.title} className={cn("expertise-point flex gap-4", seen && "is-on")} style={{ transitionDelay: `${200 + i * 140}ms` }}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-ink shadow-sm">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-2">{p.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* Desktop: Badge schwebt über dem Bild */}
          <div className="relative hidden h-full lg:block">
            <div className="absolute left-[8%] top-1/2 -translate-y-1/2 xl:left-[14%]">
              <Badge value={x.badgeValue} suffix={x.badgeSuffix} label={x.badgeLabel} run={seen} className="float-slow" />
            </div>
          </div>
        </div>

        {/* Mobil/Tablet: Bild mit Badge unter dem Text */}
        <div className="relative -mx-4 mb-16 overflow-hidden sm:-mx-6 sm:mb-24 lg:hidden">
          <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
            <Image src="/images/landing/desk.webp" alt={x.imageAlt} fill sizes="100vw" placeholder={DESK_BLUR} className="object-cover object-[65%_center]" />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-bg to-transparent" />
            <div className="absolute inset-0 flex items-center justify-start pl-6 sm:pl-10">
              <Badge value={x.badgeValue} suffix={x.badgeSuffix} label={x.badgeLabel} run={seen} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
