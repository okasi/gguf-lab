function Remove-ReasoningServerArgs {
    param([object[]]$ArgumentList)

    if ($null -eq $ArgumentList -or $ArgumentList.Count -eq 0) {
        return @()
    }

    $filtered = @()
    $skipNext = $false
    foreach ($arg in $ArgumentList) {
        if ($skipNext) {
            $skipNext = $false
            continue
        }
        $text = [string]$arg
        if ($text -eq "--reasoning") {
            $skipNext = $true
            continue
        }
        if ($text -in @("--reasoning-format", "--reasoning-budget", "--chat-template-kwargs")) {
            $skipNext = $true
            continue
        }
        $filtered += $arg
    }
    return $filtered
}

function Add-ReasoningServerArgs {
    param(
        [object[]]$ServerArgs,
        [ValidateSet("auto", "off")]
        [string]$Reasoning = "auto",
        [string]$ModelName = ""
    )

    $args = @(Remove-ReasoningServerArgs -ArgumentList $ServerArgs)
    if ($Reasoning -eq "off") {
        $args += @(
            "--reasoning-format", "none",
            "--reasoning-budget", "-1",
            "--chat-template-kwargs", '{"enable_thinking":false,"preserve_thinking":false}'
        )
    }
    if ($args -notcontains "--reasoning") {
        $args += @("--reasoning", $Reasoning)
    }
    return $args
}

function Get-ReadmeAlias {
    param(
        $Model,
        [string]$AliasSuffix = ""
    )

    $alias = [string]$Model.Alias
    if ($AliasSuffix) {
        $alias = "$alias$AliasSuffix"
    }
    return $alias
}
