"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Mail, MessageSquareQuote, Sparkles, Star } from "lucide-react";
import { useT } from "@/lib/i18n";
import { isPlaceholder, site } from "@/lib/site";
import type { PresetId } from "@/lib/nwa/parser";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const MEETING_BLUR =
  "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAAAwBACdASoYAA4APtFWpUwoJKOiMAgBABoJYgC7MoGv/gPGI92xi5i4wAAA/unzn0mG3m1qlQ1tDeQetmDWNxumYjNw/pBu8GbMsMtIfzQOwyawVgUC9T+V9Eo/uwQm4sMtqyQg/LwKAAAA";

/** Ruhige Farben für die Initialen-Kreise (fix, unabhängig vom Theme). */
const AVATAR_COLORS = ["#0b5d5a", "#b8862b", "#2a78d6", "#6250d6", "#1f7a3f"];

function useInView<T extends HTMLElement>(threshold = 0.25): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setSeen(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

/** Fünf Sterne, die nacheinander «aufleuchten» – rein dekorativ. */
function Stars({ run }: { run: boolean }) {
  return (
    <div className={cn("voices-stars flex gap-1", run && "is-on")} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="h-8 w-8 sm:h-9 sm:w-9" style={{ transitionDelay: `${300 + i * 110}ms` }} />
      ))}
    </div>
  );
}

/**
 * Vollflächiger, weichgezeichneter Hintergrund mit heller Karte: Feedback-Aufruf links,
 * Beispielstimmen als Karussell rechts, darunter vier Argumente mit Haken.
 */
export function VoicesSection() {
  const t = useT();
  const v = t.landingExtra.voices;
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const trackRef = useRef<HTMLUListElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const email = site.operator.email;
  const hasEmail = !isPlaceholder(email);
  const mailto = hasEmail ? `mailto:${email}?subject=${encodeURIComponent(v.mailSubject)}` : undefined;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 8);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    const raf = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      ro?.disconnect();
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("li");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div ref={ref} className="voices relative isolate overflow-hidden bg-[#0e1b1e] text-white">
      {/* Hintergrund: vorab weichgezeichnetes Bild, langsame Kamerafahrt, dunkler Schleier */}
      <div className="absolute inset-0 no-print" aria-hidden>
        <Image src="/images/landing/meeting-blur.webp" alt="" fill sizes="100vw" placeholder="blur" blurDataURL={MEETING_BLUR} className={cn("voices-bg object-cover", seen && "is-on")} />
        <div className="absolute inset-0 bg-[#07141a]/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07141a]/65 via-transparent to-[#07141a]/80" />
        <div className="voices-glow absolute left-1/2 top-[38%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal className="voices-copy mx-auto max-w-3xl text-center">
          <h2 id="voices-h" className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {v.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">{v.lead}</p>
        </Reveal>

        {/* Helle Karte */}
        <Reveal delay={120} className="mt-12 rounded-[1.75rem] bg-white p-5 text-[#1a1c1e] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:p-8 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8 lg:p-10">
          {/* Links: Feedback-Aufruf */}
          <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
            <p className="text-2xl font-bold uppercase tracking-[0.08em] sm:text-3xl">{v.feedbackKicker}</p>
            <div className="mt-3">
              <Stars run={seen} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#4a4e52]">{v.feedbackText}</p>
            {mailto ? (
              <a href={mailto} className="btn btn-primary mt-5">
                <Mail className="h-4 w-4" aria-hidden />
                {v.feedbackCta}
              </a>
            ) : (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#f5f4f0] px-3 py-1.5 text-xs font-medium text-[#4a4e52]">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {v.feedbackPending}
              </p>
            )}
            <p className="mt-3 text-xs text-[#767b80]">{v.feedbackHint}</p>
          </div>

          {/* Rechts: Karussell */}
          <div className="relative mt-8 lg:mt-0">
            <ul ref={trackRef} className="voices-track -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2" aria-label={v.listLabel}>
              {v.cards.map((c, i) => {
                const open = expanded === i;
                const preset = t.presets[c.preset as PresetId];
                return (
                  <li key={c.role} className={cn("voices-card flex w-[17.5rem] shrink-0 snap-start flex-col rounded-2xl border border-[#e4e2dc] bg-white p-5 shadow-sm sm:w-[19rem]", seen && "is-on")} style={{ transitionDelay: `${250 + i * 90}ms` }}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }} aria-hidden>
                        {c.initial}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{c.role}</p>
                        <p className="truncate text-xs text-[#767b80]">{preset ? preset.label : c.context}</p>
                      </div>
                      <MessageSquareQuote className="h-5 w-5 shrink-0 text-[#b8862b]" aria-hidden />
                    </div>
                    <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#f7efdc] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[#8a6200]">
                      <Sparkles className="h-3 w-3" aria-hidden />
                      {v.exampleChip}
                    </span>
                    <p className={cn("mt-3 text-sm leading-relaxed text-[#1a1c1e]", !open && "line-clamp-4")}>{c.quote}</p>
                    <button type="button" className="mt-auto self-start pt-3 text-sm font-medium text-[#767b80] hover:text-[#0b5d5a]" onClick={() => setExpanded(open ? null : i)} aria-expanded={open}>
                      {open ? v.readLess : v.readMore}
                    </button>
                  </li>
                );
              })}
              {/* Letzte Karte: Einladung */}
              <li className={cn("voices-card flex w-[17.5rem] shrink-0 snap-start flex-col justify-center rounded-2xl border border-dashed border-[#cfcdc5] bg-[#f5f4f0] p-5 text-center sm:w-[19rem]", seen && "is-on")} style={{ transitionDelay: `${250 + v.cards.length * 90}ms` }}>
                <MessageSquareQuote className="mx-auto h-8 w-8 text-[#0b5d5a]" aria-hidden />
                <p className="mt-3 font-semibold">{v.inviteTitle}</p>
                <p className="mt-1 text-sm text-[#4a4e52]">{v.inviteText}</p>
                {mailto && (
                  <a href={mailto} className="btn btn-secondary mt-4 self-center">
                    {v.feedbackCta}
                  </a>
                )}
              </li>
            </ul>
            <button type="button" onClick={() => scrollBy(-1)} disabled={!canPrev} aria-label={v.prev} className="voices-nav absolute -left-3 top-1/2 hidden -translate-y-1/2 sm:flex lg:-left-5">
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={() => scrollBy(1)} disabled={!canNext} aria-label={v.next} className="voices-nav absolute -right-3 top-1/2 hidden -translate-y-1/2 sm:flex lg:-right-5">
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </Reveal>

        {/* Vier Argumente */}
        <ul className="voices-copy mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {v.usps.map((u, i) => (
            <Reveal key={u.title} as="li" delay={i * 80} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur">
                <Check className="h-6 w-6 text-white" aria-hidden />
              </span>
              <div>
                <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{u.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/75 sm:text-base">{u.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}
