// src/services/seedInventory.js
import inventoryService from './inventoryService';

export const seedInventoryData = async () => {
  try {
    console.log('Checking and seeding inventory data...');
    
    // Check if inventory exists
    const existingInventory = await inventoryService.getAllInventory();
    
    if (existingInventory.length === 0) {
      console.log('No inventory data found. Seeding initial data...');
      
      const sampleInventory = [
        {
          name: 'Nadu Raw Rice',
          type: 'Nadu',
          grade: 'Premium',
          bags: 150,
          kgPerBag: 50,
          currentStock: 7500,
          minStockLevel: 1000,
          warehouse: 'Warehouse A',
          pricePerKg: 45,
          qualityScore: 98
        },
        {
          name: 'Samba Rice',
          type: 'Samba',
          grade: 'Grade A',
          bags: 80,
          kgPerBag: 50,
          currentStock: 1200,
          minStockLevel: 800,
          warehouse: 'Warehouse B',
          pricePerKg: 60,
          qualityScore: 92
        },
        {
          name: 'Premium Basmati',
          type: 'Basmati',
          grade: 'Premium',
          bags: 200,
          kgPerBag: 25,
          currentStock: 3500,
          minStockLevel: 1000,
          warehouse: 'Warehouse C',
          pricePerKg: 120,
          qualityScore: 99
        },
        {
          name: 'Brown Rice Organic',
          type: 'Brown Rice',
          grade: 'Grade A',
          bags: 60,
          kgPerBag: 50,
          currentStock: 450,
          minStockLevel: 750,
          warehouse: 'Warehouse A',
          pricePerKg: 85,
          qualityScore: 95
        },
        {
          name: 'Jasmine Rice',
          type: 'Jasmine',
          grade: 'Grade A',
          bags: 120,
          kgPerBag: 50,
          currentStock: 4500,
          minStockLevel: 1500,
          warehouse: 'Warehouse B',
          pricePerKg: 75,
          qualityScore: 96
        }
      ];

      // Add each inventory item
      for (const item of sampleInventory) {
        await inventoryService.addInventoryItem(item);
      }

      console.log('Inventory data seeded successfully!');
    } else {
      console.log(`Found ${existingInventory.length} existing inventory items.`);
    }

    // Update KPIs and distribution
    await inventoryService.updateKPIs();
    await inventoryService.updateInventoryDistribution();
    
    return true;
  } catch (error) {
    console.error('Error seeding inventory data:', error);
    throw error;
  }
};

// Seed movements data
export const seedMovementsData = async () => {
  try {
    const movements = [
      {
        itemName: 'Nadu Raw Rice',
        type: 'Receiving',
        quantity: 500,
        warehouse: 'Warehouse A',
        from: 'Supplier A',
        to: null
      },
      {
        itemName: 'Samba Rice',
        type: 'Issuing',
        quantity: 200,
        warehouse: 'Warehouse B',
        from: null,
        to: 'Customer B'
      },
      {
        itemName: 'Premium Basmati',
        type: 'Receiving',
        quantity: 800,
        warehouse: 'Warehouse C',
        from: 'Supplier C',
        to: null
      },
      {
        itemName: 'Brown Rice Organic',
        type: 'Transfer',
        quantity: 150,
        warehouse: 'Warehouse A',
        from: 'Warehouse A',
        to: 'Warehouse B'
      }
    ];

    for (const movement of movements) {
      await inventoryService.recordMovement('sample', movement.type, movement);
    }

    console.log('Movements data seeded successfully!');
  } catch (error) {
    console.error('Error seeding movements data:', error);
  }
};