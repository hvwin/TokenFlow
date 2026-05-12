# 生成指南

本文档说明如何使用 `scripts/` 下的生成器从能力真源生成各类适配器产物。

## 快速开始

### 生成所有适配器产物

```powershell
# 在项目根目录执行
.\scripts\Invoke-TokenFlowGeneration.ps1
```

默认输出到 `examples/generated/`，包含：

- `mcp/tool-schema-projection.json`：MCP 工具 schema 投影
- `mcp/server-entry.json`：MCP server 入口计划
- `mcp/gateway-entry.json`：MCP gateway 入口计划
- `mcp/tools/*.json`：每个核心模块的 MCP tool schema
- `skill/*/SKILL.md`：Skill 适配器骨架
- `hook/*.json`：Hook 适配器声明
- `command/*.json`：Command 适配器声明
- `summary.json`：生成摘要与路径索引

### 指定输出目录

```powershell
.\scripts\Invoke-TokenFlowGeneration.ps1 -OutputRoot "dist/my-output"
```

### 指定宿主能力

```powershell
# 为 MCP 原生宿主生成
.\scripts\Invoke-TokenFlowGeneration.ps1 -HostCapability "mcp"

# 为通用 IDE agent 生成
.\scripts\Invoke-TokenFlowGeneration.ps1 -HostCapability "ide-agent"

# 为 Codex App 生成
.\scripts\Invoke-TokenFlowGeneration.ps1 -HostCapability "codex-app"
```

### 清理后重新生成

```powershell
.\scripts\Invoke-TokenFlowGeneration.ps1 -Clean
```

## 生成器参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `-OutputRoot` | string | `examples/generated` | 输出根目录 |
| `-HostCapability` | string | `ide-agent` | 宿主能力标识，影响推荐适配器选择 |
| `-FeatureSlug` | string | `tokenflow` | 特性标识，用于路径和命名 |
| `-Clean` | switch | false | 生成前清理输出目录 |

## 生成流程

生成器按以下顺序工作：

1. **读取能力真源**
   - `core/capability-graph.json`：核心模块定义
   - `manifests/tooling-manifest.json`：工具元数据
   - `manifests/adapter-matrix.json`：宿主适配矩阵
   - `manifests/candidate-families.json`：候选家族定义
   - `manifests/rendering-conventions.json`：渲染约定
   - `prey/prey-sources.json`：猎物源注册表

2. **生成 MCP 适配器**
   - 为每个 `core.modules` 条目生成 MCP tool schema
   - 根据 `HostCapability` 决定 `preferredEntryShape`（server 或 gateway）
   - 生成 `tool-schema-projection.json` 汇总所有工具
   - 生成 `server-entry.json` 和 `gateway-entry.json` 入口计划

3. **生成 Skill 适配器**
   - 遍历 `candidate-families.json` 中 `preferredAdapters` 包含 `skill` 的家族
   - 使用 `templates/skill/SKILL.md.tmpl` 模板
   - 为每个家族生成独立的 `SKILL.md` 文件

4. **生成 Hook 适配器**
   - 遍历 `candidate-families.json` 中 `preferredAdapters` 包含 `hook` 的家族
   - 使用 `templates/hook/hook.json.tmpl` 模板
   - 生成 hook 声明 JSON，包含触发条件和动作

5. **生成 Command 适配器**
   - 遍历 `candidate-families.json` 中 `preferredAdapters` 包含 `command` 的家族
   - 使用 `templates/command/command.json.tmpl` 模板
   - 生成 command 声明 JSON，包含参数和能力引用

6. **生成摘要**
   - 汇总所有生成的产物路径
   - 记录宿主能力、推荐适配器、生成时间等元数据
   - 输出 `summary.json`

## 模板变量

### MCP Tool Schema 模板变量

| 变量 | 来源 | 示例 |
|------|------|------|
| `{{tool_id}}` | `tokenflow-{module.id}` | `tokenflow-router` |
| `{{title_zh}}` | `prey-sources.json` 中的 title | `Router` |
| `{{description_zh}}` | 根据 module.outputs 生成 | `Router 能力入口。职责: route, decide, recommend。` |
| `{{entry_shape}}` | 根据 HostCapability 决定 | `server` 或 `gateway` |
| `{{capabilities_json}}` | `[module.id]` | `["router"]` |
| `{{input_properties_json}}` | 根据 module.inputs 生成 | JSON schema properties |
| `{{required_args_json}}` | `module.inputs` | `["task", "hostCapabilities"]` |

### Skill 模板变量

| 变量 | 来源 | 示例 |
|------|------|------|
| `{{skill_name}}` | `tokenflow-{family.id}` | `tokenflow-prompt-compression` |
| `{{skill_description_zh}}` | 家族用途+触发词+边界 | `用途：直接压缩 Prompt...` |
| `{{skill_title_zh}}` | `TokenFlow {family.title} Skill` | `TokenFlow Prompt Compression Skill` |
| `{{purpose_zh}}` | 家族用途说明 | `直接压缩 Prompt，降低上下文 token 成本...` |
| `{{trigger_keywords_zh}}` | 家族触发关键词 | `Prompt Compression、TokenFlow、LLMLingua` |
| `{{boundaries_zh}}` | 家族边界说明 | `只渲染接入骨架，不直接执行压缩器...` |
| `{{capability_ids_csv}}` | `family.preferredCore` | `tokeneff` |
| `{{tool_ids_csv}}` | `family.preferredAdapters` | `skill, hook` |

### Hook 模板变量

