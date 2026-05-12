import type { McpToolSchemaProjection } from "./projection";

export interface McpRuntimeEntryPlan {
  version: 1;
  adapterId: "mcp";
  entryShape: "server" | "gateway";
  hostCapability: string;
  status: "ready-for-runtime";
  toolIds: string[];
  sourceProjection: string;
  runtimeHints: {
    mode: string;
    recommendedAdapters: string[];
  };
}

export interface McpRuntimeBundle {
  projection: McpToolSchemaProjection;
  serverEntry: McpRuntimeEntryPlan;
  gatewayEntry: McpRuntimeEntryPlan;
}

export function selectRuntimeEntry(
  bundle: McpRuntimeBundle,
  hostCapability: string
): McpRuntimeEntryPlan {
  if (hostCapability === "mcp") {
    return bundle.serverEntry;
  }

  return bundle.gatewayEntry;
}

export function getRuntimeToolIds(bundle: McpRuntimeBundle): string[] {
  return bundle.projection.toolIds;
}
