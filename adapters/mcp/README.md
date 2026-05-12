# adapters/mcp

TokenFlow 的 MCP 适配层运行时入口目录。

## 目标

- 对齐 `manifests/adapter-matrix.json` 中 `mcp` 是 primary execution surface 的约束。
- 从 `examples/generated/mcp/` 读取生成产物，构建最小可用的 server / gateway runtime。
- 保持适配层只做加载、路由、surface 暴露，不在这里重定义 core 真源。

## 文件说明

- `projection.ts`
  - 定义 `tool-schema-projection.json` 的结构类型。
- `runtime.ts`
  - 定义最小 runtime bundle 与 entry 选择逻辑。
- `loader.ts`
  - 从 `tool-schema-projection.json`、`server-entry.json`、`gateway-entry.json` 加载运行时 bundle。
  - 校验 entry shape、adapterId、toolIds 与 toolCount 一致性。
- `server.ts`
  - 最小 MCP server 入口。
  - 从生成产物加载工具定义，提供 `listTools()`、`callTool()`、`start()`。
- `sdk-server.ts`
  - 基于 `@modelcontextprotocol/sdk` 的真实 stdio MCP server 入口。
  - 动态注册 projection 中的 tools，并把调用转发到 `core/executor.ts`。
- `gateway.ts`
  - 最小 gateway 入口。
  - 从生成产物加载工具定义，提供 `handleRequest()` 路由到对应 core 模块名。

## 运行边界

允许：

- 把 core/manifests 生成的投影 JSON 装配成 MCP runtime bundle
- 暴露最小 server / gateway API
- 做基础参数校验和 tool_id -> core module 映射

不允许：

- 在 `adapters/mcp/` 内实现真实 core 模块逻辑
- 在适配层回写 core / manifests 真源
- 把实现锁死到单一宿主

## 使用示例

### 1. 加载 runtime bundle

```ts
import { loadRuntimeBundle } from "./adapters/mcp/loader";

const bundle = loadRuntimeBundle();
console.log(bundle.projection.toolIds);
```

### 2. 启动最小 server

```ts
import { startServer } from "./adapters/mcp/server";

const server = await startServer();
console.log(server.listTools());
```

### 3. 使用最小 gateway

```ts
import { loadGateway } from "./adapters/mcp/gateway";

const gateway = loadGateway();
const response = await gateway.handleRequest({
  tool_id: "tokenflow-router",
  parameters: {
    task: "route this task",
    hostCapabilities: ["mcp"],
    availableAdapters: ["mcp", "skill"]
  }
});

console.log(response.metadata.coreModule);
```

## 可实际运行的命令

### 1. 生成 MCP 样例产物

```powershell
.\scripts\Invoke-TokenFlowGeneration.ps1
```

默认会生成：

- `examples/generated/mcp/tool-schema-projection.json`
- `examples/generated/mcp/server-entry.json`
- `examples/generated/mcp/gateway-entry.json`

### 2. 校验真源和生成结果

```powershell
.\scripts\Invoke-TokenFlowValidation.ps1
```

### 3. 直接查看生成的 MCP 入口内容

```powershell
Get-Content .\examples\generated\mcp\server-entry.json
Get-Content .\examples\generated\mcp\gateway-entry.json
Get-Content .\examples\generated\mcp\tool-schema-projection.json
```

### 4. 用 Node 快速检查生成产物是否齐全

```powershell
node -e "const fs=require('fs');['examples/generated/mcp/server-entry.json','examples/generated/mcp/gateway-entry.json','examples/generated/mcp/tool-schema-projection.json'].forEach(p=>console.log(p, fs.existsSync(p) ? 'ok' : 'missing'))"
```

## 当前实现状态

- 已完成：`loader.ts`
  - 默认从 `examples/generated/mcp/` 加载 bundle
  - 校验 projection 与 entry plan 一致性
- 已完成：`server.ts`
  - 最小 server 入口与工具注册
  - `callTool()` 调用 `core/executor.ts` 的 host-agnostic execution seam
- 已完成：`sdk-server.ts`
  - 真实 MCP SDK stdio 协议层
  - 已验证 listTools / callTool / stdio handshake
- 已完成：`gateway.ts`
  - 最小 gateway 入口与请求路由
  - `handleRequest()` 调用 `core/executor.ts` 并返回结构化 core 执行结果
- 已完成：真实 core execution seam
  - 当前支持 `router`、`tokeneff`、`toolkit`、`openwolf`、`caveman` 的稳定结构化输出
  - 候选家族外部算法仍保持 `candidate`，后续按 promotion gates 接入真实压缩器、缓存或命令过滤器

## 说明

当前这层是生产前 runtime seam，重点是把生成产物变成可加载、可校验、可调用、可构建的 runtime surface。它已经能作为后续接入真正 MCP SDK 与候选家族算法的稳定入口，但还不是完整的第三方能力吸收实现。
