"use client";

/**
 * Leichtgewichtige SVG-Diagramme ohne Abhängigkeiten.
 * Gestaltung nach den Dataviz-Regeln: dünne Marken, 4px gerundete Datenenden,
 * 2px Flächen-Abstand, Legende ab 2 Serien, Text in Text-Tokens (nie in Serienfarbe),
 * Hover-Tooltip je Marke, Tabellenansicht in der Ergebnisseite.
 */

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)", "var(--series-6)", "var(--series-7)", "var(--series-8)"];

export function seriesColor(i: number): string {
  return SERIES[i % SERIES.length];
}

/** Bricht lange Beschriftungen wortweise auf höchstens `maxLines` Zeilen um; Überlänge wird mit «…» gekürzt. */
export function wrapLabel(label: string, maxChars: number, maxLines = 2): string[] {
  /* Überlange Einzelwörter (z. B. «Alltagstauglichkeit») werden mit Trennstrich geteilt statt abgeschnitten */
  const words = label
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((w) => {
      if (w.length <= maxChars) return [w];
      const parts: string[] = [];
      for (let i = 0; i < w.length; i += maxChars - 1) {
        const piece = w.slice(i, i + maxChars - 1);
        parts.push(i + maxChars - 1 < w.length ? `${piece}-` : piece);
      }
      return parts;
    });
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars || !current) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  const clip = (l: string) => (l.length > maxChars ? `${l.slice(0, maxChars - 1).trimEnd()}…` : l);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines).map(clip);
    const last = kept[maxLines - 1];
    kept[maxLines - 1] = last.endsWith("…") ? last : `${last.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
    return kept;
  }
  return lines.map(clip);
}

/** Mehrzeilige SVG-Beschriftung, vertikal um `y` zentriert. */
function SvgLabel({ x, y, lines, fontSize, anchor = "end", className }: { x: number; y: number; lines: string[]; fontSize: number; anchor?: "start" | "middle" | "end"; className?: string }) {
  const lineH = fontSize * 1.2;
  const y0 = y - ((lines.length - 1) * lineH) / 2;
  return (
    <text x={x} y={y0} fontSize={fontSize} fill="currentColor" textAnchor={anchor} dominantBaseline="middle" className={className}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineH}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

/* ---------------- Breitenmessung: unter 440 px wechseln die Diagramme in den kompakten Modus ---------------- */

const COMPACT_BELOW = 440;

/** Misst die Breite des Containers; 0, solange noch nicht gemessen (Server, erster Frame). */
function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/** Kompakt: Beschriftung über dem Balken, Zeichenfläche in CSS-Pixeln statt skaliert. */
const FullChartsContext = createContext(false);

/** Erzwingt die volle (nicht kompakte) Darstellung, z. B. im Druckbericht auf schmalen Bildschirmen */
export function FullCharts({ children }: { children: ReactNode }) {
  return <FullChartsContext.Provider value={true}>{children}</FullChartsContext.Provider>;
}

/** Druckt der Browser gerade? (Druckbericht auf dem Handy soll die volle Darstellung zeigen) */
function usePrinting(): boolean {
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("print");
    const update = () => setPrinting(mq.matches);
    update();
    mq.addEventListener("change", update);
    window.addEventListener("beforeprint", update);
    const after = () => setPrinting(false);
    window.addEventListener("afterprint", after);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("beforeprint", update);
      window.removeEventListener("afterprint", after);
    };
  }, []);
  return printing;
}

function useCompact(): [React.RefObject<HTMLDivElement | null>, boolean, number] {
  const [ref, w] = useWidth<HTMLDivElement>();
  const printing = usePrinting();
  /* Im Druckbericht (FullCharts) und beim Drucken immer die volle Darstellung */
  const full = useContext(FullChartsContext);
  const compact = !printing && !full && w > 0 && w < COMPACT_BELOW;
  return [ref, compact, compact ? Math.max(240, Math.round(w)) : 600];
}

/* ---------------- Tooltip-Helfer ---------------- */

function useTip() {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  return { tip, show: (x: number, y: number, text: string) => setTip({ x, y, text }), hide: () => setTip(null) };
}

function Tip({ tip, width }: { tip: { x: number; y: number; text: string } | null; width: number }) {
  if (!tip) return null;
  const left = Math.min(Math.max(tip.x, 60), width - 60);
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink shadow-md"
      style={{ left: `${(left / width) * 100}%`, top: tip.y - 6 }}
      role="status"
    >
      {tip.text}
    </div>
  );
}

/* ---------------- Horizontales Balkendiagramm (eine Serie) ---------------- */

export interface BarDatum {
  label: string;
  value: number;
  muted?: boolean;
  valueLabel?: string;
}

export function HBarChart({ data, max = 100, ariaLabel, height }: { data: BarDatum[]; max?: number; ariaLabel: string; height?: number }) {
  const [ref, compact, width] = useCompact();
  const rowH = compact ? 50 : 34;
  const labelW = compact ? 0 : 170;
  const valueW = 56;
  const plotW = width - labelW - valueW;
  const barH = compact ? 14 : 20;
  const h = height ?? data.length * rowH + 8;
  const { tip, show, hide } = useTip();
  const id = useId();
  return (
    <div ref={ref} className="relative w-full">
      <svg viewBox={`0 0 ${width} ${h}`} role="img" aria-labelledby={id} className="w-full overflow-visible text-ink">
        <title id={id}>{ariaLabel}</title>
        {[0, 25, 50, 75, 100].map((g) => {
          const x = labelW + (plotW * g) / 100;
          return (
            <g key={g}>
              <line x1={x} x2={x} y1={0} y2={h - 8} stroke="var(--chart-grid)" strokeWidth={1} />
              <text x={x} y={h} fontSize={10} fill="var(--chart-muted)" textAnchor="middle">
                {Math.round((g / 100) * max)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const y = i * rowH + (compact ? 26 : 6);
          const w = Math.max(0, (plotW * d.value) / max);
          const text = d.valueLabel ?? String(Math.round(d.value));
          return (
            <g
              key={i}
              onMouseMove={(e) => {
                const r = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                show(((e.clientX - r.left) / r.width) * width, ((e.clientY - r.top) / r.height) * h, `${d.label}: ${text}`);
              }}
              onMouseLeave={hide}
            >
              <rect x={labelW} y={y - 4} width={plotW} height={barH + 8} fill="transparent" />
              {compact ? (
                <text x={0} y={i * rowH + 12} fontSize={12} fill="currentColor" dominantBaseline="middle" className={cn(d.muted && "opacity-50")}>
                  {wrapLabel(d.label, Math.floor(width / 7), 1)[0]}
                </text>
              ) : (
                <SvgLabel x={labelW - 10} y={y + barH / 2} lines={wrapLabel(d.label, 26)} fontSize={11.5} className={cn(d.muted && "opacity-50")} />
              )}
              <path
                d={`M${labelW},${y} h${Math.max(0, w - 4)} a4,4 0 0 1 4,4 v${barH - 8} a4,4 0 0 1 -4,4 h${-Math.max(0, w - 4)} z`}
                fill={d.muted ? "var(--chart-axis)" : "var(--primary)"}
                opacity={d.muted ? 0.6 : 1}
              />
              <text x={labelW + w + 8} y={y + barH / 2 + 4} fontSize={12} fill="currentColor" className="tabular">
                {text}
              </text>
            </g>
          );
        })}
      </svg>
      <Tip tip={tip} width={width} />
    </div>
  );
}

/* ---------------- Gestapelte Balken (Beiträge je Kriterium) ---------------- */

export interface StackedRow {
  label: string;
  segments: { key: string; value: number }[];
  muted?: boolean;
}

export function StackedBarChart({
  rows,
  series,
  max,
  ariaLabel,
  formatValue = (v) => v.toFixed(2),
}: {
  rows: StackedRow[];
  series: { key: string; label: string }[];
  max: number;
  ariaLabel: string;
  formatValue?: (v: number) => string;
}) {
  const [ref, compact, width] = useCompact();
  const rowH = compact ? 52 : 36;
  const labelW = compact ? 0 : 170;
  const barH = compact ? 16 : 22;
  const plotW = width - labelW - 60;
  const h = rows.length * rowH + 8;
  const { tip, show, hide } = useTip();
  const id = useId();
  const colorOf = (key: string) => seriesColor(Math.max(0, series.findIndex((s) => s.key === key)));
  const visible = series.slice(0, 8);
  const folded = series.length > 8;

  return (
    <div ref={ref} className="w-full">
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${h}`} role="img" aria-labelledby={id} className="w-full overflow-visible text-ink">
          <title id={id}>{ariaLabel}</title>
          {rows.map((r, i) => {
            const y = i * rowH + (compact ? 28 : 6);
            let x = labelW;
            const total = r.segments.reduce((s, seg) => s + seg.value, 0);
            return (
              <g key={i} className={cn(r.muted && "opacity-50")}>
                {compact ? (
                  <text x={0} y={i * rowH + 12} fontSize={12} fill="currentColor" dominantBaseline="middle">
                    {wrapLabel(r.label, Math.floor(width / 7), 1)[0]}
                  </text>
                ) : (
                  <SvgLabel x={labelW - 10} y={y + barH / 2} lines={wrapLabel(r.label, 26)} fontSize={11.5} />
                )}
                {r.segments.map((seg, j) => {
                  const w = (plotW * seg.value) / max;
                  const sx = x;
                  x += w;
                  const idx = series.findIndex((s) => s.key === seg.key);
                  const color = idx >= 8 ? "var(--chart-axis)" : colorOf(seg.key);
                  const name = series[idx]?.label ?? seg.key;
                  return (
                    <rect
                      key={j}
                      x={sx + 1}
                      y={y}
                      width={Math.max(0, w - 2)}
                      height={barH}
                      fill={color}
                      rx={j === r.segments.length - 1 ? 4 : 0}
                      onMouseMove={(e) => {
                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                        show(((e.clientX - rect.left) / rect.width) * width, ((e.clientY - rect.top) / rect.height) * h, `${r.label} · ${name}: ${formatValue(seg.value)}`);
                      }}
                      onMouseLeave={hide}
                    />
                  );
                })}
                <text x={labelW + (plotW * total) / max + 8} y={y + barH / 2 + 4} fontSize={12} fill="currentColor" className="tabular">
                  {formatValue(total)}
                </text>
              </g>
            );
          })}
        </svg>
        <Tip tip={tip} width={width} />
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-2" aria-label="Legende">
        {visible.map((s, i) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: seriesColor(i) }} aria-hidden />
            {s.label}
          </li>
        ))}
        {folded && (
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-axis)" }} aria-hidden />…
          </li>
        )}
      </ul>
    </div>
  );
}

