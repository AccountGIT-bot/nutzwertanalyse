"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ShieldCheck } from "lucide-react";
import { useConsent } from "@/lib/consent/ConsentProvider";
import { useI18n } from "@/lib/i18n";
import { privacySignalActive, type ConsentState } from "@/lib/consent/consent";
import { Dialog } from "@/components/ui/Dialog";
import { Switch } from "@/components/ui/Controls";
import { fmt, formatDate } from "@/lib/utils";

const noop = () => () => {};
const readGpc = () => privacySignalActive();
const serverGpc = () => false;

export function ConsentBanner() {
  const { consent, loading, dialogOpen, openDialog, closeDialog, acceptAll, essentialOnly, setFunctional } = useConsent();
  const { t } = useI18n();
  const gpc = useSyncExternalStore(noop, readGpc, serverGpc);
  const showBanner = !loading && consent === null && !dialogOpen;

  return (
    <>
      {showBanner && (
        <div role="region" aria-label={t.consent.title} className="no-print fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4">
          <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-4 shadow-lg sm:p-5 fade-up">
            <div className="flex items-start gap-3">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary sm:flex">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold">{t.consent.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">
                  {t.consent.text}{" "}
                  <Link href="/cookies" className="font-medium text-primary underline underline-offset-2">
                    {t.consent.moreInfo}
                  </Link>
                </p>
                {gpc && <p className="mt-2 text-xs text-ink-3">{t.consent.gpc}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-primary" onClick={acceptAll}>
                    {t.consent.acceptAll}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={essentialOnly}>
                    {t.consent.essentialOnly}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={openDialog}>
                    {t.consent.settings}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogOpen && <ConsentDialog consent={consent} onClose={closeDialog} onEssentialOnly={essentialOnly} onSave={setFunctional} />}
    </>
  );
}

function ConsentDialog({ consent, onClose, onEssentialOnly, onSave }: { consent: ConsentState | null; onClose: () => void; onEssentialOnly: () => void; onSave: (functional: boolean) => void }) {
  const { t, tag } = useI18n();
  const [draftFunctional, setDraftFunctional] = useState(consent?.functional ?? false);
  return (
    <Dialog
      open
      onClose={onClose}
      title={t.consent.title}
      description={t.consent.text}
      closeLabel={t.common.close}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onEssentialOnly}>
            {t.consent.essentialOnly}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onSave(draftFunctional)}>
            {t.consent.save}
          </button>
        </>
      }
    >
      <ul className="space-y-3">
        <ConsentRow label={t.consent.categories.essential.label} description={t.consent.categories.essential.description} badge={t.consent.categories.essential.always} checked disabled onChange={() => {}} />
        <ConsentRow label={t.consent.categories.functional.label} description={t.consent.categories.functional.description} checked={draftFunctional} onChange={setDraftFunctional} />
        <ConsentRow label={t.consent.categories.analytics.label} description={t.consent.categories.analytics.description} badge={t.consent.categories.analytics.notUsed} checked={false} disabled onChange={() => {}} />
        <ConsentRow label={t.consent.categories.marketing.label} description={t.consent.categories.marketing.description} badge={t.consent.categories.marketing.notUsed} checked={false} disabled onChange={() => {}} />
      </ul>
      {consent && <p className="mt-4 text-xs text-ink-3">{fmt(t.consent.decidedAt, { date: formatDate(consent.decidedAt, tag) })}</p>}
      <p className="mt-2 text-xs text-ink-3">
        <Link href="/datenschutz" className="underline underline-offset-2">
          {t.nav.privacy}
        </Link>
        {" · "}
        <Link href="/cookies" className="underline underline-offset-2">
          {t.nav.cookies}
        </Link>
      </p>
    </Dialog>
  );
}

function ConsentRow({ label, description, badge, checked, disabled, onChange }: { label: string; description: string; badge?: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-line bg-surface-2/50 p-3.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          {badge && <span className="badge">{badge}</span>}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onChange={onChange} label={label} />
    </li>
  );
}
