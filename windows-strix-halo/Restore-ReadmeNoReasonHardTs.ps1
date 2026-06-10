param(
    [string]$ModelsJson = ""
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
if (-not $ModelsJson) { $ModelsJson = Join-Path $Root "readme-models.json" }

$models = Get-Content -LiteralPath $ModelsJson -Raw | ConvertFrom-Json
$restoreNames = @(
    $models |
        Where-Object { -not $_.ReasoningOffAliasSuffix -and $_.Name -ne "mradermacher-Holo-3.1-9B-Q5_K_M" } |
        ForEach-Object { [string]$_.Name }
)

& (Join-Path $Root "Run-Readme-NoReasoning.ps1") `
    -OnlyModels $restoreNames `
    -HardTsOnly `
    -Resume
