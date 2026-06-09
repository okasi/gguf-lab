param(
    [int]$GemmaPort = 19380,
    [int]$GptOssPort = 19381,
    [int]$TextMaxTokens = 256,
    [int]$VisionMaxTokens = 256,
    [int]$CodeMaxTokens = 4096,
    [int]$RequestTimeoutSec = 1800,
    [string[]]$OnlyModels = @(),
    [string]$CacheTypeK = "q8_0",
    [string]$CacheTypeV = "q8_0",
    [string]$ModelsJson = "",
    [string]$ResultNameOverride = ""
)

$ErrorActionPreference = "Continue"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root "logs"
$ResultName = if ($ResultNameOverride) { $ResultNameOverride } else { "readme-hard-typescript-results.csv" }
$ResultPath = Join-Path $LogDir $ResultName
$Server = Join-Path $Root "tools\llama-b9535-bin-win-vulkan-x64\llama-server.exe"
$Node = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$Transpiler = Join-Path $Root "tools\ts-runner\transpile-ts.js"
$Image = Join-Path $Root "test-assets\vision-test.png"
$ImageB64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($Image))
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
function ConvertTo-PlainHashtable {
    param($Value)

    if ($null -eq $Value) { return $null }
    if ($Value -is [System.Collections.IDictionary]) {
        $hash = @{}
        foreach ($key in $Value.Keys) { $hash[$key] = ConvertTo-PlainHashtable -Value $Value[$key] }
        return $hash
    }
    if ($Value -is [array]) {
        $items = @()
        foreach ($item in $Value) { $items += ConvertTo-PlainHashtable -Value $item }
        return $items
    }
    if ($Value -is [pscustomobject]) {
        $hash = @{}
        foreach ($prop in $Value.PSObject.Properties) { $hash[$prop.Name] = ConvertTo-PlainHashtable -Value $prop.Value }
        return $hash
    }
    return $Value
}
function New-BatchRun {
    param(
        [string]$Name,
        [string]$Alias,
        [string]$Model,
        [string]$Mmproj = "",
        [int]$Port = $GemmaPort,
        [bool]$Vision = $true,
        [int]$CtxSize = 262144,
        [double]$Temperature = 0.75,
        [double]$TopP = 0.95,
        [int]$TopK = 20,
        [object]$MinP = 0.0,
        [double]$RepeatPenalty = 1.0,
        [object]$ImageMinTokens = 1024,
        [string]$SystemPrompt = "",
        [object[]]$ExtraServerArgs = @(),
        [string]$Server = "",
        [switch]$GptOss,
        [switch]$Mtp
    )
    $args = @(
        "--model", $Model,
        "--alias", $Alias,
        "--host", "127.0.0.1",
        "--port", "$Port",
        "--ctx-size", "$CtxSize",
        "-np", "1",
        "-ngl", "99",
        "--flash-attn", "on",
        "--cache-type-k", "$CacheTypeK",
        "--cache-type-v", "$CacheTypeV",
        "--temp", "$Temperature",
        "--top-p", "$TopP",
        "--top-k", "$TopK",
        "--presence-penalty", "0.0",
        "--repeat-penalty", "$RepeatPenalty",
        "--seed", "3407",
        "-n", "32768"
    )
    if ($Mmproj) {
        $args = @("--model", $Model, "--mmproj", $Mmproj) + $args[2..($args.Count - 1)]
    }
    if ($null -ne $MinP -and "$MinP" -ne "") {
        $args += @("--min-p", "$MinP")
    }
    if ($Vision -and $null -ne $ImageMinTokens -and "$ImageMinTokens" -ne "") {
        $args += @("--image-min-tokens", "$ImageMinTokens")
    }
    if ($GptOss) {
        $args += @("--jinja")
    }
    if ($Mtp) {
        $args += @("--spec-type", "draft-mtp", "--spec-draft-n-min", "1", "--spec-draft-n-max", "2")
    }
    if ($ExtraServerArgs.Count -gt 0) {
        $args += $ExtraServerArgs
    }
    if ($args -notcontains "--reasoning") {
        $args += @("--reasoning", "auto")
    }
    return @{
        Name = $Name
        Port = $Port
        Alias = $Alias
        Vision = $Vision
        Temperature = $Temperature
        TopP = $TopP
        TopK = $TopK
        MinP = $MinP
        RepeatPenalty = $RepeatPenalty
        SystemPrompt = $SystemPrompt
        Server = $Server
        Args = $args
    }
}

