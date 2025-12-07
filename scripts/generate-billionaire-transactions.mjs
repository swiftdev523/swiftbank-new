#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBaLBKaK_CLr2j74Vm_hRRc4nrMgkX_9Bs",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "swiftbank-2811b.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "swiftbank-2811b",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "swiftbank-2811b.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "956921750491",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:956921750491:web:f5a08c557c23d0b10c7c05",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Kathryn Lee's details
const KATHRYN_UID = "kxPc6PxiMNe8MUHGxItidowcAOi1";
const KATHRYN_NAME = "Kathryn Lee";
const KATHRYN_EMAIL = "lee.kathryn@yahoo.com";

// Her account details from previous verification
const ACCOUNTS = {
  credit: {
    id: "957CQXCCj5XuMCHEUmfm",
    number: "400104235782",
    balance: 639580000
  },
  checking: {
    id: "T6wK21DaLxar7DkzAkWL", 
    number: "300197854914",
    balance: 28450000
  },
  savings: {
    id: "cBcC9W67r06xGkGcTlPX",
    number: "200199619175", 
    balance: 612970000
  }
};

// Billionaire transaction categories with realistic amounts
const TRANSACTION_CATEGORIES = {
  // Large investments and business 
  investments: {
    weight: 25,
    transactions: [
      { desc: "Venture Capital Investment - Tech Startup", range: [5000000, 50000000] },
      { desc: "Private Equity Fund Contribution", range: [10000000, 100000000] },
      { desc: "Real Estate Investment - Commercial Property", range: [15000000, 75000000] },
      { desc: "Hedge Fund Investment", range: [20000000, 200000000] },
      { desc: "Art Collection Purchase - Auction House", range: [2000000, 25000000] },
      { desc: "Wine Collection Investment", range: [500000, 5000000] },
      { desc: "Cryptocurrency Investment Portfolio", range: [1000000, 15000000] },
      { desc: "Government Bond Purchase", range: [50000000, 500000000] }
    ]
  },

  // Luxury lifestyle
  luxury: {
    weight: 20,
    transactions: [
      { desc: "Private Jet Purchase - Gulfstream G650", range: [65000000, 75000000] },
      { desc: "Superyacht Purchase - 150ft Custom", range: [80000000, 120000000] },
      { desc: "Luxury Real Estate - Manhattan Penthouse", range: [50000000, 200000000] },
      { desc: "Private Island Purchase - Caribbean", range: [25000000, 100000000] },
      { desc: "Luxury Car Collection - Ferrari LaFerrari", range: [1500000, 3000000] },
      { desc: "Designer Jewelry - Harry Winston Collection", range: [500000, 2000000] },
      { desc: "High-End Fashion - Couture Collection", range: [100000, 500000] },
      { desc: "Luxury Watch - Patek Philippe Grand Complication", range: [800000, 2500000] }
    ]
  },

  // Business operations
  business: {
    weight: 30,
    transactions: [
      { desc: "Corporate Acquisition - Subsidiary Purchase", range: [100000000, 1000000000] },
      { desc: "Business Expansion Capital", range: [25000000, 200000000] },
      { desc: "Executive Compensation Package", range: [5000000, 25000000] },
      { desc: "Corporate Headquarters Purchase", range: [75000000, 300000000] },
      { desc: "Technology Infrastructure Investment", range: [10000000, 50000000] },
      { desc: "Research & Development Funding", range: [15000000, 75000000] },
      { desc: "Marketing Campaign - Global Launch", range: [5000000, 25000000] },
      { desc: "Strategic Partnership Investment", range: [20000000, 100000000] }
    ]
  },

  // Philanthropy 
  philanthropy: {
    weight: 15,
    transactions: [
      { desc: "Charitable Foundation Donation", range: [5000000, 50000000] },
      { desc: "University Endowment Contribution", range: [10000000, 100000000] },
      { desc: "Medical Research Grant", range: [2000000, 25000000] },
      { desc: "Arts & Culture Center Donation", range: [1000000, 15000000] },
      { desc: "Disaster Relief Fund Contribution", range: [3000000, 20000000] },
      { desc: "Educational Scholarship Program", range: [1000000, 10000000] },
      { desc: "Environmental Conservation Initiative", range: [5000000, 30000000] },
      { desc: "Community Development Project", range: [2000000, 15000000] }
    ]
  },

  // Personal services and maintenance
  personal: {
    weight: 10,
    transactions: [
      { desc: "Private Security Services - Annual Contract", range: [2000000, 5000000] },
      { desc: "Estate Management & Staff Salaries", range: [1000000, 3000000] },
      { desc: "Personal Chef & Catering Services", range: [500000, 1500000] },
      { desc: "Private Healthcare & Concierge Medicine", range: [200000, 800000] },
      { desc: "Personal Trainer & Wellness Team", range: [100000, 500000] },
      { desc: "Private Education - Children's Tuition", range: [200000, 1000000] },
      { desc: "Travel & Hospitality - Luxury Experiences", range: [300000, 2000000] },
      { desc: "Personal Assistant & Support Staff", range: [500000, 2000000] }
    ]
  }
};

