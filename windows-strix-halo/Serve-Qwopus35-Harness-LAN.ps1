param(
    [ValidateSet("Start", "Stop")]
    [string]$Action = "Start",
    [string]$PolicyPath = "",
    [int]$Port = 8080,
    [int]$BackendPort = 18081
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$RepoRoot = Split-Path $Root -Parent
if (-not $PolicyPath) {
    $PolicyPath = Join-Path $RepoRoot "qwen_benchloop_harness\configs\qwopus35_optimized_policy.json"
}

if ($Action -eq "Stop") {
    & (Join-Path $Root "Serve-LAN.ps1") -Action Stop -Port $Port -BackendPort $BackendPort
    return
}

$env:HARNESS_POLICY = $PolicyPath
$env:HARNESS_MODULE = Join-Path $RepoRoot "qwen_benchloop_harness\processor.mjs"
$env:HARNESS_LOG_JSONL = Join-Path $Root "logs\lan-qwopus35-harness-adapter.jsonl"

& (Join-Path $Root "Serve-LAN.ps1") -Action Start -Model "Qwopus3.6-35B-A3B-v1" -Port $Port -BackendPort $BackendPort
