# codex-teams bridge

## 目标

`codex-teams` bridge 负责把 TokenFlow truth 接到 Codex Teams 的协作执行面，输出可调度、可验证、可回放的桥接计划，不把 core 逻辑复制到宿主侧。

## 消费 truth

- `core/capability-graph.json`
- `manifests/tooling-manifest.json`
- `manifests/adapter-matrix.json`
- `manifests/rendering-conventions.json`
- `.codex-teams/features/{featureSlug}/state.json`（仅会话状态引用，不作为能力真源）

## 暴露入口

- `resolveCodexTeamsBridge(request)`
  - 结合任务切片与 host 能力，解析 adapter 组合与执行面。
- `buildCodexTeamsDispatch(plan)`
  - 输出适合 Codex Teams task/agent 分派的最小 dispatch 包。
- `verifyCodexTeamsBridgeInputs(inputs)`
  - 校验 truth 与 feature state 引用是否齐备。

## 与 skill / mcp / hook / command 的关系

- `skill`: 用于任务语义触发与 SOP 注入。
- `mcp`: 作为工具调用优先执行面。
- `hook`: 在宿主支持时挂到前后处理链。
- `command`: 作为人工可审计的显式兜底入口。

## 边界

- 仅负责 bridge 计划与 dispatch 负载，不直接执行宿主私有命令。
- feature state 只作为编排上下文，不反向覆盖 core/manifests truth。
- 避免把 `codex-teams` 写成不可迁移的宿主专属胶水层。

---

## Runtime 使用说明

### 基本用法

```typescript
import { createCodexTeamsBridge } from "./bridge";

// 创建 bridge 实例
const bridge = createCodexTeamsBridge("/path/to/token-workflow-tools");

// 构建请求
const request = {
  featureSlug: "token-optimization",
  taskId: "T1",
  taskIntent: "实现 token 预算计算",
  hostCapabilities: ["mcp", "skill", "hook"],
  availableAdapters: ["mcp", "skill", "hook", "command"],
};

// 解析 bridge 计划
const plan = bridge.resolveCodexTeamsBridge(request);
console.log("Bridge ID:", plan.bridgeId);
console.log("执行表面:", plan.executionSurface);
console.log("回退表面:", plan.fallbackSurface);
console.log("上下文引用:", plan.contextRefs);

// 构建 dispatch packet
const dispatch = bridge.buildCodexTeamsDispatch(plan);
console.log("Feature:", dispatch.featureSlug);
console.log("Entries:", dispatch.entries);

// 验证输入
const verification = bridge.verifyCodexTeamsBridgeInputs({
  truthRefs: plan.truthRefs,
  statePath: plan.contextRefs[0],
});

if (!verification.ok) {
  console.error("缺失的 truth refs:", verification.missingTruth);
  console.error("缺失 state:", verification.missingState);
}
```

### Feature State 读取

Bridge 支持读取 feature state 作为编排上下文（可选）：

```typescript
const bridge = createCodexTeamsBridge("/path/to/token-workflow-tools");

// 读取 feature state
const featureState = bridge.readFeatureState("token-optimization");

if (featureState) {
  console.log("Feature 状态:", featureState.status);
  console.log("任务列表:", featureState.tasks);
} else {
  console.log("Feature state 不存在或读取失败");
}
```

**注意**：Feature state 仅作为编排上下文，不会影响 adapter 选择逻辑或能力真源。

### Adapter 选择逻辑

与 `generic-ide` bridge 相同：

1. **基于 host capabilities 匹配**：从 `adapter-matrix.json` 读取推荐适配器
2. **执行表面优先级**：`mcp` > `skill` > `command` > `hook`
3. **回退表面优先级**：`command` > `mcp` > `skill`
4. **自动回退**：如果没有匹配到任何适配器，使用 `availableAdapters` 中的第一个

### Dispatch Packet 结构

`buildCodexTeamsDispatch` 返回的 dispatch packet 包含：

- `featureSlug`: 从 `contextRefs` 中提取的 feature 标识
- `taskId`: 任务 ID（需要在后续流程中填充）
- `bridge`: 固定为 `"codex-teams"`
- `entries`: 按 phase 排序的执行入口列表

每个 entry 包含：
- `phase`: `"trigger"` | `"execute"` | `"enhance"` | `"fallback"`
- `adapter`: 对应的适配器类型
- `summary`: 中文描述

### 验证流程

在执行前，建议同时验证 truth refs 和 feature state：

```typescript
const verification = bridge.verifyCodexTeamsBridgeInputs({
  truthRefs: [
    "core/capability-graph.json",
    "manifests/tooling-manifest.json",
    "manifests/adapter-matrix.json",
    "manifests/rendering-conventions.json",
  ],
  statePath: ".codex-teams/features/token-optimization/state.json",
});

if (!verification.ok) {
  if (verification.missingTruth.length > 0) {
    console.error("缺失的 truth 文件:", verification.missingTruth);
  }
  if (verification.missingState) {
    console.error("缺失 feature state 文件");
  }
}
```

### 集成示例

```typescript
// 完整的 Codex Teams 集成流程
async function executeCodexTeamsTask(
  featureSlug: string,
  taskId: string,
  taskIntent: string
) {
  const bridge = createCodexTeamsBridge(process.cwd());

  // 1. 构建请求
  const request = {
    featureSlug,
    taskId,
    taskIntent,
    hostCapabilities: ["mcp", "skill", "hook", "command"],
    availableAdapters: ["mcp", "skill", "hook", "command"],
  };

  // 2. 解析计划
  const plan = bridge.resolveCodexTeamsBridge(request);

  // 3. 验证输入
  const verification = bridge.verifyCodexTeamsBridgeInputs({
    truthRefs: plan.truthRefs,
    statePath: plan.contextRefs[0],
  });

  if (!verification.ok) {
    throw new Error(
      `Bridge input verification failed: ${JSON.stringify(verification)}`
    );
  }

  // 4. 构建 dispatch packet
  const dispatch = bridge.buildCodexTeamsDispatch(plan);
  dispatch.taskId = taskId; // 填充 taskId

  // 5. 可选：读取 feature state 作为上下文
  const featureState = bridge.readFeatureState(featureSlug);
  if (featureState) {
    console.log("当前 feature 状态:", featureState.status);
  }

  // 6. 分派执行（由 Codex Teams 宿主实现）
  await dispatchToCodexTeams(dispatch);
}
```

### 与 generic-ide bridge 的差异

| 特性 | generic-ide | codex-teams |
|------|-------------|-------------|
| 上下文引用 | 无 | 支持 feature state |
| 输出格式 | `GenericIdeBridgePayload[]` | `CodexTeamsDispatchPacket` |
| 任务标识 | 仅 `taskIntent` | `featureSlug` + `taskId` + `taskIntent` |
| 适用场景 | 通用 IDE/agent 宿主 | Codex Teams 协作环境 |

### 注意事项

- Bridge runtime 是无状态的，每次调用都会重新读取配置文件
- Feature state 读取失败不会阻塞 bridge 计划生成
- 所有路径都相对于 `projectRoot`
- 不会修改任何文件，只负责读取和计算
- Dispatch packet 的实际执行由 Codex Teams 宿主负责
- Feature state 仅作为编排上下文，不影响能力真源
