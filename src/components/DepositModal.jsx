import React, { useState } from "react";
import {
  TOP_US_BANKS,
  validateRoutingNumber,
  formatRoutingNumber,
} from "../data/usBanks";

const DepositModal = ({ isOpen, onClose, accounts = [] }) => {
  const [formData, setFormData] = useState({
    toAccount: accounts[0]?.accountNumber || "",
    depositType: "check",
    amount: "",
    checkNumber: "",
    checkDate: "",
    payerName: "",
    payerBank: "",
    routingNumber: "",
    accountNumber: "",
    bankName: "",
    directDepositEmployer: "",
    wireConfirmation: "",
    cashDenominations: {
      hundreds: 0,
      fifties: 0,
      twenties: 0,
      tens: 0,
      fives: 0,
      ones: 0,
    },
    description: "",
    memo: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "routingNumber") {
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

    if (formData.depositType === "check") {
      if (!formData.checkNumber) {
        newErrors.checkNumber = "Check number is required";
      }
      if (!formData.checkDate) {
        newErrors.checkDate = "Check date is required";
      }
      if (!formData.payerName.trim()) {
        newErrors.payerName = "Payer name is required";
      }
    }

    if (formData.depositType === "ach" || formData.depositType === "external") {
      if (
        !formData.routingNumber ||
        !validateRoutingNumber(formData.routingNumber)
      ) {
        newErrors.routingNumber = "Valid 9-digit routing number required";
      }
      if (!formData.accountNumber || formData.accountNumber.length < 8) {
        newErrors.accountNumber = "Valid account number required";
      }
      if (!formData.bankName) {
        newErrors.bankName = "Bank name is required";
      }
    }

    if (
      formData.depositType === "direct_deposit" &&
      !formData.directDepositEmployer.trim()
    ) {
      newErrors.directDepositEmployer = "Employer name is required";
    }

    if (formData.depositType === "wire" && !formData.wireConfirmation.trim()) {
      newErrors.wireConfirmation = "Wire confirmation number is required";
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
          toAccount: accounts[0]?.accountNumber || "",
          depositType: "check",
          amount: "",
          checkNumber: "",
          checkDate: "",
          payerName: "",
          payerBank: "",
          routingNumber: "",
          accountNumber: "",
          bankName: "",
          directDepositEmployer: "",
          wireConfirmation: "",
          cashDenominations: {
            hundreds: 0,
            fifties: 0,
            twenties: 0,
            tens: 0,
            fives: 0,
            ones: 0,
          },
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
            <h2 className="text-2xl font-bold text-gray-800">Deposit Funds</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Deposit To Account */}
          {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">Deposit To</h3>
              <select
                name="toAccount"
                value={formData.toAccount}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required>
                {accounts.map((account, index) => (
                  <option key={index} value={account.accountNumber}>
                    {account.accountType.toUpperCase()} - ****
                    {account.accountNumber?.slice(-4)}
                    (${account.balance?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div> */}

          {/* Deposit Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Deposit Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.depositType === "check"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="depositType"
                  value="check"
                  checked={formData.depositType === "check"}
                  onChange={handleChange}
                  className="mr-3 text-green-600"
                />
                <div>
                  <div className="font-semibold">Check Deposit</div>
                  <div className="text-sm text-gray-600">
                    Paper or mobile check
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.depositType === "cash"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="depositType"
                  value="cash"
                  checked={formData.depositType === "cash"}
                  onChange={handleChange}
                  className="mr-3 text-green-600"
                />
                <div>
                  <div className="font-semibold">Cash Deposit</div>
                  <div className="text-sm text-gray-600">ATM or teller</div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.depositType === "ach"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="depositType"
                  value="ach"
                  checked={formData.depositType === "ach"}
                  onChange={handleChange}
                  className="mr-3 text-green-600"
                />
                <div>
                  <div className="font-semibold">ACH Transfer</div>
                  <div className="text-sm text-gray-600">
                    Electronic transfer
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.depositType === "wire"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="depositType"
                  value="wire"
                  checked={formData.depositType === "wire"}
                  onChange={handleChange}
                  className="mr-3 text-green-600"
                />
                <div>
                  <div className="font-semibold">Wire Transfer</div>
                  <div className="text-sm text-gray-600">Incoming wire</div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.depositType === "direct_deposit"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="depositType"
                  value="direct_deposit"
                  checked={formData.depositType === "direct_deposit"}
                  onChange={handleChange}
                  className="mr-3 text-green-600"
                />
                <div>
                  <div className="font-semibold">Direct Deposit</div>
                  <div className="text-sm text-gray-600">
                    Payroll or benefits
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.depositType === "external"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <input
                  type="radio"
                  name="depositType"
                  value="external"
                  checked={formData.depositType === "external"}
                  onChange={handleChange}
                  className="mr-3 text-green-600"
                />
                <div>
                  <div className="font-semibold">External Bank</div>
                  <div className="text-sm text-gray-600">From another bank</div>
                </div>
              </label>
            </div>
          </div>

          {/* Check Deposit Details */}
          {formData.depositType === "check" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Check Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check Number *
                  </label>
                  <input
                    type="text"
                    name="checkNumber"
                    value={formData.checkNumber}
                    onChange={handleChange}
                    placeholder="Check number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.checkNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.checkNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.checkNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check Date *
                  </label>
                  <input
                    type="date"
                    name="checkDate"
                    value={formData.checkDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.checkDate ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.checkDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.checkDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payer Name *
                  </label>
                  <input
                    type="text"
                    name="payerName"
                    value={formData.payerName}
                    onChange={handleChange}
                    placeholder="Name on check"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.payerName ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.payerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.payerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payer Bank
                  </label>
                  <input
                    type="text"
                    name="payerBank"
                    value={formData.payerBank}
                    onChange={handleChange}
                    placeholder="Bank name on check"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cash Deposit Details */}
          {formData.depositType === "cash" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cash Denominations
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "$100 Bills", key: "hundreds", value: 100 },
                  { label: "$50 Bills", key: "fifties", value: 50 },
                  { label: "$20 Bills", key: "twenties", value: 20 },
                  { label: "$10 Bills", key: "tens", value: 10 },
                  { label: "$5 Bills", key: "fives", value: 5 },
                  { label: "$1 Bills", key: "ones", value: 1 },
                ].map((denom) => (
                  <div key={denom.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        = ${formData.cashDenominations[denom.key] * denom.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-800">
                  Total Cash: $
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
            </div>
          )}

          {/* ACH/External Bank Details */}
          {(formData.depositType === "ach" ||
            formData.depositType === "external") && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                External Bank Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Routing Number *
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={handleChange}
                    placeholder="9-digit routing number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.routingNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    maxLength="9"
                    required
                  />
                  {errors.routingNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.routingNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="8-12 digit account number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.accountNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    maxLength="12"
                    required
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.accountNumber}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.bankName ? "border-red-500" : "border-gray-300"
                    }`}
                    required>
                    <option value="">Select sending bank...</option>
                    {TOP_US_BANKS.map((bank) => (
                      <option key={bank.id} value={bank.name}>
                        {bank.shortName} - {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors.bankName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.bankName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Direct Deposit Details */}
          {formData.depositType === "direct_deposit" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Direct Deposit Information
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employer/Payer Name *
                </label>
                <input
                  type="text"
                  name="directDepositEmployer"
                  value={formData.directDepositEmployer}
                  onChange={handleChange}
                  placeholder="Company or organization name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.directDepositEmployer
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors.directDepositEmployer && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.directDepositEmployer}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Wire Transfer Details */}
          {formData.depositType === "wire" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Wire Transfer Information
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wire Confirmation Number *
                </label>
                <input
                  type="text"
                  name="wireConfirmation"
                  value={formData.wireConfirmation}
                  onChange={handleChange}
                  placeholder="Wire transfer confirmation number"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.wireConfirmation
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors.wireConfirmation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.wireConfirmation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Amount and Description */}
          {formData.depositType !== "cash" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Deposit Amount
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-lg ${
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
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Deposit description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    maxLength="100"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Memo (Optional)
                </label>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleChange}
                  placeholder="Additional notes"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  maxLength="200"
                />
              </div>
            </div>
          )}

          {/* Processing Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Processing Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">
                  Processing Time:
                </div>
                <div className="text-gray-600">
                  {formData.depositType === "cash" && "Instant"}
                  {formData.depositType === "check" && "1-2 business days"}
                  {formData.depositType === "ach" && "1-3 business days"}
                  {formData.depositType === "wire" && "Same business day"}
                  {formData.depositType === "direct_deposit" &&
                    "Next business day"}
                  {formData.depositType === "external" && "2-3 business days"}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Availability:</div>
                <div className="text-gray-600">
                  {formData.depositType === "cash" && "Immediate"}
                  {formData.depositType === "check" && "Up to 5 business days"}
                  {formData.depositType === "ach" && "1-3 business days"}
                  {formData.depositType === "wire" && "Same day"}
                  {formData.depositType === "direct_deposit" &&
                    "Next business day"}
                  {formData.depositType === "external" && "2-5 business days"}
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
              className="flex-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-green-300 disabled:cursor-not-allowed"
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
                `Deposit $${formData.amount || "0.00"}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;
