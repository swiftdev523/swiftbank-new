import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

const DeveloperSetup = () => {
  const [setupStep, setSetupStep] = useState("check"); // check, create, complete
  const [formData, setFormData] = useState({
    email: "developer@swiftbank.com",
    password: "Developer123!",
    confirmPassword: "Developer123!",
    firstName: "System",
    lastName: "Developer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const checkDeveloperExists = async () => {
    setLoading(true);
    setError("");

    try {
      // Try to sign in with developer credentials
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setSuccess("Developer account exists and credentials are valid!");
      setSetupStep("complete");
    } catch (error) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Developer account not found. Please create it below.");
        setSetupStep("create");
      } else {
        setError(`Error checking account: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const createDeveloperAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      // Create Firestore user document
      const developerData = {
        id: "dev-001",
        uid: user.uid,
        email: formData.email,
        role: "developer",
        firstName: formData.firstName,
        lastName: formData.lastName,
        permissions: ["all"],
        isActive: true,
        canCreateAdmins: true,
        canCreateCustomers: true,
        canModifyRules: true,
        canAccessAllData: true,
        authCreated: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", "dev-001"), developerData);

      setSuccess("Developer account created successfully!");
      setSetupStep("complete");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else {
        setError(`Error creating account: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setSuccess("Login successful! Redirecting to developer dashboard...");

      // Redirect to developer dashboard after short delay
      setTimeout(() => {
        window.location.href = "/developer/dashboard";
      }, 2000);
    } catch (error) {
      setError(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">🔧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Developer Setup
          </h1>
          <p className="text-gray-600">
            Initialize the CL Bank developer account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {setupStep === "check" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="developer@swiftbank.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              onClick={checkDeveloperExists}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {loading ? "Checking..." : "Check Developer Account"}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                This will check if the developer account exists and create it if
                needed.
              </p>
            </div>
          </div>
        )}

        {setupStep === "create" && (
          <form onSubmit={createDeveloperAccount} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {loading ? "Creating Account..." : "Create Developer Account"}
            </button>
          </form>
        )}

        {setupStep === "complete" && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-green-600 text-2xl">✅</span>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Developer Account Ready!
              </h3>
              <p className="text-gray-600 mb-6">
                Your developer account has been successfully set up.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-800 mb-2">
                Login Credentials:
              </h4>
              <p className="text-sm text-gray-600">Email: {formData.email}</p>
              <p className="text-sm text-gray-600">
                Password: {formData.password}
              </p>
            </div>

            <button
              onClick={testLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {loading ? "Logging in..." : "Access Developer Portal"}
            </button>

            <p className="text-xs text-gray-500">
              You can now access the developer dashboard and manage the banking
              system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperSetup;
