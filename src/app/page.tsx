const BUNDLE_URL = process.env.SPANDREL_BUNDLE_URL ?? "https://spandrel.org";

export default function Home() {
  return (
    <main className="container">
      <h1>Spandrel MCP</h1>
      <p className="lede">
        A hosted <a href="https://modelcontextprotocol.io">Model Context Protocol</a> server
        for the <a href="https://spandrel.org">Spandrel</a> knowledge graph —
        read-only, public, no auth.
      </p>

      <h2>Endpoint <span className="badge">POST</span></h2>
      <pre><code>https://mcp.spandrel.org/mcp</code></pre>
      <p>
        Streamable HTTP transport. Reads the published bundle at{" "}
        <a href={BUNDLE_URL}>{BUNDLE_URL}</a> via{" "}
        <code>RemoteGraphStore</code>; no local data.
      </p>

      <h2>Tools</h2>
      <p>
        Nine read-only tools map one-to-one to Spandrel&apos;s GraphQL read
        surface:{" "}
        <code>context</code>, <code>search</code>, <code>navigate</code>,{" "}
        <code>get_node</code>, <code>get_references</code>,{" "}
        <code>get_content</code>, <code>get_graph</code>,{" "}
        <code>validate</code>, <code>get_history</code>.
      </p>

      <h2>Wire it up</h2>
      <pre><code>{`claude mcp add spandrel https://mcp.spandrel.org/mcp \\
  --transport http --scope user`}</code></pre>

      <hr />

      <h2>Fork for your own graph</h2>
      <p>
        This is a reference implementation. Clone{" "}
        <a href="https://github.com/trevorfox/spandrel-mcp">
          trevorfox/spandrel-mcp
        </a>
        , set <code>SPANDREL_BUNDLE_URL</code> to the root of your published
        bundle, and deploy to Vercel. Point a subdomain at it. That&apos;s the
        whole change.
      </p>
    </main>
  );
}
