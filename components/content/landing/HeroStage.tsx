"use client";

/**
 * Cinematischer Hintergrund des Hero: fünf Glasstelen in Petrol mit Messingkanten,
 * aufgereiht wie ein steigendes Balkendiagramm (Higgsfield, Kling 3.0, selbst gehostet).
 * Nur ab lg sichtbar, rechts hinter der Ergebnis-Karte, mit Verlauf in die Seitenfarbe.
 * Poster liegt immer darunter; bei «Bewegung reduzieren» bleibt es beim Poster.
 */
const HERO_VIDEO_READY = false; // auf true setzen, sobald public/video/hero-bg.* vorliegen

export function HeroStage() {
  const pos = "object-[38%_50%]";
  return (
    <div className="no-print absolute inset-y-0 right-0 hidden w-[64%] lg:block" aria-hidden>
      <div className="stage-media absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/video/hero-bg-poster.jpg" alt="" className={`absolute inset-0 h-full w-full object-cover ${pos}`} decoding="async" fetchPriority="high" />
        {HERO_VIDEO_READY && (
          <video className={`stage-video absolute inset-0 h-full w-full object-cover ${pos}`} autoPlay muted loop playsInline preload="metadata" poster="/video/hero-bg-poster.jpg" tabIndex={-1}>
            <source src="/video/hero-bg.webm" type="video/webm" media="(min-width: 1280px)" />
            <source src="/video/hero-bg.mp4" type="video/mp4" media="(min-width: 1280px)" />
            <source src="/video/hero-bg-720.webm" type="video/webm" />
            <source src="/video/hero-bg-720.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      <div className="stage-veil absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg from-[6%] via-bg/75 via-[26%] to-transparent to-[52%]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
