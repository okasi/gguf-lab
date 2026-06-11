param(
    [string[]]$OnlyModels = @(),
    [switch]$Resume
)

$Mtp35BModels = @(
    "Jackrong-Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M-nmax2"
)

$models = if ($OnlyModels.Count -gt 0) { $OnlyModels } else { $Mtp35BModels }
$reuse = $Resume.IsPresent

& (Join-Path $PSScriptRoot "Run-Needle-Haystack.ps1") `
    -OnlyModels $models `
    -TargetPromptTokens 196000 `
    -NeedleDepthPercent 50 `
    -Reasoning off `
    -AliasSuffix "-noreason-mtp2" `
    -SpecDraftNMaxOverride 2 `
    -ResultName "readme-noreason-mtp2-needle-196k-RESULTS.csv" `
    -ReuseHaystack:$reuse `
    -SkipCalibration:$reuse
