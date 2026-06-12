param(
    [Parameter(Mandatory = $true)]
    [string]$Repo,

    [Parameter(Mandatory = $true)]
    [string]$File,

    [Parameter(Mandatory = $true)]
    [string]$OutPath,

    [int64]$ExpectedSize = 0,
    [int64]$ChunkMiB = 512
)

$ErrorActionPreference = "Stop"

if ($ChunkMiB -lt 1) { $ChunkMiB = 1 }

$OutPath = [IO.Path]::GetFullPath($OutPath)
$OutDir = Split-Path -Parent $OutPath
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

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

$existing = 0L
if (Test-Path -LiteralPath $OutPath) {
    $existing = (Get-Item -LiteralPath $OutPath).Length
}
if ($existing -eq $ExpectedSize) {
    Write-Host "Already downloaded: $OutPath ($existing bytes)"
    exit 0
}
if ($existing -gt $ExpectedSize) {
    throw "Existing file is larger than expected: $OutPath ($existing > $ExpectedSize)"
}

$chunkBytes = [int64]$ChunkMiB * 1024L * 1024L
$tmp = "$OutPath.part"
if (Test-Path -LiteralPath $tmp) {
    Remove-Item -LiteralPath $tmp -Force
}

Write-Host "Downloading $Repo/$File"
Write-Host "Target: $OutPath"
Write-Host "Size:   $ExpectedSize bytes"
Write-Host "Resume: $existing bytes"
Write-Host "Chunk:  $chunkBytes bytes"

while ($existing -lt $ExpectedSize) {
    $start = $existing
    $end = [Math]::Min($ExpectedSize - 1, $start + $chunkBytes - 1)
    $expectedPart = $end - $start + 1
    Write-Host ("Range {0}-{1} ({2:N1} MiB)" -f $start, $end, ($expectedPart / 1MB))

    if (Test-Path -LiteralPath $tmp) {
        Remove-Item -LiteralPath $tmp -Force
    }

    & curl.exe -L --fail --silent --show-error --retry 10 --retry-all-errors --connect-timeout 30 --speed-time 120 --speed-limit 1024 -r "$start-$end" -o $tmp $url
    if ($LASTEXITCODE -ne 0) {
        throw "curl failed with exit code $LASTEXITCODE for range $start-$end"
    }

    $length = (Get-Item -LiteralPath $tmp).Length
    if ($length -ne $expectedPart) {
        throw "Part length $length does not match expected $expectedPart for range $start-$end"
    }

    $outStream = [IO.File]::Open($OutPath, [IO.FileMode]::Append, [IO.FileAccess]::Write, [IO.FileShare]::Read)
    try {
        $inStream = [IO.File]::OpenRead($tmp)
        try {
            $buffer = New-Object byte[] (8MB)
            while (($read = $inStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
                $outStream.Write($buffer, 0, $read)
            }
        } finally {
            $inStream.Dispose()
        }
    } finally {
        $outStream.Dispose()
    }

    Remove-Item -LiteralPath $tmp -Force
    $existing = (Get-Item -LiteralPath $OutPath).Length
    Write-Host ("Progress: {0}/{1} bytes ({2:P1})" -f $existing, $ExpectedSize, ($existing / [double]$ExpectedSize))
}

Write-Host "Downloaded: $OutPath"
