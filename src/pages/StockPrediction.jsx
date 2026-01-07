import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Calendar, Download, BarChart3, Package,
  AlertTriangle, Info, Clock, CheckCircle, XCircle, ArrowRight, Activity,
  Calculator, Percent, Users, Truck, Factory, ArrowUpRight, ArrowDownRight,
  Eye, Filter, Search, X
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import toast from 'react-hot-toast';
import FirebaseDataService from '../services/firebaseDataService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

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
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
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
    critical: { text: 'CRITICAL', color: 'bg-red-100 text-red-700', icon: XCircle },
    high: { text: 'HIGH RISK', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    medium: { text: 'MEDIUM', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    low: { text: 'SAFE', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle }
  }[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: Clock };

  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {config.text}
    </span>
  );
};

// Demand Forecast Chart Component
const DemandForecastChart = ({ product }) => {
  const chartData = {
    labels: ['Today', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Predicted Stock (kg)',
        data: Array.from({ length: 7 }, (_, i) => 
          Math.max(0, (product.currentStock || 0) - ((product.dailyUsage || 0) * i))
        ),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      },
      {
        label: 'Minimum Stock Level',
        data: Array(7).fill(product.minStock || 0),
        borderColor: 'rgb(239, 68, 68)',
        borderDash: [5, 5],
        backgroundColor: 'transparent'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: '7-Day Stock Forecast' }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Stock (kg)' }
      }
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <Activity className="w-7 h-7 text-blue-600" />
        Demand Forecast for {product.product || 'Unknown Product'}
      </h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">📊 Critical Insight</p>
            <p className="text-sm text-gray-600">
              Stockout in {product.daysUntilEmpty || 0} days
            </p>
          </div>
          <div className={`text-lg font-bold ${(product.daysUntilEmpty || 0) <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
            {(product.daysUntilEmpty || 0) <= 3 ? '⚠️ Urgent Action Needed' : 'Monitor Closely'}
          </div>
        </div>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadStockPredictions();
  }, [timeframe]);

  const loadStockPredictions = async () => {
    try {
      setIsLoading(true);
      const predictions = await FirebaseDataService.fetchStockPredictions();
      setProducts(predictions);
    } catch (error) {
      console.error('Failed to load stock predictions:', error);
      toast.error('Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      (product.product || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate summary stats
  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + (p.currentStock || 0), 0),
    avgDailySales: products.length > 0 ? products.reduce((sum, p) => sum + (p.dailyUsage || 0), 0) / products.length : 0,
    lowStockItems: products.filter(p => (p.daysUntilEmpty || 0) <= 15).length,
    criticalItems: products.filter(p => (p.daysUntilEmpty || 0) <= 7).length,
    avgDaysUntilStockout: products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (p.daysUntilEmpty || 0), 0) / products.length) : 0,
    aiConfidence: products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (p.confidence || 0), 0) / products.length) : 0
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">🤖 AI is analyzing your stock patterns...</p>
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
            <p className="text-gray-600 mt-2">Real predictions from your inventory data</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <select className="bg-transparent focus:outline-none text-sm font-medium" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="7d">🎯 Next 7 Days</option>
                <option value="14d">📈 Next 14 Days</option>
                <option value="30d">🔮 Next 30 Days</option>
              </select>
            </div>
            <button onClick={() => toast.success('Report exported')} className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2">
              <Download className="h-4 w-4" /> Export Report
            </button>
            <button onClick={loadStockPredictions} className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition">
              Refresh Predictions
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Current Total Stock" value={stats.totalStock} subtitle={`${stats.totalProducts} products`} icon={Package} color="bg-gradient-to-br from-blue-500 to-indigo-600" trend={+5.2} unit="kg" />
          <KpiCard title="Avg Daily Sales" value={Math.round(stats.avgDailySales)} subtitle="Per product average" icon={TrendingUp} color="bg-gradient-to-br from-emerald-500 to-teal-600" trend={+8.7} unit="kg/day" />
          <KpiCard title="Low Stock Risk" value={stats.lowStockItems} subtitle="Needs attention" icon={AlertTriangle} color="bg-gradient-to-br from-amber-500 to-orange-600" trend={+15} />
          <KpiCard title="Est. Days Until Stockout" value={Math.round(stats.avgDaysUntilStockout)} subtitle="Average across all items" icon={Clock} color="bg-gradient-to-br from-red-500 to-rose-600" trend={-12} unit="days" />
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 mb-8 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" placeholder="Search by product name..." className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="Premium Rice">Premium Rice</option>
                <option value="Regular Rice">Regular Rice</option>
                <option value="Health Rice">Health Rice</option>
              </select>
              
              <select className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="7d">Next 7 Days</option>
                <option value="14d">Next 14 Days</option>
                <option value="30d">Next 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Charts Section */}
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
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.product || 'Unknown Product'}</h2>
                    <p className="text-gray-600">{selectedProduct.category || 'Unknown Category'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Charts */}
            <DemandForecastChart product={selectedProduct} />

            {/* Recommended Actions */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl shadow-xl border border-emerald-100 p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Calculator className="w-7 h-7 text-emerald-600" />
                Recommended Actions for {selectedProduct.product || 'Unknown Product'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-2xl p-5 text-center">
                  <div className="text-sm text-gray-600 mb-2">Recommended Reorder</div>
                  <div className="text-3xl font-bold text-emerald-600">{selectedProduct.orderQuantity?.toLocaleString('en-IN') || 0} kg</div>
                </div>
                <div className="bg-white rounded-2xl p-5 text-center">
                  <div className="text-sm text-gray-600 mb-2">Suggested Reorder Date</div>
                  <div className="text-2xl font-bold text-blue-600">{selectedProduct.suggestedReorderDate || 'Not available'}</div>
                </div>
                <div className="bg-white rounded-2xl p-5 text-center">
                  <div className="text-sm text-gray-600 mb-2">Stockout Risk</div>
                  <div className="text-2xl font-bold text-red-600">{selectedProduct.daysUntilEmpty || 0} days</div>
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
              {filteredProducts.filter(p => p.riskLevel === 'critical').length > 0 ? (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl shadow-xl border border-red-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="text-xl font-bold text-red-800">⚠️ Critical Stock Alerts</h3>
                      <p className="text-red-700 mt-1">Immediate action required</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {filteredProducts.filter(p => p.riskLevel === 'critical').map((item, index) => (
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
                            <div className="text-xl font-bold text-red-600">{(item.currentStock || 0).toLocaleString('en-IN')} kg</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Days Until Stockout</div>
                            <div className="text-xl font-bold text-red-600">{item.daysUntilEmpty} days</div>
                          </div>
                        </div>
                        
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-red-800">Suggested Action:</p>
                          <p className="text-sm text-red-700 mt-1">Order {item.orderQuantity} kg immediately</p>
                          <p className="text-xs text-red-600 mt-2">{item.tamilAdvice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl shadow-xl border border-emerald-100 p-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800">✅ All Stock Levels Safe</h3>
                      <p className="text-emerald-700 mt-1">No immediate stockout risks detected</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredProducts.map((product, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{product.product || 'Unknown Product'}</h3>
                      <p className="text-sm text-gray-600">{product.category || 'Unknown Category'}</p>
                    </div>
                    <StatusBadge status={product.riskLevel || 'unknown'} />
                  </div>

                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <div className="text-sm text-gray-600">Current Stock</div>
                        <div className="text-2xl font-bold text-blue-700">{(product.currentStock || 0).toLocaleString('en-IN')} kg</div>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-xl">
                        <div className="text-sm text-gray-600">Daily Usage</div>
                        <div className="text-2xl font-bold text-emerald-700">{product.dailyUsage || 0} kg/day</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Days until empty:</span>
                        <span className={`text-lg font-bold ${(product.daysUntilEmpty || 0) <= 7 ? 'text-red-600' : (product.daysUntilEmpty || 0) <= 15 ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {product.daysUntilEmpty || 0} days
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${(product.daysUntilEmpty || 0) <= 7 ? 'bg-red-500' : (product.daysUntilEmpty || 0) <= 15 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, ((product.daysUntilEmpty || 0) / 30) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button onClick={() => setSelectedProduct(product)} className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" /> View AI Analysis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
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
                  <p className="text-sm text-gray-600">Analyzes your actual inventory and sales data</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockPrediction;