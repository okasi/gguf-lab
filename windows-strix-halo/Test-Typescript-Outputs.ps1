$ErrorActionPreference = "Continue"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root "logs"
$ResultPath = Join-Path $LogDir "typescript-test-judgement.csv"
$Node = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$Transpiler = Join-Path $Root "tools\ts-runner\transpile-ts.js"

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
    },
    @{
        Name = "single_interval_boundaries"
        Input = "1 5`n-2 2`n-3 -2 0 2 3`n"
        Expected = "0 1 1 1 0"
    },
    @{
        Name = "large_coordinates"
        Input = "3 5`n-1000000000 1000000000`n999999999 1000000000`n-1000000000 -999999999`n-1000000000 -999999999 0 999999999 1000000000`n"
        Expected = "2 2 1 2 2"
    },
    @{
        Name = "duplicate_intervals"
        Input = "5 5`n1 1`n1 1`n1 2`n2 2`n0 3`n1 2 0 3 4`n"
        Expected = "4 3 1 1 0"
    },
    @{
        Name = "queries_not_sorted"
        Input = "4 7`n0 10`n5 5`n-5 0`n8 12`n9 -5 5 11 0 7 13`n"
        Expected = "2 1 2 1 2 1 0"
    }
)

function Get-Code {
    param([string]$Text)
    $match = [regex]::Match($Text, '(?s)```(?:typescript|ts|javascript|js)?\s*(.*?)```')
    if ($match.Success) {
        return $match.Groups[1].Value.Trim()
    }
    return $Text.Trim()
}

$Rows = @()
$answers = Import-Csv (Join-Path $LogDir "typescript-test-results.csv")

foreach ($answer in $answers) {
    $raw = Get-Content -LiteralPath $answer.Answer -Raw
    $code = Get-Code $raw
    $safe = (($answer.Model + "-typescript-test") -replace "[^A-Za-z0-9._-]", "_")
    $tsPath = Join-Path $LogDir ("typescript-$safe.extracted.ts")
    $jsPath = Join-Path $LogDir ("typescript-$safe.extracted.js")
    Set-Content -LiteralPath $tsPath -Value $code -Encoding utf8

    $passed = 0
    $notes = @()
    if ([string]::IsNullOrWhiteSpace($code)) {
        $notes += "no visible TypeScript code"
    } else {
        $transpileOutput = & $Node $Transpiler $tsPath $jsPath 2>&1
        if (-not (Test-Path -LiteralPath $jsPath)) {
            $notes += "transpile failed: $($transpileOutput -join ' ')"
        } else {
            foreach ($test in $Tests) {
                $inputPath = Join-Path $LogDir ("typescript-$safe-$($test.Name).in")
                Set-Content -LiteralPath $inputPath -Value $test.Input -NoNewline -Encoding ascii
                $output = ""
                $exit = 0
                try {
                    $cmd = "`"$Node`" `"$jsPath`" < `"$inputPath`""
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
    }

    $Rows += [pscustomobject]@{
        Model = $answer.Model
        TestsPassed = $passed
        TestsTotal = $Tests.Count
        TypeScriptPath = $tsPath
        JavaScriptPath = $jsPath
        Notes = ($notes -join " | ")
    }
}

$Rows | Export-Csv -NoTypeInformation -LiteralPath $ResultPath
$Rows | Format-Table -AutoSize -Wrap
Write-Host "Judgement written to $ResultPath"
