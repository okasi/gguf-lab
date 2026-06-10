param(
    [string[]]$RerunModels = @(),
    [switch]$Resume,
    [switch]$Fresh,
    [switch]$BenchLoopOnly,
    [switch]$HardTsOnly
)

& (Join-Path $PSScriptRoot "Run-Readme-NoReasoning.ps1") `
    -OnlyModels @("mradermacher-Holo-3.1-9B-Q5_K_M") `
    -RerunModels $RerunModels `
    -Resume:$Resume `
    -Fresh:$Fresh `
    -BenchLoopOnly:$BenchLoopOnly `
    -HardTsOnly:$HardTsOnly
