# 规划评审

## 已选方案

direct-open-ecosystem

## 冻结结论

通过 direct 路线，先做 core 和 manifests，再进入 adapters 与 bridge。

## 主要风险

- 不能把候选家族当成已完成实现。
- 不能提前绑定单一宿主。
- 不能把 adapter 渲染层和 core 真源混写。

## 需要关闭的问题

- IDE / agent bridge 的优先宿主顺序。
- MCP 运行层的首选形态。
- 候选家族的吸收优先级。

## 进入构建前门禁

- `planning/brief.md` 已冻结。
- `tasks.md` 已写出 5 步任务图。
- `core` 和 `manifests` 的机器真源文件已落盘。
