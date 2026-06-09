param(
    [string[]]$OnlyAliases = @(),
    [string]$ServerOverride = "",
    [string]$ModelsJson = "",
    [int]$Port = 18080,
    [string]$SuitesOverride = ""
)

$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$LogDir = Join-Path $Root "logs"
$Server = Join-Path $Root "tools\llama-b9535-bin-win-vulkan-x64\llama-server.exe"
if ($ServerOverride) {
    $Server = $ServerOverride
}
$BenchLoop = Join-Path $Root ".venv-benchloop\Scripts\benchloop.exe"
$Endpoint = "http://127.0.0.1:$Port"
$Suites = "speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent"
if ($SuitesOverride) {
    $Suites = $SuitesOverride
}
$Hardware = "GMKtec NucBox_EVO-X2 / AMD Ryzen AI Max+ 395 w/ Radeon 8060S (Strix Halo)"
$Gpu = "AMD Radeon(TM) 8060S Graphics"
$GpuMemoryGb = "111.82"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function ConvertTo-PlainHashtable {
    param($Value)

    if ($null -eq $Value) {
        return $null
    }
    if ($Value -is [System.Collections.IDictionary]) {
        $hash = @{}
        foreach ($key in $Value.Keys) {
            $hash[$key] = ConvertTo-PlainHashtable -Value $Value[$key]
        }
        return $hash
    }
    if ($Value -is [array]) {
        $items = @()
        foreach ($item in $Value) {
            $items += ConvertTo-PlainHashtable -Value $item
        }
        return $items
    }
    if ($Value -is [pscustomobject]) {
        $hash = @{}
        foreach ($prop in $Value.PSObject.Properties) {
            $hash[$prop.Name] = ConvertTo-PlainHashtable -Value $prop.Value
        }
        return $hash
    }

    return $Value
}

if (-not $ModelsJson) {
    $ModelsJson = Join-Path $Root "readme-models.json"
}
if (-not (Test-Path -LiteralPath $ModelsJson)) {
    throw "Models manifest not found: $ModelsJson"
}

$Models = @()
$parsedModels = Get-Content -LiteralPath $ModelsJson -Raw | ConvertFrom-Json
foreach ($parsedModel in $parsedModels) {
    $Models += ConvertTo-PlainHashtable -Value $parsedModel
}

foreach ($m in $Models) {
    if ($m.ContainsKey("Server") -and $m.Server -and -not [System.IO.Path]::IsPathRooted([string]$m.Server)) {
        $m["Server"] = Join-Path $Root ([string]$m.Server)
    }
}

function Get-ModelValue {
    param($Model, [string]$Key, [string]$Default)

    if ($Model.ContainsKey($Key) -and $null -ne $Model[$Key] -and "$($Model[$Key])" -ne "") {
        return "$($Model[$Key])"
    }

    return $Default
}

function Join-ProcessArguments {
    param([object[]]$ArgumentList)

    ($ArgumentList | ForEach-Object {
        $arg = [string]$_
        if ($arg -eq "") {
            '""'
        } elseif ($arg -match '[\s"]') {
            '"' + $arg.Replace('"', '\"') + '"'
        } else {
            $arg
        }
    }) -join " "
}

