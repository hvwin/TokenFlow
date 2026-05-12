# worker-renderers 证据包（T005）

## 目标

在写入归属范围内推进 `renderer-scaffold-ready`：

- 为 `adapters/skill`、`adapters/hook`、`adapters/command` 建立统一渲染骨架说明。
- 为 `templates` 建立与三类适配器对应的最小模板骨架。
- 明确输入来源（`core/manifests`）与输出形状（渲染产物骨架），不引入运行时实现。

## 读取文件

- `.codex-teams/features/tokenflow/tasks.md`
- `.codex-teams/features/tokenflow/requirements.md`
- `.codex-teams/features/tokenflow/design.md`
- `adapters/README.md`
- `templates/README.md`

## 改动

新增：

- `adapters/skill/README.md`
- `adapters/hook/README.md`
- `adapters/command/README.md`
- `templates/skill/SKILL.md.tmpl`
- `templates/hook/hook.json.tmpl`
- `templates/command/command.json.tmpl`

更新：

- `adapters/README.md`（补充渲染骨架索引）
- `templates/README.md`（补充骨架模板索引与变量约定）

说明：

- 三类 adapter README 统一定义了输入契约、输出契约、骨架阶段渲染规则。
- 三类模板使用统一 `{{variable_name}}` 占位语法，结构只表达描述层，不含可执行运行时逻辑。

## 验证

- 目录验证：`adapters/skill`、`adapters/hook`、`adapters/command`、`templates/skill`、`templates/hook`、`templates/command` 已创建。
- 内容验证：模板均包含 `source` 或输入映射字段，指向 `manifests/tooling-manifest.json` 与 `manifests/adapter-matrix.json`。
- 范围验证：改动仅落在本 worker 允许写入范围内。

## 剩余风险

- 目前是文档与模板骨架，尚未包含实际 renderer 实现与字段校验器。
- `entry_kind`、`action_type`、`stage` 等枚举值仍待与 `adapters/mcp`、`generic-ide/codex-teams` 侧统一冻结。
- 输出目录策略由上层 orchestrator 决定，当前仅给出约定示例。
