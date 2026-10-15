"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useT } from "@/lib/i18n";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">{t.errors.errorTitle}</h1>
      <p className="mt-2 text-ink-2">{t.errors.errorText}</p>
      <div className="mt-8 flex gap-3">
        <button type="button" className="btn btn-primary" onClick={reset}>
          {t.errors.retry}
        </button>
        <Link href="/" className="btn btn-secondary">
          {t.errors.toHome}
        </Link>
      </div>
    </main>
  );
}
