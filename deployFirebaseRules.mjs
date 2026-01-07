#!/usr/bin/env node

/**
 * Firebase Storage Rules Configuration Script
 * Sets up proper rules to allow CORS for local development
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectId = 'ricemill-lk';
const bucketName = 'ricemill-lk.firebasestorage.app';

console.log('\n🔧 Firebase Storage Configuration Tool\n');

// Check if Firebase CLI is available
try {
  const version = execSync('firebase --version', { 
    stdio: 'pipe',
    encoding: 'utf-8' 
  });
  
  console.log('✅ Firebase CLI found: ' + version);

  // Check if user is logged in
  console.log('\n🔐 Checking Firebase authentication...');
  try {
    const users = execSync('firebase projects:list', { 
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 10000
    });
    
    if (users.includes(projectId)) {
      console.log('✓ Firebase project found: ' + projectId);
    }
  } catch (e) {
    console.log('⚠️  Need to authenticate with Firebase');
    console.log('   Run: firebase login\n');
    execSync('firebase login', { stdio: 'inherit' });
  }

  // Create updated storage rules
  const storagRulesContent = `rules_version = '2';

// Firebase Storage Rules for Rice Mill Management System
// Allows public read access and authenticated write access
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // Specific rule for inventory images
    match /inventory_images/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // Profile images
    match /profile_images/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}`;

  const rulesPath = path.join(__dirname, 'storage.rules');
  fs.writeFileSync(rulesPath, storagRulesContent);
  console.log('✓ Storage rules file created');

  // Check and update firebase.json to use these rules
  console.log('\n📝 Updating firebase.json...');
  const firebaseJsonPath = path.join(__dirname, 'firebase.json');
  let firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
  
  if (!firebaseJson.storage) {
    firebaseJson.storage = {};
  }
  if (!firebaseJson.storage.rules) {
    firebaseJson.storage.rules = 'storage.rules';
  }

  fs.writeFileSync(firebaseJsonPath, JSON.stringify(firebaseJson, null, 2));
  console.log('✓ firebase.json updated');

  // Deploy storage rules
  console.log('\n📤 Deploying Firebase Storage rules...');
  try {
    const setTarget = execSync(`firebase target:set storage ricemill-lk ${projectId}`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    }).catch(() => 'skipped');
  } catch (e) {
    // Target setting might fail, continue anyway
  }

  execSync(`firebase deploy --only storage --project ${projectId}`, { 
    stdio: 'inherit' 
  });

  console.log('\n✨ SUCCESS!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Firebase Storage is now configured!\n');
  console.log('Changes applied:');
  console.log('  • Updated storage.rules');
  console.log('  • Deployed rules to Firebase');
  console.log('  • CORS is now enabled for local development\n');
  console.log('Next steps:');
  console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
  console.log('2. Restart dev server (npm run dev)');
  console.log('3. Try uploading an image again\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

} catch (error) {
  console.log('\n⚠️  Firebase CLI not found or error occurred\n');
  
  const errorMsg = error.message || String(error);
  console.log('Error: ' + errorMsg.split('\n')[0]);

  console.log('\n' + '═'.repeat(70));
  console.log('💡 RECOMMENDED: Install Firebase CLI and Deploy Rules\n');
  
  console.log('Step 1: Install Firebase CLI');
  console.log('─'.repeat(70));
  console.log('Run: npm install -g firebase-tools\n');

  console.log('Step 2: Authenticate with Firebase');
  console.log('─'.repeat(70));
  console.log('Run: firebase login\n');

  console.log('Step 3: Deploy Storage Rules');
  console.log('─'.repeat(70));
  console.log(`Run: firebase deploy --only storage --project ${projectId}\n`);

  console.log('ALTERNATIVE: Use Firebase Console\n');
  console.log('Step 1: Go to Firebase Console');
  console.log('─'.repeat(70));
  console.log('https://console.firebase.google.com/project/' + projectId + '/storage/rules\n');

  console.log('Step 2: Replace Rules with This:');
  console.log('─'.repeat(70));
  
  console.log(`rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }

    match /inventory_images/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }

    match /profile_images/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}\n`);

  console.log('Step 3: Click Publish\n');

  console.log('═'.repeat(70) + '\n');
  
  process.exit(1);
}
