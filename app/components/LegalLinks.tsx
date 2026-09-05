"use client";

import Link from "next/link";
import { ConsentSettingsButton } from "@/app/components/CookieConsent";

const LINKS = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/cookies", label: "Cookies" },
  { href: "/agb", label: "AGB" },
  { href: "/rechtliches", label: "Rechtliches" },
];

/**
 * Rechtliche Pflichtlinks. Das Impressum muss von jeder Seite aus leicht
 * erreichbar sein (Art. 3 Abs. 1 lit. s UWG), deshalb wird diese Leiste in
 * allen Ansichten eingebunden – auch im Analyse-Assistenten.
 */
export function LegalLinks({
  className = "",
  linkClassName = "transition hover:text-white/70",
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <nav aria-label="Rechtliche Hinweise" className={`flex flex-wrap gap-x-4 gap-y-1 ${className}`}>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className={linkClassName}>
          {link.label}
        </Link>
      ))}
      <ConsentSettingsButton className={linkClassName} />
    </nav>
  );
}
