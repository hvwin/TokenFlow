# 任务

| ID | 阶段 | 状态 | 负责人 | 角色 | 依赖 | 验收门 | 写入范围 | 预算层 | 交付物 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T001 | P0 Intake | 完成 | 协调者 | 方案起草者 | - | brief-frozen | .codex-teams/features, planning/ | planning | 已冻结 brief、初始任务图和 dispatch 草案 |
| T002 | P1 Proposal Sprint | 完成 | 协调者 | 架构师 | T001 | core-graph-frozen | manifests, core, prey | build | core 能力图、吸收状态模型、promotion gates 已冻结 |
| T003 | P1 Proposal Sprint | 完成 | 协调者 | 实施者 | T002 | manifests-frozen | manifests, prey | build | manifests、候选家族分类与 prey family registry 已对齐 |
| T004 | P2 Design/Dispatch | 完成 | 协调者 | 实施者 | T002, T003 | mcp-scaffold-ready | adapters/mcp, manifests | build | MCP 运行层骨架与 runtime surface 已落地 |
| T005 | P2 Design/Dispatch | 完成 | 协调者 | 实施者 | T002, T003 | renderer-scaffold-ready | adapters/skill, adapters/hook, adapters/command, templates | build | Skill / Hook / Command 渲染器骨架与模板已落地 |
| T006 | P2 Design/Dispatch | 完成 | 协调者 | 实施者 | T004, T005 | bridge-scaffold-ready | adapters/generic-ide, adapters/codex-teams | build | IDE / agent bridge 骨架与共享路径口径已落地 |

状态枚举：`prepare`, `approved`, `running`, `blocked`, `in_review`, `rework`, `done`, `archived`。
