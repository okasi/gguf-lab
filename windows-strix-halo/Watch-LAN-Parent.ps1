param(
    [Parameter(Mandatory = $true)]
    [int]$ParentPid,

    [string]$ChildPidCsv = "",
    [string]$PortCsv = "8080,18081",
    [string]$PidFile = "",
    [string]$LogPath = ""
)

$ErrorActionPreference = "Continue"

function Write-WatchLog {
    param([string]$Message)
    if ($LogPath) {
        Add-Content -LiteralPath $LogPath -Value "$(Get-Date -Format s) $Message" -Encoding utf8
    }
}

Write-WatchLog "watching parent=$ParentPid childPids=$ChildPidCsv ports=$PortCsv"

while (Get-Process -Id $ParentPid -ErrorAction SilentlyContinue) {
    Start-Sleep -Seconds 2
}

Write-WatchLog "parent exited; cleaning up"

$ChildPids = @()
if ($ChildPidCsv) {
    $ChildPids = $ChildPidCsv -split "," | ForEach-Object {
        $value = 0
        if ([int]::TryParse($_.Trim(), [ref]$value)) { $value }
    }
}

$Ports = @()
if ($PortCsv) {
    $Ports = $PortCsv -split "," | ForEach-Object {
        $value = 0
        if ([int]::TryParse($_.Trim(), [ref]$value)) { $value }
    }
}

foreach ($ProcessId in $ChildPids) {
    if ($ProcessId -gt 0) {
        Write-WatchLog "stopping child pid=$ProcessId"
        Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
    }
}

foreach ($Port in $Ports) {
    $Listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($Listener in $Listeners) {
        if ($Listener.OwningProcess) {
            Write-WatchLog "stopping listener port=$Port pid=$($Listener.OwningProcess)"
            Stop-Process -Id $Listener.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

if ($PidFile) {
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}

Write-WatchLog "cleanup complete"
