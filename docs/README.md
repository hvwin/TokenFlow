# 文档索引

TokenFlow 文档分为用户指南、开发指南和项目文档三大类。

## 用户指南

面向使用 TokenFlow 的开发者和集成者。

### 快速开始

1. [README.md](../README.md) - 项目概览、快速开始、核心特性
2. [生成指南](generation-guide.md) - 如何生成适配器产物
3. [集成指南](integration-guide.md) - 如何接入不同宿主环境
4. [运行时指南](runtime-guide.md) - 如何启动和配置运行时服务
5. [安装与宿主接入指南](install-guide.md) - Codex、Claude、Cline、Cursor、Windsurf 推荐安装方式

### 详细指南

#### 生成指南 (generation-guide.md)

**内容**：
- 生成器使用方法和参数说明
- 模板变量详解
- 输出结构说明
- 验证生成结果
- 常见问题排查
- 扩展生成器

**适用场景**：
- 首次生成适配器产物
- 自定义生成配置
- 添加新的候选家族
- 调试生成问题

#### 集成指南 (integration-guide.md)

**内容**：
- 宿主能力矩阵
- Codex App 集成（Skill + MCP + Hook）
- MCP 原生客户端集成（Claude Desktop、Cline）
- 通用 IDE 集成（Cursor、Windsurf）
- 仅支持提示词环境集成
- Bridge 适配器使用
- 验证集成和故障排查

**适用场景**：
- 将 TokenFlow 接入新宿主
- 配置多适配器组合
- 排查集成问题
- 优化集成配置

#### 运行时指南 (runtime-guide.md)

**内容**：
- 运行时架构和选择
- MCP Server 启动和配置
- MCP Gateway 启动和配置
- Generic Bridge HTTP API
- Codex Teams Bridge 集成
- 运行时监控和日志
- 故障排查
- 生产部署建议

**适用场景**：
- 启动 MCP 服务
- 配置运行时参数
- 监控运行状态
- 生产环境部署
- 排查运行时问题

---

## 开发指南

面向扩展和贡献 TokenFlow 的开发者。

### 核心文档

1. [项目架构](../PROJECT_DETAILS.md) - 目录结构、模块职责、适配器规划
2. [项目约束](../PROJECT_CONSTRAINTS.md) - 设计原则、边界、硬约束
3. [猎物层说明](../prey/README.md) - 猎物源管理、吸收流程、候选池

### 扩展指南

#### 添加新的候选家族

**步骤**：
1. 在 `manifests/candidate-families.json` 中添加家族定义
2. 在 `prey/candidates/` 中添加候选猎物文档
3. 在 `manifests/family-rendering.json` 中添加该家族的 Skill 文案、Hook 配置和 Command 配置
4. 运行 `.\scripts\Invoke-TokenFlowGeneration.ps1` 生成
5. 运行 `.\scripts\Invoke-TokenFlowValidation.ps1` 验证

