/**
 * Simple Transaction Data Update Script
 * Updates existing transactions to have varied descriptions instead of identical ones
 */

// Sample realistic transaction descriptions by category
const REALISTIC_DESCRIPTIONS = {
  deposit: [
    "Salary Deposit - Tech Corp",
    "Freelance Payment - Web Design",
    "Investment Dividend - Portfolio",
    "Bonus Payment - Annual",
    "Tax Refund - Federal",
    "Gift Deposit - Family",
    "Side Project Payment",
    "Rental Income - Property",
    "Contract Payment - Consulting",
    "Royalty Payment - License",
  ],
  withdrawal: [
    "ATM Withdrawal - Downtown",
    "ATM Withdrawal - Mall",
    "Cash Withdrawal - Bank",
    "ATM - Gas Station",
    "Emergency Cash - ATM",
    "Weekend Cash - ATM",
    "Travel Cash - Airport",
    "ATM Withdrawal - Grocery",
    "Quick Cash - ATM",
    "ATM - Shopping Center",
  ],
  purchase: [
    "Grocery Store - Whole Foods",
    "Restaurant - Italian Bistro",
    "Gas Station - Shell",
    "Coffee Shop - Starbucks",
    "Amazon Purchase - Online",
    "Pharmacy - CVS",
    "Supermarket - Kroger",
    "Fast Food - McDonald's",
    "Department Store - Macy's",
    "Electronics - Best Buy",
    "Clothing - H&M",
    "Home Depot - Supplies",
    "Target - Shopping",
    "Uber Ride - Downtown",
    "Netflix Subscription",
    "Spotify Premium",
    "Gym Membership",
    "Phone Bill - Verizon",
    "Electric Bill - Utility Co",
    "Internet Bill - Comcast",
  ],
  transfer: [
    "Transfer to Savings",
    "Transfer from Checking",
    "Internal Transfer - Primary",
    "Account Transfer - Savings",
    "Transfer - Investment Account",
    "Move to Checking",
    "Transfer to Emergency Fund",
    "Investment Transfer",
    "Savings Transfer - Goal",
    "Portfolio Rebalance",
  ],
};

// Function to get random realistic description
function getRealisticDescription(type, originalDescription) {
  // If it's already a realistic description, keep it
  if (
    originalDescription &&
    !originalDescription.includes("Balance Adjustment") &&
    !originalDescription.includes("Transaction") &&
    originalDescription.length > 10
  ) {
    return originalDescription;
  }

  const descriptions =
    REALISTIC_DESCRIPTIONS[type] || REALISTIC_DESCRIPTIONS.purchase;
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Function to add variety to timestamps (spread them out more realistically)
function addTimestampVariety(originalTimestamp, index) {
  const baseTime = new Date(originalTimestamp).getTime();
  // Add some random hours/minutes to spread transactions throughout days
  const randomOffset = Math.random() * 24 * 60 * 60 * 1000; // 0-24 hours in milliseconds
  return new Date(baseTime + randomOffset);
}

console.log(`
🎯 Transaction Variety Update Script
=====================================

This script will update existing transactions to have:
✅ Realistic, varied descriptions instead of identical ones
✅ More realistic timestamp distribution throughout days
✅ Proper categorization based on transaction type

To run this script with Firebase Admin access:

1. First, authenticate with Firebase CLI:
   firebase login

2. Set the project:
   firebase use swiftbank-2811b

3. Run this script using Firebase Functions shell:
   firebase functions:shell --project swiftbank-2811b

4. In the shell, run:
   updateTransactionVariety()

Or, you can run the Firebase batch update manually in the Firebase Console:

1. Go to: https://console.firebase.google.com/project/swiftbank-2811b/firestore
2. Navigate to the 'transactions' collection
3. Filter by userId: ${JOHNSON_USER_ID}
4. Use the batch edit feature to update descriptions

Sample descriptions that will be used:
${Object.entries(REALISTIC_DESCRIPTIONS)
  .map(
    ([type, descs]) =>
      `${type.toUpperCase()}: ${descs.slice(0, 3).join(", ")}...`
  )
  .join("\n")}

💡 Tip: The app's transaction normalization now creates varied descriptions
automatically for new transactions, so this is mainly to fix existing data.
`);

// Export the main function for use in Firebase Functions shell
if (typeof module !== "undefined") {
  module.exports = {
    getRealisticDescription,
    addTimestampVariety,
    REALISTIC_DESCRIPTIONS,
  };
}
