import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/so-funktionierts", "/anwendungsfaelle", "/ueber-uns", "/methode", "/faq", "/impressum", "/datenschutz", "/agb", "/cookies", "/barrierefreiheit"];
  return pages.map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : ["/methode", "/so-funktionierts", "/anwendungsfaelle"].includes(p) ? 0.8 : 0.5,
  }));
}
