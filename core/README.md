# core

这里放 TokenFlow 的核心能力逻辑：

- `router`
- `tokeneff`
- `toolkit`
- `openwolf`
- `caveman`

原则：

- 只做能力，不做宿主绑定。
- 只做 deterministic 决策，不做接入侧副作用。
- 新猎物必须先通过 manifests 的吸收判定。

当前真源文件：

- `capability-graph.json`
