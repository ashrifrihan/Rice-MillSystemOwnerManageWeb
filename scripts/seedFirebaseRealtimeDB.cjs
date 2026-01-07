// scripts/seedFirebaseRealtimeDB.js
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

// Your Firebase configuration
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

const seedData = {
  // Products
  "products/prod_001": {
    "rice_mill_id": "mill_001",
    "name": "Samba Rice (Grade A)",
    "type": "Polished",
    "category": "Samba Rice",
    "price_per_kg": 250,
    "stock_quantity": 5000,
    "stock_status": "available",
    "min_order_kg": 50,
    "is_active": true,
    "created_at": "2024-01-15T08:30:00Z",
    "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    "description": "Premium quality Samba rice, fragrant and long grain",
    "rating": 4.7,
    "is_top_selling": true
  },
  "products/prod_002": {
    "rice_mill_id": "mill_001",
    "name": "Nadu Rice (White)",
    "type": "Polished",
    "category": "Nadu Rice",
    "price_per_kg": 180,
    "stock_quantity": 15000,
    "stock_status": "available",
    "min_order_kg": 100,
    "is_active": true,
    "created_at": "2024-01-16T09:15:00Z",
    "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d",
    "description": "White Nadu rice, perfect for daily consumption",
    "rating": 4.5,
    "is_top_selling": true
  },
  "products/prod_003": {
    "rice_mill_id": "mill_002",
    "name": "Keeri Samba (Special)",
    "type": "Polished",
    "category": "Samba Rice",
    "price_per_kg": 280,
    "stock_quantity": 3000,
    "stock_status": "available",
    "min_order_kg": 25,
    "is_active": true,
    "created_at": "2024-01-17T10:45:00Z",
    "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d",
    "description": "Special Keeri Samba with extra fragrance",
    "rating": 4.8,
    "is_top_selling": false
  },
  "products/prod_004": {
    "rice_mill_id": "mill_002",
    "name": "Red Rice (Healthy)",
    "type": "Unpolished",
    "category": "Red Rice",
    "price_per_kg": 220,
    "stock_quantity": 8000,
    "stock_status": "available",
    "min_order_kg": 50,
    "is_active": true,
    "created_at": "2024-01-18T11:30:00Z",
    "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    "description": "Healthy red rice with nutrients intact",
    "rating": 4.6,
    "is_top_selling": true
  },
  "products/prod_005": {
    "rice_mill_id": "mill_001",
    "name": "Basmati Rice (Imported)",
    "type": "Polished",
    "category": "Basmati Rice",
    "price_per_kg": 350,
    "stock_quantity": 2000,
    "stock_status": "available",
    "min_order_kg": 25,
    "is_active": true,
    "created_at": "2024-01-19T14:20:00Z",
    "image": "https://images.unsplash.com/photo-1516684732162-798a0062be99",
    "description": "Premium imported basmati rice",
    "rating": 4.9,
    "is_top_selling": false
  },

  // Categories
  "categories/Samba Rice": {
    "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    "products_count": 8,
    "price_range": "LKR 200-300/KG",
    "description": "Fragrant short grain rice"
  },
  "categories/Nadu Rice": {
    "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d",
    "products_count": 12,
    "price_range": "LKR 150-200/KG",
    "description": "Long grain white rice"
  },
  "categories/Red Rice": {
    "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d",
    "products_count": 5,
    "price_range": "LKR 220-280/KG",
    "description": "Healthy red rice varieties"
  },
  "categories/Basmati Rice": {
    "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    "products_count": 3,
    "price_range": "LKR 300-400/KG",
    "description": "Premium imported basmati"
  },

  // Orders
  "orders/order_001": {
    "order_number": "ORD-2024-001",
    "dealer_id": "dealer_001",
    "rice_mill_id": "mill_001",
    "total_amount": 25000,
    "total_weight": 100,
    "payment_method": "credit",
    "order_status": "delivered",
    "delivery_address": "123 Main Street, Colombo 10",
    "created_at": "2024-01-20T10:30:00Z"
  },
  "orders/order_002": {
    "order_number": "ORD-2024-002",
    "dealer_id": "dealer_002",
    "rice_mill_id": "mill_002",
    "total_amount": 45000,
    "total_weight": 200,
    "payment_method": "cash",
    "order_status": "processing",
    "delivery_address": "456 Galle Road, Kandy",
    "created_at": "2024-01-21T14:45:00Z"
  },

  // Order Items
  "order_items/oi_001": {
    "order_id": "order_001",
    "product_id": "prod_001",
    "quantity_kg": 100,
    "price_per_kg": 250,
    "total_price": 25000
  },
  "order_items/oi_002": {
    "order_id": "order_002",
    "product_id": "prod_002",
    "quantity_kg": 150,
    "price_per_kg": 180,
    "total_price": 27000
  },
  "order_items/oi_003": {
    "order_id": "order_002",
    "product_id": "prod_003",
    "quantity_kg": 50,
    "price_per_kg": 280,
    "total_price": 14000
  },

  // Additional Users (if missing)
  "users/dealer_001": {
    "email": "nimal@wholesale.lk",
    "name": "Nimal Silva",
    "phone": "+94777654321",
    "role": "dealer",
    "nic_number": "789012345V",
    "business_name": "Silva Wholesale",
    "is_verified": true,
    "is_active": true,
    "credit_limit": 150000,
    "used_credit": 45000,
    "created_at": "2024-02-10T10:15:00Z",
    "image": ""
  },
  "users/dealer_002": {
    "email": "kamal@pererarice.lk",
    "name": "Kamal Perera",
    "phone": "+94771234567",
    "role": "dealer",
    "nic_number": "871234567V",
    "business_name": "Perera Rice Traders",
    "is_verified": true,
    "is_active": true,
    "credit_limit": 250000,
    "used_credit": 75000,
    "created_at": "2024-01-15T08:30:00Z",
    "image": ""
  },
  "users/driver_001": {
    "email": "driver01@ricemill.lk",
    "name": "Sunil Fernando",
    "phone": "+94777889900",
    "role": "driver",
    "nic_number": "881234567V",
    "is_verified": true,
    "is_active": true,
    "credit_limit": 0,
    "used_credit": 0,
    "created_at": "2024-03-01T09:00:00Z",
    "image": ""
  },
  "users/owner_001": {
    "email": "owner@colombomill.lk",
    "name": "Rajitha Abeywardena",
    "phone": "+94771122334",
    "role": "owner",
    "nic_number": "751234567V",
    "business_name": "Colombo Premium Rice Mill",
    "mill_name": "Colombo Premium Rice Mill",
    "is_verified": true,
    "is_active": true,
    "credit_limit": 1000000,
    "used_credit": 0,
    "created_at": "2023-12-01T10:00:00Z",
    "image": ""
  },
  "users/admin_001": {
    "email": "admin@ricemill.lk",
    "name": "System Administrator",
    "phone": "+94770000000",
    "role": "admin",
    "nic_number": "991234567V",
    "business_name": "Rice Mill System",
    "is_verified": true,
    "is_active": true,
    "credit_limit": 0,
    "used_credit": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "image": ""
  },

  // Driver Profiles
  "driver_profiles/driver_001": {
    "user_id": "driver_001",
    "license_number": "LN-12345678",
    "license_expiry": "2026-12-31",
    "current_status": "available",
    "trips_completed": 45,
    "created_at": "2024-01-01T09:00:00Z"
  },

  // Delivery Tracking
  "delivery_tracking/track_001": {
    "order_id": "order_001",
    "driver_id": "driver_001",
    "latitude": 6.9271,
    "longitude": 79.8612,
    "status": "delivered",
    "updated_at": "2024-01-20T16:30:00Z"
  },
  "delivery_tracking/track_002": {
    "order_id": "order_002",
    "driver_id": "driver_001",
    "latitude": 6.9275,
    "longitude": 79.8615,
    "status": "in_transit",
    "updated_at": "2024-01-21T15:30:00Z"
  },

  // Trips
  "trips/trip_001": {
    "order_id": "order_001",
    "driver_id": "driver_001",
    "vehicle_id": "vehicle_001",
    "distance_km": 15.5,
    "trip_status": "completed",
    "started_at": "2024-01-20T14:00:00Z",
    "completed_at": "2024-01-20T16:30:00Z"
  },

  // Dealer Stats (for homepage)
  "dealer_stats/dealer_001": {
    "credit_limit": 150000,
    "used_credit": 45000,
    "available_credit": 105000,
    "total_orders": 45,
    "pending_orders": 3,
    "delivered_orders": 42,
    "trust_level": "premium",
    "last_order_date": "2024-01-20T10:30:00Z"
  },
  "dealer_stats/dealer_002": {
    "credit_limit": 250000,
    "used_credit": 75000,
    "available_credit": 175000,
    "total_orders": 28,
    "pending_orders": 5,
    "delivered_orders": 23,
    "trust_level": "trusted",
    "last_order_date": "2024-01-21T14:45:00Z"
  },

  // System Settings
  "system_settings/app_name": "Rice Mill Management System",
  "system_settings/currency": "LKR",
  "system_settings/min_order_kg": 25,
  "system_settings/delivery_fee_per_km": 50,
  "system_settings/tax_percentage": 15,
  "system_settings/support_phone": "+94770000001",
  "system_settings/support_email": "support@ricemill.lk",
  "system_settings/created_at": "2024-01-01T00:00:00Z"
};

