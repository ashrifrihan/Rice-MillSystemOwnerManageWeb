import { ref, get } from 'firebase/database';
import { rtdb } from '../firebase/config';

class DataAggregationService {
  /**
   * Fetch all operational data for AI analysis
   */
  async fetchOperationalData() {
    try {
      const dataRef = ref(rtdb, '/');
      const snapshot = await get(dataRef);
      
      if (!snapshot.exists()) {
        throw new Error('No data available');
      }

      const data = snapshot.val();
      
      return {
        inventory: data.inventory || [],
        sales: data.sales || [],
        loans: data.loans || [],
        transport: data.transport || [],
        workers: data.workers || [],
        machines: data.machines || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Data Aggregation Error:', error);
      return this.getMockData();
    }
  }

  /**
   * Fetch stock data for predictions
   */
  async fetchStockData() {
    try {
      const inventoryRef = ref(rtdb, 'inventory');
      const snapshot = await get(inventoryRef);
      
      if (!snapshot.exists()) {
        return this.getMockStockData();
      }

      const stockData = snapshot.val();
      return Object.values(stockData).map(item => ({
        product: item.riceName || item.name || 'Unknown',
        category: this.getCategory(item.riceName),
        currentStock: parseInt(item.currentStock) || 0,
        minStock: parseInt(item.minimumStock) || 100,
        maxStock: parseInt(item.maximumStock) || 1000,
        dailyUsage: this.calculateDailyUsage(item),
        price: parseFloat(item.price) || 0
      }));
    } catch (error) {
      console.error('Stock Data Error:', error);
      return this.getMockStockData();
    }
  }

  /**
   * Calculate daily usage from sales history
   */
  calculateDailyUsage(item) {
    // Simplified calculation - in real app, calculate from sales data
    return Math.floor((item.currentStock || 0) / 30); // Assume 30-day supply
  }

  getCategory(productName) {
    const categories = {
      'Basmati': 'Premium Rice',
      'Sona': 'Regular Rice',
      'Brown': 'Health Rice',
      'Jasmine': 'Aromatic Rice',
      'Paddy': 'Raw Material',
      'Bran': 'By-product'
    };

    for (const [key, value] of Object.entries(categories)) {
      if (productName.includes(key)) return value;
    }
    return 'Regular Rice';
  }

  // Mock data for development
  getMockData() {
    return {
      inventory: [
        {
          id: '1',
          riceName: 'Basmati Rice',
          currentStock: 5600,
          minimumStock: 3000,
          maximumStock: 10000,
          price: 150
        }
      ],
      sales: [
        { date: '2024-01-15', product: 'Basmati Rice', quantity: 280, amount: 42000 }
      ],
      loans: [
        { customer: 'Dealer Ravi', amount: 125000, overdue: 31 }
      ],
      timestamp: new Date().toISOString()
    };
  }

  getMockStockData() {
    return [
      {
        product: 'Basmati Rice',
        category: 'Premium Rice',
        currentStock: 5600,
        minStock: 3000,
        maxStock: 10000,
        dailyUsage: 280,
        price: 150
      },
      {
        product: 'Sona Masoori',
        category: 'Regular Rice',
        currentStock: 4200,
        minStock: 2000,
        maxStock: 8000,
        dailyUsage: 350,
        price: 120
      }
    ];
  }
}

export default new DataAggregationService();