$Runs = @()
if (-not $ModelsJson) {
    $ModelsJson = Join-Path $Root "readme-models.json"
}
if (-not (Test-Path -LiteralPath $ModelsJson)) {
    throw "Models manifest not found: $ModelsJson"
}
$parsedModels = Get-Content -LiteralPath $ModelsJson -Raw | ConvertFrom-Json
foreach ($parsedModel in $parsedModels) {
    $model = ConvertTo-PlainHashtable -Value $parsedModel
    $extra = if ($model.ContainsKey("ExtraServerArgs") -and $null -ne $model.ExtraServerArgs) { @($model.ExtraServerArgs) } else { @() }
    $runArgs = @{
        Name = [string]$model.Name
        Alias = [string]$model.Alias
        Model = [string]$model.Model
        Mmproj = if ($model.ContainsKey("Mmproj") -and $null -ne $model.Mmproj) { [string]$model.Mmproj } else { "" }
        Port = if ($model.ContainsKey("Port") -and $model.Port) { [int]$model.Port } else { $GemmaPort }
        Vision = if ($model.ContainsKey("Vision")) { [bool]$model.Vision } else { $true }
        CtxSize = if ($model.ContainsKey("CtxSize") -and $model.CtxSize) { [int]$model.CtxSize } else { 262144 }
        Temperature = if ($model.ContainsKey("Temp") -and $model.Temp) { [double]$model.Temp } elseif ($model.ContainsKey("Temperature") -and $model.Temperature) { [double]$model.Temperature } else { 0.75 }
        TopP = if ($model.ContainsKey("TopP") -and $model.TopP) { [double]$model.TopP } else { 0.95 }
        TopK = if ($model.ContainsKey("TopK") -and $model.TopK) { [int]$model.TopK } else { 20 }
        MinP = if ($model.ContainsKey("MinP")) { $model.MinP } else { 0.0 }
        RepeatPenalty = if ($model.ContainsKey("RepeatPenalty") -and $model.RepeatPenalty) { [double]$model.RepeatPenalty } else { 1.0 }
        ImageMinTokens = if ($model.ContainsKey("ImageMinTokens")) { $model.ImageMinTokens } else { 1024 }
        SystemPrompt = if ($model.ContainsKey("SystemPrompt") -and $null -ne $model.SystemPrompt) { [string]$model.SystemPrompt } else { "" }
        ExtraServerArgs = $extra
        Server = if ($model.ContainsKey("Server") -and $null -ne $model.Server) { [string]$model.Server } else { "" }
    }
    if ($runArgs.Server -and -not [System.IO.Path]::IsPathRooted($runArgs.Server)) {
        $runArgs.Server = Join-Path $Root $runArgs.Server
    }
    if ($model.ContainsKey("GptOss") -and $model.GptOss) { $runArgs.GptOss = $true }
    if ($model.ContainsKey("Mtp") -and $model.Mtp) { $runArgs.Mtp = $true }
    $Runs += New-BatchRun @runArgs
}
if ($OnlyModels.Count -gt 0) {
    $Runs = @($Runs | Where-Object { $OnlyModels -contains $_.Name -or $OnlyModels -contains $_.Alias })
}

$TextPrompt = "Write a concise technical explanation of how tool-calling agents should avoid repeated tool loops. Keep it under 160 words."

