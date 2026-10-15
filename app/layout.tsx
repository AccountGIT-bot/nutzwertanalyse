import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/layout/Providers";
import { themeInitScript } from "@/lib/theme/ThemeProvider";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Nutzwertanalyse – Entscheidungen strukturiert treffen",
    template: "%s · Nutzwertanalyse",
  },
  description:
    "Kostenloses Online-Tool für die Nutzwertanalyse: Alternativen definieren, Kriterien gewichten, bewerten, Sensitivität prüfen und als PDF exportieren. Ohne Konto, ohne Tracking – alle Daten bleiben im Browser.",
  keywords: ["Nutzwertanalyse", "Entscheidungsmatrix", "Scoring-Modell", "AHP", "Entscheidungshilfe", "Kriterien gewichten", "Sensitivitätsanalyse", "Utility analysis", "weighted scoring"],
  applicationName: "Nutzwertanalyse",
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_CH",
    url: site.url,
    siteName: "Nutzwertanalyse",
    title: "Nutzwertanalyse – Entscheidungen strukturiert treffen",
    description: "Alternativen definieren, Kriterien gewichten, bewerten, Sensitivität prüfen – kostenlos, ohne Konto, ohne Tracking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutzwertanalyse – Entscheidungen strukturiert treffen",
    description: "Kostenloses Entscheidungs-Tool. Alle Daten bleiben im Browser.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1211" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
