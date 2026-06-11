param(
    [string]$ModelsJson = "",
    [string]$HardTsCsv = "",
    [string]$BenchExportJson = "",
    [string]$ReadmePath = ""
)

$ErrorActionPreference = "Stop"
$forward = @{
    ReadmePath = $ReadmePath
    ModelsJson = $ModelsJson
}
if ($BenchExportJson) { $forward.ReasoningOffBenchExportJson = $BenchExportJson }

& (Join-Path $PSScriptRoot "Export-ReadmeBenchmarkTable.ps1") @forward
exit $LASTEXITCODE
