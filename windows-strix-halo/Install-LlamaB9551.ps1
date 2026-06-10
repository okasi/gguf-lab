$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$ToolsDir = Join-Path $Root "tools"
$ZipName = "llama-b9551-bin-win-vulkan-x64.zip"
$ZipPath = Join-Path $ToolsDir $ZipName
$ExtractDir = Join-Path $ToolsDir "llama-b9551-bin-win-vulkan-x64"
$Url = "https://github.com/ggml-org/llama.cpp/releases/download/b9551/$ZipName"
$Server = Join-Path $ExtractDir "llama-server.exe"

New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null

if (Test-Path -LiteralPath $Server) {
    Write-Host "llama-server already present: $Server"
    & $Server --version 2>&1
    exit 0
}

Write-Host "Downloading $Url"
Invoke-WebRequest -Uri $Url -OutFile $ZipPath

if (Test-Path -LiteralPath $ExtractDir) {
    Remove-Item -LiteralPath $ExtractDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $ExtractDir | Out-Null
Expand-Archive -LiteralPath $ZipPath -DestinationPath $ExtractDir -Force

if (-not (Test-Path -LiteralPath $Server)) {
    $nested = Get-ChildItem -Path $ExtractDir -Recurse -Filter "llama-server.exe" -File -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($nested) {
        foreach ($item in Get-ChildItem -Path $nested.DirectoryName -Force) {
            Move-Item -LiteralPath $item.FullName -Destination $ExtractDir -Force
        }
    }
}

if (-not (Test-Path -LiteralPath $Server)) {
    throw "Expected llama-server missing after extract: $Server"
}

Write-Host "Installed: $Server"
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& $Server --version 2>&1 | ForEach-Object { Write-Host $_ }
$ErrorActionPreference = $prevEap
