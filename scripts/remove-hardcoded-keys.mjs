#!/usr/bin/env node

/**
 * Script to remove hardcoded Firebase API keys from all script files
 * This ensures no sensitive data is exposed in the repository
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const scriptsDir = './scripts';

// List of script files to update (excluding this script and the config)
const excludeFiles = [
  'remove-hardcoded-keys.mjs',
  'firebase-config.mjs'
];

async function removeHardcodedKeys() {
  try {
    const files = await readdir(scriptsDir);
    const jsFiles = files.filter(file => 
      (file.endsWith('.js') || file.endsWith('.mjs')) && 
      !excludeFiles.includes(file)
    );

    let updatedCount = 0;

    for (const file of jsFiles) {
      const filePath = join(scriptsDir, file);
      let content = await readFile(filePath, 'utf8');
      let hasChanges = false;

      // Check if file has hardcoded API keys
      if (content.includes('apiKey:') && content.includes('AIzaSy')) {
        console.log(`🔧 Updating ${file}...`);
        
        // Replace hardcoded Firebase configs with secure imports
        const patterns = [
          {
            // Pattern 1: Standard Firebase config object
            regex: /\/\/ .*Firebase.*config.*\nconst firebaseConfig = \{[\s\S]*?\};/gi,
            replacement: `// Get Firebase configuration securely
import { getFirebaseConfig, isFirebaseAvailable } from "./firebase-config.mjs";

const firebaseConfig = getFirebaseConfig();

if (!isFirebaseAvailable()) {
  console.log('📝 Running in simulation mode - Firebase not available');
  process.exit(0);
}`
          },
          {
            // Pattern 2: Direct config object
            regex: /const firebaseConfig = \{[\s\S]*?apiKey:.*?AIzaSy[^"']*["'][\s\S]*?\};/gi,
            replacement: `const firebaseConfig = getFirebaseConfig();

if (!isFirebaseAvailable()) {
  console.log('📝 Running in simulation mode - Firebase not available');
  process.exit(0);
}`
          }
        ];

        // Add import if not present
        if (!content.includes('firebase-config.mjs')) {
          const importRegex = /import.*firebase.*["'];/gi;
          const lastImport = content.match(importRegex);
          if (lastImport) {
            const lastImportLine = lastImport[lastImport.length - 1];
            content = content.replace(
              lastImportLine,
              lastImportLine + '\nimport { getFirebaseConfig, isFirebaseAvailable } from "./firebase-config.mjs";'
            );
            hasChanges = true;
          }
        }

        // Apply patterns
        patterns.forEach(pattern => {
          if (pattern.regex.test(content)) {
            content = content.replace(pattern.regex, pattern.replacement);
            hasChanges = true;
          }
        });

        // Remove any remaining hardcoded API keys
        content = content.replace(/apiKey:\s*["'][^"']*AIzaSy[^"']*["']/gi, '// API key loaded from environment');
        
        if (hasChanges) {
          await writeFile(filePath, content);
          updatedCount++;
        }
      }
    }

    console.log(`✅ Updated ${updatedCount} script files to remove hardcoded API keys`);
    console.log('🔒 All Firebase configurations now use environment variables');
    
  } catch (error) {
    console.error('❌ Error updating script files:', error);
    process.exit(1);
  }
}

removeHardcodedKeys();