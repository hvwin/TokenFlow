# 项目索引

本项目采用“根约束 -> 需求 -> 架构 -> 目录骨架 -> 状态”的顺序阅读。

## 阅读顺序

1. [AGENTS.md](AGENTS.md)
2. [prey/README.md](prey/README.md)
3. [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md)
4. [PROJECT_DETAILS.md](PROJECT_DETAILS.md)
5. [PROJECT_STATUS.md](PROJECT_STATUS.md)
6. [README.md](README.md)

## 关键文档

- `AGENTS.md`
  - 根级约束、边界、适配原则。

- `PROJECT_REQUIREMENTS.md`
  - 目标、范围、成功标准、自动触发策略。

- `prey/README.md`
  - 猎物层入口。
  - 用于承载首批猎物样本、候选猎物的能力清单、映射索引和吸收状态。

- `prey/candidates/README.md`
  - 候选池入口。
  - 用于承载按能力家族整理的新猎物与待识别对象。

- `PROJECT_DETAILS.md`
  - 目录架构、模块职责、适配器规划、公共接口。

- `PROJECT_STATUS.md`
  - 当前落地状态与下一步。

## 预期目录

- `core/`
  - 首批工具的核心逻辑。

- `adapters/`
  - `skill`、`mcp`、`hook`、`command`、`codex-teams`、`generic-ide` 等接入器。

- `manifests/`
  - 工具能力清单、宿主推荐接入矩阵、家族渲染真源、生成结果索引。

- `templates/`
  - Skill / MCP / Hook / Command 模板。

- `scripts/`
  - 生成器、校验器、TypeScript 构建/runtime 验证脚本、最小 smoke test。

- `docs/`
  - 设计说明、验证记录、演进说明。

- `examples/`
  - 参考输出与接入示例。

- `prey/`
  - 猎物真源层。
  - 用于记录首批工具与候选猎物的能力精华、映射和吸收状态。
