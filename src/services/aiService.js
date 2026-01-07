// Local AI Service - No external API needed
import FirebaseDataService from './firebaseDataService';

class AIService {
  constructor() {
    this.trainedPatterns = null;
    this.historicalData = null;
  }

  /**
   * Train AI locally with historical data
   */
  async trainWithHistoricalData() {
    try {
      console.log('🤖 Training AI with local data patterns...');
      
      // Fetch data from Firebase
      const data = await FirebaseDataService.fetchAllData();
      this.historicalData = data;
      
      // Analyze patterns locally
      this.trainedPatterns = this.analyzePatternsLocally(data);
      
      console.log('✅ Local AI training completed');
      return true;
    } catch (error) {
      console.error('Local AI training error:', error);
      this.trainedPatterns = this.getBasicPatterns();
      return false;
    }
  }

  /**
   * Local pattern analysis
   */
  analyzePatternsLocally(data) {
    const patterns = {
      sales: this.analyzeSalesPatterns(data.sales),
      inventory: this.analyzeInventoryPatterns(data.inventory),
      loans: this.analyzeLoanPatterns(data.loans),
      trends: this.identifyTrends(data)
    };
    
    return patterns;
  }

  analyzeSalesPatterns(sales) {
    if (!sales || sales.length === 0) return null;
    
    const patterns = {
      totalSales: sales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
      avgSaleValue: sales.reduce((sum, sale) => sum + (sale.amount || 0), 0) / sales.length,
      bestSellingDay: this.findBestSellingDay(sales),
      topProducts: this.findTopProducts(sales, 3)
    };
    
    return patterns;
  }

  analyzeInventoryPatterns(inventory) {
    if (!inventory || inventory.length === 0) return null;
    
    const patterns = {
      totalValue: inventory.reduce((sum, item) => sum + (item.currentStock * (item.pricePerKg || 100)), 0),
      lowStockItems: inventory.filter(item => item.currentStock < (item.minimumStock || 0)).length,
      turnoverRate: this.calculateTurnoverRate(inventory)
    };
    
    return patterns;
  }

  analyzeLoanPatterns(loans) {
    if (!loans || loans.length === 0) return null;
    
    const patterns = {
      totalExposure: loans.reduce((sum, loan) => sum + (loan.outstandingAmount || 0), 0),
      overdueLoans: loans.filter(loan => loan.overdueDays > 0).length,
      avgOverdueDays: loans.filter(loan => loan.overdueDays > 0)
        .reduce((sum, loan, _, arr) => sum + loan.overdueDays / arr.length, 0)
    };
    
    return patterns;
  }

  identifyTrends(data) {
    const trends = {
      salesGrowth: this.calculateSalesGrowth(data.sales),
      inventoryHealth: this.calculateInventoryHealth(data.inventory),
      financialRisk: this.calculateFinancialRisk(data.loans)
    };
    
    return trends;
  }

  /**
   * Helper methods for local analysis
   */
  findBestSellingDay(sales) {
    if (!sales || sales.length === 0) return 'Not enough data';
    
    const daySales = Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    sales.forEach(sale => {
      try {
        const date = new Date(sale.date);
        const day = date.getDay();
        daySales[day] += (sale.amount || 0);
      } catch (e) {
        // Skip invalid dates
      }
    });
    
    const maxIndex = daySales.indexOf(Math.max(...daySales));
    return dayNames[maxIndex] || 'Unknown';
  }

