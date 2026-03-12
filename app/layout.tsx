import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Nutzwertanalyse.tool",
    template: "%s | Nutzwertanalyse.tool",
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
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
