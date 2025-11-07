#!/usr/bin/env node

/**
 * Export Firestore data for audit using Firebase CLI
 */

import { exec } from "child_process";
import { promisify } from "util";
import { mkdirSync, existsSync } from "fs";

const execAsync = promisify(exec);

const collections = [
  "users",
  "accounts",
  "transactions",
  "adminAssignments",
  "developers",
  "messages",
  "accountTypes",
];

async function exportCollection(collectionName) {
  try {
    console.log(`📥 Exporting ${collectionName}...`);
    const { stdout, stderr } = await execAsync(
      `firebase firestore:export firestore-export --collection-ids=${collectionName}`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    if (stderr) {
      console.error(`   ⚠️  ${stderr}`);
    }
    console.log(`   ✅ Exported ${collectionName}`);
  } catch (error) {
    console.error(`   ❌ Error exporting ${collectionName}:`, error.message);
  }
}

async function main() {
  console.log("🔄 Exporting Firestore Collections for Audit...\n");

  for (const collection of collections) {
    await exportCollection(collection);
  }

  console.log("\n✅ Export complete! Data saved to firestore-export/");
}

main().catch(console.error);
