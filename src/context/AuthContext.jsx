import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import authService from "../services/authService";
import firestoreService from "../services/firestoreService";
import { firebaseErrorHandler } from "../utils/firebaseErrorHandler";
import { isFirebaseConfigured } from "../config/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [userData, setUserData] = useState(null); // Additional user data from Firestore

  const logoutRef = useRef(null);
  const sessionTimeoutRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Security constants
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  const MAX_LOGIN_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

  // Permanent role assignments based on User UIDs
  const PERMANENT_ROLES = {
    mYFGjRgsARS0AheCdYUkzhMRLkk2: "customer", // John Boseman
    rYIBpXZy0vX4hY1A3HCSSBYV8i33: "admin", // Admin user
  };

  // Email-based role assignments (more reliable than UID)
  const PERMANENT_EMAIL_ROLES = {
    "admin@swiftbank.com": "admin",
    "john@example.com": "customer",
    "developer@swiftbank.com": "developer",
    "seconds@swiftbank.com": "admin",
    // Add more Firebase Auth users
    "kindestwavelover@gmail.com": "customer",
  };

  // Hardcoded customer data for kindestwavelover (bypasses database issues)
  const HARDCODED_CUSTOMER_DATA = {
    "kindestwavelover@gmail.com": {
      uid: "hardcoded-kindest-uid",
      email: "kindestwavelover@gmail.com",
      firstName: "William",
      lastName: "Miller",
      role: "customer",
      isActive: true,
      emailVerified: true,
      phone: "+1 (401) 677 9680",
      dateOfBirth: "1985-03-15",
      address: {
        street: "1439 Federal St",
        city: "Philadelphia",
        state: "PA",
        zipCode: "19146",
        country: "USA",
      },
      accounts: [
        {
          id: "kindest-primary-001",
          accountNumber: "1001987654321",
          accountType: "primary",
          accountName: "Primary Checking",
          displayName: "Primary Checking Account",
          accountHolderName: "William Miller",
          balance: 742583916.29, // Primary investment/checking account
          availableBalance: 742583916.29,
          currency: "USD",
          status: "active",
          isActive: true,
          isPrimary: true,
          isDefault: true,
          interestRate: 0.015,
          monthlyFee: 0,
          minimumBalance: 0,
          overdraftLimit: 50000,
          dailyWithdrawalLimit: 25000,
          dailyTransferLimit: 100000,
          routingNumber: "123456789",
          branchCode: "MAIN001",
          features: [
            "Online Banking",
            "Mobile Banking",
            "Premium Debit Card",
            "Private Banking Access",
            "Concierge Services",
            "Investment Advisory",
            "Wealth Management",
            "Priority Customer Support",
          ],
          benefits: [
            "No fees on any transactions",
            "Unlimited ATM withdrawals worldwide",
            "Personal relationship manager",
            "Exclusive investment opportunities",
            "Premium credit cards",
            "Private jet booking assistance",
          ],
          openedDate: new Date("2020-01-15"),
          lastTransactionDate: new Date(),
          createdAt: new Date("2020-01-15"),
          updatedAt: new Date(),
        },
        {
          id: "kindest-savings-001",
          accountNumber: "2001987654321",
          accountType: "savings",
          accountName: "High-Yield Savings",
          displayName: "Premium Savings Account",
          accountHolderName: "William Miller",
          balance: 294729864.73, // High-yield savings portfolio
          availableBalance: 294729864.73,
          currency: "USD",
          status: "active",
          isActive: true,
          isPrimary: false,
          isDefault: false,
          interestRate: 0.042, // 4.2% APY
          monthlyFee: 0,
          minimumBalance: 0,
          features: [
            "High-yield interest",
            "Unlimited transfers",
            "Mobile banking",
            "Premium support",
          ],
          openedDate: new Date("2020-01-15"),
          createdAt: new Date("2020-01-15"),
          updatedAt: new Date(),
        },
        {
          id: "kindest-credit-001",
          accountNumber: "3001987654321",
          accountType: "credit",
          accountName: "Platinum Credit Card",
          displayName: "Platinum Rewards Credit Card",
          accountHolderName: "William Miller",
          balance: -459782.14, // Current credit card balance (owed amount)
          availableBalance: 390217.86, // Available credit (850k limit - balance)
          creditLimit: 850000,
          currency: "USD",
          status: "active",
          isActive: true,
          isPrimary: false,
          isDefault: false,
          interestRate: 0.1899, // 18.99% APR
          monthlyFee: 0,
          minimumBalance: 0,
          features: [
            "Rewards Points",
            "Travel Insurance",
            "Purchase Protection",
            "Extended Warranty",
            "Fraud Protection",
            "Mobile payments",
          ],
          benefits: [
            "2% cash back on all purchases",
            "5% cash back on travel",
            "No foreign transaction fees",
            "Airport lounge access",
            "24/7 concierge service",
          ],
          openedDate: new Date("2021-03-10"),
          createdAt: new Date("2021-03-10"),
          updatedAt: new Date(),
        },
      ],
      transactions: [
        {
          id: "txn-failed-001",
          accountId: "kindest-primary-001",
          type: "debit",
          category: "Transfer",
          amount: -75000,
          description: "Wire Transfer to International Account",
          merchant: "International Wire Transfer",
          date: new Date("2025-09-28"),
          status: "failed",
          failureReason: "Transaction declined - Contact bank for assistance",
          balanceAfter: 742583916.29,
        },
        {
          id: "txn-failed-002",
          accountId: "kindest-credit-001",
          type: "debit",
          category: "Online Purchase",
          amount: -12500,
          description: "High-Value Online Purchase",
          merchant: "Luxury Goods Marketplace",
          date: new Date("2025-09-25"),
          status: "failed",
          failureReason:
            "Transaction could not be processed - Please visit branch",
          balanceAfter: -459782.14,
        },
        {
          id: "txn-failed-003",
          accountId: "kindest-savings-001",
          type: "debit",
          category: "Investment",
          amount: -250000,
          description: "Investment Portfolio Purchase",
          merchant: "Premium Investment Services",
          date: new Date("2025-09-22"),
          status: "failed",
          failureReason: "Transaction declined - Contact customer service",
          balanceAfter: 294736450.58,
        },
        {
          id: "txn-001",
          accountId: "kindest-primary-001",
          type: "debit",
          category: "Real Estate",
          amount: -450000,
          description: "Property Investment - Downtown Condo Purchase",
          merchant: "Manhattan Real Estate Holdings LLC",
          date: new Date("2025-05-04"),
          status: "completed",
          balanceAfter: 650000000.0,
        },
        {
          id: "txn-002",
          accountId: "kindest-credit-001",
          type: "debit",
          category: "Real Estate",
          amount: -2500,
          description: "Property Management Fee - Q3 2025",
          merchant: "Elite Property Management",
          date: new Date("2025-05-01"),
          status: "completed",
          balanceAfter: -125000.0,
        },
        {
          id: "txn-003",
          accountId: "kindest-primary-001",
          type: "credit",
          category: "Real Estate",
          amount: 15750,
          description: "Rental Income - Uptown Property",
          merchant: "Automated Rental Deposit",
          date: new Date("2025-04-28"),
          status: "completed",
          balanceAfter: 649984250.0,
        },
        {
          id: "txn-004",
          accountId: "kindest-credit-001",
          type: "debit",
          category: "Travel",
          amount: -3200,
          description: "Business Trip - San Francisco",
          merchant: "American Airlines",
          date: new Date("2025-04-25"),
          status: "completed",
          balanceAfter: -5794.35,
        },
        {
          id: "txn-005",
          accountId: "kindest-primary-001",
          type: "debit",
          category: "Investment",
          amount: -75000,
          description: "Stock Purchase - Tech Portfolio",
          merchant: "Schwab Brokerage",
          date: new Date("2025-04-22"),
          status: "completed",
          balanceAfter: 649909250.0,
        },
        {
          id: "txn-006",
          accountId: "kindest-savings-001",
          type: "credit",
          category: "Interest",
          amount: 5476.12,
          description: "Monthly Interest Payment",
          merchant: "Swift Bank Interest",
          date: new Date("2025-04-18"),
          status: "completed",
          balanceAfter: 350000000.0,
        },
        {
          id: "txn-007",
          accountId: "kindest-credit-001",
          type: "debit",
          category: "Real Estate",
          amount: -1850,
          description: "Home Improvement - Kitchen Renovation",
          merchant: "Luxury Kitchen Designs",
          date: new Date("2025-04-15"),
          status: "completed",
          balanceAfter: -123150.0,
        },
        {
          id: "txn-008",
          accountId: "kindest-primary-001",
          type: "debit",
          category: "Real Estate",
          amount: -12500,
          description: "Property Tax Payment - Q3 2025",
          merchant: "NYC Department of Finance",
          date: new Date("2025-04-12"),
          status: "completed",
          balanceAfter: 649921750.0,
        },
        {
          id: "txn-009",
          accountId: "kindest-primary-001",
          type: "credit",
          category: "Business",
          amount: 28500,
          description: "Consulting Fee Payment",
          merchant: "Corporate Strategies Inc",
          date: new Date("2025-04-08"),
          status: "completed",
          balanceAfter: 649950250.0,
        },
        {
          id: "txn-010",
          accountId: "kindest-credit-001",
          type: "debit",
          category: "Dining",
          amount: -485,
          description: "Business Dinner",
          merchant: "Le Bernardin",
          date: new Date("2025-04-05"),
          status: "completed",
          balanceAfter: -121300.0,
        },
        {
          id: "txn-011",
          accountId: "kindest-primary-001",
          type: "debit",
          category: "Real Estate",
          amount: -8750,
          description: "HOA Fees - Luxury Building",
          merchant: "Billionaire Tower HOA",
          date: new Date("2025-04-02"),
          status: "completed",
          balanceAfter: 649941500.0,
        },
        {
          id: "txn-012",
          accountId: "kindest-savings-001",
          type: "transfer",
          category: "Transfer",
          amount: 50000,
          description: "Transfer from Checking",
          merchant: "Internal Transfer",
          date: new Date("2025-03-30"),
          status: "completed",
          balanceAfter: 349995000.0,
        },
        {
          id: "txn-013",
          accountId: "kindest-primary-001",
          type: "transfer",
          category: "Transfer",
          amount: -50000,
          description: "Transfer to Savings",
          merchant: "Internal Transfer",
          date: new Date("2025-03-30"),
          status: "completed",
          balanceAfter: 649950000.0,
        },
        {
          id: "txn-014",
          accountId: "kindest-credit-001",
          type: "credit",
          category: "Payment",
          amount: 2500,
          description: "Credit Card Payment",
          merchant: "Online Payment",
          date: new Date("2025-03-28"),
          status: "completed",
          balanceAfter: -118800.0,
        },
        {
          id: "txn-015",
          accountId: "kindest-primary-001",
          type: "debit",
          category: "Real Estate",
          amount: -185000,
          description: "Real Estate Investment - Commercial Property",
          merchant: "Commercial Realty Partners",
          date: new Date("2025-03-25"),
          status: "completed",
          balanceAfter: 650135000.0,
        },
      ],
      creditScore: 812,
      annualIncome: 890000, // Realistic high income
      employmentStatus: "entrepreneur",
      kycStatus: "verified",
      riskProfile: "high-net-worth",
      preferences: {
        notifications: { email: true, sms: true, push: true },
        statementDelivery: "electronic",
        language: "en",
        currency: "USD",
      },
      createdAt: new Date("2020-01-15"),
      updatedAt: new Date(),
    },
  };

  // Function to get role based on UID or email (synchronous fallback)
  const getRoleForUser = (uid, email) => {
    // First check email-based roles for immediate response
    if (email && PERMANENT_EMAIL_ROLES[email.toLowerCase()]) {
      console.log(
        `🔑 Role assigned by email mapping: ${email} -> ${PERMANENT_EMAIL_ROLES[email.toLowerCase()]}`
      );
      return PERMANENT_EMAIL_ROLES[email.toLowerCase()];
    }
    // Fallback to UID-based roles
    if (uid && PERMANENT_ROLES[uid]) {
      console.log(`🔑 Role assigned by UID: ${uid} -> ${PERMANENT_ROLES[uid]}`);
      return PERMANENT_ROLES[uid];
    }
    console.log(`🔑 Default role assigned: customer`);
    return "customer"; // Default to customer
  };

  // Function to get role based on UID (for backward compatibility)
  const getRoleForUID = (uid) => {
    return PERMANENT_ROLES[uid] || "customer"; // Default to customer
  };

  // Enhanced session management
  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    sessionTimeoutRef.current = setTimeout(() => {
      if (logoutRef.current) {
        logoutRef.current();
      }
    }, SESSION_DURATION);

    setLastActivity(Date.now());
  }, [SESSION_DURATION]);

  // Check for account lockout on component mount
  useEffect(() => {
    const lockoutData = localStorage.getItem("accountLockout");
    if (lockoutData) {
      const { timestamp, attempts } = JSON.parse(lockoutData);
      const timeSinceLockout = Date.now() - timestamp;

      if (timeSinceLockout < LOCKOUT_DURATION) {
        setIsLocked(true);
        setLoginAttempts(attempts);
      } else {
        // Lockout period has expired
        localStorage.removeItem("accountLockout");
        setLoginAttempts(0);
        setIsLocked(false);
      }
    }
  }, []);

  // Monitor authentication state
  useEffect(() => {
    setIsLoading(true);
    setIsUserDataLoading(true);

    // Handle fallback mode
    if (!isFirebaseConfigured) {
      console.log("🔄 Checking mock authentication state");
      const mockUser = firebaseErrorHandler.getMockCurrentUser();

      if (mockUser) {
        setUser(mockUser.firebaseUser);
        setUserData(mockUser.userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setUserData(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
      setIsUserDataLoading(false);
      return;
    }

    unsubscribeRef.current = authService.onAuthStateChanged(
      async (authUser) => {
        if (authUser) {
          try {
            // Check if this is kindestwavelover - use hardcoded data
            const hardcodedData =
              HARDCODED_CUSTOMER_DATA[authUser.email?.toLowerCase()];

            if (hardcodedData) {
              console.log("🎯 Using hardcoded data for", authUser.email);
              const fullUserData = {
                uid: authUser.uid,
                email: authUser.email,
                emailVerified: authUser.emailVerified,
                ...hardcodedData,
                uid: authUser.uid, // Override with real Firebase UID
                email: authUser.email, // Ensure email matches Firebase auth
              };

              setUser(fullUserData);
              setIsAuthenticated(true);
              setUserData(hardcodedData);
              setIsUserDataLoading(false);
              setIsLoading(false);
              resetSessionTimeout();
              return;
            }

            // For other users, try to get user data from Firestore
            const userDoc = await firestoreService.getUserProfile(authUser.uid);

            if (userDoc) {
              // Derive role: prefer Firestore role, fallback to email/UID mapping, else customer
              const derivedRole =
                userDoc.role ||
                getRoleForUser(authUser.uid, authUser.email) ||
                "customer";

              // Get user accounts from user document (accounts are stored in user doc)
              const userAccounts = userDoc.accounts || [];

              const fullUserData = {
                uid: authUser.uid,
                email: authUser.email,
                emailVerified: authUser.emailVerified,
                ...userDoc,
                role: derivedRole,
                accounts: userAccounts, // Add accounts to user data
              };

              setUser(fullUserData);
              setIsAuthenticated(true);
              setUserData({
                ...userDoc,
                role: derivedRole,
                accounts: userAccounts,
              });
              setIsUserDataLoading(false);

              // Set up real-time subscription for user data updates
              if (authUser.uid) {
                try {
                  const userDocListener = firestoreService.subscribeToDocument(
                    "users",
                    authUser.uid,
                    (updatedUserData, error) => {
                      if (error) {
                        console.warn("Error in user data subscription:", error);
                        return;
                      }

                      if (updatedUserData) {
                        console.log(
                          "🔄 User data updated in real-time:",
                          updatedUserData
                        );
                        const updatedFullUserData = {
                          uid: authUser.uid,
                          email: authUser.email,
                          emailVerified: authUser.emailVerified,
                          ...updatedUserData,
                          role: derivedRole,
                        };
                        setUser(updatedFullUserData);
                        setUserData(updatedUserData);
                      }
                    }
                  );

                  // Store listener ID for cleanup
                  window.userDataListenerId = userDocListener;
                } catch (error) {
                  console.warn(
                    "Failed to set up user data subscription:",
                    error
                  );
                }
              }

              // Reset login attempts on successful authentication
              setLoginAttempts(0);
              setIsLocked(false);
              localStorage.removeItem("accountLockout");

              resetSessionTimeout();
            } else {
              // User exists in Firebase Auth but not in Firestore
              console.warn(
                "User authenticated but no profile found in Firestore - creating default profile"
              );

              // Create default user profile with derived role using email/UID mapping as fallback
              const derivedRole =
                getRoleForUser(authUser.uid, authUser.email) || "customer";

              // Extract first and last name from displayName or email
              const fullName =
                authUser.displayName || authUser.email?.split("@")[0] || "User";
              const nameParts = fullName.split(" ");
              const firstName = nameParts[0] || "User";
              const lastName =
                nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

              const defaultProfile = {
                username: authUser.email?.split("@")[0] || "user",
                name: fullName, // Keep for backward compatibility
                firstName: firstName,
                lastName: lastName,
                email: authUser.email,
                role: derivedRole, // Use mapping fallback if available
                permissions:
                  derivedRole === "admin" ? ["full_access"] : ["account_view"],
                status: "active",
                phone: "",
                address: "",
                dateOfBirth: "",
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              };

              try {
                // Create the profile in Firestore
                await firestoreService.createUserProfile(
                  authUser.uid,
                  defaultProfile
                );

                // No accounts yet for new user (will be created later)
                let userAccounts = [];

                const fullUserData = {
                  uid: authUser.uid,
                  email: authUser.email,
                  emailVerified: authUser.emailVerified,
                  ...defaultProfile,
                  accounts: userAccounts,
                };

                setUser(fullUserData);
                setIsAuthenticated(true);
                setUserData({ ...defaultProfile, accounts: userAccounts });
                setIsUserDataLoading(false);

                console.log("Created default user profile successfully");
              } catch (createError) {
                console.error(
                  "Failed to create default user profile:",
                  createError
                );
                // Still set the user with minimal data to prevent blank page
                let userAccounts = [];

                const minimalUserData = {
                  uid: authUser.uid,
                  email: authUser.email,
                  emailVerified: authUser.emailVerified,
                  name:
                    authUser.displayName ||
                    authUser.email?.split("@")[0] ||
                    "User",
                  role: "customer",
                  permissions: ["account_view"],
                  status: "active",
                  accounts: userAccounts,
                };

                setUser(minimalUserData);
                setUserData(minimalUserData);
              }

              // Reset login attempts on successful authentication
              setLoginAttempts(0);
              setIsLocked(false);
              localStorage.removeItem("accountLockout");

              resetSessionTimeout();
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
            setUserData(null);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setUserData(null);
          setIsUserDataLoading(false);

          // Clear session timeout when user logs out
          if (sessionTimeoutRef.current) {
            clearTimeout(sessionTimeoutRef.current);
            sessionTimeoutRef.current = null;
          }
        }

        setIsLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      // Clean up user data subscription
      if (window.userDataListenerId) {
        try {
          firestoreService.unsubscribe(window.userDataListenerId);
          window.userDataListenerId = null;
        } catch (error) {
          console.warn("Error cleaning up user data subscription:", error);
        }
      }
    };
  }, [resetSessionTimeout]);

  // Activity monitoring for session timeout
  useEffect(() => {
    let activityInterval;

    if (user) {
      activityInterval = setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivity;

        if (timeSinceLastActivity >= SESSION_DURATION) {
          logout();
        }
      }, ACTIVITY_CHECK_INTERVAL);

      // Add event listeners for user activity
      const updateActivity = () => {
        setLastActivity(Date.now());
        resetSessionTimeout();
      };

      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
      ];
      events.forEach((event) => {
        document.addEventListener(event, updateActivity, true);
      });

      return () => {
        if (activityInterval) {
          clearInterval(activityInterval);
        }
        events.forEach((event) => {
          document.removeEventListener(event, updateActivity, true);
        });
      };
    }

    return () => {
      if (activityInterval) {
        clearInterval(activityInterval);
      }
    };
  }, [user, lastActivity, resetSessionTimeout]);

  // Set logout ref when logout function changes
  const logout = useCallback(async () => {
    try {
      if (!isFirebaseConfigured) {
        console.log("🔄 Using mock sign out");
        await firebaseErrorHandler.mockSignOut();
      } else {
        await authService.signOut();
      }

      setUser(null);
      setUserData(null);
      setIsAuthenticated(false);
      setLastActivity(Date.now());

      // Clear session data
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }

      // Clean up user data subscription
      if (window.userDataListenerId) {
        try {
          firestoreService.unsubscribe(window.userDataListenerId);
          window.userDataListenerId = null;
        } catch (error) {
          console.warn(
            "Error cleaning up user data subscription during logout:",
            error
          );
        }
      }

      localStorage.removeItem("sessionData");
      localStorage.removeItem("bankDataVersion");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force logout even if there's an error
      setUser(null);
      setUserData(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Generate browser fingerprint for additional security
  const generateFingerprint = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Banking fingerprint", 2, 2);

    return btoa(
      JSON.stringify({
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        canvas: canvas.toDataURL(),
        timestamp: Date.now(),
      })
    );
  };

  // Update user data
  const updateUserData = useCallback(
    async (newData) => {
      if (!user?.uid) return { success: false, error: "No user authenticated" };

      try {
        await firestoreService.updateUserProfile(user.uid, newData);

        const updatedUserData = { ...userData, ...newData };
        const updatedUser = { ...user, ...newData };

        setUserData(updatedUserData);
        setUser(updatedUser);

        return { success: true };
      } catch (error) {
        console.error("Error updating user data:", error);
        return { success: false, error: error.message };
      }
    },
    [user, userData]
  );

  // Login function
  const login = useCallback(
    async (email, password) => {
      if (isLocked) {
        const lockoutData = JSON.parse(localStorage.getItem("accountLockout"));
        const timeRemaining =
          LOCKOUT_DURATION - (Date.now() - lockoutData.timestamp);

        return {
          success: false,
          error: `Account locked. Try again in ${Math.ceil(timeRemaining / 60000)} minutes.`,
        };
      }

      setIsLoading(true);

      try {
        let result;

        // Use fallback authentication if Firebase is not configured
        if (!isFirebaseConfigured) {
          console.log("🔄 Using mock authentication");
          const mockResult = await firebaseErrorHandler.mockSignIn(
            email,
            password
          );

          if (mockResult) {
            setUser(mockResult.firebaseUser);
            setUserData(mockResult.userData);
            setIsAuthenticated(true);
            result = { success: true };
          } else {
            result = { success: false, error: "Invalid credentials" };
          }
        } else {
          result = await authService.signInWithEmail(email, password);
        }

        if (result.success) {
          // Reset login attempts on successful login
          setLoginAttempts(0);
          setIsLocked(false);
          localStorage.removeItem("accountLockout");

          // Create secure session
          const sessionData = {
            loginTime: Date.now(),
            lastActivity: Date.now(),
            userAgent: navigator.userAgent,
            ipFingerprint: generateFingerprint(),
          };

          localStorage.setItem("sessionData", JSON.stringify(sessionData));
          localStorage.setItem("bankDataVersion", "4.0");

          resetSessionTimeout();
          setIsLoading(false);
          return { success: true };
        } else {
          // Handle failed login attempt
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            setIsLocked(true);
            localStorage.setItem(
              "accountLockout",
              JSON.stringify({
                timestamp: Date.now(),
                attempts: newAttempts,
              })
            );
          }

          setIsLoading(false);
          return {
            success: false,
            error: result.error || "Invalid credentials",
            attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - newAttempts),
          };
        }
      } catch (error) {
        console.error("Login error:", error);
        setIsLoading(false);
        return {
          success: false,
          error: "An error occurred during login. Please try again.",
        };
      }
    },
    [isLocked, loginAttempts, resetSessionTimeout]
  );

  // Register function
  const register = useCallback(async (userData) => {
    setIsLoading(true);

    try {
      const result = await authService.signUpWithEmail(
        userData.email,
        userData.password,
        {
          name: userData.name,
          role: userData.role || "customer",
          phone: userData.phone || "",
          address: userData.address || "",
          dateOfBirth: userData.dateOfBirth || "",
        }
      );

      setIsLoading(false);
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      return {
        success: false,
        error: "An error occurred during registration. Please try again.",
      };
    }
  }, []);

  // Password reset function
  const resetPassword = useCallback(async (email) => {
    try {
      const result = await authService.resetPassword(email);
      return result;
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: "An error occurred while sending reset email. Please try again.",
      };
    }
  }, []);

  // Update password function
  const updatePassword = useCallback(async (newPassword) => {
    try {
      const result = await authService.updatePassword(newPassword);
      return result;
    } catch (error) {
      console.error("Password update error:", error);
      return {
        success: false,
        error: "An error occurred while updating password. Please try again.",
      };
    }
  }, []);

  // Clear lockout (admin function)
  const clearLockout = useCallback(() => {
    localStorage.removeItem("accountLockout");
    setLoginAttempts(0);
    setIsLocked(false);
  }, []);

  // Enhanced permissions checking
  const hasPermission = useCallback(
    (permission) => {
      if (!user || !userData) return false;

      // Super admin has all permissions
      if (userData.role === "admin" && userData.permissions?.includes("*")) {
        return true;
      }

      // Check specific permission
      return userData.permissions?.includes(permission) || false;
    },
    [user, userData]
  );

  // Check if user has specific role (email/UID mapping takes precedence)
  const hasRole = useCallback(
    (role) => {
      if (!user) {
        console.log(`🔍 hasRole(${role}): No user found`);
        return false;
      }

      // Email/UID mapping override
      const mappedRole = getRoleForUser(user.uid, user.email);
      if (mappedRole) {
        const mappedResult = mappedRole === role;
        console.log(
          `� hasRole(${role}): Using mapped role ${mappedRole}, result: ${mappedResult}`
        );
        if (mappedResult) return true;
      }

      console.log(`�🔍 hasRole(${role}) check for user:`, {
        uid: user.uid,
        email: user.email,
        userDataRole: userData?.role,
        userRole: user.role,
        isUserDataLoading,
      });

      // Next check: userData from Firestore
      if (userData && userData.role) {
        const result = userData.role === role;
        console.log(
          `✅ hasRole(${role}): Using userData.role = ${userData.role}, result: ${result}`
        );
        if (result) return true;
      }
      // Fallback check: user.role from Firebase Auth
      if (user.role) {
        const result = user.role === role;
        console.log(
          `⚠️ hasRole(${role}): Using user.role = ${user.role}, result: ${result}`
        );
        if (result) return true;
      }

      console.log(`❌ hasRole(${role}): No role match, returning false`);
      return false;
    },
    [user, userData, isUserDataLoading]
  );

  // Check if user can access admin panel
  const canAccessAdminPanel = useCallback(() => {
    return hasRole("admin");
  }, [hasRole]);

  // Check if user can access specific route
  const canAccessRoute = useCallback(
    (requiredPermissions = []) => {
      if (!user || !userData) return false;

      // Admin users have access to all routes
      if (userData.role === "admin") return true;

      // Check if user has all required permissions
      return requiredPermissions.every((permission) =>
        userData.permissions?.includes(permission)
      );
    },
    [user, userData]
  );

  // Get session info
  const getSessionInfo = useCallback(() => {
    const sessionData = localStorage.getItem("sessionData");
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }, []);

  const value = {
    // User state
    user,
    userData,
    isLoading,
    isUserDataLoading,
    isAuthenticated: !!user,

    // Authentication methods
    login,
    logout,
    register,
    resetPassword,
    updatePassword,

    // User management
    updateUserData,

    // Security
    loginAttempts,
    isLocked,
    clearLockout,
    lastActivity,

    // Permissions
    hasPermission,
    hasRole,
    canAccessAdminPanel,
    canAccessRoute,

    // Session
    getSessionInfo,
    resetSessionTimeout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
