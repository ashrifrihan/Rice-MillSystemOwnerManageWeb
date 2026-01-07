#!/usr/bin/env node

/**
 * Final CORS & Storage Rules Configuration
 * Uses Firebase CLI with preset responses
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectId = 'ricemill-lk';

console.log('\n🚀 Firebase Storage Configuration\n');
console.log('━'.repeat(70));

// Check files
console.log('\n✅ Checking configuration files...');
const files = {
  'storage.rules': path.join(__dirname, 'storage.rules'),
  'firebase.json': path.join(__dirname, 'firebase.json'),
  'cors.json': path.join(__dirname, 'cors.json')
};

for (const [name, filepath] of Object.entries(files)) {
  if (fs.existsSync(filepath)) {
    console.log(`  ✓ ${name}`);
  } else {
    console.error(`  ✗ ${name} - MISSING`);
    process.exit(1);
  }
}

console.log('\n📝 Configuration Files:');
console.log('─'.repeat(70));

console.log('\n1️⃣  storage.rules:');
const storageRules = fs.readFileSync(files['storage.rules'], 'utf-8');
console.log(storageRules.split('\n').slice(0, 15).join('\n'));
console.log('   ...\n');

console.log('2️⃣  cors.json:');
const corsConfig = JSON.parse(fs.readFileSync(files['cors.json'], 'utf-8'));
console.log(JSON.stringify(corsConfig, null, 2));

console.log('\n━'.repeat(70));
console.log('\n⚙️  Next Steps:\n');

console.log('1️⃣  DEPLOY Storage Rules to Firebase');
console.log('─'.repeat(70));
console.log('Run this command in your terminal:\n');
console.log(`firebase deploy --only storage --project ${projectId}\n`);

console.log('2️⃣  APPLY CORS Configuration');
console.log('─'.repeat(70));
console.log('After deploying storage rules, run:\n');
console.log(`gsutil cors set cors.json gs://ricemill-lk.firebasestorage.app\n`);

console.log('OR if gsutil is not available, go to:\n');
console.log(`https://console.firebase.google.com/project/${projectId}/storage\n`);

console.log('━'.repeat(70));
console.log('\n📋 QUICK CHECKLIST:\n');
console.log('☐ Storage rules file created: storage.rules');
console.log('☐ Firebase config updated: firebase.json');
console.log('☐ CORS config ready: cors.json');
console.log('☐ Ready to deploy\n');

console.log('💡 TIP: If you haven\'t logged in to Firebase CLI, run:');
console.log('   firebase login\n');

// Try to deploy automatically
console.log('🔄 Attempting automatic deployment...\n');

try {
  // Use cross-platform approach for executing firebase deploy
  const args = ['deploy', '--only', 'storage', '--project', projectId];
  
  console.log('Running: firebase ' + args.join(' ') + '\n');
  console.log('━'.repeat(70) + '\n');
  
  // Use stdio: 'inherit' to show real-time output
  execSync(`firebase ${args.join(' ')}`, {
    stdio: 'inherit',
    shell: true
  });
  
  console.log('\n' + '━'.repeat(70));
  console.log('\n✨ SUCCESS! Firebase Storage Rules Deployed!\n');
  console.log('Next: Apply CORS configuration using gsutil or Firebase Console\n');
  
} catch (error) {
  console.log('\n' + '━'.repeat(70));
  console.log('\n⚠️  Deployment requires manual completion\n');
  console.log('Reason: ' + (error.message || error).split('\n')[0]);
  console.log('\n📝 Please run manually:\n');
  console.log(`firebase deploy --only storage --project ${projectId}\n`);
  console.log('━'.repeat(70) + '\n');
}

process.exit(0);