$Problems = @(
    @{
        Id = "lru_cache"
        Prompt = @"
Write a complete TypeScript program for Node.js.

Problem:
Simulate a least-recently-used cache.

Input:
First line: C N, where C is cache capacity and N is number of operations.
Next N lines are one of:
PUT key value
GET key
DEL key

Keys are non-empty strings without spaces. Values are signed 32-bit integers.
GET should output the value if present, otherwise -1, and a successful GET makes the key most recently used.
PUT updates an existing key and makes it most recently used. If inserting and the cache is over capacity, evict the least recently used key.
DEL removes the key if present.

Output:
First line: all GET results separated by spaces, or EMPTY if there were no GET operations.
Second line: remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY if cache is empty.

Constraints:
1 <= C <= 200000
1 <= N <= 300000

Requirements:
- O(1) amortized per operation.
- Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8").
- Return only TypeScript code, no explanation and no Markdown fence.
"@
        Tests = @(
            @{ Name = "evict_update_get"; Input = "2 7`nPUT a 1`nPUT b 2`nGET a`nPUT c 3`nGET b`nPUT a 4`nGET a`n"; Expected = "1 -1 4`na c" },
            @{ Name = "delete_and_empty_gets"; Input = "3 6`nPUT x 10`nPUT y 20`nDEL x`nGET x`nGET y`nDEL y`n"; Expected = "-1 20`nEMPTY" },
            @{ Name = "capacity_one"; Input = "1 8`nPUT a 1`nPUT b 2`nGET a`nGET b`nPUT c 3`nGET b`nGET c`nGET a`n"; Expected = "-1 2 -1 3 -1`nc" },
            @{ Name = "no_gets"; Input = "2 5`nPUT k1 7`nPUT k2 8`nPUT k3 9`nDEL k2`nPUT k1 10`n"; Expected = "EMPTY`nk1 k3" },
            @{ Name = "string_keys"; Input = "3 9`nPUT aa 1`nPUT bb 2`nPUT cc 3`nGET aa`nPUT dd 4`nGET bb`nGET cc`nGET dd`nGET aa`n"; Expected = "1 -1 3 4 1`naa dd cc" },
            @{ Name = "update_existing"; Input = "2 6`nPUT a 1`nPUT b 2`nPUT a 9`nPUT c 3`nGET a`nGET b`n"; Expected = "9 -1`na c" }
        )
    },
    @{
        Id = "expression_parser"
        Prompt = @"
Write a complete TypeScript program for Node.js.

Problem:
Evaluate one arithmetic expression containing integers, spaces, parentheses, binary + - * /, and unary + / -.
Division truncates toward zero. All intermediate values fit in JavaScript safe integers.
Input: one line containing the expression.
Output: the evaluated integer.

Requirements:
- Implement a real parser or shunting-yard evaluator. Do not use eval, Function, vm, or external packages.
- Operator precedence: unary +/-, then * and /, then + and -.
- Parentheses may be nested deeply.
- Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8").
- Return only TypeScript code, no explanation and no Markdown fence.
"@
        Tests = @(
            @{ Name = "precedence"; Input = "2 + 3 * 4`n"; Expected = "14" },
            @{ Name = "paren_unary"; Input = "-(2 + 3) * 4`n"; Expected = "-20" },
            @{ Name = "trunc_zero"; Input = "7 / -3 + 10 / 4`n"; Expected = "0" },
            @{ Name = "nested"; Input = "1 + 2 * (3 + 4 * (5 - 6 / 3))`n"; Expected = "31" },
            @{ Name = "unary_chain"; Input = "--5 + +-3 * 2`n"; Expected = "-1" },
            @{ Name = "spaces"; Input = " ( 18 - (3*4) ) / 2 + 7 `n"; Expected = "10" },
            @{ Name = "left_assoc"; Input = "20 / 3 / 2`n"; Expected = "3" }
        )
    },
    @{
        Id = "weighted_grid_dijkstra"
        Prompt = @"
Write a complete TypeScript program for Node.js.

Problem:
Find the minimum cost path in a rectangular grid.

Input:
First line: H W
Next H lines: grid characters.

Grid characters:
S = start
T = target
# = wall
digits 0..9 = passable cells with that cost to enter

Moving is allowed up/down/left/right. The cost of the path is the sum of costs of entered digit cells. Entering S or T costs 0. The start cell itself contributes 0.

Output:
Minimum cost from S to T, or -1 if unreachable.

Requirements:
- Use Dijkstra or an equivalent correct shortest path algorithm.
- Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8").
- Return only TypeScript code, no explanation and no Markdown fence.
"@
        Tests = @(
            @{ Name = "basic"; Input = "3 4`nS111`n9#91`n111T`n"; Expected = "4" },
            @{ Name = "unreachable"; Input = "3 3`nS#1`n###`n1#T`n"; Expected = "-1" },
            @{ Name = "zero_corridor"; Input = "2 5`nS000T`n99999`n"; Expected = "0" },
            @{ Name = "choose_longer_cheaper"; Input = "4 5`nS999T`n00000`n9###9`n00000`n"; Expected = "18" },
            @{ Name = "single_row"; Input = "1 6`nS123T9`n"; Expected = "6" },
            @{ Name = "around_wall"; Input = "5 5`nS1#9T`n01#90`n01#90`n01010`n00000`n"; Expected = "11" }
        )
    },
    @{
        Id = "topological_scheduler"
        Prompt = @"
Write a complete TypeScript program for Node.js.

Problem:
Given tasks and dependency edges, output a deterministic build order.

Input:
First line: N M
Second line: N distinct task names.
Next M lines: A B meaning A must be completed before B.

Output:
If a valid ordering exists, output all task names in order separated by spaces.
When multiple tasks are available, choose the lexicographically smallest task name.
If there is a cycle, output IMPOSSIBLE.

Requirements:
- O((N + M) log N) or better.
- Implement your own binary heap or another efficient priority queue; do not repeatedly sort the available set.
- Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8").
- Return only TypeScript code, no explanation and no Markdown fence.
"@
        Tests = @(
            @{ Name = "simple"; Input = "4 3`na b c d`na c`nb c`nc d`n"; Expected = "a b c d" },
            @{ Name = "lexicographic"; Input = "5 2`nz a m b c`na z`nb z`n"; Expected = "a b c m z" },
            @{ Name = "cycle"; Input = "3 3`na b c`na b`nb c`nc a`n"; Expected = "IMPOSSIBLE" },
            @{ Name = "independent"; Input = "4 0`nd c b a`n"; Expected = "a b c d" },
            @{ Name = "diamond"; Input = "5 5`nbuild lint test package deploy`nbuild lint`nbuild test`nlint package`ntest package`npackage deploy`n"; Expected = "build lint test package deploy" },
            @{ Name = "duplicate_edges"; Input = "3 3`na b c`na b`na b`nb c`n"; Expected = "a b c" }
        )
    }
)

