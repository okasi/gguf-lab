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
    [switch]$DisableMtp,

    [ValidateSet("auto", "off")]
    [string]$Reasoning = "auto"
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
. (Join-Path $Root "ModelDraft.ps1")
$RepoRoot = Split-Path $Root -Parent
$LogDir = Join-Path $Root "logs"
$DefaultServer = Join-Path $Root "tools\llama-b9551-bin-win-vulkan-x64\llama-server.exe"
if (-not (Test-Path -LiteralPath $DefaultServer)) {
    $DefaultServer = Join-Path $Root "tools\llama-b9535-bin-win-vulkan-x64\llama-server.exe"
}
$Adapter = Join-Path $RepoRoot "lan-adapter.js"
$Watchdog = Join-Path $Root "Watch-LAN-Parent.ps1"

function ConvertTo-PlainHashtable {
    param($Value)

    if ($null -eq $Value) { return $null }
    if ($Value -is [string] -or $Value -is [char] -or $Value.GetType().IsPrimitive -or $Value -is [decimal]) {
        return $Value
    }
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

function Test-LanModelAlias {
    param([string]$Alias)

    if ([string]::IsNullOrWhiteSpace($Alias)) { return $false }
    $trimmed = $Alias.Trim()
    if ($trimmed -match '[,\r\n]') { return $false }
    if ($trimmed -eq "[object Object]") { return $false }
    if ($trimmed -match '^System\.(Collections\.|Object(\[\])?$)') { return $false }
    return $true
}

function ConvertTo-LanAliasStrings {
    param($Value)

    $aliases = @()
    if ($null -eq $Value) { return $aliases }
    if ($Value -is [string]) {
        $alias = $Value.Trim()
        if (Test-LanModelAlias -Alias $alias) { $aliases += $alias }
        return $aliases
    }
    if ($Value -is [System.Collections.IDictionary] -or $Value -is [pscustomobject]) {
        return $aliases
    }
    if ($Value -is [System.Collections.IEnumerable]) {
        foreach ($item in $Value) {
            $aliases += ConvertTo-LanAliasStrings -Value $item
        }
        return $aliases
    }

    $alias = ([string]$Value).Trim()
    if (Test-LanModelAlias -Alias $alias) { $aliases += $alias }
    return $aliases
}

function Get-LanPublicAliases {
    param($ModelConfig)

    if ($env:LAN_PUBLIC_MODEL_ALIASES) {
        return @(ConvertTo-LanAliasStrings -Value ($env:LAN_PUBLIC_MODEL_ALIASES -split ",") | Select-Object -Unique)
    }

    $aliases = @()
    foreach ($value in @($ModelConfig["PublicAliases"], $ModelConfig["LanAlias"], $ModelConfig["LanKey"])) {
        $aliases += ConvertTo-LanAliasStrings -Value $value
    }
    return @($aliases | Select-Object -Unique)
}

function Set-ReasoningServerArgs {
    param(
        [object[]]$ServerArgs,
        [ValidateSet("auto", "off")]
        [string]$Reasoning = "auto",
        [string]$ModelName = ""
    )

    $filtered = @()
    $skipNext = $false
    foreach ($arg in $ServerArgs) {
        if ($skipNext) {
            $skipNext = $false
            continue
        }
        if ([string]$arg -eq "--reasoning") {
            $skipNext = $true
            continue
        }
        $filtered += $arg
    }

    $filtered += @("--reasoning", $Reasoning)
    return $filtered
}

function Initialize-LanConsoleCleanup {
    param([string]$LogPath)

    if (-not ("LanConsoleCleanup" -as [type])) {
        Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;

public static class LanConsoleCleanup
{
    private delegate bool HandlerRoutine(uint ctrlType);
    private static readonly HandlerRoutine Handler = new HandlerRoutine(Handle);
    private static readonly object Gate = new object();
    private static int[] Pids = new int[0];
    private static string LogPath = "";
    private static bool Installed = false;

    [DllImport("kernel32.dll")]
    private static extern bool SetConsoleCtrlHandler(HandlerRoutine handler, bool add);

    public static void Install(string logPath)
    {
        LogPath = logPath ?? "";
        if (!Installed)
        {
            SetConsoleCtrlHandler(Handler, true);
            Installed = true;
        }
    }

    public static void SetTargets(int[] targetPids)
    {
        List<int> filtered = new List<int>();
        HashSet<int> seen = new HashSet<int>();
        if (targetPids != null)
        {
            foreach (int pid in targetPids)
            {
                if (pid > 0 && seen.Add(pid))
                {
                    filtered.Add(pid);
                }
            }
        }

        lock (Gate)
        {
            Pids = filtered.ToArray();
        }
    }

    public static void ClearTargets()
    {
        SetTargets(new int[0]);
    }

    private static bool Handle(uint ctrlType)
    {
        if (ctrlType == 0 || ctrlType == 1 || ctrlType == 2 || ctrlType == 5 || ctrlType == 6)
        {
            Cleanup("console-control-" + ctrlType.ToString());
        }

        return false;
    }

    public static void Cleanup(string reason)
    {
        int[] localPids;
        lock (Gate)
        {
            localPids = (int[])Pids.Clone();
        }

        Log("cleanup " + reason + " pids=" + String.Join(",", Array.ConvertAll(localPids, pid => pid.ToString())));
        foreach (int pid in localPids)
        {
            try
            {
                if (pid == Process.GetCurrentProcess().Id)
                {
                    continue;
                }

                using (Process process = Process.GetProcessById(pid))
                {
                    if (!process.HasExited)
                    {
                        Log("killing pid=" + pid.ToString() + " name=" + process.ProcessName);
                        process.Kill();
                    }
                }
            }
            catch (Exception ex)
            {
                Log("kill failed pid=" + pid.ToString() + " " + ex.GetType().Name + ": " + ex.Message);
            }
        }
    }

    private static void Log(string message)
    {
        if (String.IsNullOrEmpty(LogPath))
        {
            return;
        }

        try
        {
            File.AppendAllText(LogPath, DateTime.Now.ToString("s") + " " + message + Environment.NewLine);
        }
        catch
        {
        }
    }
}
"@
    }

    [LanConsoleCleanup]::Install($LogPath)
}

function Set-LanConsoleCleanupTargets {
    param([object[]]$Processes)

    if (-not ("LanConsoleCleanup" -as [type])) { return }

    $targetPids = @()
    foreach ($Process in @($Processes)) {
        if (-not $Process) { continue }
        try {
            if (-not $Process.HasExited -and $Process.Id -gt 0) {
                $targetPids += [int]$Process.Id
            }
        } catch {
        }
    }

    [LanConsoleCleanup]::SetTargets([int[]]$targetPids)
}

function Test-LanFirewallPortAllowed {
    param([int]$Port)

    try {
        $rules = Get-NetFirewallRule -Direction Inbound -Enabled True -Action Allow -ErrorAction Stop
        foreach ($rule in $rules) {
            $filters = Get-NetFirewallPortFilter -AssociatedNetFirewallRule $rule -ErrorAction SilentlyContinue
            foreach ($filter in @($filters)) {
                $protocol = [string]$filter.Protocol
                if ($protocol -ne "TCP" -and $protocol -ne "Any") { continue }

                $localPort = [string]$filter.LocalPort
                if ($localPort -eq "Any" -or (Test-LanFirewallPortMatch -PortPattern $localPort -Port $Port)) {
                    return $true
                }
            }
        }
    } catch {
        return $false
    }

    return $false
}

function Test-LanFirewallPortMatch {
    param(
        [string]$PortPattern,
        [int]$Port
    )

    foreach ($part in ($PortPattern -split ",")) {
        $part = $part.Trim()
        if ($part -eq "$Port") { return $true }
        if ($part -match '^(\d+)-(\d+)$') {
            $start = [int]$Matches[1]
            $end = [int]$Matches[2]
            if ($Port -ge $start -and $Port -le $end) { return $true }
        }
    }

    return $false
}

function Ensure-LanFirewallPort {
    param(
        [int]$Port,
        [string]$Model
    )

    if (Test-LanFirewallPortAllowed -Port $Port) { return }

    $ruleName = "LAN $Model $Port"
    try {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port -Profile Any -ErrorAction Stop | Out-Null
    } catch {
        $adminCommand = "New-NetFirewallRule -DisplayName '$ruleName' -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port -Profile Any"
        Write-Warning "TCP $Port is not covered by an enabled inbound allow rule, and this launcher could not create one without administrator rights. Run PowerShell as Administrator: $adminCommand"
    }
}

function Get-ServerArgValue {
    param(
        [object[]]$ServerArgs,
        [string]$Name,
        [string]$Default = ""
    )

    for ($i = 0; $i -lt ($ServerArgs.Count - 1); $i++) {
        if ([string]$ServerArgs[$i] -eq $Name) {
            return [string]$ServerArgs[$i + 1]
        }
    }
    return $Default
}

function Test-ServerArgPresent {
    param(
        [object[]]$ServerArgs,
        [string]$Name
    )

    return @($ServerArgs | Where-Object { [string]$_ -eq $Name }).Count -gt 0
}

function ConvertTo-LanMetadataBool {
    param($Value)

    if ($null -eq $Value) { return $null }
    if ($Value -is [bool]) { return $Value }
    $text = "$Value".Trim().ToLowerInvariant()
    if ($text -in @("1", "true", "yes", "on")) { return $true }
    if ($text -in @("0", "false", "no", "off")) { return $false }
    return $null
}

function Get-LanModelMetadata {
    param(
        [hashtable]$ModelConfig,
        [object[]]$ServerArgs,
        [string]$ModelKey,
        [string]$ModelAlias,
        [string[]]$PublicAliases,
        [string]$ServerPath,
        [string]$Upstream,
        [string]$AdapterHost,
        [int[]]$AdapterPorts,
        [int]$BackendPort,
        [int]$AsrBackendPort,
        [bool]$AsrEnabled,
        [string]$Reasoning,
        [bool]$DisableMtp
    )

    $visionValue = if ($ModelConfig.ContainsKey("Vision")) { $ModelConfig.Vision } else { $false }
    $metadata = [ordered]@{
        id = $ModelAlias
        key = $ModelKey
        alias = $ModelAlias
        public_aliases = @($PublicAliases)
        name = if ($ModelConfig.ContainsKey("Name")) { [string]$ModelConfig.Name } else { "" }
        source = if ($ModelConfig.ContainsKey("Source")) { [string]$ModelConfig.Source } else { "" }
        file = if ($ModelConfig.ContainsKey("File")) { [string]$ModelConfig.File } else { Split-Path -Leaf ([string]$ModelConfig.Model) }
        path = [string]$ModelConfig.Model
        server = $ServerPath
        upstream = $Upstream
        backend = "llama.cpp"
        backend_port = $BackendPort
        adapter_host = $AdapterHost
        adapter_ports = @($AdapterPorts)
        context_size = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--ctx-size" -Default (Get-ModelValue -ModelConfig $ModelConfig -Key "CtxSize" -Default "")
        max_tokens = Get-ServerArgValue -ServerArgs $ServerArgs -Name "-n" -Default "$MaxTokens"
        sampler = [ordered]@{
            temperature = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--temp" -Default (Get-ModelValue -ModelConfig $ModelConfig -Key "Temp" -Default "")
            top_p = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--top-p" -Default (Get-ModelValue -ModelConfig $ModelConfig -Key "TopP" -Default "")
            top_k = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--top-k" -Default (Get-ModelValue -ModelConfig $ModelConfig -Key "TopK" -Default "")
            min_p = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--min-p" -Default (Get-ModelValue -ModelConfig $ModelConfig -Key "MinP" -Default "")
            presence_penalty = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--presence-penalty" -Default "0.0"
            repeat_penalty = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--repeat-penalty" -Default (Get-ModelValue -ModelConfig $ModelConfig -Key "RepeatPenalty" -Default "")
            seed = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--seed" -Default ""
        }
        reasoning = $Reasoning
        vision = ConvertTo-LanMetadataBool -Value $visionValue
        multimodal = Test-ServerArgPresent -ServerArgs $ServerArgs -Name "--mmproj"
        mmproj = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--mmproj" -Default ""
        image_min_tokens = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--image-min-tokens" -Default ""
        mtp = [ordered]@{
            enabled = (Test-ServerArgPresent -ServerArgs $ServerArgs -Name "--spec-type") -and ((Get-ServerArgValue -ServerArgs $ServerArgs -Name "--spec-type" -Default "") -ne "none")
            disabled_by_flag = $DisableMtp
            spec_type = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--spec-type" -Default ""
            draft_model = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--model-draft" -Default ""
            draft_n_min = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--spec-draft-n-min" -Default ""
            draft_n_max = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--spec-draft-n-max" -Default ""
        }
        cache = [ordered]@{
            type_k = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--cache-type-k" -Default ""
            type_v = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--cache-type-v" -Default ""
            flash_attention = Get-ServerArgValue -ServerArgs $ServerArgs -Name "--flash-attn" -Default ""
        }
        gpu_layers = Get-ServerArgValue -ServerArgs $ServerArgs -Name "-ngl" -Default ""
        parallel = Get-ServerArgValue -ServerArgs $ServerArgs -Name "-np" -Default "$Parallel"
        asr = [ordered]@{
            enabled = $AsrEnabled
            backend = if ($AsrEnabled) { "FastFlowLM" } else { "" }
            model = if ($AsrEnabled) { "whisper-v3:turbo" } else { "" }
            port = if ($AsrEnabled) { $AsrBackendPort } else { $null }
        }
    }

    if ($ModelConfig.ContainsKey("ReadmeFileLabel")) { $metadata["readme_file_label"] = [string]$ModelConfig.ReadmeFileLabel }
    if ($env:HARNESS_POLICY) {
        $harness = [ordered]@{
            enabled = $true
            policy = [string]$env:HARNESS_POLICY
            module = [string]$env:HARNESS_MODULE
            log_jsonl = [string]$env:HARNESS_LOG_JSONL
            mode = if ($env:HARNESS_MODEL_ALIASES) { "selected_models" } else { "all_models" }
            model_aliases = @(ConvertTo-LanAliasStrings -Value ($env:HARNESS_MODEL_ALIASES -split ","))
        }
        if (Test-Path -LiteralPath $env:HARNESS_POLICY) {
            try {
                $policy = Get-Content -LiteralPath $env:HARNESS_POLICY -Raw | ConvertFrom-Json
                if ($policy.name) { $harness["name"] = [string]$policy.name }
                if ($policy.version) { $harness["version"] = [string]$policy.version }
                $policySampler = [ordered]@{}
                foreach ($key in @("temperature", "top_p", "top_k", "min_p")) {
                    if ($null -ne $policy.$key) { $policySampler[$key] = $policy.$key }
                }
                if ($policySampler.Count -gt 0) { $harness["policy_sampler"] = $policySampler }
                $policyFlags = [ordered]@{}
                foreach ($key in @("strip_reasoning", "strip_markdown_fences", "repair_json", "parse_tagged_tool_calls", "parse_json_tool_calls", "parse_function_syntax", "parse_escaped_json", "normalize_tool_args", "dedupe_tool_calls", "retry_empty", "retry_malformed_json", "retry_malformed_python", "retry_malformed_javascript", "retry_missing_tool_call", "max_retries")) {
                    if ($null -ne $policy.$key) { $policyFlags[$key] = $policy.$key }
                }
                if ($policyFlags.Count -gt 0) { $harness["policy_flags"] = $policyFlags }
            } catch {
                $harness["policy_parse_error"] = $_.Exception.Message
            }
        }
        $metadata["harness"] = $harness
    }
    return $metadata
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

    $config["LanKey"] = [string]$lanEntry["Key"]
    $config["LanAlias"] = [string]$lanEntry["LanAlias"]
    $config["PublicAliases"] = @(ConvertTo-LanAliasStrings -Value $lanEntry["PublicAliases"])
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
        [ValidateSet("auto", "off")]
        [string]$Reasoning,
        [switch]$DisableMtp
    )

    $alias = [string]$ModelConfig["LanAlias"]
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
        return Set-ReasoningServerArgs -ServerArgs $args -Reasoning $Reasoning -ModelName ([string]$ModelConfig.Name)
    }

    $ctxSize = Get-ModelValue -ModelConfig $ModelConfig -Key "CtxSize" -Default "262144"
    $temp = Get-ModelValue -ModelConfig $ModelConfig -Key "Temp" -Default "0.75"
    $topP = Get-ModelValue -ModelConfig $ModelConfig -Key "TopP" -Default "0.95"
    $topK = Get-ModelValue -ModelConfig $ModelConfig -Key "TopK" -Default "20"
    $minP = Get-ModelValue -ModelConfig $ModelConfig -Key "MinP" -Default "0.0"
    $repeatPenalty = Get-ModelValue -ModelConfig $ModelConfig -Key "RepeatPenalty" -Default "1.0"
    $imageMinTokens = Get-ModelValue -ModelConfig $ModelConfig -Key "ImageMinTokens" -Default "256"
    $flashAttn = Get-FlashAttnValue -Model $ModelConfig
    $cacheTypes = Get-CacheTypeValues -Model $ModelConfig

    $args = @(
        "--model", $ModelConfig.Model,
        "--alias", $alias,
        "--host", "127.0.0.1",
        "--port", "$BackendPort",
        "--ctx-size", $ctxSize,
        "-np", "$Parallel",
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
        "-n", "$MaxTokens"
    )

    if (-not ($ModelConfig.ContainsKey("OmitImageMinTokens") -and $ModelConfig.OmitImageMinTokens)) {
        $args += @("--image-min-tokens", $imageMinTokens)
    }
    if ($ModelConfig.ContainsKey("Mmproj") -and $null -ne $ModelConfig.Mmproj -and "$($ModelConfig.Mmproj)" -ne "") {
        $args += @("--mmproj", $ModelConfig.Mmproj)
    }
    if ($ModelConfig.ContainsKey("Mtp") -and $ModelConfig.Mtp) {
        $args = Add-SpeculativeServerArgs -Model $ModelConfig -ServerArgs $args -DisableMtp:$DisableMtp
    }
    if ($ModelConfig.ContainsKey("GptOss") -and $ModelConfig.GptOss) {
        $args += @("--jinja")
    }
    if ($ModelConfig.ContainsKey("ExtraServerArgs") -and $null -ne $ModelConfig.ExtraServerArgs) {
        $args += $ModelConfig.ExtraServerArgs
    }
    return Set-ReasoningServerArgs -ServerArgs $args -Reasoning $Reasoning -ModelName ([string]$ModelConfig.Name)
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
$modelAlias = [string]$modelConfig["LanAlias"]
$modelKey = [string]$modelConfig["LanKey"]
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

