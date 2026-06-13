param(
    [string]$ModelsJson = "",
    [string]$PolicyPath = "",
    [int]$BackendPort = 18081,
    [int]$AdapterPort = 18080,
    [string]$SuitesOverride = "",
    [ValidateSet("auto", "off")]
    [string]$Reasoning = "off",
    [string]$AliasSuffix = "-qwen-harness",
    [int]$SpecDraftNMaxOverride = 2,
    [string]$OutDir = "",
    [string]$IterationLabel = "",
    [string]$ServerOverride = "",
    [string]$ModelNameFilter = ""
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$RepoRoot = Split-Path $Root -Parent
. (Join-Path $Root "ModelDraft.ps1")
. (Join-Path $Root "ReasoningArgs.ps1")
$LogDir = if ($OutDir) { $OutDir } else { Join-Path $Root "logs" }
$Server = Join-Path $Root "tools\llama-b9551-bin-win-vulkan-x64\llama-server.exe"
if (-not (Test-Path -LiteralPath $Server)) {
    $Server = Join-Path $Root "tools\llama-b9535-bin-win-vulkan-x64\llama-server.exe"
}
if ($ServerOverride) {
    $Server = $ServerOverride
}
$BenchLoop = Join-Path $Root ".venv-benchloop\Scripts\benchloop.exe"
$Adapter = Join-Path $RepoRoot "lan-adapter.js"
$HarnessModule = Join-Path $RepoRoot "qwen_harness\processor.mjs"
$DefaultPolicyPath = Join-Path $RepoRoot "qwen_harness\configs\qwopus35_optimized_policy.json"
$ExplicitPolicyPath = $PolicyPath
if (-not $ModelsJson) {
    $ModelsJson = Join-Path $Root "configs\qwen-harness-target-models.json"
}
$Suites = if ($SuitesOverride) { $SuitesOverride } else { "speed,toolcall,coding,dataextract,instructfollow,reasonmath,agent" }
$Hardware = "GMKtec NucBox_EVO-X2 / AMD Ryzen AI Max+ 395 w/ Radeon 8060S (Strix Halo)"
$Gpu = "AMD Radeon(TM) 8060S Graphics"
$GpuMemoryGb = "111.82"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function ConvertTo-PlainHashtable {
    param($Value)
    if ($null -eq $Value) { return $null }
    if ($Value -is [string] -or $Value -is [char] -or $Value.GetType().IsPrimitive -or $Value -is [decimal]) {
        return $Value
    }
    if ($Value -is [System.Collections.IDictionary]) {
        $hash = @{}
        foreach ($key in $Value.Keys) { $hash[$key] = ConvertTo-PlainHashtable -Value $Value[$key] }
        return $hash
    }
    if ($Value -is [array]) {
        return @($Value | ForEach-Object { ConvertTo-PlainHashtable -Value $_ })
    }
    if ($Value -is [pscustomobject]) {
        $hash = @{}
        foreach ($prop in $Value.PSObject.Properties) { $hash[$prop.Name] = ConvertTo-PlainHashtable -Value $prop.Value }
        return $hash
    }
    return $Value
}

function Get-ModelValue {
    param($Model, [string]$Key, [string]$Default)
    if ($Model.ContainsKey($Key) -and $null -ne $Model[$Key] -and "$($Model[$Key])" -ne "") { return "$($Model[$Key])" }
    return $Default
}

function Resolve-RepoPath {
    param([string]$PathText)
    if (-not $PathText) { return "" }
    if ([System.IO.Path]::IsPathRooted($PathText)) { return $PathText }
    return Join-Path $RepoRoot $PathText
}

function Get-ModelPolicyPath {
    param($Model, [string]$ExplicitPath, [string]$DefaultPath)
    if ($ExplicitPath) { return Resolve-RepoPath -PathText $ExplicitPath }
    if ($Model.ContainsKey("PolicyPath") -and $Model.PolicyPath) { return Resolve-RepoPath -PathText ([string]$Model.PolicyPath) }
    return $DefaultPath
}

function Get-PublicAliases {
    param($Model, [string]$RunAlias)
    $aliases = @($RunAlias)
    foreach ($key in @("Alias", "Name", "ReadmeFileLabel", "File", "Source")) {
        if ($Model.ContainsKey($key) -and $Model[$key]) { $aliases += [string]$Model[$key] }
    }
    if ($Model.ContainsKey("PublicAliases") -and $null -ne $Model.PublicAliases) {
        $aliases += @($Model.PublicAliases | ForEach-Object { [string]$_ })
    }
    return (($aliases | Where-Object { $_ -and $_.Trim() }) | Select-Object -Unique) -join ","
}

function Join-ProcessArguments {
    param([object[]]$ArgumentList)
    ($ArgumentList | ForEach-Object {
        $arg = [string]$_
        if ($arg -eq "") { '""' }
        elseif ($arg -match '[\s"]') { '"' + $arg.Replace('"', '\"') + '"' }
        else { $arg }
    }) -join " "
}

function Clear-LogFile {
    param([string]$Path)
    for ($attempt = 0; $attempt -lt 8; $attempt++) {
        try {
            if (Test-Path -LiteralPath $Path) {
                Remove-Item -LiteralPath $Path -Force -ErrorAction Stop
            }
            New-Item -ItemType File -Path $Path -Force | Out-Null
            return
        } catch {
            Start-Sleep -Milliseconds 400
        }
    }
    throw "Could not initialize log file: $Path"
}

function Get-BenchLoopRunJsonPath {
    param([string]$BenchOut)
    if (-not (Test-Path -LiteralPath $BenchOut)) { return "" }
    $lines = @(Get-Content -LiteralPath $BenchOut)
    $text = $lines -join "`n"
    if ($text -match '([A-Za-z]:\\[^\r\n]*?\\run\.json)') {
        return $Matches[1]
    }
    $savedIndex = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match 'Saved results to') {
            $savedIndex = $i
            break
        }
    }
    if ($savedIndex -ge 0) {
        $window = @($lines | Select-Object -Skip ($savedIndex + 1) -First 6)
        $prefixes = @($window | Where-Object { $_ -match '^[A-Za-z]:\\' })
        $suffixes = @($window | Where-Object { $_ -match '\\run\.json$' -and $_ -notmatch '^[A-Za-z]:\\' })
        foreach ($prefix in $prefixes) {
            foreach ($suffix in $suffixes) {
                $candidate = "$prefix$suffix"
                if (Test-Path -LiteralPath $candidate) { return $candidate }
            }
        }
    }
    return ""
}

