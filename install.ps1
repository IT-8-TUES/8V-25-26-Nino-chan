$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

# --- Backend: Python virtual environment + pip ---
if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv .venv
}

& .\.venv\Scripts\Activate.ps1

Write-Host "Installing backend dependencies..."
python -m pip install --upgrade pip
pip install -r backend-requirements.txt

# --- Frontend: npm ---
Write-Host "Installing frontend dependencies..."
$packages = Get-Content frontend-requirements.txt | ForEach-Object {
    ($_ -split '#')[0].Trim()
} | Where-Object { $_ -ne "" }

if ($packages.Count -gt 0) {
    npm install @packages
} else {
    Write-Host "No frontend packages listed."
}

Write-Host "Done."