if ($modelConfig.ContainsKey("Mmproj") -and -not [string]::IsNullOrWhiteSpace([string]$modelConfig.Mmproj)) {
    $mmprojPath = [string]$modelConfig.Mmproj
    if (-not (Test-Path -LiteralPath $mmprojPath)) {
        Write-Warning "Multimodal projector not found: $mmprojPath. Continuing without --mmproj, so this LAN session will be text-only."
        $modelConfig["Mmproj"] = ""
    }
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
    Ensure-LanFirewallPort -Port $FirewallPort -Model $Model
}

$portTargets = @($Port, $AltPort, $BackendPort)
if (-not $DisableAsr) { $portTargets += $AsrBackendPort }
foreach ($TargetPort in $portTargets) {
    if (Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue) {
        throw "Port $TargetPort is already in use. Run .\Serve-LAN.ps1 -Action Stop or choose another port."
    }
}

$LlamaArgs = Build-LlamaArgs -ModelConfig $modelConfig -BackendPort $BackendPort -MaxTokens $MaxTokens -Parallel $Parallel -Reasoning $Reasoning -DisableMtp:$DisableMtp
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

Initialize-LanConsoleCleanup -LogPath $WatchdogLog

$llama = $null
$asrProcess = $null
$watchdogProcess = $null
$adapterProcess = $null
$tailJobs = @()