$Results = @()

function Stop-PortProcess {
    param([int]$LocalPort)
    $conns = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        if ($conn.OwningProcess) { Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue }
    }
}

function Get-GpuProcessMemory {
    param([int]$ProcessId)
    $samples = Get-Counter '\GPU Process Memory(*)\Local Usage','\GPU Process Memory(*)\Dedicated Usage','\GPU Process Memory(*)\Shared Usage','\GPU Process Memory(*)\Total Committed' -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty CounterSamples |
        Where-Object { $_.InstanceName -match "pid_$ProcessId" }
    $map = @{}
    foreach ($sample in $samples) {
        $counter = ($sample.Path -replace '^.*\\', '').ToLowerInvariant()
        $map[$counter] = [math]::Round($sample.CookedValue / 1MB, 2)
    }
    [pscustomobject]@{ LocalMiB=$map["local usage"]; DedicatedMiB=$map["dedicated usage"]; SharedMiB=$map["shared usage"]; TotalCommittedMiB=$map["total committed"] }
}

function Get-Code {
    param([string]$Text)
    $harmonyFinalCode = [regex]::Match($Text, '(?s)<\|channel\|>final\s+code<\|message\|>(.*?)(?:<\|end\|>|$)')
    if ($harmonyFinalCode.Success) { $Text = $harmonyFinalCode.Groups[1].Value }
    $harmonyFinal = [regex]::Match($Text, '(?s)<\|channel\|>final<\|message\|>(.*?)(?:<\|end\|>|$)')
    if ($harmonyFinal.Success) { $Text = $harmonyFinal.Groups[1].Value }
    $match = [regex]::Match($Text, '(?s)```(?:typescript|ts|javascript|js)?\s*(.*?)```')
    if ($match.Success) { $Text = $match.Groups[1].Value }
    $Text = [regex]::Replace($Text, '(?s)<\|channel\>[^<\r\n]*(?:\r?\n)?<channel\|>', '')
    $Text = [regex]::Replace($Text, '(?s)<\|start\|>assistant<\|channel\|>.*?<\|message\|>', '')
    $Text = [regex]::Replace($Text, '<\|(?:start|end|channel|message|constrain)\|>', '')
    $Text = [regex]::Replace($Text, '<\|channel\>|<channel\|>', '')
    $Text = [regex]::Replace($Text, '(?is)^.*?</think>\s*', '')
    $start = [regex]::Match($Text, '(?m)^\s*(import\s+|const\s+|let\s+|var\s+|class\s+|function\s+|type\s+|interface\s+)')
    if ($start.Success -and $start.Index -gt 0) { $Text = $Text.Substring($start.Index) }
    return $Text.Trim()
}

