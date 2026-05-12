# adapters/command

Command 适配器负责把能力真源渲染成显式命令入口描述。

## 输入契约

- `manifests/tooling-manifest.json`：命令可映射能力、参数和示例。
- `manifests/adapter-matrix.json`：宿主命令体系支持情况。
- `manifests/rendering-conventions.json`：`entry_kind` 等共享口径。
- 上层传入的命名空间、输出目录与冲突策略。

## 输出契约

- 输出根目录由上层 orchestrator 提供（例如 `dist/command/<host>/`）。
- 每个 command 输出一个描述文件：`<command-id>.json`。
- 文件结构来自模板：`templates/command/command.json.tmpl`。

## 渲染规则（骨架阶段）

1. 只渲染命令元数据与调用映射，不写可执行逻辑。
2. 命令 ID 在目标宿主内必须唯一，冲突由上层策略处理。
3. 参数定义优先结构化字段，不拼接脚本片段。

## Renderer 使用说明

### TypeScript API

```typescript
import { renderCommand, renderAllCommands } from "./adapters/command/render";

// 渲染单个 command
const result = renderCommand(
  {
    familyId: "rtk",
    familyTitle: "RTK",
    hostCapability: "ide-agent",
    preferredCore: "tokeneff",
    entryKind: "command_ref",
    entryRef: "rtk-ai/rtk",
    arguments: [
      {
        name: "profile",
        type: "string",
        required: false,
        description_zh: "压缩策略或 profile 名称。"
      }
    ]
  },
  "templates/command/command.json.tmpl",
  "output/command"
);

// 批量渲染所有 commands
const results = renderAllCommands(
  "manifests",      // manifests 目录
  "templates",      // templates 目录
  "output/command", // 输出目录
  "ide-agent"       // 目标宿主能力
);
```

### CLI 测试

```bash
# 从 adapters/command 目录运行
npx ts-node render.ts

# 或从项目根目录
npx ts-node adapters/command/render.ts
```

### 输出示例

渲染后会在输出目录生成如下文件：

```
output/command/
├── tokenflow-mcp-optimization.json
└── tokenflow-rtk.json
```

每个 JSON 文件包含：
- `command_id`: 唯一标识符
- `title_zh`: 中文标题
- `host`: 目标宿主能力
- `entry`: 入口定义（kind + ref）
- `arguments`: 参数列表（name, type, required, description_zh）
- `capabilities`: 关联的核心能力 ID
- `source`: 真源引用

### Entry Kind 说明

根据 `manifests/rendering-conventions.json`：

- **mcp_tool**: 直接调用 MCP 工具
- **command_ref**: 引用外部命令（如 `rtk-ai/rtk`）
- **script_ref**: 引用脚本文件
- **prompt_ref**: 引用 prompt 模板

### 参数类型

支持的参数类型：
- `string`: 字符串
- `number`: 数值
- `boolean`: 布尔值
- `array`: 数组
- `object`: 对象

### 集成到生成流程

`render.ts` 可被上层 orchestrator（如 `scripts/Invoke-TokenFlowGeneration.ps1`）调用，也可作为独立模块在其他 TypeScript 工具链中复用。

### 扩展点

- **getCommandConfig**: 为新 family 添加 command 配置映射
- **renderCommand**: 自定义单个 command 的渲染逻辑
- **renderAllCommands**: 批量渲染的过滤和命名空间策略
- **CommandArgument**: 扩展参数类型和验证规则
