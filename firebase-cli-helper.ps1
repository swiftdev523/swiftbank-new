# Firebase CLI Helper Script for SwiftBank Project (PowerShell)
# Usage: .\firebase-cli-helper.ps1 [command]

param(
    [string]$Command = "help"
)

Write-Host "🔥 Firebase CLI Helper for SwiftBank Project" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

switch ($Command) {
    "status" {
        Write-Host "📊 Project Status:" -ForegroundColor Green
        firebase use
        Write-Host ""
        Write-Host "📈 Firestore Indexes:" -ForegroundColor Green
        firebase firestore:indexes | Select-Object -First 20
    }
    
    "deploy-indexes" {
        Write-Host "🚀 Deploying Firestore Indexes..." -ForegroundColor Yellow
        firebase deploy --only firestore:indexes
    }
    
    "deploy-rules" {
        Write-Host "🔒 Deploying Firestore Rules..." -ForegroundColor Yellow
        firebase deploy --only firestore:rules
    }
    
    "deploy-all" {
        Write-Host "🚀 Full Deployment..." -ForegroundColor Yellow
        firebase deploy
    }
    
    "console" {
        Write-Host "🌐 Opening Firebase Console..." -ForegroundColor Blue
        $url = "https://console.firebase.google.com/project/swiftbank-2811b/"
        Write-Host "URL: $url" -ForegroundColor Cyan
        Start-Process $url
    }
    
    "firestore" {
        Write-Host "🗄️ Opening Firestore Console..." -ForegroundColor Blue
        $url = "https://console.firebase.google.com/project/swiftbank-2811b/firestore"
        Write-Host "URL: $url" -ForegroundColor Cyan
        Start-Process $url
    }
    
    "auth" {
        Write-Host "👤 Authentication Console..." -ForegroundColor Blue
        $url = "https://console.firebase.google.com/project/swiftbank-2811b/authentication"
        Write-Host "URL: $url" -ForegroundColor Cyan
        Start-Process $url
    }
    
    "transactions" {
        Write-Host "💳 Checking Transactions Collection..." -ForegroundColor Magenta
        Write-Host "This would typically show transaction data, but requires custom queries" -ForegroundColor Gray
        Write-Host "Consider using the Firebase console or creating a custom query script" -ForegroundColor Gray
    }
    
    "projects" {
        Write-Host "📋 Available Firebase Projects:" -ForegroundColor Green
        firebase projects:list
    }
    
    "help" {
        Write-Host "Available commands:" -ForegroundColor Green
        Write-Host "  status          - Show current project status and indexes" -ForegroundColor White
        Write-Host "  deploy-indexes  - Deploy Firestore indexes" -ForegroundColor White
        Write-Host "  deploy-rules    - Deploy Firestore security rules" -ForegroundColor White
        Write-Host "  deploy-all      - Full project deployment" -ForegroundColor White
        Write-Host "  console         - Open Firebase console in browser" -ForegroundColor White
        Write-Host "  firestore       - Open Firestore console in browser" -ForegroundColor White
        Write-Host "  auth            - Open Authentication console in browser" -ForegroundColor White
        Write-Host "  transactions    - Info about transactions collection" -ForegroundColor White
        Write-Host "  projects        - List all Firebase projects" -ForegroundColor White
        Write-Host ""
        Write-Host "Example usage:" -ForegroundColor Yellow
        Write-Host "  .\firebase-cli-helper.ps1 status" -ForegroundColor Gray
        Write-Host "  .\firebase-cli-helper.ps1 deploy-indexes" -ForegroundColor Gray
        Write-Host "  .\firebase-cli-helper.ps1 console" -ForegroundColor Gray
    }
    
    default {
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Write-Host "Run '.\firebase-cli-helper.ps1 help' for available commands" -ForegroundColor Yellow
    }
}