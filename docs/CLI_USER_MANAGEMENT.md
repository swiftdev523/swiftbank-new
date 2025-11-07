# SwiftBank User Management System

This document provides comprehensive instructions for managing the SwiftBank system users using CLI tools and admin dashboard.

## Overview

The SwiftBank system maintains exactly **TWO users**:

- **Admin User**: `admin@swiftbank.com` - Full system access
- **Customer User**: `customer@swiftbank.com` (Johnson Boseman) - Banking customer

All user details including authentication credentials are fully editable by administrators.

## User Structure

### Admin User Profile

- **Name**: System Administrator
- **Email**: admin@swiftbank.com
- **Role**: admin
- **UID**: rYIBpXZy0vX4hY1A3HCS8BYv6F02
- **Permissions**: Full admin access (7 permissions)

### Customer User Profile

- **Name**: Johnson Boseman
- **Email**: customer@swiftbank.com
- **Role**: customer
- **UID**: mYFGjRgsARS0AheCdYUkzhMRLkk2
- **Permissions**: Standard customer access (4 permissions)

## Quick Start Commands

### 1. Seed System Users

Create both users with default data:

```powershell
npm run seed:users
```

### 2. Verify Users

Check user status and details:

```powershell
npm run verify:users
```

### 3. Interactive User Management

Launch CLI for editing users:

```powershell
npm run manage:users
```

## Editable User Fields

All fields are **fully editable** by administrators:

### Basic Information

- `firstName` - First name
- `lastName` - Last name
- `fullName` - Full display name
- `displayName` - Short display name
- `username` - System username
- `email` - Email address (affects authentication)

### Contact Information

- `phone` - Phone number
- `address` - Complete address object
  - `street` - Street address
  - `city` - City
  - `state` - State/Province
  - `zipCode` - ZIP/Postal code
  - `country` - Country

### Authentication & Access

- `role` - User role (admin/customer/manager/support)
- `permissions[]` - Array of permissions
- `isActive` - Account active status
- `isVerified` - Email verification status
- `emailVerified` - Email verification flag
- `phoneVerified` - Phone verification flag

### Security Settings

- `security.sessionTimeout` - Session timeout in seconds
- `security.loginAttempts` - Failed login attempts counter
- `security.lastLoginIP` - Last login IP address
- `security.requirePasswordChange` - Force password change flag
- `preferences.twoFactorEnabled` - Two-factor authentication

### Profile Preferences

- `preferences.theme` - UI theme (light/dark)
- `preferences.language` - Interface language
- `preferences.timezone` - User timezone
- `preferences.notifications` - Notification settings

### Banking Profile (Customer Only)

- `bankingProfile.customerSince` - Customer registration date
- `bankingProfile.accountTypes[]` - Associated account types
- `bankingProfile.primaryAccountId` - Primary account ID
- `bankingProfile.creditScore` - Credit score
- `bankingProfile.kycStatus` - KYC verification status

### Personal Details (Customer Only)

- `personalDetails.dateOfBirth` - Date of birth
- `personalDetails.ssn` - Social security number (masked)
- `personalDetails.occupation` - Occupation
- `personalDetails.employer` - Employer name
- `personalDetails.annualIncome` - Annual income
- `personalDetails.maritalStatus` - Marital status

### Emergency Contact

- `emergencyContact.name` - Contact name
- `emergencyContact.relationship` - Relationship
- `emergencyContact.phone` - Contact phone
- `emergencyContact.email` - Contact email

## CLI Management Examples

### Seeding Users

```powershell
# Create both system users
npm run seed:users

# Expected output:
# 👥 Starting SwiftBank users seeding process...
# 🧹 Cleaning up existing users...
# 📝 Creating SwiftBank system users...
# 👤 Preparing System Administrator (admin)
# 👤 Preparing Johnson Boseman (customer)
# ✅ Successfully created all users in batch
# 🎉 SwiftBank users seeding completed successfully!
```

### Verification

```powershell
# Verify user setup
npm run verify:users

# Shows detailed user information:
# - User count validation (must be 2)
# - Role verification (1 admin, 1 customer)
# - Field completeness check
# - Authentication sync verification
```

### Interactive Management

