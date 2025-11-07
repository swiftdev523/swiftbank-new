# Johnson Boseman Account Management CLI

This document provides comprehensive instructions for managing Johnson Boseman's three accounts using the Firebase CLI and custom Node.js scripts.

## Overview

The system manages exactly **three accounts** belonging to **Johnson Boseman**:

- **Primary Account** (ID: `johnson_primary`)
- **Savings Account** (ID: `johnson_savings`)
- **Checking Account** (ID: `johnson_checking`)

All account details are fully editable by administrators through CLI tools.

## Prerequisites

1. **Firebase CLI installed and authenticated**

   ```powershell
   npm install -g firebase-tools
   firebase login
   ```

2. **Firebase Project Access**
   - Project ID: `swiftbank-2811b`
   - Admin permissions required

3. **Authentication Setup** (Choose one method):

   **Method A: Application Default Credentials (Recommended)**

   ```powershell
   gcloud auth application-default login
   ```

   **Method B: Service Account Key**

   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="path\to\service-account-key.json"
   ```

## Quick Start Commands

### 1. Seed Johnson's Accounts

Create all three accounts with default data:

```powershell
npm run seed:johnson
```

### 2. Verify Accounts

Check account status and details:

```powershell
npm run verify:johnson
```

### 3. Interactive Account Management

Launch interactive CLI for editing accounts:

```powershell
npm run manage:johnson
```

## Account Structure

Each account contains the following editable fields:

### Basic Information

- `accountName` - Internal account name
- `displayName` - Name shown to customer
- `accountHolderName` - Full name of account holder
- `nickname` - Customer-friendly nickname
- `description` - Account description

### Financial Details

- `balance` - Current account balance
- `availableBalance` - Available balance for transactions
- `currency` - Account currency (USD)
- `interestRate` - Annual interest rate (%)
- `minimumBalance` - Minimum required balance
- `monthlyFee` - Monthly maintenance fee
- `overdraftLimit` - Overdraft protection limit
- `dailyWithdrawalLimit` - Daily withdrawal limit
- `dailyTransferLimit` - Daily transfer limit

### Account Identifiers

- `accountNumber` - Full account number
- `accountNumberPrefix` - Masked prefix (\*\*\*\*)
- `accountNumberSuffix` - Last 4 digits shown to customer
- `routingNumber` - Bank routing number
- `branchCode` - Branch identifier
- `sortCode` - Sort code

### Status and Settings

- `status` - Account status (active/inactive/closed)
- `isActive` - Active flag
- `isPrimary` - Primary account flag
- `isDefault` - Default account for transactions
- `canClose` - Whether account can be closed
- `requiresApproval` - Requires approval for transactions

### Features and Benefits

- `features[]` - Array of account features
- `benefits[]` - Array of account benefits
- `alerts` - Alert settings object

## Default Account Setup

### Primary Account (johnson_primary)

- **Account Number**: 10017958
- **Balance**: $15,750.50
- **Type**: Primary checking account
- **Features**: Online banking, mobile banking, debit card, ATM access, etc.
- **Status**: Active, Primary, Default

### Savings Account (johnson_savings)

- **Account Number**: 20011120
- **Balance**: $5,000.00
- **Type**: High-yield savings
- **Interest Rate**: 2.50%
- **Features**: High interest rate, automatic transfers
- **Status**: Active

### Checking Account (johnson_checking)

- **Account Number**: 30015314
- **Balance**: $8,250.75
- **Type**: Premium checking
- **Interest Rate**: 0.75%
- **Monthly Fee**: $15
- **Features**: Premium services, investment advisory, concierge services
- **Status**: Active, Requires Approval

## CLI Usage Examples

### Seeding Accounts

```powershell
# Create all three accounts with default data
npm run seed:johnson

# Expected output:
# 🏦 Starting Johnson Boseman accounts seeding process...
# 🧹 Cleaning up existing accounts...
# 📝 Creating Johnson Boseman's accounts...
# 💳 Creating Primary Checking Account (primary)
# ✅ Successfully created: Primary Checking Account
# 💳 Creating High-Yield Savings Account (savings)
# ✅ Successfully created: High-Yield Savings Account
# 💳 Creating Premium Checking Account (checking)
# ✅ Successfully created: Premium Checking Account
# 🎉 Johnson Boseman accounts seeding completed successfully!
```

### Verification

```powershell
# Verify account setup
npm run verify:johnson

# Expected output shows:
# - Account count (should be 3)
# - Account details for each account
# - Portfolio balance summary
# - Admin editability verification
```

### Interactive Management

```powershell
# Launch interactive account editor
npm run manage:johnson

# Interactive menu allows:
# 1. Edit account details (balance, limits, names, etc.)
# 2. Edit account features (add/remove/modify)
# 3. View detailed account summary
# 4. Refresh account list
# 5. Exit
```

## Direct Firebase CLI Commands

### View All Accounts

```powershell
firebase firestore:get accounts --project swiftbank-2811b
```

### View Specific Account

```powershell
firebase firestore:get accounts/johnson_primary --project swiftbank-2811b
```

### Update Account Balance

```powershell
# Update primary account balance to $20,000
firebase firestore:update accounts/johnson_primary --data '{"balance": 20000}' --project swiftbank-2811b
```

### Delete All Accounts

```powershell
firebase firestore:delete accounts --recursive --project swiftbank-2811b
```

## Script Details

### `scripts/seed-johnson-accounts.cjs`

- **Purpose**: Creates the three Johnson Boseman accounts
- **Features**:
  - Cleans up existing accounts first
  - Creates comprehensive account data
  - All fields are admin-editable
  - Realistic account numbers and balances

### `scripts/verify-johnson-accounts.cjs`

- **Purpose**: Verifies account setup and provides detailed analysis
- **Features**:
  - Account count verification
  - Account details display
  - Portfolio balance calculation
  - Admin editability check

### `scripts/manage-johnson-accounts.cjs`

- **Purpose**: Interactive CLI for account management
- **Features**:
  - Edit all account details
  - Manage account features and benefits
  - Real-time updates to Firebase
  - Confirmation prompts for safety

## Troubleshooting

### Authentication Issues

```powershell
# Re-authenticate with Google Cloud
gcloud auth application-default login

# Or set service account key
$env:GOOGLE_APPLICATION_CREDENTIALS="path\to\key.json"
```

### Permission Errors

```powershell
# Check Firebase project access
firebase projects:list

# Switch to correct project
firebase use swiftbank-2811b
```

### Script Errors

```powershell
# Check Node.js version (requires Node 14+)
node --version

# Install dependencies
npm install
```

## Admin Dashboard Integration

The created accounts integrate with the admin dashboard through:

1. **Account Display**: All accounts appear in customer dashboard
2. **Edit Interface**: Admin can modify all fields through UI
3. **Real-time Updates**: Changes sync immediately with Firebase
4. **Validation**: Form validation ensures data integrity

## Security Considerations

- All scripts require Firebase admin permissions
- Account data is validated before updates
- Confirmation prompts prevent accidental changes
- Audit trail maintained through `updatedAt` timestamps

## Maintenance

### Regular Tasks

- **Weekly**: Verify account data integrity
- **Monthly**: Review account balances and limits
- **Quarterly**: Audit account features and benefits

### Backup

```powershell
# Export all account data
firebase firestore:export gs://your-backup-bucket/accounts --collection-ids=accounts
```

### Recovery

```powershell
# Re-seed accounts if needed
npm run seed:johnson

# Verify after recovery
npm run verify:johnson
```
