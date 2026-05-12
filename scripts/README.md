# scripts

这里放生成和验证脚本：

- `Invoke-TokenFlowGeneration.ps1`
  - 从 `core/manifests/prey/templates` 真源生成最小可执行样例产物。
- `Invoke-TokenFlowValidation.ps1`
  - 校验真源 JSON、candidate family 对齐、模板约定与生成结果。
- `Invoke-TokenFlowSmokeTest.ps1`
  - 端到端执行生成、校验、TypeScript runtime 验证和产物完整性检查。
- `verify-runtime.ts`
  - 构建后验证 MCP server/gateway 是否能调用 `core/executor.ts` execution seam。
- `verify-mcp-sdk.ts`
  - 构建后通过 MCP SDK client + stdio transport 验证 `sdk-server.js` 的工具发现和工具调用。
- `verify-bridge-runtime.ts`
  - 构建后验证 generic-ide 与 codex-teams bridge runtime。

Node 验证入口：

```powershell
npm install
npm run verify
```

目标：

- 让 core、manifests 和 adapters 保持可生成、可校验、可回填。
- 默认把样例产物输出到 `examples/generated/`，方便回读与 smoke test。
- 把 typecheck、build 和 runtime seam 验证纳入生产前门禁。