```powershell
# Launch interactive user editor
npm run manage:users

# Interactive menu provides:
# 1. Edit user basic info (name, email, username)
# 2. Edit user address (complete address details)
# 3. Edit user role (admin/customer/manager/support)
# 4. Edit user permissions (predefined sets or custom)
# 5. Edit security settings (2FA, timeouts, etc.)
# 6. View user details (comprehensive view)
# 7. Toggle user active status
```

## Permission Management

### Predefined Permission Sets

**Admin Permissions:**

- `user_management` - Manage all users
- `account_management` - Manage all accounts
- `transaction_management` - Manage transactions
- `message_management` - Manage system messages
- `settings_management` - Manage system settings
- `audit_access` - Access audit logs
- `full_admin_access` - Full system access

**Customer Permissions:**

- `account_view` - View own accounts
- `transaction_create` - Create transactions
- `profile_edit` - Edit own profile
- `support_contact` - Contact support

### Custom Permissions

You can assign custom permissions by:

1. Using CLI management tool (option 4)
2. Selecting "Custom" permission set
3. Entering comma-separated permission list

## Web Dashboard Integration

### React Component Usage

```jsx
import SystemUserManager from "./components/admin/SystemUserManager";

// Use in admin dashboard
<SystemUserManager />;
```

### Features

- **User Overview**: Card-based display of both users
- **Tabbed Editing**: Organized editing interface
  - Basic Info tab
  - Contact Info tab
  - Security Settings tab
  - Permissions tab
- **Real-time Updates**: Immediate sync with Firebase
- **Status Management**: Toggle active/inactive status
- **Role Management**: Change user roles with permission updates

## Authentication Management

### Current Limitations

- Password changes require Firebase Console or Auth SDK
- Email changes affect both Firestore and Authentication
- UID changes require careful synchronization

### Recommended Workflow

1. **Profile Updates**: Use CLI or dashboard for Firestore data
2. **Email Changes**: Update in both Firestore and Firebase Auth
3. **Password Resets**: Use Firebase Console or Auth API
4. **Account Status**: Toggle via CLI or dashboard

## Security Considerations

### Access Control

- All user management requires admin privileges
- Firestore rules protect user data access
- Authentication changes require proper validation

### Data Validation

- Email format validation
- Phone number formatting
- Address completeness checks
- Permission validity verification

### Audit Trail

- All changes include timestamp and modifier
- `updatedAt` field tracks last modification
- `lastModifiedBy` field tracks who made changes

## File Structure

```
scripts/
├── seed-users.mjs           # User seeding script
├── verify-users.mjs         # User verification script
└── manage-users.mjs         # Interactive management CLI

src/components/admin/
└── SystemUserManager.jsx    # React user management UI

docs/
└── CLI_USER_MANAGEMENT.md   # This documentation
```

## Troubleshooting

### Common Issues

**No users found:**

```powershell
# Solution: Run seeding script
npm run seed:users
```

**Permission denied:**

```powershell
# Solution: Check Firestore rules and authentication
firebase login
firebase use swiftbank-2811b
```

**Authentication mismatch:**

```powershell
# Solution: Verify UIDs match Firebase Authentication
npm run verify:users
```

### Error Recovery

**Corrupted user data:**

```powershell
# Re-seed users (clears existing first)
npm run seed:users

# Verify setup
npm run verify:users
```

**Missing fields:**

```powershell
# Use interactive CLI to add missing data
npm run manage:users
# Select user -> Edit relevant section
```

## Integration with Account Management

The user management system integrates seamlessly with the Johnson Boseman account management:

1. **Customer UID Consistency**: Customer user UID matches account owner UID
2. **Admin Access**: Admin can manage both users and accounts
3. **Permissions Sync**: User permissions align with account access rights
4. **Audit Alignment**: Both systems track changes consistently

## Best Practices

### Regular Maintenance

1. **Weekly**: Verify user data integrity
2. **Monthly**: Review permissions and access
3. **Quarterly**: Audit user activity and settings

### Change Management

1. **Test changes** in CLI before applying
2. **Verify updates** with verification script
3. **Document changes** for audit purposes
4. **Use confirmation prompts** for destructive actions

### Security Hygiene

1. **Monitor failed login attempts**
2. **Review session timeouts regularly**
3. **Validate two-factor auth settings**
4. **Check emergency contact accuracy**

The system ensures SwiftBank maintains exactly two users with comprehensive admin control over all user details and authentication settings.