try {
Remove-Item Env:LLAMA_CHAT_TEMPLATE_KWARGS -ErrorAction SilentlyContinue
$llama = Start-Process -FilePath $serverPath -ArgumentList $LlamaArgs -WorkingDirectory $Root -RedirectStandardOutput $Out -RedirectStandardError $Err -WindowStyle Hidden -PassThru
Set-LanConsoleCleanupTargets -Processes @($llama)

if (-not $DisableAsr) {
    $AsrArgs = @("serve", "--asr", "1", "--host", "127.0.0.1", "--port", "$AsrBackendPort", "--pmode", "performance")
    $asrProcess = Start-Process -FilePath $Flm -ArgumentList $AsrArgs -WorkingDirectory $Root -RedirectStandardOutput $AsrOut -RedirectStandardError $AsrErr -WindowStyle Hidden -PassThru
    Set-LanConsoleCleanupTargets -Processes @($llama, $asrProcess)
}

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

    $title = "$modelKey LAN"
    if (-not $DisableAsr) { $title += " + Whisper ASR" }
    $Host.UI.RawUI.WindowTitle = $title

    Write-Host "Starting $modelKey backend PID $($llama.Id) on 127.0.0.1:$BackendPort..."
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
        Set-LanConsoleCleanupTargets -Processes @($llama, $asrProcess, $watchdogProcess)
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
            if ($models.data.id -contains $modelAlias) { $healthy = $true }
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
    Write-Host "$modelKey is available:"
    Write-Host "  http://127.0.0.1:$Port/v1"
    Write-Host "  http://127.0.0.1:$AltPort/v1"
    foreach ($ip in $ips) {
        Write-Host "  http://$ip`:$Port/v1"
        Write-Host "  http://$ip`:$AltPort/v1"
    }
    Write-Host ""
    $displayPublicAliases = @(Get-LanPublicAliases -ModelConfig $modelConfig)
    Write-Host "Model alias: $modelAlias"
    if ($displayPublicAliases.Count -gt 0) {
        Write-Host "Public aliases: $($displayPublicAliases -join ', ')"
    }
    if ($asrProcess) {
        Write-Host "ASR model: whisper-v3:turbo via FastFlowLM NPU"
    }
    Write-Host "Close this window or press Ctrl+C to stop the adapter and backend."
    Write-Host ""

    $publicAliases = Get-LanPublicAliases -ModelConfig $modelConfig
    $modelMetadata = Get-LanModelMetadata `
        -ModelConfig $modelConfig `
        -ServerArgs $LlamaArgs `
        -ModelKey $modelKey `
        -ModelAlias $modelAlias `
        -PublicAliases $publicAliases `
        -ServerPath $serverPath `
        -Upstream "http://127.0.0.1:$BackendPort" `
        -AdapterHost "0.0.0.0" `
        -AdapterPorts @($Port, $AltPort) `
        -BackendPort $BackendPort `
        -AsrBackendPort $AsrBackendPort `
        -AsrEnabled ([bool]$asrProcess) `
        -Reasoning $Reasoning `
        -DisableMtp ([bool]$DisableMtp)
    $env:ADAPTER_HOST = "0.0.0.0"
    $env:ADAPTER_PORT = "$Port"
    $env:ADAPTER_PORTS = "$Port,$AltPort"
    $env:LLAMA_UPSTREAM = "http://127.0.0.1:$BackendPort"
    $env:UPSTREAM_KIND = "llama.cpp"
    $env:MODEL_ALIAS = $modelAlias
    $env:PUBLIC_MODEL_ALIASES = ($publicAliases -join ",")
    $env:MODEL_METADATA_JSON = ($modelMetadata | ConvertTo-Json -Depth 10 -Compress)
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
    if ($env:HARNESS_POLICY) {
        Write-Host "Harness policy: $($env:HARNESS_POLICY)"
    } else {
        Remove-Item Env:HARNESS_POLICY -ErrorAction SilentlyContinue
        Remove-Item Env:HARNESS_MODULE -ErrorAction SilentlyContinue
        Remove-Item Env:HARNESS_LOG_JSONL -ErrorAction SilentlyContinue
        Remove-Item Env:HARNESS_MODEL_ALIASES -ErrorAction SilentlyContinue
    }

    $adapterProcess = Start-Process -FilePath $Node -ArgumentList @($Adapter) -WorkingDirectory $RepoRoot -RedirectStandardOutput $AdapterOut -RedirectStandardError $AdapterErr -WindowStyle Hidden -PassThru
    Set-LanConsoleCleanupTargets -Processes @($adapterProcess, $llama, $asrProcess, $watchdogProcess)
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
    if ("LanConsoleCleanup" -as [type]) {
        [LanConsoleCleanup]::ClearTargets()
    }
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}
