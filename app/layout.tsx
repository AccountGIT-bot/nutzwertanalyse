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
      <body className="themed-bg">{children}</body>
    </html>
  );
}