function Invoke-Chat {
    param(
        [int]$Port,
        [string]$Alias,
        $Messages,
        [int]$MaxTokens = 256,
        $Tools = $null,
        [string]$SystemPrompt = "",
        [double]$Temperature = 0.75,
        [double]$TopP = 0.95,
        [int]$TopK = 20,
        [object]$MinP = 0.0,
        [double]$RepeatPenalty = 1.0
    )
    $messageList = @()
    if (-not [string]::IsNullOrWhiteSpace($SystemPrompt)) {
        $messageList += @{ role = "system"; content = $SystemPrompt }
    }
    $messageList += @($Messages)
    $body = @{
        model = $Alias
        temperature = $Temperature
        top_p = $TopP
        top_k = $TopK
        presence_penalty = 0.0
        repeat_penalty = $RepeatPenalty
        seed = 3407
        max_tokens = $MaxTokens
        messages = $messageList
    }
    if ($null -ne $MinP -and "$MinP" -ne "") {
        $body.min_p = [double]$MinP
    }
    if ($Tools) {
        $body.tools = $Tools
        $body.tool_choice = "auto"
    }
    $json = $body | ConvertTo-Json -Depth 18
    Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:$Port/v1/chat/completions" -ContentType "application/json" -Body $json -TimeoutSec $RequestTimeoutSec
}

function Test-TypeScript {
    param($Problem, [string]$Code, [string]$SafeName)
    $tsPath = Join-Path $LogDir ("new-model-$SafeName-$($Problem.Id).ts")
    $jsPath = Join-Path $LogDir ("new-model-$SafeName-$($Problem.Id).js")
    Set-Content -LiteralPath $tsPath -Value $Code -Encoding utf8
    if ([string]::IsNullOrWhiteSpace($Code)) {
        return [pscustomobject]@{ Passed=0; Total=$Problem.Tests.Count; TypeScriptPath=$tsPath; Note="no visible TypeScript code" }
    }
    Remove-Item -LiteralPath $jsPath -Force -ErrorAction SilentlyContinue
    $transpileOutput = & $Node $Transpiler $tsPath $jsPath 2>&1
    if (-not (Test-Path -LiteralPath $jsPath)) {
        return [pscustomobject]@{ Passed=0; Total=$Problem.Tests.Count; TypeScriptPath=$tsPath; Note="transpile failed: $($transpileOutput -join ' ')" }
    }
    $passed = 0
    $notes = @()
    foreach ($test in $Problem.Tests) {
        $inputPath = Join-Path $LogDir ("new-model-$SafeName-$($Problem.Id)-$($test.Name).in")
        Set-Content -LiteralPath $inputPath -Value $test.Input -NoNewline -Encoding ascii

        $psi = [System.Diagnostics.ProcessStartInfo]::new()
        $cmd = "/d /s /c `"`"$Node`" `"$jsPath`" < `"$inputPath`"`""
        $psi.FileName = "cmd.exe"
        $psi.Arguments = $cmd
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $proc = [System.Diagnostics.Process]::Start($psi)
        $finished = $proc.WaitForExit(5000)
        if (-not $finished) {
            try { $proc.Kill($true) } catch { try { $proc.Kill() } catch {} }
            $output = "TIMEOUT after 5s"
            $exit = 124
        } else {
            $output = @($proc.StandardOutput.ReadToEnd(), $proc.StandardError.ReadToEnd()) -join "`n"
            $exit = $proc.ExitCode
        }
        $normalized = (($output | Out-String).Trim() -replace "\s+", " ")
        $expected = ($test.Expected.Trim() -replace "\s+", " ")
        if ($exit -eq 0 -and $normalized -eq $expected) { $passed += 1 } else { $notes += "$($test.Name): expected '$expected', got '$normalized'" }
    }
    [pscustomobject]@{ Passed=$passed; Total=$Problem.Tests.Count; TypeScriptPath=$tsPath; Note=($notes -join " | ") }
}

