// scripts/seedReportsData.cjs
// Comprehensive seed data for Reports - Real test data
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, update } = require('firebase/database');

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

// Generate orders for last 2 months
const generateOrders = () => {
  const orders = {};
  const dealers = ['dealer_001', 'dealer_002', 'dealer_003'];
  const products = [
    { id: 'prod_001', name: 'Samba Rice', price: 250, category: 'Rice' },
    { id: 'prod_002', name: 'Nadu Rice', price: 180, category: 'Rice' },
    { id: 'prod_003', name: 'Red Rice', price: 220, category: 'Rice' },
    { id: 'prod_005', name: 'Basmati Rice', price: 350, category: 'Rice' }
  ];

  for (let i = 0; i < 40; i++) {
    const orderId = `SO-2025-${Date.now() + i}`;
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 500) + 50;
    const amount = quantity * randomProduct.price;

    const statuses = ['Delivered', 'In Transit', 'Confirmed', 'Delayed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    orders[orderId] = {
      id: orderId,
      dealerId: dealers[Math.floor(Math.random() * dealers.length)],
      dealerName: ['Silva Wholesale', 'Perera Rice Traders', 'Lanka Rice Co.'][Math.floor(Math.random() * 3)],
      deliveryAddress: ['Colombo', 'Kandy', 'Galle', 'Jaffna'][Math.floor(Math.random() * 4)],
      status,
      type: 'delivery',
      placedOn: date.toISOString(),
      totalAmount: amount,
      quantity,
      product: randomProduct.name,
      items: [
        {
          product: randomProduct.name,
          quantity,
          price: randomProduct.price,
          total: amount
        }
      ]
    };
  }

  return orders;
};

// Generate realistic loan data
const generateLoans = () => {
  const loans = {};
  const dealers = [
    { id: 'dealer_001', name: 'Silva Wholesale' },
    { id: 'dealer_002', name: 'Perera Rice Traders' },
    { id: 'dealer_003', name: 'Lanka Rice Co.' }
  ];

  dealers.forEach((dealer, idx) => {
    for (let i = 0; i < 3; i++) {
      const loanId = `loan_${dealer.id}_${i}`;
      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const amount = (Math.floor(Math.random() * 20) + 5) * 50000;
      const paidAmount = amount * (Math.random() * 0.8);
      const dueDays = Math.floor(Math.random() * 60) - 30;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDays);

      loans[loanId] = {
        id: loanId,
        dealerId: dealer.id,
        dealerName: dealer.name,
        amount,
        paidAmount: Math.floor(paidAmount),
        givenDate: date.toISOString(),
        dueDate: dueDate.toISOString(),
        status: paidAmount >= amount ? 'paid' : 'pending'
      };
    }
  });

  return loans;
};

// Generate trip/delivery data
const generateTrips = () => {
  const trips = {};
  const routes = ['Colombo City', 'Kandy Suburbs', 'Galle Coastal', 'Jaffna North'];
  const distances = [50, 120, 180, 400];

  for (let i = 0; i < 30; i++) {
    const tripId = `trip_${Date.now() + i}`;
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const routeIdx = Math.floor(Math.random() * routes.length);
    const statuses = ['Delivered', 'Delayed', 'In Transit'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    trips[tripId] = {
      id: tripId,
      orderId: `SO-2025-${Math.floor(Math.random() * 1000000000000)}`,
      route: routes[routeIdx],
      distance: distances[routeIdx],
      startedAt: date.toISOString(),
      status: status.toLowerCase(),
      estimatedTime: [2.5, 4, 6, 12][routeIdx],
      actualTime: [2.5, 4, 6, 12][routeIdx] + (Math.random() * 2 - 1),
      deliveryCost: [12500, 28000, 42000, 95000][routeIdx],
      vehicleId: `veh-${Math.floor(Math.random() * 2) + 1}`,
      driverId: `drv-${Math.floor(Math.random() * 2) + 1}`
    };
  }

  return trips;
};

// Generate attendance data
const generateAttendance = () => {
  const attendance = {};
  const workers = ['worker_001', 'worker_002', 'worker_003', 'worker_004', 'worker_005'];

  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    attendance[dateStr] = {};
    workers.forEach(worker => {
      attendance[dateStr][worker] = Math.random() > 0.15 ? 'present' : 'absent';
    });
  }

  return attendance;
};

// Main seeding function
const seedData = async () => {
  try {
    console.log('🌱 Starting comprehensive Reports data seeding...\n');

    // Seed Orders
    console.log('📦 Seeding Orders...');
    const orders = generateOrders();
    await set(ref(db, 'orders'), orders);
    console.log(`✅ Seeded ${Object.keys(orders).length} orders\n`);

    // Seed Loans
    console.log('💰 Seeding Loans...');
    const loans = generateLoans();
    await set(ref(db, 'loans'), loans);
    console.log(`✅ Seeded ${Object.keys(loans).length} loans\n`);

    // Seed Trips
    console.log('🚚 Seeding Trips...');
    const trips = generateTrips();
    await set(ref(db, 'trips'), trips);
    console.log(`✅ Seeded ${Object.keys(trips).length} trips\n`);

    // Seed Attendance
    console.log('👥 Seeding Attendance...');
    const attendance = generateAttendance();
    await set(ref(db, 'attendance'), attendance);
    console.log(`✅ Seeded 30 days of attendance data\n`);

    // Ensure Products exist
    console.log('🌾 Verifying Products...');
    const productsSnapshot = await get(ref(db, 'products'));
    if (!productsSnapshot.exists()) {
      const products = {
        'prod_001': {
          name: 'Samba Rice (Grade A)',
          category: 'Rice',
          stock_quantity: 5000,
          price_per_kg: 250,
          min_order_kg: 50
        },
        'prod_002': {
          name: 'Nadu Rice (White)',
          category: 'Rice',
          stock_quantity: 15000,
          price_per_kg: 180,
          min_order_kg: 100
        },
        'prod_003': {
          name: 'Red Rice (Healthy)',
          category: 'Rice',
          stock_quantity: 8000,
          price_per_kg: 220,
          min_order_kg: 50
        },
        'prod_005': {
          name: 'Basmati Rice (Imported)',
          category: 'Rice',
          stock_quantity: 2000,
          price_per_kg: 350,
          min_order_kg: 25
        }
      };
      await set(ref(db, 'products'), products);
      console.log(`✅ Seeded ${Object.keys(products).length} products\n`);
    } else {
      console.log('✅ Products already exist\n');
    }

    console.log('🎉 All Reports data seeded successfully!');
    console.log('📊 You can now view real data in the Reports page.');
    console.log('💡 Tip: Select different date ranges to see filtered data.\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  }
};

seedData();
