/**
 * Eigene, reduzierte Vektor-Illustrationen für die Anwendungsfälle.
 * Zwei Farben (Primär und Akzent) plus Flächen aus den Design-Tokens,
 * damit sie sich in hellem und dunklem Design gleich verhalten.
 */
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const base = { viewBox: "0 0 240 160", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true } as const;
const P = "var(--primary)";
const A = "var(--accent)";
const S = "var(--surface-3)";
const L = "var(--line-strong)";

export function IllSupplier(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="20" y="118" width="200" height="4" rx="2" fill={L} />
      <rect x="30" y="60" width="90" height="58" rx="4" fill={S} />
      <rect x="120" y="76" width="54" height="42" rx="4" fill={P} />
      <circle cx="56" cy="124" r="10" fill={P} />
      <circle cx="150" cy="124" r="10" fill={P} />
      <circle cx="56" cy="124" r="4" fill="var(--surface)" />
      <circle cx="150" cy="124" r="4" fill="var(--surface)" />
      <rect x="44" y="72" width="26" height="26" rx="3" fill={A} />
      <rect x="76" y="72" width="26" height="26" rx="3" fill={L} />
      <rect x="44" y="30" width="26" height="26" rx="3" fill={L} />
      <path d="M190 90h22M196 84l6 6-6 6" stroke={A} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IllSoftware(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="28" y="28" width="184" height="112" rx="8" fill={S} />
      <rect x="28" y="28" width="184" height="18" rx="8" fill={L} />
      <circle cx="40" cy="37" r="3" fill={P} />
      <circle cx="50" cy="37" r="3" fill={A} />
      <rect x="44" y="60" width="52" height="64" rx="4" fill="var(--surface)" />
      <rect x="104" y="60" width="52" height="64" rx="4" fill={P} />
      <rect x="164" y="60" width="32" height="64" rx="4" fill="var(--surface)" />
      <rect x="52" y="70" width="36" height="6" rx="3" fill={L} />
      <rect x="52" y="82" width="26" height="6" rx="3" fill={L} />
      <rect x="112" y="70" width="36" height="6" rx="3" fill="var(--primary-ink)" opacity=".8" />
      <rect x="112" y="82" width="22" height="6" rx="3" fill="var(--primary-ink)" opacity=".6" />
      <rect x="112" y="106" width="26" height="8" rx="4" fill={A} />
    </svg>
  );
}

export function IllInvestment(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="30" y="126" width="180" height="4" rx="2" fill={L} />
      <rect x="44" y="92" width="24" height="34" rx="3" fill={S} />
      <rect x="80" y="76" width="24" height="50" rx="3" fill={S} />
      <rect x="116" y="58" width="24" height="68" rx="3" fill={P} />
      <rect x="152" y="40" width="24" height="86" rx="3" fill={P} />
      <path d="M48 70 L92 54 L128 36 L170 22" stroke={A} strokeWidth="3" strokeLinecap="round" />
      <circle cx="170" cy="22" r="6" fill={A} />
      <circle cx="48" cy="70" r="4" fill={A} />
    </svg>
  );
}

export function IllMachines(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="24" y="118" width="192" height="4" rx="2" fill={L} />
      <rect x="40" y="70" width="110" height="48" rx="6" fill={S} />
      <rect x="54" y="84" width="20" height="20" rx="3" fill={P} />
      <rect x="82" y="84" width="20" height="20" rx="3" fill={L} />
      <rect x="110" y="84" width="20" height="20" rx="3" fill={L} />
      <circle cx="176" cy="60" r="26" fill={P} />
      <circle cx="176" cy="60" r="10" fill="var(--surface)" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 8;
        return <rect key={i} x={176 + Math.cos(a) * 30 - 4} y={60 + Math.sin(a) * 30 - 4} width="8" height="8" rx="2" fill={P} />;
      })}
      <path d="M62 50v20M62 50h50" stroke={A} strokeWidth="3" strokeLinecap="round" />
      <circle cx="112" cy="50" r="5" fill={A} />
    </svg>
  );
}

