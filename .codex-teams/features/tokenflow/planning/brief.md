# 规划 Brief

## 目标

把 TokenFlow 落成开放式猎物生态的能力总控层，先冻结 core 能力图与吸收判定，再推进 manifests、MCP、Skill / Hook / Command 和 IDE / agent bridge。

## 成功标准

- core 能力图与吸收判定明确。
- manifests 与候选家族分类明确。
- MCP / Skill / Hook / Command 的渲染方向明确。
- IDE / agent bridge 的抽象边界明确。
- feature 状态、任务图和文档镜像一致。

## 约束

- TokenFlow 对外统一名为 TokenFlow。
- 仓库名保留 token-workflow-tools。
- 猎物层按能力家族分类。
- 只要有宿主支持，就按最佳形态输出。

## 范围内

- core 能力图和吸收判定
- manifests 与候选家族分类
- MCP 运行层骨架
- Skill / Hook / Command 渲染器骨架
- IDE / agent bridge 骨架

## 范围外

- 完整运行时实现
- 大而全 UI
- 单一宿主绑定
- 未判定能力直接写入 core

## 已知风险

- 候选猎物被过早视为已吸收。
- 渲染层和真源层混写。
- bridge 过早绑定特定宿主。

## 未决问题

- IDE / agent bridge 优先支持哪些宿主。
- MCP 运行层先做 server、gateway 还是双形态。
- 候选家族的首批吸收顺序。

## 当前不要做

- 不要把候选家族直接写成已吸收真源。
- 不要先做大而全 UI。
- 不要先锁死某一个宿主。

## 预期交付

- 冻结后的 core 能力图
- 机器可读 manifests
- 候选家族分类
- MCP / Skill / Hook / Command / bridge 骨架

