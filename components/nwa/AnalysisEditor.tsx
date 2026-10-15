"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { library } from "@/lib/nwa/library";
import { analysisFromPreset } from "@/lib/nwa/presets";
import { AnalysisProvider } from "@/lib/nwa/store";
import type { Analysis } from "@/lib/nwa/types";
import { PageShell, Container } from "@/components/layout/PageShell";
import { Wizard } from "./Wizard";
import { PrintReport } from "./PrintReport";

export function AnalysisEditor() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const id = params.get("id");
  const isNew = params.get("new") === "1";
  const preset = params.get("preset") ?? undefined;
  const print = params.get("print") === "1";
  const [analysis, setAnalysis] = useState<Analysis | null | undefined>(undefined);

  useEffect(() => {
    if (isNew) {
      const a = analysisFromPreset(t, { presetId: preset, selfName: t.decision.self });
      library.save(a);
      router.replace(`/app/analyse?id=${encodeURIComponent(a.id)}`);
      return;
    }
    if (id) {
      setAnalysis(library.get(id));
    } else {
      router.replace("/app");
    }
    // t absichtlich nicht als Abhängigkeit: Sprachwechsel soll keine neue Analyse erzeugen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, preset, router]);

  if (analysis === undefined) {
    return (
      <PageShell minimalHeader noFooter>
        <Container className="py-16 text-center text-sm text-ink-3" aria-busy="true">
          {t.common.loading}
        </Container>
      </PageShell>
    );
  }

  if (analysis === null) {
    return (
      <PageShell>
        <Container narrow className="py-16 text-center">
          <h1 className="text-xl font-bold">{t.errors.analysisNotFound}</h1>
          <p className="mt-2 text-sm text-ink-2">{t.errors.analysisNotFoundText}</p>
          <Link href="/app" className="btn btn-primary mt-6">
            {t.wizard.backToList}
          </Link>
        </Container>
      </PageShell>
    );
  }

  if (print) {
    return <PrintReport analysis={analysis} />;
  }

  return (
    <AnalysisProvider key={analysis.id} initial={analysis}>
      <PageShell noFooter>
        <Wizard />
      </PageShell>
    </AnalysisProvider>
  );
}
