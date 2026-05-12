# 需求

## 目标

把 TokenFlow 落成开放式猎物生态的能力总控层，能够把不同猎物抽成稳定能力后，统一渲染为 `Skill`、`MCP`、`Hook`、`Command` 和 IDE / agent bridge。

## 成功标准

- `core` 能力图和吸收判定可机器读。
- `manifests` 能描述能力清单、候选家族和宿主接入矩阵。
- `MCP`、`Skill`、`Hook`、`Command` 的渲染方向明确。
- IDE / agent bridge 的接入边界明确。
- 当前项目文档、状态和任务图同步一致。

## 范围内

- core 能力图和吸收判定
- manifests 与候选家族分类
- MCP 运行层骨架
- Skill / Hook / Command 渲染器骨架
- IDE / agent bridge 骨架

## 范围外

- 大而全 UI
- 单宿主私有绑定
- 与 token 省量无关的能力扩张
- 未判定就写入 core 的新猎物

## 约束

- core 不绑定宿主。
- manifests 只存机器可读真源，不存运行副作用。
- 候选猎物先归类再吸收。
- 首批五个工具只是样本，不是上限。

## 假设

- 先落文档和机器真源，再补执行层实现。
- IDE / agent bridge 先以抽象接口和适配器目录表示。

## 待确认问题

- IDE / agent bridge 先重点支持哪些宿主。
- MCP 运行层先做 server 还是 client / gateway。
- 各候选家族的首批优先吸收顺序。

