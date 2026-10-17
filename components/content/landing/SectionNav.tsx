"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Punkt-Navigation am rechten Rand (ab lg), folgt dem Scrollen und springt per Klick. */
export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  return (
    <nav
      aria-label="Abschnitte"
      className={cn("no-print fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-300 lg:block", visible ? "opacity-100" : "pointer-events-none opacity-0")}
    >
      <ul className="flex flex-col gap-3">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              className="group flex items-center justify-end gap-2"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <span className={cn("rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100")}>{s.label}</span>
              <span className={cn("block h-2.5 w-2.5 rounded-full border-2 transition-all", active === s.id ? "scale-125 border-primary bg-primary" : "border-line-strong bg-surface group-hover:border-primary")} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