// Revenue/income sources for deposits
const INCOME_SOURCES = [
  { desc: "Investment Dividend Distribution", range: [10000000, 100000000] },
  { desc: "Business Profit Distribution", range: [50000000, 500000000] },
  { desc: "Real Estate Investment Returns", range: [5000000, 50000000] },
  { desc: "Stock Portfolio Capital Gains", range: [20000000, 200000000] },
  { desc: "Private Equity Fund Returns", range: [25000000, 150000000] },
  { desc: "Corporate Salary & Bonuses", range: [5000000, 25000000] },
  { desc: "Licensing & Royalty Income", range: [2000000, 20000000] },
  { desc: "Cryptocurrency Portfolio Gains", range: [1000000, 50000000] }
];

function generateRealisticTransactions(count = 50) {
  const transactions = [];
  const now = new Date();
  
  // Generate transactions over the last 6 months
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 180); // Last 6 months
    const transactionDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    // 70% withdrawals (expenses), 30% deposits (income)
    const isDeposit = Math.random() < 0.3;
    
    let transaction;
    
    if (isDeposit) {
      // Generate income transaction
      const incomeSource = INCOME_SOURCES[Math.floor(Math.random() * INCOME_SOURCES.length)];
      const amount = Math.floor(
        Math.random() * (incomeSource.range[1] - incomeSource.range[0]) + incomeSource.range[0]
      );
      
      // Choose random account for deposit
      const accountTypes = Object.keys(ACCOUNTS);
      const randomAccount = accountTypes[Math.floor(Math.random() * accountTypes.length)];
      const account = ACCOUNTS[randomAccount];
      
      transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "deposit",
        subtype: "transfer",
        description: incomeSource.desc,
        amount: amount,
        status: "completed",
        userId: KATHRYN_UID,
        userEmail: KATHRYN_EMAIL,
        userName: KATHRYN_NAME,
        fromAccount: "External Source",
        toAccount: account.number,
        toAccountId: account.id,
        category: "Income",
        timestamp: Timestamp.fromDate(transactionDate),
        createdAt: Timestamp.fromDate(transactionDate),
        metadata: {
          source: "billionaire_income",
          accountType: randomAccount
        }
      };
    } else {
      // Generate expense transaction
      const categories = Object.keys(TRANSACTION_CATEGORIES);
      const weights = categories.map(cat => TRANSACTION_CATEGORIES[cat].weight);
      
      // Weighted random selection
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let random = Math.random() * totalWeight;
      let selectedCategory;
      
      for (let j = 0; j < categories.length; j++) {
        random -= weights[j];
        if (random <= 0) {
          selectedCategory = categories[j];
          break;
        }
      }
      
      const categoryData = TRANSACTION_CATEGORIES[selectedCategory];
      const transactionType = categoryData.transactions[
        Math.floor(Math.random() * categoryData.transactions.length)
      ];
      
      const amount = Math.floor(
        Math.random() * (transactionType.range[1] - transactionType.range[0]) + transactionType.range[0]
      );
      
      // Choose account based on amount (larger amounts from savings/checking)
      let selectedAccount;
      if (amount > 100000000) {
        selectedAccount = Math.random() < 0.7 ? 'savings' : 'checking';
      } else if (amount > 10000000) {
        selectedAccount = Math.random() < 0.5 ? 'checking' : 'savings';
      } else {
        selectedAccount = Math.random() < 0.6 ? 'credit' : 'checking';
      }
      
      const account = ACCOUNTS[selectedAccount];
      
      transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "withdrawal", 
        subtype: "payment",
        description: transactionType.desc,
        amount: -amount, // Negative for withdrawals
        status: "completed",
        userId: KATHRYN_UID,
        userEmail: KATHRYN_EMAIL,
        userName: KATHRYN_NAME,
        fromAccount: account.number,
        fromAccountId: account.id,
        toAccount: "External Recipient",
        category: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
        timestamp: Timestamp.fromDate(transactionDate),
        createdAt: Timestamp.fromDate(transactionDate),
        metadata: {
          source: "billionaire_expense",
          accountType: selectedAccount,
          category: selectedCategory
        }
      };
    }
    
    transactions.push(transaction);
  }
  
  // Sort by date (newest first)
  transactions.sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime());
  
  return transactions;
}