function Add-Result {
    param($Row)
    $script:Results += $Row
    $script:Results | Export-Csv -NoTypeInformation -LiteralPath $script:ResultPath
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

foreach ($p in @($GemmaPort, $GptOssPort)) { Stop-PortProcess -LocalPort $p }
Remove-Item -LiteralPath $ResultPath -Force -ErrorAction SilentlyContinue

foreach ($run in $Runs) {
    $safe = $run.Name -replace "[^A-Za-z0-9._-]", "_"
    $outLog = Join-Path $LogDir "new-model-$safe-server.out.log"
    $errLog = Join-Path $LogDir "new-model-$safe-server.err.log"
    $port = [int]$run.Port
    Write-Host "==== $($run.Name) ===="
    $proc = $null
    try {
        foreach ($required in @($run.Args[1])) {
            if (-not (Test-Path -LiteralPath $required)) { throw "Required model file missing: $required" }
        }
        $serverForRun = if ($run.ContainsKey("Server") -and -not [string]::IsNullOrWhiteSpace($run.Server)) { $run.Server } else { $Server }
        $proc = Start-LoggedProcess -FilePath $serverForRun -ArgumentList $run.Args -WorkingDirectory $Root -StdOutLog $outLog -StdErrLog $errLog
        $healthy = $false
        for ($i=0; $i -lt 240; $i++) {
            Start-Sleep -Seconds 2
            if ($proc.HasExited) { break }
            try { Invoke-WebRequest -Uri "http://127.0.0.1:$port/health" -UseBasicParsing -TimeoutSec 2 | Out-Null; $healthy = $true; break } catch {}
        }
        if (-not $healthy) { throw "server did not become healthy: $((Get-Content -LiteralPath $errLog -Tail 100 -ErrorAction SilentlyContinue) -join ' ')" }
        Start-Sleep -Seconds 3
        $mem = Get-GpuProcessMemory -ProcessId $proc.Id
        $temperature = if ($run.ContainsKey("Temperature")) { [double]$run.Temperature } else { 0.75 }
        $topP = if ($run.ContainsKey("TopP")) { [double]$run.TopP } else { 0.95 }
        $topK = if ($run.ContainsKey("TopK")) { [int]$run.TopK } else { 20 }
        $minP = if ($run.ContainsKey("MinP")) { $run.MinP } else { 0.0 }
        $repeatPenalty = if ($run.ContainsKey("RepeatPenalty")) { [double]$run.RepeatPenalty } else { 1.0 }
        $systemPrompt = if ($run.ContainsKey("SystemPrompt")) { [string]$run.SystemPrompt } else { "" }

        $textResp = Invoke-Chat -Port $port -Alias $run.Alias -MaxTokens $TextMaxTokens -Temperature $temperature -TopP $topP -TopK $topK -MinP $minP -RepeatPenalty $repeatPenalty -SystemPrompt $systemPrompt -Messages @(@{ role="user"; content=$TextPrompt })
        $textLog = Join-Path $LogDir "new-model-$safe-text.response.json"
        $textResp | ConvertTo-Json -Depth 18 | Out-File -Encoding utf8 -LiteralPath $textLog
        Add-Result ([pscustomobject]@{ Time=(Get-Date).ToString("s"); Model=$run.Name; Mode="text"; Passed=""; Total=""; LoadCommittedMiB=$mem.TotalCommittedMiB; PromptTPS=$textResp.timings.prompt_per_second; GenerationTPS=$textResp.timings.predicted_per_second; PromptTokens=$textResp.timings.prompt_n; GenerationTokens=$textResp.timings.predicted_n; Note=""; Log=$textLog })

        if ($run.Vision) {
            $visionResp = Invoke-Chat -Port $port -Alias $run.Alias -MaxTokens $VisionMaxTokens -Temperature $temperature -TopP $topP -TopK $topK -MinP $minP -RepeatPenalty $repeatPenalty -SystemPrompt $systemPrompt -Messages @(@{ role="user"; content=@(
                @{ type="text"; text="Describe the image in one sentence. Mention the shapes, colors, and text exactly." },
                @{ type="image_url"; image_url=@{ url="data:image/png;base64,$ImageB64" } }
            )})
            $visionLog = Join-Path $LogDir "new-model-$safe-vision.response.json"
            $visionResp | ConvertTo-Json -Depth 18 | Out-File -Encoding utf8 -LiteralPath $visionLog
            $content = $visionResp.choices[0].message.content
            $reasoning = $visionResp.choices[0].message.reasoning_content
            $seen = ((("$content $reasoning") -match "(?i)red") -and (("$content $reasoning") -match "(?i)blue") -and (("$content $reasoning") -match "(?i)QWEN"))
            $visionNote = if (-not [string]::IsNullOrWhiteSpace($content)) { $content } else { $reasoning }
            Add-Result ([pscustomobject]@{ Time=(Get-Date).ToString("s"); Model=$run.Name; Mode="vision"; Passed=if($seen){"1"}else{"0"}; Total="1"; LoadCommittedMiB=$mem.TotalCommittedMiB; PromptTPS=$visionResp.timings.prompt_per_second; GenerationTPS=$visionResp.timings.predicted_per_second; PromptTokens=$visionResp.timings.prompt_n; GenerationTokens=$visionResp.timings.predicted_n; Note=$visionNote; Log=$visionLog })
        } else {
            Add-Result ([pscustomobject]@{ Time=(Get-Date).ToString("s"); Model=$run.Name; Mode="vision"; Passed="N/A"; Total="N/A"; LoadCommittedMiB=$mem.TotalCommittedMiB; PromptTPS=""; GenerationTPS=""; PromptTokens=""; GenerationTokens=""; Note="no mmproj in repo"; Log="" })
        }

        $tools = @(@{ type="function"; function=@{ name="get_weather"; description="Get weather for a city"; parameters=@{ type="object"; properties=@{ city=@{ type="string" } }; required=@("city") } } })
        $toolResp = Invoke-Chat -Port $port -Alias $run.Alias -MaxTokens 512 -Temperature $temperature -TopP $topP -TopK $topK -MinP $minP -RepeatPenalty $repeatPenalty -SystemPrompt $systemPrompt -Tools $tools -Messages @(@{ role="user"; content="Use the get_weather tool for Stockholm, Sweden. Do not answer from memory." })
        $toolLog = Join-Path $LogDir "new-model-$safe-tool.response.json"
        $toolResp | ConvertTo-Json -Depth 18 | Out-File -Encoding utf8 -LiteralPath $toolLog
        $toolJson = $toolResp | ConvertTo-Json -Depth 18
        $toolHit = (($toolJson -match "get_weather") -and ($toolJson -match "Stockholm"))
        Add-Result ([pscustomobject]@{ Time=(Get-Date).ToString("s"); Model=$run.Name; Mode="tool"; Passed=if($toolHit){"1"}else{"0"}; Total="1"; LoadCommittedMiB=$mem.TotalCommittedMiB; PromptTPS=$toolResp.timings.prompt_per_second; GenerationTPS=$toolResp.timings.predicted_per_second; PromptTokens=$toolResp.timings.prompt_n; GenerationTokens=$toolResp.timings.predicted_n; Note=($toolResp.choices[0].message.content); Log=$toolLog })

        foreach ($problem in $Problems) {
            Write-Host "Problem $($problem.Id)"
            $resp = Invoke-Chat -Port $port -Alias $run.Alias -MaxTokens $CodeMaxTokens -Temperature $temperature -TopP $topP -TopK $topK -MinP $minP -RepeatPenalty $repeatPenalty -SystemPrompt $systemPrompt -Messages @(@{ role="user"; content=$problem.Prompt })
            $respLog = Join-Path $LogDir "new-model-$safe-$($problem.Id).response.json"
            $resp | ConvertTo-Json -Depth 18 | Out-File -Encoding utf8 -LiteralPath $respLog
            $content = $resp.choices[0].message.content
            if ([string]::IsNullOrWhiteSpace($content) -and $resp.choices[0].message.reasoning_content) { $content = $resp.choices[0].message.reasoning_content }
            $code = Get-Code -Text $content
            $test = Test-TypeScript -Problem $problem -Code $code -SafeName $safe
            Add-Result ([pscustomobject]@{ Time=(Get-Date).ToString("s"); Model=$run.Name; Mode="code:$($problem.Id)"; Passed=$test.Passed; Total=$test.Total; LoadCommittedMiB=$mem.TotalCommittedMiB; PromptTPS=$resp.timings.prompt_per_second; GenerationTPS=$resp.timings.predicted_per_second; PromptTokens=$resp.timings.prompt_n; GenerationTokens=$resp.timings.predicted_n; Note=$test.Note; Log=$respLog })
        }
    } catch {
        Add-Result ([pscustomobject]@{ Time=(Get-Date).ToString("s"); Model=$run.Name; Mode="error"; Passed=0; Total=0; LoadCommittedMiB=""; PromptTPS=""; GenerationTPS=""; PromptTokens=""; GenerationTokens=""; Note=$_.Exception.Message; Log=$errLog })
    } finally {
        if ($proc -and -not $proc.HasExited) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
        Stop-PortProcess -LocalPort $port
        Start-Sleep -Seconds 5
    }
}

Write-Host "Results saved to $ResultPath"
$Results | Format-Table -AutoSize

