"use client";

import { useState, useSyncExternalStore } from "react";
import { Download, Trash2, ShieldCheck, Globe, SunMoon, Database } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { appVersion } from "@/lib/site";
import { localeNames, locales, type Locale } from "@/lib/i18n/config";
import { useTheme, type ThemePref } from "@/lib/theme/ThemeProvider";
import { useConsent } from "@/lib/consent/ConsentProvider";
import { storageFootprint } from "@/lib/consent/consent";
import { library } from "@/lib/nwa/library";
import { toExportFile } from "@/lib/nwa/serialize";
import { downloadBlob, fmt, formatDate } from "@/lib/utils";
import { PageShell, Container } from "@/components/layout/PageShell";
import { SegmentedControl } from "@/components/ui/Controls";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";

export function SettingsView() {
  const { t, locale, setLocale, tag } = useI18n();
  const { pref, setPref } = useTheme();
  const { consent, functional, openDialog, revokeAll } = useConsent();
  const { toast } = useToast();
  const entries = useSyncExternalStore(
    (cb) => library.subscribe(cb),
    () => library.list(),
    () => [],
  );
  const bytes = useSyncExternalStore(
    (cb) => library.subscribe(cb),
    () => storageFootprint(),
    () => 0,
  );
  const [confirm, setConfirm] = useState<"deleteAll" | "revoke" | null>(null);

  const exportAll = () => {
    const all = library.exportAll();
    downloadBlob(`nutzwertanalyse-export-${new Date().toISOString().slice(0, 10)}.json`, toExportFile(all), "application/json");
  };

  return (
    <PageShell>
      <Container narrow className="py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight">{t.settings.title}</h1>

        <section className="card mt-8 p-5" aria-labelledby="s-lang">
          <h2 id="s-lang" className="flex items-center gap-2 text-base font-semibold">
            <Globe className="h-4 w-4 text-primary" aria-hidden /> {t.settings.language}
          </h2>
          <div className="mt-3">
            <SegmentedControl<Locale>
              label={t.settings.language}
              value={locale}
              onChange={setLocale}
              options={locales.map((l) => ({ value: l, label: localeNames[l] }))}
            />
          </div>
        </section>

        <section className="card mt-4 p-5" aria-labelledby="s-theme">
          <h2 id="s-theme" className="flex items-center gap-2 text-base font-semibold">
            <SunMoon className="h-4 w-4 text-primary" aria-hidden /> {t.settings.theme}
          </h2>
          <div className="mt-3">
            <SegmentedControl<ThemePref>
              label={t.settings.theme}
              value={pref}
              onChange={setPref}
              options={[
                { value: "system", label: t.theme.system },
                { value: "light", label: t.theme.light },
                { value: "dark", label: t.theme.dark },
              ]}
            />
          </div>
        </section>

        <section className="card mt-4 p-5" aria-labelledby="s-storage">
          <h2 id="s-storage" className="flex items-center gap-2 text-base font-semibold">
            <Database className="h-4 w-4 text-primary" aria-hidden /> {t.settings.storage}
          </h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-xs text-ink-3">{t.settings.storageStatus}</dt>
              <dd className="font-medium">{functional ? t.settings.storageOn : t.settings.storageOff}</dd>
            </div>
            <div className="rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-xs text-ink-3">{t.settings.storageUsed}</dt>
              <dd className="font-medium tabular">
                {(bytes / 1024).toFixed(1)} KB · {fmt(t.dashboard.count, { count: entries.length })}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary" onClick={exportAll} disabled={entries.length === 0}>
              <Download className="h-4 w-4" aria-hidden /> {t.settings.exportAll}
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setConfirm("deleteAll")} disabled={entries.length === 0}>
              <Trash2 className="h-4 w-4" aria-hidden /> {t.settings.deleteAll}
            </button>
          </div>
        </section>

        <section className="card mt-4 p-5" aria-labelledby="s-consent">
          <h2 id="s-consent" className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden /> {t.settings.consent}
          </h2>
          <p className="mt-2 text-sm text-ink-2">{t.settings.privacyShort}</p>
          {consent && <p className="mt-1 text-xs text-ink-3">{fmt(t.consent.decidedAt, { date: formatDate(consent.decidedAt, tag) })}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary" onClick={openDialog}>
              {t.consent.settings}
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setConfirm("revoke")}>
              {t.consent.revoke}
            </button>
          </div>
        </section>

        <section className="mt-4 px-1 text-xs text-ink-3" aria-label={t.settings.about}>
          {fmt(t.settings.aboutText, { version: appVersion })}
        </section>

        <ConfirmDialog
          open={confirm === "deleteAll"}
          title={t.settings.deleteAll}
          text={t.dashboard.confirmDeleteAll}
          confirmLabel={t.common.delete}
          cancelLabel={t.common.cancel}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            library.clear();
            setConfirm(null);
            toast(t.consent.revoked, "success");
          }}
        />
        <ConfirmDialog
          open={confirm === "revoke"}
          title={t.consent.revoke}
          text={t.dashboard.confirmDeleteAll}
          confirmLabel={t.common.confirm}
          cancelLabel={t.common.cancel}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            revokeAll();
            setConfirm(null);
            toast(t.consent.revoked, "success");
          }}
        />
      </Container>
    </PageShell>
  );
}
