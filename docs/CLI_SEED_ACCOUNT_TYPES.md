# Account Types CLI Seeding Guide

This guide explains how to seed the `accountTypes` collection in Firestore with the three required account types: Primary, Savings, and Current accounts.

## Prerequisites

- Node.js installed
- Firebase project access (`swiftbank-2811b`)
- Firebase Admin SDK authentication configured
- Firebase CLI tools installed

## Authentication Setup

You need to configure Firebase Admin SDK authentication. Choose one of these options:

### Option 1: Application Default Credentials (ADC) - Recommended

1. **Install Google Cloud CLI:**

   ```powershell
   # Download and install from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with your Google account:**

   ```powershell
   gcloud auth application-default login
   ```

3. **Set your project:**
   ```powershell
   gcloud config set project swiftbank-2811b
   ```

### Option 2: Service Account Key File

1. **Generate a service account key:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/swiftbank-2811b/settings/serviceaccounts/adminsdk)
   - Click "Generate new private key"
   - Save the JSON file securely

2. **Set environment variable:**

   ```powershell
   # PowerShell
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\your\service-account-key.json"

   # Or add to your PowerShell profile for persistence
   Add-Content $PROFILE '$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\your\service-account-key.json"'
   ```

## Available Scripts

### Seed Account Types

```powershell
npm run seed:accountTypes
```

**What it does:**

- Creates/updates exactly 3 account types: Primary, Savings, Current
- Deletes any extra account types that shouldn't exist
- Uses comprehensive data structure with all editable fields
- Safe upsert operation (won't overwrite if you don't want it to)

**Account Types Created:**

1. **Primary Account (`primary`)**
   - Default account for customers
   - Current balance: $15,750.50
   - No monthly fees
   - Full banking features

2. **Savings Account (`savings`)**
   - High-yield savings with 2.5% interest rate
   - Current balance: $5,000.00
   - Minimum balance: $100
   - Limited withdrawal features

3. **Current Account (`current`)**
   - Premium account with enhanced features
   - Current balance: $8,250.75
   - Monthly fee: $15
   - Requires approval for opening

### Verify Account Types

```powershell
npm run verify:accountTypes
```

**What it does:**

- Counts total documents in accountTypes collection
- Validates that exactly 3 documents exist
- Checks that IDs are: primary, savings, current
- Validates data structure and required fields
- Provides detailed report of findings

## Data Structure

Each account type includes these editable fields for admin management:

```javascript
{
  // Basic Info
  id: 'primary|savings|current',
  category: 'primary|savings|current',
  name: 'Account Type Name',
  displayName: 'Display Name for UI',
  description: 'Detailed description',

  // Account Details
  accountNumberPrefix: '****',
  accountNumberSuffix: '1234',
  routingNumber: 'Routing number or "Not provided"',

  // Financial Settings
  minimumBalance: 0,           // Editable by admin
  currentBalance: 15750.5,     // Editable by admin
  currency: 'USD',
  interestRate: 0.01,          // Editable by admin
  monthlyFee: 0,               // Editable by admin
  overdraftLimit: 500,         // Editable by admin
  dailyWithdrawalLimit: 1000,  // Editable by admin

  // Features & Benefits
  features: [...],             // Array of feature strings
  benefits: [...],             // Array of benefit strings
  eligibility: [...],          // Array of eligibility requirements

  // Status & Settings
  status: 'active|inactive',   // Editable by admin
  priority: 1,                 // Display order
  isDefault: true|false,       // Is this the default account type
  canClose: true|false,        // Can customers close this account
  requiresApproval: true|false, // Requires admin approval to open

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Usage Workflow

1. **Setup Authentication:**

   ```powershell
   # Choose Option 1 (ADC) or Option 2 (Service Account)
   gcloud auth application-default login
   ```

2. **Seed the Account Types:**

   ```powershell
   npm run seed:accountTypes
   ```

   Expected output:

   ```
   🌱 Starting account types seeding process...
   📋 Found X existing account type documents
   📝 Upserting account type: Primary Account (primary)
   ✅ Successfully upserted: Primary Account
   📝 Upserting account type: Savings Account (savings)
   ✅ Successfully upserted: Savings Account
   📝 Upserting account type: Current Account (current)
   ✅ Successfully upserted: Current Account
   🗑️ Deleting X extra account type(s): ...
   ✅ Successfully deleted extra account types
   🎉 Account types seeding completed successfully!
   ```

3. **Verify the Results:**

   ```powershell
   npm run verify:accountTypes
   ```

   Expected output:

   ```
   🔍 Verifying account types in Firestore...
   📊 Total documents found: 3

   📋 Account Types Summary:
   ========================
   1. Current Account (ID: current)
   2. Primary Account (ID: primary)
   3. Savings Account (ID: savings)

   🎯 Verification Results:
   ========================
   ✅ SUCCESS: All 3 expected account types found
   ```

## Troubleshooting

### Authentication Issues

```
Error: Could not load the default credentials
```

**Solution:** Make sure you've completed the authentication setup (ADC or Service Account key)

### Permission Issues

```
Error: 7 PERMISSION_DENIED: Missing or insufficient permissions
```

**Solution:**

- Ensure your account has Firestore permissions
- Check that you're using the correct project ID
- Verify your service account has the correct roles

### Network Issues

```
Error: 14 UNAVAILABLE: Connection failed
```

**Solution:**

- Check your internet connection
- Verify firewall settings allow Google Cloud connections
- Try running with `--verbose` flag for more details

## Admin Interface Integration

After seeding, the account types will be available for full CRUD operations through the admin interface, allowing admins to modify:

- Account names and descriptions
- Financial settings (balances, fees, limits)
- Features and benefits
- Status and availability
- All other properties as needed

The admin interface is accessible through the banking application's admin dashboard under "Account Types Management".

## Security Notes

- Account types are read-only for customers
- Only admins can create, modify, or delete account types
- Changes are logged in the audit trail
- Firestore rules enforce proper access control

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Verify your Firebase project access and permissions
3. Review the console output for specific error messages
4. Contact the development team with error details
