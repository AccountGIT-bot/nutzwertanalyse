import "./globals.css";

export const metadata = {
  title: "Nutzwertanalyse",
  description: "Entscheidungen strukturiert treffen – mit Nutzwertanalyse.",
};

function ThemeInitScript() {
  const code = `
    (function () {
      try {
        var theme = localStorage.getItem("nwa_theme") || "basic";
        document.documentElement.dataset.theme = theme;
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body className="themed-bg">{children}</body>
    </html>
  );
}
