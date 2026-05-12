# 设计

## 方案

TokenFlow 采用 `core -> manifests -> adapters -> bridge` 的单向结构。

`core` 负责稳定能力逻辑，`manifests` 负责机器可读真源，`adapters` 负责按宿主输出不同形态，`bridge` 负责 IDE / agent 接入。

## 受影响接口或文件

- `manifests/tooling-manifest.json`
- `manifests/adapter-matrix.json`
- `manifests/candidate-families.json`
- `prey/prey-sources.json`
- `prey/source-capability-matrix.md`
- `prey/absorption-status.md`
- `core/README.md`
- `adapters/README.md`
- `templates/README.md`
- `scripts/README.md`

## 数据流

猎物候选 -> 候选家族 -> 吸收判定 -> core 能力图 -> manifests -> adapter 渲染 -> IDE / agent bridge。

## 任务图

1. 冻结 core 能力图和吸收判定。
2. 冻结 manifests 与候选家族分类。
3. 建立 MCP 运行层骨架。
4. 建立 Skill / Hook / Command 渲染器骨架。
5. 建立 IDE / agent bridge 骨架。

## 子代理角色

- coordinator: 总控、冻结、集成
- architect: 核心架构与 manifest 设计
- implementer: 目录与文件骨架
- tester: 机器读写验证
- reviewer: 结构和边界审查

## 验证策略

- JSON 解析通过。
- 路径和入口一致。
- 状态文件与镜像文件同步。
- 核心步骤完成后做一次最小回读。

## 风险

- 过早把候选猎物写成已吸收真源。
- adapter 渲染层和 core 真源边界混淆。
- bridge 过早宿主绑定。

## 回滚或恢复

- 任何候选家族都保留在 `prey/candidates/`。
- 机器真源只增不删，先标状态再吸收。
- 如有分歧，回到 `planning/brief.md` 和 `decision-log.md` 重新冻结。
