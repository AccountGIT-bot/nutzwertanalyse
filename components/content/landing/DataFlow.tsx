"use client";

import { useT } from "@/lib/i18n";

/** Animiertes Schema: Daten kreisen im Browser, der Weg zum Server bleibt blockiert. */
export function DataFlow() {
  const t = useT();
  const x = t.landingExtra;
  return (
    <figure className="card p-6">
      <svg viewBox="0 0 440 240" role="img" aria-label={t.landing.privacyTitle} className="w-full text-ink">
        {/* Browser */}
        <rect x="20" y="30" width="260" height="180" rx="14" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2" />
        <rect x="20" y="30" width="260" height="26" rx="14" fill="var(--primary)" />
        <circle cx="38" cy="43" r="4" fill="var(--surface)" opacity=".8" />
        <circle cx="52" cy="43" r="4" fill="var(--surface)" opacity=".6" />
        <text x="150" y="80" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
          {x.flowBrowser}
        </text>
        {["localStorage", "Σ w × r", "PDF · CSV · JSON"].map((l, i) => (
          <g key={l}>
            <rect x="40" y={96 + i * 34} width="220" height="24" rx="6" fill="var(--surface)" stroke="var(--line)" />
            <text x="52" y={112 + i * 34} fontSize="11" fill="var(--ink-2)">
              {l}
            </text>
          </g>
        ))}
        {/* kreisende Datenpunkte innerhalb des Browsers */}
        <g>
          <circle r="5" fill="var(--primary)" className="flow-dot" />
          <circle r="5" fill="var(--accent)" className="flow-dot" />
          <circle r="5" fill="var(--series-1)" className="flow-dot" />
        </g>
        {/* blockierter Weg */}
        <line x1="280" y1="120" x2="352" y2="120" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="6 5" />
        <g className="flow-blocked">
          <circle cx="310" cy="120" r="12" fill="var(--bad-soft)" />
          <path d="M305 115l10 10M315 115l-10 10" stroke="var(--bad)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <text x="310" y="150" textAnchor="middle" fontSize="9.5" fill="var(--ink-3)">
          {x.flowBlocked}
        </text>
        {/* Server */}
        <rect x="352" y="80" width="68" height="80" rx="12" fill="var(--surface-2)" stroke="var(--line)" strokeDasharray="5 4" />
        <text x="386" y="124" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink-3)">
          {x.flowServer}
        </text>
      </svg>
      <figcaption className="mt-2 text-center text-xs text-ink-3">{t.settings.privacyShort}</figcaption>
    </figure>
  );
}