function Start-LoggedProcess {
    param(
        [string]$FilePath,
        [object[]]$ArgumentList,
        [string]$WorkingDirectory,
        [string]$StdOutLog,
        [string]$StdErrLog
    )

    "" | Out-File -Encoding utf8 -LiteralPath $StdOutLog
    "" | Out-File -Encoding utf8 -LiteralPath $StdErrLog

    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $FilePath
    $psi.Arguments = Join-ProcessArguments -ArgumentList $ArgumentList
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true

    $proc = [System.Diagnostics.Process]::new()
    $proc.StartInfo = $psi

    $outWriter = [System.IO.StreamWriter]::new($StdOutLog, $true, [System.Text.UTF8Encoding]::new($false))
    $errWriter = [System.IO.StreamWriter]::new($StdErrLog, $true, [System.Text.UTF8Encoding]::new($false))
    Register-ObjectEvent -InputObject $proc -EventName OutputDataReceived -MessageData $outWriter -Action {
        if ($null -ne $EventArgs.Data) { $Event.MessageData.WriteLine($EventArgs.Data); $Event.MessageData.Flush() }
    } | Out-Null
    Register-ObjectEvent -InputObject $proc -EventName ErrorDataReceived -MessageData $errWriter -Action {
        if ($null -ne $EventArgs.Data) { $Event.MessageData.WriteLine($EventArgs.Data); $Event.MessageData.Flush() }
    } | Out-Null

    [void]$proc.Start()
    $proc.BeginOutputReadLine()
    $proc.BeginErrorReadLine()
    return $proc
}

function Wait-Model {
    param([string]$Alias)

    $deadline = (Get-Date).AddMinutes(10)
    while ((Get-Date) -lt $deadline) {
        try {
            $models = Invoke-RestMethod -Uri "$Endpoint/v1/models" -TimeoutSec 5
            if ($models.data.id -contains $Alias) {
                return
            }
        } catch {
            Start-Sleep -Seconds 2
            continue
        }
        Start-Sleep -Seconds 2
    }

    throw "Timed out waiting for model '$Alias' at $Endpoint"
}

function Stop-Server {
    param($Process)

    if ($null -ne $Process -and -not $Process.HasExited) {
        Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
        Wait-Process -Id $Process.Id -Timeout 20 -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path $BenchLoop)) {
    throw "BenchLoop CLI not found: $BenchLoop"
}
if (-not (Test-Path $Server)) {
    throw "llama-server not found: $Server"
}

$env:BENCHLOOP_NO_SUBMIT = "1"
$env:BENCHLOOP_HARDWARE_LABEL = $Hardware
$env:BENCHLOOP_GPU = $Gpu
$env:BENCHLOOP_GPU_MEMORY_GB = $GpuMemoryGb
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

