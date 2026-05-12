import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main(): Promise<void> {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["dist/adapters/mcp/sdk-server.js"],
    cwd: process.cwd(),
    stderr: "pipe"
  });

  const client = new Client({
    name: "tokenflow-sdk-verifier",
    version: "0.1.0"
  });

  try {
    await client.connect(transport);
    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);

    if (toolNames.length !== 5) {
      throw new Error(`Expected 5 MCP tools, got ${toolNames.length}: ${toolNames.join(", ")}`);
    }

    if (!toolNames.includes("tokenflow-router")) {
      throw new Error(`tokenflow-router missing from MCP tool list: ${toolNames.join(", ")}`);
    }

    const result = await client.callTool({
      name: "tokenflow-router",
      arguments: {
        task: "verify real MCP SDK stdio integration",
        hostCapabilities: ["mcp"],
        availableAdapters: ["mcp", "command"]
      }
    });

    const structuredContent = result.structuredContent;
    if (!isRecord(structuredContent) || structuredContent.status !== "ok") {
      throw new Error(`Unexpected structuredContent: ${JSON.stringify(structuredContent)}`);
    }

    if (structuredContent.moduleId !== "router") {
      throw new Error(`Expected router module result, got ${String(structuredContent.moduleId)}`);
    }

    console.log("MCP SDK stdio verification passed");
    console.log(`Tools: ${toolNames.join(", ")}`);
  } finally {
    await client.close();
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