export function IllVehicle(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="20" y="116" width="200" height="4" rx="2" fill={L} />
      <path d="M44 112V88c0-6 4-10 10-10h22l18-24h58l20 24h14c8 0 14 6 14 14v20z" fill={P} />
      <path d="M84 78l14-18h40l16 18z" fill="var(--surface)" opacity=".9" />
      <circle cx="72" cy="114" r="12" fill={S} stroke={P} strokeWidth="4" />
      <circle cx="170" cy="114" r="12" fill={S} stroke={P} strokeWidth="4" />
      <rect x="186" y="94" width="12" height="6" rx="3" fill={A} />
      <path d="M30 40h30M24 52h22" stroke={L} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function IllEmployee(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="40" y="36" width="56" height="88" rx="8" fill={S} />
      <rect x="92" y="36" width="56" height="88" rx="8" fill={P} />
      <rect x="144" y="36" width="56" height="88" rx="8" fill={S} />
      <circle cx="68" cy="62" r="12" fill={L} />
      <circle cx="120" cy="62" r="12" fill="var(--surface)" />
      <circle cx="172" cy="62" r="12" fill={L} />
      <rect x="54" y="84" width="28" height="6" rx="3" fill={L} />
      <rect x="106" y="84" width="28" height="6" rx="3" fill="var(--surface)" opacity=".8" />
      <rect x="158" y="84" width="28" height="6" rx="3" fill={L} />
      <rect x="58" y="98" width="20" height="6" rx="3" fill={L} />
      <rect x="110" y="98" width="20" height="6" rx="3" fill="var(--surface)" opacity=".6" />
      <rect x="162" y="98" width="20" height="6" rx="3" fill={L} />
      <circle cx="140" cy="44" r="8" fill={A} />
      <path d="M136 44l3 3 5-6" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IllRealEstate(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="20" y="126" width="200" height="4" rx="2" fill={L} />
      <rect x="40" y="60" width="52" height="66" rx="3" fill={S} />
      <rect x="150" y="48" width="50" height="78" rx="3" fill={S} />
      <path d="M96 126V74l28-24 28 24v52z" fill={P} />
      <rect x="116" y="98" width="16" height="28" rx="2" fill="var(--surface)" />
      <rect x="50" y="72" width="10" height="10" fill={L} />
      <rect x="70" y="72" width="10" height="10" fill={L} />
      <rect x="50" y="92" width="10" height="10" fill={L} />
      <rect x="70" y="92" width="10" height="10" fill={L} />
      <rect x="160" y="60" width="10" height="10" fill={L} />
      <rect x="180" y="60" width="10" height="10" fill={L} />
      <rect x="160" y="80" width="10" height="10" fill={L} />
      <rect x="180" y="80" width="10" height="10" fill={L} />
      <circle cx="124" cy="36" r="6" fill={A} />
    </svg>
  );
}

export function IllProduct(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="36" y="44" width="120" height="76" rx="6" fill={P} />
      <rect x="44" y="52" width="104" height="60" rx="3" fill="var(--surface)" />
      <rect x="28" y="120" width="136" height="8" rx="4" fill={S} />
      <rect x="166" y="60" width="44" height="72" rx="8" fill={S} />
      <rect x="172" y="68" width="32" height="52" rx="3" fill="var(--surface)" />
      <circle cx="188" cy="126" r="3" fill={L} />
      <rect x="56" y="64" width="40" height="6" rx="3" fill={L} />
      <rect x="56" y="76" width="60" height="6" rx="3" fill={L} />
      <rect x="56" y="92" width="24" height="8" rx="4" fill={A} />
    </svg>
  );
}

export function IllLocation(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M24 118c40-24 72 10 112-14s48-20 80-8" stroke={L} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" />
      <rect x="30" y="86" width="22" height="32" rx="2" fill={S} />
      <rect x="56" y="70" width="22" height="48" rx="2" fill={S} />
      <rect x="160" y="78" width="22" height="40" rx="2" fill={S} />
      <rect x="186" y="92" width="22" height="26" rx="2" fill={S} />
      <path d="M120 112s-30-28-30-50a30 30 0 0 1 60 0c0 22-30 50-30 50z" fill={P} />
      <circle cx="120" cy="62" r="11" fill="var(--surface)" />
      <circle cx="120" cy="62" r="5" fill={A} />
      <rect x="20" y="118" width="200" height="4" rx="2" fill={L} />
    </svg>
  );
}

export function IllPersonal(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="116" y="60" width="8" height="66" rx="2" fill={S} />
      <path d="M120 44h62l12 10-12 10h-62z" fill={P} />
      <path d="M120 72H58L46 82l12 10h62z" fill={A} />
      <rect x="130" y="50" width="36" height="5" rx="2.5" fill="var(--surface)" opacity=".9" />
      <rect x="70" y="78" width="36" height="5" rx="2.5" fill="var(--surface)" opacity=".9" />
      <rect x="20" y="126" width="200" height="4" rx="2" fill={L} />
      <circle cx="120" cy="30" r="8" fill={L} />
    </svg>
  );
}

export function IllCustom(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="36" y="36" width="168" height="88" rx="8" fill={S} />
      <rect x="52" y="56" width="40" height="6" rx="3" fill={L} />
      <rect x="52" y="74" width="60" height="6" rx="3" fill={L} />
      <rect x="52" y="92" width="48" height="6" rx="3" fill={L} />
      <circle cx="166" cy="80" r="18" fill={P} />
      <path d="M166 72v16M158 80h16" stroke="var(--surface)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export const PRESET_ILLUSTRATIONS: Record<string, (p: Props) => React.JSX.Element> = {
  supplier: IllSupplier,
  software: IllSoftware,
  investment: IllInvestment,
  machines: IllMachines,
  vehicle: IllVehicle,
  employee: IllEmployee,
  realEstate: IllRealEstate,
  product: IllProduct,
  location: IllLocation,
  personal: IllPersonal,
  custom: IllCustom,
};