foreach ($m in $Models) {
    if ($OnlyAliases.Count -gt 0 -and $OnlyAliases -notcontains $m.Alias) {
        continue
    }

    Write-Host "==== $($m.Name) ===="
    foreach ($pathKey in @("Model", "Mmproj")) {
        if ($m.ContainsKey($pathKey) -and $null -ne $m[$pathKey] -and "$($m[$pathKey])" -ne "" -and -not (Test-Path $m[$pathKey])) {
            throw "$pathKey not found for $($m.Name): $($m[$pathKey])"
        }
    }

    $serverOut = Join-Path $LogDir "benchloop-$($m.Alias)-server.out.log"
    $serverErr = Join-Path $LogDir "benchloop-$($m.Alias)-server.err.log"
    $benchOut = Join-Path $LogDir "benchloop-$($m.Alias).out.log"
    $benchErr = Join-Path $LogDir "benchloop-$($m.Alias).err.log"
    Remove-Item $serverOut,$serverErr,$benchOut,$benchErr -ErrorAction SilentlyContinue

    $ctxSize = Get-ModelValue -Model $m -Key "CtxSize" -Default "262144"
    $temp = Get-ModelValue -Model $m -Key "Temp" -Default "0.75"
    $topP = Get-ModelValue -Model $m -Key "TopP" -Default "0.95"
    $topK = Get-ModelValue -Model $m -Key "TopK" -Default "20"
    $minP = Get-ModelValue -Model $m -Key "MinP" -Default "0.0"
    $repeatPenalty = Get-ModelValue -Model $m -Key "RepeatPenalty" -Default "1.0"
    $imageMinTokens = Get-ModelValue -Model $m -Key "ImageMinTokens" -Default "256"

    if ($m.ContainsKey("RawServerArgs") -and $null -ne $m.RawServerArgs) {
        $serverArgs = @($m.RawServerArgs | ForEach-Object {
            $arg = "$_"
            $arg.Replace("{PORT}", "$Port")
        })
    } else {
        $serverArgs = @(
            "--model", $m.Model,
            "--alias", $m.Alias,
            "--host", "127.0.0.1",
            "--port", "$Port",
            "--ctx-size", $ctxSize,
            "-np", "1",
            "-ngl", "99",
            "--flash-attn", "on",
            "--cache-type-k", "q8_0",
            "--cache-type-v", "q8_0",
            "--temp", $temp,
            "--top-p", $topP,
            "--top-k", $topK,
            "--presence-penalty", "0.0",
            "--repeat-penalty", $repeatPenalty,
            "--seed", "3407",
            "-n", "32768"
        )
        if (-not ($m.ContainsKey("OmitImageMinTokens") -and $m.OmitImageMinTokens)) {
            $serverArgs += @("--image-min-tokens", $imageMinTokens)
        }
        if (-not ($m.ContainsKey("OmitMinP") -and $m.OmitMinP)) {
            $serverArgs += @("--min-p", $minP)
        }
        if ($m.ContainsKey("Mmproj") -and $null -ne $m.Mmproj -and "$($m.Mmproj)" -ne "") {
            $serverArgs += @("--mmproj", $m.Mmproj)
        }
        if ($m.ContainsKey("Mtp") -and $m.Mtp) {
            $serverArgs += @("--spec-type", "draft-mtp", "--spec-draft-n-min", "1", "--spec-draft-n-max", "2")
        }
        if ($m.ContainsKey("ExtraServerArgs") -and $null -ne $m.ExtraServerArgs) {
            $serverArgs += $m.ExtraServerArgs
        }
    }

    $serverProcess = $null
    try {
        $serverForRun = if ($m.ContainsKey("Server") -and -not [string]::IsNullOrWhiteSpace($m.Server)) { $m.Server } else { $Server }
        $serverProcess = Start-LoggedProcess -FilePath $serverForRun -ArgumentList $serverArgs -WorkingDirectory $Root -StdOutLog $serverOut -StdErrLog $serverErr
        Write-Host "Started llama-server PID $($serverProcess.Id)"
        Wait-Model -Alias $m.Alias

        $env:BENCHLOOP_TEMPERATURE = $temp
        $env:BENCHLOOP_TOP_P = $topP
        $env:BENCHLOOP_TOP_K = $topK
        $env:BENCHLOOP_MIN_P = $minP
        $env:BENCHLOOP_PRESENCE_PENALTY = "0.0"
        $env:BENCHLOOP_REPETITION_PENALTY = $repeatPenalty
        $env:BENCHLOOP_FREQUENCY_PENALTY = "0.0"
        Write-Host "BenchLoop request sampler: temp=$temp top_p=$topP top_k=$topK min_p=$minP repeat_penalty=$repeatPenalty"

        $benchArgs = @(
            "run",
            "--model", $m.Alias,
            "--endpoint", $Endpoint,
            "--provider", "openai_compat",
            "--suites", $Suites,
            "--harness", "raw"
        )

        Write-Host "Running BenchLoop suites: $Suites"
        $benchProcess = Start-LoggedProcess -FilePath $BenchLoop -ArgumentList $benchArgs -WorkingDirectory $Root -StdOutLog $benchOut -StdErrLog $benchErr
        $benchProcess.WaitForExit()
        $benchProcess.Refresh()
        $exit = $benchProcess.ExitCode
        if ($null -eq $exit -or "$exit" -eq "") {
            $exit = 0
        }
        if ($exit -ne 0) {
            throw "BenchLoop failed for $($m.Name) with exit code $exit. See $benchErr"
        }
        Write-Host "BenchLoop finished for $($m.Name)"
    } finally {
        Stop-Server -Process $serverProcess
        Start-Sleep -Seconds 3
    }
}

Write-Host "All README BenchLoop runs finished."
