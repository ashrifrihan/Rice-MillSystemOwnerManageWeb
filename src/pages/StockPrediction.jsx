import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  Package,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Activity,
  Calculator,
  Percent,
  Users,
  Truck,
  Factory,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Filter,
  Search,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data for stock predictions
const mockStockData = {
  predictions: [
    {
      product: 'Basmati Rice',
      category: 'Premium Rice',
      currentStock: 5600,
      minStock: 3000,
      maxStock: 10000,
      dailyUsage: 280,
      predictedChange: 18.5,
      confidence: 94,
      riskLevel: 'medium',
      tamilAdvice: 'Festival season coming. Increase stock by 20%.',
      history: [
        { date: 'Day 1', stock: 5200 },
        { date: 'Day 2', stock: 5100 },
        { date: 'Day 3', stock: 5000 },
        { date: 'Day 4', stock: 5300 },
        { date: 'Day 5', stock: 5400 },
        { date: 'Day 6', stock: 5500 },
        { date: 'Day 7', stock: 5600 }
      ]
    },
    {
      product: 'Sona Masoori',
      category: 'Regular Rice',
      currentStock: 4200,
      minStock: 2000,
      maxStock: 8000,
      dailyUsage: 350,
      predictedChange: 8.2,
      confidence: 92,
      riskLevel: 'low',
      tamilAdvice: 'Stable demand. Maintain current levels.',
      history: [
        { date: 'Day 1', stock: 4000 },
        { date: 'Day 2', stock: 3900 },
        { date: 'Day 3', stock: 4100 },
        { date: 'Day 4', stock: 4200 },
        { date: 'Day 5', stock: 4150 },
        { date: 'Day 6', stock: 4180 },
        { date: 'Day 7', stock: 4200 }
      ]
    },
    {
      product: 'Brown Rice',
      category: 'Health Rice',
      currentStock: 2300,
      minStock: 2000,
      maxStock: 5000,
      dailyUsage: 150,
      predictedChange: 25.4,
      confidence: 96,
      riskLevel: 'high',
      tamilAdvice: 'Health trend increasing. Urgent restock needed.',
      history: [
        { date: 'Day 1', stock: 2500 },
        { date: 'Day 2', stock: 2400 },
        { date: 'Day 3', stock: 2350 },
        { date: 'Day 4', stock: 2300 },
        { date: 'Day 5', stock: 2250 },
        { date: 'Day 6', stock: 2280 },
        { date: 'Day 7', stock: 2300 }
      ]
    },
    {
      product: 'Jasmine Rice',
      category: 'Aromatic Rice',
      currentStock: 3450,
      minStock: 1500,
      maxStock: 6000,
      dailyUsage: 180,
      predictedChange: 12.7,
      confidence: 89,
      riskLevel: 'medium',
      tamilAdvice: 'Wedding season ahead. Plan procurement.',
      history: [
        { date: 'Day 1', stock: 3200 },
        { date: 'Day 2', stock: 3300 },
        { date: 'Day 3', stock: 3350 },
        { date: 'Day 4', stock: 3400 },
        { date: 'Day 5', stock: 3420 },
        { date: 'Day 6', stock: 3440 },
        { date: 'Day 7', stock: 3450 }
      ]
    },
    {
      product: 'Raw Paddy',
      category: 'Raw Material',
      currentStock: 12500,
      minStock: 8000,
      maxStock: 20000,
      dailyUsage: 850,
      predictedChange: 5.8,
      confidence: 91,
      riskLevel: 'low',
      tamilAdvice: 'Harvest season over. Monitor daily usage.',
      history: [
        { date: 'Day 1', stock: 13000 },
        { date: 'Day 2', stock: 12800 },
        { date: 'Day 3', stock: 12650 },
        { date: 'Day 4', stock: 12580 },
        { date: 'Day 5', stock: 12530 },
        { date: 'Day 6', stock: 12520 },
        { date: 'Day 7', stock: 12500 }
      ]
    },
    {
      product: 'Rice Bran',
      category: 'By-product',
      currentStock: 1800,
      minStock: 2000,
      maxStock: 4000,
      dailyUsage: 120,
      predictedChange: -8.3,
      confidence: 87,
      riskLevel: 'critical',
      tamilAdvice: 'Below minimum stock! Order immediately.',
      history: [
        { date: 'Day 1', stock: 2100 },
        { date: 'Day 2', stock: 2000 },
        { date: 'Day 3', stock: 1950 },
        { date: 'Day 4', stock: 1900 },
        { date: 'Day 5', stock: 1850 },
        { date: 'Day 6', stock: 1820 },
        { date: 'Day 7', stock: 1800 }
      ]
    }
  ]
};

