import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app/analyse", "/app/teilen"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
