/**
 * Emergency Mode System - Provides cached/mock data when Firebase is unavailable
 */

import { firebaseCircuitBreaker } from "./firebaseCircuitBreaker";

class EmergencyMode {
  constructor() {
    this.isActive = false;
    this.activationReason = null;
    this.activatedAt = null;
    this.checkInterval = null;

    // Auto-activate if circuit breaker is open
    this.initialize();
  }

  /**
   * Initialize emergency mode system
   */
  initialize() {
    // Check if emergency mode was previously activated
    this.checkStoredState();

    // Monitor Firebase circuit breaker state
    this.startMonitoring();

    console.log("🚨 Emergency mode system initialized");
  }

  /**
   * Activate emergency mode
   */
  activate(reason = "Firebase unavailable") {
    if (this.isActive) {
      console.log("⚠️ Emergency mode already active");
      return;
    }

    this.isActive = true;
    this.activationReason = reason;
    this.activatedAt = new Date().toISOString();

    console.warn(`🚨 Emergency mode ACTIVATED: ${reason}`);
    console.warn("📱 App will use cached/mock data until Firebase is restored");

    // Store state for persistence
    localStorage.setItem(
      "emergency_mode",
      JSON.stringify({
        isActive: true,
        reason,
        activatedAt: this.activatedAt,
      })
    );

    // Dispatch event for components to react
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("emergencyModeActivated", {
          detail: { reason, activatedAt: this.activatedAt },
        })
      );
    }
  }

  /**
   * Deactivate emergency mode
   */
  deactivate() {
    if (!this.isActive) {
      console.log("✅ Emergency mode already inactive");
      return;
    }

    this.isActive = false;
    this.activationReason = null;
    this.activatedAt = null;

    console.log(
      "✅ Emergency mode DEACTIVATED - Firebase connectivity restored"
    );

    // Clear stored state
    localStorage.removeItem("emergency_mode");

    // Dispatch event for components to react
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("emergencyModeDeactivated"));
    }
  }

  /**
   * Check stored emergency mode state
   */
  checkStoredState() {
    try {
      const storedState = localStorage.getItem("emergency_mode");
      if (storedState) {
        const state = JSON.parse(storedState);
        if (state.isActive) {
          this.isActive = true;
          this.activationReason = state.reason;
          this.activatedAt = state.activatedAt;

          console.warn(
            `🔄 Restored emergency mode state: ${this.activationReason}`
          );
        }
      }
    } catch (error) {
      console.error("Failed to restore emergency mode state:", error);
      localStorage.removeItem("emergency_mode");
    }
  }

  /**
   * Start monitoring Firebase circuit breaker
   */
  startMonitoring() {
    // Check every 30 seconds
    this.checkInterval = setInterval(() => {
      const circuitStatus = firebaseCircuitBreaker.getStatus();

      if (circuitStatus.isOpen && !this.isActive) {
        this.activate("Firebase circuit breaker is open");
      } else if (
        !circuitStatus.isOpen &&
        this.isActive &&
        this.activationReason?.includes("circuit breaker")
      ) {
        this.deactivate();
      }
    }, 30000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get mock account data for Johnson Boseman
   */
  getMockAccountData() {
    return [
      {
        id: "johnson_checking",
        accountName: "Checking Account",
        accountNumber: "****5314",
        balance: 2847293.67,
        availableBalance: 2847293.67,
        accountType: "checking",
        currency: "USD",
        status: "active",
        lastUpdated: new Date().toISOString(),
        interestRate: 0.01,
        minimumBalance: 0,
        mockData: true,
      },
      {
        id: "johnson_primary",
        accountName: "Primary Investment Account",
        accountNumber: "****7958",
        balance: 743628491.82,
        availableBalance: 743628491.82,
        accountType: "investment",
        currency: "USD",
        status: "active",
        lastUpdated: new Date().toISOString(),
        interestRate: 0.045,
        minimumBalance: 100000,
        mockData: true,
      },
      {
        id: "johnson_savings",
        accountName: "High-Yield Savings",
        accountNumber: "****1120",
        balance: 268794736.51,
        availableBalance: 268794736.51,
        accountType: "savings",
        currency: "USD",
        status: "active",
        lastUpdated: new Date().toISOString(),
        interestRate: 0.035,
        minimumBalance: 10000,
        mockData: true,
      },
    ];
  }

  /**
   * Get mock transaction data
   */
  getMockTransactionData(limit = 20) {
    const transactions = [];
    const now = new Date();

    const transactionTypes = [
      {
        type: "deposit",
        description: "Direct Deposit - Salary",
        amount: 250000,
        category: "income",
      },
      {
        type: "transfer",
        description: "Investment Transfer",
        amount: -100000,
        category: "investment",
      },
      {
        type: "withdrawal",
        description: "ATM Withdrawal",
        amount: -500,
        category: "cash",
      },
      {
        type: "purchase",
        description: "Amazon Purchase",
        amount: -1249.99,
        category: "shopping",
      },
      {
        type: "deposit",
        description: "Dividend Payment",
        amount: 45000,
        category: "investment",
      },
      {
        type: "transfer",
        description: "Wire Transfer",
        amount: -25000,
        category: "transfer",
      },
      {
        type: "purchase",
        description: "Restaurant",
        amount: -156.75,
        category: "dining",
      },
      {
        type: "deposit",
        description: "Interest Payment",
        amount: 12500,
        category: "interest",
      },
    ];

    for (let i = 0; i < limit; i++) {
      const transaction = transactionTypes[i % transactionTypes.length];
      // Set dates to be from 5 months ago and spread backwards
      const fiveMonthsAgo = new Date();
      fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
      const date = new Date(fiveMonthsAgo.getTime() - i * 24 * 60 * 60 * 1000); // Spread over days

      transactions.push({
        id: `mock_txn_${i + 1}`,
        accountId: i % 2 === 0 ? "johnson_checking" : "johnson_primary",
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount + (Math.random() * 100 - 50), // Add small variation
        category: transaction.category,
        date: date.toISOString(),
        status: "completed",
        balance: Math.random() * 1000000000, // Mock balance after transaction
        reference: `REF${String(i + 1).padStart(6, "0")}`,
        mockData: true,
      });
    }

    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Get mock user profile data
   */
  getMockUserProfile() {
    return {
      uid: "mYFGjRgsARS0AheCdYUkzhMRLkk2",
      email: "johnson.boseman@example.com",
      displayName: "Johnson Boseman",
      firstName: "Johnson",
      lastName: "Boseman",
      role: "customer",
      accountType: "premium",
      phoneNumber: "+1 (555) 123-4567",
      address: {
        street: "123 Wealth Avenue",
        city: "Beverly Hills",
        state: "CA",
        zipCode: "90210",
        country: "USA",
      },
      profileImage: null,
      createdAt: "2024-01-01T00:00:00.000Z",
      lastLogin: new Date().toISOString(),
      preferences: {
        currency: "USD",
        language: "en",
        notifications: true,
        twoFactorAuth: true,
      },
      mockData: true,
    };
  }

  /**
   * Get mock financial summary
   */
  getMockFinancialSummary() {
    const accounts = this.getMockAccountData();
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      totalBalance,
      totalAvailable: totalBalance,
      monthlyIncome: 295000,
      monthlyExpenses: 45000,
      netWorth: totalBalance * 1.15, // Assume other assets
      investmentGrowth: 0.087, // 8.7% annual growth
      savingsGoal: 1500000000, // $1.5B goal
      savingsProgress: totalBalance / 1500000000,
      creditScore: 850,
      mockData: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      reason: this.activationReason,
      activatedAt: this.activatedAt,
      duration: this.activatedAt
        ? Date.now() - new Date(this.activatedAt).getTime()
        : 0,
    };
  }

  /**
   * Manual activation/deactivation (for testing)
   */
  toggle(reason = "Manual toggle") {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate(reason);
    }
    return this.getStatus();
  }
}

// Global instance
export const emergencyMode = new EmergencyMode();

// Make available for debugging
if (typeof window !== "undefined") {
  window.emergencyMode = emergencyMode;
  window.toggleEmergencyMode = (reason) => emergencyMode.toggle(reason);
}

export default emergencyMode;
