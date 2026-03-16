"use client";

import type { ReactNode } from "react";

export type PresetId = 
  | "supplier" 
  | "software" 
  | "investment" 
  | "machines" 
  | "vehicle" 
  | "employee"
  | "realEstate"
  | "product"
  | "custom";

interface PresetIconProps {
  className?: string;
  size?: number;
}

// Consistent icon family: 24x24 viewBox, stroke-based, 1.5px stroke width
// All icons follow the same visual language for coherence

export function SupplierIcon({ className = "", size = 24 }: PresetIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={1.5}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Handshake icon - represents partnership/supplier relationship */}
      <path d="M12 8c-2.5-2-5.5-2-8 0l4 4 1-1" />
      <path d="M20 8c-2.5-2-5.5-2-8 0" />
      <path d="M8 12l3 3 1-1" />
      <path d="M12 15l4-4" />
      <path d="M16 11l-4 4" />
      <path d="M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8" />
    </svg>
  );
}

export function SoftwareIcon({ className = "", size = 24 }: PresetIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={1.5}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Monitor with code brackets - represents software */}
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M8 10l-2 1 2 1" />
      <path d="M16 10l2 1-2 1" />
      <path d="M10 8l4 6" />
    </svg>
  );
}

export function InvestmentIcon({ className = "", size = 24 }: PresetIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={1.5}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Chart with upward trend - represents investment/finance */}
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-6" />
      <path d="M17 8h3v3" />
    </svg>
  );
}

export function MachinesIcon({ className = "", size = 24 }: PresetIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={1.5}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Gear/cog - represents machinery/production */}
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4" />
      <path d="M12 19v4" />
      <path d="M4.22 4.22l2.83 2.83" />
      <path d="M16.95 16.95l2.83 2.83" />
      <path d="M1 12h4" />
      <path d="M19 12h4" />
      <path d="M4.22 19.78l2.83-2.83" />
      <path d="M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

export function VehicleIcon({ className = "", size = 24 }: PresetIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={1.5}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Car silhouette - represents vehicle */}
      <path d="M5 17a2 2 0 104 0 2 2 0 10-4 0" />
      <path d="M15 17a2 2 0 104 0 2 2 0 10-4 0" />
      <path d="M5 17H3v-4l2-5h9l4 5h3v4h-2" />
      <path d="M9 17h6" />
      <path d="M14 8l-3-3H7l-2 3" />
    </svg>
  );
}

export function EmployeeIcon({ className = "", size = 24 }: PresetIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={1.5}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* People/team - represents employee selection */}
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 21v-1.5a3 3 0 00-3-3h-1" />
    </svg>
  );
}

export function CustomIcon({ className = "", size = 24 }: PresetIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={1.5}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Grid/layout - represents custom analysis */}
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

// Map preset ID to icon component
export function getPresetIcon(presetId: PresetId | string | undefined): (props: PresetIconProps) => ReactNode {
  switch (presetId) {
    case "supplier":
      return SupplierIcon;
    case "software":
      return SoftwareIcon;
    case "investment":
      return InvestmentIcon;
    case "machines":
      return MachinesIcon;
    case "vehicle":
      return VehicleIcon;
    case "employee":
      return EmployeeIcon;
    default:
      return CustomIcon;
  }
}

// Get preset label by ID
export function getPresetLabel(presetId: PresetId | string | undefined): string {
  switch (presetId) {
    case "supplier":
      return "Lieferantenauswahl";
    case "software":
      return "Softwarevergleich";
    case "investment":
      return "Investitionsentscheid";
    case "machines":
      return "Maschinenkauf";
    case "vehicle":
      return "Fahrzeuganschaffung";
    case "employee":
      return "Mitarbeiterwahl";
    default:
      return "Eigene Analyse";
  }
}

// Map AI domains to German context labels - used for dynamic context from AI interpretation
const DOMAIN_LABELS: Record<string, string> = {
  supplier: "Lieferantenauswahl",
  software: "Softwarevergleich",
  investment: "Investitionsentscheid",
  machines: "Maschinenkauf",
  vehicle: "Fahrzeuganschaffung",
  employee: "Mitarbeiterwahl",
  personal: "Persönliche Entscheidung",
  technology: "Technologieauswahl",
  service: "Dienstleisterauswahl",
  other: "Allgemeine Entscheidung",
};

// Get context label from AI domain - always dynamic based on AI interpretation
export function getDomainLabel(domain: string | undefined): string {
  if (!domain) return "Individuelle Analyse";
  return DOMAIN_LABELS[domain] || "Individuelle Analyse";
}

// Map AI domains to preset IDs for icon selection
const DOMAIN_TO_PRESET_ID: Record<string, PresetId> = {
  supplier: "supplier",
  software: "software",
  investment: "investment",
  machines: "machines",
  vehicle: "vehicle",
  employee: "employee",
  personal: "investment",
  technology: "software",
  service: "supplier",
  other: "custom",
};

// Get icon for AI domain
export function getDomainIcon(domain: string | undefined): (props: PresetIconProps) => ReactNode {
  const presetId = domain ? DOMAIN_TO_PRESET_ID[domain] : undefined;
  return getPresetIcon(presetId);
}

// Preset context indicator component - shows the selected preset with icon
export function PresetIndicator({ 
  presetId, 
  size = "sm",
  showLabel = true,
}: { 
  presetId: PresetId | string | undefined;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const IconComponent = getPresetIcon(presetId);
  const label = getPresetLabel(presetId);
  
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };
  
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };
  
  if (!presetId) return null;
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center`}
        style={{ 
          background: "rgb(var(--accent) / 0.15)",
          color: "rgb(var(--accent))",
        }}
      >
        <IconComponent size={iconSizes[size]} />
      </div>
      {showLabel && (
        <span className={`${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"} text-white/70`}>
          {label}
        </span>
      )}
    </div>
  );
}
