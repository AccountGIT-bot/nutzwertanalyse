"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { ConsentProvider } from "@/lib/consent/ConsentProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ConsentProvider>
        <I18nProvider>
          <ToastProvider>
            {children}
            <ConsentBanner />
          </ToastProvider>
        </I18nProvider>
      </ConsentProvider>
    </ThemeProvider>
  );
}
