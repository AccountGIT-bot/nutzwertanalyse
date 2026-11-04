"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { ConsentProvider } from "@/lib/consent/ConsentProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ThemeHint } from "@/components/theme/ThemeHint";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ConsentProvider>
        <I18nProvider>
          <ToastProvider>
            {/* Im DOM vor dem Seiteninhalt, damit der Banner per Tastatur früh erreichbar ist (optisch bleibt er unten) */}
            <ConsentBanner />
            {children}
            <ThemeHint />
          </ToastProvider>
        </I18nProvider>
      </ConsentProvider>
    </ThemeProvider>
  );
}
