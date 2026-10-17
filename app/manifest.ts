import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nutzwertanalyse",
    short_name: "Nutzwertanalyse",
    description: "Entscheidungen strukturiert treffen – kostenlos, ohne Konto, alle Daten bleiben im Browser.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f6f7f7",
    theme_color: "#0f766e",
    lang: "de",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
