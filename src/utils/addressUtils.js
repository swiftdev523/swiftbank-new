// Address formatting utilities

/**
 * Formats an address object into a readable string
 * @param {string|object} address - The address to format (can be string or object)
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return "Not provided";

  // If address is already a string, return it
  if (typeof address === "string") return address || "Not provided";

  // If address is an object, format it as a string
  if (typeof address === "object") {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    if (address.country) parts.push(address.country);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  }

  return "Not provided";
};

/**
 * Formats an address object for form editing (converts object to string)
 * @param {string|object} address - The address to format for editing
 * @returns {string} Formatted address string for input fields
 */
export const getAddressForEditing = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (typeof address === "object") {
    return formatAddress(address);
  }
  return "";
};

/**
 * Formats an address object for display with line breaks
 * @param {string|object} address - The address to format
 * @returns {string} Formatted address with line breaks
 */
export const formatAddressWithLineBreaks = (address) => {
  if (!address) return "Not provided";

  if (typeof address === "string") return address || "Not provided";

  if (typeof address === "object") {
    const lines = [];
    if (address.street) lines.push(address.street);

    const cityStateLine = [];
    if (address.city) cityStateLine.push(address.city);
    if (address.state) cityStateLine.push(address.state);
    if (address.zipCode) cityStateLine.push(address.zipCode);
    if (cityStateLine.length > 0) lines.push(cityStateLine.join(", "));

    if (address.country) lines.push(address.country);

    return lines.length > 0 ? lines.join("\n") : "Not provided";
  }

  return "Not provided";
};

/**
 * Validates an address object
 * @param {object} address - The address object to validate
 * @returns {object} Validation result with isValid and errors array
 */
export const validateAddress = (address) => {
  const errors = [];

  if (!address || typeof address !== "object") {
    return { isValid: false, errors: ["Address is required"] };
  }

  if (!address.street?.trim()) {
    errors.push("Street address is required");
  }

  if (!address.city?.trim()) {
    errors.push("City is required");
  }

  if (!address.state?.trim()) {
    errors.push("State is required");
  }

  if (!address.zipCode?.trim()) {
    errors.push("ZIP code is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
