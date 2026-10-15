"use client";

/**
 * Leichtgewichtige SVG-Diagramme ohne Abhängigkeiten.
 * Gestaltung nach den Dataviz-Regeln: dünne Marken, 4px gerundete Datenenden,
 * 2px Flächen-Abstand, Legende ab 2 Serien, Text in Text-Tokens (nie in Serienfarbe),
 * Hover-Tooltip je Marke, Tabellenansicht in der Ergebnisseite.
 */

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)", "var(--series-6)", "var(--series-7)", "var(--series-8)"];

export function seriesColor(i: number): string {
  return SERIES[i % SERIES.length];
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
  const width = 600;
  const rowH = 34;
  const labelW = 170;
  const h = height ?? data.length * rowH + 8;
  const { tip, show, hide } = useTip();
  const id = useId();
  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${h}`} role="img" aria-labelledby={id} className="w-full overflow-visible text-ink">
        <title id={id}>{ariaLabel}</title>
        {[0, 25, 50, 75, 100].map((g) => {
          const x = labelW + ((width - labelW - 56) * g) / 100;
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
          const y = i * rowH + 6;
          const w = Math.max(0, ((width - labelW - 56) * d.value) / max);
          const barH = 20;
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
              <rect x={labelW} y={y - 4} width={width - labelW - 56} height={barH + 8} fill="transparent" />
              <text x={labelW - 10} y={y + barH / 2 + 4} fontSize={12} fill="currentColor" textAnchor="end" className={cn(d.muted && "opacity-50")}>
                {d.label.length > 24 ? d.label.slice(0, 23) + "…" : d.label}
              </text>
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
  const width = 600;
  const rowH = 36;
  const labelW = 170;
  const plotW = width - labelW - 60;
  const h = rows.length * rowH + 8;
  const { tip, show, hide } = useTip();
  const id = useId();
  const colorOf = (key: string) => seriesColor(Math.max(0, series.findIndex((s) => s.key === key)));
  const visible = series.slice(0, 8);
  const folded = series.length > 8;

  return (
    <div className="w-full">
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${h}`} role="img" aria-labelledby={id} className="w-full overflow-visible text-ink">
          <title id={id}>{ariaLabel}</title>
          {rows.map((r, i) => {
            const y = i * rowH + 6;
            let x = labelW;
            const total = r.segments.reduce((s, seg) => s + seg.value, 0);
            return (
              <g key={i} className={cn(r.muted && "opacity-50")}>
                <text x={labelW - 10} y={y + 16} fontSize={12} fill="currentColor" textAnchor="end">
                  {r.label.length > 24 ? r.label.slice(0, 23) + "…" : r.label}
                </text>
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
                      height={22}
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
                <text x={labelW + (plotW * total) / max + 8} y={y + 16} fontSize={12} fill="currentColor" className="tabular">
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
}: {
  axes: string[];
  series: { label: string; values: number[] }[];
  max: number;
  ariaLabel: string;
}) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 64;
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
    <div className="w-full">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-labelledby={id} className="mx-auto w-full max-w-md overflow-visible text-ink">
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
          const [lx, ly] = point(i, max * 1.18);
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--chart-grid)" strokeWidth={1} />
              <text x={lx} y={ly} fontSize={11} fill="currentColor" textAnchor="middle" dominantBaseline="middle">
                {a.length > 18 ? a.slice(0, 17) + "…" : a}
              </text>
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
                <circle key={i} cx={p[0]} cy={p[1]} r={4} fill={seriesColor(si)} stroke="var(--surface)" strokeWidth={2}>
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
  const width = 600;
  const rowH = 36;
  const labelW = 170;
  const plotW = width - labelW - 20;
  const h = rows.length * rowH + 16;
  const id = useId();
  const colorFor = (impact: string) => (impact === "high" ? "var(--bad)" : impact === "medium" ? "var(--warn)" : "var(--good)");
  return (
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
        const y = i * rowH + 8;
        const xc = labelW + plotW * r.current;
        const xf = r.flip === null ? null : labelW + plotW * r.flip;
        return (
          <g key={i}>
            <text x={labelW - 10} y={y + 14} fontSize={12} fill="currentColor" textAnchor="end">
              {r.label.length > 24 ? r.label.slice(0, 23) + "…" : r.label}
            </text>
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
  );
}
