// scripts/cleanFirebaseWorkers.cjs
// Safe cleanup utility for Firebase Realtime Database 'workers' node.
// Usage:
//   node scripts/cleanFirebaseWorkers.cjs --dry-run        # preview candidates (default)
//   node scripts/cleanFirebaseWorkers.cjs --delete         # actually delete candidates
//   node scripts/cleanFirebaseWorkers.cjs --month=YYYY-MM  # target salaries month when deleting salaries

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyAcBZ7lp9Qf61qu2Hgusm0j4ImUo23ya9E",
  authDomain: "ricemill-lk.firebaseapp.com",
  databaseURL: "https://ricemill-lk-default-rtdb.firebaseio.com",
  projectId: "ricemill-lk",
  storageBucket: "ricemill-lk.firebasestorage.app",
  messagingSenderId: "751522316202",
  appId: "1:751522316202:web:3b032b9443bff6c8f8b5d3",
  measurementId: "G-32EPZ3W93J"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run') || !argv.includes('--delete');
const doDelete = argv.includes('--delete');
const monthArg = argv.find(a => a.startsWith('--month='));
const targetMonth = monthArg ? monthArg.split('=')[1] : null;

function isLikelyTestWorker(key, worker) {
  // Heuristics to identify test/seeded workers
  if (!worker) return false;

  // 1) salary stored as a formatted string like "Rs. 32,000"
  if (typeof worker.salary === 'string' && /rs\.?\s*\d+/i.test(worker.salary)) return true;

  // 2) photo from dicebear (common for generated avatars)
  if (typeof worker.photo === 'string' && worker.photo.includes('dicebear')) return true;

  // 3) status is 'pending' and no bankAccount or missing essential fields
  if (worker.status === 'pending' && (!worker.bankAccount || !worker.name)) return true;

  // 4) id matches W followed by 6+ digits (some seeded ids use that pattern)
  if (typeof worker.id === 'string' && /^W\d{6,}$/.test(worker.id)) return true;

  return false;
}

async function run() {
  console.log('🔍 Connecting to Firebase Realtime DB (dryRun=%s) ...', dryRun);

  const workersRef = ref(db, 'workers');
  const snapshot = await get(workersRef);
  if (!snapshot.exists()) {
    console.log('No workers node found. Nothing to do.');
    return;
  }

  const data = snapshot.val();
  const keys = Object.keys(data);
  console.log(`Found ${keys.length} workers. Scanning for likely test/seed records...`);

  const candidates = [];
  for (const key of keys) {
    const worker = data[key];
    if (isLikelyTestWorker(key, worker)) {
      candidates.push({ key, worker });
    }
  }

  if (candidates.length === 0) {
    console.log('✅ No likely test workers detected by heuristics.');
    return;
  }

  console.log(`⚠️ Detected ${candidates.length} candidate(s) for removal:`);
  candidates.forEach((c, i) => {
    console.log(`
${i + 1}) key: ${c.key}
   id: ${c.worker.id}
   name: ${c.worker.name}
   email: ${c.worker.email || ''}
   phone: ${c.worker.phone || ''}
   status: ${c.worker.status || ''}
   salary: ${c.worker.salary || ''}
   photo: ${c.worker.photo || ''}
`);
  });

  if (doDelete) {
    console.log('\n🗑️ Deleting candidates...');
    for (const c of candidates) {
      try {
        const wRef = ref(db, `workers/${c.key}`);
        await set(wRef, null);
        console.log(`Deleted workers/${c.key}`);

        if (targetMonth) {
          const sRef = ref(db, `salaries/${targetMonth}/${c.worker.id}`);
          await set(sRef, null);
          console.log(`Deleted salaries/${targetMonth}/${c.worker.id}`);
        }
      } catch (err) {
        console.error('Failed to delete', c.key, err.message || err);
      }
    }
    console.log('\n✅ Deletion complete.');
  } else {
    console.log('\nDry run complete. To delete these records, re-run with --delete (and optionally --month=YYYY-MM to remove salaries).');
  }
}

run().catch(err => {
  console.error('Script failed:', err.message || err);
  process.exit(1);
});
