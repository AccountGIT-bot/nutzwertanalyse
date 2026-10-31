/**
 * Bildmarke «Gewicht × Bewertung»: drei Balken, Breite = Gewicht, Höhe = Bewertung, Fläche = Nutzwert.
 * Die grösste Fläche ist golden – die Empfehlung. Feste Markenfarben, damit die Marke in hell und dunkel gleich bleibt.
 * Gleiche Geometrie wie public/logo.svg und die App-Icons (scripts/brand-icons.mjs).
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      <rect width="64" height="64" rx="15" fill="#0b5d5a" />
      <rect x="12" y="34" width="8" height="18" rx="2.5" fill="#ffffff" opacity="0.72" />
      <rect x="23" y="24" width="11" height="28" rx="2.5" fill="#ffffff" />
      <rect x="37" y="12" width="15" height="40" rx="2.5" fill="#d9a441" />
    </svg>
  );
}
