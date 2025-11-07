# 🧪 Manual Testing Guide - User Permissions

## Test Credentials

| Role          | Email                      | Password       | UID                          |
| ------------- | -------------------------- | -------------- | ---------------------------- |
| **Customer**  | kindestwavelover@gmail.com | (use existing) | BMPayIo945gjgTJpNUk3jLS9VBy1 |
| **Admin**     | seconds@swiftbank.com      | (use existing) | Hg2IMBwMkqdgilzvj2psq8UuREf1 |
| **Developer** | developer@swiftbank.com    | (use existing) | XImTwn3OxsfGBDXN9PxoMzYbXZ53 |

---

## 🔵 Test 1: Customer Role (kindestwavelover@gmail.com)

### Login Test

- [ ] Navigate to http://localhost:5173/login
- [ ] Enter email: `kindestwavelover@gmail.com`
- [ ] Enter password
- [ ] Should redirect to `/dashboard` (NOT `/admin`)

### Dashboard Access

- [ ] Can see dashboard overview page
- [ ] Can see 3 accounts:
  - Primary Checking: $15,750.50
  - Premium Savings: $25,000.00
  - Everyday Checking: $3,250.75
- [ ] Total balance shown: $44,001.25
- [ ] Can see account cards with balances

### Navigation Test

- [ ] Can navigate to Accounts page
- [ ] Can navigate to Transactions page
- [ ] Can navigate to Analytics page
- [ ] Can navigate to Profile page
- [ ] **CANNOT** access `/admin` routes (should be blocked)
- [ ] **CANNOT** access `/developer` routes (should be blocked)

### Account Operations

- [ ] Can view account details
- [ ] Can click "Send Money" - modal opens
- [ ] Can click "Receive Money" - modal opens
- [ ] Can click "Deposit" - modal opens
- [ ] Can click "Withdraw" - modal opens

### Transfer Test

- [ ] Click "Send Money"
- [ ] Select source account
- [ ] Enter recipient details
- [ ] Enter amount (try $100)
- [ ] Confirm transfer
- [ ] Should see success message
- [ ] Balance should update

### Restrictions (Should FAIL)

- [ ] Try accessing `/admin/account-holders` - Should redirect or show error
- [ ] Try accessing `/developer/dashboard` - Should redirect or show error

---

## 🟢 Test 2: Admin Role (seconds@swiftbank.com)

### Login Test

- [ ] **Log out** from customer account first
- [ ] Navigate to http://localhost:5173/admin/login
- [ ] Enter email: `seconds@swiftbank.com`
- [ ] Enter password
- [ ] Should redirect to `/admin/account-holders`

### Admin Panel Access

- [ ] Can see admin navigation with 4 sections:
  1. Account Holders
  2. Transactions
  3. Messages
  4. Authentication
- [ ] Can switch between admin sections

### Data Isolation Test (CRITICAL!)

- [ ] Go to "Account Holders" section
- [ ] Should ONLY see: **kindestwavelover@gmail.com**
- [ ] Should NOT see any other customers
- [ ] Should see the 3 accounts for kindestwavelover@gmail.com

### Account Management

- [ ] Can view customer's account details
- [ ] Can edit account information
- [ ] Can create new account for assigned customer
- [ ] Try to manually navigate to another customer's data (should fail)

### Transaction Management

- [ ] Go to "Transactions" section
- [ ] Should ONLY see transactions for kindestwavelover@gmail.com
- [ ] Can view transaction details
- [ ] Can add notes to transactions

### Messages

- [ ] Go to "Messages" section
- [ ] Can send message to assigned customer
- [ ] Can view message history

### Restrictions (Should FAIL)

- [ ] Try accessing `/dashboard` customer route - Should redirect
- [ ] Try accessing `/developer/dashboard` - Should redirect
- [ ] Try viewing another customer's data (if any) - Should be blocked

---

## 🟡 Test 3: Developer Role (developer@swiftbank.com)

### Login Test

- [ ] **Log out** from admin account first
- [ ] Navigate to http://localhost:5173/developer/login
- [ ] Enter email: `developer@swiftbank.com`
- [ ] Enter password
- [ ] Should redirect to `/developer/dashboard`

### Developer Dashboard Access

- [ ] Can see developer dashboard
- [ ] Can see system statistics
- [ ] Can see all users in system
- [ ] Can see all admin-customer assignments

### Full System Access

- [ ] Can view ALL customers (not just one)
- [ ] Can view ALL accounts
- [ ] Can view ALL transactions
- [ ] Can view ALL admin assignments

### Admin Creation Test

- [ ] Can access admin-customer creation wizard
- [ ] Can see "Create Admin & Customer" option
- [ ] Can create new admin-customer pairs (don't actually create, just verify access)

### Database Access

- [ ] Can query database
- [ ] Can run analytics
- [ ] Can view audit logs

---

## 🔒 Security Rules Validation

### Test Security Rules

Run these tests to verify Firestore security rules are working:

1. **Customer can only read own data**
   - Customer logged in
   - Try to access another user's data via browser console
   - Should get permission denied

2. **Admin can only read assigned customer**
   - Admin logged in
   - Try to query for all users
   - Should only get assigned customer

3. **Developer has full access**
   - Developer logged in
   - Can query any collection
   - Can read any document

---

## 📊 Expected Results Summary

| Feature                     | Customer | Admin             | Developer |
| --------------------------- | -------- | ----------------- | --------- |
| View own accounts           | ✅       | ✅ (for assigned) | ✅ (all)  |
| Transfer money              | ✅       | ❌                | ❌        |
| View own transactions       | ✅       | ✅ (for assigned) | ✅ (all)  |
| Create accounts             | ❌       | ✅ (for assigned) | ✅        |
| View all customers          | ❌       | ❌                | ✅        |
| Create admin-customer pairs | ❌       | ❌                | ✅        |
| Access admin panel          | ❌       | ✅                | ✅        |
| Access developer dashboard  | ❌       | ❌                | ✅        |

---

## 🐛 Issues to Watch For

1. **Route Protection**: Ensure users can't access unauthorized routes
2. **Data Isolation**: Admin should ONLY see assigned customer
3. **Custom Claims**: Verify roles are being read correctly
4. **Firestore Rules**: Test that security rules block unauthorized access
5. **UI Permissions**: Ensure UI elements match user permissions

---

## 📝 Testing Notes

**Start Here:** http://localhost:5173

Test in this order:

1. Customer (easiest to verify)
2. Admin (verify data isolation)
3. Developer (verify full access)

**After each test:**

- Log out completely
- Clear browser cache if needed
- Check browser console for errors
- Verify no unauthorized API calls

---

## ✅ Pass Criteria

All tests pass if:

- ✅ Each role can access their designated routes
- ✅ Each role CANNOT access unauthorized routes
- ✅ Admin sees ONLY assigned customer
- ✅ Customer can perform banking operations
- ✅ Developer has full system access
- ✅ No console errors related to permissions
- ✅ Security rules prevent unauthorized data access
