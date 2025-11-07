# Manual Account Types Setup Instructions

Since we're unable to run the automated seeding script due to authentication requirements, you can manually create the account types through the Firebase Console or wait for proper authentication setup.

## Option 1: Manual Creation via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/swiftbank-2811b/firestore/data)
2. Navigate to the `accountTypes` collection
3. Delete any existing documents that aren't Primary, Savings, or Current
4. Create/update the three required account types with the following data:

### Primary Account Type (Document ID: `primary`)

```json
{
  "id": "primary",
  "category": "primary",
  "name": "Primary Account",
  "displayName": "Primary Checking Account",
  "description": "Primary checking account with comprehensive banking features and unlimited access",
  "accountNumberPrefix": "****",
  "accountNumberSuffix": "7958",
  "routingNumber": "Not provided",
  "minimumBalance": 0,
  "currentBalance": 15750.5,
  "currency": "USD",
  "interestRate": 0.01,
  "monthlyFee": 0,
  "overdraftLimit": 500,
  "dailyWithdrawalLimit": 1000,
  "features": [
    "Online Banking",
    "Mobile Banking",
    "Debit Card",
    "ATM Access",
    "Direct Deposit",
    "Bill Pay",
    "Mobile Check Deposit",
    "Wire Transfers"
  ],
  "benefits": [
    "No monthly maintenance fee",
    "Free ATM withdrawals",
    "Mobile banking app",
    "Online bill pay",
    "24/7 customer support"
  ],
  "eligibility": [
    "Must be 18 years or older",
    "Valid government-issued ID required",
    "Social Security Number required"
  ],
  "status": "active",
  "priority": 1,
  "isDefault": true,
  "canClose": false,
  "requiresApproval": false,
  "createdAt": "2025-09-26T10:00:00Z",
  "updatedAt": "2025-09-26T10:00:00Z"
}
```

### Savings Account Type (Document ID: `savings`)

```json
{
  "id": "savings",
  "category": "savings",
  "name": "Savings Account",
  "displayName": "High-Yield Savings Account",
  "description": "Earn competitive interest rates on your savings with easy access to your funds",
  "accountNumberPrefix": "****",
  "accountNumberSuffix": "1120",
  "routingNumber": "Not provided",
  "minimumBalance": 100,
  "currentBalance": 5000,
  "currency": "USD",
  "interestRate": 2.5,
  "monthlyFee": 0,
  "overdraftLimit": 0,
  "dailyWithdrawalLimit": 500,
  "features": [
    "Online Banking",
    "Mobile Banking",
    "ATM Access",
    "Direct Deposit",
    "High Interest Rate",
    "Automatic Transfers"
  ],
  "benefits": [
    "Competitive interest rates",
    "No minimum balance fees",
    "FDIC insured up to $250,000",
    "Easy online transfers",
    "Monthly statements"
  ],
  "eligibility": [
    "Must be 18 years or older",
    "Valid government-issued ID required",
    "Minimum opening deposit of $25"
  ],
  "status": "active",
  "priority": 2,
  "isDefault": false,
  "canClose": true,
  "requiresApproval": false,
  "createdAt": "2025-09-26T10:00:00Z",
  "updatedAt": "2025-09-26T10:00:00Z"
}
```

### Current Account Type (Document ID: `current`)

```json
{
  "id": "current",
  "category": "current",
  "name": "Current Account",
  "displayName": "Premium Current Account",
  "description": "Premium banking experience with enhanced features and personalized service",
  "accountNumberPrefix": "****",
  "accountNumberSuffix": "5314",
  "routingNumber": "Not provided",
  "minimumBalance": 1000,
  "currentBalance": 8250.75,
  "currency": "USD",
  "interestRate": 0.75,
  "monthlyFee": 15,
  "overdraftLimit": 1000,
  "dailyWithdrawalLimit": 2500,
  "features": [
    "Online Banking",
    "Mobile Banking",
    "Premium Debit Card",
    "ATM Access",
    "Direct Deposit",
    "Premium Customer Support",
    "Investment Advisory",
    "Concierge Services"
  ],
  "benefits": [
    "Premium customer service",
    "Higher transaction limits",
    "Investment advisory services",
    "Exclusive banking offers",
    "Priority phone support",
    "Waived fees on select services"
  ],
  "eligibility": [
    "Must be 21 years or older",
    "Valid government-issued ID required",
    "Minimum opening deposit of $1,000",
    "Credit check may be required"
  ],
  "status": "active",
  "priority": 3,
  "isDefault": false,
  "canClose": true,
  "requiresApproval": true,
  "createdAt": "2025-09-26T10:00:00Z",
  "updatedAt": "2025-09-26T10:00:00Z"
}
```

## Option 2: Authentication Setup for Automated Scripts

To use the automated seeding scripts, you need to set up Google Application Default Credentials:

### Method 1: Using Google Cloud CLI (Recommended)

1. Install Google Cloud CLI from https://cloud.google.com/sdk/docs/install
2. Run: `gcloud auth application-default login`
3. Run: `gcloud config set project swiftbank-2811b`
4. Then run: `npm run seed:accountTypes`

### Method 2: Using Service Account Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=swiftbank-2811b)
2. Create a service account with Firestore permissions
3. Download the JSON key file
4. Set environment variable: `$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\service-account-key.json"`
5. Then run: `npm run seed:accountTypes`

## Admin Interface Usage

Once the account types are created (manually or via script), you can use the Account Type Manager in the admin dashboard to:

- Edit account names, descriptions, and display names
- Modify financial settings (balances, fees, interest rates, limits)
- Update account number prefixes and suffixes
- Change routing numbers
- Manage features, benefits, and eligibility requirements
- Set status (active/inactive) and priority
- Configure default account type settings
- Control whether accounts can be closed by customers
- Set approval requirements for new accounts

The admin interface provides full CRUD (Create, Read, Update, Delete) operations for all account type properties, allowing complete customization of what customers see on their dashboard.
