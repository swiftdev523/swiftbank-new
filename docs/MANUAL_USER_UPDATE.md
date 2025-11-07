# Manual User Data Update Instructions

Since we can't update the user data programmatically due to authentication restrictions, please follow these steps to manually update the user data in Firebase Console:

## Step 1: Access Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: `clbank-14206`
3. Navigate to Firestore Database
4. Go to the "users" collection

## Step 2: Update User Document

Find the user document with ID: `mYFGjRgsARS0AheCdYUkzhMRLkk2` (John Boseman)

Add these fields to the document:

```
firstName: "John"
lastName: "Boseman"
```

## Step 3: Verify the Update

After adding these fields, the user profile should display:

- Account cards will show "John Boseman" instead of "Account Holder"
- Profile page will show separate First Name and Last Name fields
- Header will display "John Boseman" properly

## Current Code Changes Made:

1. ✅ Updated AccountCard.jsx to use firstName + lastName
2. ✅ Updated ProfilePage.jsx to use separate firstName/lastName fields
3. ✅ Updated AuthContext.jsx to create firstName/lastName for new users
4. ✅ DashboardLayout.jsx already handles firstName + lastName display

## Alternative: Update via Firebase CLI with Authentication

If you have Firebase CLI admin access, you can run:

```bash
firebase login
node update-user-names.js
```

This will programmatically add the firstName and lastName fields to the existing user.
