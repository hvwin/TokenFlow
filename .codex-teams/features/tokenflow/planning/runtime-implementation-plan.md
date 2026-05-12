# TokenFlow 满血成品推进计划

## 当前状态
- ✅ 骨架已齐：core、manifests、adapters、templates、bridges
- ✅ 最小生成/校验闭环已通：scripts + examples/generated
- ✅ MCP projection/runtime 类型层已落地
- ⚠️ 缺口：真实 runtime 调度、smoke test、文档补全

## 剩余任务拆分（可并行）

### T1: MCP Runtime 实装 (adapters/mcp)
**Owner**: worker-mcp-runtime
**Write Scope**: adapters/mcp/server.ts, adapters/mcp/gateway.ts, adapters/mcp/loader.ts
**Goal**: 
- 实现 server/gateway 的真实调度入口
- 实现从 projection JSON 加载并路由到 core 模块的最小 loader
- 补 adapters/mcp/README.md 的 runtime 使用说明

### T2: Renderer 实装 (adapters/skill, hook, command)
**Owner**: worker-renderers-runtime
**Write Scope**: adapters/skill/render.ts, adapters/hook/render.ts, adapters/command/render.ts
**Goal**:
- 实现从 manifests 读取并渲染 skill/hook/command 的最小 renderer
- 可选：把 renderer 逻辑从 scripts 抽到 adapters 内部复用
- 补各 adapter README 的 renderer 使用说明

### T3: Bridge Runtime 实装 (adapters/generic-ide, codex-teams)
**Owner**: worker-bridge-runtime
**Write Scope**: adapters/generic-ide/bridge.ts, adapters/codex-teams/bridge.ts
**Goal**:
- 实现 generic-ide 和 codex-teams 的最小 bridge runtime
- 实现从 host request 到 adapter selection 的路由逻辑
- 补 bridge README 的使用说明

### T4: Smoke Test 补全 (scripts, examples)
**Owner**: worker-smoke-test
**Write Scope**: scripts/Invoke-TokenFlowSmokeTest.ps1, examples/smoke-test/
**Goal**:
- 补 smoke test 脚本，覆盖 generation -> validation -> runtime load
- 生成 smoke test 样例输出到 examples/smoke-test/
- 验证 MCP projection 可被 runtime 正确加载

### T5: 文档补全 (docs, README)
**Owner**: worker-docs
**Write Scope**: docs/generation-guide.md, docs/integration-guide.md, docs/runtime-guide.md, README.md
**Goal**:
- 补 generation-guide：如何用 scripts 生成产物
- 补 integration-guide：如何接入不同宿主
- 补 runtime-guide：如何启动 MCP server/gateway
- 更新 README.md 为满血成品口径

## 并行策略
- T1/T2/T3 可完全并行（写入域不重叠）
- T4 依赖 T1/T2/T3 的 runtime 入口，但可先写骨架
- T5 可与 T1-T4 并行，最后根据实际产物微调

## 验证门槛
- 所有 TS 文件可被 tsc --noEmit 通过（类型检查）
- smoke test 脚本可顺序执行 generation -> validation -> runtime load
- 文档中的示例命令可实际运行
