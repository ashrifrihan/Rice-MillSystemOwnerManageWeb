// scripts/seedProducts.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

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

const sampleProducts = [
  {
    id: 'rice_basmati_premium',
    name: 'Premium Basmati Rice',
    type: 'Basmati Rice',
    category: 'Premium Rice',
    price: 350,
    stock: 5000,
    minStock: 1000,
    description: 'Long grain premium basmati rice, perfect for biryani and pulao',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    riceMillOwner: 'owner@ricemill.com',
    riceMillId: 'mill_001',
    ownerEmail: 'owner@ricemill.com',
    quality: 'Premium',
    packaging: '25kg bags',
    origin: 'Punjab, India'
  },
  {
    id: 'rice_samba_red',
    name: 'Red Samba Rice',
    type: 'Samba Rice',
    category: 'Health Rice',
    price: 220,
    stock: 3000,
    minStock: 800,
    description: 'Nutritious red samba rice, rich in antioxidants',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    riceMillOwner: 'owner@ricemill.com',
    riceMillId: 'mill_001',
    ownerEmail: 'owner@ricemill.com',
    quality: 'Organic',
    packaging: '10kg bags',
    origin: 'Tamil Nadu, India'
  },
  {
    id: 'rice_brown_organic',
    name: 'Organic Brown Rice',
    type: 'Brown Rice',
    category: 'Health Rice',
    price: 180,
    stock: 2500,
    minStock: 600,
    description: 'Whole grain brown rice, high in fiber and nutrients',
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9aefacd9?w=400',
    riceMillOwner: 'owner@ricemill.com',
    riceMillId: 'mill_001',
    ownerEmail: 'owner@ricemill.com',
    quality: 'Organic',
    packaging: '5kg bags',
    origin: 'Kerala, India'
  },
  {
    id: 'rice_keeri_samba',
    name: 'Keeri Samba Rice',
    type: 'Samba Rice',
    category: 'Regular Rice',
    price: 250,
    stock: 4000,
    minStock: 1000,
    description: 'Traditional Keeri Samba rice, ideal for daily cooking',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    riceMillOwner: 'owner@ricemill.com',
    riceMillId: 'mill_001',
    ownerEmail: 'owner@ricemill.com',
    quality: 'Standard',
    packaging: '25kg bags',
    origin: 'Tamil Nadu, India'
  },
  {
    id: 'rice_nadu_regular',
    name: 'Nadu Rice',
    type: 'Regular Rice',
    category: 'Regular Rice',
    price: 160,
    stock: 6000,
    minStock: 1500,
    description: 'Everyday Nadu rice, affordable and versatile',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    riceMillOwner: 'owner@ricemill.com',
    riceMillId: 'mill_001',
    ownerEmail: 'owner@ricemill.com',
    quality: 'Standard',
    packaging: '50kg bags',
    origin: 'Andhra Pradesh, India'
  }
];

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');

    for (const product of sampleProducts) {
      console.log(`📦 Seeding product: ${product.name}`);
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    console.log('\n🎉 Product seeding completed successfully!');
    console.log(`✅ Seeded ${sampleProducts.length} products`);
    console.log('\n📊 Products added:');
    sampleProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.stock}kg in stock)`);
    });
    console.log('\n✨ Dealers can now browse and order these products!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedProducts();