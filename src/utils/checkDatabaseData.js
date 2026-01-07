// src/utils/checkDatabaseData.js
import { ref, get } from 'firebase/database';
import { rtdb as db } from '../firebase/config';

export const checkDatabaseData = async () => {
  try {
    console.log('🔍 Checking database data...');
    
    const collections = [
      'products',
      'customers', 
      'orders',
      'vehicles',
      'loans',
      'workers',
      'stock_updates',
      'transport_history'
    ];
    
    const results = {};
    
    for (const collection of collections) {
      const collectionRef = ref(db, collection);
      const snapshot = await get(collectionRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const count = Object.keys(data).length;
        results[collection] = {
          exists: true,
          count: count,
          sample: Object.keys(data).slice(0, 3)
        };
        console.log(`✅ ${collection}: ${count} items`, Object.keys(data).slice(0, 3));
      } else {
        results[collection] = {
          exists: false,
          count: 0
        };
        console.log(`❌ ${collection}: No data`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking database:', error);
    return { error: error.message };
  }
};
