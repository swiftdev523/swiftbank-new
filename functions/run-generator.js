const admin = require("firebase-admin");
admin.initializeApp();

// Import and run the function
const { generateRealisticTransactions } = require("./generate-transactions.js");

generateRealisticTransactions()
  .then(() => {
    console.log("✨ Transaction generation completed!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
