// src/services/inventoryService.js
import { ref, set, get, update, remove, push, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { rtdb as db } from '../firebase/config';
import { uploadInventoryImage, deleteInventoryImage } from '../firebase/storage';

class InventoryService {
  constructor() {
    // Use the `products` node (inventoryUpdateService writes to `products`)
    this.inventoryRef = ref(db, 'products');
    // Stock transactions are stored under `stock_updates` in other service
    this.movementsRef = ref(db, 'stock_updates');
    this.distributionRef = ref(db, 'inventory_distribution');
    this.kpisRef = ref(db, 'inventory_kpis');
  }

  // Get all inventory items
  async getAllInventory() {
    try {
      const snapshot = await get(this.inventoryRef);
      if (snapshot.exists()) {
        const inventory = snapshot.val();
        return Object.entries(inventory).map(([id, data]) => ({
          id,
          // Normalize both snake_case (products) and camelCase (legacy inventory) fields
          name: data.name,
          type: data.type,
          grade: data.grade,
          bags: data.bags || data.Bags || 0,
          kgPerBag: data.kgPerBag || data.kg_per_bag || 50,
          totalKg: data.totalKg || data.total_kg || ((data.bags || 0) * (data.kgPerBag || data.kg_per_bag || 50)),
          currentStock: data.current_stock || data.currentStock || 0,
          minStockLevel: data.min_stock_level || data.minStockLevel || 1000,
          warehouse: data.warehouse || 'Warehouse A',
          pricePerKg: data.price_per_kg || data.pricePerKg || 0,
          lastUpdated: data.lastUpdated || data.updated_at || data.created_at || '',
          status: data.stock_status || data.status || 'In Stock',
          image: data.image || null,
          qualityScore: data.qualityScore || data.quality_score || null,
          // include raw data so callers can still access original fields
          ...data
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting inventory:', error);
      throw error;
    }
  }

  // Get inventory by ID
  async getInventoryById(id) {
    try {
      const snapshot = await get(ref(db, `products/${id}`));
      if (!snapshot.exists()) return null;
      const data = snapshot.val();
      return {
        id,
        name: data.name,
        type: data.type,
        grade: data.grade,
        bags: data.bags || 0,
        kgPerBag: data.kgPerBag || data.kg_per_bag || 50,
        totalKg: data.totalKg || data.total_kg || ((data.bags || 0) * (data.kgPerBag || data.kg_per_bag || 50)),
        currentStock: data.current_stock || data.currentStock || 0,
        minStockLevel: data.min_stock_level || data.minStockLevel || 1000,
        warehouse: data.warehouse || 'Warehouse A',
        pricePerKg: data.price_per_kg || data.pricePerKg || 0,
        lastUpdated: data.lastUpdated || data.updated_at || data.created_at || '',
        status: data.stock_status || data.status || 'In Stock',
        image: data.image || null,
        qualityScore: data.qualityScore || data.quality_score || null,
        ...data
      };
    } catch (error) {
      console.error('Error getting inventory item:', error);
      throw error;
    }
  }

  // Add new inventory item
  async addInventoryItem(itemData, imageFile = null) {
    try {
      const newItemRef = push(this.inventoryRef);
      const itemId = newItemRef.key;
      
      let imageUrl = itemData.image || null;
      if (imageFile) {
        imageUrl = await uploadInventoryImage(imageFile, itemId);
      }

      const item = {
        id: itemId,
        name: itemData.name,
        type: itemData.type,
        grade: itemData.grade,
        bags: parseInt(itemData.bags) || 0,
        kgPerBag: parseInt(itemData.kgPerBag) || 50,
        totalKg: (parseInt(itemData.bags) || 0) * (parseInt(itemData.kgPerBag) || 50),
        currentStock: parseInt(itemData.currentStock) || 0,
        minStockLevel: parseInt(itemData.minStockLevel) || 1000,
        warehouse: itemData.warehouse || 'Warehouse A',
        pricePerKg: parseFloat(itemData.pricePerKg) || 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: this.calculateStatus(parseInt(itemData.currentStock) || 0, parseInt(itemData.minStockLevel) || 1000),
        image: imageUrl,
        qualityScore: parseInt(itemData.qualityScore) || 95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await set(newItemRef, item);
      await this.updateInventoryDistribution();
      await this.updateKPIs();
      
      return item;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  }

  // Update inventory item
  async updateInventoryItem(id, updates, imageFile = null) {
    try {
      const itemRef = ref(db, `products/${id}`);
      const snapshot = await get(itemRef);
      
      if (!snapshot.exists()) {
        throw new Error('Inventory item not found');
      }

      const currentData = snapshot.val();
      
      let imageUrl = updates.image || currentData.image;
      if (imageFile) {
        // Delete old image if exists and new one is uploaded
        if (currentData.image) {
          await deleteInventoryImage(currentData.image);
        }
        imageUrl = await uploadInventoryImage(imageFile, id);
      }

      // Determine numeric fields from possible snake_case or camelCase sources
      const bags = updates.bags ?? currentData.bags ?? 0;
      const kgPerBag = updates.kgPerBag ?? updates.kg_per_bag ?? currentData.kgPerBag ?? currentData.kg_per_bag ?? 50;
      const currentStockVal = updates.currentStock ?? updates.current_stock ?? currentData.currentStock ?? currentData.current_stock ?? 0;
      const minStockVal = updates.minStockLevel ?? updates.min_stock_level ?? currentData.minStockLevel ?? currentData.min_stock_level ?? 1000;

      const totalKg = (parseFloat(bags) || 0) * (parseFloat(kgPerBag) || 50);

      const status = this.calculateStatus(parseFloat(currentStockVal) || 0, parseFloat(minStockVal) || 1000);

      const updatedItem = {
        ...currentData,
        ...updates,
        id,
        // keep both naming conventions for compatibility
        bags: parseInt(bags) || 0,
        kgPerBag: parseFloat(kgPerBag) || 50,
        totalKg: totalKg,
        currentStock: parseFloat(currentStockVal) || 0,
        current_stock: parseFloat(currentStockVal) || 0,
        minStockLevel: parseFloat(minStockVal) || 1000,
        min_stock_level: parseFloat(minStockVal) || 1000,
        status: status,
        stock_status: status,
        image: imageUrl,
        updated_at: new Date().toISOString()
      };

      await update(itemRef, updatedItem);
      await this.recordMovement(id, 'update', updates);
      await this.updateInventoryDistribution();
      await this.updateKPIs();
      
      return updatedItem;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  // Delete inventory item
  async deleteInventoryItem(id) {
    try {
      const itemRef = ref(db, `products/${id}`);
      const snapshot = await get(itemRef);
      
      if (!snapshot.exists()) {
        throw new Error('Inventory item not found');
      }

      const itemData = snapshot.val();
      
      // Delete image from storage
      if (itemData.image) {
        await deleteInventoryImage(itemData.image);
      }

      await remove(itemRef);
      await this.updateInventoryDistribution();
      await this.updateKPIs();
      
      return true;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  // Record stock movement
  async recordMovement(itemId, type, data) {
    try {
      const movementRef = push(this.movementsRef);
      const now = new Date().toISOString();
      const movement = {
        id: movementRef.key,
        itemId,
        itemName: data.name,
        type,
        quantity: data.quantity || 0,
        warehouse: data.warehouse,
        from: data.from,
        to: data.to,
        timestamp: now,
        created_at: now,
        updated_at: now,
        user: 'System'
      };

      await set(movementRef, movement);
      return movement;
    } catch (error) {
      console.error('Error recording movement:', error);
      throw error;
    }
  }

  // Get recent movements
  async getRecentMovements(limit = 10) {
    try {
      const snapshot = await get(this.movementsRef);
      if (snapshot.exists()) {
        const movements = snapshot.val();
        return Object.entries(movements)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => {
            const aTime = new Date(a.timestamp || a.created_at || a.createdAt || 0);
            const bTime = new Date(b.timestamp || b.created_at || b.createdAt || 0);
            return bTime - aTime;
          })
          .slice(0, limit);
      }
      return [];
    } catch (error) {
      console.error('Error getting movements:', error);
      throw error;
    }
  }

  // Update inventory distribution
  async updateInventoryDistribution() {
    try {
      const inventory = await this.getAllInventory();
      
      const distribution = inventory.reduce((acc, item) => {
        const type = item.type;
        if (!acc[type]) {
          acc[type] = {
            quantity: 0,
            items: 0,
            value: 0
          };
        }
        acc[type].quantity += item.currentStock;
        acc[type].items += 1;
        acc[type].value += item.currentStock * item.pricePerKg;
        return acc;
      }, {});

      const totalQuantity = Object.values(distribution).reduce((sum, type) => sum + type.quantity, 0);
      
      const distributionData = Object.entries(distribution).map(([category, data]) => ({
        category,
        value: totalQuantity > 0 ? Math.round((data.quantity / totalQuantity) * 100) : 0,
        quantity: `${data.quantity.toLocaleString()} kg`,
        items: data.items,
        valueInRupees: `₹${data.value.toLocaleString()}`
      }));

      await set(this.distributionRef, distributionData);
      return distributionData;
    } catch (error) {
      console.error('Error updating distribution:', error);
      throw error;
    }
  }

  // Get inventory distribution
  async getInventoryDistribution() {
    try {
      const snapshot = await get(this.distributionRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      // If no distribution exists, create it
      return await this.updateInventoryDistribution();
    } catch (error) {
      console.error('Error getting distribution:', error);
      return [];
    }
  }

  // Update KPIs
  async updateKPIs() {
    try {
      const inventory = await this.getAllInventory();
      
      const totalBags = inventory.reduce((sum, item) => sum + (item.bags || 0), 0);
      const totalKg = inventory.reduce((sum, item) => sum + (item.currentStock || 0), 0);
      const totalValue = inventory.reduce((sum, item) => sum + ((item.currentStock || 0) * (item.pricePerKg || 0)), 0);
      
      const lowStockItems = inventory.filter(item => 
        item.status === 'Low Stock' || (item.currentStock / (item.minStockLevel || 1000)) < 0.5
      ).length;
      
      const outOfStockItems = inventory.filter(item => item.status === 'Out of Stock').length;
      const avgQualityScore = inventory.length > 0 
        ? inventory.reduce((sum, item) => sum + (item.qualityScore || 95), 0) / inventory.length 
        : 95;

      const kpis = {
        totalBags,
        totalKg,
        totalValue,
        lowStockItems,
        outOfStockItems,
        avgQualityScore: parseFloat(avgQualityScore.toFixed(1)),
        inventoryTurnover: 4.2, // This could be calculated from movement data
        stockAccuracy: 98.7,
        activeWarehouses: [...new Set(inventory.map(item => item.warehouse))].length,
        lastUpdated: new Date().toISOString()
      };

      await set(this.kpisRef, kpis);
      return kpis;
    } catch (error) {
      console.error('Error updating KPIs:', error);
      throw error;
    }
  }

  // Get KPIs
  async getKPIs() {
    try {
      const snapshot = await get(this.kpisRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      // If no KPIs exist, create them
      return await this.updateKPIs();
    } catch (error) {
      console.error('Error getting KPIs:', error);
      return {
        totalBags: 0,
        totalKg: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        avgQualityScore: 0,
        inventoryTurnover: 0,
        stockAccuracy: 0,
        activeWarehouses: 0
      };
    }
  }

  // Get low stock predictions
  async getLowStockPredictions() {
    try {
      const inventory = await this.getAllInventory();
      
      return inventory
        .filter(item => {
          const stockRatio = (item.currentStock || 0) / (item.minStockLevel || 1000);
          return stockRatio < 0.3;
        })
        .map(item => {
          const stockRatio = (item.currentStock || 0) / (item.minStockLevel || 1000);
          const daysToOut = Math.floor(stockRatio * 30); // Simplified prediction
          
          return {
            ...item,
            predictedOutDate: new Date(Date.now() + daysToOut * 24 * 60 * 60 * 1000)
              .toISOString().split('T')[0],
            riskLevel: stockRatio < 0.15 ? 'Critical' : 'High',
            confidence: Math.floor(Math.random() * 20) + 80
          };
        });
    } catch (error) {
      console.error('Error getting low stock predictions:', error);
      return [];
    }
  }

  // Calculate status based on stock level
  calculateStatus(currentStock, minStockLevel) {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock <= minStockLevel * 0.3) return 'Critical';
    if (currentStock <= minStockLevel * 0.5) return 'Low Stock';
    return 'In Stock';
  }

  // Real-time listeners
  subscribeToInventory(callback) {
    return onValue(this.inventoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const inventory = snapshot.val();
        const formatted = Object.entries(inventory).map(([id, data]) => ({
          id,
          name: data.name,
          type: data.type,
          grade: data.grade,
          bags: data.bags || 0,
          kgPerBag: data.kgPerBag || data.kg_per_bag || 50,
          totalKg: data.totalKg || data.total_kg || ((data.bags || 0) * (data.kgPerBag || data.kg_per_bag || 50)),
          currentStock: data.current_stock || data.currentStock || 0,
          minStockLevel: data.min_stock_level || data.minStockLevel || 1000,
          warehouse: data.warehouse || 'Warehouse A',
          pricePerKg: data.price_per_kg || data.pricePerKg || 0,
          lastUpdated: data.lastUpdated || data.updated_at || data.created_at || '',
          status: data.stock_status || data.status || 'In Stock',
          image: data.image || null,
          qualityScore: data.qualityScore || data.quality_score || null,
          ...data
        }));
        callback(formatted);
      } else {
        callback([]);
      }
    });
  }

  subscribeToKPIs(callback) {
    return onValue(this.kpisRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : {});
    });
  }

  subscribeToMovements(callback, limit = 10) {
    return onValue(this.movementsRef, (snapshot) => {
      if (snapshot.exists()) {
        const movements = snapshot.val();
        const formatted = Object.entries(movements)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => {
            const aTime = new Date(a.timestamp || a.created_at || a.createdAt || 0);
            const bTime = new Date(b.timestamp || b.created_at || b.createdAt || 0);
            return bTime - aTime;
          })
          .slice(0, limit);
        callback(formatted);
      } else {
        callback([]);
      }
    });
  }
}

export default new InventoryService();