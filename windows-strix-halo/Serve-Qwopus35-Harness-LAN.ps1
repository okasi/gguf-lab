param(
    [ValidateSet("Start", "Stop")]
    [string]$Action = "Start",
    [string]$PolicyPath = "",
    [int]$Port = 8080,
    [int]$BackendPort = 18081,
    [Alias("c")]
    [int]$CtxSize = 0,
    [int]$CacheReuse = 0,
    [int]$BatchSize = 0,
    [int]$UBatchSize = 0,
    [int]$ThreadsBatch = 0,
    [ValidateSet("auto", "off")]
    [string]$Reasoning = "off"
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$RepoRoot = Split-Path $Root -Parent
if (-not $PolicyPath) {
    $PolicyPath = Join-Path $RepoRoot "qwen_harness\configs\qwopus35_optimized_policy.json"
}

if ($Action -eq "Stop") {
    & (Join-Path $Root "Serve-LAN.ps1") -Action Stop -Port $Port -BackendPort $BackendPort
    return
}

$env:HARNESS_POLICY = $PolicyPath
$env:HARNESS_MODULE = Join-Path $RepoRoot "qwen_harness\processor.mjs"
$env:HARNESS_LOG_JSONL = Join-Path $Root "logs\lan-qwopus35-harness-adapter.jsonl"

& (Join-Path $Root "Serve-LAN.ps1") -Action Start -Model "Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M" -Port $Port -BackendPort $BackendPort -CtxSize $CtxSize -CacheReuse $CacheReuse -BatchSize $BatchSize -UBatchSize $UBatchSize -ThreadsBatch $ThreadsBatch -Reasoning $Reasoning
