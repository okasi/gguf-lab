param(
    [switch]$Mtp35BOnly,
    [switch]$Holo9BOnly
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Download = Join-Path $Root "Download-HF-File-Parallel.ps1"

$KnownSizes = @{
    "Jackrong/Qwopus3.6-35B-A3B-v1-MTP-GGUF|Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M.gguf" = 25346479872
    "mradermacher/Holo-3.1-9B-GGUF|Holo-3.1-9B.Q5_K_M.gguf" = 6467970976
    "mradermacher/Holo-3.1-9B-GGUF|Holo-3.1-9B.mmproj-f16.gguf" = 918166624
}

function Get-HfBlobSize {
    param([string]$Repo, [string]$File)
    $key = "$Repo|$File"
    if ($KnownSizes.ContainsKey($key)) {
        return [int64]$KnownSizes[$key]
    }
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            $api = Invoke-RestMethod -Uri "https://huggingface.co/api/models/$Repo?blobs=true" -TimeoutSec 60
            $sibling = $api.siblings | Where-Object { $_.rfilename -eq $File } | Select-Object -First 1
            if ($sibling -and $sibling.size) {
                return [int64]$sibling.size
            }
        } catch {
            if ($attempt -eq 3) { throw }
            Start-Sleep -Seconds (2 * $attempt)
        }
    }
    throw "Could not resolve size for $Repo/$File"
}

function Get-ModelCacheDir {
    param([string]$Repo)
    $hubName = "models--{0}" -f (($Repo -replace "/", "--"))
    $dir = Join-Path (Join-Path $env:USERPROFILE ".cache\huggingface\hub") $hubName
    $snapshot = Join-Path $dir "snapshots\readme-bench"
    New-Item -ItemType Directory -Force -Path $snapshot | Out-Null
    return $snapshot
}

function Download-HfModelFile {
    param(
        [string]$Repo,
        [string]$File
    )
    $outDir = Get-ModelCacheDir -Repo $Repo
    $outPath = Join-Path $outDir $File
    if ((Test-Path -LiteralPath $outPath) -and (Get-Item -LiteralPath $outPath).Length -gt 0) {
        $size = Get-HfBlobSize -Repo $Repo -File $File
        if ((Get-Item -LiteralPath $outPath).Length -eq $size) {
            Write-Host "Already present: $outPath"
            return $outPath
        }
    }
    $expected = Get-HfBlobSize -Repo $Repo -File $File
    & $Download -Repo $Repo -File $File -OutPath $outPath -ExpectedSize $expected -Chunks 8
    return $outPath
}

$mtpRepo = "Jackrong/Qwopus3.6-35B-A3B-v1-MTP-GGUF"
$mtpFiles = @(
    "Qwopus3.6-35B-A3B-v1-MTP-Q5_K_M.gguf"
)

$holoRepo = "mradermacher/Holo-3.1-9B-GGUF"
$holoFiles = @(
    "Holo-3.1-9B.Q5_K_M.gguf",
    "Holo-3.1-9B.mmproj-f16.gguf"
)

$paths = @{}
if (-not $Holo9BOnly) {
    foreach ($file in $mtpFiles) {
        $paths[$file] = Download-HfModelFile -Repo $mtpRepo -File $file
    }
}
if (-not $Mtp35BOnly) {
    foreach ($file in $holoFiles) {
        $paths[$file] = Download-HfModelFile -Repo $holoRepo -File $file
    }
}

$paths.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Host ("{0} => {1}" -f $_.Key, $_.Value)
}
