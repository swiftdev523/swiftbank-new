// Simple Firebase script to add missing account
// Run with: node addAccountSimple.js

const admin = require('firebase-admin');

// Initialize with the current project (swiftbank-2811b)
admin.initializeApp({
  projectId: 'swiftbank-2811b'
});

const db = admin.firestore();

// Generate account number
const generateAccountNumber = () => {
  return '4' + Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
};

async function addMissingAccount() {
  try {
    const customerUID = "mYFGjRgsARS0AheCdYUkzhMRLkk2"; // John Boseman's UID
    
    console.log('Adding Primary Checking account for customer:', customerUID);
    
    // Primary Checking Account data
    const primaryCheckingData = {
      accountType: "Primary Checking",
      accountNumber: generateAccountNumber(),
      balance: 15750.50,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastTransactionDate: admin.firestore.FieldValue.serverTimestamp(),
      interestRate: 0.01,
      minimumBalance: 100,
      customerUID: customerUID,
      // Additional metadata
      accountStatus: "active",
      accountFeatures: {
        overdraftProtection: true,
        directDeposit: true,
        onlineBanking: true,
        mobileApp: true,
        atmAccess: true,
        checksEnabled: true
      }
    };

    // Add to Firestore accounts collection
    const accountRef = await db.collection('accounts').add(primaryCheckingData);
    
    console.log('✅ Primary Checking account added successfully!');
    console.log('Account ID:', accountRef.id);
    console.log('Account Number:', primaryCheckingData.accountNumber);
    console.log('Balance: $' + primaryCheckingData.balance);
    
    // Verify by listing all accounts for this customer
    console.log('\n📋 All accounts for customer:');
    const accountsSnapshot = await db.collection('accounts')
      .where('customerUID', '==', customerUID)
      .get();
    
    if (accountsSnapshot.empty) {
      console.log('No accounts found');
    } else {
      accountsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.accountType}: $${data.balance} (${data.accountNumber})`);
      });
    }
    
    console.log('\n✅ Database update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error adding account:', error);
  } finally {
    // Close the app
    admin.app().delete();
  }
}

// Run the function
addMissingAccount();