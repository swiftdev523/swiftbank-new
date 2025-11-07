# 👨‍💻 Developer Dashboard System

A comprehensive developer management system that implements a three-tier hierarchy: **Developer → Admin → Customer**

## 🏗️ System Architecture

```
Developer (Top Level)
    ├── Creates and manages Admins
    ├── Assigns Customers to Admins
    └── Monitors the entire system
        │
        └── Admin (Middle Level)
                ├── Manages assigned Customer only
                ├── Cannot see other customers
                └── Limited to their assigned customer data
                    │
                    └── Customer (End Level)
                            ├── Banking operations
                            ├── Account management
                            └── Transaction history
```

## 🚀 Getting Started

### 1. Create a Developer Account

```bash
# Create a new developer account
npm run create:developer -- --email=dev@company.com --password=secure123 --firstName="Lead" --lastName="Developer"

# List existing developers
npm run list:developers
```

### 2. Access Developer Portal

1. Navigate to `/developer/login`
2. Login with developer credentials
3. Access the developer dashboard at `/developer/dashboard`

### 3. Create Admin-Customer Pairs

From the developer dashboard:

1. Click "Create Admin & Customer"
2. Fill in admin details (step 1)
3. Fill in customer details (step 2)
4. Review and create (step 3)

## 🔑 Authentication & Access Control

### Role Hierarchy

- **Developer**: Full system access, can create/manage admins and customers
- **Admin**: Limited to assigned customer only
- **Customer**: Standard banking operations

### Security Features

- Firebase security rules enforce access control
- Admins can only access their assigned customer
- Developers have oversight of all admin-customer pairs
- Session management and timeout protection

## 📊 Management Commands

### Developer Account Management

```bash
# Create developer account
npm run create:developer -- --email=dev@company.com --password=secure123 --firstName="John" --lastName="Developer"

# List all developers
npm run list:developers
```

### System Management

```bash
# Get statistics for a specific developer
npm run developer:stats -- dev@company.com

# List all entities in the system
npm run developer:list-all

# Clean up inactive entities (dry run)
npm run developer:cleanup

# Verify system integrity
npm run developer:verify
```

## 🗂️ Database Schema

### Collections

#### `developers`

```javascript
{
  uid: "developer_uid",
  email: "dev@company.com",
  firstName: "John",
  lastName: "Developer",
  role: "developer",
  permissions: ["*"],
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `adminAssignments`

```javascript
{
  developerId: "developer_uid",
  adminId: "admin_uid",
  customerId: "customer_uid",
  adminEmail: "admin@company.com",
  customerEmail: "customer@company.com",
  isActive: true,
  createdAt: timestamp
}
```

#### `users` (Enhanced)

```javascript
{
  uid: "user_uid",
  email: "user@company.com",
  firstName: "John",
  lastName: "Doe",
  role: "admin|customer|developer",
  assignedCustomer: "customer_uid", // For admins
  assignedAdmin: "admin_uid",       // For customers
  createdBy: "developer_uid",
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔐 Firebase Security Rules

The system enforces strict access control:

```javascript
// Developers can access everything
function isDeveloper() {
  return isAuthenticated() &&
         exists(/databases/$(database)/documents/developers/$(request.auth.uid));
}

// Admins can only access their assigned customer
function isAdminAssignedToCustomer(customerId) {
  return isAuthenticated() &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.assignedCustomer == customerId;
}
```

## 🎯 Use Cases

### For Developers

- Create and manage multiple admin-customer pairs
- Monitor system-wide statistics
- Oversee all banking operations
- Handle system administration

### For Admins

- Manage their assigned customer's profile
- Handle customer account operations
- Process customer transactions
- Provide customer support

### For Customers

- Standard banking operations
- Account management
- Transaction history
- Profile management

## 🛠️ Technical Implementation

### Frontend Components

- `DeveloperLoginPage`: Authentication for developers
- `DeveloperPage`: Main dashboard with admin management
- `CreateAdminCustomerModal`: Wizard for creating admin-customer pairs
- `AdminManagement`: View and manage created admins
- `AssignedCustomerManagement`: Admin view of assigned customer

### Backend Services

- `developerService`: Core developer operations
- `adminService`: Admin-specific operations with access control
- `authService`: Enhanced with developer role support

### Context Providers

- `DeveloperContext`: State management for developer operations
- `AuthContext`: Enhanced with developer role support

## 🔄 Workflow Example

1. **Developer** creates an account using CLI script
2. **Developer** logs into `/developer/login`
3. **Developer** creates Admin-Customer pair through dashboard
4. **Admin** receives credentials and logs into `/admin/login`
5. **Admin** can only see their assigned customer
6. **Customer** receives credentials and uses standard banking features
7. **Developer** monitors all operations from developer dashboard

## 🚨 Important Notes

### Security Considerations

- Always use strong passwords for developer accounts
- Developer accounts have highest privileges - protect carefully
- Regular audit of admin-customer assignments
- Monitor system integrity with provided scripts

### Backup & Recovery

- Regular backup of Firestore collections
- Keep developer credentials secure and backed up
- Document all admin-customer assignments

### Scaling

- System supports multiple developers
- Each developer can manage multiple admin-customer pairs
- Horizontal scaling through additional developer accounts

## 📝 Troubleshooting

### Common Issues

1. **Developer can't login**: Check if developer document exists in Firestore
2. **Admin can't see customer**: Verify admin-customer assignment
3. **Security rule errors**: Check Firebase security rules deployment
4. **Missing permissions**: Verify role assignments in user documents

### Debug Commands

```bash
# Verify system integrity
npm run developer:verify

# List all entities
npm run developer:list-all

# Check specific developer stats
npm run developer:stats -- dev@company.com
```

## 🎉 Features

✅ **Complete developer hierarchy**  
✅ **Secure role-based access control**  
✅ **Admin-customer assignment system**  
✅ **Comprehensive management dashboard**  
✅ **CLI tools for system administration**  
✅ **Firebase security rules integration**  
✅ **Real-time data synchronization**  
✅ **System integrity verification**

## 🔮 Future Enhancements

- Multi-tenant support for organizations
- Advanced analytics and reporting
- Automated admin-customer pairing suggestions
- Role-based permission granularity
- API for third-party integrations
- Advanced audit logging

---

**Built with React, Firebase, and modern web technologies** 🚀
