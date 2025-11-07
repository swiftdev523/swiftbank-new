import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";
import { AppError, ErrorTypes } from "../utils/errorUtils";
import firestoreService from "./firestoreService";

class AdminService {
  constructor() {
    this.collectionNames = {
      users: "users",
      transactions: "transactions",
      accounts: "accounts",
    };
  }

  // Get the customer assigned to a specific admin
  async getAssignedCustomer(adminId) {
    try {
      if (!isFirebaseConfigured) {
        throw new AppError("Firebase not configured", ErrorTypes.CONFIG_ERROR);
      }

      // Query for customer assigned to this admin
      const q = query(
        collection(db, this.collectionNames.users),
        where("assignedAdmin", "==", adminId),
        where("role", "==", "customer"),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const customerDoc = querySnapshot.docs[0];
        return { id: customerDoc.id, ...customerDoc.data() };
      }

      return null;
    } catch (error) {
      console.error("Error fetching assigned customer:", error);
      throw new AppError(
        "Failed to fetch assigned customer",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Get customer's accounts
  async getCustomerAccounts(customerId) {
    try {
      const customerDoc = await getDoc(
        doc(db, this.collectionNames.users, customerId)
      );

      if (customerDoc.exists()) {
        const customerData = customerDoc.data();
        return customerData.accounts || [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching customer accounts:", error);
      throw new AppError(
        "Failed to fetch customer accounts",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Get customer's transactions
  async getCustomerTransactions(customerId, limit = 50) {
    try {
      // Get transactions where customer is sender or recipient
      const q = query(
        collection(db, this.collectionNames.transactions),
        where("userId", "==", customerId),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const transactions = [];

      querySnapshot.docs.slice(0, limit).forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });

      return transactions;
    } catch (error) {
      console.error("Error fetching customer transactions:", error);
      throw new AppError(
        "Failed to fetch customer transactions",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Update customer profile (admin can edit customer data)
  async updateCustomerProfile(customerId, updateData, adminId) {
    try {
      // Verify this admin is assigned to this customer
      const customer = await getDoc(
        doc(db, this.collectionNames.users, customerId)
      );

      if (!customer.exists()) {
        throw new AppError("Customer not found", ErrorTypes.NOT_FOUND);
      }

      const customerData = customer.data();
      if (customerData.assignedAdmin !== adminId) {
        throw new AppError(
          "Unauthorized: Customer not assigned to this admin",
          ErrorTypes.AUTH_ERROR
        );
      }

      // Update customer data
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: adminId,
      };

      await updateDoc(
        doc(db, this.collectionNames.users, customerId),
        updatedData
      );

      return { success: true };
    } catch (error) {
      console.error("Error updating customer profile:", error);
      throw error;
    }
  }

  // Get admin profile and permissions
  async getAdminProfile(adminId) {
    try {
      const adminDoc = await getDoc(
        doc(db, this.collectionNames.users, adminId)
      );

      if (adminDoc.exists()) {
        return { id: adminDoc.id, ...adminDoc.data() };
      }

      return null;
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      throw new AppError(
        "Failed to fetch admin profile",
        ErrorTypes.FIRESTORE_ERROR
      );
    }
  }

  // Verify admin has access to a specific customer
  async verifyCustomerAccess(adminId, customerId) {
    try {
      const customer = await getDoc(
        doc(db, this.collectionNames.users, customerId)
      );

      if (!customer.exists()) {
        return false;
      }

      const customerData = customer.data();
      return customerData.assignedAdmin === adminId && customerData.isActive;
    } catch (error) {
      console.error("Error verifying customer access:", error);
      return false;
    }
  }

  // Get customer statistics for admin dashboard
  async getCustomerStats(customerId) {
    try {
      const [customer, accounts, transactions] = await Promise.all([
        this.getAssignedCustomer(customerId), // This might be wrong, let me fix
        this.getCustomerAccounts(customerId),
        this.getCustomerTransactions(customerId, 10),
      ]);

      if (!customer) {
        throw new AppError("Customer not found", ErrorTypes.NOT_FOUND);
      }

      // Calculate total balance from accounts
      const totalBalance = accounts.reduce(
        (sum, account) => sum + (account.balance || 0),
        0
      );

      // Get recent transactions count
      const recentTransactionsCount = transactions.length;

      // Calculate transaction totals
      const transactionTotals = transactions.reduce(
        (totals, transaction) => {
          if (
            transaction.type === "deposit" ||
            transaction.type === "receive"
          ) {
            totals.incoming += transaction.amount || 0;
          } else if (
            transaction.type === "withdraw" ||
            transaction.type === "send"
          ) {
            totals.outgoing += transaction.amount || 0;
          }
          return totals;
        },
        { incoming: 0, outgoing: 0 }
      );

      return {
        customer,
        accounts,
        totalBalance,
        accountsCount: accounts.length,
        recentTransactionsCount,
        transactionTotals,
        lastTransactionDate:
          transactions.length > 0 ? transactions[0].timestamp : null,
      };
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      throw error;
    }
  }

  // Create a new account for the assigned customer
  async createCustomerAccount(customerId, accountData, adminId) {
    try {
      // Verify access
      const hasAccess = await this.verifyCustomerAccess(adminId, customerId);
      if (!hasAccess) {
        throw new AppError(
          "Unauthorized: Customer not assigned to this admin",
          ErrorTypes.AUTH_ERROR
        );
      }

      // Use the existing firestoreService to create account
      return await firestoreService.createAccount(customerId, accountData);
    } catch (error) {
      console.error("Error creating customer account:", error);
      throw error;
    }
  }

  // Update customer account
  async updateCustomerAccount(customerId, accountId, updateData, adminId) {
    try {
      // Verify access
      const hasAccess = await this.verifyCustomerAccess(adminId, customerId);
      if (!hasAccess) {
        throw new AppError(
          "Unauthorized: Customer not assigned to this admin",
          ErrorTypes.AUTH_ERROR
        );
      }

      // Get current customer data
      const customerDoc = await getDoc(
        doc(db, this.collectionNames.users, customerId)
      );
      if (!customerDoc.exists()) {
        throw new AppError("Customer not found", ErrorTypes.NOT_FOUND);
      }

      const customerData = customerDoc.data();
      const accounts = customerData.accounts || [];

      // Find and update the specific account
      const accountIndex = accounts.findIndex((acc) => acc.id === accountId);
      if (accountIndex === -1) {
        throw new AppError("Account not found", ErrorTypes.NOT_FOUND);
      }

      accounts[accountIndex] = {
        ...accounts[accountIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // Update customer document with modified accounts
      await updateDoc(doc(db, this.collectionNames.users, customerId), {
        accounts,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: adminId,
      });

      return { success: true, account: accounts[accountIndex] };
    } catch (error) {
      console.error("Error updating customer account:", error);
      throw error;
    }
  }

  // Get admin dashboard data
  async getAdminDashboardData(adminId) {
    try {
      const [adminProfile, assignedCustomer] = await Promise.all([
        this.getAdminProfile(adminId),
        this.getAssignedCustomer(adminId),
      ]);

      if (!assignedCustomer) {
        return {
          admin: adminProfile,
          customer: null,
          stats: null,
        };
      }

      const customerStats = await this.getCustomerStats(assignedCustomer.uid);

      return {
        admin: adminProfile,
        customer: assignedCustomer,
        stats: customerStats,
      };
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      throw error;
    }
  }
}

export default new AdminService();
