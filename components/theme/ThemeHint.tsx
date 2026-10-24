"use client";

import { useEffect, useState } from "react";
import { Moon, X } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useConsent } from "@/lib/consent/ConsentProvider";
import { useI18n } from "@/lib/i18n";
import { readConsent } from "@/lib/consent/consent";

/** Merker, dass der Hinweis gezeigt wurde (nur mit Einwilligung «Funktional» dauerhaft). */
export const THEME_HINT_KEY = "nwa.themeHint";
/** Zeit auf der Website, bevor der Hinweis erscheint. */
const DELAY_MS = 3 * 60 * 1000;
/** Abstand zwischen den Versuchen, falls Tab unsichtbar oder Einwilligung noch offen. */
const RETRY_MS = 15 * 1000;
/** Abstand von der rechten Kante des Hinweises (entspricht `right-3`). */
const BOX_RIGHT_PX = 12;

/* Modulweit, damit Seitenwechsel innerhalb der App den Zähler nicht zurücksetzen. */
let armedAt: number | null = null;
let shownThisSession = false;

function alreadyDismissed(): boolean {
  try {
    return window.localStorage.getItem(THEME_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function markDismissed(): void {
  shownThisSession = true;
  try {
    if (readConsent()?.functional) window.localStorage.setItem(THEME_HINT_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Mitte des Theme-Knopfs, gemessen von der rechten Fensterkante. */
function measureAnchor(): number | null {
  const el = document.querySelector("[data-theme-toggle]");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return Math.round(window.innerWidth - (r.left + r.width / 2));
}

/**
 * Dezenter Hinweis auf den Dunkelmodus: erscheint nach etwa drei Minuten auf der
 * Website, nur solange das Design nicht selbst gewählt wurde und die Seite hell ist.
 * Solange er offen ist, pulsiert der Theme-Knopf; ein Wechsel bestätigt kurz.
 */
export function ThemeHint() {
  const { resolved, chosen, requestPref, setCue } = useTheme();
  const { consent, loading } = useConsent();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [anchorRight, setAnchorRight] = useState<number | null>(null);
  const consentDecided = !loading && consent !== null;

  useEffect(() => {
    if (shownThisSession || open || chosen || resolved === "dark") return;
    if (alreadyDismissed()) {
      shownThisSession = true;
      return;
    }
    if (armedAt === null) armedAt = Date.now();
    let timer = 0;
    const tryShow = () => {
      if (shownThisSession) return;
      if (document.visibilityState !== "visible" || !consentDecided) {
        timer = window.setTimeout(tryShow, RETRY_MS);
        return;
      }
      shownThisSession = true;
      setAnchorRight(measureAnchor());
      setOpen(true);
      setCue("pulse");
    };
    timer = window.setTimeout(tryShow, Math.max(0, DELAY_MS - (Date.now() - armedAt)));
    return () => window.clearTimeout(timer);
  }, [open, chosen, resolved, consentDecided, setCue]);

  const visible = open && !chosen;

  /* Pfeil folgt dem Knopf bei Grössenänderung; Escape schliesst */
  useEffect(() => {
    if (!visible) return;
    const onResize = () => setAnchorRight(measureAnchor());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setCue("none");
        markDismissed();
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [visible, setCue]);

  /* Wechsel über den Knopf im Kopf: Hinweis gilt als erledigt */
  useEffect(() => {
    if (open && chosen) markDismissed();
  }, [open, chosen]);

  if (!visible) return null;

  const dismiss = () => {
    setOpen(false);
    setCue("none");
    markDismissed();
  };
  const tryDark = () => {
    setOpen(false);
    markDismissed();
    requestPref("dark");
  };
  const arrowRight = anchorRight === null ? 64 : Math.max(14, anchorRight - BOX_RIGHT_PX - 7);

  return (
    <div role="status" aria-live="polite" className="theme-hint no-print fixed right-3 top-[4.25rem] z-[70] w-[min(17.5rem,calc(100vw-1.5rem))]">
      <div className="theme-hint-arrow" style={{ right: arrowRight }} aria-hidden />
      <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface py-2.5 pl-3 pr-1.5 shadow-lg">
        <Moon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1 text-sm">
          <p className="leading-snug text-ink">
            <span className="font-semibold">{t.themeHint.title}</span> {t.themeHint.text}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <button type="button" className="btn btn-primary btn-sm" onClick={tryDark}>
              {t.themeHint.tryIt}
            </button>
            <button type="button" className="text-sm font-medium text-ink-3 hover:text-ink" onClick={dismiss}>
              {t.themeHint.dismiss}
            </button>
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-icon -mt-1 h-7 w-7 !p-1" aria-label={t.themeHint.close} onClick={dismiss}>
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
