function Resolve-ModelDraftPath {
    param(
        [string]$ModelPath,
        [string]$DraftFile = "",
        [string]$AutoDiscoveryFile = ""
    )

    if (-not $ModelPath) { return $null }
    $dir = Split-Path -Parent $ModelPath
    $candidates = @()
    if ($DraftFile) {
        $candidates += Join-Path $dir ("MTP\{0}" -f $DraftFile)
        $candidates += Join-Path $dir $DraftFile
    }
    if ($AutoDiscoveryFile) {
        $candidates += Join-Path $dir $AutoDiscoveryFile
    }
    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) {
            return $candidate
        }
    }

    if ($ModelPath -match 'models--(.+?)\\snapshots\\') {
        $hubRepo = Join-Path (Join-Path $env:USERPROFILE ".cache\huggingface\hub") ("models--{0}" -f $Matches[1])
        $snapshotRoot = Join-Path $hubRepo "snapshots"
        if (Test-Path -LiteralPath $snapshotRoot) {
            $names = @()
            if ($DraftFile) { $names += $DraftFile }
            if ($AutoDiscoveryFile) { $names += $AutoDiscoveryFile }
            foreach ($name in $names) {
                $hit = Get-ChildItem -Path $snapshotRoot -Recurse -Filter $name -File -ErrorAction SilentlyContinue |
                    Sort-Object LastWriteTime -Descending |
                    Select-Object -First 1
                if ($hit) { return $hit.FullName }
            }
        }
    }
    return $null
}

function Add-SpeculativeServerArgs {
    param(
        [hashtable]$Model,
        [object[]]$ServerArgs,
        [switch]$DisableMtp
    )

    if (-not ($Model.ContainsKey("Mtp") -and $Model.Mtp)) {
        return $ServerArgs
    }
    if ($DisableMtp) {
        return $ServerArgs + @("--spec-type", "none")
    }

    $nMin = if ($Model.ContainsKey("SpecDraftNMin") -and $null -ne $Model.SpecDraftNMin) { "$($Model.SpecDraftNMin)" } else { "1" }
    $nMax = if ($Model.ContainsKey("SpecDraftNMax") -and $null -ne $Model.SpecDraftNMax) { "$($Model.SpecDraftNMax)" } else { "2" }
    $args = $ServerArgs + @("--spec-type", "draft-mtp", "--spec-draft-n-min", $nMin, "--spec-draft-n-max", $nMax)

    $draftPath = $null
    if ($Model.ContainsKey("ModelDraft") -and $Model.ModelDraft) {
        $draftPath = [string]$Model.ModelDraft
    } elseif ($Model.ContainsKey("ModelDraftFile") -and $Model.ModelDraftFile) {
        $auto = if ($Model.ContainsKey("MtpAutoDiscoveryFile")) { [string]$Model.MtpAutoDiscoveryFile } else { "" }
        $draftPath = Resolve-ModelDraftPath -ModelPath $Model.Model -DraftFile $Model.ModelDraftFile -AutoDiscoveryFile $auto
    }
    $needsDraft = ($Model.ContainsKey("ModelDraft") -and $Model.ModelDraft) -or
        ($Model.ContainsKey("ModelDraftFile") -and $Model.ModelDraftFile) -or
        ($Model.ContainsKey("MtpAutoDiscoveryFile") -and $Model.MtpAutoDiscoveryFile)
    if ($needsDraft -and -not $draftPath) {
        $label = if ($Model.ContainsKey("Name") -and $Model.Name) { $Model.Name } else { "model" }
        throw "ModelDraft not found for $label. Run Download-Gemma4-QAT-MTP.ps1 or set ModelDraft."
    }
    if ($draftPath) {
        $args += @("--model-draft", $draftPath)
    }
    return $args
}

function Get-FlashAttnValue {
    param([hashtable]$Model)

    if ($Model.ContainsKey("FlashAttn") -and $null -ne $Model.FlashAttn -and "$($Model.FlashAttn)" -ne "") {
        return "$($Model.FlashAttn)"
    }
    return "on"
}

function Get-CacheTypeValues {
    param([hashtable]$Model)

    $cacheK = if ($Model.ContainsKey("CacheTypeK") -and $null -ne $Model.CacheTypeK -and "$($Model.CacheTypeK)" -ne "") {
        [string]$Model.CacheTypeK
    } else {
        "q8_0"
    }
    $cacheV = if ($Model.ContainsKey("CacheTypeV") -and $null -ne $Model.CacheTypeV -and "$($Model.CacheTypeV)" -ne "") {
        [string]$Model.CacheTypeV
    } else {
        "q8_0"
    }
    if ((Get-FlashAttnValue -Model $Model) -eq "off") {
        if ($cacheK -eq "q8_0") { $cacheK = "f16" }
        if ($cacheV -eq "q8_0") { $cacheV = "f16" }
    }
    return @{ K = $cacheK; V = $cacheV }
}
