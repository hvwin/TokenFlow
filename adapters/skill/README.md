# adapters/skill

Skill 适配器负责把同一套能力真源渲染成 Skill 交付骨架。

## 输入契约

- `manifests/tooling-manifest.json`：能力与工具元数据。
- `manifests/adapter-matrix.json`：宿主支持矩阵与启用约束。
- `manifests/rendering-conventions.json`：共享模板占位、阶段和值域约定。
- `core` 产出的 capability graph（如果上层已注入）：触发策略和说明映射。

## 输出契约

- 输出根目录由上层 orchestrator 提供（例如 `dist/skill/<host>/`）。
- 最小产物：
  - `SKILL.md`（模板：`templates/skill/SKILL.md.tmpl`）。
  - 可选 `references/`、`scripts/`、`assets/` 目录占位（仅当 manifest 显式声明）。

## 渲染规则（骨架阶段）

1. 只做模板字段替换与路径拼装，不引入运行时逻辑。
2. 用户可见文案优先中文，技术字段保持英文。
3. 模板变量缺失时应终止渲染并返回缺失字段清单。

## Renderer 使用说明

### TypeScript API

```typescript
import { renderSkill, renderAllSkills } from "./adapters/skill/render";

// 渲染单个 skill
const result = renderSkill(
  {
    familyId: "prompt-compression",
    familyTitle: "Prompt Compression",
    preferredCore: "tokeneff",
    preferredAdapters: ["mcp", "hook", "skill"],
    purposeZh: "直接压缩 Prompt，降低上下文 token 成本...",
    triggerKeywordsZh: "Prompt Compression、TokenFlow...",
    boundariesZh: "只渲染接入骨架..."
  },
  "templates/skill/SKILL.md.tmpl",
  "output/skill"
);

// 批量渲染所有 skills
const results = renderAllSkills(
  "manifests",      // manifests 目录
  "templates",      // templates 目录
  "output/skill"    // 输出目录
);
```

### CLI 测试

```bash
# 从 adapters/skill 目录运行
npx ts-node render.ts

# 或从项目根目录
npx ts-node adapters/skill/render.ts
```

### 输出示例

渲染后会在输出目录生成如下结构：

```
output/skill/
├── prompt-compression/
│   └── SKILL.md
├── mcp-optimization/
│   └── SKILL.md
└── skills-caching/
    └── SKILL.md
```

每个 `SKILL.md` 包含：
- frontmatter（name, description）
- 用途说明
- 触发关键词
- 边界约束
- 输入映射
- 执行步骤骨架

### 集成到生成流程

`render.ts` 可被上层 orchestrator（如 `scripts/Invoke-TokenFlowGeneration.ps1`）调用，也可作为独立模块在其他 TypeScript 工具链中复用。

### 扩展点

- **getFamilyCopy**: 为新 family 添加中文文案映射
- **renderSkill**: 自定义单个 skill 的渲染逻辑
- **renderAllSkills**: 批量渲染的过滤和排序策略
