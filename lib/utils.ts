import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

let counter = 0;
export function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function round(v: number, digits = 1): number {
  const f = Math.pow(10, digits);
  return Math.round(v * f) / f;
}

export function formatNumber(v: number, locale: string, digits = 1): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(v);
}

export function formatPercent(v: number, locale: string, digits = 0): string {
  return `${formatNumber(v, locale, digits)} %`;
}

export function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function downloadBlob(filename: string, content: string | Blob, type = "text/plain;charset=utf-8"): void {
  if (typeof window === "undefined") return;
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "analyse";
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallthrough */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Ersetzt {{key}}-Platzhalter in Übersetzungs-Strings */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{{${k}}}`));
}

/** «A, B und C» in der jeweiligen Sprache */
export function listFormat(items: string[], tag: string): string {
  try {
    return new Intl.ListFormat(tag, { style: "long", type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
}
