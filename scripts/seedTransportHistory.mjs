/**
 * seedTransportHistory.mjs
 *
 * Seed completed transport history data to Firebase Realtime Database
 * for testing the Transport History page with realistic completed trip data.
 *
 * Usage:
 *   node scripts/seedTransportHistory.mjs
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

// Firebase web config (for databaseURL)
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Sample completed transport history data
const transportHistoryData = {
  'TRP-2024-001': {
    id: 'TRP-2024-001',
    vehicle: {
      vehicleNumber: 'CAB-7890',
      type: 'Truck',
      capacity: '5000 kg'
    },
    driver: {
      name: 'Nimal Perera',
      phone: '+94 76 234 5678',
      rating: 4.8
    },
    customer: {
      name: 'Colombo Supermarket',
      address: '123 Galle Road, Colombo 03',
      contactPerson: 'Mr. Silva',
      phone: '+94 11 234 5678'
    },
    type: 'Rice Delivery',
    status: 'Delivered',
    proofStatus: 'uploaded',
    startLocation: 'Lanka Rice Mill, Kurunegala',
    endLocation: 'Colombo Supermarket, Colombo 03',
    distance: '95 km',
    duration: '2h 15m',
    deliveredAt: '2024-01-15 14:30',
    products: [
      { name: 'Samba Rice', bags: 50, kgPerBag: 25, totalKG: 1250 },
      { name: 'Nadu Rice', bags: 30, kgPerBag: 25, totalKG: 750 }
    ],
    revenue: 'Rs. 287,500',
    expenses: 'Rs. 45,200',
    profit: 'Rs. 242,300',
    deliveryProof: {
      images: [
        { id: 'IMG001', url: 'https://images.unsplash.com/photo-1583223667854-e7b2c6457568?w=400', caption: 'Delivery at customer location', time: '14:25' },
        { id: 'IMG002', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', caption: 'Unloading completed', time: '14:28' }
      ],
      uploadedAt: '2024-01-15 14:35',
      gpsLocation: '6.9271° N, 79.8612° E',
      notes: 'Delivery completed successfully. Customer satisfied with quality.',
      verifiedBy: 'owner@colombomill.lk'
    },
    owner_email: 'owner@colombomill.lk'
  },
  'TRP-2024-002': {
    id: 'TRP-2024-002',
    vehicle: {
      vehicleNumber: 'CP-4567',
      type: 'Pickup Truck',
      capacity: '2000 kg'
    },
    driver: {
      name: 'Sunil Bandara',
      phone: '+94 71 345 6789',
      rating: 4.6
    },
    customer: {
      name: 'Kandy Restaurant Chain',
      address: '45 Peradeniya Road, Kandy',
      contactPerson: 'Mrs. Fernando',
      phone: '+94 81 223 4455'
    },
    type: 'Rice Delivery',
    status: 'Delivered',
    proofStatus: 'uploaded',
    startLocation: 'Lanka Rice Mill, Kurunegala',
    endLocation: 'Kandy Restaurant Chain, Kandy',
    distance: '120 km',
    duration: '3h 30m',
    deliveredAt: '2024-01-14 16:45',
    products: [
      { name: 'Red Rice', bags: 25, kgPerBag: 25, totalKG: 625 },
      { name: 'Jasmine Rice', bags: 15, kgPerBag: 25, totalKG: 375 }
    ],
    revenue: 'Rs. 125,000',
    expenses: 'Rs. 28,500',
    profit: 'Rs. 96,500',
    deliveryProof: {
      images: [
        { id: 'IMG003', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', caption: 'Arrival at restaurant', time: '16:40' },
        { id: 'IMG004', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', caption: 'Quality check completed', time: '16:43' }
      ],
      uploadedAt: '2024-01-14 16:50',
      gpsLocation: '7.2906° N, 80.6337° E',
      notes: 'Restaurant manager personally inspected the delivery. All bags intact.',
      verifiedBy: 'owner@colombomill.lk'
    },
    owner_email: 'owner@colombomill.lk'
  },
  'TRP-2024-003': {
    id: 'TRP-2024-003',
    vehicle: {
      vehicleNumber: 'WP XY 1234',
      type: 'Van',
      capacity: '1500 kg'
    },
    driver: {
      name: 'Rajesh Kumar',
      phone: '+94 77 123 4567',
      rating: 4.7
    },
    customer: {
      name: 'Galle Distributors',
      address: '78 Matara Road, Galle',
      contactPerson: 'Mr. Jayawardena',
      phone: '+94 91 234 5678'
    },
    type: 'Rice Delivery',
    status: 'Delivered',
    proofStatus: 'pending',
    startLocation: 'Lanka Rice Mill, Kurunegala',
    endLocation: 'Galle Distributors, Galle',
    distance: '180 km',
    duration: '4h 45m',
    deliveredAt: '2024-01-13 18:20',
    products: [
      { name: 'Brown Rice', bags: 35, kgPerBag: 25, totalKG: 875 },
      { name: 'White Rice', bags: 25, kgPerBag: 25, totalKG: 625 }
    ],
    revenue: 'Rs. 187,500',
    expenses: 'Rs. 52,300',
    profit: 'Rs. 135,200',
    deliveryProof: {
      images: [],
      uploadedAt: null,
      gpsLocation: '6.0535° N, 80.2210° E',
      notes: 'Delivery completed but driver forgot to take photos. Will upload tomorrow.',
      verifiedBy: null
    },
    owner_email: 'owner@colombomill.lk'
  },
  'TRP-2024-004': {
    id: 'TRP-2024-004',
    vehicle: {
      vehicleNumber: 'CP XY 3456',
      type: 'Truck',
      capacity: '5000 kg'
    },
    driver: {
      name: 'Anil Fernando',
      phone: '+94 76 456 7890',
      rating: 4.5
    },
    customer: {
      name: 'Silva Restaurants',
      address: 'Hotel Road, Matara',
      contactPerson: 'Mr. Silva',
      phone: '+94 41 678 9012'
    },
    type: 'Rice Delivery',
    status: 'Delivered',
    proofStatus: 'rejected',
    startLocation: 'Lanka Rice Mill, Kurunegala',
    endLocation: 'Silva Restaurants, Matara',
    distance: '150 km',
    duration: '3h 45m',
    deliveredAt: '2024-01-12 17:40',
    products: [
      { name: 'Brown Rice', bags: 40, kgPerBag: 25, totalKG: 1000 },
      { name: 'Jasmine Rice', bags: 20, kgPerBag: 25, totalKG: 500 }
    ],
    revenue: 'Rs. 199,800',
    expenses: 'Rs. 43,100',
    profit: 'Rs. 156,700',
    deliveryProof: {
      images: [
        { id: 'IMG005', url: 'https://images.unsplash.com/photo-1583223667854-e7b2c6457568?w=400', caption: 'Partial delivery', time: '17:35' }
      ],
      uploadedAt: '2024-01-12 17:42',
      gpsLocation: '5.9480° N, 80.5353° E',
      notes: 'Incomplete delivery, missing 5 bags',
      rejectedReason: 'Incomplete delivery documentation',
      verifiedBy: 'owner@colombomill.lk'
    },
    owner_email: 'owner@colombomill.lk'
  },
  'TRP-2024-005': {
    id: 'TRP-2024-005',
    vehicle: {
      vehicleNumber: 'WP CAB 1234',
      type: 'Pickup Truck',
      capacity: '2000 kg'
    },
    driver: {
      name: 'Chaminda Perera',
      phone: '+94 75 987 6543',
      rating: 4.9
    },
    customer: {
      name: 'Negombo Wholesale',
      address: 'Main Street, Negombo',
      contactPerson: 'Mrs. Ratnayake',
      phone: '+94 31 223 4455'
    },
    type: 'Rice Delivery',
    status: 'Delivered',
    proofStatus: 'uploaded',
    startLocation: 'Lanka Rice Mill, Kurunegala',
    endLocation: 'Negombo Wholesale, Negombo',
    distance: '85 km',
    duration: '2h 30m',
    deliveredAt: '2024-01-11 15:15',
    products: [
      { name: 'Samba Rice', bags: 45, kgPerBag: 25, totalKG: 1125 },
      { name: 'Nadu Rice', bags: 30, kgPerBag: 25, totalKG: 750 }
    ],
    revenue: 'Rs. 225,000',
    expenses: 'Rs. 38,700',
    profit: 'Rs. 186,300',
    deliveryProof: {
      images: [
        { id: 'IMG006', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', caption: 'Full delivery completed', time: '15:10' },
        { id: 'IMG007', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', caption: 'Customer signature obtained', time: '15:12' }
      ],
      uploadedAt: '2024-01-11 15:20',
      gpsLocation: '7.2083° N, 79.8385° E',
      notes: 'Perfect delivery. Customer very happy with the service.',
      verifiedBy: 'owner@colombomill.lk'
    },
    owner_email: 'owner@colombomill.lk'
  }
};

async function seedTransportHistory() {
  try {
    console.log('🌱 Seeding transport history data...');

    // Check if data already exists
    const existingSnapshot = await get(ref(db, 'transport_history'));
    const existing = existingSnapshot.val() || {};

    if (Object.keys(existing).length > 0) {
      console.log('📋 Transport history data already exists. Use --force to overwrite.');
      return;
    }

    // Seed the data
    await set(ref(db, 'transport_history'), transportHistoryData);

    console.log('✅ Transport history data seeded successfully!');
    console.log(`📊 Seeded ${Object.keys(transportHistoryData).length} completed trips`);

  } catch (error) {
    console.error('❌ Error seeding transport history:', error);
    process.exit(1);
  }
}

// Run the seeding
seedTransportHistory().then(() => {
  console.log('🎉 Seeding complete!');
  process.exit(0);
});