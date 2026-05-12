# worker-bridges evidence packet (T006)

## 目标

- 在限定写入域内完成 IDE / agent bridge 骨架。
- 为 `adapters/generic-ide` 与 `adapters/codex-teams` 提供清晰接口边界。
- 明确 bridge 消费 truth、暴露入口，以及与 `skill/mcp/hook/command` 的关系。

## 读取文件

- `AGENTS.md`（根约束）
- `adapters/README.md`
- `manifests/README.md`
- `manifests/adapter-matrix.json`
- `manifests/tooling-manifest.json`
- `core/capability-graph.json`
- `.codex-teams/features/tokenflow/requirements.md`
- `.codex-teams/features/tokenflow/design.md`
- `.codex-teams/features/tokenflow/tasks.md`
- `PROJECT_DETAILS.md`
- `PROJECT_REQUIREMENTS.md`
- `PROJECT_INDEX.md`
- `PROJECT_STATUS.md`

## 改动

### 1) `adapters/generic-ide/*`

- 新增 `README.md`
  - 定义 bridge 目标、truth 输入、入口函数、adapter 关系与边界。
- 新增 `bridge.manifest.json`
  - 提供机器可读 bridge 声明：`consumesTruth`、`exports`、`relations`。
- 新增 `contracts.ts`
  - 提供最小接口骨架：`request/plan/payload/api` 类型定义。

### 2) `adapters/codex-teams/*`

- 新增 `README.md`
  - 定义 bridge 目标、truth + feature context 输入、入口函数、adapter 关系与边界。
- 新增 `bridge.manifest.json`
  - 提供机器可读 bridge 声明：`consumesTruth`、`consumesContext`、`exports`、`relations`。
- 新增 `contracts.ts`
  - 提供最小接口骨架：`request/plan/dispatch/api` 类型定义。

## 验证

- 目录与文件存在性：已确认 `adapters/generic-ide`、`adapters/codex-teams` 及其 6 个骨架文件存在。
- JSON 可解析性：`bridge.manifest.json`（generic-ide、codex-teams）通过 `ConvertFrom-Json` 解析。
- 写入范围检查：仅修改以下路径：
  - `adapters/generic-ide/*`
  - `adapters/codex-teams/*`
  - `.codex-teams/features/tokenflow/agents/worker-bridges.md`

## 剩余风险

- 当前仅为接口骨架，未与 `adapters/mcp|skill|hook|command` 做真实联调（待其他 worker 产物收敛后集成）。
- `contracts.ts` 仅类型声明，尚未提供运行时实现与统一测试入口。
- `consumesContext` 采用 `<feature>` 占位符路径，后续需要由协调者在集成阶段绑定具体解析策略。
