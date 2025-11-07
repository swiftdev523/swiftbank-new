#!/bin/bash
# Firebase CLI Helper Script for SwiftBank Project
# Usage: ./firebase-cli-helper.sh [command]

echo "🔥 Firebase CLI Helper for SwiftBank Project"
echo "============================================="
echo ""

case "$1" in
  "status")
    echo "📊 Project Status:"
    firebase use
    echo ""
    echo "📈 Firestore Indexes:"
    firebase firestore:indexes
    ;;
  
  "deploy-indexes")
    echo "🚀 Deploying Firestore Indexes..."
    firebase deploy --only firestore:indexes
    ;;
  
  "deploy-rules")
    echo "🔒 Deploying Firestore Rules..."
    firebase deploy --only firestore:rules
    ;;
  
  "deploy-all")
    echo "🚀 Full Deployment..."
    firebase deploy
    ;;
  
  "console")
    echo "🌐 Opening Firebase Console..."
    echo "URL: https://console.firebase.google.com/project/swiftbank-2811b/"
    ;;
  
  "firestore")
    echo "🗄️ Opening Firestore Console..."
    echo "URL: https://console.firebase.google.com/project/swiftbank-2811b/firestore"
    ;;
  
  "transactions")
    echo "💳 Checking Transactions Collection..."
    echo "This would typically show transaction data, but requires custom queries"
    echo "Consider using the Firebase console or creating a custom query script"
    ;;
  
  "help"|"")
    echo "Available commands:"
    echo "  status          - Show current project status and indexes"
    echo "  deploy-indexes  - Deploy Firestore indexes"
    echo "  deploy-rules    - Deploy Firestore security rules"
    echo "  deploy-all      - Full project deployment"
    echo "  console         - Show Firebase console URL"
    echo "  firestore       - Show Firestore console URL"
    echo "  transactions    - Info about transactions collection"
    echo ""
    echo "Example usage:"
    echo "  ./firebase-cli-helper.sh status"
    echo "  ./firebase-cli-helper.sh deploy-indexes"
    ;;
  
  *)
    echo "❌ Unknown command: $1"
    echo "Run './firebase-cli-helper.sh help' for available commands"
    ;;
esac