---
name: tokenflow-prompt-compression
description: "用途：直接压缩 Prompt，降低上下文 token 成本，并尽量保持语义稳定。 触发关键词：Prompt Compression、TokenFlow、LLMLingua、prompt_compressor。边界：只渲染接入骨架，不直接执行压缩器，也不改写能力真源。"
---

# TokenFlow Prompt Compression Skill

## 用途

直接压缩 Prompt，降低上下文 token 成本，并尽量保持语义稳定。

## 触发关键词

Prompt Compression、TokenFlow、LLMLingua、prompt_compressor

## 边界

只渲染接入骨架，不直接执行压缩器，也不改写能力真源。

## 输入映射

- capability ids: tokeneff
- tools: mcp, hook, skill
- source manifest: `manifests/tooling-manifest.json`
- conventions manifest: `manifests/rendering-conventions.json`

## 执行步骤（骨架）

1. 读取 manifest 并构建能力上下文。
2. 按触发策略选择能力组合。
3. 调用对应 `MCP` / `Command` / `Hook` 引用。

