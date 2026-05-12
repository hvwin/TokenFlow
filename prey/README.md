# 猎物层

这里是 `TokenFlow` 的猎物真源层。

它记录当前已确认的猎物样本与后续候选猎物家族的：

- 能力清单
- 功能吞噬路径
- 模块映射
- 吸收状态
- 索引入口

## 阅读顺序

1. `prey-sources.json`
2. `source-capability-matrix.md`
3. `absorption-status.md`
4. `sources/*.md`
5. `candidates/*.md`

## 范围说明

- 这里不存运行时副作用。
- 这里不实现工具逻辑。
- 这里只定义“应该吸收什么、吸收到哪里、当前吸收到哪一步”。
- 新猎物先进入候选池，再决定是否回灌到 `core`。
- 候选池优先按能力家族组织。
- `prey-sources.json` 的机器 ID 统一使用 kebab-case，标题字段保留人类可读命名。
