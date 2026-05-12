# 安装与宿主接入指南

本文档给出 TokenFlow 在 Codex 与其他 IDE / Agent 宿主中的推荐接入方式。

## 1. 准备项目

```powershell
git clone https://github.com/hvwin/TokenFlow.git
cd TokenFlow
npm install
.\scripts\Invoke-TokenFlowGeneration.ps1 -HostCapability "codex-app"
npm run verify
```

下文示例里的 `E:/path/to/TokenFlow` 请替换为你的实际克隆目录。

`npm run verify` 会执行：

- TypeScript typecheck
- TypeScript build
- Bridge 基础验证
- Runtime seam 验证
- MCP SDK stdio 工具发现与工具调用验证

## 2. Codex 推荐组合

Codex 的最佳组合是：

```text
Skill + MCP + Hook
```

分工如下：

| 接入形态 | 职责 | 当前入口 |
| --- | --- | --- |
| Skill | 语义触发、SOP、行为约束 | `examples/generated/skill/*/SKILL.md` |
| MCP | 真实工具调用、结构化结果 | `dist/adapters/mcp/sdk-server.js` |
| Hook | 前置/后置增强 | `examples/generated/hook/*.json` |
| Command | 显式兜底和审计入口 | `examples/generated/command/*.json` |

### 2.1 安装 Skill

把生成的 Skill 复制到 Codex skills 目录。示例：

```powershell
$repo = "E:\path\to\TokenFlow"
$codexSkillsRoot = "D:\AI\CodexHome\skills"

Copy-Item -Path "$repo\examples\generated\skill\*" -Destination $codexSkillsRoot -Recurse -Force
```

### 2.2 配置 MCP

Codex 的 MCP 配置应指向真实 MCP SDK stdio server：

```json
{
  "mcpServers": {
    "tokenflow": {
      "command": "node",
      "args": [
        "E:/path/to/TokenFlow/dist/adapters/mcp/sdk-server.js"
      ],
      "env": {
        "TOKENFLOW_PROJECT_ROOT": "E:/path/to/TokenFlow"
      }
    }
  }
}
```

`TOKENFLOW_PROJECT_ROOT` 用于确保宿主从任意工作目录启动 MCP server 时，TokenFlow 都能找到 `examples/generated/mcp` 和项目真源。

### 2.3 安装 Hook

如果当前 Codex 环境支持 hook，可复制生成的 hook 声明：

```powershell
$repo = "E:\path\to\TokenFlow"
$codexHooksRoot = "D:\AI\CodexHome\hooks"

Copy-Item -Path "$repo\examples\generated\hook\*.json" -Destination $codexHooksRoot -Force
```

如果宿主暂不支持 hook，使用 `Skill + MCP` 即可先跑通主链路。

### 2.4 Codex 验证

1. 重启或刷新 Codex MCP 配置。
2. 检查 MCP 工具列表，应出现：
   - `tokenflow-router`
   - `tokenflow-tokeneff`
   - `tokenflow-toolkit`
   - `tokenflow-openwolf`
   - `tokenflow-caveman`
3. 调用 `tokenflow-router`，输入：

```json
{
  "task": "route this coding task",
  "hostCapabilities": ["mcp", "skill", "hook"],
  "availableAdapters": ["mcp", "skill", "hook", "command"]
}
```

预期返回 `status: "ok"`，`moduleId: "router"`。

## 3. Claude Desktop / Cline

推荐组合：

```text
MCP
```

配置示例：

```json
{
  "mcpServers": {
    "tokenflow": {
      "command": "node",
      "args": [
        "E:/path/to/TokenFlow/dist/adapters/mcp/sdk-server.js"
      ],
      "env": {
        "TOKENFLOW_PROJECT_ROOT": "E:/path/to/TokenFlow"
      }
    }
  }
}
```

## 4. Cursor / Windsurf

推荐组合：

```text
MCP + Command
```

- MCP 负责主执行面。
- Command 作为显式入口和审计兜底。

MCP 配置同 Claude / Cline。Command 声明位于：

```text
examples/generated/command/
```

## 5. 通用 IDE / Agent

推荐组合：

```text
MCP 优先；无 MCP 时使用 Command；需要自定义宿主桥接时使用 Generic Bridge
```

Generic Bridge 当前是构建后的适配层入口，适合后续接 HTTP 或宿主专用协议：

```powershell
node dist/adapters/generic-ide/bridge.js --host-id my-ide --mcp-projection examples/generated/mcp/tool-schema-projection.json --port 3100
```

## 6. 当前边界

- 已完成真实 MCP SDK stdio 协议层。
- 已完成 5 个 TokenFlow tools 的工具发现和工具调用验证。
- 候选猎物家族仍是 `candidate`，外部算法尚未标为 `absorbed`。
- 生产部署前应增加具体宿主的端到端 smoke test。
