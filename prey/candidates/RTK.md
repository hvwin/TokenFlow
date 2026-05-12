# RTK

## 定位

Rust Token Killer，面向 AI coding agents 的 CLI proxy / context runtime。

## 已知信息

- 代码仓库为 `rtk-ai/rtk`。
- 目标是过滤和压缩命令输出，在到达 LLM 上下文前减少 token 消耗。
- 支持多种 AI coding tools / agents 的接入，包含 Claude Code、Copilot、Cursor、Windsurf、Codex、OpenCode 等。
- 它天然落在“命令输出压缩 + 宿主 hook + agent 接入规则”这条链上。

## 吸收判定

满足以下任一条件后，才进入正式吸收流程：

- 能被抽成稳定能力，并落到 `core/tokeneff`
- 能补强 `TokenFlow` 的命令过滤、上下文压缩、hook 注入或 agent 接入链
- 能显著增强 `TokenFlow` 的省 token、路由、编排、侦察或执行能力

## 下一步

先把 RTK 归入“命令输出压缩 / Agent hook”家族，再决定是否迁入 `prey/sources/` 主表。
