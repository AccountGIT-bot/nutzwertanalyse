import { ImageResponse } from "next/og";

export const alt = "Nutzwertanalyse – Entscheidungen strukturiert treffen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0b1211 0%, #0f2f2b 60%, #1b4a44 100%)",
          color: "#e9efee",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36, fontWeight: 700 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="15" fill="#0b5d5a" stroke="#2f6f69" strokeWidth="1.5" />
            <rect x="12" y="34" width="8" height="18" rx="2.5" fill="#ffffff" opacity="0.72" />
            <rect x="23" y="24" width="11" height="28" rx="2.5" fill="#ffffff" />
            <rect x="37" y="12" width="15" height="40" rx="2.5" fill="#d9a441" />
          </svg>
          Nutzwertanalyse
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Entscheidungen. Strukturiert. Begründet.</div>
          <div style={{ fontSize: 32, color: "#b4c1bf", marginTop: 12 }}>Kostenlos · Ohne Konto · Daten bleiben im Browser</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#2cc4b4" }}>
          <span>Gewichten</span>
          <span style={{ color: "#849391" }}>·</span>
          <span>Bewerten</span>
          <span style={{ color: "#849391" }}>·</span>
          <span>Sensitivität</span>
          <span style={{ color: "#849391" }}>·</span>
          <span>PDF-Bericht</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
