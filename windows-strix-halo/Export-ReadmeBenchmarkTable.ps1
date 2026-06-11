param(
    [string]$ModelsJson = "",
    [string]$ReasoningOnBenchExportJson = "",
    [string]$ReasoningOffBenchExportJson = "",
    [string]$ReasoningOnHardTsCsv = "",
    [string]$ReadmePath = ""
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
$BenchLoop = Join-Path $Root ".venv-benchloop\Scripts\benchloop.exe"

if (-not $ModelsJson) { $ModelsJson = Join-Path $Root "readme-models.json" }
if (-not $ReasoningOnBenchExportJson) { $ReasoningOnBenchExportJson = Join-Path $LogDir "readme-refresh-benchloop-export.json" }
if (-not $ReasoningOffBenchExportJson) { $ReasoningOffBenchExportJson = Join-Path $LogDir "readme-noreason-benchloop-export.json" }
if (-not $ReasoningOnHardTsCsv) { $ReasoningOnHardTsCsv = Join-Path $LogDir "readme-refresh-personal-results.csv" }
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
    if ($null -eq $Value -or "$Value" -eq "") { return $null }
    return [double]("{0:0.0}" -f [double]$Value)
}

function Format-TwoDecimals {
    param($Value)
    if ($null -eq $Value -or "$Value" -eq "") { return $null }
    return [double]("{0:0.00}" -f [double]$Value)
}

function Get-MemBucket {
    param([double]$GiB)
    if ($GiB -lt 8) { return "Under 8 GiB" }
    if ($GiB -lt 14) { return "Under 14 GiB" }
    return "Over 14 GiB"
}

function Test-ExcludedReadmeModel {
    param($Model)
    $name = [string]$Model.Name
    return ($name -match 'Holo|CHADROCK|chadrock')
}

function Get-ReadmeModelLabel {
    param(
        $Model,
        [switch]$Main35B
    )
    $file = if ($Model.ReadmeFileLabel) { [string]$Model.ReadmeFileLabel } else { [string]$Model.File }
    if ($Main35B) { return "**``$file`` (main 35B)**" }
    return $file
}

function Get-MtpDraftMaxForRow {
    param(
        $Model,
        [string]$ReasoningMode,
        [int]$SpecDraftNMaxOverride = 0
    )
    if ($SpecDraftNMaxOverride -gt 0) { return $SpecDraftNMaxOverride }
    if (Test-Gemma4QatMtpModel -Model $Model) {
        if ($ReasoningMode -eq 'off') { return 2 }
        return 0
    }
    if ($Model.Mtp) {
        if ($Model.SpecDraftNMax) { return [int]$Model.SpecDraftNMax }
        return 2
    }
    return 0
}

function Get-SamplerLabel {
    param(
        $Model,
        [int]$MtpDraftMax = 0
    )
    $temp = if ($Model.Temp) { $Model.Temp } else { 0.75 }
    $topP = if ($Model.TopP) { $Model.TopP } else { 0.95 }
    $topK = if ($Model.TopK) { $Model.TopK } else { 20 }
    $label = "$temp / $topP / $topK"
    if ($MtpDraftMax -gt 0) {
        $modelName = [string]$Model.Name
        if ($modelName -match 'Qwopus3\.6-27B') {
            $label += ', MTP draft 1-2'
        } else {
            $label += ", MTP draft 1-$MtpDraftMax"
        }
    }
    return $label
}

function Test-Gemma4QatMtpModel {
    param($Model)
    $name = [string]$Model.Name
    return ($name -match 'Gemma4' -and $Model.Mtp)
}

function Get-ReasoningOffRowConfig {
    param($Model)
    if ($Model.ReasoningOffAliasSuffix) {
        $suffix = [string]$Model.ReasoningOffAliasSuffix
        $csvName = if ($suffix -eq "-noreason-nmax2") {
            "readme-noreason-nmax2-hard-ts-RESULTS.csv"
        } elseif ($suffix -eq "-noreason-mtp2") {
            "readme-noreason-mtp2-hard-ts-RESULTS.csv"
        } else {
            "readme$($suffix -replace '^-','-')-hard-ts-RESULTS.csv"
        }
        $override = if ($suffix -match 'mtp2|nmax2') { 2 } else { 0 }
        return @{
            AliasSuffix = $suffix
            HardTsCsv = (Join-Path $LogDir $csvName)
            SpecDraftNMaxOverride = $override
        }
    }
    if (Test-Gemma4QatMtpModel -Model $Model) {
        return @{
            AliasSuffix = "-noreason-nmax2"
            HardTsCsv = (Join-Path $LogDir "readme-noreason-nmax2-hard-ts-RESULTS.csv")
            SpecDraftNMaxOverride = 2
        }
    }
    return @{
        AliasSuffix = "-noreason"
        HardTsCsv = (Join-Path $LogDir "readme-noreason-hard-ts-RESULTS.csv")
        SpecDraftNMaxOverride = 0
    }
}

