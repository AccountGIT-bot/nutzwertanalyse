"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Link2, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { decodeShareFragment } from "@/lib/nwa/serialize";
import { duplicateAnalysis } from "@/lib/nwa/factory";
import { library } from "@/lib/nwa/library";
import type { Analysis } from "@/lib/nwa/types";
import { PageShell, Container } from "@/components/layout/PageShell";

export function ShareImport() {
  const { t } = useI18n();
  const router = useRouter();
  const [state, setState] = useState<{ status: "loading" } | { status: "error" } | { status: "ready"; analysis: Analysis }>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const a = await decodeShareFragment(window.location.hash);
      if (cancelled) return;
      setState(a ? { status: "ready", analysis: a } : { status: "error" });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const open = () => {
    if (state.status !== "ready") return;
    const copy = duplicateAnalysis(state.analysis, "");
    copy.step = "results";
    library.save(copy);
    // Fragment aus der Adresszeile entfernen, damit die Daten nicht im Verlauf bleiben
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      /* ignore */
    }
    router.replace(`/app/analyse?id=${encodeURIComponent(copy.id)}`);
  };

  return (
    <PageShell>
      <Container narrow className="py-16">
        <div className="card mx-auto max-w-lg p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Link2 className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-4 text-xl font-bold">{t.errors.shareTitle}</h1>
          {state.status === "loading" && <p className="mt-2 text-sm text-ink-2">{t.errors.shareLoading}</p>}
          {state.status === "error" && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-bad-soft p-3 text-left text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-hidden />
              {t.errors.shareInvalid}
            </div>
          )}
          {state.status === "ready" && (
            <>
              <p className="mt-2 text-sm text-ink-2">{t.errors.shareText}</p>
              <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3 text-left">
                <div className="font-semibold">{state.analysis.title || t.common.untitled}</div>
                <div className="mt-1 text-xs text-ink-3">
                  {state.analysis.alternatives.length} {t.steps.alternatives.label} · {state.analysis.criteria.length} {t.steps.criteria.label}
                </div>
              </div>
              <button type="button" className="btn btn-primary mt-5 w-full" onClick={open}>
                {t.errors.shareOpen}
              </button>
            </>
          )}
          <Link href="/app" className="btn btn-ghost mt-3 w-full">
            {t.wizard.backToList}
          </Link>
        </div>
      </Container>
    </PageShell>
  );
}
