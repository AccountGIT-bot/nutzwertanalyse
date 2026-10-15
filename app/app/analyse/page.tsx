import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalysisEditor } from "@/components/nwa/AnalysisEditor";

export const metadata: Metadata = { title: "Analyse", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <AnalysisEditor />
    </Suspense>
  );
}
