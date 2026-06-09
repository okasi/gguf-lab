param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [object[]]$Remaining
)

& "$PSScriptRoot\Serve-LAN.ps1" -Model "Qwopus3.6-27B-v2-MTP" @Remaining