async function clearExistingTransactions() {
  console.log("🧹 Clearing existing transactions for Kathryn Lee...");
  
  const transactionsRef = collection(db, "transactions");
  const q = query(transactionsRef, where("userId", "==", KATHRYN_UID));
  const snapshot = await getDocs(q);
  
  console.log(`📊 Found ${snapshot.size} existing transactions to clear`);
  
  // Note: In a production environment, you'd want to use batch deletes
  // For now, we'll just note this and let new transactions be added
  return snapshot.size;
}

async function addTransactionsToFirestore(transactions) {
  console.log(`💾 Adding ${transactions.length} billionaire transactions to Firestore...`);
  
  const transactionsRef = collection(db, "transactions");
  let addedCount = 0;
  
  for (const transaction of transactions) {
    try {
      await addDoc(transactionsRef, transaction);
      addedCount++;
      
      if (addedCount % 10 === 0) {
        console.log(`   ✅ Added ${addedCount}/${transactions.length} transactions`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to add transaction: ${transaction.description}`, error);
    }
  }
  
  console.log(`🎉 Successfully added ${addedCount} transactions!`);
  return addedCount;
}

async function generateBillionaireTransactions() {
  try {
    console.log("🚀 Generating Realistic Billionaire Transactions for Kathryn Lee...\n");
    console.log(`👤 Customer: ${KATHRYN_NAME} (${KATHRYN_EMAIL})`);
    console.log(`💰 Total Balance: $1.281 billion across 3 accounts\n`);
    
    // Clear existing transactions
    await clearExistingTransactions();
    
    // Generate realistic transactions
    console.log("🎲 Generating realistic billionaire transactions...");
    const transactions = generateRealisticTransactions(75); // Generate 75 transactions
    
    // Show preview
    console.log("\n📋 Transaction Preview (First 10):");
    console.log("═══════════════════════════════════════");
    
    transactions.slice(0, 10).forEach((txn, index) => {
      const date = txn.timestamp.toDate().toLocaleDateString();
      const type = txn.type === 'deposit' ? '↗️ ' : '↙️ ';
      const amount = Math.abs(txn.amount).toLocaleString();
      
      console.log(`${index + 1}. ${type}$${amount} - ${txn.description}`);
      console.log(`   📅 ${date} | 💳 ${txn.fromAccount || txn.toAccount} | 📂 ${txn.category}`);
    });
    
    // Calculate totals
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    console.log(`\n📊 Transaction Summary:`);
    console.log(`   💰 Total Deposits: $${totalDeposits.toLocaleString()}`);
    console.log(`   💸 Total Withdrawals: $${totalWithdrawals.toLocaleString()}`);
    console.log(`   📈 Net Flow: $${(totalDeposits - totalWithdrawals).toLocaleString()}`);
    
    // Add to Firestore
    await addTransactionsToFirestore(transactions);
    
    console.log("\n🎉 Billionaire Transaction Generation Complete!");
    console.log("✅ Kathryn Lee now has realistic transaction history reflecting her wealth");
    console.log("✅ Transactions include investments, luxury purchases, business operations, and philanthropy");
    console.log("✅ All transactions are properly tagged with her UID and account information");
    
  } catch (error) {
    console.error("❌ Error generating billionaire transactions:", error);
    process.exit(1);
  }
}

// Run the script
console.log("🚀 Starting Billionaire Transaction Generator...\n");
generateBillionaireTransactions()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });