# 项目需求

## 1. 项目目标

把 `TokenFlow` 做成一套可复用的 token 感知闭合工具生态，让不同宿主可以按自己的能力自动选择最佳接入形式，同时持续吞噬新猎物能力源。

## 2. 成功标准

- 能表达首批工具与后续猎物的统一能力模型。
- 能按宿主生成 `Skill`、`MCP`、`Hook`、`Command` 适配器。
- 能输出宿主推荐接入矩阵。
- 能被 Codex App 和其他 IDE / 智能体复用。
- 能做最小验证，确认生成结果可解析、可发现、可调用。
- 能维护 `prey/` 猎物层，明确首批工具与后续猎物的能力精华、映射和吸收状态。
- 能为新猎物建立统一的入库、判定、映射、吸收和回灌流程。

## 3. 核心能力

| 工具 | 主要职责 |
| --- | --- |
| `Router` | 任务路由、角色路由、模型路由、工具路由 |
| `TokenEff` | token 预算、上下文压缩、重路由建议 |
| `Toolkit` | 为单任务组合最小工具包 |
| `OpenWolf` | 高信号侦察、选择性摄入、提案前摸底 |
| `Caveman` | 低上下文窄边界执行、验证、修复 |

## 4. 猎物口径

### 4.1 当前候选家族

| 家族 | 代表猎物 | 主要价值 | 预期落点 |
| --- | --- | --- | --- |
| Prompt Compression | `LLMLingua`、`prompt_compressor`、`TokenCrush`、`PCToolkit`、`PromptOptimizer` | 直接压缩 Prompt，降低上下文 Token 成本 | `core/tokeneff` |
| MCP Optimization | `Dynamic Toolsets`、`Unlock Pattern`、`Code Execution MCP`、`Claude Code Skills`、`Bifrost MCP Gateway` | 缩小工具表面、减少 Schema 与调用开销 | `core/toolkit`、`adapters/mcp` |
| Skills / Caching | `Claude Skills`、`Prompt Caching`、`Semantic Caching`、`GPTCache` | 复用 SOP、前缀缓存、语义复用 | `adapters/skill`、`core/tokeneff` |
| RTK | `rtk-ai/rtk` | 命令输出压缩、上下文裁剪、hook 注入 | `core/tokeneff`、`adapters/hook`、`adapters/command` |

### 4.2 口径原则

- 先按能力家族入池，再按单个工具拆解。
- 先判定是否能稳定落到 `core`，再决定是否生成适配器。
- 只把有明确吸收价值的猎物写进正式真源，其他先放候选池。

## 5. 范围

### 5.1 必做

- 核心能力真源设计
- 接入适配器规范
- 宿主接入推荐矩阵
- 生成模板
- 最小验证脚本
- 文档索引和状态文档

### 5.2 暂不纳入

- 远程常驻云运行时
- 单一宿主私有绑定
- 复杂 UI 壳
- 与工具目标无关的通用 agent 平台化扩张
- 任何未完成能力判定就直接写入 core 的新猎物

## 6. 推荐落地方式

- `core` 先独立成稳定能力层。
- `manifests` 同步承载机器可读真源和吸收状态。
- `rendering-conventions` 同步冻结跨 adapter 的共享枚举与路径口径。
- `mcp` 作为第一优先真实执行层。
- `skill` 作为语义触发与 SOP 层。
- `hook` 作为宿主增强层。
- `command` 作为兜底和审计入口。
- 新猎物先过能力判定，再进入 core 和适配器链路。

## 7. 交付物

- `PROJECT_DETAILS.md` 中定义的目录骨架
- 每个工具的能力说明
- 宿主接入矩阵
- 适配器模板
- bridge 骨架与共享渲染约定
- 最小可验证的生成结果
- `prey/` 猎物清单、能力映射、吸收状态和索引
