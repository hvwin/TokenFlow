import { loadRuntimeBundle, type LoadedBundle } from "./loader";
import type { McpProjectedTool } from "./projection";
import { executeCoreModule, isCoreModuleId, type CoreModuleId } from "../../core/executor";

export interface ServerConfig {
  name: string;
  version: string;
  capabilities: {
    tools: boolean;
    prompts: boolean;
    resources: boolean;
  };
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

const DEFAULT_SERVER_CONFIG: ServerConfig = {
  name: "TokenFlow MCP Server",
  version: "1.0.0",
  capabilities: {
    tools: true,
    prompts: false,
    resources: false
  }
};

export class McpServer {
  private readonly bundle: LoadedBundle;
  private readonly config: ServerConfig;
  private readonly tools: Map<string, McpProjectedTool>;

  constructor(bundle: LoadedBundle, config?: Partial<ServerConfig>) {
    this.bundle = bundle;
    this.config = {
      ...DEFAULT_SERVER_CONFIG,
      ...config,
      capabilities: {
        ...DEFAULT_SERVER_CONFIG.capabilities,
        ...config?.capabilities
      }
    };
    this.tools = new Map();
    this.initializeTools();
  }

  getServerInfo(): ServerConfig {
    return this.config;
  }

  listTools(): McpToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.tool_id,
      description: tool.description_zh,
      inputSchema: {
        type: tool.input_schema.type,
        properties: tool.input_schema.properties,
        required: tool.input_schema.required
      }
    }));
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    this.validateToolArgs(tool, args);

    const coreModule = this.extractCoreModule(name);
    return executeCoreModule({
      moduleId: coreModule,
      input: args,
      context: {
        hostCapability: this.bundle.serverEntry.hostCapability,
        entryShape: this.bundle.serverEntry.entryShape,
        toolId: name
      }
    });
  }

  async start(): Promise<void> {
    console.log(`[McpServer] Starting ${this.config.name} v${this.config.version}`);
    console.log(`[McpServer] Loaded ${this.tools.size} tools from projection`);
    console.log(`[McpServer] Entry shape: ${this.bundle.serverEntry.entryShape}`);
    console.log(`[McpServer] Host capability: ${this.bundle.serverEntry.hostCapability}`);
    console.log(`[McpServer] Runtime mode: ${this.bundle.serverEntry.runtimeHints.mode}`);
  }

  async stop(): Promise<void> {
    console.log(`[McpServer] Stopping ${this.config.name}`);
  }

  private initializeTools(): void {
    for (const tool of this.bundle.projection.tools) {
      this.tools.set(tool.tool_id, tool);
    }
  }

  private validateToolArgs(tool: McpProjectedTool, args: Record<string, unknown>): void {
    for (const field of tool.input_schema.required) {
      if (!(field in args)) {
        throw new Error(`Missing required argument: ${field} for tool ${tool.tool_id}`);
      }
    }
  }

  private extractCoreModule(toolId: string): CoreModuleId {
    const match = /^tokenflow-(.+)$/.exec(toolId);
    if (!match) {
      throw new Error(`Invalid tool_id format: ${toolId}`);
    }

    return this.assertCoreModuleId(match[1]);
  }

  private assertCoreModuleId(moduleId: string): CoreModuleId {
    if (!isCoreModuleId(moduleId)) {
      throw new Error(`Unsupported core module: ${moduleId}`);
    }
    return moduleId;
  }
}

export function createServer(
  bundle: LoadedBundle = loadRuntimeBundle(),
  config?: Partial<ServerConfig>
): McpServer {
  return new McpServer(bundle, config);
}

export function loadServer(config?: Partial<ServerConfig>): McpServer {
  return createServer(loadRuntimeBundle(), config);
}

export async function startServer(
  bundle: LoadedBundle = loadRuntimeBundle(),
  config?: Partial<ServerConfig>
): Promise<McpServer> {
  const server = createServer(bundle, config);
  await server.start();
  return server;
}
