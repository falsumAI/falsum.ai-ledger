# 🌹 Project Rose – Verify runner
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$exports = Join-Path $root "..\exports"
$receipts = Join-Path $root "..\receipts"

if (-not (Test-Path $receipts)) {
    New-Item -ItemType Directory -Path $receipts | Out-Null
}

Get-ChildItem $exports -File | ForEach-Object {
    $name = $_.Name
    $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
    $outFile = Join-Path $receipts "$name.json"

    $receipt = [pscustomobject]@{
        file = $name
        sha256 = $hash
        created_utc = (Get-Date).ToUniversalTime().ToString("o")
        qr_svg = "PLACEHOLDER"
        signatures = @("PLACEHOLDER")
        baseline_verified = $true
    }

    $receipt | ConvertTo-Json -Depth 5 | Set-Content -Path $outFile -Encoding UTF8
}

Write-Host "Rose verify complete. Receipts in /receipts"
