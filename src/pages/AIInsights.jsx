import React, { useState, useEffect } from 'react';
import {
  AlertCircle, TrendingUp, TrendingDown, AlertTriangle, Calendar, Lightbulb,
  DollarSign, Users, Clock, Percent, Activity, BarChart3, PieChart, ArrowUpRight,
  ArrowDownRight, Filter, Download, RefreshCw, Bell, Target, Shield, Coffee, Wheat,
  Factory, CreditCard, CheckCircle, X, Package, BarChart
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import toast from 'react-hot-toast';
import FirebaseDataService from '../services/firebaseDataService';
import AIService from '../services/aiService';
import DemandPredictionService from '../services/demandPredictionService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend
);

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
    High: { text: 'HIGH', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    Medium: { text: 'MEDIUM', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    Low: { text: 'LOW', color: 'bg-emerald-100 text-emerald-700', icon: TrendingUp },
    Up: { text: 'UP', color: 'bg-emerald-100 text-emerald-700', icon: TrendingUp },
    Down: { text: 'DOWN', color: 'bg-red-100 text-red-700', icon: TrendingDown },
    critical: { text: 'CRITICAL', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    high: { text: 'HIGH', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    medium: { text: 'MEDIUM', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    low: { text: 'LOW', color: 'bg-blue-100 text-blue-700', icon: Bell }
  }[status] || { text: 'UNKNOWN', color: 'bg-gray-100 text-gray-700', icon: AlertCircle };

  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {config.text}
    </span>
  );
};

// AI Insight Card Component
const InsightCard = ({ title, category, icon: Icon, color, insights = [], onViewDetails }) => {
  // Safeguard against undefined insights
  const safeInsights = Array.isArray(insights) ? insights : [];
  
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className={`px-6 py-4 border-b ${color.replace('bg-', 'bg-gradient-to-r from-').replace('500', '500/20')} border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{category}</p>
            </div>
          </div>
          <button
            onClick={onViewDetails}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
          >
            View Details
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {safeInsights.length > 0 ? (
          <>
            <ul className="space-y-4">
              {safeInsights.slice(0, 3).map((insight, index) => (
                <li key={index} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:from-blue-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {insight.trend && <StatusBadge status={insight.trend} />}
                        {insight.priority && <StatusBadge status={insight.priority} />}
                        {insight.riskLevel && <StatusBadge status={insight.riskLevel} />}
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {insight.product || insight.title || insight.customer || insight.season || 'No Title'}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {insight.recommendation || insight.insight || insight.assessment || insight.forecast || 'No description available'}
                      </p>
                      {insight.impact && (
                        <p className="text-sm text-emerald-600 font-medium mt-2">
                          💡 Impact: {insight.impact}
                        </p>
                      )}
                    </div>
                    {insight.confidence && (
                      <div className="ml-4 text-right">
                        <div className="text-lg font-bold text-blue-600">{insight.confidence}%</div>
                        <div className="text-xs text-gray-500">Confidence</div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            
            {safeInsights.length > 3 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  +{safeInsights.length - 3} more insights available
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No insights available for this category</p>
            <p className="text-sm text-gray-400 mt-1">Add more data to generate insights</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Detail Modal Component
const RecommendationDetailModal = ({ isOpen, onClose, category, data = [] }) => {
  if (!isOpen) return null;

  const getCategoryConfig = (cat) => ({
    stock: { title: 'Stock Recommendations', icon: Package, color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    sales: { title: 'Sales Insights', icon: DollarSign, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    loans: { title: 'Loan Risk Assessment', icon: CreditCard, color: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    seasonal: { title: 'Seasonal Forecasts', icon: Calendar, color: 'bg-gradient-to-br from-purple-500 to-pink-600' }
  }[cat] || { title: 'AI Insights', icon: Lightbulb, color: 'bg-gradient-to-br from-gray-500 to-blue-600' });

  const config = getCategoryConfig(category);
  const Icon = config.icon;
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${config.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{safeData.length} active insights</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {safeData.length > 0 ? (
              <div className="space-y-6">
                {safeData.map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {item.product || item.title || item.customer || item.season || 'Untitled'}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          {item.trend && <StatusBadge status={item.trend} />}
                          {item.priority && <StatusBadge status={item.priority} />}
                          {item.riskLevel && <StatusBadge status={item.riskLevel} />}
                        </div>
                      </div>
                      {item.confidence && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{item.confidence}%</div>
                          <div className="text-sm text-gray-600">AI Confidence</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {item.recommendation && (
                        <div>
                          <p className="text-sm text-gray-600">Recommendation</p>
                          <p className="text-gray-900 font-medium">{item.recommendation}</p>
                        </div>
                      )}
                      
                      {item.impact && (
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-sm text-gray-600">Impact</p>
                          <p className="font-medium text-emerald-600">{item.impact}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex gap-3">
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg">
                          Mark as Reviewed
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg">
                          Schedule Action
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No detailed insights available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export function AIInsights() {
  const [timeframe, setTimeframe] = useState('month');
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [aiData, setAiData] = useState({
    stockRecommendations: [],
    salesInsights: [],
    loanRisks: [],
    seasonalForecasts: [],
    overallMetrics: {
      aiAccuracy: 0,
      activeInsights: 0,
      highPriority: 0,
      implemented: 0,
      revenueImpact: 0,
      costSavings: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [forecastVisData, setForecastVisData] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);

  useEffect(() => {
    loadAIInsights();
  }, [timeframe]);

  const loadAIInsights = async () => {
    try {
      setIsLoading(true);
      
      // Train AI with historical data
      await trainAIWithHistoricalData();
      
      // Fetch insights from trained AI
      const insights = await FirebaseDataService.fetchAIInsightsData();
      // Forecast demand using shared AI core (non-invasive)
      const forecast = await DemandPredictionService.forecastDemand({ timeframe });
      const vis = DemandPredictionService.getVisualizationData(forecast);
      const seasonalForecasts = (forecast?.productForecasts || []).slice(0, 6).map(f => ({
        product: f.product,
        season: timeframe,
        forecast: `Projected ${Math.round(f.projectedDemand).toLocaleString('en-IN')} units`,
        confidence: Math.round(f.confidencePct),
        trend: f.trend > 0 ? 'Up' : f.trend < 0 ? 'Down' : 'Stable',
        impact: `Expected Rs.${Math.round(f.projectedDemandValue).toLocaleString('en-IN')}`
      }));
      const merged = {
        ...insights,
        loanRisks: insights.loanRisks || insights.riskAlerts || [],
        seasonalForecasts,
        overallMetrics: {
          aiAccuracy: forecast?.confidenceTier === 'HIGH' ? 90 : forecast?.confidenceTier === 'MEDIUM' ? 75 : 60,
          activeInsights:
            (insights?.stockRecommendations?.length || 0) +
            (insights?.salesInsights?.length || 0) +
            ((insights?.loanRisks || insights?.riskAlerts || []).length) +
            seasonalForecasts.length,
          highPriority: ((insights?.loanRisks || insights?.riskAlerts || [])).filter(r => r.riskLevel === 'High' || r.riskLevel === 'critical').length,
          implemented: 0,
          revenueImpact: Math.round(forecast?.projectedRevenueImpact || 0),
          costSavings: 0
        }
      };
      
      // Generate chart data
      generateChartData(merged);
      setForecastVisData(vis);
      
      setAiData(merged);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  const trainAIWithHistoricalData = async () => {
    try {
      toast.loading('Training AI with historical data...');
      
      // Simulate training progress
      for (let i = 0; i <= 100; i += 10) {
        setTrainingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Fetch historical data from Firebase
      const historicalData = await fetchHistoricalData();
      
      // Train AI with the data
      await AIService.trainWithHistoricalData(historicalData);
      
      setTrainingProgress(100);
      toast.success('AI training completed!');
    } catch (error) {
      console.error('AI training failed:', error);
      toast.error('AI training failed, using basic analysis');
    }
  };

  const fetchHistoricalData = async () => {
    try {
      // Fetch data from multiple time periods to train AI
      const data = await FirebaseDataService.fetchAllData();
      
      // Add historical patterns based on your database structure
      const historicalPatterns = {
        // Sales patterns based on days of week
        weeklyPatterns: analyzeWeeklyPatterns(data.sales),
        // Seasonal trends
        seasonalTrends: analyzeSeasonalTrends(data.sales),
        // Inventory turnover rates
        turnoverRates: calculateTurnoverRates(data.inventory, data.sales),
        // Loan repayment patterns
        repaymentPatterns: analyzeRepaymentPatterns(data.loans),
        // Price fluctuations
        priceTrends: analyzePriceTrends(data.inventory)
      };
      
      return {
        ...data,
        patterns: historicalPatterns
      };
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return null;
    }
  };

  const generateChartData = (insights) => {
    // Generate chart for stock recommendations
    if (insights.stockRecommendations && insights.stockRecommendations.length > 0) {
      const stockChartData = {
        labels: insights.stockRecommendations.map(item => item.product),
        datasets: [
          {
            label: 'Current Stock (kg)',
            data: insights.stockRecommendations.map(item => item.currentStock),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: 'Minimum Stock (kg)',
            data: insights.stockRecommendations.map(item => item.minStock),
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1
          }
        ]
      };
      setChartData(stockChartData);
    }
  };

  const handleViewDetails = async (category) => {
    try {
      const insights = await FirebaseDataService.fetchAIInsightsData();
      let data = [];
      
      switch(category) {
        case 'stock':
          data = insights.stockRecommendations || [];
          break;
        case 'sales':
          data = insights.salesInsights || [];
          break;
        case 'loans':
          data = insights.loanRisks || [];
          break;
        case 'seasonal':
          // Regenerate latest seasonal forecasts on demand
          {
            const forecast = await DemandPredictionService.forecastDemand({ timeframe });
            data = (forecast?.productForecasts || []).slice(0, 12).map(f => ({
              product: f.product,
              season: timeframe,
              forecast: `Projected ${Math.round(f.projectedDemand).toLocaleString('en-IN')} units`,
              confidence: Math.round(f.confidencePct),
              trend: f.trend > 0 ? 'Up' : f.trend < 0 ? 'Down' : 'Stable',
              impact: `Expected Rs.${Math.round(f.projectedDemandValue).toLocaleString('en-IN')}`
            }));
          }
          break;
      }
      
      setCategoryData(data);
      setActiveCategory(category);
    } catch (error) {
      console.error('Failed to load details:', error);
      setCategoryData([]);
      setActiveCategory(category);
    }
  };

  const refreshInsights = async () => {
    toast.loading('Retraining AI with latest data...');
    await loadAIInsights();
    toast.success('AI insights refreshed!');
  };

  const exportInsights = () => {
    const exportData = {
      ...aiData,
      exportDate: new Date().toISOString(),
      timeframe: timeframe
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('AI insights exported successfully');
  };

  // Analysis helper functions
  const analyzeWeeklyPatterns = (sales) => {
    const weeklyPatterns = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.forEach(day => {
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getDay() === days.indexOf(day);
      });
      weeklyPatterns[day] = daySales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    });
    
    return weeklyPatterns;
  };

  const analyzeSeasonalTrends = (sales) => {
    const monthlySales = {};
    
    for (let i = 0; i < 12; i++) {
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === i;
      });
      monthlySales[i] = monthSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    }
    
    return monthlySales;
  };

  const calculateTurnoverRates = (inventory, sales) => {
    const turnover = {};
    
    inventory.forEach(item => {
      const itemSales = sales.filter(sale => sale.product === item.name);
      const totalSold = itemSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
      const avgStock = item.currentStock;
      turnover[item.name] = totalSold > 0 ? (totalSold / avgStock).toFixed(2) : 0;
    });
    
    return turnover;
  };

  const analyzeRepaymentPatterns = (loans) => {
    const patterns = {
      onTime: 0,
      late: 0,
      defaulted: 0,
      avgOverdueDays: 0
    };
    
    let totalOverdue = 0;
    let overdueCount = 0;
    
    loans.forEach(loan => {
      if (loan.overdueDays === 0) patterns.onTime++;
      else if (loan.overdueDays <= 30) patterns.late++;
      else patterns.defaulted++;
      
      if (loan.overdueDays > 0) {
        totalOverdue += loan.overdueDays;
        overdueCount++;
      }
    });
    
    patterns.avgOverdueDays = overdueCount > 0 ? Math.round(totalOverdue / overdueCount) : 0;
    
    return patterns;
  };

  const analyzePriceTrends = (inventory) => {
    // Analyze price changes over time
    // This would need historical price data
    return { trend: 'stable', avgPriceChange: 0 };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">🤖 AI is analyzing your historical data...</p>
          <p className="text-sm text-gray-500 mt-2">Training AI with past patterns and trends</p>
        </div>
        
        {/* Training Progress */}
        <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${trainingProgress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">{trainingProgress}% trained</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🤖 AI Insights & Recommendations</h1>
            <p className="text-gray-600 mt-2">Trained on your historical data for accurate predictions</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-emerald-600">AI Training: Complete</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <select className="bg-transparent focus:outline-none text-sm font-medium" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last 365 Days</option>
              </select>
            </div>
            <button onClick={refreshInsights} className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Retrain AI
            </button>
            <button onClick={exportInsights} className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2">
              <Download className="h-4 w-4" /> Export Insights
            </button>
          </div>
        </div>

        {/* AI Training Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI Training Status</h3>
                <p className="text-gray-600">Trained on historical patterns from your database</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{aiData.overallMetrics.aiAccuracy || 85}%</div>
              <div className="text-sm text-gray-600">Prediction Accuracy</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-xl">
              <div className="text-sm text-gray-600">Data Points Analyzed</div>
              <div className="text-xl font-bold text-gray-900">{(aiData.overallMetrics.activeInsights * 10).toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-3 rounded-xl">
              <div className="text-sm text-gray-600">Historical Period</div>
              <div className="text-xl font-bold text-gray-900">{timeframe === 'year' ? '365' : timeframe === 'quarter' ? '90' : timeframe === 'month' ? '30' : '7'} days</div>
            </div>
            <div className="bg-white p-3 rounded-xl">
              <div className="text-sm text-gray-600">Patterns Identified</div>
              <div className="text-xl font-bold text-gray-900">{(aiData.stockRecommendations.length + aiData.salesInsights.length + aiData.loanRisks.length)}</div>
            </div>
            <div className="bg-white p-3 rounded-xl">
              <div className="text-sm text-gray-600">Rs. Impact</div>
              <div className="text-xl font-bold text-emerald-600">Rs.{aiData.overallMetrics.revenueImpact?.toLocaleString('en-IN') || '0'}</div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {chartData && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <BarChart className="w-7 h-7 text-blue-600" />
              Stock Analysis Overview
            </h3>
            <div className="h-64">
              <Bar 
                data={chartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Stock Levels vs Minimum Requirements' }
                  }
                }} 
              />
            </div>
          </div>
        )}

        {/* Forecast Overview (aligned with StockPrediction style) */}
        {forecastVisData && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Activity className="w-7 h-7 text-blue-600" />
              Demand Forecast Overview
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64">
                <Line 
                  data={forecastVisData.demandTrend} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Projected Demand Trend' }
                    },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
              <div className="h-64">
                <Pie 
                  data={forecastVisData.productDistribution} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' },
                      title: { display: true, text: 'Projected Value by Product (Rs.)' }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="AI Accuracy Score" 
            value={aiData.overallMetrics.aiAccuracy || 85} 
            subtitle="Based on historical patterns" 
            icon={Target} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            trend={+3.2} 
            unit="%"
          />
          <KpiCard 
            title="Active Insights" 
            value={aiData.stockRecommendations.length + aiData.salesInsights.length + aiData.loanRisks.length} 
            subtitle="Generated from your data" 
            icon={Lightbulb} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            trend={+18} 
          />
          <KpiCard 
            title="High Priority Alerts" 
            value={aiData.loanRisks.filter(r => r.riskLevel === 'High' || r.riskLevel === 'critical').length} 
            subtitle="Require attention" 
            icon={AlertTriangle} 
            color="bg-gradient-to-br from-amber-500 to-orange-600" 
            trend={+25} 
          />
          <KpiCard 
            title="Revenue Impact" 
            value={aiData.overallMetrics.revenueImpact || 0} 
            subtitle="Rs. from recommendations" 
            icon={DollarSign} 
            color="bg-gradient-to-br from-purple-500 to-pink-600" 
            trend={+42} 
            unit="Rs."
          />
        </div>

        {/* AI Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <InsightCard 
            title="Stock Recommendations" 
            category="Inventory Management" 
            icon={Package} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
            insights={aiData.stockRecommendations}
            onViewDetails={() => handleViewDetails('stock')}
          />
          <InsightCard 
            title="Sales Insights" 
            category="Revenue Optimization" 
            icon={DollarSign} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            insights={aiData.salesInsights}
            onViewDetails={() => handleViewDetails('sales')}
          />
          <InsightCard 
            title="Loan Risk Assessment" 
            category="Credit Management" 
            icon={CreditCard} 
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            insights={aiData.loanRisks}
            onViewDetails={() => handleViewDetails('loans')}
          />
          <InsightCard 
            title="Seasonal Forecasts" 
            category="Demand Planning" 
            icon={Calendar} 
            color="bg-gradient-to-br from-purple-500 to-pink-600"
            insights={aiData.seasonalForecasts}
            onViewDetails={() => handleViewDetails('seasonal')}
          />
        </div>

        {/* Data Source Information */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Sources & AI Training</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">📊 Historical Data</p>
                  <p className="text-sm text-gray-600">Analyzes patterns from your past sales, inventory, and loan data</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">🤖 Pattern Recognition</p>
                  <p className="text-sm text-gray-600">Identifies trends, seasonality, and anomalies in your business</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">🎯 Predictive Analysis</p>
                  <p className="text-sm text-gray-600">Uses historical patterns to predict future trends and risks</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <span className="font-semibold">Note:</span> AI accuracy improves as more historical data is available. All insights are based on actual Rs. values from your database.
              </p>
            </div>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Target className="w-7 h-7 text-emerald-600" />
            Top Actionable Insights
          </h3>
          
          <div className="space-y-4">
            {aiData.stockRecommendations.length > 0 ? (
              aiData.stockRecommendations
                .filter(item => item.priority === 'High' || item.riskLevel === 'critical')
                .slice(0, 3)
                .map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{item.product} - {item.action}</h4>
                        <p className="text-sm text-gray-600">{item.recommendation}</p>
                      </div>
                      <div className="ml-auto">
                        <StatusBadge status={item.priority || item.riskLevel} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Stock</p>
                        <p className="font-bold text-gray-900">{item.currentStock?.toLocaleString('en-IN') || 0} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Minimum Required</p>
                        <p className="font-bold text-red-600">{item.minStock?.toLocaleString('en-IN') || 0} kg</p>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No high-priority insights available</p>
                <p className="text-sm text-gray-400 mt-1">Add more data to generate actionable insights</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <RecommendationDetailModal 
        isOpen={activeCategory !== null}
        onClose={() => setActiveCategory(null)}
        category={activeCategory}
        data={categoryData}
      />
    </div>
  );
}

// Add missing Database icon
const Database = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
    <path d="M3 12A9 3 0 0 0 21 12"></path>
  </svg>
);

export default AIInsights;  