// KPI Card Component
const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend, unit = "" }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} shadow-lg transform group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-lg text-gray-600 ml-1">{unit}</span>}
      </h3>
      <p className="text-sm text-gray-600 mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    critical: { 
      text: 'CRITICAL', 
      color: 'bg-red-100 text-red-700 border border-red-200',
      icon: XCircle 
    },
    high: { 
      text: 'HIGH RISK', 
      color: 'bg-orange-100 text-orange-700 border border-orange-200',
      icon: AlertTriangle 
    },
    medium: { 
      text: 'MEDIUM', 
      color: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      icon: Clock 
    },
    low: { 
      text: 'SAFE', 
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: CheckCircle 
    }
  }[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: Clock };

  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {config.text}
    </span>
  );
};

// Enhanced AI calculations
const calculateAIInsights = (stockData) => {
  return stockData.map(product => {
    const currentStock = product.currentStock;
    const dailyUsage = product.dailyUsage || Math.floor(currentStock / 30);
    const predictedStock = currentStock + (currentStock * product.predictedChange / 100);
    const daysUntilEmpty = Math.floor(currentStock / dailyUsage);
    const daysUntilCritical = Math.floor((currentStock - product.minStock) / dailyUsage);
    
    // AI Risk Assessment
    let riskLevel = 'low';
    let tamilAdvice = '';
    
    if (daysUntilEmpty <= 7) {
      riskLevel = 'critical';
      tamilAdvice = `⚠️ Urgent! Stock will finish in ${daysUntilEmpty} days. Order immediately.`;
    } else if (daysUntilEmpty <= 15) {
      riskLevel = 'high';
      tamilAdvice = `Stock low. Will finish in ${daysUntilEmpty} days. Plan procurement.`;
    } else if (daysUntilEmpty <= 30) {
      riskLevel = 'medium';
      tamilAdvice = `Stock okay. Monitor regularly.`;
    } else {
      riskLevel = 'low';
      tamilAdvice = `Stock sufficient. No immediate action needed.`;
    }

    // AI Recommendation Engine
    let recommendation = '';
    let orderQuantity = 0;
    let suggestedReorderDate = '';
    
    if (product.predictedChange > 20) {
      recommendation = `High demand expected (+${product.predictedChange}%). Increase stock by 30% for upcoming season.`;
      orderQuantity = Math.ceil(product.maxStock * 0.3);
    } else if (product.predictedChange < -15) {
      recommendation = `Reduced demand expected (${product.predictedChange}%). Decrease procurement by 20%.`;
      orderQuantity = 0;
    } else if (daysUntilEmpty <= 10) {
      const neededStock = product.minStock * 2 - currentStock;
      orderQuantity = Math.max(neededStock, product.minStock);
      recommendation = `Critical stock level. Order ${orderQuantity} units immediately to avoid shortage.`;
    } else {
      recommendation = `Stable demand. Maintain current stock levels with regular monitoring.`;
      orderQuantity = Math.ceil(dailyUsage * 7);
    }

    // Calculate suggested reorder date (3 days before stockout)
    const reorderDate = new Date(Date.now() + Math.max(0, daysUntilEmpty - 3) * 24 * 60 * 60 * 1000);
    suggestedReorderDate = reorderDate.toLocaleDateString();

    return {
      ...product,
      dailyUsage,
      predictedStock: Math.round(predictedStock),
      daysUntilEmpty,
      daysUntilCritical,
      riskLevel,
      tamilAdvice,
      recommendation,
      orderQuantity,
      suggestedReorderDate,
      // Additional AI insights
      seasonImpact: getSeasonImpact(product.product),
      trendAnalysis: analyzeTrend(product.history),
      optimalReorderPoint: calculateOptimalReorderPoint(product)
    };
  });
};

