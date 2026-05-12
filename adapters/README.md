# adapters

这里放宿主适配器：

- `skill`
- `mcp`
- `hook`
- `command`
- `codex-teams`
- `generic-ide`

原则：

- 一个 core，可以生成多个 adapter。
- adapter 负责把 core 的能力翻译成宿主可消费形式。
- 适配器只渲染，不承载能力真源。

当前渲染骨架索引：

- `adapters/mcp/README.md`
- `adapters/skill/README.md`
- `adapters/hook/README.md`
- `adapters/command/README.md`
- `adapters/generic-ide/README.md`
- `adapters/codex-teams/README.md`
