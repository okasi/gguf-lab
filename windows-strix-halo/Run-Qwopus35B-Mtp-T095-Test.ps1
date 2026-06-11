$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
$ModelsJson = Join-Path $LogDir "qwopus35b-mtp-t095-test-models.json"
$AliasSuffix = "-noreason-mtp2-t095"
$Model = "Jackrong-Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M-nmax2"
$RunnerLog = Join-Path $LogDir "qwopus35b-mtp-t095-test-runner.out.log"

"$(Get-Date -Format o) start Qwopus 35B MTP t0.95 test" | Out-File -Encoding utf8 $RunnerLog

& (Join-Path $Root "Run-BenchLoop.ps1") `
    -ModelsJson $ModelsJson `
    -Reasoning off `
    -AliasSuffix $AliasSuffix `
    -SpecDraftNMaxOverride 2 `
    *>> (Join-Path $LogDir "qwopus35b-mtp-t095-benchloop.out.log")
"$(Get-Date -Format o) benchloop exit $LASTEXITCODE" | Out-File -Encoding utf8 -Append $RunnerLog

& (Join-Path $Root "Run-Hard-Typescript.ps1") `
    -ModelsJson $ModelsJson `
    -OnlyModels @($Model) `
    -Reasoning off `
    -AliasSuffix $AliasSuffix `
    -SpecDraftNMaxOverride 2 `
    -CodeMaxTokens 7168 `
    -ResultNameOverride "qwopus35b-mtp-t095-hard-ts-RESULTS.csv" `
    *>> (Join-Path $LogDir "qwopus35b-mtp-t095-hard-ts.out.log")
"$(Get-Date -Format o) hard-ts exit $LASTEXITCODE" | Out-File -Encoding utf8 -Append $RunnerLog

$BenchLoop = Join-Path $Root ".venv-benchloop\Scripts\benchloop.exe"
if (Test-Path -LiteralPath $BenchLoop) {
    & $BenchLoop export | Out-File -Encoding utf8 -LiteralPath (Join-Path $LogDir "qwopus35b-mtp-t095-benchloop-export.json")
}
"$(Get-Date -Format o) complete" | Out-File -Encoding utf8 -Append $RunnerLog
