import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FaPlus,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { useDeveloper } from "../../context/DeveloperContext";

const CreateAdminCustomerModal = ({ isOpen, onClose, onSuccess }) => {
  const { createAdminWithCustomer, isLoading } = useDeveloper();
  const [step, setStep] = useState(1); // 1: Admin, 2: Customer, 3: Review
  const [showPasswords, setShowPasswords] = useState({
    admin: false,
    customer: false,
  });
  const [formData, setFormData] = useState({
    admin: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    customer: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
    },
  });
  const [errors, setErrors] = useState({});

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      // Validate admin data
      if (!formData.admin.firstName.trim())
        newErrors.adminFirstName = "First name is required";
      if (!formData.admin.lastName.trim())
        newErrors.adminLastName = "Last name is required";
      if (!formData.admin.email.trim())
        newErrors.adminEmail = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.admin.email))
        newErrors.adminEmail = "Invalid email format";
      if (!formData.admin.password.trim())
        newErrors.adminPassword = "Password is required";
      else if (formData.admin.password.length < 6)
        newErrors.adminPassword = "Password must be at least 6 characters";
    }

    if (stepNumber === 2) {
      // Validate customer data
      if (!formData.customer.firstName.trim())
        newErrors.customerFirstName = "First name is required";
      if (!formData.customer.lastName.trim())
        newErrors.customerLastName = "Last name is required";
      if (!formData.customer.email.trim())
        newErrors.customerEmail = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.customer.email))
        newErrors.customerEmail = "Invalid email format";
      if (!formData.customer.password.trim())
        newErrors.customerPassword = "Password is required";
      else if (formData.customer.password.length < 6)
        newErrors.customerPassword = "Password must be at least 6 characters";

      // Check if emails are different
      if (formData.admin.email === formData.customer.email) {
        newErrors.customerEmail =
          "Customer email must be different from admin email";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) return;

    try {
      await createAdminWithCustomer(formData.admin, formData.customer);
      onSuccess && onSuccess();
      handleClose();
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      admin: { firstName: "", lastName: "", email: "", password: "" },
      customer: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
      },
    });
    setErrors({});
    setShowPasswords({ admin: false, customer: false });
    onClose && onClose();
  };

  const updateFormData = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));

    // Clear specific error when user starts typing
    const errorKey = `${type}${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Create Admin & Customer
            </h2>
            <p className="text-gray-600 mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${stepNum <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`flex-1 h-1 ${stepNum < step ? "bg-blue-600" : "bg-gray-200"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Admin Details</span>
            <span>Customer Details</span>
            <span>Review & Create</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          {step === 1 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Admin Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.admin.firstName}
                      onChange={(e) =>
                        updateFormData("admin", "firstName", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.adminFirstName ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Enter first name"
                    />
                  </div>
                  {errors.adminFirstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.adminFirstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.admin.lastName}
                      onChange={(e) =>
                        updateFormData("admin", "lastName", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.adminLastName ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Enter last name"
                    />
                  </div>
                  {errors.adminLastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.adminLastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.admin.email}
                    onChange={(e) =>
                      updateFormData("admin", "email", e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.adminEmail ? "border-red-500" : "border-gray-300"}`}
                    placeholder="admin@example.com"
                  />
                </div>
                {errors.adminEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adminEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.admin ? "text" : "password"}
                    value={formData.admin.password}
                    onChange={(e) =>
                      updateFormData("admin", "password", e.target.value)
                    }
                    className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.adminPassword ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter secure password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        admin: !prev.admin,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords.admin ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.adminPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adminPassword}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Customer Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.customer.firstName}
                      onChange={(e) =>
                        updateFormData("customer", "firstName", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.customerFirstName ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Enter first name"
                    />
                  </div>
                  {errors.customerFirstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerFirstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.customer.lastName}
                      onChange={(e) =>
                        updateFormData("customer", "lastName", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.customerLastName ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Enter last name"
                    />
                  </div>
                  {errors.customerLastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerLastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.customer.email}
                    onChange={(e) =>
                      updateFormData("customer", "email", e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.customerEmail ? "border-red-500" : "border-gray-300"}`}
                    placeholder="customer@example.com"
                  />
                </div>
                {errors.customerEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.customer.phone}
                    onChange={(e) =>
                      updateFormData("customer", "phone", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.customer ? "text" : "password"}
                    value={formData.customer.password}
                    onChange={(e) =>
                      updateFormData("customer", "password", e.target.value)
                    }
                    className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.customerPassword ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter secure password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        customer: !prev.customer,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords.customer ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.customerPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerPassword}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Review & Create
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Admin Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    Admin Account
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {formData.admin.firstName} {formData.admin.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {formData.admin.email}
                    </p>
                    <p>
                      <span className="font-medium">Role:</span> Administrator
                    </p>
                  </div>
                </div>

                {/* Customer Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">
                    Customer Account
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {formData.customer.firstName} {formData.customer.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {formData.customer.email}
                    </p>
                    {formData.customer.phone && (
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {formData.customer.phone}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Role:</span> Customer
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Assignment
                </h4>
                <p className="text-sm text-yellow-700">
                  The admin{" "}
                  <strong>
                    {formData.admin.firstName} {formData.admin.lastName}
                  </strong>{" "}
                  will be assigned to manage customer{" "}
                  <strong>
                    {formData.customer.firstName} {formData.customer.lastName}
                  </strong>{" "}
                  exclusively.
                </p>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex space-x-2">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                Back
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>Create Both Accounts</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateAdminCustomerModal;
