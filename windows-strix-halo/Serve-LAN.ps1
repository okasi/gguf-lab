param(
    [ValidateSet("Start", "Stop", "List")]
    [string]$Action = "Start",

    [string]$Model = "",
    [string]$LanModelsJson = "",
    [string]$ReadmeModelsJson = "",

    [int]$Port = 8080,
    [int]$AltPort = 13305,
    [int]$BackendPort = 18081,
    [int]$AsrBackendPort = 52625,
    [int]$MaxTokens = 32768,
    [int]$Parallel = 1,

    [switch]$DisableAsr,
    [switch]$DisableMtp
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$RepoRoot = Split-Path $Root -Parent
$LogDir = Join-Path $Root "logs"
$DefaultServer = Join-Path $Root "tools\llama-b9535-bin-win-vulkan-x64\llama-server.exe"
$Adapter = Join-Path $RepoRoot "lan-adapter.js"
$Watchdog = Join-Path $Root "Watch-LAN-Parent.ps1"

function ConvertTo-PlainHashtable {
    param($Value)

    if ($null -eq $Value) { return $null }
    if ($Value -is [System.Collections.IDictionary]) {
        $hash = @{}
        foreach ($key in $Value.Keys) {
            $hash[$key] = ConvertTo-PlainHashtable -Value $Value[$key]
        }
        return $hash
    }
    if ($Value -is [array]) {
        return @($Value | ForEach-Object { ConvertTo-PlainHashtable -Value $_ })
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

function Get-ModelValue {
    param($ModelConfig, [string]$Key, [string]$Default)

    if ($ModelConfig.ContainsKey($Key) -and $null -ne $ModelConfig[$Key] -and "$($ModelConfig[$Key])" -ne "") {
        return "$($ModelConfig[$Key])"
    }
    return $Default
}

function Get-LanSlug {
    param([string]$Key)
    return ($Key.ToLower() -replace '[^a-z0-9]+', '-').Trim('-')
}

function Load-JsonModels {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Models manifest not found: $Path"
    }
    $items = @()
    foreach ($parsed in (Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json)) {
        $items += ConvertTo-PlainHashtable -Value $parsed
    }
    return $items
}

function Resolve-LanModelConfig {
    param(
        [string]$ModelKey,
        [string]$LanManifestPath,
        [string]$ReadmeManifestPath
    )

    $lanModels = Load-JsonModels -Path $LanManifestPath
    $lanEntry = $lanModels | Where-Object { $_.Key -eq $ModelKey } | Select-Object -First 1
    if (-not $lanEntry) {
        $known = ($lanModels | ForEach-Object { $_.Key }) -join ", "
        throw "Unknown LAN model '$ModelKey'. Known models: $known"
    }

    $config = @{}
    if ($lanEntry.ContainsKey("ChadrockModelsJson") -and $lanEntry.ChadrockModelsJson) {
        $chadrockPath = if ([System.IO.Path]::IsPathRooted($lanEntry.ChadrockModelsJson)) {
            $lanEntry.ChadrockModelsJson
        } else {
            Join-Path $Root $lanEntry.ChadrockModelsJson
        }
        $chadrock = (Load-JsonModels -Path $chadrockPath | Select-Object -First 1)
        if (-not $chadrock) { throw "Chadrock manifest is empty: $chadrockPath" }
        foreach ($key in $chadrock.Keys) { $config[$key] = $chadrock[$key] }
        $readmeModels = Load-JsonModels -Path $ReadmeManifestPath
        $readmeEntry = $readmeModels | Where-Object { $_.Name -eq "jcbtc-CHADROCK3.6-35B-UNCENSORED-MTP-STRIX-LEAN" } | Select-Object -First 1
        if ($readmeEntry -and $readmeEntry.Server) {
            $config["Server"] = $readmeEntry.Server
        }
    } else {
        $readmeModels = Load-JsonModels -Path $ReadmeManifestPath
        $readmeEntry = $readmeModels | Where-Object { $_.Name -eq $lanEntry.ReadmeName } | Select-Object -First 1
        if (-not $readmeEntry) {
            throw "Readme model '$($lanEntry.ReadmeName)' not found in $ReadmeManifestPath"
        }
        foreach ($key in $readmeEntry.Keys) { $config[$key] = $readmeEntry[$key] }
    }

    $config["LanKey"] = $lanEntry.Key
    $config["LanAlias"] = $lanEntry.LanAlias
    $config["PublicAliases"] = @($lanEntry.PublicAliases | Where-Object { $_ })
    if ($config.ContainsKey("Server") -and $config.Server -and -not [System.IO.Path]::IsPathRooted([string]$config.Server)) {
        $config["Server"] = Join-Path $Root ([string]$config.Server)
    }
    return $config
}

function Build-LlamaArgs {
    param(
        $ModelConfig,
        [int]$BackendPort,
        [int]$MaxTokens,
        [int]$Parallel,
        [switch]$DisableMtp
    )

    $alias = $ModelConfig.LanAlias
    if ($ModelConfig.ContainsKey("RawServerArgs") -and $null -ne $ModelConfig.RawServerArgs) {
        $args = @($ModelConfig.RawServerArgs | ForEach-Object {
            $arg = "$_"
            $arg.Replace("{PORT}", "$BackendPort")
        })
        for ($i = 0; $i -lt ($args.Count - 1); $i++) {
            if ($args[$i] -eq "--alias") {
                $args[$i + 1] = $alias
                break
            }
        }
        return $args
    }

    $ctxSize = Get-ModelValue -ModelConfig $ModelConfig -Key "CtxSize" -Default "262144"
    $temp = Get-ModelValue -ModelConfig $ModelConfig -Key "Temp" -Default "0.75"
    $topP = Get-ModelValue -ModelConfig $ModelConfig -Key "TopP" -Default "0.95"
    $topK = Get-ModelValue -ModelConfig $ModelConfig -Key "TopK" -Default "20"
    $minP = Get-ModelValue -ModelConfig $ModelConfig -Key "MinP" -Default "0.0"
    $repeatPenalty = Get-ModelValue -ModelConfig $ModelConfig -Key "RepeatPenalty" -Default "1.0"
    $imageMinTokens = Get-ModelValue -ModelConfig $ModelConfig -Key "ImageMinTokens" -Default "256"

    $args = @(
        "--model", $ModelConfig.Model,
        "--alias", $alias,
        "--host", "127.0.0.1",
        "--port", "$BackendPort",
        "--ctx-size", $ctxSize,
        "-np", "$Parallel",
        "-ngl", "99",
        "--flash-attn", "on",
        "--cache-type-k", "q8_0",
        "--cache-type-v", "q8_0",
        "--temp", $temp,
        "--top-p", $topP,
        "--top-k", $topK,
        "--min-p", $minP,
        "--presence-penalty", "0.0",
        "--repeat-penalty", $repeatPenalty,
        "--seed", "3407",
        "-n", "$MaxTokens"
    )

    if (-not ($ModelConfig.ContainsKey("OmitImageMinTokens") -and $ModelConfig.OmitImageMinTokens)) {
        $args += @("--image-min-tokens", $imageMinTokens)
    }
    if ($ModelConfig.ContainsKey("Mmproj") -and $null -ne $ModelConfig.Mmproj -and "$($ModelConfig.Mmproj)" -ne "") {
        $args += @("--mmproj", $ModelConfig.Mmproj)
    }
    if ($ModelConfig.ContainsKey("Mtp") -and $ModelConfig.Mtp) {
        if ($DisableMtp) {
            $args += @("--spec-type", "none")
        } else {
            $args += @("--spec-type", "draft-mtp", "--spec-draft-n-min", "1", "--spec-draft-n-max", "2")
        }
    }
    if ($ModelConfig.ContainsKey("GptOss") -and $ModelConfig.GptOss) {
        $args += @("--reasoning", "auto", "--jinja")
    }
    if ($ModelConfig.ContainsKey("ExtraServerArgs") -and $null -ne $ModelConfig.ExtraServerArgs) {
        $args += $ModelConfig.ExtraServerArgs
    }
    return $args
}

if (-not $LanModelsJson) { $LanModelsJson = Join-Path $RepoRoot "lan-models.json" }
if (-not $ReadmeModelsJson) { $ReadmeModelsJson = Join-Path $Root "readme-models.json" }

if ($Action -eq "List") {
    $lanModels = Load-JsonModels -Path $LanModelsJson
    Write-Host "LAN models:"
    foreach ($entry in $lanModels) {
        Write-Host "  $($entry.Key) -> $($entry.LanAlias)"
    }
    return
}

if ($Action -eq "Stop") {
    $ErrorActionPreference = "Continue"
    $targets = @($Port, $AltPort, $BackendPort)
    if (-not $DisableAsr) { $targets += $AsrBackendPort }

    foreach ($TargetPort in $targets) {
        $Listeners = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue
        if (-not $Listeners) {
            Write-Host "No listener found on port $TargetPort."
            continue
        }
        foreach ($ProcessId in ($Listeners | Select-Object -ExpandProperty OwningProcess -Unique)) {
            $Process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
            if ($Process) {
                Write-Host "Stopping $($Process.ProcessName) PID $ProcessId on port $TargetPort..."
                Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
            }
        }
    }

    Get-ChildItem -LiteralPath $LogDir -Filter "lan-*-launcher.pid" -ErrorAction SilentlyContinue | ForEach-Object {
        $LauncherPid = Get-Content $_.FullName -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($LauncherPid) {
            $Launcher = Get-Process -Id $LauncherPid -ErrorAction SilentlyContinue
            if ($Launcher) {
                Write-Host "Stopping launcher PowerShell PID $LauncherPid..."
                Stop-Process -Id $LauncherPid -Force -ErrorAction SilentlyContinue
            }
        }
        Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
    }
    return
}

if ([string]::IsNullOrWhiteSpace($Model)) {
    throw "Start requires -Model. Run .\Serve-LAN.ps1 -Action List to see keys."
}

$modelConfig = Resolve-LanModelConfig -ModelKey $Model -LanManifestPath $LanModelsJson -ReadmeManifestPath $ReadmeModelsJson
$slug = Get-LanSlug -Key $Model
$PidFile = Join-Path $LogDir "lan-$slug-launcher.pid"
$serverPath = if ($modelConfig.ContainsKey("Server") -and -not [string]::IsNullOrWhiteSpace($modelConfig.Server)) {
    $modelConfig.Server
} else {
    $DefaultServer
}

$FlmRoot = Join-Path $Root "tools\fastflowlm_0.9.42_windows_amd64"
$Flm = Get-ChildItem -LiteralPath $FlmRoot -Recurse -Filter flm.exe -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName
$BundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if (Test-Path $BundledNode) {
    $Node = $BundledNode
} else {
    $Node = (Get-Command node -ErrorAction Stop).Source
}

$required = @($serverPath, $modelConfig.Model, $Adapter, $Node)
if ($modelConfig.ContainsKey("Mmproj") -and $modelConfig.Mmproj) { $required += $modelConfig.Mmproj }
if (-not $DisableAsr) { $required += $Flm }
foreach ($Path in $required) {
    if (-not (Test-Path $Path)) {
        throw "Required file not found: $Path"
    }
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

foreach ($FirewallPort in @($Port, $AltPort)) {
    try {
        $ruleName = "LAN $Model $FirewallPort"
        $rule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
        if (-not $rule) {
            New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $FirewallPort -Profile Any | Out-Null
        }
    } catch {
        Write-Warning "Could not verify or create the Windows Firewall rule for TCP $FirewallPort."
    }
}

$portTargets = @($Port, $AltPort, $BackendPort)
if (-not $DisableAsr) { $portTargets += $AsrBackendPort }
foreach ($TargetPort in $portTargets) {
    if (Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue) {
        throw "Port $TargetPort is already in use. Run .\Serve-LAN.ps1 -Action Stop or choose another port."
    }
}

$LlamaArgs = Build-LlamaArgs -ModelConfig $modelConfig -BackendPort $BackendPort -MaxTokens $MaxTokens -Parallel $Parallel -DisableMtp:$DisableMtp
$Out = Join-Path $LogDir "lan-$slug-llama.out.log"
$Err = Join-Path $LogDir "lan-$slug-llama.err.log"
$AsrOut = Join-Path $LogDir "lan-$slug-whisper-asr.out.log"
$AsrErr = Join-Path $LogDir "lan-$slug-whisper-asr.err.log"
$AdapterOut = Join-Path $LogDir "lan-$slug-adapter.out.log"
$AdapterErr = Join-Path $LogDir "lan-$slug-adapter.err.log"
$WatchdogLog = Join-Path $LogDir "lan-$slug-watchdog.log"
[IO.File]::WriteAllText($PidFile, "$PID")

foreach ($LogPath in @($Out, $Err, $AdapterOut, $AdapterErr, $WatchdogLog)) {
    Set-Content -LiteralPath $LogPath -Value "" -Encoding utf8
}
if (-not $DisableAsr) {
    foreach ($LogPath in @($AsrOut, $AsrErr)) {
        Set-Content -LiteralPath $LogPath -Value "" -Encoding utf8
    }
}

Remove-Item Env:LLAMA_CHAT_TEMPLATE_KWARGS -ErrorAction SilentlyContinue
$llama = Start-Process -FilePath $serverPath -ArgumentList $LlamaArgs -WorkingDirectory $Root -RedirectStandardOutput $Out -RedirectStandardError $Err -WindowStyle Hidden -PassThru

$asrProcess = $null
if (-not $DisableAsr) {
    $AsrArgs = @("serve", "--asr", "1", "--host", "127.0.0.1", "--port", "$AsrBackendPort", "--pmode", "performance")
    $asrProcess = Start-Process -FilePath $Flm -ArgumentList $AsrArgs -WorkingDirectory $Root -RedirectStandardOutput $AsrOut -RedirectStandardError $AsrErr -WindowStyle Hidden -PassThru
}

$watchdogProcess = $null
$adapterProcess = $null
$tailJobs = @()

function Start-LogTail {
    param([string]$Path, [string]$Prefix)
    Start-Job -ScriptBlock {
        param($TailPath, $TailPrefix)
        while (-not (Test-Path -LiteralPath $TailPath)) { Start-Sleep -Milliseconds 200 }
        Get-Content -LiteralPath $TailPath -Wait | ForEach-Object {
            if ($_ -ne "") { "[$TailPrefix] $_" }
        }
    } -ArgumentList $Path, $Prefix
}

function Receive-LogTail {
    param([object[]]$Jobs)
    foreach ($job in $Jobs) {
        Receive-Job -Job $job -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
    }
}

try {
    $title = "$($modelConfig.LanKey) LAN"
    if (-not $DisableAsr) { $title += " + Whisper ASR" }
    $Host.UI.RawUI.WindowTitle = $title

    Write-Host "Starting $($modelConfig.LanKey) backend PID $($llama.Id) on 127.0.0.1:$BackendPort..."
    if ($asrProcess) {
        Write-Host "Starting FastFlowLM Whisper ASR PID $($asrProcess.Id) on 127.0.0.1:$AsrBackendPort..."
    }
    Write-Host "Live logs:"
    Write-Host ""

    $tailJobs += Start-LogTail -Path $Out -Prefix "llama-out"
    $tailJobs += Start-LogTail -Path $Err -Prefix "llama"
    if ($asrProcess) {
        $tailJobs += Start-LogTail -Path $AsrOut -Prefix "whisper"
        $tailJobs += Start-LogTail -Path $AsrErr -Prefix "whisper-err"
    }

    if (Test-Path $Watchdog) {
        $childCsv = if ($asrProcess) { "$($llama.Id),$($asrProcess.Id)" } else { "$($llama.Id)" }
        $portCsv = if ($asrProcess) { "$Port,$AltPort,$BackendPort,$AsrBackendPort" } else { "$Port,$AltPort,$BackendPort" }
        $watchdogArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$Watchdog`" -ParentPid $PID -ChildPidCsv `"$childCsv`" -PortCsv `"$portCsv`" -PidFile `"$PidFile`" -LogPath `"$WatchdogLog`""
        $watchdogProcess = Start-Process -FilePath "powershell.exe" -ArgumentList $watchdogArgs -WindowStyle Hidden -PassThru
    }

    $healthy = $false
    $asrHealthy = $DisableAsr
    for ($i = 0; $i -lt 180; $i++) {
        Start-Sleep -Seconds 2
        Receive-LogTail -Jobs $tailJobs
        if ($llama.HasExited) {
            Write-Host "Backend exited during startup. Last stderr:"
            Get-Content $Err -Tail 100
            throw "llama.cpp backend exited with code $($llama.ExitCode)"
        }
        if ($asrProcess -and $asrProcess.HasExited) {
            Write-Host "Whisper ASR exited during startup. Last stderr:"
            Get-Content $AsrErr -Tail 100
            throw "FastFlowLM Whisper ASR exited with code $($asrProcess.ExitCode)"
        }
        try {
            $models = Invoke-RestMethod -Uri "http://127.0.0.1:$BackendPort/v1/models" -TimeoutSec 2
            if ($models.data.id -contains $modelConfig.LanAlias) { $healthy = $true }
        } catch {
            if ($i % 10 -eq 0) { Write-Host "Still loading model..." }
        }
        if (-not $asrHealthy -and $asrProcess) {
            try {
                Invoke-WebRequest -Uri "http://127.0.0.1:$AsrBackendPort/v1/models" -UseBasicParsing -TimeoutSec 2 | Out-Null
                $asrHealthy = $true
            } catch {
                if ($i % 10 -eq 0) { Write-Host "Still loading Whisper ASR..." }
            }
        }
        if ($healthy -and $asrHealthy) { break }
    }

    if (-not $healthy) {
        Write-Host "Backend did not become healthy. Last stderr:"
        Get-Content $Err -Tail 100
        throw "llama.cpp backend failed to start"
    }
    if (-not $asrHealthy) {
        Write-Host "Whisper ASR did not become healthy. Last stderr:"
        Get-Content $AsrErr -Tail 100
        throw "FastFlowLM Whisper ASR failed to start"
    }

    $defaultIfIndexes = Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue |
        Sort-Object RouteMetric |
        Select-Object -ExpandProperty ifIndex -Unique
    $ips = foreach ($ifIndex in $defaultIfIndexes) {
        Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $ifIndex -ErrorAction SilentlyContinue |
            Where-Object { $_.IPAddress -notlike "127.*" -and $_.AddressState -eq "Preferred" } |
            Select-Object -ExpandProperty IPAddress
    }
    $ips = @($ips | Select-Object -Unique)

    Write-Host ""
    Write-Host "$($modelConfig.LanKey) is available:"
    Write-Host "  http://127.0.0.1:$Port/v1"
    Write-Host "  http://127.0.0.1:$AltPort/v1"
    foreach ($ip in $ips) {
        Write-Host "  http://$ip`:$Port/v1"
        Write-Host "  http://$ip`:$AltPort/v1"
    }
    Write-Host ""
    Write-Host "Model alias: $($modelConfig.LanAlias)"
    if ($modelConfig.PublicAliases.Count -gt 0) {
        Write-Host "Public aliases: $($modelConfig.PublicAliases -join ', ')"
    }
    if ($asrProcess) {
        Write-Host "ASR model: whisper-v3:turbo via FastFlowLM NPU"
    }
    Write-Host "Close this window or press Ctrl+C to stop the adapter and backend."
    Write-Host ""

    $publicAliases = @($modelConfig.PublicAliases + $modelConfig.LanAlias + $modelConfig.LanKey) | Select-Object -Unique
    $env:ADAPTER_HOST = "0.0.0.0"
    $env:ADAPTER_PORT = "$Port"
    $env:ADAPTER_PORTS = "$Port,$AltPort"
    $env:LLAMA_UPSTREAM = "http://127.0.0.1:$BackendPort"
    $env:UPSTREAM_KIND = "llama.cpp"
    $env:MODEL_ALIAS = $modelConfig.LanAlias
    $env:PUBLIC_MODEL_ALIASES = ($publicAliases -join ",")
    $env:DEFAULT_TEMPERATURE = (Get-ModelValue -ModelConfig $modelConfig -Key "Temp" -Default "0.75")
    $env:DEFAULT_TOP_P = (Get-ModelValue -ModelConfig $modelConfig -Key "TopP" -Default "0.95")
    $env:DEFAULT_TOP_K = (Get-ModelValue -ModelConfig $modelConfig -Key "TopK" -Default "20")
    $env:DEFAULT_MIN_P = (Get-ModelValue -ModelConfig $modelConfig -Key "MinP" -Default "0.0")
    $env:DEFAULT_PRESENCE_PENALTY = "0.0"
    $env:DEFAULT_REPEAT_PENALTY = (Get-ModelValue -ModelConfig $modelConfig -Key "RepeatPenalty" -Default "1.0")
    $env:DEFAULT_MAX_TOKENS = "16384"
    if ($asrProcess) {
        $env:AUDIO_UPSTREAM = "http://127.0.0.1:$AsrBackendPort"
        $env:AUDIO_MODEL_ALIAS = "whisper-v3:turbo"
        $env:AUDIO_MODEL_ALIASES = "whisper-v3:turbo,whisper-v3,whisper-1"
    } else {
        Remove-Item Env:AUDIO_UPSTREAM -ErrorAction SilentlyContinue
        Remove-Item Env:AUDIO_MODEL_ALIAS -ErrorAction SilentlyContinue
        Remove-Item Env:AUDIO_MODEL_ALIASES -ErrorAction SilentlyContinue
    }

    $adapterProcess = Start-Process -FilePath $Node -ArgumentList @($Adapter) -WorkingDirectory $RepoRoot -RedirectStandardOutput $AdapterOut -RedirectStandardError $AdapterErr -WindowStyle Hidden -PassThru
    Write-Host "Adapter PID $($adapterProcess.Id) listening on 0.0.0.0:$Port and 0.0.0.0:$AltPort"
    Write-Host ""

    $tailJobs += Start-LogTail -Path $AdapterOut -Prefix "adapter"
    $tailJobs += Start-LogTail -Path $AdapterErr -Prefix "adapter-err"

    while ($adapterProcess -and -not $adapterProcess.HasExited) {
        Receive-LogTail -Jobs $tailJobs
        Start-Sleep -Milliseconds 500
    }

    Receive-LogTail -Jobs $tailJobs
    if ($adapterProcess -and $adapterProcess.ExitCode -ne 0) {
        throw "LAN adapter exited with code $($adapterProcess.ExitCode)."
    }
} finally {
    foreach ($job in $tailJobs) {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    }
    if ($adapterProcess -and -not $adapterProcess.HasExited) {
        Stop-Process -Id $adapterProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($llama -and -not $llama.HasExited) {
        Stop-Process -Id $llama.Id -Force -ErrorAction SilentlyContinue
    }
    if ($asrProcess -and -not $asrProcess.HasExited) {
        Stop-Process -Id $asrProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($watchdogProcess -and -not $watchdogProcess.HasExited) {
        Stop-Process -Id $watchdogProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}
