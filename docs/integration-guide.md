# 集成指南

本文档说明如何将 TokenFlow 生成的适配器产物接入不同的宿主环境。

> 当前接入边界：本指南覆盖构建后的目标集成形态。当前仓库具备生成/验证闭环、TypeScript 构建链、`core/executor.ts` execution seam 和真实 MCP SDK stdio server；MCP runtime 已能通过标准 MCP 协议返回结构化 core 执行结果。候选家族外部算法仍保持 `candidate`，尚未作为 absorbed 能力接入真实第三方压缩器或缓存服务。

## 宿主能力矩阵

TokenFlow 支持多种宿主接入方式，根据宿主能力自动选择最佳适配器组合：

| 宿主类型 | 宿主能力标识 | 推荐适配器 | 说明 |
|---------|-------------|-----------|------|
| MCP 原生客户端 | `mcp` | `mcp` | 直接消费 MCP tool schema，无需额外适配 |
| Codex App | `codex-app` | `skill`, `mcp`, `hook` | 支持 Skill 语义触发、MCP 工具调用、Hook 增强 |
| 通用 IDE Agent | `ide-agent` | `mcp`, `command` | 支持 MCP 工具和显式命令入口 |
| 仅支持提示词 | `prompt-only` | `command` | 仅支持命令式入口，无工具调用能力 |

## 快速开始

### 1. 生成适配器产物

```powershell
# 为目标宿主生成适配器
.\scripts\Invoke-TokenFlowGeneration.ps1 -HostCapability "codex-app" -OutputRoot "dist/codex"
```

### 2. 验证生成结果

```powershell
.\scripts\Invoke-TokenFlowValidation.ps1
npm install
npm run verify
```

### 3. 根据宿主类型选择集成方式

参考下面对应宿主的详细集成步骤。

---

## 集成到 Codex App

Codex App 支持 Skill、MCP、Hook 三种适配器，推荐全部启用以获得最佳体验。

### 集成 Skill 适配器

**目标**：让 Codex 能通过语义触发自动调用 TokenFlow 能力。

**步骤**：

1. **复制 Skill 文件到 Codex skills 目录**

```powershell
# 假设 Codex skills 目录为 D:\AI\CodexHome\skills
$codexSkillsRoot = "D:\AI\CodexHome\skills"
$generatedSkills = "examples\generated\skill"

Copy-Item -Path "$generatedSkills\prompt-compression" -Destination "$codexSkillsRoot\tokenflow-prompt-compression" -Recurse -Force
Copy-Item -Path "$generatedSkills\mcp-optimization" -Destination "$codexSkillsRoot\tokenflow-mcp-optimization" -Recurse -Force
Copy-Item -Path "$generatedSkills\skills-caching" -Destination "$codexSkillsRoot\tokenflow-skills-caching" -Recurse -Force
```

2. **验证 Skill 可被发现**

在 Codex App 中输入触发关键词，例如：

- "帮我压缩这个 prompt"（应触发 `tokenflow-prompt-compression`）
- "优化 MCP 工具表面"（应触发 `tokenflow-mcp-optimization`）
- "启用 skills caching"（应触发 `tokenflow-skills-caching`）

3. **检查 Skill 元数据**

每个 `SKILL.md` 的 frontmatter 应包含：

```yaml
---
name: tokenflow-prompt-compression
description: 用途：直接压缩 Prompt，降低上下文 token 成本...
---
```

### 集成 MCP 适配器

**目标**：让 Codex 能通过 MCP 协议调用 TokenFlow 工具。

**步骤**：

1. **启动 MCP Gateway**（参考 [运行时指南](runtime-guide.md)，先运行 `npm run build`）

```powershell
# 启动 gateway 模式（适合 IDE 宿主）
node dist/adapters/mcp/gateway.js --projection examples/generated/mcp/tool-schema-projection.json
```

2. **配置 Codex MCP 客户端**

在 Codex 配置文件中添加 TokenFlow MCP 服务：

```json
{
  "mcpServers": {
    "tokenflow": {
      "command": "node",
      "args": ["E:/AI/Skills-mcp-chajian/token-workflow-tools/dist/adapters/mcp/gateway.js"],
      "env": {
        "TOKENFLOW_PROJECTION": "E:/AI/Skills-mcp-chajian/token-workflow-tools/examples/generated/mcp/tool-schema-projection.json"
      }
    }
  }
}
```

3. **验证工具可用**

在 Codex App 中检查可用工具列表，应包含：

- `tokenflow-router`
- `tokenflow-tokeneff`
- `tokenflow-toolkit`
- `tokenflow-openwolf`
- `tokenflow-caveman`

### 集成 Hook 适配器

**目标**：在特定事件前后自动触发 TokenFlow 能力。

**步骤**：

1. **复制 Hook 声明到 Codex hooks 目录**

