param(
    [ValidateSet("All", "Tools", "Msvc")]
    [string]$Profile = "All"
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$transcriptPath = Join-Path $LogDir "install-builddeps-$Profile-$stamp.log"
Start-Transcript -Path $transcriptPath -Force | Out-Null

try {
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        throw "This script must run from an elevated PowerShell session."
    }

    if ($Profile -in @("All", "Tools")) {
        $packages = @(
            "cmake",
            "ninja",
            "mingw",
            "llvm",
            "pkgconfiglite",
            "vulkan-sdk"
        )
        choco install @packages -y --no-progress --accept-license
        if ($LASTEXITCODE -ne 0) {
            throw "Chocolatey tool install exited with code $LASTEXITCODE."
        }
    }

    if ($Profile -in @("All", "Msvc")) {
        choco install visualstudio2022buildtools visualstudio2022-workload-vctools -y --no-progress --limit-output
        if ($LASTEXITCODE -ne 0) {
            throw "Chocolatey MSVC install exited with code $LASTEXITCODE."
        }
        choco install windows-sdk-11-version-24h2-all -y --no-progress --limit-output
        if ($LASTEXITCODE -ne 0) {
            throw "Chocolatey Windows SDK install exited with code $LASTEXITCODE."
        }
    }

    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
    foreach ($tool in @("cmake", "ninja", "gcc", "g++", "clang", "pkg-config", "glslc", "cl", "vswhere")) {
        $cmd = Get-Command $tool -ErrorAction SilentlyContinue
        if ($cmd) {
            Write-Host "$tool=$($cmd.Source)"
        } else {
            Write-Host "$tool=MISSING"
        }
    }

    [pscustomobject]@{
        Profile = $Profile
        Transcript = $transcriptPath
        VsWhere = (Get-Command vswhere.exe -ErrorAction SilentlyContinue).Source
        Cl = (Get-Command cl.exe -ErrorAction SilentlyContinue).Source
    } | ConvertTo-Json
} finally {
    Stop-Transcript | Out-Null
}
