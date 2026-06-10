param(
    [int]$CodeMaxTokens = 7168
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$hfScripts = Join-Path $Root "tools\python312\Scripts"
if (Test-Path -LiteralPath $hfScripts) {
    $env:PATH = "$hfScripts;$env:PATH"
}
$Aliases = @(
    "unsloth-gemma4-e2b-it-qat-ud-q4-k-xl-refresh",
    "unsloth-gemma4-e4b-it-qat-ud-q4-k-xl-refresh",
    "unsloth-gemma4-12b-it-qat-ud-q4-k-xl-refresh",
    "unsloth-gemma4-26b-a4b-it-qat-ud-q4-k-xl-refresh",
    "unsloth-gemma4-31b-it-qat-ud-q4-k-xl-refresh"
)

$server9551 = Join-Path $Root "tools\llama-b9551-bin-win-vulkan-x64\llama-server.exe"
if (-not (Test-Path -LiteralPath $server9551)) {
    & "$Root\Install-LlamaB9551.ps1"
}
& "$Root\Download-Gemma4-QAT-MTP.ps1"

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$benchLog = Join-Path $Root "logs\gemma4-qat-mtp-benchloop-$stamp.out.log"
$hardLog = Join-Path $Root "logs\gemma4-qat-mtp-hard-ts-$stamp.out.log"
$csv = "gemma4-qat-mtp-hard-ts-$stamp-results.csv"

Write-Host "BenchLoop for Gemma 4 QAT + MTP -> $benchLog"
& "$Root\Run-BenchLoop.ps1" -OnlyAliases $Aliases *>> $benchLog
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Hard TypeScript for Gemma 4 QAT + MTP -> $hardLog"
& "$Root\Run-Hard-Typescript.ps1" -OnlyModels $Aliases -CodeMaxTokens $CodeMaxTokens -ResultNameOverride $csv *>> $hardLog
exit $LASTEXITCODE
