import React, { useState } from "react";
import { RealisticTransactionGenerator } from "../../utils/RealisticTransactionGenerator";
import firestoreService from "../../services/firestoreService";
import LoadingSpinner from "../LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const TransactionGenerator = () => {
  const { user } = useAuth(); // Get current authenticated admin user
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const generator = new RealisticTransactionGenerator(firestoreService);

  const handleGenerateTransactions = async () => {
    // Check if user is authenticated
    if (!user || !user.uid) {
      setError("You must be logged in as an admin to generate transactions.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSummary(null);
    setProgress(
      "Starting transaction generation for your assigned customers..."
    );

    try {
      // Pass the current admin's UID to limit transaction generation to their assigned customers
      const result = await generator.generateAllTransactions(
        (progressMessage) => {
          setProgress(progressMessage);
        },
        user.uid // Pass current admin ID
      );

      setSummary(result);
      setProgress("Transaction generation completed successfully!");
    } catch (err) {
      console.error("Transaction generation failed:", err);
      setError(err.message);
      setProgress("");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Transaction Generator
          </h2>
          <p className="text-gray-600">
            Generate realistic banking transactions for your assigned customers,
            including billionaire-level accounts with appropriate scaling
          </p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Important Notice
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Generates up to 100 recent transactions (last 6 months) for
                  YOUR assigned customers only
                </li>
                <li>New transactions will sum to current account balances</li>
                <li>
                  Supports billionaire-level transactions with appropriate
                  scaling
                </li>
                <li>
                  Optimized for fast generation - typically completes in under 2
                  minutes
                </li>
                <li>Make sure account balances are correct before running</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ Features</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Recent transactions (last 6 months)</li>
            <li>• Performance optimized (max 100 per account)</li>
            <li>• Realistic transaction categories</li>
            <li>• Proper chronological ordering</li>
            <li>• Running balance calculations</li>
            <li>• Wealth-appropriate scaling</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            📊 Transaction Types
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Salary & freelance income</li>
            <li>• Business income & executive compensation</li>
            <li>• Luxury investments & private equity</li>
            <li>• Groceries & dining</li>
            <li>• Utilities & bills</li>
            <li>• Shopping & entertainment</li>
            <li>• Luxury purchases & philanthropy</li>
            <li>• Transportation & healthcare</li>
            <li>• ATM withdrawals & fees</li>
          </ul>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleGenerateTransactions}
          disabled={isGenerating}
          className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 ${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105"
          }`}>
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>Generating Transactions...</span>
            </div>
          ) : (
            "Generate Realistic Transactions"
          )}
        </button>
      </div>

      {/* Progress */}
      {progress && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            {isGenerating && <LoadingSpinner size="sm" />}
            <div>
              <p className="text-blue-800 font-medium">Progress</p>
              <p className="text-blue-600 text-sm">{progress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Generation Failed
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            ✅ Generation Complete!
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.totalTransactions.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">Net Flow</p>
              <p
                className={`text-2xl font-bold ${summary.netFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(summary.netFlow)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              🎉 Transactions have been successfully generated! Refresh your
              dashboard to see the new transaction history.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionGenerator;
