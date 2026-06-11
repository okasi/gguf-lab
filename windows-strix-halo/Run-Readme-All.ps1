param(
    [switch]$Resume,
    [switch]$Fresh,
    [switch]$BenchLoopOnly,
    [switch]$HardTsOnly
)

$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$TableModels = @(
    "Unsloth-Gemma4-E2B-it-QAT-UD-Q4_K_XL",
    "Unsloth-Gemma4-E4B-it-QAT-UD-Q4_K_XL",
    "Unsloth-Gemma4-12B-it-QAT-UD-Q4_K_XL",
    "Unsloth-Gemma4-26B-A4B-it-QAT-UD-Q4_K_XL",
    "Unsloth-Gemma4-31B-it-QAT-UD-Q4_K_XL",
    "Jackrong-Qwopus3.6-35B-A3B-v1-IQ4_XS",
    "Jackrong-Qwopus3.6-27B-v2-MTP-IQ4_XS",
    "Jackrong-Qwopus3.6-35B-A3B-v1-Q5_K_M",
    "Jackrong-Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M-nmax2"
)

$GemmaModels = @($TableModels | Where-Object { $_ -match 'Gemma4' })
$QwopusBaseModels = @(
    "Jackrong-Qwopus3.6-35B-A3B-v1-IQ4_XS",
    "Jackrong-Qwopus3.6-27B-v2-MTP-IQ4_XS",
    "Jackrong-Qwopus3.6-35B-A3B-v1-Q5_K_M"
)

$ReasoningOnBenchExport = Join-Path $LogDir "readme-refresh-benchloop-export.json"
$ReasoningOnHardTsCsv = Join-Path $LogDir "readme-refresh-personal-results.csv"
$RunnerLog = Join-Path $LogDir "readme-all-runner.out.log"
$BenchLoop = Join-Path $Root ".venv-benchloop\Scripts\benchloop.exe"

