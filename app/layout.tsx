import "./globals.css";
import type { Metadata, Viewport } from "next";
import { I18nProvider } from "@/app/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL("https://nutzwertanalyse.com"),
  title: {
    default: "Nutzwertanalyse.com – Entscheidungen strukturiert treffen",
    template: "%s | Nutzwertanalyse.com",
  },
  description:
    "Die professionelle Nutzwertanalyse für Unternehmen. Kriterien definieren, gewichten, Alternativen systematisch bewerten und nachvollziehbar dokumentieren – inkl. AHP, Sensitivitätsanalyse und Export.",
  applicationName: "Nutzwertanalyse.com",
  keywords: [
    "Nutzwertanalyse",
    "Entscheidungsanalyse",
    "AHP",
    "Kriterienbewertung",
    "Alternativenvergleich",
    "Sensitivitätsanalyse",
    "Entscheidungsmatrix",
  ],
  authors: [{ name: "Nutzwertanalyse.com" }],
  alternates: { canonical: "/" },
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "/",
    siteName: "Nutzwertanalyse.com",
    title: "Nutzwertanalyse.com – Entscheidungen strukturiert treffen",
    description:
      "Kriterien definieren, gewichten, Alternativen systematisch bewerten und nachvollziehbar dokumentieren.",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Nutzwertanalyse.com" }],
  },
  twitter: {
    card: "summary",
    title: "Nutzwertanalyse.com – Entscheidungen strukturiert treffen",
    description:
      "Kriterien definieren, gewichten, Alternativen systematisch bewerten und nachvollziehbar dokumentieren.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nutzwertanalyse",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfb" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
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
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