function Copy-BenchLoopRunJson {
    param([string]$BenchOut, [string]$LogDir, [string]$Label, [string]$RunAlias)
    $runJson = ""
    for ($attempt = 0; $attempt -lt 10; $attempt++) {
        $runJson = Get-BenchLoopRunJsonPath -BenchOut $BenchOut
        if ($runJson -and (Test-Path -LiteralPath $runJson)) { break }
        Start-Sleep -Milliseconds 500
    }
    if (-not $runJson -or -not (Test-Path -LiteralPath $runJson)) {
        $runsRoot = Join-Path $env:USERPROFILE ".bench-loop\runs"
        if (Test-Path -LiteralPath $runsRoot) {
            $latest = Get-ChildItem -LiteralPath $runsRoot -Directory -ErrorAction SilentlyContinue |
                Where-Object { $_.Name -like "*$RunAlias*" -and (Test-Path -LiteralPath (Join-Path $_.FullName "run.json")) } |
                Sort-Object LastWriteTime -Descending |
                Select-Object -First 1
            if ($latest) { $runJson = Join-Path $latest.FullName "run.json" }
        }
    }
    if (-not $runJson -or -not (Test-Path -LiteralPath $runJson)) { return "" }
    $runJsonDir = Join-Path $LogDir "run-json"
    New-Item -ItemType Directory -Force -Path $runJsonDir | Out-Null
    $target = Join-Path $runJsonDir "qwen-harness-$label-$RunAlias.run.json"
    Copy-Item -LiteralPath $runJson -Destination $target -Force
    return $target
}

function Get-BenchLoopMetrics {
    param([string]$RunJsonPath)
    if (-not $RunJsonPath -or -not (Test-Path -LiteralPath $RunJsonPath)) { return $null }
    $run = Get-Content -LiteralPath $RunJsonPath -Raw | ConvertFrom-Json
    $suites = [ordered]@{}
    if ($run.suites) {
        foreach ($suite in $run.suites.PSObject.Properties) {
            $suites[$suite.Name] = [double]($suite.Value.score)
        }
    }
    return [ordered]@{
        overall_score = if ($null -ne $run.overall_score) { [double]$run.overall_score } else { $null }
        quality_score = if ($null -ne $run.quality_score) { [double]$run.quality_score } else { $null }
        speed_score = if ($null -ne $run.speed_score) { [double]$run.speed_score } else { $null }
        reliability_score = if ($null -ne $run.reliability_score) { [double]$run.reliability_score } else { $null }
        generation_tok_per_sec = if ($run.speed_metrics -and $null -ne $run.speed_metrics.generation_tok_per_sec) { [double]$run.speed_metrics.generation_tok_per_sec } else { $null }
        suites = $suites
    }
}

