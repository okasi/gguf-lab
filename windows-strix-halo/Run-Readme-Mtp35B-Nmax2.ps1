param(
    [string[]]$OnlyModels = @(),
    [string[]]$RerunModels = @(),
    [switch]$Resume,
    [switch]$Fresh,
    [switch]$BenchLoopOnly,
    [switch]$HardTsOnly
)

$Mtp35BModels = @(
    "Jackrong-Qwopus3.6-35B-A3B-v1-MTP-IQ4_XS-nmax2",
    "Jackrong-Qwopus3.6-35B-A3B-v1-MTP-Q4_K_M-nmax2",
    "Jackrong-Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M-nmax2"
)

$models = if ($OnlyModels.Count -gt 0) { $OnlyModels } else { $Mtp35BModels }

& (Join-Path $PSScriptRoot "Run-Readme-NoReasoning.ps1") `
    -OnlyModels $models `
    -RerunModels $RerunModels `
    -Resume:$Resume `
    -Fresh:$Fresh `
    -BenchLoopOnly:$BenchLoopOnly `
    -HardTsOnly:$HardTsOnly `
    -AliasSuffix "-noreason-mtp2" `
    -SpecDraftNMaxOverride 2 `
    -HardTsResultName "readme-noreason-mtp2-hard-ts-RESULTS.csv"
