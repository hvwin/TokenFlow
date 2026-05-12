# 项目架构

## 1. 总体结构

```text
token-workflow-tools/
  core/
    executor.ts
    router/
    tokeneff/
    toolkit/
    openwolf/
    caveman/
  adapters/
    skill/
    mcp/
    hook/
    command/
    codex-teams/
    generic-ide/
  prey/
    sources/
    candidates/
  manifests/
  templates/
  scripts/
  docs/
  examples/
```

## 2. 分层职责

### 2.1 core

- 处理工具能力逻辑。
- 输出路由决策、预算决策、工具组合建议。
- 不依赖 Codex App、Claude Code 或其他 IDE。
- `executor.ts` 暴露 host-agnostic execution seam，供 MCP server/gateway 调用；候选家族外部算法仍按吸收门槛逐步接入。

### 2.2 adapters

- `skill`：生成 skill 入口和 SOP。
- `mcp`：生成或暴露 MCP server / tool schema。
- `hook`：生成 pre/post hook 适配器。
- `command`：生成显式命令入口。
- `codex-teams`：面向本项目的接入适配器。
- `generic-ide`：面向其他 IDE 的通用接入器。

### 2.3 manifests

- 记录工具能力声明。
- 记录宿主推荐接入方式。
- 记录候选家族与吸收状态。
- 冻结跨 adapter 共用的渲染约定。
- `family-rendering.json` 是家族文案、Hook 配置和 Command 配置的单一渲染真源。

### 2.4 templates

- skill 模板
- mcp tool schema 模板
- hook 模板
- command 模板

### 2.5 scripts

- 生成接入器
- 生成 manifest
- 校验解析结果
- 跑最小 smoke test
- TypeScript 构建、类型检查和 runtime seam 验证入口：`npm run verify`

### 2.6 prey

- 记录当前已确认的首批猎物清单。
- 记录每个工具的能力精华、吸收落点和状态。
- 记录哪些能力已经落入 core，哪些仍在待实现。
- 记录后续候选猎物与待判定能力源。
- 记录按能力家族归类的候选池。

### 2.7 新猎物接入链

1. 识别候选猎物。
2. 按能力家族归类。
3. 抽取能力精华。
4. 判定是否能稳定落到 `core`。
5. 记录到 `manifests`。
6. 生成对应 `adapters`。
7. 回写吸收状态和索引入口。

### 2.8 当前候选家族

- Prompt Compression 家族
- MCP Optimization 家族
- Skills / Caching 家族
- RTK singleton family

## 3. 接入策略

| 宿主能力 | 推荐接入 |
| --- | --- |
| 支持 MCP | `MCP` 优先 |
| 支持 Skill | `Skill + MCP` |
| 支持 Hook | `Hook + Command` |
| 仅支持提示词/模板 | `Command` 兜底 |
| 新猎物待判定 | 先进入 `prey/` 候选池，再做能力抽取 |

## 4. 推荐命名

- 仓库名：`token-workflow-tools`
- 产品名：`TokenFlow`
- 内部能力名：`Router`、`TokenEff`、`Toolkit`、`OpenWolf`、`Caveman`

## 5. 关键文件

- `core/capability-graph.json`
- `manifests/tooling-manifest.json`
- `manifests/adapter-matrix.json`
- `manifests/candidate-families.json`
- `manifests/family-rendering.json`
- `manifests/rendering-conventions.json`
- `core/executor.ts`
- `package.json`
- `tsconfig.json`
- `prey/prey-sources.json`
- `prey/source-capability-matrix.md`
- `prey/absorption-status.md`
- `templates/skill/*`
- `templates/mcp/*`
- `templates/hook/*`
- `templates/command/*`
