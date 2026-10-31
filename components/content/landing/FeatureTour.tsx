"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Scroll-Tour: Links ein klebendes Visual, das zum gerade sichtbaren Punkt
 * wechselt; rechts die nummerierte Liste. Auf kleinen Bildschirmen steht das
 * Visual über jedem Punkt.
 */
export function FeatureTour() {
  const t = useT();
  const x = t.landingExtra;
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // Aktiv ist der letzte Eintrag, dessen Oberkante die Bildschirmmitte
    // erreicht hat. Rein positionsbasiert: Jede Scrollposition ergibt genau
    // einen Eintrag, beim langsamen Scrollen wird keiner übersprungen.
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.5;
      let idx = 0;
      refs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) idx = i;
      });
      setActive(idx);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_1.1fr] lg:gap-16">
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <div className="card overflow-hidden p-6" aria-hidden>
            <div key={active} className="tour-visual-enter">
              <FeatureVisual index={active} />
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              {x.included.map((_, i) => (
                <span key={i} className={cn("h-1 rounded-full transition-all duration-300", i === active ? "w-6 bg-primary" : "w-2 bg-surface-3")} />
              ))}
              <span className="ml-auto text-xs text-ink-3">
                {String(active + 1).padStart(2, "0")} / {String(x.included.length).padStart(2, "0")}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-3">{x.tourHint}</p>
        </div>
      </div>
      <ol className="space-y-4">
        {x.included.map((item, i) => (
          <li
            key={item.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            data-active={active === i}
            className="tour-item rounded-2xl border border-line bg-surface p-5 sm:p-6"
          >
            <div className="mb-4 lg:hidden">
              <FeatureVisual index={i} compact />
            </div>
            <div className="flex gap-4">
              <span className={cn("w-8 shrink-0 text-sm font-semibold tabular transition-colors", active === i ? "text-primary" : "text-ink-3")}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-base font-semibold sm:text-lg">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{item.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- Mini-Visuals (SVG, animiert) ---------------- */

const P = "var(--primary)";
const A = "var(--accent)";
const S2 = "var(--surface-2)";
const S3 = "var(--surface-3)";
const INK2 = "var(--ink-2)";

function FeatureVisual({ index, compact = false }: { index: number; compact?: boolean }) {
  const common = { viewBox: "0 0 400 220", className: cn("w-full", compact ? "max-h-40" : ""), role: "img" as const, "aria-hidden": true };
  switch (index) {
    case 0: // Sechs Schritte
      return (
        <svg {...common}>
          <line x1="40" y1="110" x2="360" y2="110" stroke={S3} strokeWidth="4" strokeLinecap="round" />
          <line x1="40" y1="110" x2="360" y2="110" stroke={P} strokeWidth="4" strokeLinecap="round" className="hero-bar" style={{ animationDuration: "1.4s" }} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} className="hero-pop" style={{ animationDelay: `${0.2 + i * 0.18}s` }}>
              <circle cx={40 + i * 64} cy="110" r="16" fill={i < 5 ? P : A} />
              <text x={40 + i * 64} y="115" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--primary-ink)">
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      );
    case 1: // Vorlagen
      return (
        <svg {...common}>
          {Array.from({ length: 10 }, (_, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            return (
              <g key={i} className="hero-pop" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                <rect x={30 + col * 70} y={40 + row * 80} width="58" height="62" rx="8" fill={S2} stroke="var(--line)" />
                <rect x={40 + col * 70} y={50 + row * 80} width="38" height="22" rx="4" fill={i === 2 ? P : S3} />
                <rect x={40 + col * 70} y={80 + row * 80} width="30" height="5" rx="2.5" fill={S3} />
                <rect x={40 + col * 70} y={90 + row * 80} width="20" height="5" rx="2.5" fill={S3} />
              </g>
            );
          })}
        </svg>
      );
    case 2: // Gewichtung
      return (
        <svg {...common}>
          {[
            ["17", 0.17],
            ["14", 0.14],
            ["10", 0.1],
            ["24", 0.24],
            ["35", 0.35],
          ].map(([pct, w], i) => (
            <g key={i}>
              <rect x="40" y={38 + i * 34} width="240" height="12" rx="6" fill={S3} />
              <rect x="40" y={38 + i * 34} width={240 * (w as number) * 2.4} height="12" rx="6" fill={P} className="hero-bar" style={{ animationDelay: `${0.15 + i * 0.12}s` }} />
              <text x="300" y={49 + i * 34} fontSize="13" fill={INK2} className="tabular">
                {pct} %
              </text>
            </g>
          ))}
          <rect x="40" y="200" width="320" height="4" rx="2" fill={S3} />
          <circle cx="150" cy="202" r="8" fill="var(--surface)" stroke={P} strokeWidth="3" className="hero-knob" />
        </svg>
      );
    case 3: // K.-o. und Team
      return (
        <svg {...common}>
          {[0, 1, 2].map((i) => (
            <g key={i} className="hero-pop" style={{ animationDelay: `${0.1 + i * 0.15}s` }}>
              <circle cx={70 + i * 50} cy="70" r="18" fill={i === 1 ? P : S3} />
              <circle cx={70 + i * 50} cy="62" r="6" fill="var(--surface)" />
              <path d={`M${58 + i * 50} 84 a12 12 0 0 1 24 0`} fill="var(--surface)" />
            </g>
          ))}
          <rect x="40" y="120" width="320" height="70" rx="10" fill={S2} stroke="var(--line)" />
          <text x="56" y="146" fontSize="12" fill={INK2}>
            K.-o. ≥ 6
          </text>
          {[8, 5, 9].map((v, i) => (
            <g key={i} className="hero-pop" style={{ animationDelay: `${0.6 + i * 0.15}s` }}>
              <rect x={150 + i * 62} y="132" width="48" height="36" rx="8" fill={v < 6 ? "var(--bad-soft)" : "var(--primary-soft)"} />
              <text x={174 + i * 62} y="156" textAnchor="middle" fontSize="16" fontWeight="700" fill={v < 6 ? "var(--bad)" : P}>
                {v}
              </text>
            </g>
          ))}
        </svg>
      );
    case 4: // Sensitivität
      return (
        <svg {...common}>
          {[0.32, 0.55, 0.78].map((w, i) => (
            <g key={i}>
              <text x="40" y={56 + i * 46} fontSize="12" fill={INK2}>
                {["A", "B", "C"][i]}
              </text>
              <rect x="70" y={44 + i * 46} width="290" height="16" rx="6" fill={S3} />
              <rect x="70" y={44 + i * 46} width={290 * w} height="16" rx="6" fill={`var(--series-${i + 1})`} className="hero-bar" style={{ animationDelay: `${0.1 + i * 0.12}s` }} />
            </g>
          ))}
          <rect x="70" y="190" width="290" height="6" rx="3" fill={S3} />
          <rect x="70" y="190" width="120" height="6" rx="3" fill={P} />
          <circle cx="190" cy="193" r="9" fill="var(--surface)" stroke={P} strokeWidth="3" className="hero-knob" />
          <line x1="250" y1="182" x2="250" y2="204" stroke={A} strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
    case 5: // Export
      return (
        <svg {...common}>
          <rect x="60" y="30" width="130" height="160" rx="10" fill="var(--surface)" stroke="var(--line)" />
          <rect x="76" y="48" width="80" height="8" rx="4" fill={P} />
          <rect x="76" y="66" width="98" height="5" rx="2.5" fill={S3} />
          <rect x="76" y="78" width="70" height="5" rx="2.5" fill={S3} />
          {[0.9, 0.7, 0.55].map((w, i) => (
            <rect key={i} x="76" y={100 + i * 16} width={98 * w} height="8" rx="4" fill={`var(--series-${i + 1})`} className="hero-bar" style={{ animationDelay: `${0.2 + i * 0.1}s` }} />
          ))}
          {["PDF", "CSV", "MD", "JSON"].map((l, i) => (
            <g key={l} className="hero-pop" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
              <rect x="230" y={36 + i * 40} width="120" height="30" rx="8" fill={S2} stroke="var(--line)" />
              <text x="290" y={56 + i * 40} textAnchor="middle" fontSize="12" fontWeight="700" fill={INK2}>
                {l}
              </text>
            </g>
          ))}
        </svg>
      );
    case 6: // Sprachen, hell/dunkel
      return (
        <svg {...common}>
          {["DE", "EN", "FR", "IT"].map((l, i) => (
            <g key={l} className="hero-pop" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
              <rect x={40 + i * 82} y="50" width="66" height="44" rx="10" fill={i === 0 ? P : S2} stroke="var(--line)" />
              <text x={73 + i * 82} y="78" textAnchor="middle" fontSize="15" fontWeight="700" fill={i === 0 ? "var(--primary-ink)" : INK2}>
                {l}
              </text>
            </g>
          ))}
          <rect x="40" y="130" width="150" height="56" rx="10" fill="#ffffff" stroke="var(--line)" />
          <rect x="52" y="142" width="80" height="8" rx="4" fill="#0b5d5a" />
          <rect x="52" y="160" width="110" height="6" rx="3" fill="#e4e2dc" />
          <rect x="210" y="130" width="150" height="56" rx="10" fill="#191c1f" stroke="var(--line)" />
          <rect x="222" y="142" width="80" height="8" rx="4" fill="#3ec6b8" />
          <rect x="222" y="160" width="110" height="6" rx="3" fill="#2b3035" />
        </svg>
      );
    default: // Privacy
      return (
        <svg {...common}>
          <rect x="40" y="40" width="200" height="140" rx="12" fill="var(--primary-soft)" stroke={P} strokeWidth="2" />
          <rect x="40" y="40" width="200" height="22" rx="12" fill={P} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x="58" y={80 + i * 26} width={[150, 110, 130][i]} height="12" rx="6" fill="var(--surface)" className="hero-bar" style={{ animationDelay: `${0.15 + i * 0.12}s` }} />
          ))}
          <line x1="240" y1="110" x2="300" y2="110" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="5 5" />
          <text x="270" y="100" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--bad)" className="flow-blocked">
            ×
          </text>
          <rect x="300" y="80" width="70" height="60" rx="10" fill={S2} stroke="var(--line)" strokeDasharray="4 4" />
          <text x="335" y="114" textAnchor="middle" fontSize="11" fill="var(--ink-3)">
            Server
          </text>
        </svg>
      );
  }
}
