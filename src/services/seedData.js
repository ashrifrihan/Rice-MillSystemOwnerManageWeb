// Simple seed script - run this once
import FirebaseDataService from './src/services/firebaseDataService.js';

console.log('🔄 Checking your Firebase database...');
console.log('This script will add sample data if your database is empty.');

FirebaseDataService.seedMissingData()
  .then(() => {
    console.log('✅ Database check completed');
    console.log('You can now run: npm run dev');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });