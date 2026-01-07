// scripts/checkFirebase.cjs
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

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

(async function(){
  try{
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    console.log('Connected to', firebaseConfig.databaseURL);

    const topRef = ref(db, '/');
    const snap = await get(topRef);
    if (!snap.exists()){
      console.log('No data found at root.');
      return;
    }
    const data = snap.val();
    const keys = Object.keys(data || {});
    console.log('Top-level nodes found:', keys.join(', '));

    const checks = ['workers','salaries','products','orders','inventory'];
    for (const k of checks){
      const node = data[k];
      if (node){
        const count = Array.isArray(node) ? node.length : Object.keys(node).length;
        console.log(`${k}: ${count} items`);
      } else {
        console.log(`${k}: not found`);
      }
    }
  }catch(err){
    console.error('Error connecting to Firebase:', err.message || err);
    process.exit(1);
  }
})();