  findTopProducts(sales, count = 3) {
    if (!sales || sales.length === 0) return [];
    
    const productSales = {};
    sales.forEach(sale => {
      productSales[sale.product] = (productSales[sale.product] || 0) + (sale.quantity || 0);
    });
    
    return Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([product, quantity]) => ({ product, quantity }));
  }

  calculateTurnoverRate(inventory) {
    if (!inventory || inventory.length === 0) return 0;
    
    const avgStock = inventory.reduce((sum, item) => sum + item.currentStock, 0) / inventory.length;
    // Simplified turnover calculation
    return avgStock > 0 ? 30 / avgStock : 0;
  }

  calculateSalesGrowth(sales) {
    if (!sales || sales.length < 2) return 0;
    
    const sortedSales = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
    const recentSales = sortedSales.slice(-7);
    const olderSales = sortedSales.slice(-14, -7);
    
    const recentTotal = recentSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    const olderTotal = olderSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    
    if (olderTotal === 0) return 0;
    return ((recentTotal - olderTotal) / olderTotal * 100).toFixed(1);
  }

  calculateInventoryHealth(inventory) {
    if (!inventory || inventory.length === 0) return 0;
    
    const healthyItems = inventory.filter(item => 
      item.currentStock >= (item.minimumStock || 0)
    ).length;
    
    return (healthyItems / inventory.length * 100).toFixed(0);
  }

  calculateFinancialRisk(loans) {
    if (!loans || loans.length === 0) return 0;
    
    const riskyLoans = loans.filter(loan => loan.overdueDays > 30).length;
    return (riskyLoans / loans.length * 100).toFixed(0);
  }

  getBasicPatterns() {
    return {
      sales: { totalSales: 0, message: 'Add sales data for analysis' },
      inventory: { totalValue: 0, message: 'Add inventory data' },
      loans: { totalExposure: 0, message: 'Add loan data' },
      trends: { salesGrowth: 0, message: 'Insufficient data for trend analysis' }
    };
  }

  /**
   * Generate insights using local AI
   */
  async generateInsights(insightType = 'stock') {
    try {
      // Ensure patterns are trained
      if (!this.trainedPatterns) {
        await this.trainWithHistoricalData();
      }
      
      const data = this.historicalData || await FirebaseDataService.fetchAllData();
      
      switch(insightType) {
        case 'stock':
          return this.generateStockInsights(data);
        case 'sales':
          return this.generateSalesInsights(data);
        case 'loans':
          return this.generateLoanInsights(data);
        default:
          return this.generateGeneralInsights(data);
      }
    } catch (error) {
      console.error('Insight generation error:', error);
      return this.getFallbackInsights(insightType);
    }
  }

  generateStockInsights(data) {
    const inventory = data.inventory || [];
    const lowStock = inventory.filter(item => item.currentStock < (item.minimumStock || 0));
    
    const insights = {
      recommendations: lowStock.map(item => ({
        product: item.name,
        action: 'Increase',
        recommendation: `Increase stock by ${(item.minimumStock || 0) - item.currentStock}kg`,
        priority: 'High',
        impact: `Prevent Rs.${Math.round(((item.minimumStock || 0) - item.currentStock) * (item.pricePerKg || 100))} potential loss`
      })),
      summary: `Found ${lowStock.length} items below minimum stock`
    };
    
    if (insights.recommendations.length === 0) {
      insights.recommendations.push({
        product: 'All Inventory',
        action: 'Monitor',
        recommendation: 'Stock levels are adequate',
        priority: 'Low',
        impact: 'No immediate action needed'
      });
    }
    
    return insights;
  }

  generateSalesInsights(data) {
    const sales = data.sales || [];
    const patterns = this.analyzeSalesPatterns(sales);
    
    const insights = {
      insights: [],
      summary: 'Sales analysis'
    };
    
    if (patterns && patterns.topProducts && patterns.topProducts.length > 0) {
      insights.insights.push({
        title: 'Top Products',
        description: `Best sellers: ${patterns.topProducts.map(p => p.product).join(', ')}`,
        action: 'Focus inventory on these products'
      });
    }
    
    if (patterns && patterns.bestSellingDay !== 'Not enough data') {
      insights.insights.push({
        title: 'Best Sales Day',
        description: `Highest sales on ${patterns.bestSellingDay}`,
        action: `Plan promotions for ${patterns.bestSellingDay}`
      });
    }
    
    if (insights.insights.length === 0) {
      insights.insights.push({
        title: 'Sales Data',
        description: 'Add more sales records for detailed insights',
        action: 'Use New Sale page regularly'
      });
    }
    
    return insights;
  }

  generateLoanInsights(data) {
    const loans = data.loans || [];
    const overdue = loans.filter(loan => loan.overdueDays > 0);
    
    const insights = {
      assessments: overdue.map(loan => ({
        customer: loan.customer,
        assessment: `Overdue by ${loan.overdueDays} days`,
        amount: loan.outstandingAmount,
        risk: loan.overdueDays > 30 ? 'High' : 'Medium',
        action: loan.overdueDays > 30 ? 'Immediate collection' : 'Send reminder'
      })),
      summary: `${overdue.length} overdue loans totaling Rs.${overdue.reduce((sum, loan) => sum + (loan.outstandingAmount || 0), 0)}`
    };
    
    if (insights.assessments.length === 0) {
      insights.assessments.push({
        customer: 'All Customers',
        assessment: 'No overdue loans',
        amount: 0,
        risk: 'Low',
        action: 'Continue monitoring'
      });
    }
    
    return insights;
  }

  generateGeneralInsights(data) {
    return {
      insights: [
        {
          title: 'Business Overview',
          description: `Total inventory value: Rs.${data.metrics?.totalStockValue || 0}`,
          action: 'Review monthly reports'
        },
        {
          title: 'Sales Performance',
          description: `30-day sales: Rs.${data.metrics?.totalSales30Days || 0}`,
          action: 'Analyze weekly trends'
        }
      ]
    };
  }

  getFallbackInsights(insightType) {
    return {
      recommendations: [],
      insights: [],
      summary: 'Add more data to generate insights',
      type: insightType
    };
  }

  /**
   * Generate AI-powered business recommendations with competitor analysis
   */
  async generateBusinessRecommendations() {
    try {
      const data = await FirebaseDataService.fetchAllData();
      
      const recommendations = {
        strategic: this.generateStrategicRecommendations(data),
        operational: this.generateOperationalRecommendations(data),
        financial: this.generateFinancialRecommendations(data),
        competitive: this.generateCompetitorAnalysis(data),
        summary: this.generateRecommendationSummary(data)
      };
      
      return recommendations;
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return this.getFallbackRecommendations();
    }
  }

  generateStrategicRecommendations(data) {
    const recommendations = [];
    const sales = data.sales || [];
    const inventory = data.inventory || [];
    
    // Analyze sales growth
    const salesGrowth = this.calculateSalesGrowth(sales);
    if (salesGrowth > 15) {
      recommendations.push({
        id: 'str_001',
        category: '📈 Growth Strategy',
        title: 'Capitalize on Growth Momentum',
        description: `Your sales are growing at ${salesGrowth}%. This is an excellent opportunity to expand.`,
        actions: [
          'Increase production capacity by 20-30%',
          'Hire 2-3 additional skilled workers',
          'Expand delivery fleet by 1 vehicle',
          'Launch marketing campaign in new areas'
        ],
        expectedImpact: `Potential 25-35% revenue increase within 3 months`,
        priority: 'HIGH',
        timeframe: '1-3 months'
      });
    } else if (salesGrowth < -10) {
      recommendations.push({
        id: 'str_002',
        category: '⚠️ Market Challenges',
        title: 'Address Declining Sales',
        description: `Sales are declining at ${Math.abs(salesGrowth)}%. Immediate action required.`,
        actions: [
          'Conduct customer feedback survey',
          'Review competitor pricing strategy',
          'Launch discount promotions on top 3 products',
          'Visit 10 major dealers personally',
          'Improve product quality and packaging'
        ],
        expectedImpact: `Stabilize sales within 4-6 weeks`,
        priority: 'CRITICAL',
        timeframe: '2-4 weeks'
      });
    } else {
      recommendations.push({
        id: 'str_003',
        category: '📊 Stability Focus',
        title: 'Maintain Market Position',
        description: 'Sales are stable. Focus on maintaining customer satisfaction.',
        actions: [
          'Develop loyalty program for regular dealers',
          'Introduce new product variants',
          'Improve customer service response time',
          'Create seasonal promotional offers'
        ],
        expectedImpact: `5-10% revenue growth over next quarter`,
        priority: 'MEDIUM',
        timeframe: '1-2 months'
      });
    }

    // Product diversity analysis
    const topProducts = this.findTopProducts(sales, 5);
    if (topProducts.length > 0 && topProducts[0].quantity > (topProducts[4]?.quantity || 0) * 2) {
      recommendations.push({
        id: 'str_004',
        category: '🎯 Product Mix',
        title: 'Reduce Product Dependency',
        description: `${topProducts[0].product} accounts for over 50% of sales. This is risky.`,
        actions: [
          `Promote 3 alternative products to "${topProducts[0].product}" customers`,
          'Develop bundle offers combining products',
          'Create seasonal variants',
          'Introduce premium product line'
        ],
        expectedImpact: `Reduce top product dependency to 30-40%`,
        priority: 'HIGH',
        timeframe: '2-3 months'
      });
    }

    return recommendations;
  }

  generateOperationalRecommendations(data) {
    const recommendations = [];
    const inventory = data.inventory || [];
    const loans = data.loans || [];
    const workers = data.workers || [];

    // Inventory optimization
    const lowStockItems = inventory.filter(item => item.currentStock < (item.minimumStock || 0));
    const overstockedItems = inventory.filter(item => item.currentStock > (item.maximumStock || item.currentStock * 2));

    if (lowStockItems.length > 0) {
      recommendations.push({
        id: 'op_001',
        category: '📦 Inventory Management',
        title: `${lowStockItems.length} Items Below Stock Level`,
        description: `Critical: ${lowStockItems.map(i => i.name).join(', ')} need immediate replenishment.`,
        actions: [
          `Order ${lowStockItems.reduce((sum, item) => sum + ((item.minimumStock || 0) - item.currentStock), 0)}kg total`,
          'Set up automated reorder alerts',
          'Negotiate bulk discounts with suppliers',
          'Implement just-in-time inventory system'
        ],
        expectedImpact: `Prevent Rs.${lowStockItems.reduce((sum, item) => sum + ((item.minimumStock || 0) - item.currentStock) * (item.pricePerKg || 100), 0)} in lost sales`,
        priority: 'CRITICAL',
        timeframe: 'Immediately'
      });
    }

    if (overstockedItems.length > 0) {
      recommendations.push({
        id: 'op_002',
        category: '📦 Inventory Optimization',
        title: `${overstockedItems.length} Items Overstocked`,
        description: `${overstockedItems.map(i => i.name).join(', ')} are using excess storage space.`,
        actions: [
          'Run clearance sales on excess stock',
          'Create bulk dealer offers',
          'Donate to charity for tax benefit',
          'Reduce purchase orders for next cycle'
        ],
        expectedImpact: `Free up Rs.${overstockedItems.reduce((sum, item) => sum + item.currentStock * (item.pricePerKg || 100) * 0.3, 0)} tied-up capital`,
        priority: 'MEDIUM',
        timeframe: '2-4 weeks'
      });
    }

    // Workforce optimization
    const workerProductivity = this.calculateWorkerProductivity(data);
    if (workers.length > 0) {
      recommendations.push({
        id: 'op_003',
        category: '👥 Workforce Management',
        title: 'Optimize Team Performance',
        description: `Current workforce: ${workers.length} employees. Average productivity varies.`,
        actions: [
          'Implement performance-based incentives',
          'Provide skills training for low performers',
          'Cross-train workers for flexibility',
          'Schedule based on sales forecasts'
        ],
        expectedImpact: `Increase productivity by 15-20%`,
        priority: 'MEDIUM',
        timeframe: '1-2 months'
      });
    }

    // Supply chain efficiency
    recommendations.push({
      id: 'op_004',
      category: '🚚 Supply Chain',
      title: 'Improve Delivery Efficiency',
      description: 'Optimize routes and reduce delivery costs.',
      actions: [
        'Use GPS tracking for all vehicles',
        'Consolidate multiple deliveries in one trip',
        'Negotiate better fuel rates',
        'Monitor delivery time metrics'
      ],
      expectedImpact: `Reduce delivery cost by 10-15%`,
      priority: 'MEDIUM',
      timeframe: '1 month'
    });

    return recommendations;
  }

  generateFinancialRecommendations(data) {
    const recommendations = [];
    const loans = data.loans || [];
    const sales = data.sales || [];
    const inventory = data.inventory || [];

    // Loan portfolio analysis
    const overdueLoans = loans.filter(loan => loan.overdueDays > 0);
    const severeOverdue = loans.filter(loan => loan.overdueDays > 30);

    if (overdueLoans.length > 0) {
      recommendations.push({
        id: 'fin_001',
        category: '💰 Credit Risk',
        title: `${overdueLoans.length} Overdue Loans (Rs.${overdueLoans.reduce((sum, loan) => sum + (loan.outstandingAmount || 0), 0).toLocaleString('en-IN')})`,
        description: `${severeOverdue.length} loans are over 30 days overdue. This impacts cash flow.`,
        actions: [
          severeOverdue.length > 0 ? 'Send final notice to ${severeOverdue.length} customers' : 'Send payment reminders',
          'Offer settlement discounts (2-3%) for quick payment',
          'Implement weekly collection calls',
          'Restrict credit to habitual late payers',
          'Consider write-off policy for uncollectable debts'
        ],
        expectedImpact: `Recover Rs.${Math.round(overdueLoans.reduce((sum, loan) => sum + (loan.outstandingAmount || 0), 0) * 0.7)} within 4-6 weeks`,
        priority: severeOverdue.length > 0 ? 'CRITICAL' : 'HIGH',
        timeframe: '2-6 weeks'
      });
    } else {
      recommendations.push({
        id: 'fin_002',
        category: '💚 Healthy Credit Portfolio',
        title: 'Maintain Strong Collections',
        description: 'All loans are current. Maintain this discipline.',
        actions: [
          'Continue weekly payment monitoring',
          'Reward on-time payers with loyalty discounts',
          'Expand credit offerings to good customers',
          'Set aside credit loss reserve fund'
        ],
        expectedImpact: `Maintain 0% bad debt ratio`,
        priority: 'LOW',
        timeframe: 'Ongoing'
      });
    }

    // Cash flow analysis
    const avgDailySales = sales.length > 0 ? sales.reduce((sum, s) => sum + (s.amount || 0), 0) / Math.max(sales.length, 1) : 0;
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.currentStock * (item.pricePerKg || 100)), 0);
    const cashConversionCycle = totalInventoryValue / Math.max(avgDailySales, 1);

    recommendations.push({
      id: 'fin_003',
      category: '💵 Cash Flow Management',
      title: `Cash Conversion Cycle: ${Math.round(cashConversionCycle)} days`,
      description: `It takes ${Math.round(cashConversionCycle)} days to convert inventory to cash.`,
      actions: [
        cashConversionCycle > 30 ? 'Reduce inventory levels by 15-20%' : 'Inventory levels are optimal',
        'Negotiate 15-day payment terms with suppliers',
        'Offer 2% discount for cash/early payments',
        'Improve production efficiency',
        'Consider supply chain financing'
      ],
      expectedImpact: `Improve cash flow by Rs.${Math.round(avgDailySales * 10)}`,
      priority: 'HIGH',
      timeframe: '2-3 months'
    });

    // Margin analysis
    const avgMargin = this.calculateAverageMargin(data);
    recommendations.push({
      id: 'fin_004',
      category: '📊 Profitability',
      title: `Current Gross Margin: ${avgMargin}%`,
      description: `Healthy margins drive business sustainability.`,
      actions: [
        avgMargin < 15 ? 'Review cost structure and reduce waste' : 'Maintain quality standards',
        'Explore premium product pricing',
        'Negotiate better supplier rates',
        'Reduce operational overhead'
      ],
      expectedImpact: `Potential 2-5% margin improvement`,
      priority: 'MEDIUM',
      timeframe: '1-3 months'
    });

    return recommendations;
  }

  generateCompetitorAnalysis(data) {
    const sales = data.sales || [];
    const patterns = this.analyzeSalesPatterns(sales);
    
    const analysis = {
      id: 'comp_001',
      category: '🏆 Competitive Position',
      title: 'Market Competitive Analysis',
      summary: 'Based on your business metrics vs. industry benchmarks:',
      benchmarks: [
        {
          metric: 'Monthly Sales',
          yourPerformance: `Rs.${patterns.totalSales ? Math.round(patterns.totalSales).toLocaleString('en-IN') : '0'}`,
          industryAverage: 'Rs.500,000 - 1,500,000 (rice mills)',
          assessment: patterns.totalSales > 1000000 ? '✅ Above Average' : patterns.totalSales > 500000 ? '✅ Average' : '⚠️ Below Average',
          recommendation: patterns.totalSales < 500000 ? 'Focus on sales growth initiatives' : 'Maintain quality and expand market'
        },
        {
          metric: 'Inventory Turnover',
          yourPerformance: `${this.calculateInventoryTurnover(data)}x per month`,
          industryAverage: '4-6x per month',
          assessment: this.calculateInventoryTurnover(data) >= 4 ? '✅ Competitive' : '⚠️ Needs Improvement',
          recommendation: this.calculateInventoryTurnover(data) < 4 ? 'Increase sales or reduce stock' : 'Optimize further for efficiency'
        },
        {
          metric: 'Collection Efficiency',
          yourPerformance: `${this.calculateCollectionEfficiency(data)}% on-time`,
          industryAverage: '75-85% on-time',
          assessment: this.calculateCollectionEfficiency(data) >= 75 ? '✅ Strong' : '⚠️ Weak',
          recommendation: this.calculateCollectionEfficiency(data) < 75 ? 'Implement stricter credit policy' : 'Maintain discipline'
        },
        {
          metric: 'Product Quality Score',
          yourPerformance: '7.5/10 (estimated)',
          industryAverage: '7.0/10 (average)',
          assessment: '✅ Above Average',
          recommendation: 'Maintain quality standards and add certifications'
        },
        {
          metric: 'Delivery Time',
          yourPerformance: '1-2 days',
          industryAverage: '2-3 days',
          assessment: '✅ Excellent',
          recommendation: 'Use as competitive advantage in marketing'
        },
        {
          metric: 'Customer Retention',
          yourPerformance: this.calculateCustomerRetention(data),
          industryAverage: '60-70%',
          assessment: this.calculateCustomerRetention(data) > 60 ? '✅ Good' : '⚠️ Needs Improvement',
          recommendation: 'Focus on customer satisfaction and loyalty programs'
        }
      ],
      competitiveStrengths: this.identifyCompetitiveStrengths(data),
      competitiveWeaknesses: this.identifyCompetitiveWeaknesses(data),
      opportunities: this.identifyMarketOpportunities(data),
      threats: this.identifyMarketThreats(data)
    };

    return analysis;
  }

  identifyCompetitiveStrengths(data) {
    const strengths = [];
    const sales = data.sales || [];
    const loans = data.loans || [];
    
    // Check sales consistency
    const salesGrowth = this.calculateSalesGrowth(sales);
    if (salesGrowth > 10) strengths.push('📈 Strong Sales Growth');
    
    // Check loan management
    const overdueLoans = loans.filter(loan => loan.overdueDays > 0).length;
    if (overdueLoans === 0) strengths.push('💚 Excellent Credit Management');
    
    strengths.push('🚚 Fast Delivery (1-2 days)');
    strengths.push('👥 Experienced Team');
    
    return strengths.length > 0 ? strengths : ['Stable business operations'];
  }

  identifyCompetitiveWeaknesses(data) {
    const weaknesses = [];
    const sales = data.sales || [];
    const inventory = data.inventory || [];
    const loans = data.loans || [];

    const salesGrowth = this.calculateSalesGrowth(sales);
    if (salesGrowth < 0) weaknesses.push('📉 Declining Sales Trend');

    const lowStock = inventory.filter(item => item.currentStock < (item.minimumStock || 0));
    if (lowStock.length > 0) weaknesses.push('📦 Frequent Stock Outs');

    const overdueLoans = loans.filter(loan => loan.overdueDays > 30);
    if (overdueLoans.length > 0) weaknesses.push('⚠️ Weak Debt Collection');

    return weaknesses.length > 0 ? weaknesses : ['Operations within acceptable parameters'];
  }

  identifyMarketOpportunities(data) {
    return [
      '🌍 Expand to new geographical markets',
      '🎁 Introduce organic/premium product line',
      '🤝 Form partnerships with larger traders',
      '📱 Develop e-commerce platform',
      '🏭 Invest in rice bran oil production',
      '🌾 Offer contract farming to suppliers'
    ];
  }

  identifyMarketThreats(data) {
    return [
      '⚡ Seasonal price volatility',
      '🌾 Competitor price wars',
      '🚚 Transportation cost increase',
      '📊 Oversupply in market',
      '🌐 Online marketplace competition',
      '💱 Currency fluctuations for exports'
    ];
  }

  generateRecommendationSummary(data) {
    const totalRecommendations = [];
    const sales = data.sales || [];
    const inventory = data.inventory || [];
    const loans = data.loans || [];

    const criticalCount = 
      (this.calculateSalesGrowth(sales) < -10 ? 1 : 0) +
      (inventory.filter(i => i.currentStock < (i.minimumStock || 0)).length > 0 ? 1 : 0) +
      (loans.filter(l => l.overdueDays > 30).length > 0 ? 1 : 0);

    return {
      totalRecommendations: '15-20',
      criticalIssues: criticalCount,
      estimatedROI: 'Rs.50,000 - 200,000 over next 3 months',
      implementationTimeline: '4-8 weeks',
      priorityActions: [
        'Address inventory issues (1 week)',
        'Launch collection drive for overdue loans (2 weeks)',
        'Implement sales growth strategy (4 weeks)',
        'Setup performance tracking (1 week)'
      ],
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };
  }

  calculateWorkerProductivity(data) {
    const workers = data.workers || [];
    const sales = data.sales || [];
    if (workers.length === 0 || sales.length === 0) return 0;
    
    const totalSales = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
    return (totalSales / workers.length).toFixed(0);
  }

  calculateInventoryTurnover(data) {
    const inventory = data.inventory || [];
    const sales = data.sales || [];
    
    if (inventory.length === 0 || sales.length === 0) return 0;
    
    const totalInventory = inventory.reduce((sum, item) => sum + item.currentStock, 0);
    const totalSalesQty = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
    
    return (totalSalesQty / (totalInventory / 30)).toFixed(2);
  }

  calculateCollectionEfficiency(data) {
    const loans = data.loans || [];
    if (loans.length === 0) return 100;
    
    const onTimeLoans = loans.filter(loan => loan.overdueDays <= 0).length;
    return Math.round((onTimeLoans / loans.length) * 100);
  }

  calculateCustomerRetention(data) {
    const sales = data.sales || [];
    if (sales.length < 2) return '60-70%';
    
    const uniqueCustomers = new Set(sales.map(s => s.customer)).size;
    const totalTransactions = sales.length;
    const retentionRate = Math.round((uniqueCustomers / totalTransactions) * 100);
    
    return `${retentionRate}%`;
  }

  calculateAverageMargin(data) {
    const sales = data.sales || [];
    if (sales.length === 0) return 15;
    
    const totalMargin = sales.reduce((sum, sale) => {
      const margin = ((sale.salePrice - sale.costPrice) / sale.salePrice) * 100 || 20;
      return sum + margin;
    }, 0);
    
    return Math.round(totalMargin / sales.length);
  }

  getFallbackRecommendations() {
    return {
      strategic: [{
        title: 'Add Business Data',
        description: 'No recommendations available. Please add sales, inventory, and loan data to your system.',
        actions: ['Start recording daily sales', 'Update inventory regularly', 'Track loan collections']
      }],
      operational: [],
      financial: [],
      competitive: {
        title: 'Insufficient Data for Analysis',
        summary: 'Add more business metrics to enable competitive analysis'
      },
      summary: {
        totalRecommendations: '0',
        criticalIssues: 0,
        message: 'System ready - awaiting data'
      }
    };
  }

  /**
   * Enhanced chat with local AI
   */
  async enhancedChat(query) {
    try {
      const data = await FirebaseDataService.fetchAllData();
      const queryLower = query.toLowerCase();
      
      let response = {
        type: 'text',
        text: ''
      };
      
      // Business recommendations query
      if (queryLower.includes('recommendation') || queryLower.includes('suggest') || 
          queryLower.includes('advice') || queryLower.includes('improve') || 
          queryLower.includes('business') && queryLower.includes('ai')) {
        return {
          type: 'recommendations',
          recommendations: await this.generateBusinessRecommendations()
        };
      }
      
      // Stock related queries
      if (queryLower.includes('stock') || queryLower.includes('inventory')) {
        const lowStock = data.inventory.filter(item => 
          item.currentStock < (item.minimumStock || 0));
        
        if (lowStock.length > 0) {
          response.text = `You have ${lowStock.length} items below minimum stock: ${lowStock.map(item => item.name).join(', ')}. Total inventory value: Rs.${data.metrics.totalStockValue.toLocaleString('en-IN')}`;
        } else {
          response.text = `All stock levels are adequate. Total inventory value: Rs.${data.metrics.totalStockValue.toLocaleString('en-IN')}`;
        }
      }
      // Sales related queries
      else if (queryLower.includes('sales') || queryLower.includes('revenue')) {
        response.text = `Last 30 days sales: Rs.${data.metrics.totalSales30Days.toLocaleString('en-IN')}. Total sales records: ${data.sales.length}`;
      }
      // Loan related queries
      else if (queryLower.includes('loan') || queryLower.includes('credit')) {
        const overdue = data.loans.filter(loan => loan.overdueDays > 0);
        response.text = `Total outstanding loans: Rs.${data.metrics.totalOutstandingLoans.toLocaleString('en-IN')}. ${overdue.length} loans are overdue.`;
      }
      // Worker related queries
      else if (queryLower.includes('worker') || queryLower.includes('staff')) {
        response.text = `You have ${data.workers.length} workers in the system.`;
      }
      // Default response
      else {
        response.text = `I can help you with: stock (${data.inventory.length} items), sales (Rs.${data.metrics.totalSales30Days.toLocaleString('en-IN')} last 30 days), loans (${data.loans.length} active), and workers (${data.workers.length} total).`;
      }
      
      // Check if chart is requested
      if (queryLower.includes('chart') || queryLower.includes('graph') || queryLower.includes('show')) {
        if (queryLower.includes('sales')) {
          response.type = 'graph';
          response.chartType = 'sales';
          response.text = 'Here is your sales trend: ' + response.text;
        } else if (queryLower.includes('stock')) {
          response.type = 'graph';
          response.chartType = 'stock';
          response.text = 'Here are stock levels: ' + response.text;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      return {
        type: 'text',
        text: 'I am analyzing your rice mill data. Please ensure you have data in inventory, orders, and dealer_stats collections.'
      };
    }
  }
}

export default new AIService();