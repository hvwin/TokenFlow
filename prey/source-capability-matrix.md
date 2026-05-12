# 能力映射矩阵

| 猎物 | 能力精华 | core 落点 | 优先适配器 | 当前状态 |
| --- | --- | --- | --- | --- |
| `Router` | 路由、分派、模型/技能/宿主选择 | `core/router` | `MCP` | `planned` |
| `TokenEff` | token 预算、压缩、告警、重路由 | `core/tokeneff` | `MCP` + `Hook` | `planned` |
| `Toolkit` | 最小工具包组合、任务级编排 | `core/toolkit` | `MCP` + `Skill` | `planned` |
| `OpenWolf` | 高信号侦察、选择性摄入 | `core/openwolf` | `Skill` + `MCP` | `planned` |
| `Caveman` | 窄边界执行、验证、修复 | `core/caveman` | `Skill` + `MCP` | `planned` |
| `RTK` | 命令输出过滤、上下文压缩、hook 注入 | `core/tokeneff` | `Hook` + `Command` | `candidate` |

## 候选家族

| 家族 | 代表猎物 | 能力精华 | 预期 core 落点 | 当前状态 |
| --- | --- | --- | --- | --- |
| Prompt Compression | `LLMLingua`、`prompt_compressor`、`TokenCrush`、`PCToolkit`、`PromptOptimizer` | 直接压缩 Prompt、降低上下文 token | `core/tokeneff` | `candidate` |
| MCP Optimization | `Dynamic Toolsets`、`Unlock Pattern`、`Code Execution MCP`、`Claude Code Skills`、`Bifrost MCP Gateway` | 动态工具加载、减少 schema 开销、代码执行外包 | `core/toolkit`、`adapters/mcp` | `candidate` |
| Skills / Caching | `Claude Skills`、`Prompt Caching`、`Semantic Caching`、`GPTCache` | SOP 复用、前缀缓存、语义缓存 | `adapters/skill`、`core/tokeneff` | `candidate` |
| RTK (singleton family) | `rtk-ai/rtk` | 命令输出过滤、上下文压缩、hook 注入 | `core/tokeneff` | `candidate` |

## 索引规则

- `prey-sources.json` 是机器真源。
- 本表是人类可读映射。
- `sources/*.md` 是当前已确认猎物的说明页。
- `candidates/*.md` 是待识别猎物的分析页。
- 候选家族优先按能力归类，不按工具名碎片化归类。
