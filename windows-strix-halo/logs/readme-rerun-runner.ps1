$ErrorActionPreference = "Continue"
$Root = "c:\Users\Admin\Documents\Developer\local-llm\windows-strix-halo"
Set-Location $Root
& (Join-Path $Root "Run-Readme-All.ps1") -Fresh
