import * as fs from "fs";
import * as path from "path";
import {
  CodexTeamsBridgeRequest,
  CodexTeamsBridgePlan,
  CodexTeamsDispatchPacket,
  CodexTeamsBridgeApi,
  CodexTeamsFeatureState,
  TokenFlowTruthRef,
  BridgeAdapterKey,
  BridgePhase,
} from "./contracts";

/**
 * Codex Teams Bridge Runtime
 * 
 * 职责：
 * - 面向 codex-teams 的 bridge runtime
 * - 支持读取 .codex-teams/features/{featureSlug}/state.json
 * - 从 host request 路由到 adapter selection
 * - 生成 dispatch packet
 * 
 * 约束：
 * - feature state 是编排上下文，不是能力来源
 * - bridge payload 保持可移植性
 * - 从共享 truth 和 host capabilities 渲染
 */

interface AdapterMatrixEntry {
  hostCapability: string;
  recommendedAdapters: string[];
  notes: string;
}

interface AdapterMatrix {
  version: number;
  hostMatrix: AdapterMatrixEntry[];
  renderingRules: string[];
  familyDefaults: Array<{
    family: string;
    preferredAdapters: string[];
  }>;
}

export class CodexTeamsBridge implements CodexTeamsBridgeApi {
  private projectRoot: string;
  private adapterMatrix: AdapterMatrix | null = null;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * 解析 codex-teams bridge 请求，生成执行计划
   */
  resolveCodexTeamsBridge(request: CodexTeamsBridgeRequest): CodexTeamsBridgePlan {
    // 加载 adapter-matrix.json
    this.loadAdapterMatrix();

    // 基于 host capabilities 和 available adapters 选择最佳适配器组合
    const selectedAdapters = this.selectAdapters(
      request.hostCapabilities,
      request.availableAdapters
    );

    // 确定执行表面和回退表面
    const executionSurface = this.determineExecutionSurface(selectedAdapters);
    const fallbackSurface = this.determineFallbackSurface(selectedAdapters);

    // 构建 truth refs
    const truthRefs: TokenFlowTruthRef[] = [
      "core/capability-graph.json",
      "manifests/tooling-manifest.json",
      "manifests/adapter-matrix.json",
      "manifests/rendering-conventions.json",
    ];

    // 构建 context refs（feature state path）
    const contextRefs = [
      `.codex-teams/features/${request.featureSlug}/state.json`,
    ];

    return {
      bridgeId: "codex-teams",
      truthRefs,
      contextRefs,
      selectedAdapters,
      executionSurface,
      fallbackSurface,
    };
  }

  /**
   * 从 bridge plan 构建 dispatch packet
   */
  buildCodexTeamsDispatch(plan: CodexTeamsBridgePlan): CodexTeamsDispatchPacket {
    const entries: Array<{
      phase: BridgePhase;
      adapter: BridgeAdapterKey;
      summary: string;
    }> = [];

    // 为每个选中的 adapter 生成对应的 entry
    for (const adapter of plan.selectedAdapters) {
      // trigger phase: 语义触发和 SOP 注入（skill 优先）
      if (adapter === "skill") {
        entries.push({
          phase: "trigger",
          adapter: "skill",
          summary: "语义触发和 SOP 注入",
        });
      }

      // execute phase: 工具执行表面（mcp 优先）
      if (adapter === plan.executionSurface) {
        entries.push({
          phase: "execute",
          adapter,
          summary: `主执行表面: ${adapter}`,
        });
      }

      // enhance phase: 前后置链（hook）
      if (adapter === "hook") {
        entries.push({
          phase: "enhance",
          adapter: "hook",
          summary: "前后置链和约束注入",
        });
      }

      // fallback phase: 可审计回退入口（command）
      if (adapter === plan.fallbackSurface && adapter !== plan.executionSurface) {
        entries.push({
          phase: "fallback",
          adapter,
          summary: `可审计回退入口: ${adapter}`,
        });
      }
    }

    // 从 contextRefs 中提取 featureSlug
    const featureSlug = this.extractFeatureSlugFromContextRefs(plan.contextRefs);

    return {
      featureSlug,
      taskId: "", // taskId 由调用方在 request 中提供，这里留空
      bridge: "codex-teams",
      entries,
    };
  }

