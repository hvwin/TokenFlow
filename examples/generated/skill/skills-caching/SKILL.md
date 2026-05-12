---
name: tokenflow-skills-caching
description: "用途：复用 SOP 与缓存重复上下文，降低重复推理和前缀成本。 触发关键词：Skills Caching、TokenFlow、Claude Skills、Prompt Caching、GPTCache。边界：只渲染接入骨架，不直接接入真实缓存服务。"
---

# TokenFlow Skills / Caching Skill

## 用途

复用 SOP 与缓存重复上下文，降低重复推理和前缀成本。

## 触发关键词

Skills Caching、TokenFlow、Claude Skills、Prompt Caching、GPTCache

## 边界

只渲染接入骨架，不直接接入真实缓存服务。

## 输入映射

- capability ids: tokeneff
- tools: skill, hook, mcp
- source manifest: `manifests/tooling-manifest.json`
- conventions manifest: `manifests/rendering-conventions.json`

## 执行步骤（骨架）

1. 读取 manifest 并构建能力上下文。
2. 按触发策略选择能力组合。
3. 调用对应 `MCP` / `Command` / `Hook` 引用。