function Write-HarnessRunSummary {
    param([string]$LogDir, [string]$Label, [string]$RunAlias, $Summary)
    $summaryPath = Join-Path $LogDir "qwen-harness-$Label-$RunAlias-summary.json"
    $Summary["summary_path"] = $summaryPath
    $json = $Summary | ConvertTo-Json -Depth 32
    Set-Content -LiteralPath $summaryPath -Value $json -Encoding utf8
    Add-Content -LiteralPath (Join-Path $LogDir "qwen-harness-run-summaries.jsonl") -Value ($json -replace "`r?`n", "") -Encoding utf8
}

function Copy-OrderedDictionary {
    param($Source)
    $copy = [ordered]@{}
    foreach ($key in $Source.Keys) {
        $copy[$key] = $Source[$key]
    }
    return $copy
}

function Start-LoggedProcess {
    param(
        [string]$FilePath,
        [object[]]$ArgumentList,
        [string]$WorkingDirectory,
        [string]$StdOutLog,
        [string]$StdErrLog,
        [hashtable]$Environment = @{}
    )
    Clear-LogFile -Path $StdOutLog
    Clear-LogFile -Path $StdErrLog
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $FilePath
    $psi.Arguments = Join-ProcessArguments -ArgumentList $ArgumentList
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    foreach ($key in $Environment.Keys) { $psi.Environment[$key] = [string]$Environment[$key] }
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

function Wait-Health {
    param([string]$Url, [string]$Label, [int]$Minutes = 12)
    $deadline = (Get-Date).AddMinutes($Minutes)
    while ((Get-Date) -lt $deadline) {
        try {
            Invoke-RestMethod -Uri $Url -TimeoutSec 5 | Out-Null
            return
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    throw "Timed out waiting for $Label at $Url"
}

function Stop-ProcessSafe {
    param($Process)
    if ($null -ne $Process -and -not $Process.HasExited) {
        Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
        Wait-Process -Id $Process.Id -Timeout 20 -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path $BenchLoop)) { throw "BenchLoop CLI not found: $BenchLoop" }
if (-not (Test-Path $Server)) { throw "llama-server not found: $Server" }
if (-not (Test-Path $Adapter)) { throw "lan-adapter not found: $Adapter" }
if ($ExplicitPolicyPath -and -not (Test-Path (Resolve-RepoPath -PathText $ExplicitPolicyPath))) { throw "Harness policy not found: $ExplicitPolicyPath" }

$Models = @()
foreach ($parsedModel in (Get-Content -LiteralPath $ModelsJson -Raw | ConvertFrom-Json)) {
    $Models += ConvertTo-PlainHashtable -Value $parsedModel
}
if ($ModelNameFilter) {
    $Models = @($Models | Where-Object {
        ([string]$_.Name -like "*$ModelNameFilter*") -or
        ([string]$_.Alias -like "*$ModelNameFilter*") -or
        ([string]$_.File -like "*$ModelNameFilter*")
    })
    if (-not $Models.Count) { throw "No models matched -ModelNameFilter '$ModelNameFilter' in $ModelsJson" }
}

$env:BENCHLOOP_NO_SUBMIT = "1"
$env:BENCHLOOP_HARDWARE_LABEL = $Hardware
$env:BENCHLOOP_GPU = $Gpu
$env:BENCHLOOP_GPU_MEMORY_GB = $GpuMemoryGb
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

$BundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$Node = if (Test-Path $BundledNode) { $BundledNode } else { (Get-Command node -ErrorAction Stop).Source }

foreach ($m in $Models) {
    $runAlias = Get-ReadmeAlias -Model $m -AliasSuffix $AliasSuffix
    $policyForModel = Get-ModelPolicyPath -Model $m -ExplicitPath $ExplicitPolicyPath -DefaultPath $DefaultPolicyPath
    if (-not (Test-Path -LiteralPath $policyForModel)) { throw "Harness policy not found for $($m.Name): $policyForModel" }
    Write-Host "==== $($m.Name) harness run ($IterationLabel) ===="

    $label = if ($IterationLabel) { $IterationLabel } else { "baseline" }
    $serverOut = Join-Path $LogDir "qwen-harness-$label-$runAlias-server.out.log"
    $serverErr = Join-Path $LogDir "qwen-harness-$label-$runAlias-server.err.log"
    $adapterOut = Join-Path $LogDir "qwen-harness-$label-$runAlias-adapter.out.log"
    $adapterErr = Join-Path $LogDir "qwen-harness-$label-$runAlias-adapter.err.log"
    $adapterJsonl = Join-Path $LogDir "qwen-harness-$label-$runAlias-adapter.jsonl"
    $benchOut = Join-Path $LogDir "qwen-harness-$label-$runAlias-benchloop.out.log"
    $benchErr = Join-Path $LogDir "qwen-harness-$label-$runAlias-benchloop.err.log"
    $policySnapshot = Join-Path $LogDir "qwen-harness-$label-$runAlias-policy.json"
    $modelSnapshot = Join-Path $LogDir "qwen-harness-$label-$runAlias-model.json"
    Copy-Item -LiteralPath $policyForModel -Destination $policySnapshot -Force
    Set-Content -LiteralPath $modelSnapshot -Value (($m | ConvertTo-Json -Depth 32)) -Encoding utf8

    $ctxSize = Get-ModelValue -Model $m -Key "CtxSize" -Default "262144"
    $temp = Get-ModelValue -Model $m -Key "Temp" -Default "0.85"
    $topP = Get-ModelValue -Model $m -Key "TopP" -Default "0.95"
    $topK = Get-ModelValue -Model $m -Key "TopK" -Default "20"
    $minP = Get-ModelValue -Model $m -Key "MinP" -Default "0.0"
    $repeatPenalty = Get-ModelValue -Model $m -Key "RepeatPenalty" -Default "1.0"
    $imageMinTokens = Get-ModelValue -Model $m -Key "ImageMinTokens" -Default "1024"
    $flashAttn = Get-FlashAttnValue -Model $m
    $cacheTypes = Get-CacheTypeValues -Model $m

    $runModel = @{} + $m
    if ($SpecDraftNMaxOverride -gt 0) { $runModel["SpecDraftNMax"] = $SpecDraftNMaxOverride }

    $serverArgs = @(
        "--model", $runModel.Model,
        "--alias", $runAlias,
        "--host", "127.0.0.1",
        "--port", "$BackendPort",
        "--ctx-size", $ctxSize,
        "-np", "1",
        "-ngl", "99",
        "--flash-attn", $flashAttn,
        "--cache-type-k", $cacheTypes.K,
        "--cache-type-v", $cacheTypes.V,
        "--temp", $temp,
        "--top-p", $topP,
        "--top-k", $topK,
        "--min-p", $minP,
        "--presence-penalty", "0.0",
        "--repeat-penalty", $repeatPenalty,
        "--seed", "3407",
        "-n", "32768"
    )
    if ($runModel.ContainsKey("Mmproj") -and $runModel.Mmproj) { $serverArgs += @("--mmproj", $runModel.Mmproj) }
    if (-not ($runModel.ContainsKey("OmitImageMinTokens") -and $runModel.OmitImageMinTokens)) {
        $serverArgs += @("--image-min-tokens", $imageMinTokens)
    }
    $serverArgs = Add-SpeculativeServerArgs -Model $runModel -ServerArgs $serverArgs
    $serverArgs = Add-ReasoningServerArgs -ServerArgs $serverArgs -Reasoning $Reasoning -ModelName ([string]$runModel.Name)
    if ($runModel.ContainsKey("ExtraServerArgs") -and $null -ne $runModel.ExtraServerArgs) {
        $serverArgs += $runModel.ExtraServerArgs
    }
    for ($argIndex = 0; $argIndex -lt $serverArgs.Count; $argIndex++) {
        if (-not ($serverArgs[$argIndex] -is [string])) {
            Write-Host "Non-string server arg[$argIndex]: $($serverArgs[$argIndex].GetType().FullName) = $($serverArgs[$argIndex])"
        }
    }

    $adapterEnv = @{
        ADAPTER_HOST = "127.0.0.1"
        ADAPTER_PORT = "$AdapterPort"
        ADAPTER_PORTS = "$AdapterPort"
        LLAMA_UPSTREAM = "http://127.0.0.1:$BackendPort"
        UPSTREAM_KIND = "llama.cpp"
        MODEL_ALIAS = $runAlias
        PUBLIC_MODEL_ALIASES = Get-PublicAliases -Model $m -RunAlias $runAlias
        DEFAULT_TEMPERATURE = $temp
        DEFAULT_TOP_P = $topP
        DEFAULT_TOP_K = $topK
        DEFAULT_MIN_P = $minP
        DEFAULT_PRESENCE_PENALTY = "0.0"
        DEFAULT_REPEAT_PENALTY = $repeatPenalty
        DEFAULT_MAX_TOKENS = "16384"
        HARNESS_POLICY = $policyForModel
        HARNESS_MODULE = $HarnessModule
        HARNESS_LOG_JSONL = $adapterJsonl
    }

    $serverProcess = $null
    $adapterProcess = $null
    $summaryBase = [ordered]@{
        timestamp = (Get-Date).ToString("o")
        iteration_label = $label
        model_name = [string]$m.Name
        run_alias = $runAlias
        suites = $Suites
        reasoning = $Reasoning
        policy_path = $policyForModel
        policy_snapshot = $policySnapshot
        model_config_path = $ModelsJson
        model_snapshot = $modelSnapshot
        server = $Server
        server_args = $serverArgs
        adapter_jsonl = $adapterJsonl
        server_stdout = $serverOut
        server_stderr = $serverErr
        adapter_stdout = $adapterOut
        adapter_stderr = $adapterErr
        benchloop_stdout = $benchOut
        benchloop_stderr = $benchErr
    }
    try {
        $serverProcess = Start-LoggedProcess -FilePath $Server -ArgumentList $serverArgs -WorkingDirectory $Root -StdOutLog $serverOut -StdErrLog $serverErr
        Write-Host "Started llama-server PID $($serverProcess.Id) on :$BackendPort"
        Wait-Health -Url "http://127.0.0.1:$BackendPort/health" -Label "llama-server"

        $adapterProcess = Start-LoggedProcess -FilePath $Node -ArgumentList @($Adapter) -WorkingDirectory $RepoRoot -StdOutLog $adapterOut -StdErrLog $adapterErr -Environment $adapterEnv
        Write-Host "Started lan-adapter+harness PID $($adapterProcess.Id) on :$AdapterPort"
        Wait-Health -Url "http://127.0.0.1:$AdapterPort/health" -Label "lan-adapter harness"

        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$AdapterPort/health" -TimeoutSec 5
        if (-not $health.harness) { throw "Harness not active on adapter health response" }

        $env:BENCHLOOP_TEMPERATURE = $temp
        $env:BENCHLOOP_TOP_P = $topP
        $env:BENCHLOOP_TOP_K = $topK
        $env:BENCHLOOP_MIN_P = $minP
        $env:BENCHLOOP_PRESENCE_PENALTY = "0.0"
        $env:BENCHLOOP_REPETITION_PENALTY = $repeatPenalty
        $env:BENCHLOOP_FREQUENCY_PENALTY = "0.0"

        $benchArgs = @(
            "run",
            "--model", $runAlias,
            "--endpoint", "http://127.0.0.1:$AdapterPort",
            "--provider", "openai_compat",
            "--suites", $Suites,
            "--harness", "raw"
        )
        Write-Host "Running BenchLoop via lan-adapter harness: $Suites"
        $benchProcess = Start-LoggedProcess -FilePath $BenchLoop -ArgumentList $benchArgs -WorkingDirectory $Root -StdOutLog $benchOut -StdErrLog $benchErr
        $benchProcess.WaitForExit()
        if ($benchProcess.ExitCode -ne 0) {
            throw "BenchLoop failed with exit code $($benchProcess.ExitCode). See $benchErr"
        }
        $runJsonCopy = Copy-BenchLoopRunJson -BenchOut $benchOut -LogDir $LogDir -Label $label -RunAlias $runAlias
        $metrics = Get-BenchLoopMetrics -RunJsonPath $runJsonCopy
        $summary = Copy-OrderedDictionary -Source $summaryBase
        $summary["status"] = "ok"
        $summary["benchloop_run_json"] = $runJsonCopy
        $summary["metrics"] = $metrics
        Write-HarnessRunSummary -LogDir $LogDir -Label $label -RunAlias $runAlias -Summary $summary
        Write-Host "BenchLoop finished for $($m.Name)"
    } catch {
        $summary = Copy-OrderedDictionary -Source $summaryBase
        $summary["status"] = "failed"
        $summary["error"] = $_.Exception.Message
        Write-HarnessRunSummary -LogDir $LogDir -Label $label -RunAlias $runAlias -Summary $summary
        throw
    } finally {
        Stop-ProcessSafe -Process $adapterProcess
        Stop-ProcessSafe -Process $serverProcess
        Start-Sleep -Seconds 5
    }
}

Write-Host "Qwen harness BenchLoop run complete."
exit 0