function Get-BenchRunsFromExport {
    param(
        [string]$Path,
        [scriptblock]$AliasFilter
    )
    $runs = @{}
    if (-not (Test-Path -LiteralPath $Path)) { return $runs }
    $export = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
    foreach ($run in @($export.runs)) {
        $alias = [string]$run.model
        if (& $AliasFilter $alias) { $runs[$alias] = $run }
    }
    return $runs
}

function Get-HardTsRows {
    param([string]$CsvPath)
    if (-not (Test-Path -LiteralPath $CsvPath)) { return @() }
    return @(Import-Csv -LiteralPath $CsvPath)
}

function Compare-BenchCandidates {
    param($Left, $Right)
    if ($null -eq $Right) { return $Left }
    if ($null -eq $Left) { return $Right }
    foreach ($metric in @('BlOverall', 'BlToolcall', 'BlAgent')) {
        $l = $Left.$metric
        $r = $Right.$metric
        if ($null -eq $l -and $null -eq $r) { continue }
        if ($null -eq $l) { return $Right }
        if ($null -eq $r) { return $Left }
        if ([double]$r -gt [double]$l) { return $Right }
        if ([double]$r -lt [double]$l) { return $Left }
    }
    return $Left
}

function Build-ReadmeRow {
    param(
        $Model,
        [string]$ReasoningMode,
        [hashtable]$BenchRuns,
        [object[]]$HardRows,
        [int]$SpecDraftNMaxOverride = 0,
        [switch]$Main35B
    )

    $alias = if ($ReasoningMode -eq 'off') {
        $cfg = Get-ReasoningOffRowConfig -Model $Model
        if ($SpecDraftNMaxOverride -gt 0) { $cfg.SpecDraftNMaxOverride = $SpecDraftNMaxOverride }
        "$($Model.Alias)$($cfg.AliasSuffix)"
    } else {
        [string]$Model.Alias
    }

    if ($ReasoningMode -eq 'off') {
        $cfg = Get-ReasoningOffRowConfig -Model $Model
        if ($SpecDraftNMaxOverride -gt 0) { $cfg.SpecDraftNMaxOverride = $SpecDraftNMaxOverride }
        if (-not $HardRows -or $HardRows.Count -eq 0) {
            $HardRows = Get-HardTsRows -CsvPath $cfg.HardTsCsv
        }
    }

    $mtpDraftMax = Get-MtpDraftMaxForRow -Model $Model -ReasoningMode $ReasoningMode -SpecDraftNMaxOverride $(if ($ReasoningMode -eq 'off') { (Get-ReasoningOffRowConfig -Model $Model).SpecDraftNMaxOverride } else { 0 })

    $name = [string]$Model.Name
    $bench = if ($BenchRuns.ContainsKey($alias)) { $BenchRuns[$alias] } else { $null }
    $modelHard = @($hardRows | Where-Object { $_.Model -eq $name })
    $textRow = @($modelHard | Where-Object { $_.Mode -eq "text" } | Select-Object -Last 1)
    $visionRow = @($modelHard | Where-Object { $_.Mode -eq "vision" } | Select-Object -Last 1)
    $toolRow = @($modelHard | Where-Object { $_.Mode -eq "tool" } | Select-Object -Last 1)
    $codeRows = @($modelHard | Where-Object { $_.Mode -like "code:*" })

    if (-not $bench -and $textRow.Count -eq 0) { return $null }

    $loadGiB = $null
    if ($textRow.Count -gt 0 -and $textRow[0].LoadCommittedMiB) {
        $loadGiB = [double]$textRow[0].LoadCommittedMiB / 1024.0
    }

    $hardPassed = 0
    $hardTotal = 0
    foreach ($codeRow in $codeRows) {
        if ($codeRow.Passed -match "^\d+$") { $hardPassed += [int]$codeRow.Passed }
        if ($codeRow.Total -match "^\d+$") { $hardTotal += [int]$codeRow.Total }
    }

    return [pscustomobject]@{
        RowKey = "$(Get-ReadmeModelLabel -Model $Model -Main35B:$Main35B)|$(Get-SamplerLabel -Model $Model -MtpDraftMax $mtpDraftMax)"
        SortGiB = if ($loadGiB) { $loadGiB * 1024 } else { 999999 }
        MemBucket = if ($loadGiB) { Get-MemBucket -GiB $loadGiB } else { "pending" }
        ModelLabel = Get-ReadmeModelLabel -Model $Model -Main35B:$Main35B
        Ctx = if ($Model.CtxSize) { $Model.CtxSize } else { 262144 }
        Sampler = Get-SamplerLabel -Model $Model -MtpDraftMax $mtpDraftMax
        Reasoning = $ReasoningMode
        LoadMem = if ($loadGiB) { "{0:0.00} GiB" -f $loadGiB } else { "pending" }
        TextGen = if ($textRow.Count -gt 0 -and $textRow[0].GenerationTPS) { "$(Format-TwoDecimals $textRow[0].GenerationTPS) tok/s" } else { "pending" }
        ImageGen = if (-not $Model.Vision) { "N/A" }
            elseif ($visionRow.Count -gt 0 -and $visionRow[0].Mode -eq "vision" -and $visionRow[0].Passed -eq "N/A") { "N/A" }
            elseif ($visionRow.Count -gt 0 -and $visionRow[0].GenerationTPS) { "$(Format-TwoDecimals $visionRow[0].GenerationTPS) tok/s" }
            else { "pending" }
        ToolGen = if ($toolRow.Count -gt 0 -and $toolRow[0].GenerationTPS) { "$(Format-TwoDecimals $toolRow[0].GenerationTPS) tok/s" } else { "pending" }
        HardTs = if ($hardTotal -gt 0) { "$hardPassed/$hardTotal" } else { "pending" }
        BlOverall = if ($bench) { Format-OneDecimal $bench.overall_score } else { $null }
        BlQuality = if ($bench) { Format-OneDecimal $bench.quality_score } else { $null }
        BlGen = if ($bench -and $bench.generation_tok_per_sec) { "$(Format-TwoDecimals $bench.generation_tok_per_sec) tok/s" } else { "pending" }
        BlCoding = if ($bench -and $bench.suites.coding.score) { Format-OneDecimal $bench.suites.coding.score } else { $null }
        BlToolcall = if ($bench -and $bench.suites.toolcall.score) { Format-OneDecimal $bench.suites.toolcall.score } else { $null }
        BlAgent = if ($bench -and $bench.suites.agent.score) { Format-OneDecimal $bench.suites.agent.score } else { $null }
    }
}

