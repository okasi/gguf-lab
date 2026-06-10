$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$Hf = Join-Path $Root "tools\python312\Scripts\hf.exe"
if (-not (Test-Path -LiteralPath $Hf)) {
    $Hf = "hf"
}

$downloads = @(
    @{ Repo = "unsloth/gemma-4-E2B-it-qat-GGUF"; Files = @("MTP/gemma-4-E2B-it-Q8_0-MTP.gguf", "mtp-gemma-4-E2B-it.gguf") },
    @{ Repo = "unsloth/gemma-4-E4B-it-qat-GGUF"; Files = @("MTP/gemma-4-E4B-it-Q8_0-MTP.gguf", "mtp-gemma-4-E4B-it.gguf") },
    @{ Repo = "unsloth/gemma-4-12B-it-qat-GGUF"; Files = @("MTP/gemma-4-12B-it-Q8_0-MTP.gguf", "mtp-gemma-4-12B-it.gguf") },
    @{ Repo = "unsloth/gemma-4-26B-A4B-it-qat-GGUF"; Files = @("MTP/gemma-4-26B-A4B-it-Q8_0-MTP.gguf", "mtp-gemma-4-26B-A4B-it.gguf") },
    @{ Repo = "unsloth/gemma-4-31B-it-qat-GGUF"; Files = @("MTP/gemma-4-31B-it-Q8_0-MTP.gguf", "mtp-gemma-4-31B-it.gguf") }
)

foreach ($item in $downloads) {
    foreach ($file in $item.Files) {
        Write-Host "hf download $($item.Repo) $file"
        & $Hf download $item.Repo $file
        if ($LASTEXITCODE -ne 0) {
            throw "hf download failed for $($item.Repo) $file"
        }
    }
}

Write-Host "Gemma 4 QAT MTP drafters downloaded."
