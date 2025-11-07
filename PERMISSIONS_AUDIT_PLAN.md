# 🔐 User Access & Permissions Audit Plan

## Current Status

### ✅ Completed

1. ✅ **Firebase CLI Authentication** - Logged in as princeyekunya523@gmail.com
2. ✅ **Firebase Project Access** - Connected to swiftbank-2811b
3. ✅ **Auth Users Identified** - 3 users found:
   - kindestwavelover@gmail.com (UID: BMPayIo945gjgTJpNUk3jLS9VBy1)
   - seconds@swiftbank.com (UID: Hg2IMBwMkqdgilzvj2psq8UuREf1)
   - developer@swiftbank.com (UID: XImTwn3OxsfGBDXN9PxoMzYbXZ53)

### 🔄 In Progress

4. **Firestore Data Audit** - Need to verify role assignments

### ⏳ Pending

5. **Permissions Testing** - Test each role's access
6. **Route Protection Testing** - Verify navigation guards
7. **CRUD Operations Testing** - Test account/transaction operations
8. **Admin Data Isolation** - Verify admin can only see assigned customers
9. **Security Rules Validation** - Test Firestore security rules
10. **Fix Issues** - Address any permission problems found

---

## Action Plan

### Phase 1: Data Verification (Current)

- [ ] Export Firestore user documents
- [ ] Verify role assignments in Firestore
- [ ] Check for orphaned auth users (auth without Firestore doc)
- [ ] Check for orphaned Firestore docs (Firestore without auth)
- [ ] Verify custom claims are set correctly

### Phase 2: Role Assignment & Setup

- [ ] Ensure developer@swiftbank.com has developer role
- [ ] Ensure seconds@swiftbank.com has admin role
- [ ] Ensure kindestwavelover@gmail.com has customer role
- [ ] Set custom claims for each user
- [ ] Create developer document if missing
- [ ] Create admin-customer assignment if missing

### Phase 3: Customer Role Testing

- [ ] Test customer login
- [ ] Verify dashboard access
- [ ] Test account viewing
- [ ] Test transaction history
- [ ] Test money transfer functionality
- [ ] Test deposit functionality
- [ ] Test withdrawal functionality
- [ ] Test profile updates
- [ ] Verify cannot access admin routes
- [ ] Verify cannot access developer routes

### Phase 4: Admin Role Testing

- [ ] Test admin login
- [ ] Verify admin panel access
- [ ] Test viewing assigned customers only
- [ ] Test account management for assigned customer
- [ ] Test transaction approval
- [ ] Test messaging functionality
- [ ] Verify cannot see other customers
- [ ] Verify cannot access developer routes
- [ ] Test creating new accounts for customer

### Phase 5: Developer Role Testing

- [ ] Test developer login
- [ ] Verify developer dashboard access
- [ ] Test creating admin-customer pairs
- [ ] Test system analytics access
- [ ] Test database query tools
- [ ] Verify full system access
- [ ] Test CLI management scripts

### Phase 6: Security Rules Testing

- [ ] Test customer can only read own data
- [ ] Test admin can only read assigned customer data
- [ ] Test developer can read all data
- [ ] Test write permissions for each role
- [ ] Test collection-level access
- [ ] Test document-level access

### Phase 7: Fix & Validation

- [ ] Document all issues found
- [ ] Implement fixes for permission problems
- [ ] Re-test all functionality
- [ ] Update security rules if needed
- [ ] Update route guards if needed
- [ ] Validate all roles work correctly

---

## Known Issues to Check

1. **Missing Custom Claims**
   - None of the auth users have custom claims set
   - Need to set role-based custom claims

2. **Email Verification**
   - All users have emailVerified: false
   - May affect some functionality

3. **Admin Assignments**
   - Need to verify adminAssignments collection exists
   - Need to verify seconds@swiftbank.com is assigned to kindestwavelover@gmail.com

4. **Developer Document**
   - Need to verify developer@swiftbank.com has entry in developers collection

5. **Firestore User Documents**
   - Need to verify all 3 auth users have corresponding Firestore documents
   - Need to verify role field is set correctly in each document

---

## Next Steps

1. **Create Service Account** for CLI access to Firestore
2. **Export Firestore Data** to verify current state
3. **Set Custom Claims** for all users
4. **Create Missing Documents** (developer, admin assignments)
5. **Run Systematic Tests** for each role
6. **Document & Fix Issues** as they're discovered

---

## Success Criteria

✅ All users have matching Auth + Firestore documents
✅ All users have correct role assignments
✅ Custom claims are set for efficient access control
✅ Admin can only see assigned customer
✅ Customer can perform all banking operations
✅ Developer has full system access
✅ Route guards prevent unauthorized access
✅ Security rules enforce proper data isolation
✅ All CRUD operations work for appropriate roles
✅ No security vulnerabilities or data leaks