if (Test-Path -LiteralPath $BenchLoop) {
    & $BenchLoop export | Out-File -Encoding utf8 -LiteralPath $ReasoningOffBenchExportJson
}

$models = @()
foreach ($parsed in (Get-Content -LiteralPath $ModelsJson -Raw | ConvertFrom-Json)) {
    $item = ConvertTo-PlainHashtable -Value $parsed
    if (Test-ExcludedReadmeModel -Model $item) { continue }
    $models += $item
}

$benchOn = Get-BenchRunsFromExport -Path $ReasoningOnBenchExportJson -AliasFilter { param($a) $a -notmatch '-noreason' }
$benchOff = Get-BenchRunsFromExport -Path $ReasoningOffBenchExportJson -AliasFilter { param($a) $a -match '-noreason' }
$hardOn = Get-HardTsRows -CsvPath $ReasoningOnHardTsCsv

$merged = @{}
foreach ($model in $models) {
    $main35B = ([string]$model.Name -eq 'Jackrong-Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M-nmax2')

    $offCfg = Get-ReasoningOffRowConfig -Model $model
    $offHard = Get-HardTsRows -CsvPath $offCfg.HardTsCsv
    $offRow = Build-ReadmeRow -Model $model -ReasoningMode 'off' -BenchRuns $benchOff -HardRows $offHard -Main35B:$main35B
    $onRow = Build-ReadmeRow -Model $model -ReasoningMode 'auto' -BenchRuns $benchOn -HardRows $hardOn -Main35B:$main35B

    foreach ($candidate in @($offRow, $onRow)) {
        if ($null -eq $candidate) { continue }
        $key = "$($candidate.ModelLabel)|$($candidate.Sampler)"
        if (-not $merged.ContainsKey($key)) {
            $merged[$key] = $candidate
        } else {
            $merged[$key] = Compare-BenchCandidates -Left $merged[$key] -Right $candidate
        }
    }
}

function Get-ModelLabelKey {
    param([string]$Label)
    return ($Label -replace '\*\*|`|\s+\(main 35B\)', '').Trim()
}

