import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const BUNDLE_URL = process.env.SPANDREL_BUNDLE_URL ?? "https://spandrel.org";

type ModuleBundle = {
  McpServer: typeof import("@modelcontextprotocol/sdk/server/mcp.js").McpServer;
  WebStandardStreamableHTTPServerTransport:
    typeof import("@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js").WebStandardStreamableHTTPServerTransport;
  RemoteGraphStore: typeof import("spandrel/storage/remote-graph-store.js").RemoteGraphStore;
  createSchema: typeof import("spandrel/schema/schema.js").createSchema;
  registerReadOnlyTools: typeof import("spandrel/server/mcp.js").registerReadOnlyTools;
  buildInstructions: typeof import("spandrel/server/mcp.js").buildInstructions;
};

let modulesPromise: Promise<ModuleBundle> | undefined;
async function getModules(): Promise<ModuleBundle> {
  if (!modulesPromise) {
    modulesPromise = (async () => {
      const [mcp, transport, store, schema, spmcp] = await Promise.all([
        import("@modelcontextprotocol/sdk/server/mcp.js"),
        import("@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"),
        import("spandrel/storage/remote-graph-store.js"),
        import("spandrel/schema/schema.js"),
        import("spandrel/server/mcp.js"),
      ]);
      return {
        McpServer: mcp.McpServer,
        WebStandardStreamableHTTPServerTransport: transport.WebStandardStreamableHTTPServerTransport,
        RemoteGraphStore: store.RemoteGraphStore,
        createSchema: schema.createSchema,
        registerReadOnlyTools: spmcp.registerReadOnlyTools,
        buildInstructions: spmcp.buildInstructions,
      };
    })();
  }
  return modulesPromise;
}

let storePromise: Promise<import("spandrel/storage/remote-graph-store.js").RemoteGraphStore> | undefined;
async function getStore() {
  if (!storePromise) {
    storePromise = (async () => {
      const { RemoteGraphStore } = await getModules();
      return new RemoteGraphStore({ bundleUrl: BUNDLE_URL });
    })();
  }
  return storePromise;
}

let instructionsPromise: Promise<string> | undefined;
async function getInstructions(): Promise<string> {
  if (!instructionsPromise) {
    instructionsPromise = (async () => {
      const { buildInstructions } = await getModules();
      const store = await getStore();
      await store.getAllNodes();
      return buildInstructions(store);
    })();
  }
  return instructionsPromise;
}

async function handle(req: NextRequest): Promise<Response> {
  try {
    const {
      McpServer,
      WebStandardStreamableHTTPServerTransport,
      createSchema,
      registerReadOnlyTools,
    } = await getModules();

    const store = await getStore();
    const schema = createSchema(store, {
      actor: { identity: null },
      accessConfig: null,
    });

    const server = new McpServer(
      { name: "spandrel", version: "0.3.0" },
      { instructions: await getInstructions() },
    );
    registerReadOnlyTools(server, schema);

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    return transport.handleRequest(req);
  } catch (err) {
    const msg = err instanceof Error ? err.stack ?? err.message : String(err);
    console.error("[/mcp] handler error:", msg);
    return new Response(JSON.stringify({ error: "Internal error", detail: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
