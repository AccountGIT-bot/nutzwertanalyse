"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PRESET_IDS } from "@/lib/nwa/parser";
import { PRESET_ILLUSTRATIONS } from "@/components/illustrations/Presets";

export function PresetGrid() {
  const t = useT();
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={t.landing.presetsTitle}>
      {[...PRESET_IDS, "custom" as const].map((id) => {
        const p = t.presets[id];
        const Ill = PRESET_ILLUSTRATIONS[id];
        return (
          <li key={id}>
            <Link href={`/app/analyse?new=1&preset=${id}`} className="group card flex h-full flex-col p-4 transition-colors hover:border-primary focus-visible:border-primary">
              <Ill className="h-auto w-full" />
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold group-hover:text-primary">{p.label}</div>
                  <div className="mt-0.5 text-xs text-ink-3">{p.hint}</div>
                </div>
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-3 transition-colors group-hover:text-primary" aria-hidden />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
