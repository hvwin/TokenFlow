# 记忆

## 摘要

- TokenFlow 已从固定五项转为开放式猎物生态。
- 当前 5 步骨架已经完成，真源、adapter、bridge 与共享渲染约定已收口。

## Durable Decisions

- TokenFlow 对外统一使用 `TokenFlow`，仓库保留 `token-workflow-tools`。
- 猎物层按能力家族组织，不设硬上限。
- 首批五个工具只是样本，不是上限。
- 新增 `manifests/rendering-conventions.json` 作为跨 adapter 的共享枚举、占位符和路径口径真源。

## Open Questions

- MCP 运行层先落 server 还是 gateway。
- 首批 renderer 与 validator 先放 scripts 还是 adapters 内部。
- 四个候选家族的首批吸收实验优先级。

## Important Paths

- .codex-teams/features
- state.json
- tasks.md
- handoff.md
- planning/brief.md
- planning/review.md
- planning/proposals/
- memory/phase/

## Failure Patterns

- 暂无 failure pattern。

## High Value Behaviors

- 暂无高价值行为。

## Role Playbooks

- 暂无角色执行手册。

## Prompt Packets

- 暂无 prompt packet。

## Promoted Learnings

- 暂无提升经验。

## Resume Packet

- 目标: TokenFlow 终极形态落地
- 当前阶段: P2 Design/Dispatch
- 当前任务: -
- 阻塞项: -
- 最新决策: 新增 rendering-conventions 真源，统一跨 adapter 共享口径。
- 最新验证: JSON 解析、family ID 与 template/bridge conventions 对齐通过。
- 下一步: 如继续推进，先补 scripts 校验器和 MCP projection/runtime 入口。
- 当前不要做: 不要直接绑定单一宿主或提前宣布 candidate 家族已吸收。
- 记忆引用: state.json, handoff.md, memory.md, retrieval-index.json, state.json#rolePlaybooks, state.json#promptPackets, state.json#externalTooling