// AI Helper Functions
const getSeasonImpact = (productName) => {
  const seasonMap = {
    'Basmati Rice': 'Festival season (Oct-Dec): +40% demand',
    'Jasmine Rice': 'Wedding season (Jan-Mar): +35% demand', 
    'Sona Masoori': 'Year-round stable demand',
    'Brown Rice': 'Summer health trend: +25% demand',
    'Raw Paddy': 'Harvest dependent: Q4 highest',
    'Rice Bran': 'Animal feed demand stable'
  };
  return seasonMap[productName] || 'Stable year-round demand';
};

const analyzeTrend = (history) => {
  if (!history || history.length < 2) return 'Insufficient data for trend analysis';
  
  const firstStock = history[0].stock;
  const lastStock = history[history.length - 1].stock;
  const trend = ((lastStock - firstStock) / firstStock * 100).toFixed(1);
  
  if (trend > 10) return `Strong upward trend: +${trend}%`;
  if (trend < -10) return `Declining trend: ${trend}%`;
  return `Stable trend: ${trend}%`;
};

const calculateOptimalReorderPoint = (product) => {
  const safetyStock = product.minStock * 1.5;
  const leadTimeDemand = (product.dailyUsage || 10) * 7;
  return Math.ceil(safetyStock + leadTimeDemand);
};

