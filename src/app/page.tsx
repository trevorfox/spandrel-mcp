const BUNDLE_URL = process.env.SPANDREL_BUNDLE_URL ?? "https://spandrel.org";

export default function Home() {
  return (
    <main>
      <h1>Spandrel MCP</h1>
      <p>
        This host exposes <a href="https://spandrel.org">Spandrel</a>&apos;s read-only
        tools (<code>context</code>, <code>search</code>, <code>navigate</code>,{" "}
        <code>get_node</code>, <code>get_references</code>, <code>get_content</code>,{" "}
        <code>get_graph</code>, <code>validate</code>, <code>get_history</code>)
        over HTTP using{" "}
        <a href="https://modelcontextprotocol.io">Model Context Protocol</a>.
      </p>
      <h2>Endpoint</h2>
      <pre style={{ background: "#f4f4f4", padding: "0.75rem 1rem", borderRadius: 6 }}>
        <code>POST /api/mcp</code>
      </pre>
      <p>
        Streamable HTTP transport, stateless, no auth. Reads the bundle at{" "}
        <a href={BUNDLE_URL}>{BUNDLE_URL}</a>.
      </p>
      <h2>Wire it up</h2>
      <pre style={{ background: "#f4f4f4", padding: "0.75rem 1rem", borderRadius: 6, overflow: "auto" }}>
        <code>{`claude mcp add spandrel \\
  https://mcp.spandrel.org/api/mcp \\
  --transport http --scope user`}</code>
      </pre>
      <h2>Fork for your own Spandrel graph</h2>
      <p>
        This is a reference implementation. Clone{" "}
        <a href="https://github.com/trevorfox/spandrel-mcp">trevorfox/spandrel-mcp</a>,
        set the <code>SPANDREL_BUNDLE_URL</code> env var to the root of your
        published bundle, deploy to Vercel. Point a subdomain at it.
      </p>
    </main>
  );
}
