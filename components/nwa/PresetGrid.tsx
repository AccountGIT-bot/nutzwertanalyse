"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PlusCircle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PRESET_IDS } from "@/lib/nwa/parser";
import { PRESET_IMAGES } from "@/lib/nwa/presets";

export function PresetGrid({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={t.landing.presetsTitle}>
      {PRESET_IDS.map((id) => {
        const p = t.presets[id];
        const img = PRESET_IMAGES[id];
        return (
          <li key={id}>
            <Link
              href={`/app/analyse?new=1&preset=${id}`}
              className="group card relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md focus-visible:shadow-md"
            >
              {img && !compact ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
                  <Image src={img} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
              ) : null}
              <div className="flex flex-1 items-start justify-between gap-2 p-4">
                <div>
                  <div className="font-semibold">{p.label}</div>
                  <div className="mt-0.5 text-xs text-ink-3">{p.hint}</div>
                </div>
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-3 transition-colors group-hover:text-primary" aria-hidden />
              </div>
            </Link>
          </li>
        );
      })}
      <li>
        <Link href="/app/analyse?new=1" className="card flex h-full min-h-[96px] flex-col items-center justify-center gap-2 border-dashed p-4 text-center transition-colors hover:border-primary hover:text-primary">
          <PlusCircle className="h-6 w-6" aria-hidden />
          <span className="font-semibold">{t.presets.custom.label}</span>
          <span className="text-xs text-ink-3">{t.presets.custom.hint}</span>
        </Link>
      </li>
    </ul>
  );
}
