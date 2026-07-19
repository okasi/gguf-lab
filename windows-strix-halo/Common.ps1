function ConvertTo-PlainHashtable {
    param($Value)

    if ($null -eq $Value) { return $null }
    if ($Value -is [string] -or $Value -is [char] -or $Value.GetType().IsPrimitive -or $Value -is [decimal]) {
        return $Value
    }
    if ($Value -is [System.Collections.IDictionary]) {
        $result = @{}
        foreach ($key in $Value.Keys) {
            $result[$key] = ConvertTo-PlainHashtable -Value $Value[$key]
        }
        return $result
    }
    if ($Value -is [System.Collections.IEnumerable]) {
        return @($Value | ForEach-Object { ConvertTo-PlainHashtable -Value $_ })
    }
    if ($Value -is [pscustomobject]) {
        $result = @{}
        foreach ($property in $Value.PSObject.Properties) {
            $result[$property.Name] = ConvertTo-PlainHashtable -Value $property.Value
        }
        return $result
    }
    return $Value
}

function Get-ModelValue {
    param(
        [Alias("ModelConfig")]
        $Model,
        [string]$Key,
        [string]$Default
    )

    if ($Model.ContainsKey($Key) -and $null -ne $Model[$Key] -and "$($Model[$Key])" -ne "") {
        return "$($Model[$Key])"
    }
    return $Default
}

function Resolve-HuggingFaceFile {
    param(
        [string]$Source,
        [string]$File,
        [string]$ConfiguredPath = ""
    )

    if ($ConfiguredPath -and (Test-Path -LiteralPath $ConfiguredPath)) {
        return (Resolve-Path -LiteralPath $ConfiguredPath).Path
    }
    if (-not $Source -or -not $File) { return $ConfiguredPath }

    $repoDirectory = "models--$($Source -replace '/', '--')"
    $snapshots = Join-Path (Join-Path $env:USERPROFILE ".cache\huggingface\hub\$repoDirectory") "snapshots"
    if (-not (Test-Path -LiteralPath $snapshots)) { return $ConfiguredPath }

    foreach ($snapshot in (Get-ChildItem -LiteralPath $snapshots -Directory | Sort-Object LastWriteTime -Descending)) {
        $candidate = Join-Path $snapshot.FullName $File
        if (Test-Path -LiteralPath $candidate) { return $candidate }
    }
    return $ConfiguredPath
}

function Resolve-ModelConfigPaths {
    param([hashtable]$Model)

    $source = if ($Model.ContainsKey("Source")) { [string]$Model.Source } else { "" }
    $file = if ($Model.ContainsKey("File")) { [string]$Model.File } else { "" }
    $configuredModel = if ($Model.ContainsKey("Model")) { [string]$Model.Model } else { "" }
    $Model["Model"] = Resolve-HuggingFaceFile -Source $source -File $file -ConfiguredPath $configuredModel

    $mmprojFile = if ($Model.ContainsKey("MmprojFile")) { [string]$Model.MmprojFile } else { "" }
    $configuredMmproj = if ($Model.ContainsKey("Mmproj")) { [string]$Model.Mmproj } else { "" }
    if ($mmprojFile -or $configuredMmproj) {
        $mmprojSource = if ($Model.ContainsKey("MmprojSource")) { [string]$Model.MmprojSource } else { $source }
        $Model["Mmproj"] = Resolve-HuggingFaceFile -Source $mmprojSource -File $mmprojFile -ConfiguredPath $configuredMmproj
    }
    return $Model
}

function Join-ProcessArguments {
    param([object[]]$ArgumentList)

    ($ArgumentList | ForEach-Object {
        $argument = [string]$_
        if ($argument -eq "") {
            '""'
        } elseif ($argument -match '[\s"]') {
            '"' + $argument.Replace('"', '\"') + '"'
        } else {
            $argument
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

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $FilePath
    $startInfo.Arguments = Join-ProcessArguments -ArgumentList $ArgumentList
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo

    $outWriter = [System.IO.StreamWriter]::new($StdOutLog, $true, [System.Text.UTF8Encoding]::new($false))
    $errWriter = [System.IO.StreamWriter]::new($StdErrLog, $true, [System.Text.UTF8Encoding]::new($false))
    Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -MessageData $outWriter -Action {
        if ($null -ne $EventArgs.Data) {
            $Event.MessageData.WriteLine($EventArgs.Data)
            $Event.MessageData.Flush()
        }
    } | Out-Null
    Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -MessageData $errWriter -Action {
        if ($null -ne $EventArgs.Data) {
            $Event.MessageData.WriteLine($EventArgs.Data)
            $Event.MessageData.Flush()
        }
    } | Out-Null

    [void]$process.Start()
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()
    return $process
}
