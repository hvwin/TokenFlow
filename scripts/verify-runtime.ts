import { createGateway } from "../adapters/mcp/gateway";
import { createServer } from "../adapters/mcp/server";
import { loadRuntimeBundle } from "../adapters/mcp/loader";

async function main(): Promise<void> {
  const bundle = loadRuntimeBundle();
  const server = createServer(bundle);
  const gateway = createGateway(bundle);

  const tools = server.listTools();
  if (tools.length !== bundle.projection.toolCount) {
    throw new Error(`Tool count mismatch: listed=${tools.length} projected=${bundle.projection.toolCount}`);
  }

  const routerResult = await server.callTool("tokenflow-router", {
    task: "route production readiness work",
    hostCapabilities: ["mcp", "skill"],
    availableAdapters: ["mcp", "skill", "command"]
  });

  assertCoreResult(routerResult, "router");

  const tokenEffResponse = await gateway.handleRequest({
    tool_id: "tokenflow-tokeneff",
    parameters: {
      prompt: "TokenFlow should reduce token usage without binding to one host.",
      contextWindow: 8000,
      toolSurface: ["mcp", "skill"],
      history: ["generated", "validated"]
    }
  });

  assertCoreResult(tokenEffResponse.result, "tokeneff");

  console.log("Runtime verification passed");
  console.log(`Tools: ${tools.length}`);
  console.log(`Gateway execution mode: ${tokenEffResponse.metadata.executionMode}`);
}

function assertCoreResult(value: unknown, expectedModule: string): void {
  if (!isRecord(value)) {
    throw new Error("Core result is not an object");
  }

  if (value.status !== "ok") {
    throw new Error(`Expected status ok, got ${String(value.status)}`);
  }

  if (value.moduleId !== expectedModule) {
    throw new Error(`Expected module ${expectedModule}, got ${String(value.moduleId)}`);
  }

  if (!isRecord(value.output)) {
    throw new Error("Core result missing output object");
  }

  if (!isRecord(value.diagnostics) || value.diagnostics.executionMode !== "core-seam") {
    throw new Error("Core result missing core-seam diagnostics");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
