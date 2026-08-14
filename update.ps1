# Data Management System - One-click update script (Windows PowerShell)
# Usage:
#   .\update.ps1           Update code and restart service
#   .\update.ps1 -NoRestart  Only update code, keep service running
param(
    [switch]$NoRestart
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Data Management System - Update"
Write-Host "=========================================="

# 0. Locate git (may not be in PATH)
$gitCmd = "git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $candidates = @(
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files (x86)\Git\bin\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
    )
    $gitPath = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $gitPath) {
        Write-Host "ERROR: git not found. Please install Git first." -ForegroundColor Red
        exit 1
    }
    $gitCmd = $gitPath
}

# 1. Check remote repo
Write-Host "[1/4] Checking git remote..." -ForegroundColor Green
& $gitCmd remote get-url origin
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: remote origin not configured." -ForegroundColor Red
    exit 1
}

# 2. Stash local changes to avoid pull conflict
Write-Host "[2/4] Checking local changes..." -ForegroundColor Green
$porcelain = @(& $gitCmd status --porcelain)
$hasLocalChanges = $porcelain.Count -gt 0
if ($hasLocalChanges) {
    Write-Host "Local changes found, stashing..." -ForegroundColor Yellow
    & $gitCmd stash push -u -m "auto-stash before update"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Nothing to stash, continuing..." -ForegroundColor Yellow
        $hasLocalChanges = $false
    }
}

# 3. git pull
Write-Host "[3/4] Pulling latest code from GitHub..." -ForegroundColor Green
& $gitCmd pull origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git pull failed." -ForegroundColor Red
    exit 1
}

# 4. Restore local changes
if ($hasLocalChanges) {
    Write-Host "Restoring stashed changes..." -ForegroundColor Green
    & $gitCmd stash pop
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: conflict while restoring stash, run 'git stash pop' manually." -ForegroundColor Yellow
    }
}

# 5. Restart service
if ($NoRestart) {
    Write-Host "Code updated. Service NOT restarted." -ForegroundColor Green
    exit 0
}

Write-Host "[4/4] Restarting service..." -ForegroundColor Green

# Stop old service listening on port 5000
$listener = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    foreach ($conn in $listener) {
        Write-Host "Stopping old service PID $($conn.OwningProcess)..." -ForegroundColor Yellow
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Start new service in background
Set-Location "$ProjectRoot/server"
Start-Process -WindowStyle Hidden python -ArgumentList "main.py" -RedirectStandardOutput "$ProjectRoot/uvicorn.log" -RedirectStandardError "$ProjectRoot/uvicorn_err.log"
Start-Sleep -Seconds 4

# Verify service
$resp = 0
try {
    $resp = (Invoke-WebRequest -Uri "http://127.0.0.1:5000/" -UseBasicParsing -TimeoutSec 5).StatusCode
} catch {
    $resp = 0
}
if ($resp -eq 200) {
    Write-Host "Service started: http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "WARNING: service may not have started. Check $ProjectRoot/uvicorn_err.log" -ForegroundColor Yellow
}