$allRows = @($merged.Values)
$filteredRows = @()
foreach ($group in ($allRows | Group-Object { Get-ModelLabelKey $_.ModelLabel })) {
    if ($group.Name -match 'Qwopus') {
        $filteredRows += $group.Group
        continue
    }
    $best = @($group.Group | Sort-Object `
        @{ Expression = { if ($null -eq $_.BlOverall) { -1 } else { [double]$_.BlOverall } }; Descending = $true }, `
        @{ Expression = { if ($null -eq $_.BlToolcall) { -1 } else { [double]$_.BlToolcall } }; Descending = $true }, `
        @{ Expression = { if ($null -eq $_.BlAgent) { -1 } else { [double]$_.BlAgent } }; Descending = $true } `
    | Select-Object -First 1)
    $filteredRows += $best
}
$rows = @($filteredRows | Sort-Object SortGiB, ModelLabel)
$tableLines = @(
    "| Mem bucket | Model / file | Max ctx | Sampler settings | Reasoning | Load mem | Text gen | Image gen | Tool gen | Hard TS | BL overall | BL quality | BL gen | BL coding | BL toolcall | BL agent |",
    "|---|---|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"
)
foreach ($row in $rows) {
    $samplerCell = if ($row.Sampler -match ',') {
        "``$($row.Sampler.Split(',')[0].Trim())``, ``$($row.Sampler.Split(',')[1].Trim())``"
    } else {
        "``$($row.Sampler)``"
    }
    $modelCell = if ($row.ModelLabel -match '^\*\*') { $row.ModelLabel } else { "``$($row.ModelLabel)``" }
    $blOverall = if ($null -ne $row.BlOverall) { "{0:0.0}" -f $row.BlOverall } else { "pending" }
    $blQuality = if ($null -ne $row.BlQuality) { "{0:0.0}" -f $row.BlQuality } else { "pending" }
    $blCoding = if ($null -ne $row.BlCoding) { "{0:0.0}" -f $row.BlCoding } else { "pending" }
    $blToolcall = if ($null -ne $row.BlToolcall) { "{0:0.0}" -f $row.BlToolcall } else { "pending" }
    $blAgent = if ($null -ne $row.BlAgent) { "{0:0.0}" -f $row.BlAgent } else { "pending" }
    $tableLines += "| $($row.MemBucket) | $modelCell | $($row.Ctx) | $samplerCell | $($row.Reasoning) | $($row.LoadMem) | $($row.TextGen) | $($row.ImageGen) | $($row.ToolGen) | $($row.HardTs) | $blOverall | $blQuality | $($row.BlGen) | $blCoding | $blToolcall | $blAgent |"
}

$generatedAt = (Get-Date).ToString("yyyy-MM-dd")
$tableBlock = (@("<!-- benchmark-table-start -->") + $tableLines + @("<!-- benchmark-table-end -->")) -join "`n"
$section = @(
    "## Benchmark Results",
    "",
    "BenchLoop v0.2.3 was run locally through llama.cpp's OpenAI-compatible endpoint with ``--harness raw``, ``BENCHLOOP_NO_SUBMIT=1``, and suites ``speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent``. BenchLoop has no image/vision suite, so ``Image gen`` comes from the custom harness only.",
    "",
    "Each row is the best of ``--reasoning auto`` vs ``--reasoning off`` for that model and sampler config, ranked by BL overall, then BL toolcall, then BL agent. **Reasoning** shows which mode was kept. Gemma reasoning-off rows also use ``--chat-template-kwargs '{""enable_thinking"":false}'``. Gemma4 QAT MTP rows use Unsloth drafters at ``--spec-draft-n-max 2``. Qwopus3.6 35B MTP rows use Jackrong ``*-MTP-GGUF`` weights at ``--spec-draft-n-max 2``.",
    "",
    "Sampler column uses ``temp / top_p / top_k``. Every row uses ``presence_penalty=0`` and the largest practical ``--ctx-size`` on this hardware (``262144`` unless noted in **Max ctx**). Rerun with ``windows-strix-halo/Run-Readme-NoReasoning.ps1`` and refresh via ``windows-strix-halo/Export-ReadmeBenchmarkTable.ps1``.",
    "",
    "``Model / file`` uses ``family / on-disk.gguf`` when the GGUF filename alone is ambiguous.",
    "",
    $tableBlock
) -join "`n"

$readme = Get-Content -LiteralPath $ReadmePath -Raw
if ($readme -match '(?s)## Benchmark Results') {
    $readme = [regex]::Replace($readme, '(?s)## Benchmark Results.*?(?=## Long-context recall|\z)', ($section.TrimEnd() + "`n`n"))
} else {
    $readme = $readme.TrimEnd() + "`n`n" + $section + "`n"
}

$readme | Out-File -Encoding utf8 -LiteralPath $ReadmePath -NoNewline
Write-Host "Updated $ReadmePath with merged benchmark table ($($rows.Count) rows, generated $generatedAt)."