/* ---------------- Radar / Netzdiagramm ---------------- */

export function RadarChart({
  axes,
  series,
  max,
  ariaLabel,
  className,
}: {
  axes: string[];
  series: { label: string; values: number[] }[];
  max: number;
  ariaLabel: string;
  /** Breite des Diagramms (Standard max-w-md), z. B. max-w-lg im Druckbericht */
  className?: string;
}) {
  /* Breiter als hoch, damit seitliche Beschriftungen Platz haben; auf schmalen Containern grössere Schrift und kleinerer Radius */
  const [wrapRef, compact] = useCompact();
  const width = 520;
  const size = 420;
  const cx = width / 2;
  const cy = size / 2;
  const f = compact ? 1.5 : 1;
  const r = size / 2 - (compact ? 92 : 64);
  const n = axes.length;
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  if (n < 3) return null;
  const point = (i: number, v: number) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rr = (r * Math.min(max, Math.max(0, v))) / max;
    return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)] as const;
  };
  const shown = series.slice(0, 6);
  return (
    <div ref={wrapRef} className="w-full">
      <svg viewBox={`0 0 ${width} ${size}`} role="img" aria-labelledby={id} className={cn("mx-auto w-full overflow-visible text-ink", className ?? "max-w-md")}>
        <title id={id}>{ariaLabel}</title>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={axes.map((_, i) => point(i, max * f).join(",")).join(" ")}
            fill="none"
            stroke="var(--chart-grid)"
            strokeWidth={1}
          />
        ))}
        {axes.map((a, i) => {
          const [x, y] = point(i, max);
          const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
          const cos = Math.cos(ang);
          const sin = Math.sin(ang);
          /* Seitliche Beschriftungen beginnen bzw. enden neben der Achse, obere und untere stehen zentriert darüber/darunter */
          const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
          const lines = wrapLabel(a, compact ? 15 : 20, compact ? 3 : 2);
          const gap = anchor === "middle" ? (12 + lines.length * 6) * f : 10;
          const lx = cx + (r + gap) * cos;
          const ly = cy + (r + gap) * sin;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--chart-grid)" strokeWidth={1} />
              <SvgLabel x={lx} y={ly} lines={lines} fontSize={11 * f} anchor={anchor} />
            </g>
          );
        })}
        {shown.map((s, si) => {
          const pts = s.values.map((v, i) => point(i, v));
          const dim = active !== null && active !== si;
          return (
            <g key={si} opacity={dim ? 0.25 : 1} onMouseEnter={() => setActive(si)} onMouseLeave={() => setActive(null)}>
              <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={seriesColor(si)} fillOpacity={0.1} stroke={seriesColor(si)} strokeWidth={2} strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={4 * f} fill={seriesColor(si)} stroke="var(--surface)" strokeWidth={2}>
                  <title>
                    {s.label} · {axes[i]}: {s.values[i].toFixed(1)}
                  </title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-ink-2" aria-label="Legende">
        {shown.map((s, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded" style={{ background: seriesColor(i) }} aria-hidden />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Sensitivitäts-Balken (Abstand zum Kipppunkt) ---------------- */

export function SensitivityBars({
  rows,
  ariaLabel,
  robustLabel,
}: {
  rows: { label: string; current: number; flip: number | null; impact: "high" | "medium" | "low" | "none" }[];
  ariaLabel: string;
  robustLabel: string;
}) {
  const [ref, compact, width] = useCompact();
  const rowH = compact ? 50 : 36;
  const labelW = compact ? 0 : 170;
  const plotW = width - labelW - 20;
  const h = rows.length * rowH + 16;
  const id = useId();
  const colorFor = (impact: string) => (impact === "high" ? "var(--bad)" : impact === "medium" ? "var(--warn)" : "var(--good)");
  return (
    <div ref={ref} className="w-full">
    <svg viewBox={`0 0 ${width} ${h}`} role="img" aria-labelledby={id} className="w-full overflow-visible text-ink">
      <title id={id}>{ariaLabel}</title>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={labelW + plotW * g} x2={labelW + plotW * g} y1={0} y2={h - 14} stroke="var(--chart-grid)" />
          <text x={labelW + plotW * g} y={h - 2} fontSize={10} fill="var(--chart-muted)" textAnchor="middle">
            {Math.round(g * 100)} %
          </text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = i * rowH + (compact ? 26 : 8);
        const xc = labelW + plotW * r.current;
        const xf = r.flip === null ? null : labelW + plotW * r.flip;
        return (
          <g key={i}>
            {compact ? (
              <text x={0} y={i * rowH + 12} fontSize={12} fill="currentColor" dominantBaseline="middle">
                {wrapLabel(r.label, Math.floor(width / 7), 1)[0]}
              </text>
            ) : (
              <SvgLabel x={labelW - 10} y={y + 10} lines={wrapLabel(r.label, 26)} fontSize={11.5} />
            )}
            <line x1={labelW} x2={labelW + plotW} y1={y + 10} y2={y + 10} stroke="var(--chart-axis)" strokeWidth={2} strokeLinecap="round" />
            {xf !== null && (
              <line x1={Math.min(xc, xf)} x2={Math.max(xc, xf)} y1={y + 10} y2={y + 10} stroke={colorFor(r.impact)} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
            )}
            <circle cx={xc} cy={y + 10} r={6} fill="var(--primary)" stroke="var(--surface)" strokeWidth={2}>
              <title>
                {r.label}: {Math.round(r.current * 100)} %
              </title>
            </circle>
            {xf !== null ? (
              <g>
                <line x1={xf} x2={xf} y1={y} y2={y + 20} stroke={colorFor(r.impact)} strokeWidth={2} />
                <title>
                  {r.label}: {Math.round(r.flip! * 100)} %
                </title>
              </g>
            ) : (
              <g>
                <circle cx={labelW + plotW} cy={y + 10} r={4} fill="var(--surface)" stroke="var(--good)" strokeWidth={2} />
                <title>{robustLabel}</title>
              </g>
            )}
          </g>
        );
      })}
    </svg>
    </div>
  );
}
