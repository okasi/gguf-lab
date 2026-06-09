param(
  [string]$Installer = "C:\Users\Admin\Downloads\AMD-Software-PRO-Edition-26.Q1-Win11-For-HIP.exe",
  [string]$LogPath = ""
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
if (-not $LogPath) {
  $LogPath = Join-Path $Root "logs\hip-sdk-7.1.1-install.log"
}

if (-not (Test-Path -LiteralPath $Installer)) {
  throw "HIP SDK installer not found: $Installer"
}

$logDir = Split-Path -Parent $LogPath
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$args = @("-install", "-log", $LogPath)
$process = Start-Process -FilePath $Installer -ArgumentList $args -Wait -PassThru

$candidateRoots = @(
  "C:\Program Files\AMD\ROCm\7.1",
  "C:\Program Files\AMD\ROCm\7.1.1",
  "C:\Program Files\AMD\ROCm"
)

$hipRoot = $candidateRoots | Where-Object {
  Test-Path (Join-Path $_ "bin\hipcc.exe")
} | Select-Object -First 1

if ($hipRoot) {
  [Environment]::SetEnvironmentVariable("HIP_PATH", $hipRoot, "Machine")
  [Environment]::SetEnvironmentVariable("HIP_PATH", $hipRoot, "User")

  $binPath = Join-Path $hipRoot "bin"
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if ($null -eq $userPath) { $userPath = "" }
  $parts = @($userPath -split ";" | Where-Object { $_ })
  if (-not ($parts -contains $binPath)) {
    $parts += $binPath
    [Environment]::SetEnvironmentVariable("Path", ($parts -join ";"), "User")
  }
}

[pscustomobject]@{
  InstallerExitCode = $process.ExitCode
  LogPath = $LogPath
  HipRoot = $hipRoot
  Hipcc = if ($hipRoot) { Join-Path $hipRoot "bin\hipcc.exe" } else { $null }
} | ConvertTo-Json
