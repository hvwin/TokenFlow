# generic-ide bridge

## 目标

`generic-ide` bridge 负责把同一套 TokenFlow truth 翻译成任意 IDE / agent host 可消费的桥接计划，不重写核心能力，不绑定单一宿主。

## 消费 truth

- `core/capability-graph.json`
- `manifests/tooling-manifest.json`
- `manifests/adapter-matrix.json`
- `manifests/rendering-conventions.json`

## 暴露入口

- `resolveGenericIdeBridge(request)`
  - 根据任务意图、宿主能力和可用 adapter 组合桥接计划。
- `renderGenericIdePayloads(plan)`
  - 将桥接计划渲染成宿主可消费的入口负载。
- `verifyGenericIdeTruth(inputs)`
  - 验证 truth 输入最小完整性。

## 与 skill / mcp / hook / command 的关系

- `skill`: 语义触发层，由 bridge 暴露为可选触发入口。
- `mcp`: 真实工具执行层，由 bridge 优先映射执行路径。
- `hook`: 宿主支持 pre/post 时，bridge 可加挂增强链。
- `command`: 显式入口与审计兜底，由 bridge 在弱宿主能力下回退使用。

## 边界

- 只消费 truth 并生成桥接计划，不在 adapter 内再定义能力真源。
- 不写宿主运行态目录（cache/session/sqlite/auth）。
- 不提前锁死宿主专属字段。

---

## Runtime 使用说明

### 基本用法

```typescript
import { createGenericIdeBridge } from "./bridge";

// 创建 bridge 实例
const bridge = createGenericIdeBridge("/path/to/token-workflow-tools");

// 构建请求
const request = {
  taskIntent: "优化 MCP 工具调用",
  hostCapabilities: ["mcp", "skill"],
  availableAdapters: ["mcp", "skill", "command"],
};

// 解析 bridge 计划
const plan = bridge.resolveGenericIdeBridge(request);
console.log("执行表面:", plan.executionSurface);
console.log("回退表面:", plan.fallbackSurface);
console.log("选中的适配器:", plan.selectedAdapters);

// 渲染 payloads
const payloads = bridge.renderGenericIdePayloads(plan);
for (const payload of payloads) {
  console.log(`[${payload.entry}] ${payload.adapter}: ${payload.summary}`);
}

// 验证 truth refs
const verification = bridge.verifyGenericIdeTruth(plan.truthRefs);
if (!verification.ok) {
  console.error("缺失的 truth refs:", verification.missing);
}
```

### Adapter 选择逻辑

Bridge runtime 会根据以下规则选择适配器：

1. **基于 host capabilities 匹配**：从 `adapter-matrix.json` 读取推荐适配器
2. **执行表面优先级**：`mcp` > `skill` > `command` > `hook`
3. **回退表面优先级**：`command` > `mcp` > `skill`
4. **自动回退**：如果没有匹配到任何适配器，使用 `availableAdapters` 中的第一个

### Payload 渲染规则

- **trigger phase**：仅当 `skill` 被选中时生成
- **execute phase**：为 `executionSurface` 生成
- **enhance phase**：仅当 `hook` 被选中时生成
- **fallback phase**：为 `fallbackSurface` 生成（如果与 `executionSurface` 不同）

### 验证流程

在执行前，建议先验证所有 truth refs 是否存在：

```typescript
const verification = bridge.verifyGenericIdeTruth([
  "core/capability-graph.json",
  "manifests/tooling-manifest.json",
  "manifests/adapter-matrix.json",
  "manifests/rendering-conventions.json",
]);

if (!verification.ok) {
  throw new Error(`缺失必要的 truth 文件: ${verification.missing.join(", ")}`);
}
```

### 集成示例

```typescript
// 完整的集成流程
async function executeWithBridge(taskIntent: string) {
  const bridge = createGenericIdeBridge(process.cwd());

  // 1. 构建请求
  const request = {
    taskIntent,
    hostCapabilities: ["mcp", "skill", "hook"],
    availableAdapters: ["mcp", "skill", "hook", "command"],
  };

  // 2. 解析计划
  const plan = bridge.resolveGenericIdeBridge(request);

  // 3. 验证 truth
  const verification = bridge.verifyGenericIdeTruth(plan.truthRefs);
  if (!verification.ok) {
    throw new Error(`Truth verification failed: ${verification.missing}`);
  }

  // 4. 渲染 payloads
  const payloads = bridge.renderGenericIdePayloads(plan);

  // 5. 执行 payloads（由宿主实现）
  for (const payload of payloads) {
    await executePayload(payload);
  }
}
```

### 注意事项

- Bridge runtime 是无状态的，每次调用都会重新读取 `adapter-matrix.json`
- 所有路径都相对于 `projectRoot`
- 不会修改任何文件，只负责读取和计算
- 宿主需要自行实现 payload 的实际执行逻辑
