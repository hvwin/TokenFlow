param(
    [string]$OutputRoot = "examples/generated",
    [string]$HostCapability = "ide-agent",
    [string]$FeatureSlug = "tokenflow",
    [switch]$Clean
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Read-Json {
    param([string]$Path)
    return Get-Content -Raw $Path | ConvertFrom-Json
}

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Convert-JsonFragment {
    param(
        [Parameter(Mandatory = $true)]$Value,
        [int]$Indent = 0
    )

    $lines = (ConvertTo-Json -InputObject $Value -Depth 100) -split "`r?`n"
    if ($lines.Count -le 1) {
        return $lines[0]
    }

    $prefix = " " * $Indent
    $result = @($lines[0])
    for ($i = 1; $i -lt $lines.Count; $i++) {
        $result += ($prefix + $lines[$i])
    }
    return ($result -join "`n")
}

function Expand-Template {
    param(
        [string]$Template,
        [hashtable]$Variables
    )

    $expanded = $Template
    foreach ($key in $Variables.Keys) {
        $expanded = $expanded.Replace("{{${key}}}", [string]$Variables[$key])
    }
    return $expanded
}

function Normalize-Key {
    param([string]$Value)
    return (($Value -replace "[^A-Za-z0-9]", "").ToLowerInvariant())
}

function Get-RelativeOutputPath {
    param(
        [string]$RootPath,
        [string]$TargetPath
    )

    $rootUri = [System.Uri]((Resolve-Path $RootPath).Path.TrimEnd('\') + '\')
    $targetUri = [System.Uri](Resolve-Path $TargetPath).Path
    return $rootUri.MakeRelativeUri($targetUri).ToString().Replace('\', '/')
}

function Get-ModuleSource {
    param(
        [pscustomobject]$Registry,
        [string]$ModuleId
    )

    $map = @{
        "router"   = "Router"
        "tokeneff" = "TokenEff"
        "toolkit"  = "Toolkit"
        "openwolf" = "OpenWolf"
        "caveman"  = "Caveman"
    }

    $target = Normalize-Key $map[$ModuleId]
    return $Registry.sources | Where-Object { (Normalize-Key $_.id) -eq $target } | Select-Object -First 1
}

function Get-InputPropertySpec {
    param([string]$Name)

    switch ($Name) {
        "contextWindow" {
            return [ordered]@{
                type = "number"
                description = "Context window size or token budget ceiling."
            }
        }
        { $_ -in @("hostCapabilities", "availableAdapters", "toolSurface", "history", "externalSources") } {
            return [ordered]@{
                type = "array"
                items = [ordered]@{ type = "string" }
                description = "List input for $Name."
            }
        }
        default {
            return [ordered]@{
                type = "string"
                description = "Input field $Name."
            }
        }
    }
}

function Get-FamilyRendering {
    param(
        [pscustomobject]$Rendering,
        [string]$FamilyId
    )

    $familyRendering = $Rendering.families | Where-Object { $_.id -eq $FamilyId } | Select-Object -First 1
    if (-not $familyRendering) {
        throw "Unsupported family id: $FamilyId"
    }

    return [ordered]@{
        purposeZh         = $familyRendering.skill.purposeZh
        triggerKeywordsZh = $familyRendering.skill.triggerKeywordsZh
        boundariesZh      = $familyRendering.skill.boundariesZh
        hookStage         = $familyRendering.hook.stage
        hookEvent         = $familyRendering.hook.event
        hookActionType    = $familyRendering.hook.actionType
        hookActionRef     = $familyRendering.hook.actionRef
        commandEntryKind  = $familyRendering.command.entryKind
        commandEntryRef   = $familyRendering.command.entryRef
        commandArgs       = @($familyRendering.command.arguments)
    }
}

if ($Clean -and (Test-Path -LiteralPath $OutputRoot)) {
    Remove-Item -LiteralPath $OutputRoot -Recurse -Force
}

$core = Read-Json "core/capability-graph.json"
$tooling = Read-Json "manifests/tooling-manifest.json"
$adapterMatrix = Read-Json "manifests/adapter-matrix.json"
$candidateFamilies = Read-Json "manifests/candidate-families.json"
$familyRendering = Read-Json "manifests/family-rendering.json"
$renderingConventions = Read-Json "manifests/rendering-conventions.json"
$prey = Read-Json "prey/prey-sources.json"
$runtimeSurface = Read-Json "adapters/mcp/runtime-surface.json"

$mcpTemplate = Get-Content -Raw "templates/mcp/tool-schema.json.tmpl"
$skillTemplate = Get-Content -Raw "templates/skill/SKILL.md.tmpl"
$hookTemplate = Get-Content -Raw "templates/hook/hook.json.tmpl"
$commandTemplate = Get-Content -Raw "templates/command/command.json.tmpl"

Ensure-Directory $OutputRoot
Ensure-Directory (Join-Path $OutputRoot "mcp")
Ensure-Directory (Join-Path $OutputRoot "mcp/tools")
Ensure-Directory (Join-Path $OutputRoot "skill")
Ensure-Directory (Join-Path $OutputRoot "hook")
Ensure-Directory (Join-Path $OutputRoot "command")

$hostEntry = $adapterMatrix.hostMatrix | Where-Object { $_.hostCapability -eq $HostCapability } | Select-Object -First 1
$recommendedAdapters = @()
if ($hostEntry) {
    $recommendedAdapters = @($hostEntry.recommendedAdapters)
}

$preferredEntryShape = if ($HostCapability -eq "mcp") { "server" } else { "gateway" }
$toolSchemas = @()

foreach ($module in $core.modules) {
    $source = Get-ModuleSource -Registry $prey -ModuleId $module.id
    $toolId = "tokenflow-$($module.id)"
    $titleZh = if ($source) { [string]$source.title } else { "TokenFlow $($module.id)" }
    $descriptionZh = "$titleZh 能力入口。职责: $($module.outputs -join ', ')。"

    $properties = [ordered]@{}
    foreach ($inputName in $module.inputs) {
        $properties[$inputName] = Get-InputPropertySpec -Name $inputName
    }

    $schemaVariables = @{
        tool_id              = $toolId
        title_zh             = $titleZh
        description_zh       = $descriptionZh
        entry_shape          = $preferredEntryShape
        capabilities_json    = Convert-JsonFragment -Value @($module.id) -Indent 2
        input_properties_json = Convert-JsonFragment -Value $properties -Indent 4
        required_args_json   = Convert-JsonFragment -Value @($module.inputs) -Indent 4
    }

    $toolContent = Expand-Template -Template $mcpTemplate -Variables $schemaVariables
    $toolPath = Join-Path $OutputRoot "mcp/tools/$toolId.json"
    Set-Content -LiteralPath $toolPath -Value $toolContent -Encoding utf8

    $toolSchemas += (Get-Content -Raw $toolPath | ConvertFrom-Json)
}

$familyBinding = @{}
foreach ($route in $core.absorptionPolicy.candidateRouting) {
    if (-not $familyBinding.ContainsKey($route.target)) {
        $familyBinding[$route.target] = @()
    }
    $familyBinding[$route.target] += $route.family
}

$projection = [ordered]@{
    version = 1
    product = "TokenFlow"
    adapterId = "mcp"
    hostCapability = $HostCapability
    preferredEntryShape = $preferredEntryShape
    availableEntryShapes = @($renderingConventions.mcp.entryShapes)
    recommendedAdapters = $recommendedAdapters
    toolCount = $toolSchemas.Count
    toolIds = @($toolSchemas | ForEach-Object { $_.tool_id })
    moduleFamilyBindings = $familyBinding
    tools = $toolSchemas
}
$projectionPath = Join-Path $OutputRoot "mcp/tool-schema-projection.json"
$projection | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $projectionPath -Encoding utf8

$serverEntry = [ordered]@{
    version = 1
    adapterId = "mcp"
    entryShape = "server"
    hostCapability = "mcp"
    status = "ready-for-runtime"
    toolIds = @($projection.toolIds)
    sourceProjection = "tool-schema-projection.json"
    runtimeHints = [ordered]@{
        mode = "host-native"
        recommendedAdapters = @("mcp")
    }
}
$serverEntry | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath (Join-Path $OutputRoot "mcp/server-entry.json") -Encoding utf8

$gatewayEntry = [ordered]@{
    version = 1
    adapterId = "mcp"
    entryShape = "gateway"
    hostCapability = $HostCapability
    status = "ready-for-runtime"
    toolIds = @($projection.toolIds)
    sourceProjection = "tool-schema-projection.json"
    runtimeHints = [ordered]@{
        mode = "bridge"
        recommendedAdapters = $recommendedAdapters
    }
}
$gatewayEntry | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath (Join-Path $OutputRoot "mcp/gateway-entry.json") -Encoding utf8

$generatedSkills = @()
$generatedHooks = @()
$generatedCommands = @()

foreach ($family in $candidateFamilies.families) {
    $copy = Get-FamilyRendering -Rendering $familyRendering -FamilyId $family.id

    if ($family.preferredAdapters -contains "skill") {
        $skillDir = Join-Path $OutputRoot "skill/$($family.id)"
        Ensure-Directory $skillDir
        $skillVariables = @{
            skill_name            = "tokenflow-$($family.id)"
            skill_description_zh  = "用途：$($copy.purposeZh) 触发关键词：$($copy.triggerKeywordsZh)。边界：$($copy.boundariesZh)"
            skill_title_zh        = "TokenFlow $($family.title) Skill"
            purpose_zh            = $copy.purposeZh
            trigger_keywords_zh   = $copy.triggerKeywordsZh
            boundaries_zh         = $copy.boundariesZh
            capability_ids_csv    = $family.preferredCore
            tool_ids_csv          = ($family.preferredAdapters -join ", ")
        }
        $skillContent = Expand-Template -Template $skillTemplate -Variables $skillVariables
        $skillPath = Join-Path $skillDir "SKILL.md"
        Set-Content -LiteralPath $skillPath -Value $skillContent -Encoding utf8
        $generatedSkills += $skillPath
    }

    if ($family.preferredAdapters -contains "hook") {
        $hookVariables = @{
            hook_id       = "tokenflow-$($family.id)-hook"
            title_zh      = "TokenFlow $($family.title) Hook"
            host_id       = $HostCapability
            stage         = $copy.hookStage
            enabled_json  = "true"
            event_name    = $copy.hookEvent
            conditions_json = Convert-JsonFragment -Value @(
                "hostCapability == '$HostCapability'",
                "familyStatus == '$($family.status)'"
            ) -Indent 4
            actions_json  = Convert-JsonFragment -Value @(
                [ordered]@{
                    type = $copy.hookActionType
                    ref = $copy.hookActionRef
                    input_map = [ordered]@{
                        capability_id = $family.preferredCore
                        family_id = $family.id
                    }
                }
            ) -Indent 2
        }
        $hookContent = Expand-Template -Template $hookTemplate -Variables $hookVariables
        $hookPath = Join-Path $OutputRoot "hook/tokenflow-$($family.id).json"
        Set-Content -LiteralPath $hookPath -Value $hookContent -Encoding utf8
        $generatedHooks += $hookPath
    }

    if ($family.preferredAdapters -contains "command") {
        $commandVariables = @{
            command_id       = "tokenflow-$($family.id)"
            title_zh         = "TokenFlow $($family.title) Command"
            host_id          = $HostCapability
            entry_kind       = $copy.commandEntryKind
            entry_ref        = $copy.commandEntryRef
            arguments_json   = Convert-JsonFragment -Value $copy.commandArgs -Indent 2
            capabilities_json = Convert-JsonFragment -Value @($family.preferredCore) -Indent 2
        }
        $commandContent = Expand-Template -Template $commandTemplate -Variables $commandVariables
        $commandPath = Join-Path $OutputRoot "command/tokenflow-$($family.id).json"
        Set-Content -LiteralPath $commandPath -Value $commandContent -Encoding utf8
        $generatedCommands += $commandPath
    }
}

$summary = [ordered]@{
    version = 1
    generatedAt = (Get-Date).ToString("o")
    outputRoot = $OutputRoot
    hostCapability = $HostCapability
    featureSlug = $FeatureSlug
    preferredEntryShape = $preferredEntryShape
    recommendedAdapters = $recommendedAdapters
    artifacts = [ordered]@{
        mcpTools = @($projection.toolIds)
        skillCount = $generatedSkills.Count
        hookCount = $generatedHooks.Count
        commandCount = $generatedCommands.Count
    }
    paths = [ordered]@{
        projection = "mcp/tool-schema-projection.json"
        serverEntry = "mcp/server-entry.json"
        gatewayEntry = "mcp/gateway-entry.json"
        skills = @($generatedSkills | ForEach-Object { Get-RelativeOutputPath -RootPath $OutputRoot -TargetPath $_ })
        hooks = @($generatedHooks | ForEach-Object { Get-RelativeOutputPath -RootPath $OutputRoot -TargetPath $_ })
        commands = @($generatedCommands | ForEach-Object { Get-RelativeOutputPath -RootPath $OutputRoot -TargetPath $_ })
    }
}
$summary | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath (Join-Path $OutputRoot "summary.json") -Encoding utf8

Write-Output "Generated TokenFlow artifacts under $OutputRoot"
Write-Output ($summary | ConvertTo-Json -Depth 100)
