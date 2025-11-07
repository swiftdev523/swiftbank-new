import React, { useState } from "react";
import {
  TOP_US_BANKS,
  validateRoutingNumber,
  formatRoutingNumber,
} from "../data/usBanks";

const TransferModal = ({ isOpen, onClose, accounts }) => {
  const [formData, setFormData] = useState({
    fromAccount: accounts[0]?.accountNumber || "",
    transferType: "internal",
    toAccount: "",
    recipientName: "",
    recipientAccountNumber: "",
    recipientRoutingNumber: "",
    recipientBankName: "",
    swiftCode: "",
    amount: "",
    description: "Online Transfer",
    purpose: "personal",
    scheduledDate: "",
    memo: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Format routing number as user types
    if (name === "recipientRoutingNumber") {
      processedValue = formatRoutingNumber(value);
    }

    setFormData({ ...formData, [name]: processedValue });

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (formData.transferType === "internal") {
      if (!formData.toAccount) {
        newErrors.toAccount = "Please select destination account";
      }
      if (formData.fromAccount === formData.toAccount) {
        newErrors.toAccount = "Cannot transfer to the same account";
      }
    } else {
      if (!formData.recipientName.trim()) {
        newErrors.recipientName = "Recipient name is required";
      }
      if (
        !formData.recipientAccountNumber ||
        formData.recipientAccountNumber.length < 8
      ) {
        newErrors.recipientAccountNumber =
          "Valid account number required (8-12 digits)";
      }
      if (!validateRoutingNumber(formData.recipientRoutingNumber)) {
        newErrors.recipientRoutingNumber =
          "Valid 9-digit routing number required";
      }
      if (!formData.recipientBankName) {
        newErrors.recipientBankName = "Bank name is required";
      }
      if (formData.transferType === "wire" && !formData.swiftCode) {
        newErrors.swiftCode = "SWIFT code required for wire transfers";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      alert(
        "Transaction could not be completed at the moment. Please contact or visit the bank."
      );
      setTimeout(() => {
        onClose();
        setFormData({
          fromAccount: accounts[0]?.accountNumber || "",
          transferType: "internal",
          toAccount: "",
          recipientName: "",
          recipientAccountNumber: "",
          recipientRoutingNumber: "",
          recipientBankName: "",
          swiftCode: "",
          amount: "",
          description: "Online Transfer",
          purpose: "personal",
          scheduledDate: "",
          memo: "",
        });
      }, 2000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Transfer Funds</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* From Account Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">Transfer From</h3>
            <select
              name="fromAccount"
              value={formData.fromAccount}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required>
              {accounts.map((account, index) => (
                <option key={index} value={account.accountNumber}>
                  {account.accountType.toUpperCase()} - ****
                  {account.accountNumber?.slice(-4)}
                  (${account.balance?.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Type Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Transfer Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.transferType === "internal"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="transferType"
                  value="internal"
                  checked={formData.transferType === "internal"}
                  onChange={handleChange}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-semibold">Internal Transfer</div>
                  <div className="text-sm text-gray-600">
                    Between your accounts
                  </div>
                  <div className="text-xs text-green-600">Free • Instant</div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.transferType === "ach"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="transferType"
                  value="ach"
                  checked={formData.transferType === "ach"}
                  onChange={handleChange}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-semibold">ACH Transfer</div>
                  <div className="text-sm text-gray-600">To external bank</div>
                  <div className="text-xs text-orange-600">
                    $3.00 • 1-3 days
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.transferType === "wire"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="transferType"
                  value="wire"
                  checked={formData.transferType === "wire"}
                  onChange={handleChange}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-semibold">Wire Transfer</div>
                  <div className="text-sm text-gray-600">
                    Same-day processing
                  </div>
                  <div className="text-xs text-red-600">$25.00 • Same day</div>
                </div>
              </label>
            </div>
          </div>

          {/* Internal Transfer Destination */}
          {formData.transferType === "internal" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transfer To
              </label>
              <select
                name="toAccount"
                value={formData.toAccount}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.toAccount ? "border-red-500" : "border-gray-300"
                }`}
                required>
                <option value="">Select destination account...</option>
                {accounts
                  .filter(
                    (account) => account.accountNumber !== formData.fromAccount
                  )
                  .map((account, index) => (
                    <option key={index} value={account.accountNumber}>
                      {account.accountType.toUpperCase()} - ****
                      {account.accountNumber?.slice(-4)}
                      (${account.balance?.toLocaleString()})
                    </option>
                  ))}
              </select>
              {errors.toAccount && (
                <p className="text-red-500 text-sm mt-1">{errors.toAccount}</p>
              )}
            </div>
          )}

          {/* External Transfer Recipient Information */}
          {formData.transferType !== "internal" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recipient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Full legal name as it appears on account"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.recipientName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.recipientName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.recipientName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="recipientAccountNumber"
                    value={formData.recipientAccountNumber}
                    onChange={handleChange}
                    placeholder="8-12 digit account number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.recipientAccountNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    maxLength="12"
                    required
                  />
                  {errors.recipientAccountNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.recipientAccountNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Routing Number *
                  </label>
                  <input
                    type="text"
                    name="recipientRoutingNumber"
                    value={formData.recipientRoutingNumber}
                    onChange={handleChange}
                    placeholder="9-digit routing number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.recipientRoutingNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    maxLength="9"
                    required
                  />
                  {errors.recipientRoutingNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.recipientRoutingNumber}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <select
                    name="recipientBankName"
                    value={formData.recipientBankName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.recipientBankName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required>
                    <option value="">Select recipient's bank...</option>
                    {TOP_US_BANKS.map((bank) => (
                      <option key={bank.id} value={bank.name}>
                        {bank.shortName} - {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors.recipientBankName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.recipientBankName}
                    </p>
                  )}
                </div>

                {formData.transferType === "wire" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SWIFT Code *
                    </label>
                    <input
                      type="text"
                      name="swiftCode"
                      value={formData.swiftCode}
                      onChange={handleChange}
                      placeholder="8-11 character SWIFT/BIC code"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.swiftCode ? "border-red-500" : "border-gray-300"
                      }`}
                      maxLength="11"
                      required
                    />
                    {errors.swiftCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.swiftCode}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amount and Details Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Transfer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-lg font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg ${
                      errors.amount ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="gift">Gift</option>
                  <option value="loan_payment">Loan Payment</option>
                  <option value="investment">Investment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Transfer description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  maxLength="100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Memo (Optional)
                </label>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleChange}
                  placeholder="Additional notes or memo"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  maxLength="200"
                />
              </div>
            </div>
          </div>

          {/* Fees and Processing Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Transfer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">
                  Processing Time:
                </div>
                <div className="text-gray-600">
                  {formData.transferType === "internal" && "Instant"}
                  {formData.transferType === "ach" && "1-3 business days"}
                  {formData.transferType === "wire" &&
                    "Same business day (by 3:00 PM EST)"}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Fee:</div>
                <div className="text-gray-600">
                  {formData.transferType === "internal" && "$0.00"}
                  {formData.transferType === "ach" && "$3.00"}
                  {formData.transferType === "wire" && "$25.00"}
                </div>
              </div>
              {formData.transferType !== "internal" && (
                <>
                  <div>
                    <div className="font-medium text-gray-700">
                      Daily Limit:
                    </div>
                    <div className="text-gray-600">
                      {formData.transferType === "ach" && "$25,000"}
                      {formData.transferType === "wire" && "$100,000"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Security:</div>
                    <div className="text-gray-600">256-bit SSL encryption</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              disabled={isProcessing}>
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isProcessing}>
              {isProcessing ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Transfer $${formData.amount || "0.00"}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
