"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useT } from "@/lib/i18n";

export default function NotFound() {
  const t = useT();
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-7xl font-black tracking-tight text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">{t.errors.notFoundTitle}</h1>
        <p className="mt-2 text-ink-2">{t.errors.notFoundText}</p>
        <Link href="/" className="btn btn-primary mt-8">
          {t.errors.toHome}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
