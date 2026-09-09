import type { NextConfig } from "next";
import site from "./site-config.json";
// Actual unresolved operator and hosting facts must be supplied before a live release.
if (process.env.VERCEL_ENV === "production") {
  const required = [
    "operatorName",
    "postalAddress",
    "contactEmail",
    "hostingCountries",
    "hostingLogRetention",
    "internationalTransferSafeguards",
  ] as const;
  const missing = required.filter((key) => !site[key].trim());
  if (missing.length || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail))
    throw new Error(
      "Production blocked: complete the confirmed operator and hosting disclosures in site-config.json: " +
        missing.join(", "),
    );
}
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" +
    (process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'self' about: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: [], formats: ["image/avif", "image/webp"] },
  experimental: { optimizePackageImports: ["lucide-react"] },
  typescript: { ignoreBuildErrors: false },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default nextConfig;
