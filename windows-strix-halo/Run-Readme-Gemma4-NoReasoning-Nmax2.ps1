param(
    [string[]]$OnlyModels = @(),
    [string[]]$RerunModels = @(),
    [switch]$Resume,
    [switch]$Fresh,
    [switch]$BenchLoopOnly,
    [switch]$HardTsOnly
)

$GemmaModels = @(
    "Unsloth-Gemma4-E2B-it-QAT-UD-Q4_K_XL",
    "Unsloth-Gemma4-E4B-it-QAT-UD-Q4_K_XL",
    "Unsloth-Gemma4-12B-it-QAT-UD-Q4_K_XL",
    "Unsloth-Gemma4-26B-A4B-it-QAT-UD-Q4_K_XL",
    "Unsloth-Gemma4-31B-it-QAT-UD-Q4_K_XL"
)

$models = if ($OnlyModels.Count -gt 0) { $OnlyModels } else { $GemmaModels }

& (Join-Path $PSScriptRoot "Run-Readme-NoReasoning.ps1") `
    -OnlyModels $models `
    -RerunModels $RerunModels `
    -Resume:$Resume `
    -Fresh:$Fresh `
    -BenchLoopOnly:$BenchLoopOnly `
    -HardTsOnly:$HardTsOnly `
    -AliasSuffix "-noreason-nmax2" `
    -SpecDraftNMaxOverride 2 `
    -HardTsResultName "readme-noreason-nmax2-hard-ts-RESULTS.csv"
