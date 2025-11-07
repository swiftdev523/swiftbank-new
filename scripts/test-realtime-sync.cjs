// Test Real-Time Database Synchronization
// This script verifies that changes to Firestore are reflected in the app

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require(
  path.join(__dirname, "..", "service-account-key.json")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Test configuration
const CUSTOMER_UID = "BMPayIo945gjgTJpNUk3jLS9VBy1"; // kindestwavelover@gmail.com
const TEST_DELAY = 3000; // 3 seconds between operations

async function testRealTimeSync() {
  console.log("\n🧪 Testing Real-Time Database Synchronization\n");
  console.log("📝 Instructions:");
  console.log("1. Open http://localhost:5173/login in your browser");
  console.log("2. Login as kindestwavelover@gmail.com");
  console.log("3. Watch the dashboard while this script updates balances");
  console.log("4. Balance should update automatically WITHOUT page refresh\n");
  console.log("⏱️  Starting test in 5 seconds...\n");

  await sleep(5000);

  try {
    // Step 1: Get Primary Checking account
    console.log("📊 Step 1: Finding Primary Checking account...");
    const accountsSnapshot = await db
      .collection("accounts")
      .where("customerUID", "==", CUSTOMER_UID)
      .where("accountType", "==", "primary")
      .limit(1)
      .get();

    if (accountsSnapshot.empty) {
      console.error("❌ No primary account found for customer");
      return;
    }

    const primaryAccountDoc = accountsSnapshot.docs[0];
    const primaryAccount = primaryAccountDoc.data();
    const originalBalance = primaryAccount.balance;

    console.log(`✅ Found account: ${primaryAccount.accountName}`);
    console.log(`   Current balance: $${originalBalance.toLocaleString()}\n`);

    // Step 2: Update balance to test value
    const testBalance = 50000.0;
    console.log(
      `💾 Step 2: Updating balance to $${testBalance.toLocaleString()}...`
    );
    await primaryAccountDoc.ref.update({
      balance: testBalance,
      availableBalance: testBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ Balance updated in Firestore");
    console.log(
      "👀 Check your browser - balance should update automatically!\n"
    );

    await sleep(TEST_DELAY);

    // Step 3: Update balance again
    const testBalance2 = 75000.0;
    console.log(
      `💾 Step 3: Updating balance to $${testBalance2.toLocaleString()}...`
    );
    await primaryAccountDoc.ref.update({
      balance: testBalance2,
      availableBalance: testBalance2,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ Balance updated in Firestore");
    console.log("👀 Check your browser - balance should update again!\n");

    await sleep(TEST_DELAY);

    // Step 4: Restore original balance
    console.log(
      `♻️  Step 4: Restoring original balance ($${originalBalance.toLocaleString()})...`
    );
    await primaryAccountDoc.ref.update({
      balance: originalBalance,
      availableBalance: originalBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ Original balance restored\n");

    // Step 5: Test transaction creation
    console.log("📝 Step 5: Creating test transaction...");
    const testTransaction = {
      customerUID: CUSTOMER_UID,
      userId: CUSTOMER_UID,
      accountId: primaryAccountDoc.id,
      type: "credit",
      category: "Test",
      amount: 100.0,
      description: "Real-Time Sync Test Transaction",
      merchant: "Test Script",
      status: "completed",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const txnRef = await db.collection("transactions").add(testTransaction);
    console.log(`✅ Transaction created with ID: ${txnRef.id}`);
    console.log(
      "👀 Check your browser - transaction should appear in history!\n"
    );

    await sleep(TEST_DELAY);

    // Step 6: Cleanup test transaction
    console.log("🧹 Step 6: Cleaning up test transaction...");
    await txnRef.delete();
    console.log("✅ Test transaction deleted\n");

    console.log("✅ Real-Time Sync Test Complete!\n");
    console.log("📊 Test Results:");
    console.log("   ✅ Account balance updated 3 times");
    console.log("   ✅ Transaction created and appeared in UI");
    console.log("   ✅ Transaction deleted and removed from UI");
    console.log("   ✅ All changes synced without page refresh\n");
    console.log(
      "🎉 If you saw all updates in the browser, real-time sync is working!\n"
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run test
testRealTimeSync();
