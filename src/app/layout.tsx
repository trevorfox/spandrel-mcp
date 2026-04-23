import "./globals.css";

export const metadata = {
  title: "Spandrel MCP",
  description: "Hosted MCP server for the Spandrel knowledge graph at spandrel.org — a reference implementation over RemoteGraphStore.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-banner" aria-label="Site">
          <a href="https://spandrel.org">
            <span className="site-banner-name">Spandrel</span>
            <span className="site-banner-sep" aria-hidden="true">·</span>
            <span className="site-banner-tagline">MCP reference implementation</span>
          </a>
        </header>
        {children}
      </body>
    </html>
  );
}