// Default worker seeds (will also be used to create monthly salaries)
const defaultWorkers = [
  {
    id: 'W001',
    name: 'Kamal Perera',
    role: 'Machine Operator',
    dailyWage: 1200,
    bankAccount: '1234567890',
    bankName: 'Sampath Bank',
    ifsc: '',
    phone: '+94771234567',
    address: 'Galle Road, Kandy',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'W002',
    name: 'Sunil Fernando',
    role: 'Loader',
    dailyWage: 1000,
    bankAccount: '0987654321',
    bankName: 'Commercial Bank',
    ifsc: '',
    phone: '+94777889900',
    address: 'Main Street, Colombo',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
async function seedDatabase() {
  console.log('🌱 Starting Firebase Realtime Database seeding...');
  console.log('📊 Database URL:', firebaseConfig.databaseURL);
  console.log('🔑 Project ID:', firebaseConfig.projectId);
  
  try {
    // Check what data already exists
    console.log('\n🔍 Checking existing data...');
    
    let added = 0;
    let skipped = 0;
    
    // Seed data only if missing
    for (const [path, data] of Object.entries(seedData)) {
      const refPath = ref(db, path);
      const snapshot = await get(refPath);
      
      if (!snapshot.exists()) {
        console.log(`➕ Adding: ${path}`);
        await set(refPath, data);
        added++;
      } else {
        console.log(`⏭️ Skipping (exists): ${path}`);
        skipped++;
      }
    }

    // Ensure workers exist and create monthly salaries for current month if missing
    console.log('\n👥 Ensuring workers and monthly salaries...');
    const now = new Date();
    const monthKey = now.toISOString().slice(0,7); // YYYY-MM

    for (const w of defaultWorkers) {
      const workerRef = ref(db, `workers/${w.id}`);
      const snap = await get(workerRef);
      if (!snap.exists()) {
        console.log(`➕ Adding worker: workers/${w.id}`);
        await set(workerRef, w);
        added++;
      } else {
        console.log(`⏭️ Worker exists: workers/${w.id}`);
        skipped++;
      }

      // Ensure salary entry for this worker for current month
      const salaryRef = ref(db, `salaries/${monthKey}/${w.id}`);
      const salarySnap = await get(salaryRef);
      if (!salarySnap.exists()) {
        const basicSalary = w.dailyWage * 26; // example default
        const salaryData = {
          workerId: w.id,
          name: w.name,
          role: w.role,
          bankAccount: w.bankAccount,
          bankName: w.bankName,
          ifsc: w.ifsc,
          dailyWage: w.dailyWage,
          workingDays: 26,
          basicSalary,
          netSalary: basicSalary,
          status: 'unpaid',
          attendance: {
            presentDays: 0,
            totalDays: 26,
            lateArrivals: 0,
            earlyLeaves: 0
          },
          paymentDate: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log(`➕ Adding salary: salaries/${monthKey}/${w.id}`);
        await set(salaryRef, salaryData);
        added++;
      } else {
        console.log(`⏭️ Salary exists: salaries/${monthKey}/${w.id}`);
        skipped++;
      }
    }
    
    console.log('\n✅ Seeding completed successfully!');
    console.log(`📈 Added: ${added} items`);
    console.log(`⏭️ Skipped: ${skipped} items`);
    
    console.log('\n📊 Database Structure Summary:');
    console.log('├── users/ (Dealers, Drivers, Owners, Admin)');
    console.log('├── products/ (5 rice products with categories)');
    console.log('├── categories/ (4 rice categories for homepage)');
    console.log('├── orders/ (2 sample orders)');
    console.log('├── order_items/ (3 order line items)');
    console.log('├── driver_profiles/ (Driver information)');
    console.log('├── delivery_tracking/ (Live tracking data)');
    console.log('├── trips/ (Delivery trips)');
    console.log('├── dealer_stats/ (For homepage credit display)');
    console.log('└── system_settings/ (App configuration)');
    
    console.log('\n🔗 Access your database at: https://ricemill-lk-default-rtdb.firebaseio.com');
    console.log('\n🚀 Your homepage should now show:');
    console.log('   • 5 rice products in "Top Selling Products"');
    console.log('   • 4 categories in "Browse Rice Categories"');
    console.log('   • Dealer credit information in banners');
    console.log('   • User list in login page');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();