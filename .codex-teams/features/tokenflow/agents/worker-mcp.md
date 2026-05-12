# worker-mcp 证据包（T004）

## 目标

- 按 T004 落地 TokenFlow 的 MCP 运行层骨架。
- 保持克制：仅提供可扩展结构，不实现完整 MCP runtime。
- 保持宿主无关：不锁死到单一 IDE 或单一 agent host。

## 读取文件

- `adapters/README.md`
- `manifests/README.md`
- `manifests/adapter-matrix.json`
- `manifests/tooling-manifest.json`
- `.codex-teams/features/tokenflow/tasks.md`
- `.codex-teams/features/tokenflow/state.json`
- `.codex-teams/features/tokenflow/design.md`
- `.codex-teams/features/tokenflow/requirements.md`
- `PROJECT_DETAILS.md`

## 改动

### 1) 新增 `adapters/mcp/README.md`

- 说明 MCP 适配层职责与骨架目标。
- 明确 truth consumption 来源（core/manifests）。
- 明确渲染边界（只渲染，不重定义真源）。

### 2) 新增 `adapters/mcp/runtime-surface.json`

- 机器可读声明，表达：
  - `mcp` 为 primary execution surface。
  - `server` / `gateway` 双入口形态均为 scaffold。
  - tool surface 来源于 `core/capability-graph.json` 与各 manifests。
  - in-scope / out-of-scope 的渲染边界。

### 3) 新增 `adapters/mcp/index.ts`

- 提供最小代码骨架：
  - `McpRuntimePlan` 类型定义。
  - `MCP_RUNTIME_PLAN` 常量（与 runtime-surface 声明对齐）。
  - `getMcpRuntimePlan()` 作为后续入口。

## 验证

已执行：

1. JSON 解析验证
   - `ConvertFrom-Json adapters/mcp/runtime-surface.json`：通过
2. 路径存在性验证
   - `adapters/mcp/README.md`：存在
   - `adapters/mcp/runtime-surface.json`：存在
   - `adapters/mcp/index.ts`：存在
3. 一致性回读
   - 回读 `runtime-surface.json` 与 `index.ts`，确认 `server/gateway`、truth paths、boundary 一致。

## 剩余风险

- 当前仅为结构骨架，尚未实现真实 MCP server/gateway 执行入口。
- `index.ts` 尚未接入构建体系（仓库当前未暴露 tsconfig / package 清单）。
- 如果后续要严格对齐 manifests 的 schema 校验，可能需要新增集中校验脚本（应由后续任务处理）。

## 越界建议（仅建议，不修改）

- 若后续需要统一跨 adapter 的机器校验，建议在 `scripts/` 增加 adapter schema smoke check。
- 当前无需修改 `manifests/*`；现有 `adapter-matrix` 已能支撑 T004 骨架语义。
