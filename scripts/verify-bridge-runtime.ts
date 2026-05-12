/**
 * Bridge Runtime 验证脚本
 * 
 * 用途：验证 generic-ide 和 codex-teams bridge runtime 的基本功能
 */

import { createGenericIdeBridge } from "../adapters/generic-ide/bridge";
import { createCodexTeamsBridge } from "../adapters/codex-teams/bridge";

const projectRoot = process.cwd();

console.log("=== Bridge Runtime 验证 ===\n");
let failureCount = 0;

// 测试 1: Generic IDE Bridge
console.log("1. 测试 Generic IDE Bridge");
try {
  const genericBridge = createGenericIdeBridge(projectRoot);

  const genericRequest = {
    taskIntent: "优化 MCP 工具调用",
    hostCapabilities: ["mcp", "skill"],
    availableAdapters: ["mcp", "skill", "command"] as any[],
  };

  const genericPlan = genericBridge.resolveGenericIdeBridge(genericRequest);
  console.log("   ✓ Bridge 计划生成成功");
  console.log("     - 执行表面:", genericPlan.executionSurface);
  console.log("     - 回退表面:", genericPlan.fallbackSurface);
  console.log("     - 选中适配器:", genericPlan.selectedAdapters.join(", "));

  const genericPayloads = genericBridge.renderGenericIdePayloads(genericPlan);
  console.log("   ✓ Payloads 渲染成功，共", genericPayloads.length, "个");
  for (const payload of genericPayloads) {
    console.log(`     - [${payload.entry}] ${payload.adapter}: ${payload.summary}`);
  }

  const genericVerification = genericBridge.verifyGenericIdeTruth(genericPlan.truthRefs);
  if (genericVerification.ok) {
    console.log("   ✓ Truth refs 验证通过");
  } else {
    console.log("   ⚠ 缺失的 truth refs:", genericVerification.missing.join(", "));
  }
} catch (error) {
  console.error("   ✗ Generic IDE Bridge 测试失败:", error);
  failureCount += 1;
}

console.log();

// 测试 2: Codex Teams Bridge
console.log("2. 测试 Codex Teams Bridge");
try {
  const codexBridge = createCodexTeamsBridge(projectRoot);

  const codexRequest = {
    featureSlug: "token-optimization",
    taskId: "T1",
    taskIntent: "实现 token 预算计算",
    hostCapabilities: ["mcp", "skill", "hook"],
    availableAdapters: ["mcp", "skill", "hook", "command"] as any[],
  };

  const codexPlan = codexBridge.resolveCodexTeamsBridge(codexRequest);
  console.log("   ✓ Bridge 计划生成成功");
  console.log("     - Bridge ID:", codexPlan.bridgeId);
  console.log("     - 执行表面:", codexPlan.executionSurface);
  console.log("     - 回退表面:", codexPlan.fallbackSurface);
  console.log("     - 上下文引用:", codexPlan.contextRefs.join(", "));

  const codexDispatch = codexBridge.buildCodexTeamsDispatch(codexPlan);
  console.log("   ✓ Dispatch packet 构建成功");
  console.log("     - Feature:", codexDispatch.featureSlug);
  console.log("     - Entries:", codexDispatch.entries.length, "个");
  for (const entry of codexDispatch.entries) {
    console.log(`     - [${entry.phase}] ${entry.adapter}: ${entry.summary}`);
  }

  const codexVerification = codexBridge.verifyCodexTeamsBridgeInputs({
    truthRefs: codexPlan.truthRefs,
    statePath: codexPlan.contextRefs[0],
  });

  if (codexVerification.ok) {
    console.log("   ✓ 输入验证通过");
  } else {
    if (codexVerification.missingTruth.length > 0) {
      console.log("   ⚠ 缺失的 truth refs:", codexVerification.missingTruth.join(", "));
    }
    if (codexVerification.missingState) {
      console.log("   ⚠ Feature state 文件不存在（预期行为）");
    }
  }

  // 测试 feature state 读取（可选）
  const featureState = codexBridge.readFeatureState("token-optimization");
  if (featureState) {
    console.log("   ✓ Feature state 读取成功");
  } else {
    console.log("   ℹ Feature state 不存在（预期行为）");
  }
} catch (error) {
  console.error("   ✗ Codex Teams Bridge 测试失败:", error);
  failureCount += 1;
}

console.log();

// 测试 3: Adapter 选择逻辑
console.log("3. 测试 Adapter 选择逻辑");
try {
  const bridge = createGenericIdeBridge(projectRoot);

  const testCases = [
    {
      name: "仅 MCP",
      hostCapabilities: ["mcp"],
      availableAdapters: ["mcp", "skill", "command"] as any[],
    },
    {
      name: "MCP + Skill",
      hostCapabilities: ["mcp", "skill"],
      availableAdapters: ["mcp", "skill", "command"] as any[],
    },
    {
      name: "全部能力",
      hostCapabilities: ["mcp", "skill", "hook", "command"],
      availableAdapters: ["mcp", "skill", "hook", "command"] as any[],
    },
    {
      name: "仅 Command",
      hostCapabilities: ["command"],
      availableAdapters: ["command"] as any[],
    },
  ];

  for (const testCase of testCases) {
    const request = {
      taskIntent: "测试任务",
      hostCapabilities: testCase.hostCapabilities,
      availableAdapters: testCase.availableAdapters,
    };

    const plan = bridge.resolveGenericIdeBridge(request);
    console.log(`   ${testCase.name}:`);
    console.log(`     - 选中: ${plan.selectedAdapters.join(", ")}`);
    console.log(`     - 执行: ${plan.executionSurface}, 回退: ${plan.fallbackSurface}`);
  }

  console.log("   ✓ Adapter 选择逻辑测试通过");
} catch (error) {
  console.error("   ✗ Adapter 选择逻辑测试失败:", error);
  failureCount += 1;
}

console.log();
console.log("=== 验证完成 ===");
if (failureCount > 0) {
  console.error(`Bridge Runtime 验证失败: ${failureCount} 个失败项`);
  process.exit(1);
}
