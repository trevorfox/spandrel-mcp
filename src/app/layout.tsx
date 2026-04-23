export const metadata = {
  title: "Spandrel MCP",
  description: "Hosted MCP server for a Spandrel-published bundle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "4rem auto", padding: "0 1rem", lineHeight: 1.5 }}>
        {children}
      </body>
    </html>
  );
}
