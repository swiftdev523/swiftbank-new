import React, { useState } from "react";
import {
  TOP_US_BANKS,
  validateRoutingNumber,
  formatRoutingNumber,
} from "../data/usBanks";

const WithdrawModal = ({ isOpen, onClose, accounts = [] }) => {
  const [formData, setFormData] = useState({
    fromAccount: accounts[0]?.accountNumber || "",
    withdrawalType: "atm",
    amount: "",
    atmLocation: "",
    cashDenominations: {
      hundreds: 0,
      fifties: 0,
      twenties: 0,
      tens: 0,
      fives: 0,
      ones: 0,
    },
    recipientName: "",
    recipientAccountNumber: "",
    recipientRoutingNumber: "",
    recipientBankName: "",
    tellerName: "",
    branchLocation: "",
    purpose: "personal",
    description: "",
    memo: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "recipientRoutingNumber") {
      processedValue = formatRoutingNumber(value);
    }

    setFormData({ ...formData, [name]: processedValue });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCashDenomination = (denomination, value) => {
    const newDenominations = {
      ...formData.cashDenominations,
      [denomination]: Math.max(0, parseInt(value) || 0),
    };

    // Calculate total cash amount
    const totalCash =
      newDenominations.hundreds * 100 +
      newDenominations.fifties * 50 +
      newDenominations.twenties * 20 +
      newDenominations.tens * 10 +
      newDenominations.fives * 5 +
      newDenominations.ones * 1;

    setFormData({
      ...formData,
      cashDenominations: newDenominations,
      amount: totalCash.toString(),
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    // Check account balance
    const selectedAccount = accounts.find(
      (acc) => acc.accountNumber === formData.fromAccount
    );
    if (
      selectedAccount &&
      parseFloat(formData.amount) > selectedAccount.availableBalance
    ) {
      newErrors.amount = "Insufficient funds available";
    }

    if (formData.withdrawalType === "external") {
      if (!formData.recipientName.trim()) {
        newErrors.recipientName = "Recipient name is required";
      }
      if (
        !formData.recipientAccountNumber ||
        formData.recipientAccountNumber.length < 8
      ) {
        newErrors.recipientAccountNumber = "Valid account number required";
      }
      if (!validateRoutingNumber(formData.recipientRoutingNumber)) {
        newErrors.recipientRoutingNumber =
          "Valid 9-digit routing number required";
      }
      if (!formData.recipientBankName) {
        newErrors.recipientBankName = "Bank name is required";
      }
    }

    if (
      formData.withdrawalType === "teller" &&
      !formData.branchLocation.trim()
    ) {
      newErrors.branchLocation = "Branch location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert(
        "Transaction could not be completed at the moment. Please contact or visit the bank."
      );
      setTimeout(() => {
        onClose();
        setFormData({
          fromAccount: accounts[0]?.accountNumber || "",
          withdrawalType: "atm",
          amount: "",
          atmLocation: "",
          cashDenominations: {
            hundreds: 0,
            fifties: 0,
            twenties: 0,
            tens: 0,
            fives: 0,
            ones: 0,
          },
          recipientName: "",
          recipientAccountNumber: "",
          recipientRoutingNumber: "",
          recipientBankName: "",
          tellerName: "",
          branchLocation: "",
          purpose: "personal",
          description: "",
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
            <h2 className="text-2xl font-bold text-gray-800">Withdraw Funds</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* From Account Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-3">Withdraw From</h3>
            <select
              name="fromAccount"
              value={formData.fromAccount}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required>
              {accounts.map((account, index) => (
                <option key={index} value={account.accountNumber}>
                  {account.accountType.toUpperCase()} - ****
                  {account.accountNumber?.slice(-4)}
                  (${account.availableBalance?.toLocaleString()} available)
                </option>
              ))}
            </select>
          </div>

          {/* Withdrawal Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Withdrawal Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.withdrawalType === "atm"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="withdrawalType"
                  value="atm"
                  checked={formData.withdrawalType === "atm"}
                  onChange={handleChange}
                  className="mr-3 text-red-600"
                />
                <div>
                  <div className="font-semibold">ATM</div>
                  <div className="text-sm text-gray-600">Cash withdrawal</div>
                  <div className="text-xs text-green-600">$0 fee</div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.withdrawalType === "teller"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="withdrawalType"
                  value="teller"
                  checked={formData.withdrawalType === "teller"}
                  onChange={handleChange}
                  className="mr-3 text-red-600"
                />
                <div>
                  <div className="font-semibold">Teller</div>
                  <div className="text-sm text-gray-600">Branch withdrawal</div>
                  <div className="text-xs text-green-600">$0 fee</div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.withdrawalType === "cashback"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="withdrawalType"
                  value="cashback"
                  checked={formData.withdrawalType === "cashback"}
                  onChange={handleChange}
                  className="mr-3 text-red-600"
                />
                <div>
                  <div className="font-semibold">Cash Back</div>
                  <div className="text-sm text-gray-600">With purchase</div>
                  <div className="text-xs text-green-600">$0 fee</div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.withdrawalType === "external"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="withdrawalType"
                  value="external"
                  checked={formData.withdrawalType === "external"}
                  onChange={handleChange}
                  className="mr-3 text-red-600"
                />
                <div>
                  <div className="font-semibold">External</div>
                  <div className="text-sm text-gray-600">To other bank</div>
                  <div className="text-xs text-orange-600">$3 fee</div>
                </div>
              </label>
            </div>
          </div>

          {/* ATM Details */}
          {formData.withdrawalType === "atm" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ATM Information
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ATM Location (Optional)
                </label>
                <input
                  type="text"
                  name="atmLocation"
                  value={formData.atmLocation}
                  onChange={handleChange}
                  placeholder="ATM address or description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Daily ATM limit: $1,000
                </p>
              </div>
            </div>
          )}

          {/* Teller Details */}
          {formData.withdrawalType === "teller" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Branch Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Location *
                  </label>
                  <input
                    type="text"
                    name="branchLocation"
                    value={formData.branchLocation}
                    onChange={handleChange}
                    placeholder="Branch address or name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                      errors.branchLocation
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.branchLocation && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.branchLocation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teller Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="tellerName"
                    value={formData.tellerName}
                    onChange={handleChange}
                    placeholder="Teller name for reference"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cash Back Details */}
          {formData.withdrawalType === "cashback" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cash Back Information
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium text-blue-800">
                    Cash Back Limits
                  </span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Maximum $60 per transaction</li>
                  <li>
                    • Available at grocery stores, pharmacies, and gas stations
                  </li>
                  <li>• Must make a purchase (minimum $5)</li>
                  <li>• No additional fees</li>
                </ul>
              </div>
            </div>
          )}

          {/* External Transfer Details */}
          {formData.withdrawalType === "external" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                External Transfer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Full name of recipient"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${
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
              </div>
            </div>
          )}

          {/* Amount and Cash Denominations */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Withdrawal Details
            </h3>

            {formData.withdrawalType === "atm" ||
            formData.withdrawalType === "teller" ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Cash Denominations (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "$100 Bills", key: "hundreds", value: 100 },
                    { label: "$50 Bills", key: "fifties", value: 50 },
                    { label: "$20 Bills", key: "twenties", value: 20 },
                    { label: "$10 Bills", key: "tens", value: 10 },
                    { label: "$5 Bills", key: "fives", value: 5 },
                    { label: "$1 Bills", key: "ones", value: 1 },
                  ].map((denom) => (
                    <div key={denom.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {denom.label}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          value={formData.cashDenominations[denom.key]}
                          onChange={(e) =>
                            handleCashDenomination(denom.key, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="0"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          = $
                          {formData.cashDenominations[denom.key] * denom.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-semibold text-red-800">
                    Total from denominations: $
                    {Object.entries(formData.cashDenominations)
                      .reduce((total, [key, count]) => {
                        const values = {
                          hundreds: 100,
                          fifties: 50,
                          twenties: 20,
                          tens: 10,
                          fives: 5,
                          ones: 1,
                        };
                        return total + count * values[key];
                      }, 0)
                      .toLocaleString()}
                  </div>
                </div>

                <div className="text-center text-gray-600 mb-4">OR</div>
              </div>
            ) : null}

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
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 text-lg ${
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="payment">Payment</option>
                  <option value="emergency">Emergency</option>
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
                  placeholder="Withdrawal description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  maxLength="100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Memo (Optional)
                </label>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleChange}
                  placeholder="Additional notes"
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  maxLength="200"
                />
              </div>
            </div>
          </div>

          {/* Limits and Processing Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Withdrawal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">
                  Processing Time:
                </div>
                <div className="text-gray-600">
                  {formData.withdrawalType === "atm" && "Instant"}
                  {formData.withdrawalType === "teller" && "Instant"}
                  {formData.withdrawalType === "cashback" && "Instant"}
                  {formData.withdrawalType === "external" &&
                    "1-3 business days"}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Daily Limits:</div>
                <div className="text-gray-600">
                  {formData.withdrawalType === "atm" && "$1,000"}
                  {formData.withdrawalType === "teller" && "$10,000"}
                  {formData.withdrawalType === "cashback" && "$60"}
                  {formData.withdrawalType === "external" && "$25,000"}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Fee:</div>
                <div className="text-gray-600">
                  {formData.withdrawalType === "external" ? "$3.00" : "$0.00"}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Security:</div>
                <div className="text-gray-600">
                  PIN/ID verification required
                </div>
              </div>
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
              className="flex-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-red-300 disabled:cursor-not-allowed"
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
                `Withdraw $${formData.amount || "0.00"}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