  /**
   * 验证 codex-teams bridge 输入
   */
  verifyCodexTeamsBridgeInputs(inputs: {
    truthRefs: TokenFlowTruthRef[];
    statePath?: string;
  }): { ok: boolean; missingTruth: TokenFlowTruthRef[]; missingState: boolean } {
    const missingTruth: TokenFlowTruthRef[] = [];

    // 验证 truth refs
    for (const ref of inputs.truthRefs) {
      const fullPath = path.join(this.projectRoot, ref);
      if (!fs.existsSync(fullPath)) {
        missingTruth.push(ref);
      }
    }

    // 验证 state path（如果提供）
    let missingState = false;
    if (inputs.statePath) {
      const stateFullPath = path.join(this.projectRoot, inputs.statePath);
      if (!fs.existsSync(stateFullPath)) {
        missingState = true;
      }
    }

    return {
      ok: missingTruth.length === 0 && !missingState,
      missingTruth,
      missingState,
    };
  }

  /**
   * 读取 feature state（可选，用于上下文增强）
   */
  readFeatureState(featureSlug: string): CodexTeamsFeatureState | null {
    const statePath = path.join(
      this.projectRoot,
      ".codex-teams",
      "features",
      featureSlug,
      "state.json"
    );

    if (!fs.existsSync(statePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(statePath, "utf-8");
      return JSON.parse(content) as CodexTeamsFeatureState;
    } catch (error) {
      console.error(`Failed to read feature state at ${statePath}:`, error);
      return null;
    }
  }

  /**
   * 加载 adapter-matrix.json
   */
  private loadAdapterMatrix(): void {
    if (this.adapterMatrix) return;

    const matrixPath = path.join(this.projectRoot, "manifests", "adapter-matrix.json");
    if (!fs.existsSync(matrixPath)) {
      throw new Error(`adapter-matrix.json not found at ${matrixPath}`);
    }

    const content = fs.readFileSync(matrixPath, "utf-8");
    this.adapterMatrix = JSON.parse(content) as AdapterMatrix;
  }

  /**
   * 基于 host capabilities 和 available adapters 选择适配器
   */
  private selectAdapters(
    hostCapabilities: string[],
    availableAdapters: BridgeAdapterKey[]
  ): BridgeAdapterKey[] {
    if (!this.adapterMatrix) {
      throw new Error("adapter-matrix not loaded");
    }

    const selected = new Set<BridgeAdapterKey>();

    // 遍历 host capabilities，查找推荐的 adapters
    for (const capability of hostCapabilities) {
      const entry = this.adapterMatrix.hostMatrix.find(
        (e) => e.hostCapability === capability
      );

      if (entry) {
        for (const recommended of entry.recommendedAdapters) {
          if (availableAdapters.includes(recommended as BridgeAdapterKey)) {
            selected.add(recommended as BridgeAdapterKey);
          }
        }
      }
    }

    // 如果没有匹配到任何 adapter，使用 available adapters 中的第一个作为回退
    if (selected.size === 0 && availableAdapters.length > 0) {
      selected.add(availableAdapters[0]);
    }

    return Array.from(selected);
  }

  /**
   * 确定执行表面（优先级：mcp > skill > command > hook）
   */
  private determineExecutionSurface(
    selectedAdapters: BridgeAdapterKey[]
  ): BridgeAdapterKey | "none" {
    const priority: BridgeAdapterKey[] = ["mcp", "skill", "command", "hook"];

    for (const adapter of priority) {
      if (selectedAdapters.includes(adapter)) {
        return adapter;
      }
    }

    return "none";
  }

  /**
   * 确定回退表面（优先级：command > mcp > skill）
   */
  private determineFallbackSurface(
    selectedAdapters: BridgeAdapterKey[]
  ): BridgeAdapterKey | "none" {
    const priority: BridgeAdapterKey[] = ["command", "mcp", "skill"];

    for (const adapter of priority) {
      if (selectedAdapters.includes(adapter)) {
        return adapter;
      }
    }

    return "none";
  }

  /**
   * 从 contextRefs 中提取 featureSlug
   */
  private extractFeatureSlugFromContextRefs(contextRefs: string[]): string {
    for (const ref of contextRefs) {
      const match = ref.match(/\.codex-teams\/features\/([^/]+)\/state\.json/);
      if (match) {
        return match[1];
      }
    }
    return "";
  }
}

/**
 * 工厂函数：创建 codex-teams bridge 实例
 */
export function createCodexTeamsBridge(projectRoot: string): CodexTeamsBridgeApi {
  return new CodexTeamsBridge(projectRoot);
}