| 变量 | 来源 | 示例 |
|------|------|------|
| `{{hook_id}}` | `tokenflow-{family.id}-hook` | `tokenflow-prompt-compression-hook` |
| `{{title_zh}}` | `TokenFlow {family.title} Hook` | `TokenFlow Prompt Compression Hook` |
| `{{host_id}}` | 参数 HostCapability | `ide-agent` |
| `{{stage}}` | 家族定义 | `before` / `after` / `around` |
| `{{enabled_json}}` | 固定 | `true` |
| `{{event_name}}` | 家族定义 | `before_prompt_send` |
| `{{conditions_json}}` | 宿主能力+家族状态 | `["hostCapability == 'ide-agent'", ...]` |
| `{{actions_json}}` | 家族定义的动作类型和引用 | `[{"type": "mcp_ref", "ref": "tokenflow-tokeneff", ...}]` |

### Command 模板变量

| 变量 | 来源 | 示例 |
|------|------|------|
| `{{command_id}}` | `tokenflow-{family.id}` | `tokenflow-mcp-optimization` |
| `{{title_zh}}` | `TokenFlow {family.title} Command` | `TokenFlow MCP Optimization Command` |
| `{{host_id}}` | 参数 HostCapability | `ide-agent` |
| `{{entry_kind}}` | 家族定义 | `mcp_tool` / `command_ref` / `prompt_ref` |
| `{{entry_ref}}` | 家族定义 | `tokenflow-toolkit` |
| `{{arguments_json}}` | 家族定义的参数列表 | `[{"name": "surface", "type": "string", ...}]` |
| `{{capabilities_json}}` | `[family.preferredCore]` | `["toolkit"]` |

## 输出结构

```text
examples/generated/
├── summary.json                          # 生成摘要
├── mcp/
│   ├── tool-schema-projection.json       # MCP 工具投影汇总
│   ├── server-entry.json                 # MCP server 入口计划
│   ├── gateway-entry.json                # MCP gateway 入口计划
│   └── tools/
│       ├── tokenflow-router.json         # Router MCP tool schema
│       ├── tokenflow-tokeneff.json       # TokenEff MCP tool schema
│       ├── tokenflow-toolkit.json        # Toolkit MCP tool schema
│       ├── tokenflow-openwolf.json       # OpenWolf MCP tool schema
│       └── tokenflow-caveman.json        # Caveman MCP tool schema
├── skill/
│   ├── prompt-compression/
│   │   └── SKILL.md                      # Prompt Compression Skill
│   ├── mcp-optimization/
│   │   └── SKILL.md                      # MCP Optimization Skill
│   └── skills-caching/
│       └── SKILL.md                      # Skills Caching Skill
├── hook/
│   ├── tokenflow-prompt-compression.json # Prompt Compression Hook
│   ├── tokenflow-skills-caching.json     # Skills Caching Hook
│   └── tokenflow-rtk.json                # RTK Hook
└── command/
    ├── tokenflow-mcp-optimization.json   # MCP Optimization Command
    └── tokenflow-rtk.json                # RTK Command
```

## 验证生成结果

生成后立即验证：

```powershell
.\scripts\Invoke-TokenFlowValidation.ps1
```

验证内容包括：

- JSON 真源完整性和一致性
- 候选家族 ID 对齐
- 模板引用完整性
- 生成产物数量正确性
- 生成产物结构正确性
- 模板变量完全替换（无残留 `{{...}}`）

验证通过输出：

```json
{
  "jsonTruth": "passed",
  "familyAlignment": "passed",
  "templateAlignment": "passed",
  "generatedArtifacts": "passed"
}
```

## 常见问题

### 生成的文件还有 `{{variable}}` 占位符

**原因**：模板变量未完全替换。

**解决**：
1. 检查 `manifests/family-rendering.json` 是否为该家族提供了所有必需变量
2. 检查模板文件中的变量名是否与生成器中的 `$Variables` 哈希表键名一致
3. 运行验证脚本会自动检测此问题

### 生成的 Skill/Hook/Command 数量不符合预期

**原因**：`candidate-families.json` 中的 `preferredAdapters` 配置与预期不符。

**解决**：
1. 检查 `manifests/candidate-families.json` 中每个家族的 `preferredAdapters` 数组
2. 确认该家族是否应该生成对应类型的适配器
3. 运行验证脚本会自动检测数量不一致

### MCP tool schema 缺少某些字段

**原因**：`Get-InputPropertySpec` 函数未覆盖该输入字段类型。

**解决**：
1. 在生成器的 `Get-InputPropertySpec` 函数中添加该字段的类型定义
2. 重新生成

### 生成器找不到某个模块的源信息

**原因**：`prey/prey-sources.json` 中缺少该模块的映射。

**解决**：
1. 检查 `Get-ModuleSource` 函数中的 `$map` 是否包含该模块 ID
2. 检查 `prey/prey-sources.json` 中是否有对应的源记录
3. 确保 ID 归一化逻辑一致

## 扩展生成器

### 添加新的候选家族

1. 在 `manifests/candidate-families.json` 中添加家族定义
2. 在 `manifests/family-rendering.json` 中添加该家族的文案和配置
3. 重新生成并验证

### 添加新的宿主能力

1. 在 `manifests/adapter-matrix.json` 的 `hostMatrix` 中添加新宿主
2. 指定该宿主的 `recommendedAdapters`
3. 使用 `-HostCapability` 参数生成

### 自定义模板

1. 修改 `templates/` 下的对应模板文件
2. 确保模板变量与生成器中的 `$Variables` 哈希表一致
3. 重新生成并验证

## 下一步

- [集成指南](integration-guide.md)：如何将生成的产物接入不同宿主
- [运行时指南](runtime-guide.md)：如何启动 MCP server/gateway 和 bridge
- [项目架构](../PROJECT_DETAILS.md)：了解整体架构设计
