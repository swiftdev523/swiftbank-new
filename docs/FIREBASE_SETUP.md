# Firebase Integration Setup Guide

This guide will help you set up Firebase Authentication and Firestore for the Swift Bank application.

## Prerequisites

1. Node.js installed
2. Firebase CLI installed globally: `npm install -g firebase-tools`
3. A Google account for Firebase Console access

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "cl-bank-app")
4. Enable Google Analytics (optional)
5. Create the project

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" authentication
3. Optionally enable other providers as needed

## Step 3: Create Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (we'll deploy rules later)
3. Select a location (choose closest to your users)

## Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app icon
4. Register your app with a nickname
5. Copy the config object

## Step 5: Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 6: Firebase CLI Setup

1. Login to Firebase CLI:

   ```bash
   npm run firebase:login
   ```

2. Initialize Firebase in your project:

   ```bash
   npm run firebase:init
   ```

   - Select "Firestore" and "Hosting"
   - Choose your existing project
   - Accept default settings

3. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

## Step 7: Deploy Firestore Rules

Deploy the security rules to your Firebase project:

```bash
npm run firebase:deploy:rules
```

## Step 8: Development with Emulators (Optional)

For local development, you can use Firebase emulators:

```bash
npm run firebase:emulators
```

This will start:

- Firestore emulator on port 8080
- Auth emulator on port 9099
- Hosting emulator on port 5000
- Firebase UI on port 4000

## Step 9: Initialize Test Data

Create an admin user in Firebase Console:

1. Go to Authentication → Users
2. Add user manually with:
   - Email: admin@clbank.com
   - Password: (your choice)
3. Note the UID

Then in Firestore, create a document in the `users` collection:

```javascript
// Document ID: {the-uid-from-auth}
{
  username: "admin",
  email: "admin@clbank.com",
  role: "admin",
  permissions: ["*"],
  profile: {
    firstName: "Admin",
    lastName: "User"
  },
  createdAt: "2025-09-23T00:00:00.000Z",
  emailVerified: true
}
```

## Available Scripts

- `npm run firebase:emulators` - Start Firebase emulators
- `npm run firebase:deploy` - Build and deploy to Firebase hosting
- `npm run firebase:deploy:hosting` - Deploy only hosting
- `npm run firebase:deploy:rules` - Deploy only Firestore rules
- `npm run firebase:login` - Login to Firebase CLI
- `npm run firebase:init` - Initialize Firebase project

## Security Rules Overview

The included Firestore rules provide:

- **Users**: Can read/update own data, admins can manage all users
- **Accounts**: Users can read own accounts, managers/admins can manage all
- **Transactions**: Users can create/read own transactions, managers can approve
- **Messages**: Public messages for all, admin-managed notifications
- **Role-based permissions**: Admin, Manager, Customer roles with specific permissions

## Troubleshooting

### Common Issues

1. **"Firebase not initialized"**: Check your environment variables
2. **"Permission denied"**: Verify Firestore rules are deployed
3. **"User not found"**: Make sure user document exists in Firestore
4. **Emulator connection issues**: Check if emulators are running on correct ports

### Debug Mode

Add to your `.env` for detailed logging:

```bash
VITE_NODE_ENV=development
```

### Firebase Console Debugging

- Check Authentication tab for user sign-ins
- Check Firestore tab for data structure
- Check Rules tab for rule evaluation logs

## Production Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   npm run firebase:deploy
   ```

Your application will be available at: `https://your-project-id.web.app`

## Next Steps

1. Set up custom domain (optional)
2. Configure Firebase Functions for advanced backend logic
3. Set up Firebase Analytics
4. Implement push notifications
5. Add additional security measures

## Support

If you encounter issues:

1. Check Firebase Console logs
2. Verify environment variables
3. Check browser console for errors
4. Ensure all Firebase services are enabled in console
