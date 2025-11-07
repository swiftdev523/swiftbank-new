// Banking data utilities
export const getBankingData = (primaryAccount, bankName = "Swift Bank") => {
  const bankingDetails = {
    routingNumber: "021000021",
    accountNumber: primaryAccount?.accountNumber || "****1234",
    accountType: primaryAccount?.type || "Primary Account",
    bankName: bankName,
    branchCode: "SWIFTUS33",
    swiftCode: "SWIFTUS33XXX",
    fdicInsured: true,
    fdicLimit: 250000,
    interestRate: 0.01,
    minimumBalance: 100,
    monthlyFee: 0,
    overdraftProtection: true,
    overdraftLimit: 1000,
    dailyWithdrawalLimit: 5000,
    dailyPurchaseLimit: 25000,
    branchCount: 4700,
    atmCount: 16000,
    customerService: "1-800-SWIFT-BANK",
    onlineBanking: true,
    mobileBanking: true,
    billPay: true,
    wireTransfers: true,
    achTransfers: true,
    internationalTransfers: true,
    cardlessATM: true,
    mobileDeposit: true,
    estatements: true,
    alerts: true,
    fraudProtection: true,
    identityTheft: true,
    encryption: "256-bit SSL",
    twoFactorAuth: true,
  };

  return bankingDetails;
};

export const getMockStatements = () => {
  return [
    {
      month: "March 2025",
      endingBalance: 2850000,
      startingBalance: 2835000,
      transactions: 47,
      interest: 2375,
      fees: 0,
      downloadUrl: "#",
    },
    {
      month: "February 2025",
      endingBalance: 2835000,
      startingBalance: 2820000,
      transactions: 52,
      interest: 2350,
      fees: 0,
      downloadUrl: "#",
    },
    {
      month: "January 2025",
      endingBalance: 2820000,
      startingBalance: 2805000,
      transactions: 38,
      interest: 2333,
      fees: 0,
      downloadUrl: "#",
    },
  ];
};

// Generate account number utility (moved from DashboardOverview)
export const generateAccountNumber = () => {
  return Math.floor(Math.random() * 9000) + 1000;
};
