param(
    [string[]]$OnlyModels = @(),
    [string[]]$RerunModels = @(),
    [switch]$Resume,
    [switch]$Fresh,
    [switch]$BenchLoopOnly,
    [switch]$HardTsOnly
)

$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
$ModelsJson = Join-Path $Root "readme-models.json"
$AliasSuffix = "-noreason"
$HardTsCsv = Join-Path $LogDir "readme-noreason-hard-ts-RESULTS.csv"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

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

if ($Fresh) {
    $Resume = $false
    Stop-BenchmarkPorts
    Remove-Item -LiteralPath $HardTsCsv -Force -ErrorAction SilentlyContinue
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

function Test-BenchLoopNoReasonComplete {
    param(
        [string]$Alias,
        [string]$LogDirectory
    )

    $outLog = Join-Path $LogDirectory "benchloop-$Alias.out.log"
    $errLog = Join-Path $LogDirectory "benchloop-$Alias-server.err.log"
    if (-not (Test-Path -LiteralPath $outLog)) { return $false }
    $outText = Get-Content -LiteralPath $outLog -Raw -ErrorAction SilentlyContinue
    if (-not $outText -or $outText -notmatch 'Saved results to') { return $false }
    if (Test-Path -LiteralPath $errLog) {
        $errText = Get-Content -LiteralPath $errLog -Raw -ErrorAction SilentlyContinue
        if ($errText -match 'failed to create context with model') { return $false }
    }
    return $true
}

function Test-HardTsNoReasonComplete {
    param(
        [string]$ModelName,
        [string]$CsvPath,
        [bool]$Vision
    )

    if (-not (Test-Path -LiteralPath $CsvPath)) { return $false }
    $rows = @(Import-Csv -LiteralPath $CsvPath | Where-Object { $_.Model -eq $ModelName })
    if ($rows.Count -eq 0) { return $false }
    $modes = @($rows | ForEach-Object { $_.Mode })
    if ($modes -notcontains "text") { return $false }
    if ($modes -notcontains "tool") { return $false }
    if ($Vision -and ($modes -notcontains "vision")) { return $false }
    $codeModes = @($modes | Where-Object { $_ -like "code:*" })
    if ($codeModes.Count -lt 4) { return $false }
    if ($modes -contains "error") { return $false }
    return $true
}

$models = @()
foreach ($parsed in (Get-Content -LiteralPath $ModelsJson -Raw | ConvertFrom-Json)) {
    $models += ConvertTo-PlainHashtable -Value $parsed
}
if ($OnlyModels.Count -gt 0) {
    $models = @($models | Where-Object { $OnlyModels -contains $_.Name -or $OnlyModels -contains $_.Alias })
}

$benchAliases = @()
$hardModels = @()
foreach ($model in $models) {
    $alias = "$($model.Alias)$AliasSuffix"
    $name = [string]$model.Name
    $vision = if ($model.ContainsKey("Vision")) { [bool]$model.Vision } else { $true }
    $forceRerun = ($RerunModels.Count -gt 0) -and ($RerunModels -contains $name -or $RerunModels -contains $alias)
    $benchDone = (-not $forceRerun) -and (Test-BenchLoopNoReasonComplete -Alias $alias -LogDirectory $LogDir)
    $hardDone = (-not $forceRerun) -and (Test-HardTsNoReasonComplete -ModelName $name -CsvPath $HardTsCsv -Vision $vision)
    if ($Resume) {
        if (-not $benchDone) { $benchAliases += $alias }
        if (-not $hardDone) { $hardModels += $name }
    } else {
        $benchAliases += $alias
        $hardModels += $name
    }
}

$runnerLog = Join-Path $LogDir "readme-noreason-runner.out.log"
$benchLog = Join-Path $LogDir "readme-noreason-benchloop.out.log"
$hardTsLog = Join-Path $LogDir "readme-noreason-hard-ts.out.log"
$benchExit = 0
$hardExit = 0

"$(Get-Date -Format o) Run-Readme-NoReasoning.ps1 Fresh=$Fresh Resume=$Resume BenchLoopOnly=$BenchLoopOnly HardTsOnly=$HardTsOnly" | Out-File -Encoding utf8 $runnerLog
"$(Get-Date -Format o) bench aliases pending: $($benchAliases.Count) hard-ts models pending: $($hardModels.Count)" | Out-File -Encoding utf8 -Append $runnerLog

if (-not $HardTsOnly -and ($benchAliases.Count -gt 0 -or (-not $Resume))) {
    $benchCount = if ($Resume) { $benchAliases.Count } else { $models.Count }
    "$(Get-Date -Format o) starting Run-BenchLoop.ps1 (reasoning off) for $benchCount models" | Out-File -Encoding utf8 -Append $benchLog
    if ($Resume) {
        "$(Get-Date -Format o) bench aliases: $($benchAliases -join ', ')" | Out-File -Encoding utf8 -Append $runnerLog
        & (Join-Path $Root "Run-BenchLoop.ps1") -Reasoning off -AliasSuffix $AliasSuffix -OnlyAliases $benchAliases *>> $benchLog
    } else {
        & (Join-Path $Root "Run-BenchLoop.ps1") -Reasoning off -AliasSuffix $AliasSuffix *>> $benchLog
    }
    $benchExit = $LASTEXITCODE
    "$(Get-Date -Format o) Run-BenchLoop.ps1 exit $benchExit" | Out-File -Encoding utf8 -Append $benchLog
    "$(Get-Date -Format o) Run-BenchLoop.ps1 exit $benchExit" | Out-File -Encoding utf8 -Append $runnerLog
} elseif (-not $HardTsOnly) {
    "$(Get-Date -Format o) skipping benchloop; all aliases complete" | Out-File -Encoding utf8 -Append $runnerLog
}

if (-not $BenchLoopOnly -and ($hardModels.Count -gt 0 -or (-not $Resume))) {
    $hardCount = if ($Resume) { $hardModels.Count } else { $models.Count }
    "$(Get-Date -Format o) starting Run-Hard-Typescript.ps1 (reasoning off) for $hardCount models" | Out-File -Encoding utf8 -Append $hardTsLog
    if ($Resume) {
        & (Join-Path $Root "Run-Hard-Typescript.ps1") -Reasoning off -AliasSuffix $AliasSuffix -CodeMaxTokens 7168 -ResultNameOverride "readme-noreason-hard-ts-RESULTS.csv" -OnlyModels $hardModels -KeepResults *>> $hardTsLog
    } else {
        & (Join-Path $Root "Run-Hard-Typescript.ps1") -Reasoning off -AliasSuffix $AliasSuffix -CodeMaxTokens 7168 -ResultNameOverride "readme-noreason-hard-ts-RESULTS.csv" *>> $hardTsLog
    }
    $hardExit = $LASTEXITCODE
    "$(Get-Date -Format o) Run-Hard-Typescript.ps1 exit $hardExit" | Out-File -Encoding utf8 -Append $hardTsLog
    "$(Get-Date -Format o) Run-Hard-Typescript.ps1 exit $hardExit" | Out-File -Encoding utf8 -Append $runnerLog
} elseif (-not $BenchLoopOnly) {
    "$(Get-Date -Format o) skipping hard-ts; all models complete" | Out-File -Encoding utf8 -Append $runnerLog
}

$exportScript = Join-Path $Root "Export-ReadmeNoReasoningTable.ps1"
if (Test-Path -LiteralPath $exportScript) {
    "$(Get-Date -Format o) exporting README table" | Out-File -Encoding utf8 -Append $runnerLog
    & $exportScript *>> $runnerLog
    "$(Get-Date -Format o) Export-ReadmeNoReasoningTable.ps1 exit $LASTEXITCODE" | Out-File -Encoding utf8 -Append $runnerLog
}

if ($benchExit -ne 0 -or $hardExit -ne 0) {
    exit 1
}
