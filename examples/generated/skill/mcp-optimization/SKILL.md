---
name: tokenflow-mcp-optimization
description: "用途：缩小工具暴露面、减少 schema 开销，并把重计算从上下文里移走。 触发关键词：MCP Optimization、TokenFlow、Dynamic Toolsets、Bifrost MCP Gateway。边界：只渲染接入骨架，不直接启动真实 MCP server 或 gateway。"
---

# TokenFlow MCP Optimization Skill

## 用途

缩小工具暴露面、减少 schema 开销，并把重计算从上下文里移走。

## 触发关键词

MCP Optimization、TokenFlow、Dynamic Toolsets、Bifrost MCP Gateway

## 边界

只渲染接入骨架，不直接启动真实 MCP server 或 gateway。

## 输入映射

- capability ids: toolkit
- tools: mcp, skill, command
- source manifest: `manifests/tooling-manifest.json`
- conventions manifest: `manifests/rendering-conventions.json`

## 执行步骤（骨架）

1. 读取 manifest 并构建能力上下文。
2. 按触发策略选择能力组合。
3. 调用对应 `MCP` / `Command` / `Hook` 引用。

