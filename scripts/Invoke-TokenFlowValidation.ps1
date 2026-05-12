param(
    [string]$GeneratedRoot = "examples/generated",
    [switch]$SkipGenerated
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Read-Json {
    param([string]$Path)
    return Get-Content -Raw $Path | ConvertFrom-Json
}

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Get-IdSet {
    param([object[]]$Items, [string]$Property)
    return @($Items | ForEach-Object { $_.$Property } | Sort-Object)
}

function Read-Text {
    param([string]$Path)
    return Get-Content -Raw $Path
}

$core = Read-Json "core/capability-graph.json"
$tooling = Read-Json "manifests/tooling-manifest.json"
$adapterMatrix = Read-Json "manifests/adapter-matrix.json"
$candidateFamilies = Read-Json "manifests/candidate-families.json"
$familyRendering = Read-Json "manifests/family-rendering.json"
$renderingConventions = Read-Json "manifests/rendering-conventions.json"
$prey = Read-Json "prey/prey-sources.json"
$runtimeSurface = Read-Json "adapters/mcp/runtime-surface.json"
$genericBridge = Read-Json "adapters/generic-ide/bridge.manifest.json"
$teamsBridge = Read-Json "adapters/codex-teams/bridge.manifest.json"

$toolingIds = Get-IdSet -Items $tooling.candidateFamilies -Property "id"
$candidateIds = Get-IdSet -Items $candidateFamilies.families -Property "id"
$preyIds = Get-IdSet -Items $prey.candidateSources -Property "id"
$coreIds = @($core.absorptionPolicy.candidateRouting | ForEach-Object { $_.family } | Sort-Object)
$familyDefaultIds = @($adapterMatrix.familyDefaults | ForEach-Object { $_.family } | Sort-Object)
$familyRenderingIds = Get-IdSet -Items $familyRendering.families -Property "id"

Assert-True (($tooling.sourceOfTruth.renderingConventions -eq "manifests/rendering-conventions.json")) "tooling-manifest sourceOfTruth is missing renderingConventions."
Assert-True (-not (Compare-Object $toolingIds $candidateIds)) "candidate family IDs drift between tooling-manifest and candidate-families."
Assert-True (-not (Compare-Object $toolingIds $preyIds)) "candidate family IDs drift between tooling-manifest and prey registry."
Assert-True (-not (Compare-Object $toolingIds $coreIds)) "candidate family IDs drift between tooling-manifest and core candidate routing."
Assert-True (-not (Compare-Object $toolingIds $familyDefaultIds)) "candidate family IDs drift between tooling-manifest and adapter family defaults."
Assert-True (-not (Compare-Object $toolingIds $familyRenderingIds)) "candidate family IDs drift between tooling-manifest and family-rendering."
Assert-True (($runtimeSurface.toolSurfaceSource.manifests -contains "manifests/rendering-conventions.json")) "runtime-surface is missing rendering conventions."
Assert-True (($genericBridge.consumesTruth -contains "manifests/rendering-conventions.json")) "generic bridge is missing rendering conventions."
Assert-True (($teamsBridge.consumesTruth -contains "manifests/rendering-conventions.json")) "codex-teams bridge is missing rendering conventions."
Assert-True (($teamsBridge.consumesContext[0] -eq $renderingConventions.codexTeams.featureStatePathTemplate)) "codex-teams context path template drift detected."

$skillTemplate = Read-Text "templates/skill/SKILL.md.tmpl"
$hookTemplate = Read-Text "templates/hook/hook.json.tmpl"
$commandTemplate = Read-Text "templates/command/command.json.tmpl"
$mcpTemplate = Read-Text "templates/mcp/tool-schema.json.tmpl"

Assert-True ($skillTemplate.Contains("manifests/rendering-conventions.json")) "skill template is missing rendering conventions reference."
Assert-True ($hookTemplate.Contains("rendering_conventions")) "hook template is missing rendering conventions source."
Assert-True ($commandTemplate.Contains("rendering_conventions")) "command template is missing rendering conventions source."
Assert-True ($mcpTemplate.Contains("input_properties_json")) "mcp template is missing structured projection placeholders."

foreach ($family in $familyRendering.families) {
    Assert-True (-not [string]::IsNullOrWhiteSpace([string]$family.skill.purposeZh)) "family-rendering skill purpose missing: $($family.id)"
    Assert-True (-not [string]::IsNullOrWhiteSpace([string]$family.skill.triggerKeywordsZh)) "family-rendering skill trigger keywords missing: $($family.id)"
    Assert-True (-not [string]::IsNullOrWhiteSpace([string]$family.skill.boundariesZh)) "family-rendering skill boundaries missing: $($family.id)"
    Assert-True ($renderingConventions.hook.stages -contains $family.hook.stage) "family-rendering hook stage is not allowed: $($family.id)"
    Assert-True ($renderingConventions.hook.actionTypes -contains $family.hook.actionType) "family-rendering hook action type is not allowed: $($family.id)"
    Assert-True ($renderingConventions.command.entryKinds -contains $family.command.entryKind) "family-rendering command entry kind is not allowed: $($family.id)"
    Assert-True (($family.command.arguments -is [System.Array])) "family-rendering command arguments must be an array: $($family.id)"
}

$results = [ordered]@{
    jsonTruth = "passed"
    familyAlignment = "passed"
    templateAlignment = "passed"
    familyRendering = "passed"
}

if (-not $SkipGenerated -and (Test-Path -LiteralPath $GeneratedRoot)) {
    $summary = Read-Json (Join-Path $GeneratedRoot "summary.json")
    $projection = Read-Json (Join-Path $GeneratedRoot "mcp/tool-schema-projection.json")
    $serverEntry = Read-Json (Join-Path $GeneratedRoot "mcp/server-entry.json")
    $gatewayEntry = Read-Json (Join-Path $GeneratedRoot "mcp/gateway-entry.json")

    $expectedSkillCount = @($candidateFamilies.families | Where-Object { $_.preferredAdapters -contains "skill" }).Count
    $expectedHookCount = @($candidateFamilies.families | Where-Object { $_.preferredAdapters -contains "hook" }).Count
    $expectedCommandCount = @($candidateFamilies.families | Where-Object { $_.preferredAdapters -contains "command" }).Count

    Assert-True ($projection.toolCount -eq $core.modules.Count) "Generated MCP projection tool count does not match core module count."
    Assert-True ($summary.artifacts.skillCount -eq $expectedSkillCount) "Generated skill artifact count does not match family expectation."
    Assert-True ($summary.artifacts.hookCount -eq $expectedHookCount) "Generated hook artifact count does not match family expectation."
    Assert-True ($summary.artifacts.commandCount -eq $expectedCommandCount) "Generated command artifact count does not match family expectation."
    Assert-True ($serverEntry.entryShape -eq "server") "server-entry.json has unexpected entryShape."
    Assert-True ($gatewayEntry.entryShape -eq "gateway") "gateway-entry.json has unexpected entryShape."
    Assert-True ($projection.tools.Count -eq $core.modules.Count) "Projection tools list count does not match core modules."

    foreach ($tool in $projection.tools) {
        Assert-True (($tool.capabilities -is [System.Array])) "Projected tool capabilities must be an array: $($tool.tool_id)"
        Assert-True (($tool.input_schema.required -is [System.Array])) "Projected tool required args must be an array: $($tool.tool_id)"
    }

    $generatedFiles = Get-ChildItem -Recurse -File $GeneratedRoot
    foreach ($file in $generatedFiles) {
        $content = Read-Text $file.FullName
        Assert-True (-not ($content -match "{{.+?}}")) "Generated file still contains unreplaced template variables: $($file.FullName)"
    }

    $hookFiles = Get-ChildItem -File (Join-Path $GeneratedRoot "hook") -ErrorAction SilentlyContinue
    foreach ($file in $hookFiles) {
        $hook = Read-Json $file.FullName
        Assert-True (($hook.actions -is [System.Array])) "Generated hook actions must be an array: $($file.Name)"
        Assert-True (($hook.when.conditions -is [System.Array])) "Generated hook conditions must be an array: $($file.Name)"
    }

    $commandFiles = Get-ChildItem -File (Join-Path $GeneratedRoot "command") -ErrorAction SilentlyContinue
    foreach ($file in $commandFiles) {
        $command = Read-Json $file.FullName
        Assert-True (($command.arguments -is [System.Array])) "Generated command arguments must be an array: $($file.Name)"
        Assert-True (($command.capabilities -is [System.Array])) "Generated command capabilities must be an array: $($file.Name)"
    }

    $results.generatedArtifacts = "passed"
}

Write-Output ($results | ConvertTo-Json -Depth 10)
