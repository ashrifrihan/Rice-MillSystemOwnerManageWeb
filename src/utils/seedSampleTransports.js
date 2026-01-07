/**
 * src/utils/seedSampleTransports.js
 * 
 * Utility to seed sample transport/trip data to Firebase Realtime Database
 * Call from browser console: seedSampleTransports(rtdb)
 */

import { ref, set } from 'firebase/database';

export const sampleTripsData = {
  'sample-trip-001': {
    id: 'sample-trip-001',
    tripId: 'sample-trip-001',
    transportType: 'Rice Delivery',
    status: 'in-transit',
    statusBadge: 'In Transit',
    customer: {
      name: 'Colombo Supermarket',
      phone: '+94771234567',
      address: '123 Galle Road, Colombo 03, Sri Lanka'
    },
    driver: {
      name: 'Nimal Perera',
      phone: '+94762345678',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nimal',
      rating: 4.8,
      completedTrips: 124,
      lastActive: '2 min ago'
    },
    vehicle: {
      id: 'V-001',
      number: 'CAB-7890',
      type: 'Truck',
      capacity: '5000 kg',
      speed: 65,
      temperature: 22,
      fuel: 78,
      battery: 92
    },
    route: {
      start: 'Lanka Rice Mill, Kurunegala',
      destination: 'Colombo Supermarket, Colombo 03',
      distance: 95,
      duration: '2h 15m',
      remainingDistance: 32,
      progress: 66,
      eta: '2025-12-25 16:45',
      currentLocation: {
        lat: 7.4654,
        lng: 80.3658,
        address: 'Near Kegalle Town, Kegalle District'
      }
    },
    products: [
      { name: 'Samba Rice', bags: 50, kgPerBag: 25, pricePerKg: 120, totalKG: 1250 },
      { name: 'Nadu Rice', bags: 30, kgPerBag: 25, pricePerKg: 110, totalKG: 750 },
      { name: 'Red Rice', bags: 20, kgPerBag: 25, pricePerKg: 130, totalKG: 500 }
    ],
    documents: [
      { name: 'Delivery Receipt', type: 'PDF', size: '1.2 MB' },
      { name: 'Invoice', type: 'PDF', size: '850 KB' }
    ],
    alerts: [
      { type: 'traffic', message: 'Traffic delay near Kadawatha', time: '15 min ago', delay: '20 min' }
    ],
    timeline: [
      { step: 'Order Placed', time: '2025-12-25 08:00', completed: true },
      { step: 'Confirmed', time: '2025-12-25 08:15', completed: true },
      { step: 'Vehicle Assigned', time: '2025-12-25 08:30', completed: true },
      { step: 'Driver Started', time: '2025-12-25 09:00', completed: true },
      { step: 'In Transit', time: '2025-12-25 09:15', current: true },
      { step: 'Arriving', time: null, pending: true },
      { step: 'Delivered', time: null, pending: true }
    ],
    lastUpdated: '1 min ago',
    createdAt: Date.now()
  },
  'sample-trip-002': {
    id: 'sample-trip-002',
    tripId: 'sample-trip-002',
    transportType: 'Paddy Pickup',
    status: 'scheduled',
    statusBadge: 'Scheduled',
    customer: {
      name: 'Kandy Farmers Co-op',
      phone: '+94812345678',
      address: 'Peradeniya Road, Kandy, Sri Lanka'
    },
    driver: {
      name: 'Sunil Bandara',
      phone: '+94713456789',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunil',
      rating: 4.6,
      completedTrips: 89,
      lastActive: '1 hour ago'
    },
    vehicle: {
      id: 'V-002',
      number: 'CP-4567',
      type: 'Pickup Truck',
      capacity: '2000 kg',
      speed: 0,
      temperature: 25,
      fuel: 100,
      battery: 100
    },
    route: {
      start: 'Lanka Rice Mill, Kurunegala',
      destination: 'Kandy Farmers Co-op, Kandy',
      distance: 75,
      duration: '1h 45m',
      remainingDistance: 75,
      progress: 0,
      eta: '2025-12-25 15:30',
      currentLocation: {
        lat: 7.4818,
        lng: 80.3609,
        address: 'Lanka Rice Mill Premises, Kurunegala'
      }
    },
    products: [
      { name: 'Raw Paddy', bags: 80, kgPerBag: 25, pricePerKg: 85, totalKG: 2000 }
    ],
    documents: [
      { name: 'Purchase Order', type: 'PDF', size: '950 KB' }
    ],
    alerts: [],
    timeline: [
      { step: 'Order Placed', time: '2025-12-25 10:00', completed: true },
      { step: 'Confirmed', time: '2025-12-25 10:15', completed: true },
      { step: 'Vehicle Assigned', time: '2025-12-25 10:30', current: true },
      { step: 'Driver Started', time: null, pending: true },
      { step: 'In Transit', time: null, pending: true },
      { step: 'Arriving', time: null, pending: true },
      { step: 'Delivered', time: null, pending: true }
    ],
    lastUpdated: '5 min ago',
    createdAt: Date.now()
  },
  'sample-trip-003': {
    id: 'sample-trip-003',
    tripId: 'sample-trip-003',
    transportType: 'Rice Delivery',
    status: 'delivered',
    statusBadge: 'Delivered',
    customer: {
      name: 'Galle City Mart',
      phone: '+94914567890',
      address: 'Hospital Road, Galle, Sri Lanka'
    },
    driver: {
      name: 'Kamal Silva',
      phone: '+94775678901',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kamal',
      rating: 4.9,
      completedTrips: 156,
      lastActive: '30 min ago'
    },
    vehicle: {
      id: 'V-003',
      number: 'GA-1234',
      type: 'Delivery Van',
      capacity: '1500 kg',
      speed: 0,
      temperature: 24,
      fuel: 45,
      battery: 85
    },
    route: {
      start: 'Lanka Rice Mill, Kurunegala',
      destination: 'Galle City Mart, Galle',
      distance: 120,
      duration: '2h 30m',
      remainingDistance: 0,
      progress: 100,
      eta: '2025-12-25 14:00',
      currentLocation: {
        lat: 6.0535,
        lng: 80.2210,
        address: 'Galle City Mart Premises, Galle'
      }
    },
    products: [
      { name: 'Keeri Samba', bags: 40, kgPerBag: 25, pricePerKg: 140, totalKG: 1000 },
      { name: 'White Rice', bags: 20, kgPerBag: 25, pricePerKg: 100, totalKG: 500 }
    ],
    documents: [
      { name: 'Delivery Receipt', type: 'PDF', size: '1.1 MB' },
      { name: 'Customer Sign-off', type: 'PNG', size: '2.3 MB' }
    ],
    alerts: [],
    timeline: [
      { step: 'Order Placed', time: '2025-12-25 06:00', completed: true },
      { step: 'Confirmed', time: '2025-12-25 06:15', completed: true },
      { step: 'Vehicle Assigned', time: '2025-12-25 06:30', completed: true },
      { step: 'Driver Started', time: '2025-12-25 07:00', completed: true },
      { step: 'In Transit', time: '2025-12-25 07:15', completed: true },
      { step: 'Arriving', time: '2025-12-25 09:30', completed: true },
      { step: 'Delivered', time: '2025-12-25 09:45', completed: true }
    ],
    lastUpdated: '30 min ago',
    createdAt: Date.now() - 7200000
  }
};

