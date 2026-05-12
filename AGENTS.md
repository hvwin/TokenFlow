# AGENTS.md

本文件是 `token-workflow-tools` 的根级约束说明。进入项目先读本文件，再读需求与架构文档。

## 核心定位

- 这是一个独立的 token 感知工具控制层，不是某个 IDE 的私有插件壳。
- 当前首批核心能力样本是：`Router`、`TokenEff`、`Toolkit`、`OpenWolf`、`Caveman`；后续可持续吸收新猎物并回灌到同一套真源。
- 项目的目标不是堆功能，而是输出可复用的能力真源和可验证的适配器。

## 硬约束

- core 层必须保持宿主无关，不允许硬编码 Codex App 专属行为。
- 接入层必须可拆分：`Skill`、`MCP`、`Hook`、`Command` 都应能独立生成或组合生成。
- 自动触发优先级以宿主支持能力为准，不以单一 IDE 假设为准。
- 所有用户可见文案、标题、说明优先使用中文。
- 技术字段、文件名、role key、model id、接口名保持英文。
- 不修改宿主运行态目录，不把生成物写进共享缓存、sessions、sqlite、auth 之类位置。
- 未经明确确认，不做破坏性删除或重置。

## 适配原则

- `MCP` 负责真实工具调用和状态查询。
- `Skill` 负责语义触发、策略注入和 SOP。
- `Hook` 负责宿主支持时的前置/后置增强。
- `Command` 负责显式入口和兜底。
- `core` 只负责能力逻辑，不绑定具体宿主。

## 文档同步

- 改约束先改本文件。
- 改需求、架构、目录规划时，同步 `PROJECT_INDEX.md`、`PROJECT_REQUIREMENTS.md`、`PROJECT_DETAILS.md`。
- 改猎物清单、能力映射、吸收状态时，同步 `prey/README.md`、`prey/prey-sources.json`、`prey/source-capability-matrix.md`、`prey/absorption-status.md`。
- 改状态时，同步 `PROJECT_STATUS.md`。
