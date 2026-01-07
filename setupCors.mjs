#!/usr/bin/env node

/**
 * Firebase Storage CORS Configuration Script
 * This script uses gcloud CLI to configure CORS for Firebase Storage
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectId = 'ricemill-lk';
const bucketName = 'ricemill-lk.firebasestorage.app';
const corsFile = path.join(__dirname, 'cors.json');

console.log('\n🔧 Firebase Storage CORS Configuration Tool\n');
console.log('📦 Project: ' + projectId);
console.log('🪣 Bucket: ' + bucketName);

// Read CORS configuration
if (!fs.existsSync(corsFile)) {
  console.error('❌ cors.json file not found!');
  process.exit(1);
}

const corsConfig = JSON.parse(fs.readFileSync(corsFile, 'utf8'));
console.log('\n📋 CORS Configuration:');
console.log(JSON.stringify(corsConfig, null, 2));

console.log('\n⚠️  Checking for Google Cloud SDK...\n');

// Try to auto-apply if gcloud is available
try {
  const version = execSync('gcloud --version', { 
    stdio: 'pipe',
    encoding: 'utf-8' 
  });
  
  console.log('✅ Google Cloud SDK found!\n');

  // Check authentication
  console.log('🔐 Checking authentication status...');
  try {
    const authOutput = execSync('gcloud auth list --format=json', { 
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 5000
    });
    const authData = JSON.parse(authOutput);
    const activeAccount = authData.find(acc => acc.status === 'ACTIVE');
    
    if (activeAccount) {
      console.log('✓ Authenticated as: ' + activeAccount.account);
    } else {
      console.log('ℹ️  No active account found');
      console.log('🔗 Opening authentication browser...\n');
      execSync('gcloud auth login', { stdio: 'inherit' });
    }
  } catch (e) {
    console.log('⚠️  Could not check auth, attempting login...\n');
    try {
      execSync('gcloud auth application-default login', { stdio: 'inherit' });
    } catch (e2) {
      console.log('⚠️  Auth check skipped');
    }
  }

  // Set project
  console.log('\n⚙️  Setting GCP project to: ' + projectId);
  execSync(`gcloud config set project ${projectId}`, { stdio: 'pipe' });
  console.log('✓ Project configured');

  // Apply CORS
  console.log('\n📤 Applying CORS configuration to Firebase Storage...');
  const corsPath = path.resolve(corsFile);
  
  try {
    execSync(`gsutil cors set "${corsPath}" gs://${bucketName}`, { stdio: 'inherit' });
    console.log('\n✓ CORS configuration applied');
  } catch (e) {
    console.error('\n❌ Failed to apply CORS');
    throw e;
  }

  // Verify
  console.log('\n🔍 Verifying CORS configuration...');
  const result = execSync(`gsutil cors get gs://${bucketName}`, {
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  console.log('\n' + result);

  console.log('\n✨ SUCCESS!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 CORS configuration is now active!\n');
  console.log('Next steps:');
  console.log('1. ✅ Clear browser cache (Ctrl+Shift+Delete)');
  console.log('2. ✅ Restart dev server (npm run dev)');
  console.log('3. ✅ Try uploading an image again\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

} catch (error) {
  console.log('\n⚠️  Could not auto-configure CORS\n');
  const errorMsg = error.message || String(error);
  console.log('Reason: ' + errorMsg.split('\n')[0]);
  
  console.log('\n' + '═'.repeat(60));
  console.log('💡 MANUAL SETUP INSTRUCTIONS\n');
  
  console.log('Option 1: Install Google Cloud SDK (Recommended)');
  console.log('─'.repeat(60));
  console.log('1. Download from: https://cloud.google.com/sdk/docs/install');
  console.log('2. Install and restart your terminal');
  console.log('3. Run this script again: node setupCors.mjs\n');

  console.log('Option 2: Use Firebase Console (Quick)');
  console.log('─'.repeat(60));
  console.log('1. Go to: https://console.firebase.google.com');
  console.log('2. Select: ricemill-lk');
  console.log('3. Navigate: Storage > Rules');
  console.log('4. Paste this:\n');
  
  console.log(`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}\n`);
  
  console.log('5. Click Publish\n');

  console.log('Option 3: Use gsutil CLI directly');
  console.log('─'.repeat(60));
  console.log('1. Install Google Cloud SDK');
  console.log('2. Run these commands:\n');
  console.log('   gcloud auth login');
  console.log('   gcloud config set project ' + projectId);
  console.log(`   gsutil cors set cors.json gs://${bucketName}\n`);

  console.log('═'.repeat(60) + '\n');
  
  process.exit(1);
}
