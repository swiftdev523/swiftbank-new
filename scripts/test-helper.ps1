Write-Host "🎯 SwiftBank - Quick Testing Helper" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

Write-Host "📊 CURRENT SYSTEM STATUS" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

# Check if dev server is running
$devServerRunning = Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object -First 1
if ($devServerRunning) {
    Write-Host "✅ Dev server is running" -ForegroundColor Green
} else {
    Write-Host "❌ Dev server not running - Run: npm run dev" -ForegroundColor Red
}

# Check if service account key exists
if (Test-Path "service-account-key.json") {
    Write-Host "✅ Service account key configured" -ForegroundColor Green
} else {
    Write-Host "❌ Service account key missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "👥 TEST ACCOUNTS" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray
Write-Host ""
Write-Host "1. CUSTOMER" -ForegroundColor Blue
Write-Host "   Email: kindestwavelover@gmail.com"
Write-Host "   Login: http://localhost:5173/login"
Write-Host "   Expected: Dashboard with 3 accounts ($44,001.25 total)"
Write-Host ""
Write-Host "2. ADMIN" -ForegroundColor Green
Write-Host "   Email: seconds@swiftbank.com"
Write-Host "   Login: http://localhost:5173/admin/login"
Write-Host "   Expected: Admin panel, only see 1 customer"
Write-Host ""
Write-Host "3. DEVELOPER" -ForegroundColor Yellow
Write-Host "   Email: developer@swiftbank.com"
Write-Host "   Login: http://localhost:5173/developer/login"
Write-Host "   Expected: Developer dashboard, full system access"
Write-Host ""

Write-Host "🔍 QUICK ACTIONS" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray
Write-Host "1. Open Application  - Press [1]"
Write-Host "2. Open Testing Guide - Press [2]"
Write-Host "3. Verify Permissions - Press [3]"
Write-Host "4. View Audit Report  - Press [4]"
Write-Host "5. Exit              - Press [Q]"
Write-Host ""

$choice = Read-Host "Select action"

switch ($choice) {
    "1" {
        Write-Host "`n🌐 Opening application..." -ForegroundColor Cyan
        Start-Process "http://localhost:5173"
    }
    "2" {
        Write-Host "`n📖 Opening testing guide..." -ForegroundColor Cyan
        if (Test-Path "MANUAL_TESTING_GUIDE.md") {
            Start-Process "MANUAL_TESTING_GUIDE.md"
        } else {
            Write-Host "❌ Testing guide not found" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "`n🔍 Running permissions verification..." -ForegroundColor Cyan
        node scripts/verify-permissions.cjs
    }
    "4" {
        Write-Host "`n📊 Opening audit report..." -ForegroundColor Cyan
        if (Test-Path "PERMISSIONS_AUDIT_COMPLETE.md") {
            Start-Process "PERMISSIONS_AUDIT_COMPLETE.md"
        } else {
            Write-Host "❌ Audit report not found" -ForegroundColor Red
        }
    }
    "Q" {
        Write-Host "`n👋 Goodbye!" -ForegroundColor Cyan
        exit
    }
    default {
        Write-Host "`n❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
