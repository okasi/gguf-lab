$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
$ModelsJson = Join-Path $Root "readme-models.json"
$AliasSuffix = "-noreason"
$HardTsCsv = Join-Path $LogDir "readme-noreason-hard-ts-RESULTS.csv"

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
    param([string]$Alias, [string]$LogDirectory)
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
    param([string]$ModelName, [string]$CsvPath, [bool]$Vision)
    if (-not (Test-Path -LiteralPath $CsvPath)) { return $false }
    $rows = @(Import-Csv -LiteralPath $CsvPath | Where-Object { $_.Model -eq $ModelName })
    if ($rows.Count -eq 0) { return $false }
    $modes = @($rows | ForEach-Object { $_.Mode })
    if ($modes -notcontains "text" -or $modes -notcontains "tool") { return $false }
    if ($Vision -and ($modes -notcontains "vision")) { return $false }
    if ((@($modes | Where-Object { $_ -like "code:*" })).Count -lt 4) { return $false }
    if ($modes -contains "error") { return $false }
    return $true
}

$rows = @()
foreach ($parsed in (Get-Content -LiteralPath $ModelsJson -Raw | ConvertFrom-Json)) {
    $model = ConvertTo-PlainHashtable -Value $parsed
    $alias = "$($model.Alias)$AliasSuffix"
    $name = [string]$model.Name
    $vision = if ($model.ContainsKey("Vision")) { [bool]$model.Vision } else { $true }
    $bench = if (Test-BenchLoopNoReasonComplete -Alias $alias -LogDirectory $LogDir) { "done" } else { "pending" }
    $hard = if (Test-HardTsNoReasonComplete -ModelName $name -CsvPath $HardTsCsv -Vision $vision) { "done" } else { "pending" }
    $rows += [pscustomobject]@{ Model = $name; BenchLoop = $bench; HardTS = $hard }
}

$rows | Format-Table -AutoSize
Write-Host "BenchLoop done: $(@($rows | Where-Object { $_.BenchLoop -eq 'done' }).Count)/$($rows.Count)"
Write-Host "Hard TS done:   $(@($rows | Where-Object { $_.HardTS -eq 'done' }).Count)/$($rows.Count)"
