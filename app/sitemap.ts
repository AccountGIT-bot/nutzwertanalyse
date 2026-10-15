import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/app", "/methode", "/faq", "/einstellungen", "/impressum", "/datenschutz", "/agb", "/cookies", "/barrierefreiheit"];
  return pages.map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/app" || p === "/methode" ? 0.8 : 0.4,
  }));
}
