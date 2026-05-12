# 吸收状态

## 当前结论

首批猎物已进入“猎物层规划”阶段，尚未进入实现层；猎物总数不设硬上限。

## 分项状态

| 工具 | 状态 | 说明 |
| --- | --- | --- |
| `Router` | planned | 先做路由中枢 |
| `TokenEff` | planned | 先做预算与压缩控制 |
| `Toolkit` | planned | 先做最小工具包编排 |
| `OpenWolf` | planned | 先做高信号侦察 |
| `Caveman` | planned | 先做窄边界执行 |
| `RTK` | candidate | Rust Token Killer，适合先纳入命令压缩与 hook 链路 |

## 候选家族

| 家族 | 状态 | 说明 |
| --- | --- | --- |
| Prompt Compression | candidate | 先调研压缩能力、语义保真和压缩率边界 |
| MCP Optimization | candidate | 先调研工具动态加载、Schema 压缩和执行外包 |
| Skills / Caching | candidate | 先调研技能复用、缓存命中和前缀成本控制 |
| RTK (singleton family) | candidate | 先验证命令输出压缩、hook 注入和 agent 接入链路的稳定边界 |

## 下一步

1. 先落 `core` 真源。
2. 再落 `manifests` 与吸收判定。
3. 按能力家族完成候选池整理和调研。
4. 再落 `mcp` adapter。
5. 再补 `skill` / `hook` / `command` 生成器。
6. 最后把适配能力回灌到 `TokenFlow` 的索引和模板里。
