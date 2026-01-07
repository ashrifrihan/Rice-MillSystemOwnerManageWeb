// Create owner account in Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAcBZ7lp9Qf61qu2Hgusm0j4ImUo23ya9E",
  authDomain: "ricemill-lk.firebaseapp.com",
  databaseURL: "https://ricemill-lk-default-rtdb.firebaseio.com",
  projectId: "ricemill-lk",
  storageBucket: "ricemill-lk.firebasestorage.app",
  messagingSenderId: "751522316202",
  appId: "1:751522316202:web:3b032b9443bff6c8f8b5d3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const ownerEmail = 'owner@colombomill.lk';
const ownerPassword = 'password123';
const ownerName = 'Colombo Mill Owner';

async function createOwnerAccount() {
  console.log('🔐 Creating owner account...\n');

  try {
    // Step 1: Create Firebase Auth account
    console.log('Step 1: Creating Firebase Authentication account...');
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, ownerEmail, ownerPassword);
      console.log(`✅ Auth account created: ${userCredential.user.uid}`);
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('⚠️  Auth account already exists, skipping...');
      } else {
        throw authError;
      }
    }

    // Step 2: Create owner profile in database
    console.log('\nStep 2: Creating owner profile in database...');
    const ownerId = 'owner_colombo_001';
    const ownerData = {
      email: ownerEmail,
      name: ownerName,
      role: 'owner',
      firebaseUid: userCredential?.user?.uid || 'pending',
      phone: '+94 11 234 5678',
      business_name: 'Colombo Rice Mill',
      address: '123 Mill Road, Colombo 03, Sri Lanka',
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await set(ref(db, `users/${ownerId}`), ownerData);
    console.log(`✅ Owner profile created: ${ownerId}`);

    // Step 3: Create rice mill entry
    console.log('\nStep 3: Creating rice mill entry...');
    const millId = 'mill_colombo_001';
    const millData = {
      owner_id: ownerId,
      owner_uid: userCredential?.user?.uid || 'pending',
      owner_email: ownerEmail,
      owner_name: ownerName,
      mill_name: 'Colombo Rice Mill',
      business_name: 'Colombo Rice Mill',
      address: '123 Mill Road, Colombo 03, Sri Lanka',
      phone: '+94 11 234 5678',
      email: ownerEmail,
      mill_type: 'rice_mill',
      capacity: 'large',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await set(ref(db, `rice_mills/${millId}`), millData);
    console.log(`✅ Rice mill created: ${millId}`);

    // Step 4: Update owner with mill_id
    console.log('\nStep 4: Linking owner to mill...');
    await set(ref(db, `users/${ownerId}/mill_id`), millId);
    console.log('✅ Owner linked to mill');

    console.log('\n🎉 OWNER ACCOUNT SETUP COMPLETE!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ' + ownerEmail);
    console.log('🔑 Password: ' + ownerPassword);
    console.log('👤 Name:     ' + ownerName);
    console.log('🏭 Mill:     Colombo Rice Mill');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ You can now login to your application!\n');

  } catch (error) {
    console.error('❌ Error creating owner account:', error);
    console.error('Error details:', error.message);
    
    if (error.message && error.message.includes('Permission denied')) {
      console.log('\n⚠️  FIREBASE SECURITY RULES ISSUE:');
      console.log('   Your Firebase Realtime Database has security rules preventing writes.');
      console.log('\n   To fix this:');
      console.log('   1. Go to: https://console.firebase.google.com/');
      console.log('   2. Select your project: ricemill-lk');
      console.log('   3. Go to: Realtime Database → Rules');
      console.log('   4. Temporarily set rules to:');
      console.log('      {');
      console.log('        "rules": {');
      console.log('          ".read": true,');
      console.log('          ".write": true');
      console.log('        }');
      console.log('      }');
      console.log('   5. Click "Publish"');
      console.log('   6. Run this script again');
      console.log('   7. After setup, update rules to secure them again\n');
    }
    
    process.exit(1);
  }

  process.exit(0);
}

createOwnerAccount();
