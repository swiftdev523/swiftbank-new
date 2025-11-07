import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { withFirebaseThrottle } from "./firebaseThrottle";
import { dispatchFirebaseError } from "../components/FirebaseErrorDisplay";

// Direct balance updater function with throttling
export const updateJohnsonBalances = async () => {
  // Check throttling - 5 minute cooldown
  const lastUpdate = localStorage.getItem("lastBalanceUpdate");
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (lastUpdate && now - parseInt(lastUpdate) < fiveMinutes) {
    const remainingTime = Math.ceil(
      (fiveMinutes - (now - parseInt(lastUpdate))) / 1000
    );
    console.log(
      `⏳ Balance update throttled - please wait ${remainingTime} seconds`
    );
    alert(
      `Please wait ${remainingTime} seconds before updating balances again.`
    );
    return;
  }

  console.log("🏦 Starting Johnson Boseman balance update with throttling...");

  // New balance allocation for realistic American wealth distribution
  const balanceUpdates = {
    johnson_checking: {
      balance: 2500000, // $2.5M - Checking (daily liquidity)
      availableBalance: 2500000,
    },
    johnson_primary: {
      balance: 750000000, // $750M - Primary Investment Account
      availableBalance: 750000000,
    },
    johnson_savings: {
      balance: 267500000, // $267.5M - High-Yield Savings
      availableBalance: 267500000,
    },
  };

  try {
    // Update each account with throttling
    const accountEntries = Object.entries(balanceUpdates);

    for (let i = 0; i < accountEntries.length; i++) {
      const [accountId, balances] = accountEntries[i];

      console.log(
        `💰 Updating ${accountId} to $${balances.balance.toLocaleString()}`
      );

      // Use Firebase throttling wrapper
      await withFirebaseThrottle(
        `update-${accountId}`,
        async () => {
          const accountRef = doc(db, "accounts", accountId);
          return await updateDoc(accountRef, balances);
        },
        { maxRequests: 3, windowMs: 60000 } // 3 requests per minute
      );

      console.log(`✅ ${accountId} updated successfully`);

      // Add delay between updates
      if (i < accountEntries.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Record successful update time
    localStorage.setItem("lastBalanceUpdate", now.toString());

    const totalBalance = Object.values(balanceUpdates).reduce(
      (sum, account) => sum + account.balance,
      0
    );
    console.log("🎉 All balances updated successfully!");
    console.log(
      `💎 New Total Portfolio Value: $${totalBalance.toLocaleString()}`
    );
    console.log("📊 Balance Breakdown:");
    console.log(
      `   • Checking Account: $${balanceUpdates.johnson_checking.balance.toLocaleString()}`
    );
    console.log(
      `   • Primary Account:  $${balanceUpdates.johnson_primary.balance.toLocaleString()}`
    );
    console.log(
      `   • Savings Account:  $${balanceUpdates.johnson_savings.balance.toLocaleString()}`
    );

    return true;
  } catch (error) {
    console.error("❌ Error updating balances:", error);

    // Dispatch error for user display
    dispatchFirebaseError(error);

    // Handle specific Firebase errors
    if (
      error.code === "resource-exhausted" ||
      error.message?.includes("quota")
    ) {
      console.error(
        "🚫 Firebase quota exceeded. Please wait before trying again."
      );
      alert(
        "Firebase quota exceeded. Please wait a few minutes before updating balances again."
      );
    } else if (error.message?.includes("Rate limit exceeded")) {
      console.error("⏱️ Rate limit exceeded. Function is throttled.");
    } else {
      console.error("Unexpected error:", error);
    }

    throw error;
  }
};

// Auto-execute if called directly
if (typeof window !== "undefined") {
  window.updateJohnsonBalances = updateJohnsonBalances;
}
