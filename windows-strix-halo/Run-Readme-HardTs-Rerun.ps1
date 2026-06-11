$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
$RunnerLog = Join-Path $LogDir "readme-hardts-rerun-runner.out.log"

function Write-RunnerLog {
    param([string]$Message)
    "$(Get-Date -Format o) $Message" | Out-File -Encoding utf8 -Append $RunnerLog
}

Write-RunnerLog "start hard-ts rerun"

& (Join-Path $Root "Run-Readme-Gemma4-NoReasoning-Nmax2.ps1") -Fresh -HardTsOnly *>> (Join-Path $LogDir "readme-hardts-rerun-gemma.out.log")
Write-RunnerLog "gemma exit $LASTEXITCODE"

& (Join-Path $Root "Run-Readme-NoReasoning.ps1") -Fresh -HardTsOnly -OnlyModels @(
    "Jackrong-Qwopus3.6-35B-A3B-v1-IQ4_XS",
    "Jackrong-Qwopus3.6-27B-v2-MTP-IQ4_XS",
    "Jackrong-Qwopus3.6-35B-A3B-v1-Q5_K_M"
) *>> (Join-Path $LogDir "readme-hardts-rerun-qwopus.out.log")
Write-RunnerLog "qwopus exit $LASTEXITCODE"

& (Join-Path $Root "Run-Readme-Mtp35B-Nmax2.ps1") -Fresh -HardTsOnly *>> (Join-Path $LogDir "readme-hardts-rerun-mtp35b.out.log")
Write-RunnerLog "mtp35b exit $LASTEXITCODE"

$exportArgs = @{
    ReasoningOnBenchExportJson = (Join-Path $LogDir "readme-refresh-benchloop-export.json")
    ReasoningOnHardTsCsv = (Join-Path $LogDir "readme-refresh-personal-results.csv")
}
& (Join-Path $Root "Export-ReadmeBenchmarkTable.ps1") @exportArgs *>> $RunnerLog
Write-RunnerLog "export exit $LASTEXITCODE"
Write-RunnerLog "complete"