```powershell
$codexHooksRoot = "D:\AI\CodexHome\hooks"
$generatedHooks = "examples\generated\hook"

Copy-Item -Path "$generatedHooks\*.json" -Destination $codexHooksRoot -Force
```

2. **验证 Hook 配置**

检查 Hook JSON 结构：

```json
{
  "hook_id": "tokenflow-prompt-compression-hook",
  "title_zh": "TokenFlow Prompt Compression Hook",
  "host_id": "codex-app",
  "stage": "before",
  "enabled": true,
  "when": {
    "event": "before_prompt_send",
    "conditions": [
      "hostCapability == 'codex-app'",
      "familyStatus == 'ready'"
    ]
  },
  "actions": [
    {
      "type": "mcp_ref",
      "ref": "tokenflow-tokeneff",
      "input_map": {
        "capability_id": "tokeneff",
        "family_id": "prompt-compression"
      }
    }
  ]
}
```

3. **测试 Hook 触发**

- 发送一个长 prompt，观察是否自动触发压缩
- 检查 Codex 日志中的 Hook 执行记录

---

## 集成到 MCP 原生客户端

MCP 原生客户端（如 Claude Desktop、Cline）可直接消费 MCP tool schema。

### 集成步骤

1. **生成 MCP server 模式产物**

```powershell
.\scripts\Invoke-TokenFlowGeneration.ps1 -HostCapability "mcp" -OutputRoot "dist/mcp-server"
```

2. **启动 MCP Server**（参考 [运行时指南](runtime-guide.md)，先运行 `npm run build`）

```powershell
node dist/adapters/mcp/sdk-server.js
```

3. **配置 MCP 客户端**

在客户端配置文件中添加 TokenFlow MCP 服务：

**Claude Desktop (`claude_desktop_config.json`)**：

```json
{
  "mcpServers": {
    "tokenflow": {
      "command": "node",
      "args": [
        "E:/AI/Skills-mcp-chajian/token-workflow-tools/dist/adapters/mcp/sdk-server.js"
      ]
    }
  }
}
```

**Cline (`.cline/mcp_settings.json`)**：

```json
{
  "mcpServers": {
    "tokenflow": {
      "command": "node",
      "args": [
        "E:/AI/Skills-mcp-chajian/token-workflow-tools/dist/adapters/mcp/sdk-server.js"
      ]
    }
  }
}
```

4. **验证工具可用**

在客户端中检查工具列表，应包含所有 TokenFlow 工具。

---

## 集成到通用 IDE Agent

通用 IDE Agent（如 Cursor、Windsurf）通常支持 MCP 和 Command 两种方式。

### 方式 1：通过 MCP 集成

