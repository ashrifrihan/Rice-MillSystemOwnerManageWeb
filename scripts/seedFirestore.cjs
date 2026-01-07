// scripts/seedFirestore.cjs
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');

// Firebase configuration
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
const db = getFirestore(app);

const generateSeedData = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Generate sales data
  const products = ['Nadu Rice', 'Samba Rice', 'Keeri Samba', 'Basmati Rice', 'Red Rice', 'Brown Rice'];
  const customers = ['Sharma Foods Ltd', 'Patel Grocery', 'Singh Exports', 'Kumar Restaurants', 'Gupta Wholesalers', 'Mehta Trading', 'Reddy Stores'];
  
  const sales = [];
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const saleDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 500) + 100;
    const pricePerKg = product.includes('Basmati') ? 350 : product.includes('Red') ? 220 : product.includes('Samba') ? 250 : 180;
    
    sales.push({
      id: `sale_${i + 1}`,
      product,
      customer: customers[Math.floor(Math.random() * customers.length)],
      quantity,
      amount: quantity * pricePerKg,
      pricePerKg,
      date: saleDate,
      paymentType: ['cash', 'credit', 'online'][Math.floor(Math.random() * 3)],
      status: 'completed'
    });
  }
  
  // Generate inventory data
  const inventory = products.map((product, idx) => {
    const currentStock = Math.floor(Math.random() * 8000) + 2000;
    const minimumStock = Math.floor(currentStock * 0.3);
    const pricePerKg = product.includes('Basmati') ? 350 : product.includes('Red') ? 220 : product.includes('Samba') ? 250 : 180;
    
    return {
      id: `inv_${idx + 1}`,
      name: product,
      product: product,
      currentStock,
      minimumStock,
      maximumStock: currentStock * 2,
      pricePerKg,
      category: product.includes('Basmati') ? 'Premium Rice' : product.includes('Red') || product.includes('Brown') ? 'Health Rice' : 'Regular Rice',
      dailyConsumption: Math.floor(Math.random() * 50) + 10,
      reorderLevel: minimumStock,
      lastUpdated: now
    };
  });
  
  // Generate loan data
  const loans = [];
  for (let i = 0; i < 15; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const loanAmount = Math.floor(Math.random() * 100000) + 20000;
    const outstandingAmount = Math.floor(loanAmount * (0.3 + Math.random() * 0.7));
    const daysAgo = Math.floor(Math.random() * 60);
    const loanDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dueDays = Math.floor(Math.random() * 60) - 30;
    
    loans.push({
      id: `loan_${i + 1}`,
      customer,
      loanAmount,
      outstandingAmount,
      paidAmount: loanAmount - outstandingAmount,
      loanDate,
      dueDate: new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000),
      overdueDays: Math.max(0, -dueDays),
      interestRate: 12,
      status: outstandingAmount > 0 ? 'active' : 'settled',
      customerType: 'dealer'
    });
  }
  
  // Generate worker data
  const workerNames = ['Ramesh Kumar', 'Suresh Babu', 'Ganesh Reddy', 'Mahesh Singh', 'Rajesh Patel', 'Dinesh Kumar', 'Naresh Gupta', 'Prakash Mehta', 'Anil Sharma', 'Suneel Rao'];
  const workers = workerNames.map((name, idx) => ({
    id: `worker_${idx + 1}`,
    name,
    role: idx < 3 ? 'Supervisor' : 'Worker',
    dailyWage: idx < 3 ? 800 : 600,
    contactNumber: `+91 ${9000000000 + idx}`,
    attendance: 0.85 + Math.random() * 0.15,
    productivity: 0.75 + Math.random() * 0.2,
    skillLevel: ['beginner', 'intermediate', 'expert'][Math.floor(Math.random() * 3)],
    status: Math.random() > 0.2 ? 'active' : 'absent',
    joinDate: new Date(now.getTime() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
  }));
  
  // Generate transport data
  const vehicles = ['Lorry 01', 'Lorry 02', 'Lorry 05', 'Lorry 09', 'Van 07', 'Truck 12', 'Mini Lorry 03'];
  const destinations = ['Mannar', 'Vavuniya', 'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Trincomalee'];
  const transport = [];
  
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const deliveryDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const quantity = Math.floor(Math.random() * 1000) + 500;
    
    transport.push({
      id: `transport_${i + 1}`,
      vehicleNumber: vehicles[Math.floor(Math.random() * vehicles.length)],
      driverName: workerNames[Math.floor(Math.random() * workerNames.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      product: products[Math.floor(Math.random() * products.length)],
      quantity,
      deliveryDate,
      status: daysAgo === 0 ? ['In-Transit', 'Loading'][Math.floor(Math.random() * 2)] : 'Delivered',
      distance: Math.floor(Math.random() * 300) + 50
    });
  }
  
  return { sales, inventory, loans, workers, transport };
};

async function seedFirestore() {
  try {
    console.log('🌱 Starting Firestore seeding...');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    
    // Check if data already exists
    console.log('\n🔍 Checking existing data...');
    const inventorySnapshot = await getDocs(collection(db, 'inventory'));
    
    if (!inventorySnapshot.empty && process.argv.indexOf('--force') === -1) {
      console.log('\n⚠️  Data already exists in Firestore!');
      console.log('📝 Run with --force flag to overwrite: npm run seed-firestore -- --force');
      return;
    }
    
    const seedData = generateSeedData();
    
    // Seed Sales
    console.log('\n📦 Seeding sales data...');
    for (const sale of seedData.sales) {
      await setDoc(doc(db, 'sales', sale.id), sale);
    }
    console.log(`✅ Seeded ${seedData.sales.length} sales records`);
    
    // Seed Inventory
    console.log('\n📦 Seeding inventory data...');
    for (const item of seedData.inventory) {
      await setDoc(doc(db, 'inventory', item.id), item);
    }
    console.log(`✅ Seeded ${seedData.inventory.length} inventory items`);
    
    // Seed Loans
    console.log('\n📦 Seeding loan data...');
    for (const loan of seedData.loans) {
      await setDoc(doc(db, 'loans', loan.id), loan);
    }
    console.log(`✅ Seeded ${seedData.loans.length} loan records`);
    
    // Seed Workers
    console.log('\n📦 Seeding worker data...');
    for (const worker of seedData.workers) {
      await setDoc(doc(db, 'workers', worker.id), worker);
    }
    console.log(`✅ Seeded ${seedData.workers.length} worker records`);
    
    // Seed Transport
    console.log('\n📦 Seeding transport data...');
    for (const item of seedData.transport) {
      await setDoc(doc(db, 'transport', item.id), item);
    }
    console.log(`✅ Seeded ${seedData.transport.length} transport records`);
    
    console.log('\n🎉 Firestore seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${seedData.sales.length} sales records`);
    console.log(`   - ${seedData.inventory.length} inventory items`);
    console.log(`   - ${seedData.loans.length} loan records`);
    console.log(`   - ${seedData.workers.length} worker records`);
    console.log(`   - ${seedData.transport.length} transport records`);
    console.log('\n✨ You can now view this data in your dashboard!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

seedFirestore();
