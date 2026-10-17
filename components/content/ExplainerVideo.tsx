"use client";

import { useI18n } from "@/lib/i18n";

/**
 * Lokal gehostetes Erklärvideo (Motion Graphics, ohne Ton) mit Untertitelspuren
 * in vier Sprachen. Keine externen Player, keine Drittanbieter.
 */
export function ExplainerVideo({ autoPlay = false }: { autoPlay?: boolean }) {
  const { locale, t } = useI18n();
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface shadow-md">
      <video
        className="aspect-video w-full bg-black"
        controls
        playsInline
        muted
        autoPlay={autoPlay}
        preload="metadata"
        poster="/video/explainer-poster.jpg"
        crossOrigin="anonymous"
      >
        <source src="/video/explainer.mp4" type="video/mp4" />
        <source src="/video/explainer.webm" type="video/webm" />
        <track kind="subtitles" srcLang="de" label="Deutsch" src="/video/explainer.de.vtt" default={locale === "de"} />
        <track kind="subtitles" srcLang="en" label="English" src="/video/explainer.en.vtt" default={locale === "en"} />
        <track kind="subtitles" srcLang="fr" label="Français" src="/video/explainer.fr.vtt" default={locale === "fr"} />
        <track kind="subtitles" srcLang="it" label="Italiano" src="/video/explainer.it.vtt" default={locale === "it"} />
      </video>
      <figcaption className="px-4 py-2 text-xs text-ink-3">{t.how.videoCaption}</figcaption>
    </figure>
  );
}
