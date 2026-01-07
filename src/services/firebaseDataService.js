// src/services/firebaseDataService.js (Enhanced for ML)
import { rtdb as db } from '../firebase/config';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';

class FirebaseDataService {
  constructor() {
    // Realtime Database refs - using correct node names
    this.salesRef = ref(db, 'sales');
    this.inventoryRef = ref(db, 'products'); // Changed from 'inventory' to 'products'
    this.loansRef = ref(db, 'loans');
    this.workersRef = ref(db, 'workers');
    this.transportRef = ref(db, 'transport');
  }

  async fetchAllData() {
    try {
      const [sales, inventory, loans, workers, transport] = await Promise.all([
        this.fetchSales(),
        this.fetchInventory(),
        this.fetchLoans(),
        this.fetchWorkers(),
        this.fetchTransport()
      ]);

      // Calculate business metrics for ML
      const metrics = this.calculateBusinessMetrics(sales, inventory, loans);

      return {
        sales: this.formatForML(sales, 'sales'),
        inventory: this.formatForML(inventory, 'inventory'),
        loans: this.formatForML(loans, 'loans'),
        workers: this.formatForML(workers, 'workers'),
        transport: this.formatForML(transport, 'transport'),
        metrics: metrics,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error fetching Firebase data:', error);
      return {
        sales: [],
        inventory: [],
        loans: [],
        workers: [],
        transport: [],
        metrics: {},
        error: error.message
      };
    }
  }

  async fetchSales(limitCount = 1000) {
    try {
      // Temporarily fetch without ordering to avoid index requirement
      const snapshot = await get(this.salesRef);
      const sales = [];
      snapshot.forEach(child => {
        sales.push({
          id: child.key,
          ...child.val(),
          date: child.val().date || new Date().toISOString()
        });
      });
      // Sort by date descending manually
      sales.sort((a, b) => new Date(b.date) - new Date(a.date));
      // Return limited results
      return sales.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
  }

  async fetchInventory() {
    try {
      const snapshot = await get(this.inventoryRef);
      const inventory = [];
      snapshot.forEach(child => {
        inventory.push({
          id: child.key,
          ...child.val()
        });
      });
      return inventory;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  }

  async fetchLoans() {
    try {
      const snapshot = await get(this.loansRef);
      const loans = [];
      snapshot.forEach(child => {
        loans.push({
          id: child.key,
          ...child.val(),
          loanDate: child.val().loanDate,
          dueDate: child.val().dueDate
        });
      });
      return loans;
    } catch (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
  }

  async fetchWorkers() {
    try {
      const snapshot = await get(this.workersRef);
      const workers = [];
      snapshot.forEach(child => {
        workers.push({
          id: child.key,
          ...child.val()
        });
      });
      return workers;
    } catch (error) {
      console.error('Error fetching workers:', error);
      return [];
    }
  }

  async fetchTransport() {
    try {
      const snapshot = await get(this.transportRef);
      const transport = [];
      snapshot.forEach(child => {
        transport.push({
          id: child.key,
          ...child.val(),
          deliveryDate: child.val().deliveryDate
        });
      });
      return transport;
    } catch (error) {
      console.error('Error fetching transport:', error);
      return [];
    }
  }

  calculateBusinessMetrics(sales, inventory, loans) {
    // Sales metrics
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= last30Days;
    });
    
    const totalSales30Days = recentSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    
    // Inventory metrics
    const totalStockValue = inventory.reduce((sum, item) => {
      return sum + (item.currentStock || 0) * (item.pricePerKg || 0);
    }, 0);
    
    // Loan metrics
    const totalOutstandingLoans = loans.reduce((sum, loan) => {
      return sum + (loan.outstandingAmount || 0);
    }, 0);
    
    const overdueLoans = loans.filter(loan => (loan.overdueDays || 0) > 0).length;
    
    return {
      totalSales30Days,
      totalStockValue,
      totalOutstandingLoans,
      overdueLoans,
      totalSales: sales.length,
      totalInventory: inventory.length,
      totalLoans: loans.length
    };
  }

  formatForML(data, type) {
    switch(type) {
      case 'sales':
        return data.map(item => ({
          date: item.date,
          amount: parseFloat(item.amount) || 0,
          product: item.product || 'Unknown',
          quantity: parseFloat(item.quantity) || 0,
          customer: item.customer || 'Walk-in',
          paymentType: item.paymentType || 'cash'
        }));
        
      case 'inventory':
        return data.map(item => ({
          product: item.name || item.product || 'Unknown',
          currentStock: parseFloat(item.currentStock) || 0,
          dailyConsumption: parseFloat(item.dailyConsumption) || 10,
          reorderLevel: parseFloat(item.reorderLevel) || parseFloat(item.minimumStock) || 50,
          minimumStock: parseFloat(item.minimumStock) || parseFloat(item.reorderLevel) || 50,
          pricePerKg: parseFloat(item.pricePerKg) || 100,
          category: item.category || 'rice'
        }));
        
      case 'loans':
        return data.map(item => ({
          customer: item.customer || 'Unknown',
          outstandingAmount: parseFloat(item.outstandingAmount) || 0,
          overdueDays: parseInt(item.overdueDays) || 0,
          loanDate: item.loanDate || new Date().toISOString(),
          dueDate: item.dueDate || new Date().toISOString(),
          interestRate: parseFloat(item.interestRate) || 12,
          pastDefaults: parseInt(item.pastDefaults) || 0,
          customerType: item.customerType || 'retail'
        }));
        
      case 'workers':
        return data.map(item => ({
          name: item.name || 'Worker',
          dailyWage: parseFloat(item.dailyWage) || 500,
          attendance: parseFloat(item.attendance) || 0.8,
          productivity: parseFloat(item.productivity) || 0.7,
          skillLevel: item.skillLevel || 'medium'
        }));
        
      default:
        return data;
    }
  }

  async fetchAIInsightsData() {
    // Legacy method for compatibility
    const data = await this.fetchAllData();
    
    return {
      stockRecommendations: data.inventory
        .filter(item => item.currentStock < (item.minimumStock || 50))
        .map(item => ({
          product: item.product,
          currentStock: item.currentStock,
          recommendedOrder: (item.minimumStock || 50) - item.currentStock
        })),
      salesInsights: this.generateSalesInsights(data.sales),
      riskAlerts: this.generateRiskAlerts(data)
    };
  }

  generateSalesInsights(sales) {
    if (sales.length === 0) return [];
    
    const dailySales = {};
    sales.forEach(sale => {
      const date = new Date(sale.date).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + sale.amount;
    });
    
    const dates = Object.keys(dailySales).sort();
    if (dates.length < 2) return [];
    
    const recentAvg = Object.values(dailySales).reduce((a, b) => a + b, 0) / dates.length;
    
    return [{
      period: 'Last 30 days',
      averageSales: recentAvg,
      trend: 'stable',
      recommendation: 'Maintain current strategy'
    }];
  }

  generateRiskAlerts(data) {
    const alerts = [];
    
    // Stock alerts
    data.inventory.forEach(item => {
      if (item.currentStock < (item.minimumStock || 10)) {
        alerts.push({
          type: 'stock',
          severity: 'critical',
          title: `Low stock: ${item.product}`,
          message: `Only ${item.currentStock} kg left`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Loan alerts
    data.loans.forEach(loan => {
      if (loan.overdueDays > 30) {
        alerts.push({
          type: 'loan',
          severity: 'high',
          title: `Overdue loan: ${loan.customer}`,
          message: `${loan.overdueDays} days overdue`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return alerts;
  }

  async fetchStockPredictions() {
    const inventory = await this.fetchInventory();
    const sales = await this.fetchSales(30); // Last 30 days
    
    // Calculate consumption patterns
    const consumptionByProduct = {};
    sales.forEach(sale => {
      if (sale.product) {
        consumptionByProduct[sale.product] = (consumptionByProduct[sale.product] || 0) + (sale.quantity || 0);
      }
    });
    
    // Calculate days sold
    const daysOfSales = Math.min(30, new Set(sales.map(s => s.date.split('T')[0])).size);
    
    return inventory.map(item => {
      const productName = item.name || item.product;
      const dailyConsumption = consumptionByProduct[productName] 
        ? consumptionByProduct[productName] / daysOfSales 
        : 10;
      
      const daysUntilEmpty = item.currentStock / dailyConsumption;
      
      let riskLevel = 'low';
      if (daysUntilEmpty < 5) riskLevel = 'critical';
      else if (daysUntilEmpty < 10) riskLevel = 'high';
      else if (daysUntilEmpty < 20) riskLevel = 'medium';
      
      return {
        product: productName,
        currentStock: item.currentStock,
        dailyConsumption: dailyConsumption,
        daysUntilEmpty: Math.round(daysUntilEmpty),
        riskLevel: riskLevel,
        recommendedOrderQty: Math.max(0, (item.minimumStock || 50) - item.currentStock)
      };
    });
  }

  async fetchRiskAlerts() {
    const data = await this.fetchAllData();
    return this.generateRiskAlerts(data);
  }

  async fetchBusinessMetrics() {
    const data = await this.fetchAllData();
    return data.metrics;
  }
}

export default new FirebaseDataService();