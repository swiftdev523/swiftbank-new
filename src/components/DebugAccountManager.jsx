/**
 * conimport React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Try to import firestoreService with error handling
let firestoreService;
try {
  firestoreService = require('../services/firestoreService').default;
} catch (error) {
  console.error('Failed to import firestoreService:', error);
}DebugAccountManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Component loaded successfully!');
  const [accounts, setAccounts] = useState([]);

  // Debug: Log that component is rendering
  console.log('DebugAccountManager rendering, user:', user); Account Manager - Temporary component for testing account creation
 */

import React, { useState } from "react";
import firestoreService from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";

const DebugAccountManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [accounts, setAccounts] = useState([]);

  const generateAccountNumber = () => {
    return (
      "4" +
      Math.floor(Math.random() * 1000000000000000)
        .toString()
        .padStart(15, "0")
    );
  };

  const createTestAccount = async () => {
    if (!user) {
      setMessage("No user logged in");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const accountData = {
        accountType: "Primary Checking",
        accountNumber: generateAccountNumber(),
        balance: 15750.5,
        isActive: true,
        createdAt: new Date(),
        lastTransactionDate: new Date(),
        interestRate: 0.01,
        minimumBalance: 100,
        customerUID: user.uid,
        accountStatus: "active",
        accountFeatures: {
          overdraftProtection: true,
          directDeposit: true,
          onlineBanking: true,
          mobileApp: true,
          atmAccess: true,
          checksEnabled: true,
        },
      };

      // Use firestoreService to create account
      const newAccountId = await firestoreService.create(
        "accounts",
        accountData
      );

      setMessage(`✅ Account created successfully! ID: ${newAccountId}`);

      // Refresh accounts list
      loadAccounts();
    } catch (error) {
      console.error("Error creating account:", error);
      setMessage(`❌ Error creating account: ${error.message}`);
    }

    setLoading(false);
  };

  const loadAccounts = async () => {
    if (!user) return;

    try {
      const userProfile = await firestoreService.getUserProfile(user.uid);
      const userAccounts = userProfile?.accounts || [];
      setAccounts(userAccounts);
      console.log("Loaded accounts:", userAccounts);
    } catch (error) {
      console.error("Error loading accounts:", error);
      setMessage(`❌ Error loading accounts: ${error.message}`);
    }
  };

  const deleteAccount = async (accountId) => {
    if (!window.confirm("Are you sure you want to delete this account?"))
      return;

    setLoading(true);
    try {
      await firestoreService.delete("accounts", accountId);
      setMessage(`✅ Account ${accountId} deleted successfully!`);
      loadAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage(`❌ Error deleting account: ${error.message}`);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  if (!firestoreService) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          Error: FirestoreService could not be loaded. Check console for
          details.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Please log in to use the debug account manager.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔧 Debug Account Manager</h2>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Current User:</h3>
        <p>UID: {user.uid}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>

      <div className="mb-6">
        <button
          onClick={createTestAccount}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 mr-4">
          {loading ? "Creating..." : "Create Test Account"}
        </button>

        <button
          onClick={loadAccounts}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          Reload Accounts
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.includes("✅")
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
          {message}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">
          Current Accounts ({accounts.length})
        </h3>
        {accounts.length === 0 ? (
          <p className="text-gray-500 italic">
            No accounts found for this user.
          </p>
        ) : (
          <div className="space-y-2">
            {accounts.map((account, index) => (
              <div
                key={account.id || index}
                className="p-3 bg-gray-50 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{account.accountType}</p>
                  <p className="text-sm text-gray-600">
                    Account: {account.accountNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Balance: ${account.balance}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {account.accountStatus}
                  </p>
                </div>
                {account.id && (
                  <button
                    onClick={() => deleteAccount(account.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50">
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugAccountManager;
