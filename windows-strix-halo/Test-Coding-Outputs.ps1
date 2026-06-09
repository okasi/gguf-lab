$ErrorActionPreference = "Continue"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root "logs"
$ResultPath = Join-Path $LogDir "coding-test-judgement.csv"
$BundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if (Test-Path -LiteralPath $BundledPython) {
    $Python = $BundledPython
} else {
    $Python = (Get-Command python -ErrorAction Stop).Source
}

$Tests = @(
    @{
        Name = "basic_unsorted_queries"
        Input = "3 5`n1 5`n2 2`n-3 1`n1 2 5 -3 0`n"
        Expected = "2 2 1 1 1"
    },
    @{
        Name = "endpoints_and_duplicates"
        Input = "4 6`n1 3`n3 3`n3 5`n-1 3`n3 4 0 6 3 -1`n"
        Expected = "4 1 1 0 4 1"
    },
    @{
        Name = "negative_and_order"
        Input = "3 6`n-10 -5`n-7 2`n0 0`n-6 -8 0 2 3 -10`n"
        Expected = "2 1 2 1 0 1"
    },
    @{
        Name = "all_same_query"
        Input = "3 4`n5 5`n1 10`n5 7`n5 5 6 11`n"
        Expected = "3 3 2 0"
    }
)

function Get-Code {
    param([string]$Text)
    $match = [regex]::Match($Text, '(?s)```(?:python)?\s*(.*?)```')
    if ($match.Success) {
        return $match.Groups[1].Value.Trim()
    }
    return $Text.Trim()
}

$Rows = @()
$answers = Import-Csv (Join-Path $LogDir "coding-test-results.csv")

foreach ($answer in $answers) {
    $raw = Get-Content -LiteralPath $answer.Answer -Raw
    $code = Get-Code $raw
    $safe = (($answer.Model + "-coding-test") -replace "[^A-Za-z0-9._-]", "_")
    $codePath = Join-Path $LogDir ("coding-$safe.extracted.py")
    Set-Content -LiteralPath $codePath -Value $code -Encoding utf8

    $passed = 0
    $notes = @()
    if ([string]::IsNullOrWhiteSpace($code)) {
        $notes += "no visible code"
    } else {
        foreach ($test in $Tests) {
            $inputPath = Join-Path $LogDir ("coding-$safe-$($test.Name).in")
            Set-Content -LiteralPath $inputPath -Value $test.Input -NoNewline -Encoding ascii
            $output = ""
            $exit = 0
            try {
                $cmd = "`"$Python`" `"$codePath`" < `"$inputPath`""
                $output = & cmd.exe /c $cmd 2>&1
                $exit = $LASTEXITCODE
            } catch {
                $output = $_.Exception.Message
                $exit = 1
            }
            $normalized = (($output | Out-String).Trim() -replace "\s+", " ")
            if ($exit -eq 0 -and $normalized -eq $test.Expected) {
                $passed += 1
            } else {
                $notes += "$($test.Name): expected '$($test.Expected)', got '$normalized'"
            }
        }
    }

    $Rows += [pscustomobject]@{
        Model = $answer.Model
        TestsPassed = $passed
        TestsTotal = $Tests.Count
        CodePath = $codePath
        Notes = ($notes -join " | ")
    }
}

$Rows | Export-Csv -NoTypeInformation -LiteralPath $ResultPath
$Rows | Format-Table -AutoSize -Wrap
Write-Host "Judgement written to $ResultPath"
