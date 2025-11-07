import React, { useState } from "react";

const AuthenticationTester = () => {
  const [message, setMessage] = useState("");

  const handleTest = () => {
    setMessage(
      "Authentication tester is working! The main issue was with invalid credentials. Please try the following:"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🔐 Firebase Authentication Status
            </h1>
            <p className="text-gray-600">
              Based on your Firebase screenshot, you have 3 authentication
              accounts
            </p>
          </div>

          <div className="space-y-6">
            {/* Issue Explanation */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-700 mb-4">
                ❌ Authentication Issue
              </h2>
              <p className="text-red-700 mb-4">
                All test attempts failed with "auth/invalid-credential" errors.
                This means:
              </p>
              <ul className="list-disc list-inside text-red-700 space-y-2">
                <li>
                  The Firebase Auth accounts exist (as shown in your screenshot)
                </li>
                <li>
                  The passwords we tested don't match the actual passwords
                </li>
                <li>
                  You need to either reset the passwords or use the correct ones
                </li>
              </ul>
            </div>

            {/* Available Accounts */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">
                📋 Your Firebase Auth Accounts
              </h2>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border">
                  <div className="font-semibold">developer@swiftbank.com</div>
                  <div className="text-sm text-gray-600">
                    Created: Sep 30, 2025 | Last sign in: Oct 4, 2025
                  </div>
                  <div className="text-sm text-blue-600">
                    Expected role: Developer
                  </div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="font-semibold">seconds@swiftbank.com</div>
                  <div className="text-sm text-gray-600">
                    Created: Oct 2, 2025 | Last sign in: Oct 3, 2025
                  </div>
                  <div className="text-sm text-blue-600">
                    Expected role: Admin
                  </div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="font-semibold">
                    kindestwavelover@gmail.com
                  </div>
                  <div className="text-sm text-gray-600">
                    Created: Oct 2, 2025 | Last sign in: Oct 4, 2025
                  </div>
                  <div className="text-sm text-blue-600">
                    Expected role: Admin
                  </div>
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                ✅ Solutions
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-700 mb-2">
                    Option 1: Use Developer Setup
                  </h3>
                  <p className="text-green-700 mb-2">
                    Create a new developer account with known credentials:
                  </p>
                  <a
                    href="/developer/setup"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                    Go to Developer Setup
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold text-green-700 mb-2">
                    Option 2: Reset Passwords
                  </h3>
                  <p className="text-green-700 mb-2">
                    If you know any of the current passwords, log in manually
                    at:
                  </p>
                  <div className="space-y-2">
                    <a
                      href="/login"
                      className="block w-fit bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      Main Login Page
                    </a>
                    <a
                      href="/admin/login"
                      className="block w-fit bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                      Admin Login Page
                    </a>
                    <a
                      href="/developer/login"
                      className="block w-fit bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                      Developer Login Page
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-green-700 mb-2">
                    Option 3: Password Recovery
                  </h3>
                  <p className="text-green-700">
                    Use Firebase's password reset feature on any login page by
                    clicking "Forgot Password"
                  </p>
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-700 mb-4">
                🔧 Integration Status
              </h2>
              <div className="space-y-2 text-yellow-700">
                <div>✅ Firebase Authentication configured</div>
                <div>✅ User creation with auto-auth account generation</div>
                <div>✅ Role-based dashboard redirects</div>
                <div>✅ Firestore user data integration</div>
                <div>
                  ❌ Unable to test existing accounts (password mismatch)
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-700">{message}</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={handleTest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Show Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationTester;