function Stop-BenchmarkPorts {
    foreach ($port in @(18080, 19380, 19381)) {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            if ($conn.OwningProcess) {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    }
    Get-Process llama-server -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

function ConvertTo-PlainHashtable {
    param($Value)
    if ($null -eq $Value) { return $null }
    if ($Value -is [System.Collections.IDictionary]) {
        $hash = @{}
        foreach ($key in $Value.Keys) { $hash[$key] = ConvertTo-PlainHashtable -Value $Value[$key] }
        return $hash
    }
    if ($Value -is [array]) {
        $items = @()
        foreach ($item in $Value) { $items += ConvertTo-PlainHashtable -Value $item }
        return $items
    }
    if ($Value -is [pscustomobject]) {
        $hash = @{}
        foreach ($prop in $Value.PSObject.Properties) { $hash[$prop.Name] = ConvertTo-PlainHashtable -Value $prop.Value }
        return $hash
    }
    return $Value
}

function Get-TableAliases {
    $modelsJson = Join-Path $Root "readme-models.json"
    $aliases = @()
    foreach ($parsed in (Get-Content -LiteralPath $modelsJson -Raw | ConvertFrom-Json)) {
        $item = ConvertTo-PlainHashtable -Value $parsed
        if ($TableModels -notcontains [string]$item.Name) { continue }
        $aliases += [string]$item.Alias
    }
    return $aliases
}

if ($Fresh) {
    $Resume = $false
    Stop-BenchmarkPorts
    foreach ($path in @(
        (Join-Path $LogDir "readme-noreason-hard-ts-RESULTS.csv"),
        (Join-Path $LogDir "readme-noreason-nmax2-hard-ts-RESULTS.csv"),
        (Join-Path $LogDir "readme-noreason-mtp2-hard-ts-RESULTS.csv"),
        $ReasoningOnHardTsCsv
    )) {
        Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
    }
}

$rerun = if ($Fresh) { $TableModels } else { @() }
$common = @{
    RerunModels = $rerun
    Resume = $Resume.IsPresent
    Fresh = $false
    BenchLoopOnly = $BenchLoopOnly.IsPresent
    HardTsOnly = $HardTsOnly.IsPresent
}

"$(Get-Date -Format o) Run-Readme-All.ps1 Fresh=$Fresh Resume=$Resume" | Out-File -Encoding utf8 $RunnerLog

if (-not $HardTsOnly) {
    $aliases = Get-TableAliases
    "$(Get-Date -Format o) phase 1: reasoning-on benchloop ($($aliases.Count) aliases)" | Out-File -Encoding utf8 -Append $RunnerLog
    & (Join-Path $Root "Run-BenchLoop.ps1") -OnlyAliases $aliases -Reasoning auto *>> (Join-Path $LogDir "readme-all-reasoning-on-benchloop.out.log")
    "$(Get-Date -Format o) Run-BenchLoop.ps1 (reasoning on) exit $LASTEXITCODE" | Out-File -Encoding utf8 -Append $RunnerLog
    if (Test-Path -LiteralPath $BenchLoop) {
        & $BenchLoop export | Out-File -Encoding utf8 -LiteralPath $ReasoningOnBenchExport
        "$(Get-Date -Format o) exported reasoning-on benchloop -> $ReasoningOnBenchExport" | Out-File -Encoding utf8 -Append $RunnerLog
    }
}

if (-not $BenchLoopOnly) {
    "$(Get-Date -Format o) phase 1b: reasoning-on hard-ts" | Out-File -Encoding utf8 -Append $RunnerLog
    $hardOnArgs = @{
        Reasoning = "auto"
        CodeMaxTokens = 7168
        ResultNameOverride = "readme-refresh-personal-results.csv"
        OnlyModels = $TableModels
    }
    if ($Resume) { $hardOnArgs.KeepResults = $true }
    & (Join-Path $Root "Run-Hard-Typescript.ps1") @hardOnArgs *>> (Join-Path $LogDir "readme-all-reasoning-on-hard-ts.out.log")
    "$(Get-Date -Format o) Run-Hard-Typescript.ps1 (reasoning on) exit $LASTEXITCODE" | Out-File -Encoding utf8 -Append $RunnerLog
}

if (-not $HardTsOnly) {
    "$(Get-Date -Format o) phase 2: gemma reasoning-off MTP nmax2" | Out-File -Encoding utf8 -Append $RunnerLog
    & (Join-Path $Root "Run-Readme-Gemma4-NoReasoning-Nmax2.ps1") @common -OnlyModels $GemmaModels *>> (Join-Path $LogDir "readme-all-gemma-nmax2.out.log")
    "$(Get-Date -Format o) Run-Readme-Gemma4-NoReasoning-Nmax2.ps1 exit $LASTEXITCODE" | Out-File -Encoding utf8 -Append $RunnerLog

    "$(Get-Date -Format o) phase 3: qwopus reasoning-off base" | Out-File -Encoding utf8 -Append $RunnerLog
    & (Join-Path $Root "Run-Readme-NoReasoning.ps1") @common -OnlyModels $QwopusBaseModels *>> (Join-Path $LogDir "readme-all-qwopus-base.out.log")
    "$(Get-Date -Format o) Run-Readme-NoReasoning.ps1 (qwopus base) exit $LASTEXITCODE" | Out-File -Encoding utf8 -Append $RunnerLog

    "$(Get-Date -Format o) phase 4: qwopus 35B MTP nmax2 reasoning-off" | Out-File -Encoding utf8 -Append $RunnerLog
    & (Join-Path $Root "Run-Readme-Mtp35B-Nmax2.ps1") @common *>> (Join-Path $LogDir "readme-all-mtp35b-nmax2.out.log")
    "$(Get-Date -Format o) Run-Readme-Mtp35B-Nmax2.ps1 exit $LASTEXITCODE" | Out-File -Encoding utf8 -Append $RunnerLog
}

"$(Get-Date -Format o) exporting README benchmark table" | Out-File -Encoding utf8 -Append $RunnerLog
$exportArgs = @{
    ReasoningOnBenchExportJson = $ReasoningOnBenchExport
    ReasoningOnHardTsCsv = $ReasoningOnHardTsCsv
}
& (Join-Path $Root "Export-ReadmeBenchmarkTable.ps1") @exportArgs *>> $RunnerLog
"$(Get-Date -Format o) Export-ReadmeBenchmarkTable.ps1 exit $LASTEXITCODE" | Out-File -Encoding utf8 -Append $RunnerLog
"$(Get-Date -Format o) Run-Readme-All.ps1 complete" | Out-File -Encoding utf8 -Append $RunnerLog