**参考**：
- [生成指南 - 扩展生成器](generation-guide.md#扩展生成器)
- [猎物层说明 - 新猎物接入链](../prey/README.md)

#### 扩展核心能力

**步骤**：
1. 在 `core/capability-graph.json` 中添加模块定义
2. 在 `core/{module}/` 中实现模块逻辑
3. 在 `prey/prey-sources.json` 中注册猎物源
4. 更新 `prey/source-capability-matrix.md` 和 `prey/absorption-status.md`
5. 重新生成适配器并验证

**参考**：
- [项目架构 - core 层](../PROJECT_DETAILS.md#21-core)
- [猎物层说明 - 吸收状态](../prey/absorption-status.md)

#### 添加新的宿主支持

**步骤**：
1. 在 `manifests/adapter-matrix.json` 的 `hostMatrix` 中添加新宿主
2. 指定该宿主的 `recommendedAdapters`
3. 使用 `-HostCapability` 参数生成适配器
4. 编写集成文档和示例
5. 验证集成

**参考**：
- [集成指南 - 宿主能力矩阵](integration-guide.md#宿主能力矩阵)
- [项目架构 - 接入策略](../PROJECT_DETAILS.md#3-接入策略)

#### 自定义适配器模板

**步骤**：
1. 修改 `templates/` 下的对应模板文件
2. 确保模板变量与生成器中的 `$Variables` 哈希表一致
3. 重新生成并验证
4. 更新文档说明新增的模板变量

**参考**：
- [生成指南 - 模板变量](generation-guide.md#模板变量)
- [项目架构 - templates](../PROJECT_DETAILS.md#24-templates)

---

## 项目文档

面向理解 TokenFlow 整体设计和状态的读者。

### 核心项目文档

| 文档 | 内容 | 适用场景 |
|------|------|---------|
| [AGENTS.md](../AGENTS.md) | 根级约束、边界、适配原则 | 理解项目硬约束和设计原则 |
| [PROJECT_INDEX.md](../PROJECT_INDEX.md) | 阅读顺序、关键文档索引 | 首次接触项目，了解文档结构 |
| [PROJECT_REQUIREMENTS.md](../PROJECT_REQUIREMENTS.md) | 目标、范围、成功标准、核心能力 | 理解项目目标和能力定位 |
| [PROJECT_DETAILS.md](../PROJECT_DETAILS.md) | 目录架构、模块职责、适配器规划 | 深入了解架构设计和模块划分 |
| [PROJECT_CONSTRAINTS.md](../PROJECT_CONSTRAINTS.md) | 设计约束、边界、禁止事项 | 理解设计边界和不做什么 |
| [PROJECT_STATUS.md](../PROJECT_STATUS.md) | 当前进展、下一步、不要做 | 了解项目当前状态和优先级 |

### 猎物层文档

| 文档 | 内容 | 适用场景 |
|------|------|---------|
| [prey/README.md](../prey/README.md) | 猎物层入口、吸收流程、候选池 | 理解猎物管理机制 |
| [prey/prey-sources.json](../prey/prey-sources.json) | 猎物源注册表 | 查看已确认的猎物源 |
| [prey/source-capability-matrix.md](../prey/source-capability-matrix.md) | 能力映射矩阵 | 理解猎物能力如何映射到 core |
| [prey/absorption-status.md](../prey/absorption-status.md) | 吸收状态跟踪 | 查看哪些能力已吸收、哪些待吸收 |
| [prey/sources/*.md](../prey/sources/) | 已确认猎物源详细说明 | 深入了解特定猎物源 |
| [prey/candidates/*.md](../prey/candidates/) | 候选猎物池 | 查看待评估的候选猎物 |

### 能力清单文档

| 文档 | 内容 | 适用场景 |
|------|------|---------|
| [core/capability-graph.json](../core/capability-graph.json) | 核心模块能力图谱 | 理解 core 层模块定义 |
| [manifests/tooling-manifest.json](../manifests/tooling-manifest.json) | 工具元数据和候选家族 | 查看工具能力声明 |
| [manifests/adapter-matrix.json](../manifests/adapter-matrix.json) | 宿主适配矩阵 | 查看宿主推荐接入方式 |
| [manifests/candidate-families.json](../manifests/candidate-families.json) | 候选家族定义 | 查看候选家族配置 |
| [manifests/rendering-conventions.json](../manifests/rendering-conventions.json) | 渲染约定 | 查看跨适配器共享约定 |

### 适配器文档

| 文档 | 内容 | 适用场景 |
|------|------|---------|
| [adapters/README.md](../adapters/README.md) | 适配器层总览 | 理解适配器层职责 |
| [adapters/mcp/README.md](../adapters/mcp/README.md) | MCP 适配器骨架 | 理解 MCP Server/Gateway 设计 |
| [adapters/skill/README.md](../adapters/skill/README.md) | Skill 适配器骨架 | 理解 Skill 渲染规则 |
| [adapters/hook/README.md](../adapters/hook/README.md) | Hook 适配器骨架 | 理解 Hook 触发机制 |
| [adapters/command/README.md](../adapters/command/README.md) | Command 适配器骨架 | 理解 Command 入口设计 |
| [adapters/generic-ide/README.md](../adapters/generic-ide/README.md) | Generic Bridge 骨架 | 理解通用 IDE 桥接设计 |
| [adapters/codex-teams/README.md](../adapters/codex-teams/README.md) | Codex Teams Bridge 骨架 | 理解 Teams 集成设计 |

### 模板和示例

| 文档 | 内容 | 适用场景 |
|------|------|---------|
| [templates/README.md](../templates/README.md) | 模板层说明 | 理解模板结构 |
| [templates/skill/SKILL.md.tmpl](../templates/skill/SKILL.md.tmpl) | Skill 模板 | 自定义 Skill 生成 |
| [templates/mcp/tool-schema.json.tmpl](../templates/mcp/tool-schema.json.tmpl) | MCP tool schema 模板 | 自定义 MCP 工具生成 |
| [templates/hook/hook.json.tmpl](../templates/hook/hook.json.tmpl) | Hook 模板 | 自定义 Hook 生成 |
| [templates/command/command.json.tmpl](../templates/command/command.json.tmpl) | Command 模板 | 自定义 Command 生成 |
| [examples/README.md](../examples/README.md) | 示例和生成产物说明 | 查看生成结果示例 |
| [examples/generated/](../examples/generated/) | 生成的适配器产物 | 参考实际生成结果 |

### 脚本文档

| 文档 | 内容 | 适用场景 |
|------|------|---------|
| [scripts/README.md](../scripts/README.md) | 脚本层说明 | 理解生成和验证脚本 |
| [scripts/Invoke-TokenFlowGeneration.ps1](../scripts/Invoke-TokenFlowGeneration.ps1) | 生成器脚本 | 查看生成器实现 |
| [scripts/Invoke-TokenFlowValidation.ps1](../scripts/Invoke-TokenFlowValidation.ps1) | 验证器脚本 | 查看验证器实现 |

---

## 阅读路径

### 路径 1：快速上手（用户）

适合想快速使用 TokenFlow 的开发者。

1. [README.md](../README.md) - 了解项目概览和快速开始
2. [生成指南](generation-guide.md) - 生成适配器产物
3. [集成指南](integration-guide.md) - 接入目标宿主
4. [运行时指南](runtime-guide.md) - 启动运行时服务

### 路径 2：深入理解（架构）

适合想深入理解 TokenFlow 设计的开发者。

1. [PROJECT_INDEX.md](../PROJECT_INDEX.md) - 了解文档结构
2. [AGENTS.md](../AGENTS.md) - 理解根级约束
3. [PROJECT_REQUIREMENTS.md](../PROJECT_REQUIREMENTS.md) - 理解项目目标
4. [PROJECT_DETAILS.md](../PROJECT_DETAILS.md) - 理解架构设计
5. [prey/README.md](../prey/README.md) - 理解猎物层机制
6. [core/capability-graph.json](../core/capability-graph.json) - 查看能力图谱
7. [manifests/](../manifests/) - 查看能力清单

### 路径 3：扩展贡献（开发者）

适合想扩展或贡献 TokenFlow 的开发者。

1. [PROJECT_DETAILS.md](../PROJECT_DETAILS.md) - 理解架构设计
2. [PROJECT_CONSTRAINTS.md](../PROJECT_CONSTRAINTS.md) - 理解设计边界
3. [prey/README.md](../prey/README.md) - 理解猎物接入流程
4. [生成指南 - 扩展生成器](generation-guide.md#扩展生成器) - 学习如何扩展
5. [scripts/Invoke-TokenFlowGeneration.ps1](../scripts/Invoke-TokenFlowGeneration.ps1) - 查看生成器实现
6. [templates/](../templates/) - 查看模板结构
7. [PROJECT_STATUS.md](../PROJECT_STATUS.md) - 了解当前优先级

### 路径 4：故障排查（运维）

适合遇到问题需要排查的用户。

1. [集成指南 - 故障排查](integration-guide.md#故障排查) - 集成问题
2. [运行时指南 - 故障排查](runtime-guide.md#故障排查) - 运行时问题
3. [生成指南 - 常见问题](generation-guide.md#常见问题) - 生成问题
4. [scripts/Invoke-TokenFlowValidation.ps1](../scripts/Invoke-TokenFlowValidation.ps1) - 运行验证器
5. [PROJECT_STATUS.md](../PROJECT_STATUS.md) - 查看已知问题

---

## 文档维护

### 文档同步规则

根据 [AGENTS.md](../AGENTS.md) 的要求：

- 改约束先改 `AGENTS.md`
- 改需求、架构、目录规划时，同步 `PROJECT_INDEX.md`、`PROJECT_REQUIREMENTS.md`、`PROJECT_DETAILS.md`
- 改猎物清单、能力映射、吸收状态时，同步 `prey/README.md`、`prey/prey-sources.json`、`prey/source-capability-matrix.md`、`prey/absorption-status.md`
- 改状态时，同步 `PROJECT_STATUS.md`
- 改用户指南时，同步本文档索引

### 文档贡献

欢迎贡献文档改进：

- 修正错误和不清晰的表述
- 补充缺失的示例和用例
- 添加新的故障排查案例
- 改进文档结构和导航

提交文档 PR 时请确保：

- 更新相关的文档索引
- 保持中文为主、技术术语用英文的风格
- 提供清晰的示例和代码片段
- 验证所有链接和路径正确

---

## 获取帮助

### 常见问题

- 生成问题：参考 [生成指南 - 常见问题](generation-guide.md#常见问题)
- 集成问题：参考 [集成指南 - 故障排查](integration-guide.md#故障排查)
- 运行时问题：参考 [运行时指南 - 故障排查](runtime-guide.md#故障排查)

### 进一步支持

- 查看 [PROJECT_STATUS.md](../PROJECT_STATUS.md) 了解已知问题和限制
- 查看 [examples/generated/](../examples/generated/) 参考生成结果
- 运行 `.\scripts\Invoke-TokenFlowValidation.ps1` 验证配置

---

**文档版本**：与项目同步更新  
**最后更新**：2026-05-13