// Demand Forecast Chart Component
const DemandForecastChart = ({ product }) => {
  const days = [0, 1, 2, 3, 4, 5, 6, 7];
  const currentStock = product.currentStock;
  const dailyUsage = product.dailyUsage;
  const daysUntilCritical = Math.floor((currentStock - product.minStock) / dailyUsage);
  
  const data = days.map(day => ({
    day: `Day ${day + 1}`,
    predictedStock: Math.max(0, currentStock - (dailyUsage * day)),
    criticalLine: product.minStock
  }));

  const maxStock = Math.max(currentStock, product.minStock * 2);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <Activity className="w-7 h-7 text-blue-600" />
        Demand Forecast (Next 7 Days)
      </h3>
      
      <div className="h-64 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm font-medium">Predicted Stock</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm font-medium">Minimum Stock Level</span>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            Stockout in: {product.daysUntilEmpty} days
          </div>
        </div>
        
        <div className="flex-1 flex items-end justify-between space-x-2">
          {data.map((dayData, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-center text-sm font-medium text-gray-600 mb-2">
                {dayData.day}
              </div>
              <div className="relative w-full h-48 flex items-end justify-center">
                {/* Predicted Stock Bar */}
                <div 
                  className="absolute bottom-0 w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg" 
                  style={{ height: `${(dayData.predictedStock / maxStock) * 100}%` }}
                ></div>
                
                {/* Critical Stock Line */}
                <div 
                  className="absolute w-full border-t-2 border-red-500 border-dashed"
                  style={{ bottom: `${(product.minStock / maxStock) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {dayData.predictedStock.toLocaleString()} kg
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">📊 Critical Insight</p>
            <p className="text-sm text-gray-600">
              Stock will drop below minimum level in {daysUntilCritical} days
            </p>
          </div>
          <div className={`text-lg font-bold ${daysUntilCritical <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
            {daysUntilCritical <= 3 ? '⚠️ Urgent Action Needed' : 'Monitor Closely'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Past vs Future Comparison Chart
const PastVsFutureChart = ({ product }) => {
  const pastDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const futureDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const pastSales = product.history.map((h, i) => ({
    day: pastDays[i] || `Day ${i+1}`,
    sales: Math.round(product.dailyUsage * (0.8 + Math.random() * 0.4))
  }));
  
  const futurePredictions = futureDays.map((day, i) => ({
    day,
    sales: Math.round(product.dailyUsage * (1 + product.predictedChange / 100) * (0.9 + Math.random() * 0.2))
  }));

  const maxSales = Math.max(
    ...pastSales.map(p => p.sales),
    ...futurePredictions.map(f => f.sales)
  );

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <BarChart3 className="w-7 h-7 text-purple-600" />
        Past vs Future Demand Comparison
      </h3>
      
      <div className="h-64 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-sm font-medium">Past Week (Actual)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm font-medium">Next Week (Predicted)</span>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            Trend: {product.predictedChange > 0 ? '+' : ''}{product.predictedChange}%
          </div>
        </div>
        
        <div className="flex-1 flex items-end justify-between space-x-2">
          {pastSales.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative w-full h-48 flex items-end justify-center space-x-1">
                {/* Past Sales Bar */}
                <div 
                  className="w-4 bg-emerald-500/80 rounded-t-lg" 
                  style={{ height: `${(day.sales / maxSales) * 100}%` }}
                ></div>
                
                {/* Future Prediction Bar */}
                {futurePredictions[index] && (
                  <div 
                    className="w-4 bg-purple-500/80 rounded-t-lg" 
                    style={{ height: `${(futurePredictions[index].sales / maxSales) * 100}%` }}
                  ></div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">{day.day}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-purple-50 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">📈 Trend Analysis</p>
            <p className="text-sm text-gray-600">
              {product.predictedChange > 0 
                ? `Demand increasing by ${product.predictedChange}% next week`
                : `Demand decreasing by ${Math.abs(product.predictedChange)}% next week`}
            </p>
          </div>
          <div className="text-emerald-600 font-bold">
            {product.predictedChange > 0 ? '↑ Growing Demand' : '↓ Declining Demand'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Prediction Breakdown Component
const PredictionBreakdown = ({ product }) => {
  const predictionFactors = [
    {
      title: 'Seasonal Impact',
      description: product.seasonImpact,
      icon: Calendar
    },
    {
      title: 'Trend Analysis',
      description: product.trendAnalysis,
      icon: TrendingUp
    },
    {
      title: 'Weekend Effect',
      description: 'Weekend sales typically 25% higher than weekdays',
      icon: Users
    },
    {
      title: 'Market Trend',
      description: 'Health-conscious trend increasing brown rice demand',
      icon: Activity
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <Info className="w-7 h-7 text-amber-600" />
        Prediction Factors & Explainability
      </h3>
      
      <div className="space-y-4">
        {predictionFactors.map((factor, index) => {
          const Icon = factor.icon;
          return (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Icon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{factor.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{factor.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">AI Explainability Note</p>
            <p className="text-sm text-amber-700 mt-1">
              These predictions are based on historical sales patterns and seasonal trends. 
              The AI analyzes past data to identify patterns, not predict unpredictable events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Low Stock Alert Panel Component
const LowStockAlertPanel = ({ products }) => {
  const criticalItems = products.filter(p => p.riskLevel === 'critical' || p.daysUntilEmpty <= 7);
  const highRiskItems = products.filter(p => p.riskLevel === 'high' && p.daysUntilEmpty > 7 && p.daysUntilEmpty <= 15);

  if (criticalItems.length === 0 && highRiskItems.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl shadow-xl border border-emerald-100 p-8">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
          <div>
            <h3 className="text-xl font-bold text-emerald-800">✅ All Stock Levels Safe</h3>
            <p className="text-emerald-700 mt-1">No immediate low-stock risks detected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl shadow-xl border border-red-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-600" />
        <div>
          <h3 className="text-xl font-bold text-red-800">⚠️ Low Stock Risk Alerts</h3>
          <p className="text-red-700 mt-1">Immediate action required for these items</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {criticalItems.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 border-2 border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-gray-900 text-lg">{item.product}</div>
                <div className="text-sm text-gray-600">{item.category}</div>
              </div>
              <StatusBadge status="critical" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-600">Current Stock</div>
                <div className="text-xl font-bold text-red-600">{item.currentStock.toLocaleString()} kg</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Days Until Stockout</div>
                <div className="text-xl font-bold text-red-600">{item.daysUntilEmpty} days</div>
              </div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-red-800">Suggested Action:</p>
              <p className="text-sm text-red-700 mt-1">{item.recommendation}</p>
              <p className="text-xs text-red-600 mt-2">{item.tamilAdvice}</p>
            </div>
          </div>
        ))}
        
        {highRiskItems.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-gray-900">{item.product}</div>
                <div className="text-sm text-gray-600">{item.category}</div>
              </div>
              <StatusBadge status="high" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Current Stock</div>
                <div className="font-bold text-orange-600">{item.currentStock.toLocaleString()} kg</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Critical In</div>
                <div className="font-bold text-orange-600">{item.daysUntilEmpty - 7} days</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recommended Actions Component
const RecommendedActions = ({ products }) => {
  const recommendations = products
    .filter(p => p.orderQuantity > 0)
    .map(p => ({
      ...p,
      actionType: p.riskLevel === 'critical' ? 'URGENT' : p.riskLevel === 'high' ? 'PRIORITY' : 'PLANNED'
    }))
    .sort((a, b) => {
      const priority = { 'URGENT': 0, 'PRIORITY': 1, 'PLANNED': 2 };
      return priority[a.actionType] - priority[b.actionType];
    });

  if (recommendations.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-blue-100 p-8">
        <div className="flex items-center gap-3">
          <Info className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-blue-800">📋 Recommended Stock Actions</h3>
            <p className="text-blue-700 mt-1">No immediate stock actions required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-blue-100 p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <Calculator className="w-7 h-7 text-blue-600" />
        AI-Recommended Stock Actions
      </h3>
      
      <div className="space-y-4">
        {recommendations.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-bold text-gray-900 text-lg">{item.product}</div>
                <div className="text-sm text-gray-600">{item.category}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                item.actionType === 'URGENT' ? 'bg-red-100 text-red-700' :
                item.actionType === 'PRIORITY' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {item.actionType}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div className="bg-blue-50 p-3 rounded-xl">
                <div className="text-sm text-gray-600">Reorder Quantity</div>
                <div className="text-xl font-bold text-blue-700">{item.orderQuantity.toLocaleString()} kg</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl">
                <div className="text-sm text-gray-600">Suggested Date</div>
                <div className="text-xl font-bold text-emerald-700">{item.suggestedReorderDate}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <div className="text-sm text-gray-600">Optimal Point</div>
                <div className="text-xl font-bold text-purple-700">{item.optimalReorderPoint.toLocaleString()} kg</div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-700">{item.recommendation}</p>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">
                Add to Purchase List
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                Schedule Production
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
        <p className="text-sm text-gray-700">
          💡 <span className="font-semibold">AI Decision Support:</span> These are recommendations only. 
          Final decisions should consider market prices, supplier availability, and storage capacity.
        </p>
      </div>
    </div>
  );
};

// Main Component
export function StockPrediction() {
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!mockStockData?.predictions) {
          throw new Error('Stock prediction data not available');
        }
        
        // Process data with AI intelligence
        const enhancedPredictions = calculateAIInsights(mockStockData.predictions);
        setProducts(enhancedPredictions);
        
      } catch (err) {
        console.error('AI Analysis Error:', err);
        setError(err.message);
        toast.error('AI prediction system temporarily unavailable');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPredictions();
  }, [timeframe]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate summary stats
  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.currentStock, 0),
    avgDailySales: products.reduce((sum, p) => sum + p.dailyUsage, 0) / products.length,
    lowStockItems: products.filter(p => p.daysUntilEmpty <= 15).length,
    criticalItems: products.filter(p => p.daysUntilEmpty <= 7).length,
    avgDaysUntilStockout: products.reduce((sum, p) => sum + p.daysUntilEmpty, 0) / products.length,
    aiConfidence: Math.round(products.reduce((sum, p) => sum + p.confidence, 0) / products.length),
    increasingDemand: products.filter(p => p.predictedChange > 0).length
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI System Unavailable</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg"
          >
            Retry AI Analysis
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">🤖 AI is analyzing your stock patterns...</p>
          <p className="text-sm text-gray-500 mt-2">Calculating demand trends and recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🤖 AI Stock Prediction & Demand Forecast</h1>
            <p className="text-gray-600 mt-2">AI-driven insights for smarter inventory planning</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <select
                className="bg-transparent focus:outline-none text-sm font-medium"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="7d">🎯 Next 7 Days</option>
                <option value="14d">📈 Next 14 Days</option>
                <option value="30d">🔮 Next 30 Days</option>
              </select>
            </div>
            <button 
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
              onClick={() => toast.success('Exporting AI recommendations...')}
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
            <button 
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition"
              onClick={() => {
                const enhancedPredictions = calculateAIInsights(mockStockData.predictions);
                setProducts(enhancedPredictions);
                toast.success('AI predictions refreshed');
              }}
            >
              Refresh Predictions
            </button>
          </div>
        </div>

        {/* KPI Grid - Current Stock Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Current Total Stock" 
            value={stats.totalStock} 
            subtitle={`${stats.totalProducts} products`} 
            icon={Package} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            trend={+5.2} 
            unit="kg"
          />
          <KpiCard 
            title="Avg Daily Sales" 
            value={Math.round(stats.avgDailySales)} 
            subtitle="Per product average" 
            icon={TrendingUp} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            trend={+8.7} 
            unit="kg/day"
          />
          <KpiCard 
            title="Low Stock Risk" 
            value={stats.lowStockItems} 
            subtitle="Needs attention" 
            icon={AlertTriangle} 
            color="bg-gradient-to-br from-amber-500 to-orange-600" 
            trend={+15} 
          />
          <KpiCard 
            title="Est. Days Until Stockout" 
            value={Math.round(stats.avgDaysUntilStockout)} 
            subtitle="Average across all items" 
            icon={Clock} 
            color="bg-gradient-to-br from-red-500 to-rose-600" 
            trend={-12} 
            unit="days"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Critical Items" 
            value={stats.criticalItems} 
            subtitle="Urgent action needed" 
            icon={XCircle} 
            color="bg-gradient-to-br from-red-500 to-pink-600" 
            trend={+18} 
          />
          <KpiCard 
            title="AI Confidence" 
            value={stats.aiConfidence} 
            subtitle="Prediction accuracy" 
            icon={BarChart3} 
            color="bg-gradient-to-br from-purple-500 to-pink-600" 
            trend={+2.4} 
            unit="%"
          />
          <KpiCard 
            title="Increasing Demand" 
            value={stats.increasingDemand} 
            subtitle="Products with rising demand" 
            icon={TrendingUp} 
            color="bg-gradient-to-br from-green-500 to-emerald-600" 
            trend={+22} 
          />
          <KpiCard 
            title="Stock Stability Score" 
            value={Math.max(0, 100 - (stats.criticalItems * 20 + stats.lowStockItems * 10))} 
            subtitle="Overall inventory health" 
            icon={CheckCircle} 
            color="bg-gradient-to-br from-cyan-500 to-blue-600" 
            trend={+3.8} 
            unit="%"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 mb-8 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by product name or category..."
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Premium Rice">Premium Rice</option>
                <option value="Regular Rice">Regular Rice</option>
                <option value="Health Rice">Health Rice</option>
                <option value="Aromatic Rice">Aromatic Rice</option>
                <option value="Raw Material">Raw Material</option>
                <option value="By-product">By-product</option>
              </select>
              
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="7d">Next 7 Days</option>
                <option value="14d">Next 14 Days</option>
                <option value="30d">Next 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stock Prediction Graph Section */}
        {selectedProduct ? (
          <div className="space-y-8 mb-8">
            {/* Selected Product Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-blue-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.product}</h2>
                    <p className="text-gray-600">{selectedProduct.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DemandForecastChart product={selectedProduct} />
              <PastVsFutureChart product={selectedProduct} />
            </div>

            {/* Prediction Breakdown */}
            <PredictionBreakdown product={selectedProduct} />

            {/* Recommended Actions for this product */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl shadow-xl border border-emerald-100 p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Calculator className="w-7 h-7 text-emerald-600" />
                Recommended Actions for {selectedProduct.product}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-2xl p-5 text-center">
                  <div className="text-sm text-gray-600 mb-2">Recommended Reorder</div>
                  <div className="text-3xl font-bold text-emerald-600">
                    {selectedProduct.orderQuantity.toLocaleString()} kg
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 text-center">
                  <div className="text-sm text-gray-600 mb-2">Suggested Reorder Date</div>
                  <div className="text-2xl font-bold text-blue-600">{selectedProduct.suggestedReorderDate}</div>
                </div>
                <div className="bg-white rounded-2xl p-5 text-center">
                  <div className="text-sm text-gray-600 mb-2">Stockout Risk</div>
                  <div className="text-2xl font-bold text-red-600">{selectedProduct.daysUntilEmpty} days</div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">தமிழ் ஆலோசனை:</span> {selectedProduct.tamilAdvice}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Low Stock Alert Panel */}
            <div className="mb-8">
              <LowStockAlertPanel products={filteredProducts} />
            </div>

            {/* Charts for all products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <DemandForecastChart product={products[0]} />
              <PastVsFutureChart product={products[1]} />
            </div>

            {/* Prediction Breakdown */}
            <div className="mb-8">
              <PredictionBreakdown product={products[0]} />
            </div>

            {/* Recommended Actions */}
            <div className="mb-8">
              <RecommendedActions products={filteredProducts} />
            </div>
          </>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
              {/* Header with Risk Indicator */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{product.product}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <StatusBadge status={product.riskLevel} />
              </div>

              {/* Stock Metrics */}
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <div className="text-sm text-gray-600">Current Stock</div>
                    <div className="text-2xl font-bold text-blue-700">{product.currentStock.toLocaleString()} kg</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl">
                    <div className="text-sm text-gray-600">Daily Usage</div>
                    <div className="text-2xl font-bold text-emerald-700">{product.dailyUsage} kg/day</div>
                  </div>
                </div>

                {/* Days Left Indicator */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Days until empty:</span>
                    <span className={`text-lg font-bold ${
                      product.daysUntilEmpty <= 7 ? 'text-red-600' : 
                      product.daysUntilEmpty <= 15 ? 'text-orange-600' : 'text-emerald-600'
                    }`}>
                      {product.daysUntilEmpty} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        product.daysUntilEmpty <= 7 ? 'bg-red-500' : 
                        product.daysUntilEmpty <= 15 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (product.daysUntilEmpty / 30) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Preview */}
              <div className="border-t pt-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-700">{product.recommendation.substring(0, 100)}...</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                <button 
                  onClick={() => setSelectedProduct(product)}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View AI Analysis
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* AI Explanation Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Info className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">How AI Stock Prediction Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">📊 Data Analysis</p>
                  <p className="text-sm text-gray-600">Analyzes historical sales patterns and seasonal trends</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">🤖 Pattern Recognition</p>
                  <p className="text-sm text-gray-600">Identifies demand patterns using statistical methods</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">🎯 Risk Assessment</p>
                  <p className="text-sm text-gray-600">Calculates stockout risks based on current inventory</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <span className="font-semibold">Note:</span> AI provides decision support only. 
                Final decisions should consider market conditions, supplier availability, and storage constraints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockPrediction;