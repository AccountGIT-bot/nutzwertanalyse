import type { MetadataRoute } from "next";
import { siteConfig } from "@/app/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(siteConfig.legalVersion.lastUpdated);

  return [
    { url: siteConfig.url, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/app`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/rechtliches`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteConfig.url}/impressum`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/datenschutz`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/cookies`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/agb`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
