# Production Deployment Script for SwiftBank (PowerShell)
Write-Host "🚀 Starting SwiftBank Production Deployment..." -ForegroundColor Green

# Step 1: Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
npm run clean

# Step 2: Install/update dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci --only=production

# Step 3: Run type checking
Write-Host "🔍 Running type checks..." -ForegroundColor Yellow
npm run type-check

# Step 4: Run linting
Write-Host "📏 Running linter..." -ForegroundColor Yellow
npm run lint

# Step 5: Build for production
Write-Host "🏗️ Building for production..." -ForegroundColor Yellow
npm run build:prod

# Step 6: Deploy Firebase rules (if needed)
Write-Host "🔐 Deploying Firestore rules..." -ForegroundColor Yellow
npm run firebase:deploy:rules

# Step 7: Deploy to Firebase Hosting
Write-Host "🌐 Deploying to Firebase Hosting..." -ForegroundColor Yellow
npm run firebase:deploy:hosting

Write-Host "✅ SwiftBank deployed successfully!" -ForegroundColor Green
Write-Host "🌍 Live at: https://swiftbank-2811b.firebaseapp.com" -ForegroundColor Cyan