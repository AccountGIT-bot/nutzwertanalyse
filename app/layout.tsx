import "./globals.css";
import type { Metadata, Viewport } from "next";
import { I18nProvider } from "@/app/lib/i18n";
import { CookieConsent } from "@/app/components/CookieConsent";
import { siteConfig } from "@/app/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Nutzwertanalyse – Entscheidungen strukturiert treffen",
    template: "%s | Nutzwertanalyse.com",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Nutzwertanalyse",
    "Entscheidungsmatrix",
    "Entscheidungsfindung",
    "Scoring-Modell",
    "AHP",
    "Sensitivitätsanalyse",
    "Kriterien gewichten",
    "Bewertungsmatrix",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_CH",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Nutzwertanalyse – Entscheidungen strukturiert treffen",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutzwertanalyse – Entscheidungen strukturiert treffen",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfb" },
    { media: "(prefers-color-scheme: dark)", color: "#07070b" },
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteConfig.url}/#app`,
      name: siteConfig.name,
      url: siteConfig.url,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: ["de", "en", "fr", "it", "es", "pt"],
      description: siteConfig.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: siteConfig.commerce.currency,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      inLanguage: "de-CH",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900"
        >
          Zum Inhalt springen
        </a>
        <I18nProvider>{children}</I18nProvider>
        <CookieConsent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
