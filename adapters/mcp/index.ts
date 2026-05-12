export type McpEntryShape = "server" | "gateway";

export interface McpTruthPaths {
  coreCapabilityGraph: string;
  toolingManifest: string;
  adapterMatrix: string;
  candidateFamilies: string;
  renderingConventions: string;
}

export interface McpRuntimePlan {
  adapterId: "mcp";
  executionSurface: "primary";
  entryShapes: McpEntryShape[];
  truthPaths: McpTruthPaths;
  boundary: {
    inScope: string[];
    outOfScope: string[];
  };
}

/**
 * MCP 适配层运行计划骨架：
 * - 只声明结构，不实现真实 server/gateway 运行时。
 * - 由后续实现读取 manifests/core 真源并渲染为 MCP surface。
 */
export const MCP_RUNTIME_PLAN: McpRuntimePlan = {
  adapterId: "mcp",
  executionSurface: "primary",
  entryShapes: ["server", "gateway"],
  truthPaths: {
    coreCapabilityGraph: "core/capability-graph.json",
    toolingManifest: "manifests/tooling-manifest.json",
    adapterMatrix: "manifests/adapter-matrix.json",
    candidateFamilies: "manifests/candidate-families.json",
    renderingConventions: "manifests/rendering-conventions.json"
  },
  boundary: {
    inScope: [
      "tool schema projection",
      "runtime entry planning",
      "host capability hinting"
    ],
    outOfScope: [
      "full MCP runtime implementation",
      "single IDE lock-in",
      "write-back to core/manifests truth"
    ]
  }
};

export function getMcpRuntimePlan(): McpRuntimePlan {
  return MCP_RUNTIME_PLAN;
}

export const MCP_GENERATED_ARTIFACTS = {
  projection: "examples/generated/mcp/tool-schema-projection.json",
  serverEntry: "examples/generated/mcp/server-entry.json",
  gatewayEntry: "examples/generated/mcp/gateway-entry.json"
} as const;

export function getMcpGeneratedArtifacts() {
  return MCP_GENERATED_ARTIFACTS;
}

export {
  createTokenFlowMcpSdkServer,
  startTokenFlowMcpStdioServer
} from "./sdk-server";
