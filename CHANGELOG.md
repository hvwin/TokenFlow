# Changelog

All notable changes to TokenFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-13

### Added

**Core Infrastructure**
- Initial project structure with `core/`, `manifests/`, `adapters/`, `templates/`, `prey/`, `scripts/`, `examples/`
- Core capability graph: `Router`, `TokenEff`, `Toolkit`, `OpenWolf`, `Caveman`
- Host-agnostic execution seam: `core/executor.ts`
- Machine-readable truth sources:
  - `manifests/tooling-manifest.json`
  - `manifests/adapter-matrix.json`
  - `manifests/candidate-families.json`
  - `manifests/family-rendering.json`
  - `manifests/rendering-conventions.json`

**Adapter Layer**
- MCP adapter with real SDK stdio server: `adapters/mcp/sdk-server.ts`
- MCP internal runtime wrapper: `adapters/mcp/server.ts`, `adapters/mcp/gateway.ts`
- Skill renderer: `adapters/skill/render.ts`
- Hook renderer: `adapters/hook/render.ts`
- Command renderer: `adapters/command/render.ts`
- Generic IDE bridge: `adapters/generic-ide/bridge.ts`
- Codex Teams bridge: `adapters/codex-teams/bridge.ts`

**Generation & Validation**
- PowerShell generation script: `scripts/Invoke-TokenFlowGeneration.ps1`
- PowerShell validation script: `scripts/Invoke-TokenFlowValidation.ps1`
- PowerShell smoke test: `scripts/Invoke-TokenFlowSmokeTest.ps1`
- TypeScript runtime verification: `scripts/verify-runtime.ts`
- TypeScript bridge verification: `scripts/verify-bridge-runtime.ts`
- MCP SDK stdio verification: `scripts/verify-mcp-sdk.ts`

**Prey Management**
- Prey registry: `prey/prey-sources.json`
- Candidate families: Prompt Compression, MCP Optimization, Skills Caching, RTK
- Absorption status tracking: `prey/absorption-status.md`
- Source capability matrix: `prey/source-capability-matrix.md`

**Documentation**
- Project overview: `README.md`
- Installation guide: `docs/install-guide.md`
- Generation guide: `docs/generation-guide.md`
- Integration guide: `docs/integration-guide.md`
- Runtime guide: `docs/runtime-guide.md`
- Documentation index: `docs/README.md`
- Project constraints: `AGENTS.md`, `PROJECT_CONSTRAINTS.md`
- Project details: `PROJECT_INDEX.md`, `PROJECT_REQUIREMENTS.md`, `PROJECT_DETAILS.md`
- Project status: `PROJECT_STATUS.md`

**Build & Verification**
- TypeScript build chain: `tsconfig.json`, `package.json`
- Dependencies: `@modelcontextprotocol/sdk@^1.29.0`, `zod@^4.4.3`
- npm scripts: `typecheck`, `build`, `verify`, `verify:bridge`, `verify:runtime`, `verify:mcp-sdk`
- Git configuration: `.gitignore`, `.gitattributes`

**Examples & Artifacts**
- Generated adapter examples: `examples/generated/`
- Smoke test artifacts: `examples/smoke-test/`
- 5 MCP tools: `tokenflow-router`, `tokenflow-tokeneff`, `tokenflow-toolkit`, `tokenflow-openwolf`, `tokenflow-caveman`
- 3 Skills: `prompt-compression`, `mcp-optimization`, `skills-caching`
- 3 Hooks: `tokenflow-prompt-compression`, `tokenflow-skills-caching`, `tokenflow-rtk`
- 2 Commands: `tokenflow-mcp-optimization`, `tokenflow-rtk`

### Verified

- `npm run verify` passed: typecheck, build, bridge verification, runtime seam verification, MCP SDK stdio verification
- `.\scripts\Invoke-TokenFlowValidation.ps1` passed: JSON truth, family alignment, template alignment, family rendering, generated artifacts
- `.\scripts\Invoke-TokenFlowSmokeTest.ps1` passed: 34/34 tests
- MCP SDK stdio client verification passed: `connect -> listTools -> callTool`

### Known Limitations

- Candidate families (Prompt Compression, MCP Optimization, Skills Caching, RTK) are marked as `candidate`, not `absorbed`
- External algorithms (LLMLingua, GPTCache, etc.) are not yet integrated into `core/executor.ts`
- `core/executor.ts` returns host-agnostic structured decision results, not real compression/caching operations
- No end-to-end host integration smoke tests (Codex App, Claude Desktop, Cline)

### Recommended Host Integration

- **Codex**: `Skill + MCP + Hook`
- **Claude Desktop / Cline**: `MCP`
- **Cursor / Windsurf**: `MCP + Command`
- **Generic IDE**: `MCP` (preferred) or `Generic Bridge` (HTTP API)

---

## [Unreleased]

### Planned

- End-to-end host integration smoke tests
- Promote candidate families from `candidate` to `absorbed` with real external algorithm integration
- Add more candidate families from prey pool
- Improve MCP gateway runtime with session management
- Add metrics and observability hooks

---

[0.1.0]: https://github.com/hvwin/TokenFlow/releases/tag/v0.1.0
[Unreleased]: https://github.com/hvwin/TokenFlow/compare/v0.1.0...HEAD
