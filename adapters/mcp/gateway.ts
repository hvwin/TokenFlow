import { loadRuntimeBundle, type LoadedBundle } from "./loader";
import type { McpProjectedTool } from "./projection";
import { executeCoreModule, isCoreModuleId, type CoreModuleId } from "../../core/executor";

export interface GatewayRequest {
  tool_id: string;
  parameters: Record<string, unknown>;
}

export interface GatewayResponse {
  tool_id: string;
  result: unknown;
  metadata: {
    executionMode: string;
    coreModule: string;
    timestamp: string;
  };
}

export interface GatewayContext {
  bundle: LoadedBundle;
  coreModuleResolver?: (moduleId: CoreModuleId) => unknown;
}

export class McpGateway {
  private readonly bundle: LoadedBundle;
  private readonly coreModuleResolver?: (moduleId: CoreModuleId) => unknown;

  constructor(context: GatewayContext) {
    this.bundle = context.bundle;
    this.coreModuleResolver = context.coreModuleResolver;
  }

  async handleRequest(request: GatewayRequest): Promise<GatewayResponse> {
    const tool = this.findTool(request.tool_id);
    if (!tool) {
      throw new Error(`Tool not found: ${request.tool_id}`);
    }

    this.validateParameters(tool, request.parameters);

    const coreModule = this.extractCoreModule(request.tool_id);
    const result = await this.routeToCoreModule(coreModule, request.parameters);

    return {
      tool_id: request.tool_id,
      result,
      metadata: {
        executionMode: this.bundle.gatewayEntry.runtimeHints.mode,
        coreModule,
        timestamp: new Date().toISOString()
      }
    };
  }

  getAvailableTools(): McpProjectedTool[] {
    return this.bundle.projection.tools;
  }

  getToolCount(): number {
    return this.bundle.projection.toolCount;
  }

  private findTool(toolId: string): McpProjectedTool | undefined {
    return this.bundle.projection.tools.find((tool) => tool.tool_id === toolId);
  }

  private validateParameters(tool: McpProjectedTool, parameters: Record<string, unknown>): void {
    for (const field of tool.input_schema.required) {
      if (!(field in parameters)) {
        throw new Error(`Missing required parameter: ${field} for tool ${tool.tool_id}`);
      }
    }
  }

  private extractCoreModule(toolId: string): CoreModuleId {
    const match = /^tokenflow-(.+)$/.exec(toolId);
    if (!match) {
      throw new Error(`Invalid tool_id format: ${toolId}`);
    }

    if (!isCoreModuleId(match[1])) {
      throw new Error(`Unsupported core module: ${match[1]}`);
    }

    return match[1];
  }

  private async routeToCoreModule(
    moduleId: CoreModuleId,
    parameters: Record<string, unknown>
  ): Promise<unknown> {
    const resolvedModule = this.coreModuleResolver?.(moduleId);

    const result = await executeCoreModule({
      moduleId,
      input: parameters,
      context: {
        hostCapability: this.bundle.gatewayEntry.hostCapability,
        entryShape: this.bundle.gatewayEntry.entryShape,
        toolId: `tokenflow-${moduleId}`
      }
    });

    return {
      ...result,
      resolved: resolvedModule ?? null
    };
  }
}

export function createGateway(bundle: LoadedBundle = loadRuntimeBundle()): McpGateway {
  return new McpGateway({ bundle });
}

export function loadGateway(): McpGateway {
  return createGateway(loadRuntimeBundle());
}
