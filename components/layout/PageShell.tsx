"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function PageShell({ children, minimalHeader = false, className, noFooter = false }: { children: ReactNode; minimalHeader?: boolean; className?: string; noFooter?: boolean }) {
  const t = useT();
  return (
    <>
      <a href="#main" className="skip-link no-print">
        {t.common.skipToContent}
      </a>
      <SiteHeader minimal={minimalHeader} />
      <main id="main" className={cn("min-h-[60vh]", className)}>
        {children}
      </main>
      {!noFooter && <SiteFooter />}
    </>
  );
}

export function Container({ children, className, narrow = false }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6", narrow ? "max-w-3xl" : "max-w-7xl", className)}>{children}</div>;
}
