# spandrel-mcp

Reference implementation: a hosted **Model Context Protocol** server that
wraps any [Spandrel](https://spandrel.org)-published bundle.

Production instance at **`mcp.spandrel.org`** serves the Spandrel docs
graph from `https://spandrel.org`.

## How it works

`RemoteGraphStore` — shipped with Spandrel — reads a published bundle
over HTTP (`graph.json` + per-node `index.json`) and implements the full
`GraphStore` interface. This project wraps it with the MCP server's
read-only tools (`context`, `search`, `navigate`, `get_node`,
`get_references`, `get_content`, `get_graph`, `validate`, `get_history`)
behind a single Next.js route at `/api/mcp`.

No bundle is stored here. The bundle lives wherever `spandrel publish`
wrote it; this host proxies reads.

## Fork for your own graph

1. Fork this repo.
2. Set the env var in Vercel:
   ```
   SPANDREL_BUNDLE_URL=https://your-bundle-root.example.com/
   ```
3. Deploy. Point a subdomain at it.

No other changes required. That's the point of the reference
implementation.

## Local dev

```bash
npm install
npm run dev
# → http://localhost:3000
# → http://localhost:3000/api/mcp
```

By default reads `https://spandrel.org`. Override via `SPANDREL_BUNDLE_URL`
in `.env.local`.
