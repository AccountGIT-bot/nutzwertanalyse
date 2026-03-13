import "./globals.css";
import type { Metadata, Viewport } from "next";
import { I18nProvider } from "@/app/lib/i18n";

export const metadata: Metadata = {
  title: {
    default: "Nutzwertanalyse.com",
    template: "%s | Nutzwertanalyse.com",
  },
  description: "Entscheidungen strukturiert treffen – mit Nutzwertanalyse. Kriterien definieren, gewichten, bewerten und dokumentieren.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbfbfb",
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
