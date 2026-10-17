"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon, Monitor, Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { localeNames, locales, type Locale } from "@/lib/i18n/config";
import { useTheme, type ThemePref } from "@/lib/theme/ThemeProvider";
import { cn } from "@/lib/utils";

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/so-funktionierts", label: t.nav.how },
    { href: "/anwendungsfaelle", label: t.nav.useCases },
    { href: "/methode", label: t.nav.method },
    { href: "/app", label: t.nav.app },
  ];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg" aria-label={t.nav.home}>
          <Image src="/images/logo-256.webp" alt="" width={36} height={36} className="h-9 w-9" priority />
          <span className="text-base font-bold tracking-tight">
            Nutzwert<span className="text-primary">analyse</span>
          </span>
        </Link>

        {!minimal && (
          <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(l.href) ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                )}
                aria-current={pathname.startsWith(l.href) ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1.5">
          <LocaleMenu locale={locale} setLocale={setLocale} label={t.common.language} />
          <ThemeButton />
          {!minimal && (
            <>
              <Link href="/app/analyse?new=1" className="btn btn-primary btn-sm ml-1 hidden sm:inline-flex">
                {t.nav.start}
              </Link>
              <button type="button" className="btn btn-ghost btn-icon md:hidden" aria-expanded={open} aria-label={t.common.menu} onClick={() => setOpen((v) => !v)}>
                {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
              </button>
            </>
          )}
        </div>
      </div>
      {open && !minimal && (
        <nav aria-label="Mobile Navigation" className="border-t border-line bg-surface px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/einstellungen" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2">
                {t.nav.settings}
              </Link>
            </li>
            <li className="pt-2">
              <Link href="/app/analyse?new=1" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                {t.nav.start}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function LocaleMenu({ locale, setLocale, label }: { locale: Locale; setLocale: (l: Locale) => void; label: string }) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor="locale-select">
        {label}
      </label>
      <div className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-ink-2 hover:bg-surface-2">
        <Languages className="h-4 w-4" aria-hidden />
        <select
          id="locale-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="cursor-pointer appearance-none bg-transparent pr-1 text-sm font-medium uppercase text-ink-2 focus:outline-none"
          title={localeNames[locale]}
        >
          {locales.map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ThemeButton() {
  const { pref, setPref } = useTheme();
  const { t } = useI18n();
  const order: ThemePref[] = ["system", "light", "dark"];
  const next = order[(order.indexOf(pref) + 1) % order.length];
  const Icon = pref === "dark" ? Moon : pref === "light" ? Sun : Monitor;
  return (
    <button type="button" className="btn btn-ghost btn-icon" onClick={() => setPref(next)} aria-label={`${t.common.toggleTheme}: ${t.theme[pref]}`} title={t.theme[pref]}>
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
}
