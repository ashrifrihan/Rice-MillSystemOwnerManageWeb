// src/services/inventoryUpdateService.js
import { ref, set, push, get, onValue, update, remove } from 'firebase/database';
import { rtdb as db } from '../firebase/config';

export default {
  // Get all products from Firebase - REAL DATA
  async getAllProducts() {
    try {
      console.log('Fetching all products from Firebase...');
      const snapshot = await get(ref(db, 'products'));
      
      if (snapshot.exists()) {
        const products = [];
        snapshot.forEach((childSnapshot) => {
          const product = childSnapshot.val();
          products.push({
            id: childSnapshot.key,
            ...product,
            // Ensure numeric fields
            current_stock: parseFloat(product.current_stock) || 0,
            price_per_kg: parseFloat(product.price_per_kg) || 0,
            min_stock_level: parseFloat(product.min_stock_level) || 1000,
            // For backward compatibility
            kgPerBag: product.kgPerBag || 50,
            bags: product.bags || Math.floor((parseFloat(product.current_stock) || 0) / 50)
          });
        });
        console.log(`Found ${products.length} products in Firebase`);
        return products;
      }
      console.log('No products found in Firebase');
      return [];
    } catch (error) {
      console.error('Error fetching products from Firebase:', error);
      throw error;
    }
  },

  // Get product by ID - REAL DATA
  async getProductById(productId) {
    try {
      console.log(`Fetching product ${productId} from Firebase...`);
      const snapshot = await get(ref(db, `products/${productId}`));
      
      if (snapshot.exists()) {
        const product = snapshot.val();
        return { 
          id: productId, 
          ...product,
          current_stock: parseFloat(product.current_stock) || 0,
          price_per_kg: parseFloat(product.price_per_kg) || 0,
          min_stock_level: parseFloat(product.min_stock_level) || 1000
        };
      }
      console.log(`Product ${productId} not found in Firebase`);
      return null;
    } catch (error) {
      console.error(`Error fetching product ${productId} from Firebase:`, error);
      throw error;
    }
  },

  // Add new product to Firebase - REAL OPERATION
  async addProduct(productData, imageFile, ownerEmail = null) {
    try {
      console.log('Starting addProduct process...', { productData, ownerEmail });
      const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated productId:', productId);
      
      // Handle image (Base64 string from productData, no upload needed)
      const imageUrl = productData.image || '';
      if (imageUrl) {
        console.log('Using Base64 image from productData');
      }

      // Calculate current stock (accept both bags and KG input)
      let current_stock = 0;
      if (productData.bags && productData.kgPerBag) {
        // Calculate from bags
        current_stock = parseFloat(productData.bags) * parseFloat(productData.kgPerBag);
      } else if (productData.current_stock) {
        // Use direct KG input
        current_stock = parseFloat(productData.current_stock);
      } else {
        current_stock = 0;
      }

      const min_stock_level = parseFloat(productData.min_stock_level) || 1000;
      
      // Calculate stock status
      let stock_status = 'available';
      if (current_stock === 0) {
        stock_status = 'out_of_stock';
      } else if (current_stock < min_stock_level * 0.3) {
        stock_status = 'critical';
      } else if (current_stock < min_stock_level * 0.5) {
        stock_status = 'low_stock';
      } else if (current_stock < min_stock_level) {
        stock_status = 'warning';
      }

      const product = {
        name: productData.name.trim(),
        type: productData.type || 'Nadu',
        grade: productData.grade || 'Premium',
        current_stock: current_stock,
        price_per_kg: parseFloat(productData.price_per_kg) || 0,
        warehouse: productData.warehouse || 'Warehouse A',
        min_stock_level: min_stock_level,
        stock_status: stock_status,
        description: productData.description || '',
        image: imageUrl,
        // For backward compatibility
        kgPerBag: parseFloat(productData.kgPerBag) || 50,
        bags: Math.floor(current_stock / (parseFloat(productData.kgPerBag) || 50)),
        // Owner scoping fields
        owner_email: ownerEmail || null,
        ownerEmail: ownerEmail || null,
        created_by: ownerEmail || 'System',
        updated_by: ownerEmail || 'System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Prepared product object:', product);
      console.log('Saving to Firebase path:', `products/${productId}`);
      await set(ref(db, `products/${productId}`), product);
      console.log('Product saved to Firebase successfully');
      
      // Record initial stock transaction
      console.log('Recording initial stock update...');
      await this.recordStockUpdate({
        productId: productId,
        productName: product.name,
        transactionType: 'Initial Stock',
        quantity: current_stock,
        unit: 'KG',
        warehouse: product.warehouse,
        notes: 'New product added to inventory',
        ownerEmail: ownerEmail || null,
        user: ownerEmail || 'System'
      });
      console.log('Initial stock update recorded');

      console.log('Product added successfully to Firebase');
      return { id: productId, ...product };
    } catch (error) {
      console.error('Error adding product to Firebase:', error);
      throw error;
    }
  },

  // Update stock levels in Firebase - REAL OPERATION
  async updateStock(productId, quantity, transactionType) {
    try {
      console.log(`Updating stock in Firebase for ${productId}:`, { quantity, transactionType });
      
      const productRef = ref(db, `products/${productId}`);
      const snapshot = await get(productRef);
      
      if (!snapshot.exists()) {
        throw new Error('Product not found in Firebase');
      }

      const product = snapshot.val();
      const currentStock = parseFloat(product.current_stock) || 0;
      const quantityValue = parseFloat(quantity) || 0;
      
      let newStock = currentStock;
      if (transactionType === 'Purchase' || transactionType === 'Return' || transactionType === 'Initial Stock' || transactionType === 'Adjustment') {
        newStock = currentStock + quantityValue;
      } else if (transactionType === 'Sale' || transactionType === 'Damage' || transactionType === 'Quality Rejection') {
        newStock = currentStock - quantityValue;
      }

      // Ensure stock doesn't go negative
      if (newStock < 0) newStock = 0;

      // Update stock status
      const minStock = parseFloat(product.min_stock_level) || 1000;
      let stock_status = 'available';
      if (newStock === 0) {
        stock_status = 'out_of_stock';
      } else if (newStock < minStock * 0.3) {
        stock_status = 'critical';
      } else if (newStock < minStock * 0.5) {
        stock_status = 'low_stock';
      } else if (newStock < minStock) {
        stock_status = 'warning';
      }

      const updates = {
        current_stock: newStock,
        stock_status: stock_status,
        bags: Math.floor(newStock / (parseFloat(product.kgPerBag) || 50)),
        updated_at: new Date().toISOString()
      };

      console.log('Updating product in Firebase:', updates);
      await update(productRef, updates);

      console.log('Stock updated successfully in Firebase');
      return newStock;
    } catch (error) {
      console.error('Error updating stock in Firebase:', error);
      throw error;
    }
  },

  // Record stock update transaction in Firebase - REAL OPERATION
  async recordStockUpdate(updateData) {
    try {
      console.log('Recording stock update in Firebase:', updateData);
      
      const updateId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transactionRef = ref(db, `stock_updates/${updateId}`);
      
      // Calculate quantity in KG
      let quantityInKg = parseFloat(updateData.quantity) || 0;
      let unit = updateData.unit || 'KG';
      
      // Convert if necessary
      if (unit === 'bags') {
        // Get product to get kgPerBag
        const productRef = ref(db, `products/${updateData.productId}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
          const product = snapshot.val();
          const kgPerBag = parseFloat(product.kgPerBag) || 50;
          quantityInKg = quantityInKg * kgPerBag;
        }
      } else if (unit === 'quintals') {
        quantityInKg = quantityInKg * 100;
      }

      // Update product stock
      await this.updateStock(updateData.productId, quantityInKg, updateData.transactionType);

      // Record the transaction
      const ownerEmail = updateData.ownerEmail || updateData.owner_email || null;
      const updateRecord = {
        id: updateId,
        productId: updateData.productId,
        productName: updateData.productName,
        transactionType: updateData.transactionType,
        quantity: parseFloat(updateData.quantity) || 0,
        unit: unit,
        quantity_kg: quantityInKg,
        warehouse: updateData.warehouse || 'Warehouse A',
        supplier: updateData.supplier || '',
        customer: updateData.customer || '',
        reference: updateData.reference || '',
        notes: updateData.notes || '',
        user: updateData.user || ownerEmail || 'System',
        owner_email: ownerEmail,
        ownerEmail: ownerEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Saving transaction to Firebase:', updateRecord);
      await set(transactionRef, updateRecord);
      
      console.log('Stock update recorded successfully in Firebase');
      return updateRecord;
    } catch (error) {
      console.error('Error recording stock update in Firebase:', error);
      throw error;
    }
  },

  // Get recent stock updates from Firebase - REAL DATA
  async getRecentStockUpdates(limit = 10) {
    try {
      console.log(`Fetching recent stock updates from Firebase (limit: ${limit})...`);
      const snapshot = await get(ref(db, 'stock_updates'));
      
      if (snapshot.exists()) {
        const updates = [];
        snapshot.forEach((childSnapshot) => {
          updates.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Sort by date, newest first
        updates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const limitedUpdates = updates.slice(0, limit);
        
        console.log(`Found ${limitedUpdates.length} recent updates in Firebase`);
        return limitedUpdates;
      }
      
      console.log('No stock updates found in Firebase');
      return [];
    } catch (error) {
      console.error('Error fetching updates from Firebase:', error);
      throw error;
    }
  },

  // Setup real-time listener for products - REAL TIME
  setupRealtimeListener(callback) {
    console.log('Setting up real-time listener for products...');
    const productsRef = ref(db, 'products');
    
    return onValue(productsRef, (snapshot) => {
      console.log('Real-time update received from Firebase');
      if (snapshot.exists()) {
        const products = [];
        snapshot.forEach((childSnapshot) => {
          const product = childSnapshot.val();
          products.push({
            id: childSnapshot.key,
            ...product,
            current_stock: parseFloat(product.current_stock) || 0,
            price_per_kg: parseFloat(product.price_per_kg) || 0
          });
        });
        callback(products);
      } else {
        console.log('No products in real-time update');
        callback([]);
      }
    }, (error) => {
      console.error('Error in real-time listener:', error);
      callback([]);
    });
  },

  // Setup real-time listener for updates - REAL TIME
  setupUpdatesListener(callback) {
    console.log('Setting up real-time listener for updates...');
    const updatesRef = ref(db, 'stock_updates');
    
    return onValue(updatesRef, (snapshot) => {
      console.log('Real-time updates received from Firebase');
      if (snapshot.exists()) {
        const updates = [];
        snapshot.forEach((childSnapshot) => {
          updates.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Sort by date, newest first
        updates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        callback(updates.slice(0, 5));
      } else {
        console.log('No updates in real-time update');
        callback([]);
      }
    }, (error) => {
      console.error('Error in updates listener:', error);
      callback([]);
    });
  },

  // Check if Firebase database has data and seed if empty
  async seedIfEmpty() {
    try {
      console.log('Checking Firebase database status...');
      
      // Check products in Firebase
      const productsSnapshot = await get(ref(db, 'products'));
      const productCount = productsSnapshot.exists() ? Object.keys(productsSnapshot.val()).length : 0;
      
      console.log(`Found ${productCount} products in Firebase`);
      
      if (productCount === 0) {
        console.log('Database is empty, seeding initial data...');
        
        // Seed with sample data
        const sampleProducts = [
          {
            name: "Nadu Premium Raw Rice",
            type: "Nadu",
            grade: "Premium",
            current_stock: 25000,
            price_per_kg: 45.5,
            warehouse: "Warehouse A",
            min_stock_level: 10000,
            stock_status: "available",
            description: "High quality Nadu rice for export",
            kgPerBag: 50,
            bags: 500,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            name: "Samba Special Rice",
            type: "Samba",
            grade: "Grade A",
            current_stock: 15000,
            price_per_kg: 52.75,
            warehouse: "Warehouse B",
            min_stock_level: 8000,
            stock_status: "warning",
            description: "Premium Samba rice with long grains",
            kgPerBag: 50,
            bags: 300,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            name: "Premium Basmati Rice",
            type: "Basmati",
            grade: "Premium",
            current_stock: 5000,
            price_per_kg: 120.0,
            warehouse: "Warehouse C",
            min_stock_level: 2000,
            stock_status: "available",
            description: "Export quality Basmati rice",
            kgPerBag: 25,
            bags: 200,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            name: "Brown Rice Organic",
            type: "Brown Rice",
            grade: "Grade A",
            current_stock: 8000,
            price_per_kg: 85.25,
            warehouse: "Warehouse A",
            min_stock_level: 3000,
            stock_status: "low_stock",
            description: "Organic brown rice, unpolished",
            kgPerBag: 50,
            bags: 160,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        for (const product of sampleProducts) {
          const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await set(ref(db, `products/${productId}`), product);
          
          // Record initial transaction
          const updateId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const updateRecord = {
            id: updateId,
            productId: productId,
            productName: product.name,
            transactionType: 'Initial Stock',
            quantity: product.current_stock,
            unit: 'KG',
            quantity_kg: product.current_stock,
            warehouse: product.warehouse,
            notes: 'Initial seed data',
            user: 'System',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          await set(ref(db, `stock_updates/${updateId}`), updateRecord);
        }

        console.log('Initial data seeded to Firebase successfully');
        return {
          hasProducts: false,
          productCount: sampleProducts.length,
          updateCount: sampleProducts.length,
          seeded: true,
          message: 'Initial data seeded successfully'
        };
      }

      // Check stock updates
      const updatesSnapshot = await get(ref(db, 'stock_updates'));
      const updateCount = updatesSnapshot.exists() ? Object.keys(updatesSnapshot.val()).length : 0;
      
      return {
        hasProducts: productCount > 0,
        productCount: productCount,
        updateCount: updateCount,
        seeded: false,
        message: `Found ${productCount} products and ${updateCount} updates in Firebase`
      };
    } catch (error) {
      console.error('Error checking/seed data in Firebase:', error);
      return {
        hasProducts: false,
        productCount: 0,
        updateCount: 0,
        seeded: false,
        message: `Error connecting to Firebase: ${error.message}`
      };
    }
  },

  // Helper methods for dropdowns (These are static, not from Firebase)
  getRiceTypes() {
    return ['Nadu', 'Samba', 'Raw Rice', 'Broken Rice', 'Basmati', 'Jasmine', 'Brown Rice', 'Parboiled'];
  },

  getRiceGrades() {
    return ['Premium', 'Grade A', 'Grade B', 'Grade C', 'Standard', 'Export Quality'];
  },

  getWarehouseLocations() {
    return ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Cold Storage', 'Main Godown', 'Processing Unit'];
  },

  getTransactionTypes() {
    return ['Purchase', 'Sale', 'Return', 'Damage', 'Adjustment', 'Transfer', 'Initial Stock', 'Quality Rejection'];
  },

  // Delete product from Firebase
  async deleteProduct(productId) {
    try {
      console.log(`Deleting product ${productId} from Firebase...`);
      await remove(ref(db, `products/${productId}`));
      console.log('Product deleted successfully from Firebase');
      return true;
    } catch (error) {
      console.error('Error deleting product from Firebase:', error);
      throw error;
    }
  },

  // Update product details (without stock change)
  async updateProductDetails(productId, updates) {
    try {
      console.log(`Updating product ${productId} details in Firebase...`, updates);
      
      const productRef = ref(db, `products/${productId}`);
      const snapshot = await get(productRef);
      
      if (!snapshot.exists()) {
        throw new Error('Product not found in Firebase');
      }

      const currentData = snapshot.val();
      
      // Calculate new stock status if stock changed
      if (updates.current_stock !== undefined) {
        const newStock = parseFloat(updates.current_stock) || 0;
        const minStock = parseFloat(updates.min_stock_level || currentData.min_stock_level) || 1000;
        
        let stock_status = 'available';
        if (newStock === 0) {
          stock_status = 'out_of_stock';
        } else if (newStock < minStock * 0.3) {
          stock_status = 'critical';
        } else if (newStock < minStock * 0.5) {
          stock_status = 'low_stock';
        } else if (newStock < minStock) {
          stock_status = 'warning';
        }
        
        updates.stock_status = stock_status;
        updates.bags = Math.floor(newStock / (parseFloat(updates.kgPerBag || currentData.kgPerBag) || 50));
      }

      updates.updated_at = new Date().toISOString();
      
      console.log('Updating product in Firebase:', updates);
      await update(productRef, updates);
      
      console.log('Product details updated successfully in Firebase');
      return { id: productId, ...currentData, ...updates };
    } catch (error) {
      console.error('Error updating product details in Firebase:', error);
      throw error;
    }
  }
};