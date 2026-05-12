export type McpEntryShape = "server" | "gateway";

export interface McpProjectedTool {
  tool_id: string;
  title_zh: string;
  description_zh: string;
  entry_shape: McpEntryShape;
  capabilities: string[];
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
  source: {
    tooling_manifest: string;
    adapter_matrix: string;
    rendering_conventions: string;
  };
}

export interface McpToolSchemaProjection {
  version: 1;
  product: "TokenFlow";
  adapterId: "mcp";
  hostCapability: string;
  preferredEntryShape: McpEntryShape;
  availableEntryShapes: McpEntryShape[];
  recommendedAdapters: string[];
  toolCount: number;
  toolIds: string[];
  moduleFamilyBindings: Record<string, string[]>;
  tools: McpProjectedTool[];
}

export function summarizeMcpProjection(projection: McpToolSchemaProjection): string {
  return [
    `adapter=${projection.adapterId}`,
    `host=${projection.hostCapability}`,
    `entry=${projection.preferredEntryShape}`,
    `tools=${projection.toolCount}`
  ].join(" ");
}
