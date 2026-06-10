param(
    [string]$ModelsJson = "",
    [string]$HardTsCsv = "",
    [string]$BenchExportJson = "",
    [string]$ReadmePath = ""
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
$BenchLoop = Join-Path $Root ".venv-benchloop\Scripts\benchloop.exe"

if (-not $ModelsJson) { $ModelsJson = Join-Path $Root "readme-models.json" }
if (-not $HardTsCsv) { $HardTsCsv = Join-Path $LogDir "readme-noreason-hard-ts-RESULTS.csv" }
if (-not $BenchExportJson) { $BenchExportJson = Join-Path $LogDir "readme-noreason-benchloop-export.json" }
if (-not $ReadmePath) { $ReadmePath = Join-Path (Split-Path $Root -Parent) "README.md" }

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

function Format-OneDecimal {
    param($Value)
    if ($null -eq $Value -or "$Value" -eq "") { return "pending" }
    return "{0:0.0}" -f [double]$Value
}

function Format-TwoDecimals {
    param($Value)
    if ($null -eq $Value -or "$Value" -eq "") { return "pending" }
    return "{0:0.00}" -f [double]$Value
}

function Get-MemBucket {
    param([double]$GiB)
    if ($GiB -lt 8) { return "Under 8 GiB" }
    if ($GiB -lt 14) { return "Under 14 GiB" }
    return "Over 14 GiB"
}

function Get-ReadmeModelLabel {
    param($Model)
    $file = [string]$Model.File
    $name = [string]$Model.Name
    if ($name -match "Qwopus3\.5-4B") { return "Qwopus3.5-4B-v3 / $file" }
    if ($name -match "Holo") { return "Holo-3.1-35B-A3B / $file" }
    return $file
}

function Get-SamplerLabel {
    param($Model)
    $temp = if ($Model.Temp) { $Model.Temp } else { 0.75 }
    $topP = if ($Model.TopP) { $Model.TopP } else { 0.95 }
    $topK = if ($Model.TopK) { $Model.TopK } else { 20 }
    $label = "$temp / $topP / $topK"
    if ($Model.Mtp) {
        $max = if ($Model.SpecDraftNMax) { $Model.SpecDraftNMax } else { 2 }
        $modelName = [string]$Model.Name
        if ($modelName -match 'Qwopus3\.6-27B') {
            $label += ', MTP draft 1-2'
        } elseif ($modelName -match 'CHADROCK') {
            $label += ', MTP'
        } else {
            $label += ", MTP draft 1-$max"
        }
    }
    return $label
}

if (Test-Path -LiteralPath $BenchLoop) {
    & $BenchLoop export | Out-File -Encoding utf8 -LiteralPath $BenchExportJson
}

$models = @()
foreach ($parsed in (Get-Content -LiteralPath $ModelsJson -Raw | ConvertFrom-Json)) {
    $models += ConvertTo-PlainHashtable -Value $parsed
}

$benchRuns = @{}
if (Test-Path -LiteralPath $BenchExportJson) {
    $export = Get-Content -LiteralPath $BenchExportJson -Raw | ConvertFrom-Json
    foreach ($run in @($export.runs)) {
        if ($run.model -notmatch '-noreason$') { continue }
        $benchRuns[[string]$run.model] = $run
    }
}

$hardRows = @()
if (Test-Path -LiteralPath $HardTsCsv) {
    $hardRows = @(Import-Csv -LiteralPath $HardTsCsv)
}

$rows = @()
foreach ($model in $models) {
    $alias = "$($model.Alias)-noreason"
    $name = [string]$model.Name
    $bench = if ($benchRuns.ContainsKey($alias)) { $benchRuns[$alias] } else { $null }

    $modelHard = @($hardRows | Where-Object { $_.Model -eq $name })
    $textRow = @($modelHard | Where-Object { $_.Mode -eq "text" } | Select-Object -Last 1)
    $visionRow = @($modelHard | Where-Object { $_.Mode -eq "vision" } | Select-Object -Last 1)
    $toolRow = @($modelHard | Where-Object { $_.Mode -eq "tool" } | Select-Object -Last 1)
    $codeRows = @($modelHard | Where-Object { $_.Mode -like "code:*" })

    $loadGiB = "pending"
    if ($textRow.Count -gt 0 -and $textRow[0].LoadCommittedMiB) {
        $loadGiB = "{0:0.00} GiB" -f ([double]$textRow[0].LoadCommittedMiB / 1024.0)
    }
    $memBucket = if ($loadGiB -eq "pending") { "pending" } else { Get-MemBucket -GiB ([double]$textRow[0].LoadCommittedMiB / 1024.0) }

    $textGen = if ($textRow.Count -gt 0 -and $textRow[0].GenerationTPS) { "$(Format-TwoDecimals $textRow[0].GenerationTPS) tok/s" } else { "pending" }
    $imageGen = if (-not $model.Vision) { "N/A" }
        elseif ($visionRow.Count -gt 0 -and $visionRow[0].Mode -eq "vision" -and $visionRow[0].Passed -eq "N/A") { "N/A" }
        elseif ($visionRow.Count -gt 0 -and $visionRow[0].GenerationTPS) { "$(Format-TwoDecimals $visionRow[0].GenerationTPS) tok/s" }
        else { "pending" }
    $toolGen = if ($toolRow.Count -gt 0 -and $toolRow[0].GenerationTPS) { "$(Format-TwoDecimals $toolRow[0].GenerationTPS) tok/s" } else { "pending" }

    $hardPassed = 0
    $hardTotal = 0
    foreach ($codeRow in $codeRows) {
        if ($codeRow.Passed -match "^\d+$") { $hardPassed += [int]$codeRow.Passed }
        if ($codeRow.Total -match "^\d+$") { $hardTotal += [int]$codeRow.Total }
    }
    $hardTs = if ($hardTotal -gt 0) { "$hardPassed/$hardTotal" } else { "pending" }

    $blOverall = if ($bench) { Format-OneDecimal $bench.overall_score } else { "pending" }
    $blQuality = if ($bench) { Format-OneDecimal $bench.quality_score } else { "pending" }
    $blGen = if ($bench -and $bench.generation_tok_per_sec) { "$(Format-TwoDecimals $bench.generation_tok_per_sec) tok/s" } else { "pending" }
    $blCoding = if ($bench -and $bench.suites.coding.score) { Format-OneDecimal $bench.suites.coding.score } else { "pending" }
    $blToolcall = if ($bench -and $bench.suites.toolcall.score) { Format-OneDecimal $bench.suites.toolcall.score } else { "pending" }
    $blAgent = if ($bench -and $bench.suites.agent.score) { Format-OneDecimal $bench.suites.agent.score } else { "pending" }

    $rows += [pscustomobject]@{
        SortGiB = if ($textRow.Count -gt 0 -and $textRow[0].LoadCommittedMiB) { [double]$textRow[0].LoadCommittedMiB } else { 999999 }
        MemBucket = $memBucket
        ModelLabel = Get-ReadmeModelLabel -Model $model
        Ctx = if ($model.CtxSize) { $model.CtxSize } else { 262144 }
        Sampler = Get-SamplerLabel -Model $model
        LoadMem = $loadGiB
        TextGen = $textGen
        ImageGen = $imageGen
        ToolGen = $toolGen
        HardTs = $hardTs
        BlOverall = $blOverall
        BlQuality = $blQuality
        BlGen = $blGen
        BlCoding = $blCoding
        BlToolcall = $blToolcall
        BlAgent = $blAgent
    }
}

$rows = @($rows | Sort-Object SortGiB, ModelLabel)
$tableLines = @(
    "| Mem bucket | Model / file | Max ctx | Sampler settings | Load mem | Text gen | Image gen | Tool gen | Hard TS | BL overall | BL quality | BL gen | BL coding | BL toolcall | BL agent |",
    "|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"
)
foreach ($row in $rows) {
    $samplerCell = if ($row.Sampler -match ',') { "``$($row.Sampler.Split(',')[0].Trim())``, ``$($row.Sampler.Split(',')[1].Trim())``" } else { "``$($row.Sampler)``" }
    $tableLines += "| $($row.MemBucket) | ``$($row.ModelLabel)`` | $($row.Ctx) | $samplerCell | $($row.LoadMem) | $($row.TextGen) | $($row.ImageGen) | $($row.ToolGen) | $($row.HardTs) | $($row.BlOverall) | $($row.BlQuality) | $($row.BlGen) | $($row.BlCoding) | $($row.BlToolcall) | $($row.BlAgent) |"
}

$generatedAt = (Get-Date).ToString("yyyy-MM-dd")
$tableBlock = (@("<!-- reasoning-off-table-start -->") + $tableLines + @("<!-- reasoning-off-table-end -->")) -join "`n"
$intro = @(
    'Same harness and hardware as the table above, but every row uses `--reasoning off`. Gemma rows also use `--chat-template-kwargs ''{"enable_thinking":false}''`. Gemma4 QAT rows use llama.cpp `b9551` with Unsloth MTP drafters where configured.'
    "BenchLoop scores are from the $generatedAt reasoning-off refresh; rerun with ``Run-Readme-NoReasoning.ps1`` and refresh this section via ``Export-ReadmeNoReasoningTable.ps1``."
) -join ' '
$section = @(
    "## Benchmark Results (reasoning off)",
    "",
    $intro,
    "",
    $tableBlock
) -join "`n"

$readme = Get-Content -LiteralPath $ReadmePath -Raw
if ($readme -match '(?s)## Benchmark Results \(reasoning off\)') {
    $readme = [regex]::Replace($readme, '(?s)## Benchmark Results \(reasoning off\).*', $section.TrimEnd())
} else {
    $readme = $readme.TrimEnd() + "`n`n" + $section + "`n"
}

$readme | Out-File -Encoding utf8 -LiteralPath $ReadmePath -NoNewline
Write-Host "Updated $ReadmePath with reasoning-off table ($($rows.Count) rows)."
