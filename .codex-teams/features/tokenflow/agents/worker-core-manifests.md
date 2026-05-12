# worker-core-manifests 证据包

## 目标

- 推进 T002/T003：补强 `core` 能力图与吸收判定、`manifests` 三份机器真源、`prey` 索引与说明的一致性。
- 保持候选家族口径：候选仍为 `candidate`，不误标为 `absorbed`。

## 已读取文件

- `.codex-teams/features/tokenflow/tasks.md`
- `.codex-teams/features/tokenflow/design.md`
- `.codex-teams/features/tokenflow/requirements.md`
- `.codex-teams/features/tokenflow/status.md`
- `core/capability-graph.json`
- `core/README.md`
- `manifests/tooling-manifest.json`
- `manifests/adapter-matrix.json`
- `manifests/candidate-families.json`
- `manifests/README.md`
- `prey/prey-sources.json`
- `prey/source-capability-matrix.md`
- `prey/absorption-status.md`
- `prey/README.md`
- `prey/sources/README.md`
- `prey/sources/*.md`
- `prey/candidates/README.md`
- `prey/candidates/*.md`

## 改动摘要

1. `core/capability-graph.json`
   - 在 `absorptionPolicy` 增加统一 `statusModel`。
   - 增加 `promotionGates`，明确 candidate/planned/absorbing/absorbed 的最小晋级门槛。

2. `manifests/tooling-manifest.json`
   - 新增 `sourceOfTruth`，显式指向 core/manifests/prey 真源文件。
   - 在 `core` 下新增 `statusModel`。
   - 为每个 `candidateFamilies` 项新增 `familyManifestRef` 与 `preyCandidateId`，建立可追踪关联。

3. `manifests/adapter-matrix.json`
   - 新增 `familyDefaults`，补齐候选家族到适配器偏好的机器映射。

4. `manifests/candidate-families.json`
   - 新增顶层 `statusModel`。
   - 每个家族补充 `preferredCore`、`preferredAdapters`、`candidateDoc`，与 tooling/prey 对齐。

5. `prey/prey-sources.json`
   - `policy` 增加 `idConvention`。
   - `candidateSources` 的机器 ID 统一为 kebab-case：`rtk` / `prompt-compression` / `mcp-optimization` / `skills-caching`。
   - `rtk` 改为 family 口径并补充 `members`，与 manifests 家族模型一致。

6. `prey/source-capability-matrix.md`
   - 在候选家族表新增 `RTK (singleton family)` 行，补齐清单一致性。

7. `prey/absorption-status.md`
   - 在候选家族表新增 `RTK (singleton family)` 状态行。

8. `prey/README.md`、`manifests/README.md`
   - 补充最小规则说明：机器 ID 口径与跨层机器对齐入口。

## 验证结果

### JSON 解析

执行：

```powershell
$files = @(
  'core/capability-graph.json',
  'manifests/tooling-manifest.json',
  'manifests/adapter-matrix.json',
  'manifests/candidate-families.json',
  'prey/prey-sources.json'
)
foreach ($f in $files) { Get-Content -Raw $f | ConvertFrom-Json | Out-Null; "PASS $f" }
```

结果：全部 PASS。

### 家族 ID 对齐

对比 `core -> tooling-manifest -> candidate-families -> prey` 的 candidate family ID 集合：

- `prompt-compression`
- `mcp-optimization`
- `skills-caching`
- `rtk`

结果：集合一致（顺序允许不同）。

## 剩余风险

- `familyManifestRef` 目前采用 `file#id` 轻量约定，尚未引入统一 JSON Pointer 校验器；后续若做自动校验脚本，建议固定解析规则。
- `RTK` 作为 singleton family 已与 manifests 对齐，但若后续把 RTK 拆成更细子能力，需要再细化 family/member 层级而不改变当前状态语义。
