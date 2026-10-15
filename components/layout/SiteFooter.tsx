"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useConsent } from "@/lib/consent/ConsentProvider";
import { site } from "@/lib/site";

export function SiteFooter() {
  const { t } = useI18n();
  const { openDialog } = useConsent();
  const year = new Date().getFullYear();

  return (
    <footer className="no-print border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-base font-bold tracking-tight">
            Nutzwert<span className="text-primary">analyse</span>
          </div>
          <p className="mt-2 max-w-md text-sm text-ink-2">{t.nav.footerTagline}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-ink-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            {t.nav.madeIn}
          </div>
        </div>
        <nav aria-label={t.nav.product}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t.nav.product}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/app" className="text-ink-2 hover:text-ink">
                {t.nav.app}
              </Link>
            </li>
            <li>
              <Link href="/methode" className="text-ink-2 hover:text-ink">
                {t.nav.method}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-ink-2 hover:text-ink">
                {t.nav.faq}
              </Link>
            </li>
            <li>
              <Link href="/einstellungen" className="text-ink-2 hover:text-ink">
                {t.nav.settings}
              </Link>
            </li>
            {site.repoUrl && (
              <li>
                <a href={site.repoUrl} rel="noopener noreferrer" target="_blank" className="text-ink-2 hover:text-ink">
                  {t.nav.openSource}
                </a>
              </li>
            )}
          </ul>
        </nav>
        <nav aria-label={t.nav.legal}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t.nav.legal}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/impressum" className="text-ink-2 hover:text-ink">
                {t.nav.imprint}
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="text-ink-2 hover:text-ink">
                {t.nav.privacy}
              </Link>
            </li>
            <li>
              <Link href="/agb" className="text-ink-2 hover:text-ink">
                {t.nav.terms}
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="text-ink-2 hover:text-ink">
                {t.nav.cookies}
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheit" className="text-ink-2 hover:text-ink">
                {t.nav.accessibility}
              </Link>
            </li>
            <li>
              <button type="button" onClick={openDialog} className="text-ink-2 underline-offset-2 hover:text-ink hover:underline">
                {t.consent.settings}
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {year} {site.domain}
          </span>
          <span>{t.settings.privacyShort}</span>
        </div>
      </div>
    </footer>
  );
}
