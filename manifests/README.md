# manifests

这里放机器可读真源：

- `tooling-manifest.json`
- `adapter-matrix.json`
- `candidate-families.json`
- `family-rendering.json`
- `rendering-conventions.json`

职责：

- 描述 TokenFlow 的核心能力图
- 描述候选家族和吸收规则
- 描述候选家族的 Skill 文案、Hook 配置和 Command 配置
- 描述宿主接入矩阵和推荐适配器
- 冻结跨 adapter 共用的枚举、占位符和桥接路径约定
- 通过 `sourceOfTruth` / `familyDefaults` / `candidateDoc` / `family-rendering` / `rendering-conventions` 与 `core`、`prey`、`adapters` 做机器可读对齐