export const sampleLocationsData = {
  'sample-trip-001': {
    lat: 7.4654,
    lng: 80.3658,
    address: 'Near Kegalle Town, Kegalle District',
    updatedAt: Date.now()
  },
  'sample-trip-002': {
    lat: 7.4818,
    lng: 80.3609,
    address: 'Lanka Rice Mill Premises, Kurunegala',
    updatedAt: Date.now()
  },
  'sample-trip-003': {
    lat: 6.0535,
    lng: 80.2210,
    address: 'Galle City Mart Premises, Galle',
    updatedAt: Date.now() - 1800000
  }
};

/**
 * Seed sample transport data to Firebase Realtime Database
 * @param {object} rtdb - Firebase RTDB instance (from config.jsx)
 * @returns {Promise<void>}
 */
export async function seedSampleTransports(rtdb) {
  try {
    console.log('🌱 Seeding sample transport data...');

    // Seed trips
    console.log('📦 Adding trips...');
    for (const [id, trip] of Object.entries(sampleTripsData)) {
      await set(ref(rtdb, `trips/${id}`), trip);
      console.log(`   ✓ ${id}`);
    }

    // Seed live locations
    console.log('🗺️  Adding live locations...');
    for (const [id, loc] of Object.entries(sampleLocationsData)) {
      await set(ref(rtdb, `liveLocations/${id}`), loc);
      console.log(`   ✓ ${id}`);
    }

    console.log('\n✅ Seeding complete! Refresh the Transport GPS page to see the data.');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
}
