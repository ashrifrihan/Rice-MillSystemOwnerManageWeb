// scripts/seedTransport.cjs
// Seed drivers (workers) and vehicles in Realtime Database if missing
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update } = require('firebase/database');

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

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@colombomill.lk';

const vehiclesSeed = {
  'veh-1': {
    owner_email: OWNER_EMAIL,
    vehicleNumber: 'CAB-7890',
    type: 'Truck',
    capacity: '5000 kg',
    fuelType: 'Diesel',
    status: 'Active',
    insuranceStatus: 'valid',
    insuranceExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
    trackerId: 'TRK-001',
    currentLocation: 'Main Warehouse',
    vehicleImage: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80'
  },
  'veh-2': {
    owner_email: OWNER_EMAIL,
    vehicleNumber: 'CP-4567',
    type: 'Pickup Truck',
    capacity: '2000 kg',
    fuelType: 'Diesel',
    status: 'Active',
    insuranceStatus: 'valid',
    insuranceExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString(),
    trackerId: 'TRK-002',
    currentLocation: 'Yard A',
    vehicleImage: 'https://images.unsplash.com/photo-1502877828070-33b167ad6860?auto=format&fit=crop&w=800&q=80'
  }
};

const driversSeed = {
  'drv-1': {
    owner_email: OWNER_EMAIL,
    name: 'Nimal Perera',
    phone: '+94 76 234 5678',
    role: 'Driver',
    status: 'active',
    experience: '5 years',
    rating: '4.8',
    lastActive: '2 min ago',
    tripsCompleted: 124,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nimal',
    licenseNumber: 'LIC-001',
    currentLocation: 'Main Warehouse',
    preferredVehicleTypes: ['Truck', 'Lorry']
  },
  'drv-2': {
    owner_email: OWNER_EMAIL,
    name: 'Sunil Bandara',
    phone: '+94 71 345 6789',
    role: 'Driver',
    status: 'active',
    experience: '3 years',
    rating: '4.6',
    lastActive: '5 min ago',
    tripsCompleted: 89,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunil',
    licenseNumber: 'LIC-002',
    currentLocation: 'Yard A',
    preferredVehicleTypes: ['Pickup Truck', 'Van']
  }
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const force = process.argv.includes('--force');

async function seedCollection(path, data, label) {
  const snapshot = await get(ref(db, path));
  const existing = snapshot.val() || {};

  // Prepare only missing records unless force is requested
  const updates = {};
  Object.entries(data).forEach(([key, value]) => {
    if (force || !existing[key]) {
      updates[key] = value;
    }
  });

  if (Object.keys(updates).length === 0) {
    console.log(`${label} already exist. Skipping seeding.`);
    return;
  }

  await update(ref(db, path), updates);
  console.log(`Seeded ${label}${force ? ' (forced)' : ''}.`);
}

(async () => {
  try {
    await seedCollection('vehicles', vehiclesSeed, 'vehicles');
    await seedCollection('workers', driversSeed, 'drivers');
    console.log('Transport seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  }
})();
