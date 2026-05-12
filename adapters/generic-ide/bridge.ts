import * as fs from "fs";
import * as path from "path";
import {
  GenericIdeBridgeRequest,
  GenericIdeBridgePlan,
  GenericIdeBridgePayload,
  GenericIdeBridgeApi,
  TokenFlowTruthRef,
  BridgeAdapterKey,
  BridgePhase,
} from "./contracts";

/**
 * Generic IDE Bridge Runtime
 * 
 * 职责：
 * - 从 host request 路由到 adapter selection
 * - 读取 adapter-matrix.json 推荐适配器
 * - 生成 bridge plan 和 payloads
 * - 验证 truth refs 可用性
 * 
 * 约束：
 * - 保持宿主无关
 * - 不硬编码能力逻辑
 * - 只负责路由和渲染
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

export class GenericIdeBridge implements GenericIdeBridgeApi {
  private projectRoot: string;
  private adapterMatrix: AdapterMatrix | null = null;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * 解析 generic-ide bridge 请求，生成执行计划
   */
  resolveGenericIdeBridge(request: GenericIdeBridgeRequest): GenericIdeBridgePlan {
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

    return {
      bridgeId: "generic-ide",
      truthRefs,
      selectedAdapters,
      executionSurface,
      fallbackSurface,
    };
  }

  /**
   * 从 bridge plan 渲染 payloads
   */
  renderGenericIdePayloads(plan: GenericIdeBridgePlan): GenericIdeBridgePayload[] {
    const payloads: GenericIdeBridgePayload[] = [];

    // 为每个选中的 adapter 生成对应的 payload
    for (const adapter of plan.selectedAdapters) {
      // trigger phase: 语义触发（skill 优先）
      if (adapter === "skill") {
        payloads.push({
          entry: "trigger",
          adapter: "skill",
          summary: "语义触发和策略注入",
        });
      }

      // execute phase: 执行表面（mcp 优先）
      if (adapter === plan.executionSurface) {
        payloads.push({
          entry: "execute",
          adapter,
          summary: `主执行表面: ${adapter}`,
        });
      }

      // enhance phase: 前后置增强（hook）
      if (adapter === "hook") {
        payloads.push({
          entry: "enhance",
          adapter: "hook",
          summary: "前后置增强和约束注入",
        });
      }

      // fallback phase: 回退表面（command）
      if (adapter === plan.fallbackSurface && adapter !== plan.executionSurface) {
        payloads.push({
          entry: "fallback",
          adapter,
          summary: `回退表面: ${adapter}`,
        });
      }
    }

    return payloads;
  }

  /**
   * 验证 truth refs 是否存在
   */
  verifyGenericIdeTruth(inputs: TokenFlowTruthRef[]): { ok: boolean; missing: TokenFlowTruthRef[] } {
    const missing: TokenFlowTruthRef[] = [];

    for (const ref of inputs) {
      const fullPath = path.join(this.projectRoot, ref);
      if (!fs.existsSync(fullPath)) {
        missing.push(ref);
      }
    }

    return {
      ok: missing.length === 0,
      missing,
    };
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
}

/**
 * 工厂函数：创建 generic-ide bridge 实例
 */
export function createGenericIdeBridge(projectRoot: string): GenericIdeBridgeApi {
  return new GenericIdeBridge(projectRoot);
}
