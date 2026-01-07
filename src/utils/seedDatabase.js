// src/utils/seedDatabase.js
import { ref, set, get } from 'firebase/database';
import { rtdb as db } from '../firebase/config';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Checking if database needs seeding...');
    
    // Default owner for seeded data
    const defaultOwner = 'owner@colombomill.lk';
    const defaultMillId = 'mill_colombo_001';
    
    // Check if data already exists
    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    
    if (snapshot.exists() && Object.keys(snapshot.val()).length > 0) {
      console.log('✅ Database already has data');
      return { success: true, message: 'Data already exists' };
    }

    console.log('📦 Seeding database with sample data...');

    // Seed Products
    const products = {
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
        rating: 4.7,
        is_top_selling: true
      },
      prod_002: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Nadu Rice (White)",
        type: "Nadu",
        grade: "Grade A",
        bags: 300,
        kgPerBag: 50,
        totalKg: 15000,
        currentStock: 15000,
        minStockLevel: 3000,
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
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d",
        description: "White Nadu rice, perfect for daily consumption",
        qualityScore: 92,
        rating: 4.5,
        is_top_selling: true
      },
      prod_003: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Red Rice (Healthy)",
        type: "Red Rice",
        grade: "Premium",
        bags: 160,
        kgPerBag: 50,
        totalKg: 8000,
        currentStock: 8000,
        minStockLevel: 2000,
        warehouse: "Warehouse A",
        pricePerKg: 220,
        price_per_kg: 220,
        stock_quantity: 8000,
        stock_status: "available",
        status: "In Stock",
        min_order_kg: 50,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lastUpdated: new Date().toISOString().split('T')[0],
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
        description: "Healthy red rice with nutrients intact",
        qualityScore: 90,
        rating: 4.6,
        is_top_selling: true
      },
      prod_004: {
        rice_mill_id: defaultMillId,
        owner_email: defaultOwner,
        name: "Broken Rice",
        type: "Broken Rice",
        grade: "Grade B",
        bags: 50,
        kgPerBag: 50,
        totalKg: 2500,
        currentStock: 800,
        minStockLevel: 1000,
        warehouse: "Warehouse C",
        pricePerKg: 120,
        price_per_kg: 120,
        stock_quantity: 800,
        stock_status: "low_stock",
        status: "Low Stock",
        min_order_kg: 100,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lastUpdated: new Date().toISOString().split('T')[0],
        image: "https://images.unsplash.com/photo-1516684732162-798a0062be99",
        description: "Quality broken rice for animal feed and budget meals",
        qualityScore: 75,
        rating: 4.0,
        is_top_selling: false
      }
    };

    await set(ref(db, 'products'), products);
    console.log('✅ Products seeded');

    // Seed Customers
    const customers = {
      cust_001: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        name: "Rajesh Kumar",
        contact: "+94771234567",
        email: "rajesh@example.com",
        address: "123, Main Street, Colombo",
        type: "Wholesaler",
        status: "Active",
        creditLimit: 500000,
        outstandingBalance: 125000,
        totalOrders: 45,
        totalSpent: 2250000,
        lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        paymentTerms: "30 Days",
        rating: 4.8
      },
      cust_002: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        name: "Priya Sharma",
        contact: "+94772345678",
        email: "priya@example.com",
        address: "456, Temple Road, Kandy",
        type: "Retailer",
        status: "Active",
        creditLimit: 200000,
        outstandingBalance: 45000,
        totalOrders: 28,
        totalSpent: 890000,
        lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        joinDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        paymentTerms: "15 Days",
        rating: 4.6
      },
      cust_003: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        name: "Saman Perera",
        contact: "+94773456789",
        email: "saman@example.com",
        address: "789, Beach Road, Galle",
        type: "Restaurant",
        status: "Active",
        creditLimit: 300000,
        outstandingBalance: 85000,
        totalOrders: 62,
        totalSpent: 1560000,
        lastOrderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        joinDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        paymentTerms: "Cash",
        rating: 4.9
      }
    };

    await set(ref(db, 'customers'), customers);
    console.log('✅ Customers seeded');

    // Seed Orders
    const orders = {
      order_001: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        customerName: "Rajesh Kumar",
        customerId: "cust_001",
        contact: "+94771234567",
        email: "rajesh@example.com",
        items: [
          { name: "Samba Rice (Grade A)", quantity: 500, price: 250, total: 125000 },
          { name: "Nadu Rice (White)", quantity: 1000, price: 180, total: 180000 }
        ],
        totalAmount: 305000,
        status: "pending",
        placedOn: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        deliveryAddress: "123, Main Street, Colombo",
        paymentMethod: "Credit"
      },owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        
      order_002: {
        customerName: "Priya Sharma",
        customerId: "cust_002",
        contact: "+94772345678",
        email: "priya@example.com",
        items: [
          { name: "Red Rice (Healthy)", quantity: 300, price: 220, total: 66000 }
        ],
        totalAmount: 66000,
        status: "approved",
        placedOn: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        approvedOn: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        deliveryAddress: "456, Temple Road, Kandy",
        paymentMethod: "Cash"
      },
      order_003: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        customerName: "Saman Perera",
        customerId: "cust_003",
        contact: "+94773456789",
        email: "saman@example.com",
        items: [
          { name: "Nadu Rice (White)", quantity: 2000, price: 180, total: 360000 }
        ],
        totalAmount: 360000,
        status: "approved",
        placedOn: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        approvedOn: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
        deliveryAddress: "789, Beach Road, Galle",
        paymentMethod: "Credit"
      }
    };

    await set(ref(db, 'orders'), orders);
    console.log('✅ Orders seeded');

    // Seed Vehicles
    const vehicles = {
      veh_001: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        vehicleNumber: "CAB-1234",
        type: "Lorry",
        capacity: 5000,
        driverName: "Kamal Silva",
        driverContact: "+94771111111",
        status: "Available",
        currentLocation: "Warehouse A",
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        fuelType: "Diesel",
        registrationYear: 2020,
        insuranceExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      veh_002: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        vehicleNumber: "CAC-5678",
        type: "Mini Truck",
        capacity: 2000,
        driverName: "Nimal Fernando",
        driverContact: "+94772222222",
        status: "On Delivery",
        currentLocation: "En route to Kandy",
        lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
        fuelType: "Diesel",
        registrationYear: 2021,
        insuranceExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString()
      },
      veh_003: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        vehicleNumber: "CAD-9012",
        type: "Van",
        capacity: 1000,
        driverName: "Sunil Jayawardena",
        driverContact: "+94773333333",
        status: "Available",
        currentLocation: "Warehouse B",
        lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        fuelType: "Petrol",
        registrationYear: 2019,
        insuranceExpiry: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    await set(ref(db, 'vehicles'), vehicles);
    console.log('✅ Vehicles seeded');

    // Seed Loans
    const loans = {
      loan_001: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        customerName: "Rajesh Kumar",
        customerId: "cust_001",
        loanAmount: 125000,
        amountPaid: 50000,
        remainingBalance: 75000,
        interestRate: 2,
        status: "Active",
        loanDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        paymentHistory: [
          { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 25000 },
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 25000 }
        ]
      },owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        
      loan_002: {
        customerName: "Priya Sharma",
        customerId: "cust_002",
        loanAmount: 45000,
        amountPaid: 45000,
        remainingBalance: 0,
        interestRate: 1.5,
        status: "Settled",
        loanDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        settledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentHistory: [
          { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), amount: 15000 },
          { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 15000 },
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 15000 }
        ]
      },owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        
      loan_003: {
        customerName: "Saman Perera",
        customerId: "cust_003",
        loanAmount: 85000,
        amountPaid: 0,
        remainingBalance: 85000,
        interestRate: 2.5,
        status: "Pending",
        loanDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        paymentHistory: []
      }
    };

    await set(ref(db, 'loans'), loans);
    console.log('✅ Loans seeded');
    
    // Seed Workers
    const workers = {
      worker_001: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        name: "Suresh Kumar",
        role: "Mill Operator",
        contact: "+94774444444",
        email: "suresh@ricemill.com",
        salary: 45000,
        joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Active",
        attendance: {
          present: 22,
          absent: 2,
          leave: 1
        },
        lastAttendance: new Date().toISOString().split('T')[0]
      },
      worker_002: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        name: "Lakshmi Perera",
        role: "Quality Inspector",
        contact: "+94775555555",
        email: "lakshmi@ricemill.com",
        salary: 38000,
        joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Active",
        attendance: {
          present: 24,
          absent: 1,
          leave: 0
        },
        lastAttendance: new Date().toISOString().split('T')[0]
      },
      worker_003: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        name: "Anil Fernando",
        role: "Warehouse Manager",
        contact: "+94776666666",
        email: "anil@ricemill.com",
        salary: 55000,
        joinDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Active",
        attendance: {
          present: 23,
          absent: 0,
          leave: 2
        },
        lastAttendance: new Date().toISOString().split('T')[0]
      }
    };

    await set(ref(db, 'workers'), workers);
    console.log('✅ Workers seeded');
    
    // Seed Stock Updates/Movements
    const stockUpdates = {
      update_001: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        productId: "prod_001",
        productName: "Samba Rice (Grade A)",
        type: "in",
        quantity: 500,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reason: "New Stock Purchase",
        updatedBy: "Admin"
      },
      update_002: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        productId: "prod_002",
        productName: "Nadu Rice (White)",
        type: "out",
        quantity: 1000,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reason: "Customer Order #002",
        updatedBy: "Admin"
      },
      update_003: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        productId: "prod_003",
        productName: "Red Rice (Healthy)",
        type: "in",
        quantity: 300,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reason: "Production Batch",
        updatedBy: "Admin"
      }
    };

    await set(ref(db, 'stock_updates'), stockUpdates);
    console.log('✅ Stock updates seeded');

    // Seed Transport History
    const transportHistory = {
      trip_001: {
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        id: 'TRP-2024-001',
        vehicleNumber: 'CAB-1234',
        driver: {
          name: 'Kamal Silva',
          phone: '+94771111111',
          license: 'DL-845672'
        },
        type: 'Rice Delivery',
        customer: {
          name: 'Rajesh Kumar',
          address: '123, Main Street, Colombo',
          contactPerson: 'Rajesh Kumar',
          phone: '+94771234567'
        },
        startLocation: 'Warehouse A',
        endLocation: 'Colombo, Main Street',
        startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'Delivered',
        proofStatus: 'uploaded',
        distance: '25 km',
        duration: '10h',
        products: [
          { name: 'Samba Rice (Grade A)', bags: 10, kgPerBag: 50, totalKG: 500 }
        ],
        revenue: 'Rs. 125,000',
        expenses: 'Rs. 25,000',
        profit: 'Rs. 100,000',
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
        deliveryProof: {
          images: [],
          uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          gpsLocation: '6.9271° N, 79.8612° E',
          notes: 'Delivery completed successfully'
        }
      },
      trip_002: {
        id: 'TRP-2024-002',
        vehicleNumber: 'CAC-5678',
        driver: {
          name: 'Nimal Fernando',
          phone: '+94772222222',
          license: 'DL-739485'
        },
        type: 'Rice Delivery',
        customer: {
          name: 'Priya Sharma',
          address: '456, Temple Road, Kandy',
          contactPerson: 'Priya Sharma',
          phone: '+94772345678'
        },
        startLocation: 'Warehouse B',
        endLocation: 'Kandy, Temple Road',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        status: 'Delivered',
        proofStatus: 'uploaded',
        distance: '75 km',
        duration: '8h',
        products: [
          { name: 'Red Rice (Healthy)', bags: 6, kgPerBag: 50, totalKG: 300 }
        ],
        revenue: 'Rs. 66,000',
        expenses: 'Rs. 15,000',
        profit: 'Rs. 51,000',
        deliveryProof: {
          images: [],
        owner_email: defaultOwner,
        rice_mill_id: defaultMillId,
          uploadedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
          gpsLocation: '7.2906° N, 80.6337° E',
          notes: 'Customer satisfied with delivery'
        }
      },
      trip_003: {
        id: 'TRP-2024-003',
        vehicleNumber: 'CAB-1234',
        driver: {
          name: 'Kamal Silva',
          phone: '+94771111111',
          license: 'DL-845672'
        },
        type: 'Pickup',
        customer: {
          name: 'Mill Supplier',
          address: 'Warehouse C',
          contactPerson: 'Admin',
          phone: '+94771234567'
        },
        startLocation: 'Warehouse A',
        endLocation: 'Warehouse C',
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString(),
        status: 'Delivered',
        proofStatus: 'pending',
        distance: '15 km',
        duration: '4h',
        products: [
          { name: 'Raw Materials', bags: 20, kgPerBag: 50, totalKG: 1000 }
        ],
        revenue: 'Rs. 50,000',
        expenses: 'Rs. 10,000',
        profit: 'Rs. 40,000',
        deliveryProof: null
      }
    };

    await set(ref(db, 'transport_history'), transportHistory);
    console.log('✅ Transport history seeded');

    console.log('🎉 Database seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully' };
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return { success: false, error: error.message };
  }
};
