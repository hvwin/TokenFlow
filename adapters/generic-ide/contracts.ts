export type TokenFlowTruthRef =
  | "core/capability-graph.json"
  | "manifests/tooling-manifest.json"
  | "manifests/adapter-matrix.json"
  | "manifests/rendering-conventions.json";

export type BridgePhase = "trigger" | "execute" | "enhance" | "fallback";

export type BridgeAdapterKey = "skill" | "mcp" | "hook" | "command";

export interface GenericIdeBridgeRequest {
  taskIntent: string;
  hostCapabilities: string[];
  availableAdapters: BridgeAdapterKey[];
}

export interface GenericIdeBridgePlan {
  bridgeId: "generic-ide";
  truthRefs: TokenFlowTruthRef[];
  selectedAdapters: BridgeAdapterKey[];
  executionSurface: BridgeAdapterKey | "none";
  fallbackSurface: BridgeAdapterKey | "none";
}

export interface GenericIdeBridgePayload {
  entry: BridgePhase;
  adapter: BridgeAdapterKey;
  summary: string;
}

export interface GenericIdeBridgeApi {
  resolveGenericIdeBridge(request: GenericIdeBridgeRequest): GenericIdeBridgePlan;
  renderGenericIdePayloads(plan: GenericIdeBridgePlan): GenericIdeBridgePayload[];
  verifyGenericIdeTruth(inputs: TokenFlowTruthRef[]): { ok: boolean; missing: TokenFlowTruthRef[] };
}
