// Top 20 US Banks by Assets
export const TOP_US_BANKS = [
  {
    id: "jpmorgan",
    name: "JPMorgan Chase Bank, N.A.",
    shortName: "Chase",
    routingNumber: "021000021",
    swiftCode: "CHASUS33",
  },
  {
    id: "bankofamerica",
    name: "Bank of America, N.A.",
    shortName: "Bank of America",
    routingNumber: "026009593",
    swiftCode: "BOFAUS3N",
  },
  {
    id: "wellsfargo",
    name: "Wells Fargo Bank, N.A.",
    shortName: "Wells Fargo",
    routingNumber: "121000248",
    swiftCode: "WFBIUS6S",
  },
  {
    id: "citibank",
    name: "Citibank, N.A.",
    shortName: "Citibank",
    routingNumber: "021000089",
    swiftCode: "CITIUS33",
  },
  {
    id: "usbank",
    name: "U.S. Bank National Association",
    shortName: "U.S. Bank",
    routingNumber: "091000019",
    swiftCode: "USBKUS44",
  },
  {
    id: "pnc",
    name: "PNC Bank, National Association",
    shortName: "PNC Bank",
    routingNumber: "043000096",
    swiftCode: "PNCCUS33",
  },
  {
    id: "truist",
    name: "Truist Bank",
    shortName: "Truist",
    routingNumber: "053000196",
    swiftCode: "SNTRUS3A",
  },
  {
    id: "goldmansachs",
    name: "Goldman Sachs Bank USA",
    shortName: "Goldman Sachs Bank",
    routingNumber: "124002971",
    swiftCode: "GSCMUS33",
  },
  {
    id: "td",
    name: "TD Bank, N.A.",
    shortName: "TD Bank",
    routingNumber: "031201360",
    swiftCode: "NRTHUS33",
  },
  {
    id: "capitalone",
    name: "Capital One, N.A.",
    shortName: "Capital One",
    routingNumber: "065000090",
    swiftCode: "HIBKUS44",
  },
  {
    id: "americanexpress",
    name: "American Express National Bank",
    shortName: "American Express Bank",
    routingNumber: "124071889",
    swiftCode: "AENBUS33",
  },
  {
    id: "morganstanley",
    name: "Morgan Stanley Bank, N.A.",
    shortName: "Morgan Stanley Bank",
    routingNumber: "092905278",
    swiftCode: "MSTNUS33",
  },
  {
    id: "ally",
    name: "Ally Bank",
    shortName: "Ally Bank",
    routingNumber: "124003116",
    swiftCode: "IBYNUS33",
  },
  {
    id: "discover",
    name: "Discover Bank",
    shortName: "Discover Bank",
    routingNumber: "011000138",
    swiftCode: "DISEUS33",
  },
  {
    id: "hsbc",
    name: "HSBC Bank USA, National Association",
    shortName: "HSBC Bank USA",
    routingNumber: "021001088",
    swiftCode: "MRMDUS33",
  },
  {
    id: "keybank",
    name: "KeyBank National Association",
    shortName: "KeyBank",
    routingNumber: "041001039",
    swiftCode: "KEYBUS33",
  },
  {
    id: "regions",
    name: "Regions Bank",
    shortName: "Regions Bank",
    routingNumber: "062000019",
    swiftCode: "REGNUS44",
  },
  {
    id: "santander",
    name: "Santander Bank, N.A.",
    shortName: "Santander Bank",
    routingNumber: "231372691",
    swiftCode: "SVRNUS33",
  },
  {
    id: "citizens",
    name: "Citizens Bank, National Association",
    shortName: "Citizens Bank",
    routingNumber: "011500120",
    swiftCode: "CTZIUS33",
  },
  {
    id: "fifththird",
    name: "Fifth Third Bank, National Association",
    shortName: "Fifth Third Bank",
    routingNumber: "042000314",
    swiftCode: "FTBCUS3C",
  },
];

// US States for address validation
export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

// Banking validation utilities
export const validateRoutingNumber = (routingNumber) => {
  if (!routingNumber || routingNumber.length !== 9) {
    return false;
  }

  // ABA routing number checksum validation
  const digits = routingNumber.split("").map(Number);
  const checksum =
    (3 * (digits[0] + digits[3] + digits[6]) +
      7 * (digits[1] + digits[4] + digits[7]) +
      (digits[2] + digits[5] + digits[8])) %
    10;

  return checksum === 0;
};

export const validateAccountNumber = (accountNumber) => {
  // US bank account numbers are typically 8-12 digits
  return /^\d{8,12}$/.test(accountNumber);
};

export const validateSwiftCode = (swiftCode) => {
  // SWIFT codes are 8 or 11 characters (4 bank + 2 country + 2 location + optional 3 branch)
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swiftCode);
};

export const formatRoutingNumber = (value) => {
  // Remove non-digits and limit to 9 digits
  return value.replace(/\D/g, "").slice(0, 9);
};

export const formatAccountNumber = (value) => {
  // Remove non-digits and limit to 12 digits
  return value.replace(/\D/g, "").slice(0, 12);
};

export const formatSwiftCode = (value) => {
  // Convert to uppercase and remove non-alphanumeric
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 11);
};
