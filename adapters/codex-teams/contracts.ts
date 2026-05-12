export type TokenFlowTruthRef =
  | "core/capability-graph.json"
  | "manifests/tooling-manifest.json"
  | "manifests/adapter-matrix.json"
  | "manifests/rendering-conventions.json";

export type BridgeAdapterKey = "skill" | "mcp" | "hook" | "command";
export type BridgePhase = "trigger" | "execute" | "enhance" | "fallback";

export interface CodexTeamsBridgeRequest {
  featureSlug: string;
  taskId: string;
  taskIntent: string;
  hostCapabilities: string[];
  availableAdapters: BridgeAdapterKey[];
}

export interface CodexTeamsBridgePlan {
  bridgeId: "codex-teams";
  truthRefs: TokenFlowTruthRef[];
  contextRefs: string[];
  selectedAdapters: BridgeAdapterKey[];
  executionSurface: BridgeAdapterKey | "none";
  fallbackSurface: BridgeAdapterKey | "none";
}

export interface CodexTeamsBridgeContextRefs {
  featureStatePathTemplate: ".codex-teams/features/{featureSlug}/state.json";
}

export interface CodexTeamsDispatchPacket {
  featureSlug: string;
  taskId: string;
  bridge: "codex-teams";
  entries: Array<{
    phase: BridgePhase;
    adapter: BridgeAdapterKey;
    summary: string;
  }>;
}

export interface CodexTeamsFeatureState {
  featureSlug: string;
  status: string;
  tasks?: Array<{
    taskId: string;
    status: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface CodexTeamsBridgeApi {
  resolveCodexTeamsBridge(request: CodexTeamsBridgeRequest): CodexTeamsBridgePlan;
  buildCodexTeamsDispatch(plan: CodexTeamsBridgePlan): CodexTeamsDispatchPacket;
  verifyCodexTeamsBridgeInputs(inputs: {
    truthRefs: TokenFlowTruthRef[];
    statePath?: string;
  }): { ok: boolean; missingTruth: TokenFlowTruthRef[]; missingState: boolean };
  readFeatureState(featureSlug: string): CodexTeamsFeatureState | null;
}
