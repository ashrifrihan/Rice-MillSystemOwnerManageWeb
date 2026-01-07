// Quick script to seed Firebase database
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

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

const defaultOwner = 'owner@colombomill.lk';
const defaultMillId = 'mill_colombo_001';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Check if data exists
    const productsSnapshot = await get(ref(db, 'products'));
    if (productsSnapshot.exists() && Object.keys(productsSnapshot.val()).length > 0) {
      console.log('✅ Database already has data');
      console.log('📊 Current products count:', Object.keys(productsSnapshot.val()).length);
      process.exit(0);
    }

    // Seed Products
    console.log('📦 Seeding products...');
    await set(ref(db, 'products'), {
      prod_001: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Samba Rice (Grade A)",
        type: "Samba",
        grade: "Grade A",
        bags: 100,
        kgPerBag: 50,
        totalKg: 5000,
        currentStock: 5000,
        minStockLevel: 1000,
        warehouse: "Warehouse A",
        pricePerKg: 250,
        price_per_kg: 250,
        stock_quantity: 5000,
        stock_status: "available",
        status: "In Stock",
        min_order_kg: 50,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lastUpdated: new Date().toISOString().split('T')[0],
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
        description: "Premium quality Samba rice, fragrant and long grain",
        qualityScore: 95,
      },
      prod_002: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Nadu Rice (White)",
        type: "Nadu",
        grade: "Standard",
        bags: 150,
        kgPerBag: 100,
        totalKg: 15000,
        currentStock: 15000,
        minStockLevel: 2000,
        warehouse: "Warehouse B",
        pricePerKg: 180,
        price_per_kg: 180,
        stock_quantity: 15000,
        stock_status: "available",
        status: "In Stock",
        min_order_kg: 100,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lastUpdated: new Date().toISOString().split('T')[0],
        image: "https://images.unsplash.com/photo-1536304929831-9ced5a6a6f9f",
        description: "Daily use Nadu rice, perfect for all meals",
        qualityScore: 88,
      },
      prod_003: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Keeri Samba (Special)",
        type: "Samba",
        grade: "Premium",
        bags: 60,
        kgPerBag: 50,
        totalKg: 3000,
        currentStock: 3000,
        minStockLevel: 500,
        warehouse: "Warehouse A",
        pricePerKg: 320,
        price_per_kg: 320,
        stock_quantity: 3000,
        stock_status: "available",
        status: "In Stock",
        min_order_kg: 25,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lastUpdated: new Date().toISOString().split('T')[0],
        image: "https://images.unsplash.com/photo-1516684732162-798a0062be99",
        description: "Special variety Keeri Samba rice",
        qualityScore: 92,
      },
      prod_004: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Basmati Rice (Imported)",
        type: "Basmati",
        grade: "Premium",
        bags: 40,
        kgPerBag: 50,
        totalKg: 2000,
        currentStock: 2000,
        minStockLevel: 300,
        warehouse: "Warehouse C",
        pricePerKg: 450,
        price_per_kg: 450,
        stock_quantity: 2000,
        stock_status: "available",
        status: "In Stock",
        min_order_kg: 25,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lastUpdated: new Date().toISOString().split('T')[0],
        image: "https://images.unsplash.com/photo-1605893868795-e4f8a53152d5",
        description: "Premium imported Basmati rice",
        qualityScore: 97,
      }
    });
    console.log('✅ Products seeded (4 items)');

    // Seed Customers
    console.log('📦 Seeding customers...');
    await set(ref(db, 'customers'), {
      cust_001: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Silva Wholesale",
        contact: "+94 77 123 4567",
        email: "silva@wholesale.lk",
        address: "45 Galle Road, Colombo 03",
        type: "Wholesaler",
        status: "Active",
        creditLimit: 500000,
        outstandingBalance: 125000,
        totalOrders: 28,
        totalSpent: 2500000,
        joinDate: "2024-01-15",
        lastOrderDate: "2024-12-20"
      },
      cust_002: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Perera Retail Stores",
        contact: "+94 71 234 5678",
        email: "perera@retail.lk",
        address: "123 Kandy Road, Kandy",
        type: "Retailer",
        status: "Active",
        creditLimit: 200000,
        outstandingBalance: 45000,
        totalOrders: 15,
        totalSpent: 850000,
        joinDate: "2024-03-10",
        lastOrderDate: "2024-12-18"
      },
      cust_003: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Fernando Supermarket",
        contact: "+94 76 345 6789",
        email: "fernando@supermarket.lk",
        address: "78 Main Street, Galle",
        type: "Supermarket",
        status: "Active",
        creditLimit: 300000,
        outstandingBalance: 75000,
        totalOrders: 22,
        totalSpent: 1650000,
        joinDate: "2024-02-20",
        lastOrderDate: "2024-12-22"
      }
    });
    console.log('✅ Customers seeded (3 items)');

    // Seed Orders
    console.log('📦 Seeding orders...');
    await set(ref(db, 'orders'), {
      order_001: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        customerName: "Silva Wholesale",
        customerId: "cust_001",
        product: "Samba Rice (Grade A)",
        productId: "prod_001",
        quantity: 500,
        unit: "kg",
        pricePerKg: 250,
        totalAmount: 125000,
        status: "pending",
        priority: "high",
        placedOn: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0],
        contact: "+94 77 123 4567",
        address: "45 Galle Road, Colombo 03"
      },
      order_002: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        customerName: "Perera Retail Stores",
        customerId: "cust_002",
        product: "Nadu Rice (White)",
        productId: "prod_002",
        quantity: 1000,
        unit: "kg",
        pricePerKg: 180,
        totalAmount: 180000,
        status: "pending",
        priority: "medium",
        placedOn: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
        contact: "+94 71 234 5678",
        address: "123 Kandy Road, Kandy"
      },
      order_003: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        customerName: "Fernando Supermarket",
        customerId: "cust_003",
        product: "Basmati Rice (Imported)",
        productId: "prod_004",
        quantity: 300,
        unit: "kg",
        pricePerKg: 450,
        totalAmount: 135000,
        status: "approved",
        priority: "normal",
        placedOn: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
        approvedOn: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 1*24*60*60*1000).toISOString().split('T')[0],
        contact: "+94 76 345 6789",
        address: "78 Main Street, Galle"
      }
    });
    console.log('✅ Orders seeded (3 items)');

    // Seed Vehicles
    console.log('📦 Seeding vehicles...');
    await set(ref(db, 'vehicles'), {
      veh_001: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        vehicleNumber: "CAB-1234",
        vehicleType: "Mini Lorry",
        capacity: 1200,
        driverName: "Kamal Perera",
        driverContact: "+94 77 111 2222",
        status: "Approved",
        approvalStatus: "active",
        insuranceExpiry: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0],
        lastMaintenance: new Date(Date.now() - 15*24*60*60*1000).toISOString().split('T')[0]
      },
      veh_002: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        vehicleNumber: "CAD-5678",
        vehicleType: "Large Truck",
        capacity: 3000,
        driverName: "Sunil Silva",
        driverContact: "+94 71 333 4444",
        status: "Active",
        approvalStatus: "active",
        insuranceExpiry: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
        lastMaintenance: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]
      },
      veh_003: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        vehicleNumber: "CAE-9012",
        vehicleType: "Van",
        capacity: 800,
        driverName: "Ravi Fernando",
        driverContact: "+94 76 555 6666",
        status: "Maintenance",
        approvalStatus: "maintenance",
        insuranceExpiry: new Date(Date.now() + 120*24*60*60*1000).toISOString().split('T')[0],
        lastMaintenance: new Date().toISOString().split('T')[0]
      }
    });
    console.log('✅ Vehicles seeded (3 items)');

    // Seed Loans
    console.log('📦 Seeding loans...');
    await set(ref(db, 'loans'), {
      loan_001: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        dealerName: "Silva Wholesale",
        dealerId: "cust_001",
        amount: 500000,
        paidAmount: 200000,
        remainingAmount: 300000,
        riceType: "Samba Rice",
        quantity: 2000,
        issueDate: new Date(Date.now() - 60*24*60*60*1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        status: "Active",
        contact: "+94 77 123 4567",
        risk: "Medium"
      },
      loan_002: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        dealerName: "Perera Retail Stores",
        dealerId: "cust_002",
        amount: 300000,
        paidAmount: 150000,
        remainingAmount: 150000,
        riceType: "Nadu Rice",
        quantity: 1500,
        issueDate: new Date(Date.now() - 45*24*60*60*1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 45*24*60*60*1000).toISOString().split('T')[0],
        status: "Active",
        contact: "+94 71 234 5678",
        risk: "Low"
      },
      loan_003: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        dealerName: "Fernando Supermarket",
        dealerId: "cust_003",
        amount: 400000,
        paidAmount: 400000,
        remainingAmount: 0,
        riceType: "Basmati Rice",
        quantity: 1000,
        issueDate: new Date(Date.now() - 90*24*60*60*1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 10*24*60*60*1000).toISOString().split('T')[0],
        status: "Repaid",
        contact: "+94 76 345 6789",
        risk: "None"
      }
    });
    console.log('✅ Loans seeded (3 items)');

    // Seed Workers
    console.log('📦 Seeding workers...');
    await set(ref(db, 'workers'), {
      worker_001: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Nimal Bandara",
        role: "Driver",
        type: "driver",
        contact: "+94 77 777 8888",
        email: "nimal@ricemill.lk",
        nic: "871234567V",
        joinDate: "2024-01-10",
        dailyWage: 1500,
        status: "active",
        approved: true,
        attendance: {
          present: 24,
          absent: 1,
          leave: 1
        }
      },
      worker_002: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Sunil Fernando",
        role: "Loader",
        type: "worker",
        contact: "+94 71 888 9999",
        email: "sunil@ricemill.lk",
        nic: "901234567V",
        joinDate: "2024-02-15",
        dailyWage: 1000,
        status: "active",
        approved: true,
        attendance: {
          present: 22,
          absent: 2,
          leave: 1
        }
      },
      worker_003: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Ravi Kumar",
        role: "Supervisor",
        type: "supervisor",
        contact: "+94 76 999 0000",
        email: "ravi@ricemill.lk",
        nic: "851234567V",
        joinDate: "2023-11-01",
        dailyWage: 2000,
        status: "active",
        approved: true,
        attendance: {
          present: 26,
          absent: 0,
          leave: 0
        }
      }
    });
    console.log('✅ Workers seeded (3 items)');

    // Seed Stock Updates
    console.log('📦 Seeding stock updates...');
    await set(ref(db, 'stock_updates'), {
      update_001: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        productName: "Samba Rice (Grade A)",
        productId: "prod_001",
        type: "addition",
        quantity: 500,
        reason: "New stock arrival",
        updatedBy: "Admin",
        timestamp: new Date(Date.now() - 2*24*60*60*1000).toISOString()
      },
      update_002: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        productName: "Nadu Rice (White)",
        productId: "prod_002",
        type: "subtraction",
        quantity: 200,
        reason: "Order fulfillment",
        updatedBy: "Admin",
        timestamp: new Date(Date.now() - 1*24*60*60*1000).toISOString()
      },
      update_003: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        productName: "Basmati Rice (Imported)",
        productId: "prod_004",
        type: "addition",
        quantity: 300,
        reason: "Import shipment",
        updatedBy: "Admin",
        timestamp: new Date().toISOString()
      }
    });
    console.log('✅ Stock updates seeded (3 items)');

    // Seed Transport History
    console.log('📦 Seeding transport history...');
    await set(ref(db, 'transport_history'), {
      trip_001: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        orderId: "order_003",
        vehicleNumber: "CAB-1234",
        driverName: "Kamal Perera",
        customerName: "Fernando Supermarket",
        destination: "78 Main Street, Galle",
        quantity: 300,
        status: "Completed",
        startTime: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
        endTime: new Date(Date.now() - 1*24*60*60*1000 + 6*60*60*1000).toISOString(),
        distance: 120
      },
      trip_002: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        orderId: "order_001",
        vehicleNumber: "CAD-5678",
        driverName: "Sunil Silva",
        customerName: "Silva Wholesale",
        destination: "45 Galle Road, Colombo 03",
        quantity: 500,
        status: "In Transit",
        startTime: new Date().toISOString(),
        endTime: null,
        distance: 15
      },
      trip_003: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        orderId: "order_002",
        vehicleNumber: "CAB-1234",
        driverName: "Kamal Perera",
        customerName: "Perera Retail Stores",
        destination: "123 Kandy Road, Kandy",
        quantity: 1000,
        status: "Pending",
        startTime: null,
        endTime: null,
        distance: 116
      }
    });
    console.log('✅ Transport history seeded (3 items)');

    console.log('\n🎉 DATABASE SEEDING COMPLETE!');
    console.log('📊 Summary:');
    console.log('  - 4 Products');
    console.log('  - 3 Customers');
    console.log('  - 3 Orders');
    console.log('  - 3 Vehicles');
    console.log('  - 3 Loans');
    console.log('  - 3 Workers');
    console.log('  - 3 Stock Updates');
    console.log('  - 3 Transport History');
    console.log(`\n✅ All data tagged with owner: ${defaultOwner}`);
    console.log('\n🔄 Refresh your application to see the data!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedDatabase();
