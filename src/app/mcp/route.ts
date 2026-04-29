import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const BUNDLE_URL = process.env.SPANDREL_BUNDLE_URL ?? "https://spandrel.org";

type ModuleBundle = {
  McpServer: typeof import("@modelcontextprotocol/sdk/server/mcp.js").McpServer;
  WebStandardStreamableHTTPServerTransport:
    typeof import("@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js").WebStandardStreamableHTTPServerTransport;
  RemoteGraphStore: typeof import("spandrel/storage/remote-graph-store.js").RemoteGraphStore;
  AccessPolicy: typeof import("spandrel/access/policy.js").AccessPolicy;
  registerReadOnlyTools: typeof import("spandrel/server/mcp.js").registerReadOnlyTools;
  buildInstructions: typeof import("spandrel/server/mcp.js").buildInstructions;
};

let modulesPromise: Promise<ModuleBundle> | undefined;
async function getModules(): Promise<ModuleBundle> {
  if (!modulesPromise) {
    modulesPromise = (async () => {
      const [mcp, transport, storeMod, accessMod, spmcp] = await Promise.all([
        import("@modelcontextprotocol/sdk/server/mcp.js"),
        import("@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"),
        import("spandrel/storage/remote-graph-store.js"),
        import("spandrel/access/policy.js"),
        import("spandrel/server/mcp.js"),
      ]);
      return {
        McpServer: mcp.McpServer,
        WebStandardStreamableHTTPServerTransport: transport.WebStandardStreamableHTTPServerTransport,
        RemoteGraphStore: storeMod.RemoteGraphStore,
        AccessPolicy: accessMod.AccessPolicy,
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

// AccessPolicy is stateless after construction; build once. Open mode (null
// config) gives anonymous traverse-level reads, which matches the existing
// public read-only deployment posture. Per-user gating is out of scope for a
// hosted-bundle MCP — for that, run a writable backend with a real config.
let policyPromise: Promise<import("spandrel/access/policy.js").AccessPolicy> | undefined;
async function getPolicy() {
  if (!policyPromise) {
    policyPromise = (async () => {
      const { AccessPolicy } = await getModules();
      return new AccessPolicy(null);
    })();
  }
  return policyPromise;
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
      registerReadOnlyTools,
    } = await getModules();

    const store = await getStore();
    const policy = await getPolicy();

    // Construct the server manually (instead of via createMcpServer) so we can
    // pass the cached `instructions` string. createMcpServer rebuilds them on
    // every call, which would mean a bundle scan per request.
    const server = new McpServer(
      { name: "spandrel", version: "0.4.1" },
      { instructions: await getInstructions() },
    );
    registerReadOnlyTools(server, {
      store,
      policy,
      actor: { tier: "anonymous" },
    });

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
