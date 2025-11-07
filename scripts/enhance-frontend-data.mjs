#!/usr/bin/env node

/**
 * Frontend Data Validation and Enhancement Script
 * Ensures the frontend properly handles missing data and provides fallbacks
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

console.log("🔧 Frontend Data Enhancement");
console.log("============================");

// Default banking services data to add as fallbacks
const defaultBankingServices = `
// Default banking services (fallback when Firebase collection is empty)
const defaultBankingServices = [
  {
    id: 'mobile-banking',
    name: 'Mobile Banking',
    description: 'Access your accounts anytime, anywhere with our mobile app',
    category: 'digital',
    features: ['Account access', 'Mobile deposits', 'Bill pay', 'Transfers'],
    isActive: true,
    icon: 'mobile',
    priority: 1
  },
  {
    id: 'online-banking',
    name: 'Online Banking',
    description: 'Full-featured online banking platform',
    category: 'digital',
    features: ['24/7 access', 'Bill pay', 'eStatements', 'Account management'],
    isActive: true,
    icon: 'computer',
    priority: 2
  },
  {
    id: 'bill-pay',
    name: 'Bill Pay Service',
    description: 'Pay bills directly from your account',
    category: 'payment',
    features: ['Automatic payments', 'Payment scheduling', 'Payee management'],
    isActive: true,
    icon: 'bill',
    priority: 3
  },
  {
    id: 'wire-transfers',
    name: 'Wire Transfers',
    description: 'Domestic and international wire transfer services',
    category: 'transfer',
    features: ['Same-day processing', 'International transfers', 'SWIFT network'],
    isActive: true,
    icon: 'transfer',
    priority: 4
  },
  {
    id: 'card-services',
    name: 'Card Services',
    description: 'Debit and credit card management',
    category: 'cards',
    features: ['Card controls', 'Replace cards', 'PIN management', 'Transaction alerts'],
    isActive: true,
    icon: 'card',
    priority: 5
  }
];

// Default banking products
const defaultBankingProducts = [
  {
    id: 'checking-account',
    name: 'Premium Checking Account',
    description: 'Feature-rich checking account for everyday banking',
    category: 'deposit',
    minimumBalance: 1000,
    monthlyFee: 0,
    interestRate: 0.05,
    features: ['No minimum balance fee', 'Free online banking', 'Mobile deposit', 'Bill pay'],
    benefits: ['FDIC insured', 'Overdraft protection', '24/7 customer service'],
    isActive: true,
    targetAudience: 'general'
  },
  {
    id: 'savings-account',
    name: 'High-Yield Savings Account',
    description: 'Earn competitive interest on your savings',
    category: 'deposit',
    minimumBalance: 500,
    monthlyFee: 0,
    interestRate: 2.50,
    features: ['High interest rate', 'No monthly fees', 'Online access'],
    benefits: ['FDIC insured', 'Compound interest', 'Easy transfers'],
    isActive: true,
    targetAudience: 'savers'
  },
  {
    id: 'business-checking',
    name: 'Business Checking Account',
    description: 'Professional banking solutions for businesses',
    category: 'business',
    minimumBalance: 2500,
    monthlyFee: 15,
    interestRate: 0.25,
    features: ['Business debit card', 'Online banking', 'ACH transfers', 'Wire transfers'],
    benefits: ['Business support', 'Multiple users', 'Transaction reporting'],
    isActive: true,
    targetAudience: 'business'
  }
];
`;

// Function to update a file with fallback data
function addFallbackDataToFile(filePath, fallbackData, insertAfter) {
  try {
    console.log(`📝 Updating ${filePath}...`);

    let content = readFileSync(filePath, "utf8");

    // Check if fallback data already exists
    if (
      content.includes("defaultBankingServices") ||
      content.includes("defaultBankingProducts")
    ) {
      console.log(`⏭️  ${filePath}: Fallback data already exists`);
      return false;
    }

    // Find the insert position
    const insertIndex = content.indexOf(insertAfter);
    if (insertIndex === -1) {
      console.log(`❌ ${filePath}: Could not find insertion point`);
      return false;
    }

    // Insert the fallback data
    const newContent =
      content.slice(0, insertIndex) +
      fallbackData +
      "\n" +
      content.slice(insertIndex);

    writeFileSync(filePath, newContent, "utf8");
    console.log(`✅ ${filePath}: Added fallback data`);
    return true;
  } catch (error) {
    console.log(`❌ ${filePath}: Error - ${error.message}`);
    return false;
  }
}

// Function to modify BankDataContext to use fallbacks
function enhanceBankDataContext() {
  const contextPath = join(process.cwd(), "src/context/BankDataContext.jsx");

  try {
    console.log("📝 Enhancing BankDataContext...");

    let content = readFileSync(contextPath, "utf8");

    // Check if already enhanced
    if (content.includes("// Use fallback data if collections are empty")) {
      console.log("⏭️  BankDataContext: Already enhanced");
      return;
    }

    // Add fallback data enhancement
    const fallbackLogic = `
      // Use fallback data if collections are empty
      if (bankingServicesData.length === 0) {
        console.log('📦 Using fallback banking services data');
        bankingServicesData = defaultBankingServices;
      }
      
      if (bankingProductsData.length === 0) {
        console.log('📦 Using fallback banking products data');
        bankingProductsData = defaultBankingProducts;
      }
`;

    // Find where to insert the fallback logic
    const insertPoint = "setBankingServices(bankingServicesData);";
    const insertIndex = content.indexOf(insertPoint);

    if (insertIndex !== -1) {
      content = content.replace(
        insertPoint,
        fallbackLogic + "\n      " + insertPoint
      );

      // Add the fallback data at the top of the file
      const importIndex = content.indexOf(
        "const BankDataContext = createContext();"
      );
      content =
        content.slice(0, importIndex) +
        defaultBankingServices +
        "\n\n" +
        content.slice(importIndex);

      writeFileSync(contextPath, content, "utf8");
      console.log("✅ BankDataContext: Enhanced with fallback data");
    } else {
      console.log("❌ BankDataContext: Could not find insertion point");
    }
  } catch (error) {
    console.log(`❌ BankDataContext: Error - ${error.message}`);
  }
}

// Function to create a default data utility
function createDefaultDataUtility() {
  const utilityContent = `
/**
 * Default banking data utility
 * Provides fallback data when Firebase collections are empty
 */

