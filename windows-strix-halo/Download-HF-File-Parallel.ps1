param(
    [Parameter(Mandatory = $true)]
    [string]$Repo,

    [Parameter(Mandatory = $true)]
    [string]$File,

    [Parameter(Mandatory = $true)]
    [string]$OutPath,

    [int64]$ExpectedSize = 0,
    [int]$Chunks = 8
)

$ErrorActionPreference = "Stop"

if ($Chunks -lt 1) { $Chunks = 1 }

$OutPath = [IO.Path]::GetFullPath($OutPath)
$OutDir = Split-Path -Parent $OutPath
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

if ((Test-Path -LiteralPath $OutPath) -and $ExpectedSize -gt 0) {
    $existing = (Get-Item -LiteralPath $OutPath).Length
    if ($existing -eq $ExpectedSize) {
        Write-Host "Already downloaded: $OutPath ($existing bytes)"
        exit 0
    }
}

$encodedFile = ($File -split "/") | ForEach-Object { [uri]::EscapeDataString($_) }
$url = "https://huggingface.co/$Repo/resolve/main/" + ($encodedFile -join "/") + "?download=true"

if ($ExpectedSize -le 0) {
    $api = Invoke-RestMethod -Uri "https://huggingface.co/api/models/$Repo?blobs=true" -TimeoutSec 30
    $sibling = $api.siblings | Where-Object { $_.rfilename -eq $File } | Select-Object -First 1
    if (-not $sibling -or -not $sibling.size) {
        throw "Could not determine size for $Repo/$File"
    }
    $ExpectedSize = [int64]$sibling.size
}

$partDir = Join-Path $OutDir (".parts-" + ([IO.Path]::GetFileName($OutPath) -replace "[^A-Za-z0-9._-]", "_"))
if (Test-Path -LiteralPath $partDir) {
    Remove-Item -LiteralPath $partDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $partDir | Out-Null

$ranges = @()
$chunkSize = [int64][Math]::Ceiling($ExpectedSize / [double]$Chunks)
for ($i = 0; $i -lt $Chunks; $i++) {
    $start = [int64]($i * $chunkSize)
    $end = [int64]([Math]::Min($ExpectedSize - 1, (($i + 1) * $chunkSize) - 1))
    if ($start -le $end) {
        $ranges += [pscustomobject]@{
            Index = $i
            Start = $start
            End = $end
            Path = Join-Path $partDir ("part-{0:D2}.bin" -f $i)
        }
    }
}

Write-Host "Downloading $Repo/$File"
Write-Host "Target: $OutPath"
Write-Host "Size:   $ExpectedSize bytes in $($ranges.Count) chunks"

$jobs = foreach ($range in $ranges) {
    Start-Job -ScriptBlock {
        param($CurlUrl, $Start, $End, $Path)
        & curl.exe -L --fail --silent --show-error --retry 10 --retry-all-errors --connect-timeout 30 --speed-time 60 --speed-limit 1024 -r "$Start-$End" -o $Path $CurlUrl
        if ($LASTEXITCODE -ne 0) {
            throw "curl failed with exit code $LASTEXITCODE for range $Start-$End"
        }
    } -ArgumentList $url, $range.Start, $range.End, $range.Path
}

while (($jobs | Where-Object { $_.State -in @("Running", "NotStarted") }).Count -gt 0) {
    $done = ($jobs | Where-Object { $_.State -eq "Completed" }).Count
    Write-Host ("Chunks complete: {0}/{1}" -f $done, $jobs.Count)
    Start-Sleep -Seconds 10
}

foreach ($job in $jobs) {
    Receive-Job -Job $job -ErrorAction Stop
    Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
}

foreach ($range in $ranges) {
    if (-not (Test-Path -LiteralPath $range.Path)) {
        throw "Missing part $($range.Path)"
    }
    $length = (Get-Item -LiteralPath $range.Path).Length
    $expectedPart = $range.End - $range.Start + 1
    if ($length -ne $expectedPart) {
        throw "Part $($range.Index) has $length bytes, expected $expectedPart"
    }
}

$tmp = "$OutPath.tmp"
if (Test-Path -LiteralPath $tmp) {
    Remove-Item -LiteralPath $tmp -Force
}

$outStream = [IO.File]::Open($tmp, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
try {
    $buffer = New-Object byte[] (8MB)
    foreach ($range in ($ranges | Sort-Object Index)) {
        $inStream = [IO.File]::OpenRead($range.Path)
        try {
            while (($read = $inStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
                $outStream.Write($buffer, 0, $read)
            }
        } finally {
            $inStream.Dispose()
        }
    }
} finally {
    $outStream.Dispose()
}

$finalSize = (Get-Item -LiteralPath $tmp).Length
if ($finalSize -ne $ExpectedSize) {
    throw "Merged file size $finalSize does not match expected $ExpectedSize"
}

Move-Item -LiteralPath $tmp -Destination $OutPath -Force
Remove-Item -LiteralPath $partDir -Recurse -Force
Write-Host "Downloaded: $OutPath"
