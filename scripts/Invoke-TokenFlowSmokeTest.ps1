param(
    [string]$OutputRoot = "examples/smoke-test",
    [string]$HostCapability = "ide-agent",
    [switch]$SkipCleanup
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:TestResults = @{
    passed = @()
    failed = @()
    skipped = @()
}

function Write-TestHeader {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Write-TestPass {
    param([string]$Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
    $script:TestResults.passed += $Message
}

function Write-TestFail {
    param([string]$Message, [string]$Detail = "")
    Write-Host "[FAIL] $Message" -ForegroundColor Red
    if ($Detail) {
        Write-Host "       $Detail" -ForegroundColor Yellow
    }
    $script:TestResults.failed += $Message
}

function Write-TestSkip {
    param([string]$Message)
    Write-Host "[SKIP] $Message" -ForegroundColor Yellow
    $script:TestResults.skipped += $Message
}

function Test-JsonFile {
    param([string]$Path, [string]$Description)
    
    if (-not (Test-Path -LiteralPath $Path)) {
        Write-TestFail "$Description - file not found" $Path
        return $false
    }
    
    try {
        $content = Get-Content -Raw $Path | ConvertFrom-Json
        Write-TestPass "$Description - valid JSON"
        return $true
    } catch {
        Write-TestFail "$Description - invalid JSON" $_.Exception.Message
        return $false
    }
}

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

# ============================================================
# Phase 1: Generation
# ============================================================
Write-TestHeader "Phase 1: Generation"

try {
    $generationOutput = & "$PSScriptRoot\Invoke-TokenFlowGeneration.ps1" `
        -OutputRoot $OutputRoot `
        -HostCapability $HostCapability `
        -Clean
    
    Write-TestPass "Generation script executed successfully"
    
    # Verify generation output structure
    if (Test-Path -LiteralPath $OutputRoot) {
        Write-TestPass "Output root directory created"
    } else {
        Write-TestFail "Output root directory not created"
        throw "Generation failed to create output directory"
    }
    
    # Check summary.json
    $summaryPath = Join-Path $OutputRoot "summary.json"
    if (Test-JsonFile -Path $summaryPath -Description "summary.json") {
        $summary = Get-Content -Raw $summaryPath | ConvertFrom-Json
        
        if ($summary.artifacts.mcpTools.Count -gt 0) {
            Write-TestPass "MCP tools generated ($($summary.artifacts.mcpTools.Count) tools)"
        } else {
            Write-TestFail "No MCP tools generated"
        }
        
        if ($summary.artifacts.skillCount -ge 0) {
            Write-TestPass "Skills generated ($($summary.artifacts.skillCount) skills)"
        }
        
        if ($summary.artifacts.hookCount -ge 0) {
            Write-TestPass "Hooks generated ($($summary.artifacts.hookCount) hooks)"
        }
        
        if ($summary.artifacts.commandCount -ge 0) {
            Write-TestPass "Commands generated ($($summary.artifacts.commandCount) commands)"
        }
    }
    
    # Check MCP projection
    $projectionPath = Join-Path $OutputRoot "mcp/tool-schema-projection.json"
    if (Test-JsonFile -Path $projectionPath -Description "MCP projection") {
        $projection = Get-Content -Raw $projectionPath | ConvertFrom-Json
        
        if ($projection.tools -and $projection.tools.Count -gt 0) {
            Write-TestPass "MCP projection contains tools ($($projection.tools.Count) tools)"
        } else {
            Write-TestFail "MCP projection has no tools"
        }
        
        if ($projection.toolIds -and $projection.toolIds.Count -eq $projection.tools.Count) {
            Write-TestPass "MCP projection toolIds match tools count"
        } else {
            Write-TestFail "MCP projection toolIds mismatch"
        }
    }
    
    # Check entry files
    Test-JsonFile -Path (Join-Path $OutputRoot "mcp/server-entry.json") -Description "MCP server entry" | Out-Null
    Test-JsonFile -Path (Join-Path $OutputRoot "mcp/gateway-entry.json") -Description "MCP gateway entry" | Out-Null
    
} catch {
    Write-TestFail "Generation phase failed" $_.Exception.Message
    throw
}

# ============================================================
# Phase 2: Validation
# ============================================================
Write-TestHeader "Phase 2: Validation"

try {
    $validationOutput = & "$PSScriptRoot\Invoke-TokenFlowValidation.ps1" `
        -GeneratedRoot $OutputRoot
    
    $validationResult = $validationOutput | ConvertFrom-Json
    
    if ($validationResult.jsonTruth -eq "passed") {
        Write-TestPass "JSON truth validation passed"
    } else {
        Write-TestFail "JSON truth validation failed"
    }
    
    if ($validationResult.familyAlignment -eq "passed") {
        Write-TestPass "Family alignment validation passed"
    } else {
        Write-TestFail "Family alignment validation failed"
    }
    
    if ($validationResult.templateAlignment -eq "passed") {
        Write-TestPass "Template alignment validation passed"
    } else {
        Write-TestFail "Template alignment validation failed"
    }
    
    if ($validationResult.familyRendering -eq "passed") {
        Write-TestPass "Family rendering validation passed"
    } else {
        Write-TestFail "Family rendering validation failed"
    }
    
    if ($validationResult.generatedArtifacts -eq "passed") {
        Write-TestPass "Generated artifacts validation passed"
    } else {
        Write-TestFail "Generated artifacts validation failed"
    }
    
} catch {
    Write-TestFail "Validation phase failed" $_.Exception.Message
    throw
}

# ============================================================
# Phase 3: TypeScript Runtime Verification
# ============================================================
Write-TestHeader "Phase 3: TypeScript Runtime Verification"

try {
    $npmVerifyOutput = npm run verify 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-TestFail "npm run verify failed" ($npmVerifyOutput -join "`n")
        throw "npm run verify failed"
    }
    Write-TestPass "npm run verify passed"
} catch {
    Write-TestFail "TypeScript runtime verification failed" $_.Exception.Message
    throw
}

# ============================================================
# Phase 4: Runtime Load Test
# ============================================================
Write-TestHeader "Phase 4: Runtime Load Test"

try {
    # Create a simple Node.js test script to verify runtime loading
    $jsContent = @"
import { readFileSync } from 'fs';
import { join } from 'path';

const outputRoot = process.argv[2];

try {
    const projectionPath = join(outputRoot, 'mcp/tool-schema-projection.json');
    const serverEntryPath = join(outputRoot, 'mcp/server-entry.json');
    const gatewayEntryPath = join(outputRoot, 'mcp/gateway-entry.json');
    
    const projection = JSON.parse(readFileSync(projectionPath, 'utf-8'));
    const serverEntry = JSON.parse(readFileSync(serverEntryPath, 'utf-8'));
    const gatewayEntry = JSON.parse(readFileSync(gatewayEntryPath, 'utf-8'));
    
    const bundle = {
        projection,
        serverEntry,
        gatewayEntry
    };
    
    // Verify bundle structure
    if (!bundle.projection.tools || bundle.projection.tools.length === 0) {
        throw new Error('Projection has no tools');
    }
    
    if (bundle.serverEntry.entryShape !== 'server') {
        throw new Error('Server entry has wrong shape');
    }
    
    if (bundle.gatewayEntry.entryShape !== 'gateway') {
        throw new Error('Gateway entry has wrong shape');
    }
    
    // Simulate runtime selection
    const selectedEntry = bundle.serverEntry.hostCapability === 'mcp' 
        ? bundle.serverEntry 
        : bundle.gatewayEntry;
    
    if (selectedEntry.status !== 'ready-for-runtime') {
        throw new Error('Selected entry not ready for runtime');
    }
    
    // Verify tool IDs consistency
    const projectionToolIds = new Set(bundle.projection.toolIds);
    const entryToolIds = new Set(selectedEntry.toolIds);
    
    if (projectionToolIds.size !== entryToolIds.size) {
        throw new Error('Tool ID count mismatch between projection and entry');
    }
    
    for (const toolId of entryToolIds) {
        if (!projectionToolIds.has(toolId)) {
            throw new Error('Tool ID ' + toolId + ' in entry but not in projection');
        }
    }
    
    console.log(JSON.stringify({
        success: true,
        toolCount: bundle.projection.tools.length,
        toolIds: bundle.projection.toolIds,
        selectedEntryShape: selectedEntry.entryShape,
        hostCapability: selectedEntry.hostCapability
    }));
    
} catch (error) {
    console.error(JSON.stringify({
        success: false,
        error: error.message
    }));
    process.exit(1);
}
"@
    
    $runtimeTestPath = Join-Path $OutputRoot "runtime-load-test.mjs"
    Set-Content -LiteralPath $runtimeTestPath -Value $jsContent -Encoding utf8
    
    # Check if Node.js is available
    $nodeAvailable = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
    
    if ($nodeAvailable) {
        $runtimeOutput = node $runtimeTestPath $OutputRoot 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $runtimeResult = $runtimeOutput | ConvertFrom-Json
            
            if ($runtimeResult.success) {
                Write-TestPass "Runtime bundle loaded successfully"
                Write-TestPass "Runtime tool count: $($runtimeResult.toolCount)"
                Write-TestPass "Runtime selected entry shape: $($runtimeResult.selectedEntryShape)"
            } else {
                Write-TestFail "Runtime load failed" $runtimeResult.error
            }
        } else {
            Write-TestFail "Runtime test script failed" $runtimeOutput
        }
    } else {
        Write-TestSkip "Runtime load test (Node.js not available)"
    }
    
} catch {
    Write-TestFail "Runtime load test failed" $_.Exception.Message
}

# ============================================================
# Phase 5: Artifact Integrity Check
# ============================================================
Write-TestHeader "Phase 5: Artifact Integrity Check"

try {
    $summary = Get-Content -Raw (Join-Path $OutputRoot "summary.json") | ConvertFrom-Json
    
    # Check all referenced skill files exist
    foreach ($skillPath in $summary.paths.skills) {
        $fullPath = Join-Path $OutputRoot $skillPath
        if (Test-Path -LiteralPath $fullPath) {
            Write-TestPass "Skill file exists: $skillPath"
        } else {
            Write-TestFail "Skill file missing: $skillPath"
        }
    }
    
    # Check all referenced hook files exist
    foreach ($hookPath in $summary.paths.hooks) {
        $fullPath = Join-Path $OutputRoot $hookPath
        if (Test-Path -LiteralPath $fullPath) {
            Write-TestPass "Hook file exists: $hookPath"
        } else {
            Write-TestFail "Hook file missing: $hookPath"
        }
    }
    
    # Check all referenced command files exist
    foreach ($commandPath in $summary.paths.commands) {
        $fullPath = Join-Path $OutputRoot $commandPath
        if (Test-Path -LiteralPath $fullPath) {
            Write-TestPass "Command file exists: $commandPath"
        } else {
            Write-TestFail "Command file missing: $commandPath"
        }
    }
    
    # Check all MCP tool files exist
    foreach ($toolId in $summary.artifacts.mcpTools) {
        $toolPath = Join-Path $OutputRoot "mcp/tools/$toolId.json"
        if (Test-Path -LiteralPath $toolPath) {
            Write-TestPass "MCP tool file exists: $toolId"
        } else {
            Write-TestFail "MCP tool file missing: $toolId"
        }
    }
    
} catch {
    Write-TestFail "Artifact integrity check failed" $_.Exception.Message
}

# ============================================================
# Final Report
# ============================================================
Write-TestHeader "Smoke Test Summary"

$totalTests = $script:TestResults.passed.Count + $script:TestResults.failed.Count + $script:TestResults.skipped.Count

Write-Host "`nTotal Tests: $totalTests" -ForegroundColor White
Write-Host "Passed:      $($script:TestResults.passed.Count)" -ForegroundColor Green
Write-Host "Failed:      $($script:TestResults.failed.Count)" -ForegroundColor Red
Write-Host "Skipped:     $($script:TestResults.skipped.Count)" -ForegroundColor Yellow

# Save test results
$testReport = @{
    timestamp = (Get-Date).ToString("o")
    outputRoot = $OutputRoot
    hostCapability = $HostCapability
    summary = @{
        total = $totalTests
        passed = $script:TestResults.passed.Count
        failed = $script:TestResults.failed.Count
        skipped = $script:TestResults.skipped.Count
    }
    results = @{
        passed = $script:TestResults.passed
        failed = $script:TestResults.failed
        skipped = $script:TestResults.skipped
    }
}

$reportPath = Join-Path $OutputRoot "smoke-test-report.json"
$testReport | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $reportPath -Encoding utf8

Write-Host "`nTest report saved to: $reportPath" -ForegroundColor Cyan

# Cleanup runtime test script if requested
if (-not $SkipCleanup) {
    $runtimeTestPath = Join-Path $OutputRoot "runtime-load-test.mjs"
    if (Test-Path -LiteralPath $runtimeTestPath) {
        Remove-Item -LiteralPath $runtimeTestPath -Force
    }
}

# Exit with appropriate code
if ($script:TestResults.failed.Count -gt 0) {
    Write-Host "`n[SMOKE TEST FAILED]" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n[SMOKE TEST PASSED]" -ForegroundColor Green
    exit 0
}