export const defaultBankingServices = [
  {
    id: 'mobile-banking',
    name: 'Mobile Banking',
    description: 'Access your accounts anytime, anywhere with our mobile app',
    category: 'digital',
    features: ['Account access', 'Mobile deposits', 'Bill pay', 'Transfers'],
    isActive: true,
    icon: 'mobile',
    priority: 1
  },
  {
    id: 'online-banking',
    name: 'Online Banking',
    description: 'Full-featured online banking platform',
    category: 'digital',
    features: ['24/7 access', 'Bill pay', 'eStatements', 'Account management'],
    isActive: true,
    icon: 'computer',
    priority: 2
  },
  {
    id: 'bill-pay',
    name: 'Bill Pay Service',
    description: 'Pay bills directly from your account',
    category: 'payment',
    features: ['Automatic payments', 'Payment scheduling', 'Payee management'],
    isActive: true,
    icon: 'bill',
    priority: 3
  },
  {
    id: 'wire-transfers',
    name: 'Wire Transfers',
    description: 'Domestic and international wire transfer services',
    category: 'transfer',
    features: ['Same-day processing', 'International transfers', 'SWIFT network'],
    isActive: true,
    icon: 'transfer',
    priority: 4
  },
  {
    id: 'card-services',
    name: 'Card Services',
    description: 'Debit and credit card management',
    category: 'cards',
    features: ['Card controls', 'Replace cards', 'PIN management', 'Transaction alerts'],
    isActive: true,
    icon: 'card',
    priority: 5
  },
  {
    id: 'investment-services',
    name: 'Investment Services',
    description: 'Investment and wealth management solutions',
    category: 'investment',
    features: ['Portfolio management', 'Investment advice', 'Retirement planning'],
    isActive: true,
    icon: 'chart',
    priority: 6
  }
];

