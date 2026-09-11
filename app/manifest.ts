import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nutzwertanalyse.com – Entscheidungen strukturiert treffen",
    short_name: "Nutzwertanalyse",
    description:
      "Die professionelle Nutzwertanalyse für Unternehmen. Kriterien definieren, gewichten, bewerten und dokumentieren.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbfb",
    theme_color: "#00736a",
    lang: "de",
    orientation: "portrait-primary",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icon-512.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
