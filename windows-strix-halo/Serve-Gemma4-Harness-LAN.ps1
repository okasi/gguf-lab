param(
    [ValidateSet("Start", "Stop", "List")]
    [string]$Action = "Start",
    [ValidateSet("gemma-4-12B-it-qat", "gemma-4-26B-A4B-it-qat")]
    [string]$Model = "gemma-4-26B-A4B-it-qat",
    [string]$PolicyPath = "",
    [int]$Port = 8080,
    [int]$AltPort = 13305,
    [int]$BackendPort = 18081,
    [int]$AsrBackendPort = 52625,
    [Alias("c")]
    [int]$CtxSize = 131072, # keep LAN fast prefill profile: 128K context max
    [int]$CacheReuse = 0, # cache reuse is opt-in; enable explicitly when needed
    [int]$BatchSize = 4096, # long-context prefill batch size
    [int]$UBatchSize = 1024, # long-context micro-batch size
    [int]$ThreadsBatch = 0,
    [ValidateSet("auto", "off")]
    [string]$Reasoning = "off",
    [switch]$DisableAsr,
    [switch]$DisableMtp
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$RepoRoot = Split-Path $Root -Parent

if (-not $PolicyPath) {
    $PolicyPath = Join-Path $RepoRoot "gemma4_harness\configs\gemma4_qat_q4_optimized_policy.json"
}

if ($Action -eq "List") {
    & (Join-Path $Root "Serve-LAN.ps1") -Action List
    return
}

if ($Action -eq "Stop") {
    & (Join-Path $Root "Serve-LAN.ps1") -Action Stop -Port $Port -AltPort $AltPort -BackendPort $BackendPort -AsrBackendPort $AsrBackendPort -DisableAsr:$DisableAsr
    return
}

$harnessModule = Join-Path $RepoRoot "gemma4_harness\processor.mjs"
if (-not (Test-Path -LiteralPath $PolicyPath)) {
    throw "Gemma harness policy not found: $PolicyPath"
}
if (-not (Test-Path -LiteralPath $harnessModule)) {
    throw "Gemma harness module not found: $harnessModule"
}

$env:HARNESS_POLICY = $PolicyPath
$env:HARNESS_MODULE = $harnessModule
$safeModel = ($Model.ToLower() -replace '[^a-z0-9]+', '-').Trim('-')
$env:HARNESS_LOG_JSONL = Join-Path $Root "logs\lan-$safeModel-gemma4-harness-adapter.jsonl"
$optimizedAlias = switch ($Model) {
    "gemma-4-12B-it-qat" { "gemma-4-12b-it-qat-optimized" }
    "gemma-4-26B-A4B-it-qat" { "gemma-4-26b-a4b-it-qat-optimized" }
}
$env:LAN_PUBLIC_MODEL_ALIASES = $optimizedAlias
$env:HARNESS_MODEL_ALIASES = $optimizedAlias

& (Join-Path $Root "Serve-LAN.ps1") `
    -Action Start `
    -Model $Model `
    -Port $Port `
    -AltPort $AltPort `
    -BackendPort $BackendPort `
    -AsrBackendPort $AsrBackendPort `
    -CtxSize $CtxSize `
    -CacheReuse $CacheReuse `
    -BatchSize $BatchSize `
    -UBatchSize $UBatchSize `
    -ThreadsBatch $ThreadsBatch `
    -Reasoning $Reasoning `
    -DisableAsr:$DisableAsr `
    -DisableMtp:$DisableMtp
