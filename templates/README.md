# templates

这里放接入模板：

- skill template
- mcp template
- hook template
- command template

用途：

- 作为适配器生成的固定骨架。
- 不存运行时状态。

当前骨架文件：

- `templates/skill/SKILL.md.tmpl`
- `templates/mcp/tool-schema.json.tmpl`
- `templates/hook/hook.json.tmpl`
- `templates/command/command.json.tmpl`

约定：

- 模板变量使用 `{{variable_name}}`。
- 路径占位使用 `{featureSlug}` 这类单层命名变量。
- 变量填充由对应 adapter 完成，不在模板层执行业务逻辑。