参考 [集成到 MCP 原生客户端](#集成到-mcp-原生客户端) 的步骤。

### 方式 2：通过 Command 集成

**目标**：提供显式命令入口，用户可手动调用。

**步骤**：

1. **生成 Command 适配器**

```powershell
.\scripts\Invoke-TokenFlowGeneration.ps1 -HostCapability "ide-agent" -OutputRoot "dist/ide"
```

2. **注册 Command 到 IDE**

根据 IDE 的命令注册机制，将 `dist/ide/command/*.json` 中的命令注册到 IDE。

**示例：Cursor 命令注册**

在 Cursor 配置中添加：

```json
{
  "commands": [
    {
      "id": "tokenflow.mcp-optimization",
      "title": "TokenFlow: MCP Optimization",
      "command": "tokenflow-mcp-optimization",
      "args": {
        "surface": "${input:toolSurface}",
        "mode": "gateway"
      }
    },
    {
      "id": "tokenflow.rtk",
      "title": "TokenFlow: RTK Command Compression",
      "command": "tokenflow-rtk",
      "args": {
        "profile": "default",
        "passthrough": false
      }
    }
  ]
}
```

3. **验证命令可用**

在 IDE 命令面板中搜索 "TokenFlow"，应显示所有注册的命令。

---

## 集成到仅支持提示词的环境

对于不支持工具调用的环境，可通过 Command 适配器提供命令式入口。

### 集成步骤

1. **生成 Command 适配器**

```powershell
.\scripts\Invoke-TokenFlowGeneration.ps1 -HostCapability "prompt-only" -OutputRoot "dist/prompt"
```

2. **将 Command 转换为提示词模板**

从 `dist/prompt/command/*.json` 提取命令信息，生成提示词模板：

```markdown
# TokenFlow MCP Optimization

**用途**：缩小工具暴露面、减少 schema 开销。

**使用方式**：

请执行 TokenFlow MCP Optimization，参数如下：
- surface: [工具表面名称]
- mode: [server 或 gateway]

**示例**：

请执行 TokenFlow MCP Optimization，参数如下：
- surface: my-toolset
- mode: gateway
```

3. **在对话中使用**

直接在对话中粘贴提示词模板，填入参数后发送。

---

## 使用 Bridge 适配器

Bridge 适配器用于在宿主和 TokenFlow 核心之间建立桥接层，处理上下文转换和状态同步。

### Generic IDE Bridge

**适用场景**：通用 IDE 需要访问 TokenFlow 能力，但不直接支持 MCP 或 Skill。

**集成步骤**：

1. **启动 Generic Bridge**（参考 [运行时指南](runtime-guide.md)）

```powershell
node adapters/generic-ide/bridge.js --host-id "my-ide" --mcp-projection examples/generated/mcp/tool-schema-projection.json
```

2. **配置 IDE 连接到 Bridge**

Bridge 默认监听 `http://localhost:3100`，IDE 通过 HTTP API 调用 TokenFlow 能力。

3. **API 示例**

```bash
# 调用 Router
curl -X POST http://localhost:3100/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "tokenflow-router",
    "input": {
      "task": "analyze code",
      "hostCapabilities": ["mcp", "skill"]
    }
  }'
```

### Codex Teams Bridge

**适用场景**：在 Codex Teams 多代理协作场景中使用 TokenFlow。

**集成步骤**：

1. **启动 Codex Teams Bridge**（参考 [运行时指南](runtime-guide.md)）

```powershell
node adapters/codex-teams/bridge.js --feature-state .codex-teams/features/tokenflow/status.md
```

2. **在 Teams 配置中引用 TokenFlow**

在 `.codex-teams/features/tokenflow/agents/*.md` 中引用 TokenFlow 工具：

```yaml
---
role: optimizer
capabilities:
  - tokenflow-tokeneff
  - tokenflow-toolkit
---
```

3. **验证 Bridge 可用**

检查 Teams 日志，确认 Bridge 成功加载并暴露工具。

---

## 验证集成

### 检查清单

- [ ] 适配器产物已生成且无模板变量残留
- [ ] 适配器文件已复制到宿主对应目录
- [ ] 宿主配置已更新（如需要）
- [ ] 运行时服务已启动（如需要）
- [ ] 工具/命令/Skill 在宿主中可被发现
- [ ] 触发测试通过（语义触发或显式调用）
- [ ] 日志中无错误或警告

### 测试用例

#### 测试 Skill 触发

在 Codex App 中输入：

```
帮我压缩这个超长的 prompt，保持语义不变
```

预期：自动触发 `tokenflow-prompt-compression` Skill。

#### 测试 MCP 工具调用

在 MCP 客户端中调用：

```json
{
  "tool": "tokenflow-router",
  "input": {
    "task": "code review",
    "hostCapabilities": ["mcp", "skill", "hook"]
  }
}
```

预期：返回路由决策，包含推荐的角色、模型、工具组合。

#### 测试 Hook 触发

在 Codex App 中发送一个长 prompt（>4000 tokens）。

预期：`tokenflow-prompt-compression-hook` 自动触发，压缩 prompt 后再发送。

#### 测试 Command 调用

在 IDE 命令面板中执行 "TokenFlow: MCP Optimization"。

预期：弹出参数输入框，填入后执行工具表面优化。

---

## 故障排查

### Skill 无法被触发

**可能原因**：

1. Skill 文件未放在正确的目录
2. Skill frontmatter 缺少 `name` 或 `description`
3. 触发关键词不匹配

**解决方法**：

1. 检查 Skill 目录路径是否正确
2. 检查 `SKILL.md` frontmatter 格式
3. 尝试使用 Skill 名称显式触发：`$tokenflow-prompt-compression`

### MCP 工具无法调用

**可能原因**：

1. MCP server/gateway 未启动
2. 宿主配置中的路径错误
3. tool schema 格式错误

**解决方法**：

1. 检查 MCP 服务进程是否运行
2. 检查宿主配置中的 `command` 和 `args` 路径
3. 运行 `.\scripts\Invoke-TokenFlowValidation.ps1` 验证 schema

### Hook 未触发

**可能原因**：

1. Hook 文件未放在正确的目录
2. Hook 条件不满足
3. Hook 事件名称不匹配宿主支持的事件

**解决方法**：

1. 检查 Hook 目录路径
2. 检查 Hook JSON 中的 `when.conditions`
3. 查阅宿主文档确认支持的事件名称

### Command 无法执行

**可能原因**：

1. Command 未注册到宿主
2. Command 参数类型不匹配
3. Command 引用的工具不可用

**解决方法**：

1. 检查宿主命令注册配置
2. 检查 Command JSON 中的 `arguments` 定义
3. 确认 `entry_ref` 指向的工具或命令存在

---

## 下一步

- [运行时指南](runtime-guide.md)：了解如何启动和配置运行时服务
- [生成指南](generation-guide.md)：了解如何自定义生成配置
- [项目架构](../PROJECT_DETAILS.md)：深入了解架构设计
