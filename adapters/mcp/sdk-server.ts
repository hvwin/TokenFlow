import { McpServer as SdkMcpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadRuntimeBundle, type LoadedBundle } from "./loader";
import type { McpProjectedTool } from "./projection";
import { createServer, type ServerConfig } from "./server";

export interface TokenFlowMcpSdkServerOptions {
  bundle?: LoadedBundle;
  config?: Partial<ServerConfig>;
}

export function createTokenFlowMcpSdkServer(
  options: TokenFlowMcpSdkServerOptions = {}
): SdkMcpServer {
  const bundle = options.bundle ?? loadRuntimeBundle();
  const coreServer = createServer(bundle, options.config);
  const serverInfo = coreServer.getServerInfo();
  const sdkServer = new SdkMcpServer({
    name: serverInfo.name,
    version: serverInfo.version
  });

  for (const tool of bundle.projection.tools) {
    sdkServer.registerTool(
      tool.tool_id,
      {
        title: tool.title_zh,
        description: tool.description_zh,
        inputSchema: createZodRawShape(tool),
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      },
      async (args) => {
        const result = await coreServer.callTool(tool.tool_id, args as Record<string, unknown>);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ],
          structuredContent: result as Record<string, unknown>
        };
      }
    );
  }

  return sdkServer;
}

export async function startTokenFlowMcpStdioServer(
  options: TokenFlowMcpSdkServerOptions = {}
): Promise<void> {
  const sdkServer = createTokenFlowMcpSdkServer(options);
  const transport = new StdioServerTransport();
  await sdkServer.connect(transport);
}

function createZodRawShape(tool: McpProjectedTool): Record<string, z.ZodTypeAny> {
  const properties = tool.input_schema.properties;
  const required = new Set(tool.input_schema.required);
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [name, property] of Object.entries(properties)) {
    const schema = zodFromJsonSchemaProperty(property);
    shape[name] = required.has(name) ? schema : schema.optional();
  }

  return shape;
}

function zodFromJsonSchemaProperty(property: unknown): z.ZodTypeAny {
  if (!isRecord(property)) {
    return z.unknown();
  }

  const description = typeof property.description === "string" ? property.description : undefined;
  const typedSchema = (() => {
    switch (property.type) {
      case "string":
        return z.string();
      case "number":
        return z.number();
      case "integer":
        return z.number().int();
      case "boolean":
        return z.boolean();
      case "array":
        return z.array(zodFromJsonSchemaProperty(property.items));
      case "object":
        return z.record(z.string(), z.unknown());
      default:
        return z.unknown();
    }
  })();

  return description ? typedSchema.describe(description) : typedSchema;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

if (require.main === module) {
  startTokenFlowMcpStdioServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
