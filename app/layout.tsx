import "./globals.css";
import type { Metadata, Viewport } from "next";
import { I18nProvider } from "./lib/i18n";
export const metadata: Metadata = {
  title: {
    default: "DecisionStudio – Klar entscheiden",
    template: "%s | DecisionStudio",
  },
  description:
    "Alternativen vergleichen, Kriterien gewichten und Entscheidungen nachvollziehbar dokumentieren. Deine Nutzwertanalyse ohne Konto.",
  icons: { icon: "/icon.svg" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1918",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de-CH" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">
          Zum Inhalt
        </a>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