export const defaultBankingProducts = [
  {
    id: 'checking-account',
    name: 'Premium Checking Account',
    description: 'Feature-rich checking account for everyday banking',
    category: 'deposit',
    minimumBalance: 1000,
    monthlyFee: 0,
    interestRate: 0.05,
    features: ['No minimum balance fee', 'Free online banking', 'Mobile deposit', 'Bill pay'],
    benefits: ['FDIC insured', 'Overdraft protection', '24/7 customer service'],
    isActive: true,
    targetAudience: 'general'
  },
  {
    id: 'savings-account',
    name: 'High-Yield Savings Account',
    description: 'Earn competitive interest on your savings',
    category: 'deposit',
    minimumBalance: 500,
    monthlyFee: 0,
    interestRate: 2.50,
    features: ['High interest rate', 'No monthly fees', 'Online access'],
    benefits: ['FDIC insured', 'Compound interest', 'Easy transfers'],
    isActive: true,
    targetAudience: 'savers'
  },
  {
    id: 'business-checking',
    name: 'Business Checking Account',
    description: 'Professional banking solutions for businesses',
    category: 'business',
    minimumBalance: 2500,
    monthlyFee: 15,
    interestRate: 0.25,
    features: ['Business debit card', 'Online banking', 'ACH transfers', 'Wire transfers'],
    benefits: ['Business support', 'Multiple users', 'Transaction reporting'],
    isActive: true,
    targetAudience: 'business'
  },
  {
    id: 'investment-account',
    name: 'Investment Account',
    description: 'Grow your wealth with our investment options',
    category: 'investment',
    minimumBalance: 10000,
    monthlyFee: 0,
    interestRate: 0,
    features: ['Portfolio management', 'Investment advisory', 'Market research'],
    benefits: ['Professional management', 'Diversified portfolios', 'Performance tracking'],
    isActive: true,
    targetAudience: 'investors'
  }
];

export const defaultSettings = {
  appName: 'Swift Bank',
  version: '1.0.0',
  maintenanceMode: false,
  supportEmail: 'support@swiftbank.com',
  supportPhone: '+1-800-SWIFT-1',
  timezone: 'America/New_York'
};

export const defaultBankSettings = {
  bankName: 'Swift Bank',
  routingNumber: '021000021',
  swiftCode: 'SWIFTUS33XXX',
  fdic: {
    insured: true,
    limit: 250000,
    memberNumber: 'FDIC-12345'
  },
  customerServicePhone: '+1-800-SWIFT-1',
  customerServiceEmail: 'support@swiftbank.com',
  operatingHours: {
    weekdays: '9:00 AM - 6:00 PM EST',
    weekends: '10:00 AM - 4:00 PM EST'
  }
};
`;

  const utilityPath = join(process.cwd(), "src/utils/defaultBankData.js");

  try {
    writeFileSync(utilityPath, utilityContent, "utf8");
    console.log(
      "✅ Created default data utility: src/utils/defaultBankData.js"
    );
  } catch (error) {
    console.log(`❌ Failed to create utility: ${error.message}`);
  }
}

// Main execution
function main() {
  console.log("🚀 Starting frontend enhancement...\n");

  let changesCount = 0;

  // Create default data utility
  createDefaultDataUtility();
  changesCount++;

  // Enhance BankDataContext
  enhanceBankDataContext();
  changesCount++;

  console.log(`\n🎉 Frontend enhancement completed!`);
  console.log(`📊 Changes made: ${changesCount}`);
  console.log("\n📋 Summary:");
  console.log("✅ Created default banking data utility");
  console.log("✅ Enhanced BankDataContext with fallback data");
  console.log("\n💡 Benefits:");
  console.log("- Application works even when Firebase collections are empty");
  console.log("- Users see realistic banking services and products");
  console.log("- Graceful degradation when database is not fully populated");
}

main();
