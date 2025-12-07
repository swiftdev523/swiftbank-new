#!/bin/bash

# Production Deployment Script for SwiftBank
echo "🚀 Starting SwiftBank Production Deployment..."

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Step 2: Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Step 3: Run type checking
echo "🔍 Running type checks..."
npm run type-check

# Step 4: Run linting
echo "📏 Running linter..."
npm run lint

# Step 5: Build for production
echo "🏗️ Building for production..."
npm run build:prod

# Step 6: Deploy Firebase rules (if needed)
echo "🔐 Deploying Firestore rules..."
npm run firebase:deploy:rules

# Step 7: Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
npm run firebase:deploy:hosting

echo "✅ SwiftBank deployed successfully!"
echo "🌍 Live at: https://swiftbank-2811b.firebaseapp.com"