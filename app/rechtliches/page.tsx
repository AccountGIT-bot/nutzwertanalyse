import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Cookie, FileText, Gavel, Scale, ShieldCheck } from "lucide-react";
import { ConsentSettingsButton } from "@/app/components/CookieConsent";
import { siteConfig, formatSwissDate } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "Rechtliches",
  description:
    "Übersicht aller Rechtstexte von Nutzwertanalyse.com: Impressum, Datenschutzerklärung nach DSG, Cookie-Richtlinie und AGB nach schweizerischem Recht.",
  alternates: { canonical: "/rechtliches" },
};

const DOCUMENTS = [
  {
    href: "/impressum",
    icon: FileText,
    title: "Impressum",
    description:
      "Anbieterkennzeichnung, Kontaktangaben, Registerdaten sowie Haftungs- und Urheberrechtshinweise.",
    basis: "Art. 3 Abs. 1 lit. s UWG",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    href: "/datenschutz",
    icon: ShieldCheck,
    title: "Datenschutzerklärung",
    description:
      "Welche Personendaten bearbeitet werden, zu welchem Zweck, wie lange – und welche Rechte Ihnen zustehen.",
    basis: "DSG, DSV, DSGVO",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    href: "/cookies",
    icon: Cookie,
    title: "Cookie-Richtlinie",
    description:
      "Vollständige Liste aller lokalen Speichereinträge inklusive Zweck, Dauer und Einwilligungskategorie.",
    basis: "Art. 45c lit. b FMG",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    href: "/agb",
    icon: Gavel,
    title: "Allgemeine Geschäftsbedingungen",
    description:
      "Vertragsgrundlage für die Nutzung des Dienstes: Leistungen, Pflichten, Haftung, Gerichtsstand.",
    basis: "OR, ZPO",
    gradient: "from-purple-500 to-pink-400",
  },
];

const PRINCIPLES = [
  {
    title: "Daten bleiben lokal",
    text: "Analysen werden im Browser gespeichert und nicht auf unsere Server übertragen – Datenschutz durch Technik nach Art. 7 DSG.",
  },
  {
    title: "Keine Tracking-Cookies",
    text: "Kein Werbe-Tracking, keine Social-Plugins, keine Weitergabe zu Marketingzwecken.",
  },
  {
    title: "Export jederzeit",
    text: "Ihre Daten lassen sich jederzeit als JSON, CSV oder Bericht exportieren – Datenherausgabe nach Art. 28 DSG.",
  },
  {
    title: "Ohne Registrierung nutzbar",
    text: "Der volle Analyseumfang steht ohne Konto und ohne Angabe von Personendaten zur Verfügung.",
  },
];

export default function RechtlichesPage() {
  return (
    <div className="relative min-h-[100svh] bg-[#07070b] text-white">
      {/* Hintergrund */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#07070b] via-[#0b1020] to-[#0a0a12]" />
        <div className="absolute -left-[10%] -top-[15%] h-[560px] w-[560px] rounded-full bg-blue-600/12 blur-[130px]" />
        <div className="absolute -right-[8%] top-[30%] h-[460px] w-[460px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/50 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
              <Scale className="h-4 w-4 text-white" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight">
                Nutzwertanalyse<span className="text-white/40">.com</span>
              </span>
              <span className="block text-[11px] text-white/40">Rechtliches</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Startseite
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-6 sm:pt-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">
            Compliance
          </span>
          <h1 className="mt-5 text-[clamp(2rem,8vw,3.75rem)] font-bold leading-[1.08] tracking-tight break-words">
            <span className="bg-gradient-to-r from-white via-white to-white/55 bg-clip-text text-transparent">
              Rechtliche Grundlagen
            </span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/55">
            Alle Rechtstexte von {siteConfig.name} an einem Ort – ausgerichtet auf das schweizerische
            Recht und, wo anwendbar, auf die europäische Datenschutz-Grundverordnung.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-white/40">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
              Version {siteConfig.legalVersion.version}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
              Stand: {formatSwissDate(siteConfig.legalVersion.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Dokumente */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {DOCUMENTS.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.04]"
            >
              <div
                className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${doc.gradient} opacity-[0.07] blur-2xl transition duration-500 group-hover:opacity-[0.16]`}
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${doc.gradient} shadow-lg`}
                  >
                    <doc.icon className="h-5 w-5 text-white" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/60" />
                </div>
                <h2 className="mt-5 text-lg font-semibold tracking-tight text-white">{doc.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{doc.description}</p>
                <span className="legal-ref mt-4 inline-flex">{doc.basis}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Grundsätze */}
        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight">Unsere Datenschutz-Grundsätze</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((principle) => (
              <div
                key={principle.title}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
              >
                <div className="text-sm font-semibold text-white/85">{principle.title}</div>
                <p className="mt-2 text-[13px] leading-relaxed text-white/45">{principle.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Kontakt / Einstellungen */}
        <section className="mt-14 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 p-8 backdrop-blur-xl sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">Fragen zum Datenschutz?</h2>
          <p className="mt-3 max-w-2xl text-white/55">
            Auskunfts-, Berichtigungs- und Löschungsbegehren nach Art. 25 und 32 DSG beantworten wir
            grundsätzlich innert 30 Tagen. Ihre Datenschutz-Einstellungen können Sie jederzeit anpassen.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ConsentSettingsButton className="rounded-xl bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white" />
            <Link
              href="/datenschutz#rechte"
              className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.1] hover:text-white"
            >
              Ihre Rechte im Überblick
            </Link>
            <Link
              href="/impressum#anbieter"
              className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.1] hover:text-white"
            >
              Kontakt zum Anbieter
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} {siteConfig.name}</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/impressum" className="transition hover:text-white/70">Impressum</Link>
            <Link href="/datenschutz" className="transition hover:text-white/70">Datenschutz</Link>
            <Link href="/cookies" className="transition hover:text-white/70">Cookies</Link>
            <Link href="/agb" className="transition hover:text-white/70">AGB</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
