param([string]$Models,[string]$LogDir)
$ErrorActionPreference="Stop"
$items=@(
 @{ Url="https://huggingface.co/mradermacher/gemma-4-E4B-it-Uncensored-MAX-opus-4.7-GGUF/resolve/main/gemma-4-E4B-it-Uncensored-MAX-opus-4.7.mmproj-f16.gguf?download=true"; File="gemma-4-E4B-it-Uncensored-MAX-opus-4.7.mmproj-f16.gguf"; Min=900MB },
 @{ Url="https://huggingface.co/fesalfayed/gpt-oss-20b-hermes_agent-tool-finetune_gguf/resolve/main/gpt-oss-20b-hermes.Q5_K_M.gguf?download=true"; File="gpt-oss-20b-hermes.Q5_K_M.gguf"; Min=15GB }
)
foreach($item in $items){
 $out=Join-Path $Models $item.File
 $err=Join-Path $LogDir ("download-$($item.File).err.log")
 if((Test-Path -LiteralPath $out) -and ((Get-Item -LiteralPath $out).Length -ge $item.Min)){ Write-Host "Already have $($item.File)"; continue }
 Write-Host "Downloading $($item.File)..."
 & curl.exe -L --fail --retry 5 --retry-delay 3 --continue-at - --output $out $item.Url 2> $err
 if($LASTEXITCODE -ne 0){ throw "curl failed for $($item.File), see $err" }
}
