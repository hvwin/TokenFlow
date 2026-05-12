# adapters/hook

Hook 适配器负责把能力真源渲染成宿主可消费的 Hook 描述文件。

## 输入契约

- `manifests/tooling-manifest.json`：能力、调用入口和参数元数据。
- `manifests/adapter-matrix.json`：宿主 Hook 支持能力、阶段与限制。
- `manifests/rendering-conventions.json`：`stage` / `action_type` 共享口径。
- 上层传入的目标宿主上下文（如 host id、目标目录）。

## 输出契约

- 输出根目录由上层 orchestrator 提供（例如 `dist/hook/<host>/`）。
- 每个 hook 输出一个声明文件：`<hook-id>.json`。
- 文件结构来自模板：`templates/hook/hook.json.tmpl`。

## 渲染规则（骨架阶段）

1. 只定义 `when`、`actions`、`source` 的静态结构，不执行 Hook。
2. `actions` 只保留对 `mcp` / `skill` / `command` 的引用，不内联运行时实现。
3. 未满足宿主矩阵约束的 Hook 必须跳过并记录原因。

## Renderer 使用说明

### TypeScript API

```typescript
import { renderHook, renderAllHooks } from "./adapters/hook/render";

// 渲染单个 hook
const result = renderHook(
  {
    familyId: "prompt-compression",
    familyTitle: "Prompt Compression",
    hostCapability: "ide-agent",
    preferredCore: "tokeneff",
    status: "candidate",
    stage: "before",
    event: "before_prompt_send",
    actionType: "mcp_ref",
    actionRef: "tokenflow-tokeneff"
  },
  "templates/hook/hook.json.tmpl",
  "output/hook"
);

// 批量渲染所有 hooks
const results = renderAllHooks(
  "manifests",      // manifests 目录
  "templates",      // templates 目录
  "output/hook",    // 输出目录
  "ide-agent"       // 目标宿主能力
);
```

### CLI 测试

```bash
# 从 adapters/hook 目录运行
npx ts-node render.ts

# 或从项目根目录
npx ts-node adapters/hook/render.ts
```

### 输出示例

渲染后会在输出目录生成如下文件：

```
output/hook/
├── tokenflow-prompt-compression.json
├── tokenflow-mcp-optimization.json
├── tokenflow-skills-caching.json
└── tokenflow-rtk.json
```

每个 JSON 文件包含：
- `hook_id`: 唯一标识符
- `title_zh`: 中文标题
- `host`: 目标宿主能力
- `stage`: 执行阶段（before/after/around）
- `when`: 触发条件（event + conditions）
- `actions`: 动作列表（type + ref + input_map）
- `source`: 真源引用

### Hook 阶段说明

根据 `manifests/rendering-conventions.json`：

- **before**: 在目标操作之前执行（如 `before_prompt_send`）
- **after**: 在目标操作之后执行（如 `after_command_exec`）
- **around**: 包裹目标操作（如 `before_tool_schema_load`）

### Action 类型

- **mcp_ref**: 引用 MCP 工具
- **skill_ref**: 引用 Skill
- **command_ref**: 引用 Command

### 集成到生成流程

`render.ts` 可被上层 orchestrator（如 `scripts/Invoke-TokenFlowGeneration.ps1`）调用，也可作为独立模块在其他 TypeScript 工具链中复用。

### 扩展点

- **getHookConfig**: 为新 family 添加 hook 配置映射
- **renderHook**: 自定义单个 hook 的渲染逻辑
- **renderAllHooks**: 批量渲染的过滤和宿主适配策略
