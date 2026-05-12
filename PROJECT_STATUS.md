# 项目状态

## 当前状态

- 仓库已初始化。
- 根级约束、需求、索引、架构说明已创建。
- 猎物层已作为可扩展真源生态纳入规划。
- `.codex-teams/features/tokenflow/` 已建立 feature 真源与任务图。
- `manifests/` 已落 `tooling-manifest.json`、`adapter-matrix.json`、`candidate-families.json`、`rendering-conventions.json`。
- `manifests/family-rendering.json` 已落地，作为 Skill 文案、Hook 配置和 Command 配置的单一渲染真源。
- `core/capability-graph.json` 已落地。
- `core/executor.ts` 已落地，MCP server/gateway 已接入 host-agnostic execution seam。
- `adapters/mcp`、`adapters/skill`、`adapters/hook`、`adapters/command`、`adapters/generic-ide`、`adapters/codex-teams` 已落骨架。
- `templates/skill`、`templates/mcp`、`templates/hook`、`templates/command` 已落最小模板。
- `scripts/Invoke-TokenFlowGeneration.ps1` 与 `scripts/Invoke-TokenFlowValidation.ps1` 已落地。
- `package.json`、`tsconfig.json`、`scripts/verify-runtime.ts` 与 `scripts/verify-mcp-sdk.ts` 已落地，`npm run verify` 覆盖 typecheck、build、bridge 基础验证、runtime seam 验证与真实 MCP SDK stdio 验证。
- `adapters/mcp/sdk-server.ts` 已落地，真实 MCP SDK stdio server 已接入 `core/executor.ts`。
- `examples/generated/` 已能生成 MCP projection、entry plan 与 skill/hook/command 样例产物。
- 当前处于“机器真源、接入骨架、生成校验链、TypeScript 构建链、core execution seam 与真实 MCP SDK stdio 协议层已齐，候选家族外部算法待按吸收门槛接入”的阶段。
- 当前候选池已扩展到 Prompt Compression、MCP Optimization、Skills / Caching、RTK 四个家族方向。

## 当前建议顺序

1. 按候选家族优先级推进首批吸收实验，优先 TokenEff 的 prompt compression 与 RTK 输出压缩链路。
2. 增加宿主级 smoke test，验证 Codex App / MCP 客户端实际发现和调用工具。
3. 按 promotion gates 同步 `prey/absorption-status.md`，不要跳过 candidate -> planned -> absorbing -> absorbed。

## 当前不要做

- 不要先做大而全 UI。
- 不要先锁死某一个宿主。
- 不要把首批工具拆成五套完全独立、不可复用的实现。
- 不要直接开始写宿主专属 glue code 而没有 core 真源。
