import "./globals.css";

export const metadata = {
  title: "Nutzwertanalyse",
  description: "Entscheidungen strukturiert treffen – mit Nutzwertanalyse.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}