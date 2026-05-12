export type CoreModuleId = "router" | "tokeneff" | "toolkit" | "openwolf" | "caveman";

export interface CoreExecutionRequest {
  moduleId: CoreModuleId;
  input: Record<string, unknown>;
  context?: {
    hostCapability?: string;
    entryShape?: string;
    toolId?: string;
  };
}

export interface CoreExecutionResult {
  status: "ok";
  moduleId: CoreModuleId;
  output: Record<string, unknown>;
  diagnostics: {
    executionMode: "core-seam";
    absorbedFamilies: string[];
    pendingFamilies: string[];
    notes: string[];
  };
}

const MODULE_FAMILIES: Record<CoreModuleId, string[]> = {
  router: [],
  tokeneff: ["prompt-compression", "skills-caching", "rtk"],
  toolkit: ["mcp-optimization"],
  openwolf: [],
  caveman: []
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function createDiagnostics(moduleId: CoreModuleId, notes: string[]): CoreExecutionResult["diagnostics"] {
  return {
    executionMode: "core-seam",
    absorbedFamilies: [],
    pendingFamilies: MODULE_FAMILIES[moduleId],
    notes
  };
}

function executeRouter(input: Record<string, unknown>): Record<string, unknown> {
  const hostCapabilities = asStringArray(input.hostCapabilities);
  const availableAdapters = asStringArray(input.availableAdapters);
  const selectedAdapter = availableAdapters.find((adapter) => hostCapabilities.includes(adapter))
    ?? availableAdapters[0]
    ?? hostCapabilities[0]
    ?? "command";

  return {
    routePlan: {
      task: asString(input.task, "unspecified task"),
      selectedAdapter,
      fallbackAdapter: selectedAdapter === "command" ? null : "command"
    },
    selectedRole: "tokenflow-router",
    selectedModel: "host-default",
    selectedAdapter
  };
}

function executeTokenEff(input: Record<string, unknown>): Record<string, unknown> {
  const prompt = asString(input.prompt, "");
  const contextWindow = typeof input.contextWindow === "number" ? input.contextWindow : 0;
  const estimatedTokens = Math.ceil(prompt.length / 4);
  const budgetRatio = contextWindow > 0 ? Number((estimatedTokens / contextWindow).toFixed(4)) : null;
  const shouldCompress = contextWindow > 0 ? estimatedTokens > contextWindow * 0.6 : prompt.length > 4000;

  return {
    budgetPlan: {
      contextWindow,
      estimatedTokens,
      budgetRatio
    },
    compressionPlan: {
      shouldCompress,
      targetRatio: shouldCompress ? 0.5 : 1,
      strategy: shouldCompress ? "semantic-preserving candidate compression" : "no compression required"
    },
    cacheHint: {
      cacheable: prompt.length > 0,
      keyBasis: ["prompt", "toolSurface", "history"]
    },
    rerouteHint: shouldCompress ? "consider tokeneff before downstream adapters" : "continue current route"
  };
}

function executeToolkit(input: Record<string, unknown>): Record<string, unknown> {
  const hostCapabilities = asStringArray(input.hostCapabilities);
  const executionMode = hostCapabilities.includes("mcp") ? "mcp" : "command";

  return {
    toolBundle: {
      task: asString(input.task, "unspecified task"),
      minimalTools: executionMode === "mcp" ? ["tokenflow-router", "tokenflow-tokeneff"] : ["tokenflow-command"]
    },
    renderBundle: {
      preferredSurface: executionMode,
      dynamicToolset: true
    },
    executionMode
  };
}

function executeOpenWolf(input: Record<string, unknown>): Record<string, unknown> {
  return {
    scoutPlan: {
      task: asString(input.task, "unspecified reconnaissance"),
      repoShape: input.repoShape ?? null
    },
    intakePlan: {
      externalSources: asStringArray(input.externalSources),
      mode: "high-signal-first"
    },
    evidencePriority: ["local truth", "runtime output", "external source"]
  };
}

function executeCaveman(input: Record<string, unknown>): Record<string, unknown> {
  return {
    executionPlan: {
      boundedTask: asString(input.boundedTask, "unspecified bounded task"),
      mode: "narrow-change"
    },
    verificationPlan: {
      verificationMode: asString(input.verificationMode, "smoke"),
      required: true
    },
    repairPlan: {
      onFailure: "localize failing check, patch minimal scope, rerun verification"
    }
  };
}

export async function executeCoreModule(request: CoreExecutionRequest): Promise<CoreExecutionResult> {
  const outputByModule: Record<CoreModuleId, () => Record<string, unknown>> = {
    router: () => executeRouter(request.input),
    tokeneff: () => executeTokenEff(request.input),
    toolkit: () => executeToolkit(request.input),
    openwolf: () => executeOpenWolf(request.input),
    caveman: () => executeCaveman(request.input)
  };

  const execute = outputByModule[request.moduleId];
  if (!execute) {
    throw new Error(`Unsupported core module: ${request.moduleId}`);
  }

  return {
    status: "ok",
    moduleId: request.moduleId,
    output: execute(),
    diagnostics: createDiagnostics(request.moduleId, [
      "Host-agnostic core seam executed successfully.",
      "Candidate family algorithms remain pending until their promotion gates are satisfied."
    ])
  };
}

export function isCoreModuleId(value: string): value is CoreModuleId {
  return ["router", "tokeneff", "toolkit", "openwolf", "caveman"].includes(value);
}
