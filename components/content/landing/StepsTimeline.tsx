"use client";

import { FileText, ListChecks, SlidersHorizontal, Scale, Star, BarChart3 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";

const ICONS = [FileText, ListChecks, SlidersHorizontal, Scale, Star, BarChart3];

/** Sechs Schritte als Timeline: Linie zeichnet sich beim Erscheinen, Knoten erscheinen nacheinander. */
export function StepsTimeline() {
  const t = useT();
  return (
    <Reveal className="relative">
      {/* Horizontale Linie (Desktop) */}
      <div className="absolute left-0 right-0 top-6 hidden h-0.5 bg-surface-3 lg:block" aria-hidden>
        <div className="timeline-line h-full w-full bg-primary" />
      </div>
      {/* Vertikale Linie (Mobil) */}
      <div className="absolute bottom-6 left-6 top-6 w-0.5 bg-surface-3 lg:hidden" aria-hidden>
        <div className="timeline-line-v h-full w-full bg-primary" />
      </div>
      <ol className="relative grid gap-8 lg:grid-cols-6 lg:gap-4">
        {t.landing.how.map((s, i) => {
          const Icon = ICONS[i];
          return (
            <li key={s.title} className="flex gap-4 lg:flex-col lg:gap-0">
              <span
                className="hero-pop relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-bg bg-primary text-primary-ink shadow-sm"
                style={{ animationDelay: `${0.2 + i * 0.22}s` }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="pt-2 lg:pt-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-1 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Reveal>
  );
}
