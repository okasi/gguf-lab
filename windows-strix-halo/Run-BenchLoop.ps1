param(
    [string[]]$OnlyAliases = @(),
    [string]$ServerOverride = "",
    [string]$ModelsJson = "",
    [int]$Port = 18080,
    [string]$SuitesOverride = "",
    [ValidateSet("auto", "off")]
    [string]$Reasoning = "auto",
    [string]$AliasSuffix = "",
    [int]$SpecDraftNMaxOverride = 0,
    [Alias("c")]
    [int]$CtxSize = 0,
    [int]$CacheReuse = 0,
    [int]$BatchSize = 0,
    [int]$UBatchSize = 0,
    [int]$ThreadsBatch = 0
)

$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
. (Join-Path $Root "ModelDraft.ps1")
. (Join-Path $Root "ReasoningArgs.ps1")
$LogDir = Join-Path $Root "logs"
$Server = Join-Path $Root "tools\llama-b9551-bin-win-vulkan-x64\llama-server.exe"
if (-not (Test-Path -LiteralPath $Server)) {
    $Server = Join-Path $Root "tools\llama-b9535-bin-win-vulkan-x64\llama-server.exe"
}
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
    $runAlias = Get-ReadmeAlias -Model $m -AliasSuffix $AliasSuffix
    if ($OnlyAliases.Count -gt 0 -and $OnlyAliases -notcontains $runAlias -and $OnlyAliases -notcontains $m.Alias) {
        continue
    }

    Write-Host "==== $($m.Name) ===="
    foreach ($pathKey in @("Model", "Mmproj")) {
        if ($m.ContainsKey($pathKey) -and $null -ne $m[$pathKey] -and "$($m[$pathKey])" -ne "" -and -not (Test-Path $m[$pathKey])) {
            throw "$pathKey not found for $($m.Name): $($m[$pathKey])"
        }
    }
    if ($m.ContainsKey("Mtp") -and $m.Mtp) {
        $needsDraft = ($m.ContainsKey("ModelDraft") -and $m.ModelDraft) -or
            ($m.ContainsKey("ModelDraftFile") -and $m.ModelDraftFile) -or
            ($m.ContainsKey("MtpAutoDiscoveryFile") -and $m.MtpAutoDiscoveryFile)
        if ($needsDraft) {
            $draftPath = if ($m.ContainsKey("ModelDraft") -and $m.ModelDraft) {
                [string]$m.ModelDraft
            } else {
                $auto = if ($m.ContainsKey("MtpAutoDiscoveryFile")) { [string]$m.MtpAutoDiscoveryFile } else { "" }
                $draftFile = if ($m.ContainsKey("ModelDraftFile")) { [string]$m.ModelDraftFile } else { "" }
                Resolve-ModelDraftPath -ModelPath $m.Model -DraftFile $draftFile -AutoDiscoveryFile $auto
            }
            if (-not $draftPath -or -not (Test-Path -LiteralPath $draftPath)) {
                throw "ModelDraft not found for $($m.Name). Run Download-Gemma4-QAT-MTP.ps1 or set ModelDraft."
            }
        }
    }

    $serverOut = Join-Path $LogDir "benchloop-$runAlias-server.out.log"
    $serverErr = Join-Path $LogDir "benchloop-$runAlias-server.err.log"
    $benchOut = Join-Path $LogDir "benchloop-$runAlias.out.log"
    $benchErr = Join-Path $LogDir "benchloop-$runAlias.err.log"
    Remove-Item $serverOut,$serverErr,$benchOut,$benchErr -ErrorAction SilentlyContinue

    $ctxSize = if ($CtxSize -gt 0) { "$CtxSize" } else { Get-ModelValue -Model $m -Key "CtxSize" -Default "262144" }
    $ctxFlag = if ($CtxSize -gt 0) { "-c" } else { "--ctx-size" }
    $temp = Get-ModelValue -Model $m -Key "Temp" -Default "0.75"
    $topP = Get-ModelValue -Model $m -Key "TopP" -Default "0.95"
    $topK = Get-ModelValue -Model $m -Key "TopK" -Default "20"
    $minP = Get-ModelValue -Model $m -Key "MinP" -Default "0.0"
    $repeatPenalty = Get-ModelValue -Model $m -Key "RepeatPenalty" -Default "1.0"
    $imageMinTokens = Get-ModelValue -Model $m -Key "ImageMinTokens" -Default "256"
    $flashAttn = Get-FlashAttnValue -Model $m
    $cacheTypes = Get-CacheTypeValues -Model $m
    $runModel = $m
    if ($SpecDraftNMaxOverride -gt 0) {
        $runModel = @{} + $m
        $runModel["SpecDraftNMax"] = $SpecDraftNMaxOverride
    }

    if ($runModel.ContainsKey("RawServerArgs") -and $null -ne $runModel.RawServerArgs) {
        $serverArgs = @($runModel.RawServerArgs | ForEach-Object {
            $arg = "$_"
            $arg.Replace("{PORT}", "$Port").Replace("{ALIAS}", $runAlias)
        })
        $serverArgs = Apply-PromptRuntimeOverrides -ServerArgs $serverArgs -CtxSize $CtxSize -CacheReuse $CacheReuse -BatchSize $BatchSize -UBatchSize $UBatchSize -ThreadsBatch $ThreadsBatch
    } else {
        $serverArgs = @(
            "--model", $runModel.Model,
            "--alias", $runAlias,
            "--host", "127.0.0.1",
            "--port", "$Port",
            $ctxFlag, $ctxSize,
            "-np", "1",
            "-ngl", "99",
            "--flash-attn", $flashAttn,
            "--cache-type-k", $cacheTypes.K,
            "--cache-type-v", $cacheTypes.V,
            "--temp", $temp,
            "--top-p", $topP,
            "--top-k", $topK,
            "--presence-penalty", "0.0",
            "--repeat-penalty", $repeatPenalty,
            "--seed", "3407",
            "-n", "32768"
        )
        if (-not ($runModel.ContainsKey("OmitImageMinTokens") -and $runModel.OmitImageMinTokens)) {
            $serverArgs += @("--image-min-tokens", $imageMinTokens)
        }
        if (-not ($runModel.ContainsKey("OmitMinP") -and $runModel.OmitMinP)) {
            $serverArgs += @("--min-p", $minP)
        }
        if ($runModel.ContainsKey("Mmproj") -and $null -ne $runModel.Mmproj -and "$($runModel.Mmproj)" -ne "") {
            $serverArgs += @("--mmproj", $runModel.Mmproj)
        }
        $serverArgs = Add-SpeculativeServerArgs -Model $runModel -ServerArgs $serverArgs
        if ($runModel.ContainsKey("ExtraServerArgs") -and $null -ne $runModel.ExtraServerArgs) {
            $serverArgs += $runModel.ExtraServerArgs
        }
        if ($runModel.ContainsKey("GptOss") -and $runModel.GptOss) {
            $serverArgs += @("--jinja")
        }
        $serverArgs = Apply-PromptRuntimeOverrides -ServerArgs $serverArgs -CtxSize $CtxSize -CacheReuse $CacheReuse -BatchSize $BatchSize -UBatchSize $UBatchSize -ThreadsBatch $ThreadsBatch
        $serverArgs = Add-ReasoningServerArgs -ServerArgs $serverArgs -Reasoning $Reasoning -ModelName ([string]$runModel.Name)
    }

    $serverProcess = $null
    try {
        $serverForRun = if ($m.ContainsKey("Server") -and -not [string]::IsNullOrWhiteSpace($m.Server)) { $m.Server } else { $Server }
        $serverProcess = Start-LoggedProcess -FilePath $serverForRun -ArgumentList $serverArgs -WorkingDirectory $Root -StdOutLog $serverOut -StdErrLog $serverErr
        Write-Host "Started llama-server PID $($serverProcess.Id)"
        Wait-Model -Alias $runAlias

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
            "--model", $runAlias,
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
exit 0
