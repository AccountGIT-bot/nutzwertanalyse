"use client";

/**
 * Animierte Hero-Illustration: eine kleine Bewertungsmatrix, deren Balken
 * wachsen, ein Gewichts-Regler, der pendelt, und ein Ergebnis-Badge.
 * Rein CSS-animiert, respektiert prefers-reduced-motion.
 */
export function HeroVisual({ labels }: { labels: { criteria: string[]; alternatives: string[]; result: string; weight: string } }) {
  const P = "var(--primary)";
  const A = "var(--accent)";
  const widths = [
    [118, 84, 102],
    [96, 124, 70],
    [76, 92, 132],
  ];
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label={labels.result} className="w-full max-w-xl text-ink">
      <rect x="8" y="8" width="504" height="344" rx="16" fill="var(--surface)" stroke="var(--line)" />
      {/* Kopfzeile */}
      {labels.alternatives.slice(0, 3).map((a, i) => (
        <g key={i}>
          <circle cx={190 + i * 110} cy="40" r="5" fill={`var(--series-${i + 1})`} />
          <text x={202 + i * 110} y="44" fontSize="12" fontWeight="600" fill="currentColor">
            {a}
          </text>
        </g>
      ))}
      {/* Zeilen */}
      {labels.criteria.slice(0, 3).map((c, r) => (
        <g key={r}>
          <text x="32" y={92 + r * 62} fontSize="12" fill="var(--ink-2)">
            {c.length > 20 ? c.slice(0, 19) + "…" : c}
          </text>
          <rect x="32" y={100 + r * 62} width="120" height="4" rx="2" fill="var(--surface-3)" />
          <rect x="32" y={100 + r * 62} width={[86, 64, 104][r]} height="4" rx="2" fill={P} className="hero-bar" style={{ animationDelay: `${0.2 + r * 0.15}s` }} />
          {widths[r].map((w, i) => (
            <g key={i}>
              <rect x={184 + i * 110} y={78 + r * 62} width="96" height="20" rx="4" fill="var(--surface-2)" />
              <rect x={184 + i * 110} y={78 + r * 62} width={(96 * w) / 140} height="20" rx="4" fill={`var(--series-${i + 1})`} className="hero-bar" style={{ animationDelay: `${0.5 + r * 0.15 + i * 0.1}s` }} />
            </g>
          ))}
        </g>
      ))}
      {/* Gewichts-Regler */}
      <text x="32" y="270" fontSize="11" fill="var(--ink-3)">
        {labels.weight}
      </text>
      <rect x="32" y="282" width="120" height="6" rx="3" fill="var(--surface-3)" />
      <rect x="32" y="282" width="60" height="6" rx="3" fill={P} />
      <circle cx="68" cy="285" r="9" fill="var(--surface)" stroke={P} strokeWidth="3" className="hero-knob" />
      {/* Ergebnis */}
      <g className="hero-pop" style={{ animationDelay: "1.6s" }}>
        <rect x="184" y="250" width="312" height="70" rx="12" fill="var(--primary-soft)" />
        <circle cx="216" cy="285" r="14" fill={A} />
        <path d="M209 285l5 5 9-10" stroke="var(--surface)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="240" y="280" fontSize="12" fill="var(--ink-2)">
          {labels.result}
        </text>
        <text x="240" y="302" fontSize="18" fontWeight="700" fill="currentColor">
          {labels.alternatives[2]} · 79 %
        </text>
      </g>
    </svg>
  );
}
