import React, { useState } from 'react';
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  DollarSign,
  Users,
  Clock,
  Percent,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Target,
  Shield,
  Coffee,
  Wheat,
  Factory,
  CreditCard,
  CheckCircle, // Added missing import
  X, // Added X icon
  Package // Added Package icon
} from 'lucide-react';

// Mock data for AI Insights
const mockAIData = {
  stockRecommendations: [
    { 
      product: 'Basmati Rice', 
      action: 'Increase', 
      recommendation: 'Increase stock by 25% for upcoming festival season', 
      priority: 'High',
      currentStock: 5600,
      minStock: 3000,
      confidence: 92,
      impact: 'High profit potential',
      timeline: 'Next 7 days'
    },
    { 
      product: 'Brown Rice', 
      action: 'Increase', 
      recommendation: 'Health trend increasing demand by 18% monthly', 
      priority: 'Medium',
      currentStock: 2300,
      minStock: 2000,
      confidence: 85,
      impact: 'Growing market segment',
      timeline: 'Next 14 days'
    },
    { 
      product: 'Rice Bran', 
      action: 'Decrease', 
      recommendation: 'Reduce procurement by 15% due to low market demand', 
      priority: 'Low',
      currentStock: 1800,
      minStock: 2000,
      confidence: 78,
      impact: 'Reduce storage costs',
      timeline: 'Next 30 days'
    },
    { 
      product: 'Sona Masoori', 
      action: 'Maintain', 
      recommendation: 'Current stock levels optimal for regular demand', 
      priority: 'Low',
      currentStock: 4200,
      minStock: 2000,
      confidence: 88,
      impact: 'Stable cash flow',
      timeline: 'Monitor weekly'
    }
  ],
  salesInsights: [
    { 
      title: 'Weekend Sales Boost', 
      trend: 'Up', 
      insight: 'Saturday sales 35% higher than weekday average',
      impact: '+Rs. 45,000 weekly revenue',
      confidence: 94,
      action: 'Increase weekend stock by 20%'
    },
    { 
      title: 'Premium Product Growth', 
      trend: 'Up', 
      insight: 'Basmati Rice sales growing 22% month-over-month',
      impact: 'Higher margin product performance',
      confidence: 91,
      action: 'Focus marketing on premium segment'
    },
    { 
      title: 'Dealer Payment Delays', 
      trend: 'Down', 
      insight: 'Average payment delay increased from 7 to 14 days',
      impact: 'Cash flow pressure increasing',
      confidence: 82,
      action: 'Implement stricter credit terms'
    },
    { 
      title: 'Regional Demand Shift', 
      trend: 'Up', 
      insight: 'Northern region demand up by 18% this quarter',
      impact: 'New market opportunity',
      confidence: 87,
      action: 'Increase distribution to northern dealers'
    }
  ],
  loanRisks: [
    { 
      customer: 'Dealer Abdul', 
      assessment: 'Payment delays increasing from 7 to 21 days',
      outstandingAmount: 125000,
      riskLevel: 'High',
      daysOverdue: 8,
      totalLoans: 245000,
      paymentHistory: '78% on-time',
      recommendedAction: 'Schedule collection visit'
    },
    { 
      customer: 'Dealer Suren', 
      assessment: 'History of late payments during monsoon season',
      outstandingAmount: 45000,
      riskLevel: 'Medium',
      daysOverdue: 3,
      totalLoans: 89000,
      paymentHistory: '65% on-time',
      recommendedAction: 'Send payment reminder'
    },
    { 
      customer: 'Dealer Ramesh', 
      assessment: 'Consistent payer with minor delays',
      outstandingAmount: 85000,
      riskLevel: 'Low',
      daysOverdue: 0,
      totalLoans: 125000,
      paymentHistory: '92% on-time',
      recommendedAction: 'Standard follow-up'
    },
    { 
      customer: 'Dealer Kamal', 
      assessment: 'New dealer with unknown payment pattern',
      outstandingAmount: 92000,
      riskLevel: 'Medium',
      daysOverdue: 0,
      totalLoans: 92000,
      paymentHistory: '100% on-time',
      recommendedAction: 'Monitor closely'
    }
  ],
  seasonalForecasts: [
    { 
      season: 'Festival Season (Oct-Dec)', 
      forecast: 'Expected 40% increase in premium rice demand',
      topProducts: ['Basmati Rice', 'Jasmine Rice', 'Premium Packing'],
      impact: 'High volume, high margin period',
      preparation: 'Increase stock by 35% starting September',
      confidence: 93
    },
    { 
      season: 'Wedding Season (Jan-Mar)', 
      forecast: 'Aromatic rice demand up 35%, packaging up 50%',
      topProducts: ['Jasmine Rice', '25kg Packaging', 'Gift Boxes'],
      impact: 'Premium segment peak',
      preparation: 'Stock aromatic varieties and premium packaging',
      confidence: 89
    },
    { 
      season: 'Monsoon (Jun-Aug)', 
      forecast: 'Transport delays expected, raw paddy procurement critical',
      topProducts: ['Raw Paddy', 'Storage Bags', 'Preservatives'],
      impact: 'Production planning crucial',
      preparation: 'Build buffer stock before June',
      confidence: 76
    },
    { 
      season: 'Harvest Season (Nov-Jan)', 
      forecast: 'Raw paddy prices drop by 12-18%',
      topProducts: ['Raw Paddy', 'Processing Capacity', 'Storage'],
      impact: 'Optimal procurement window',
      preparation: 'Secure storage and processing capacity',
      confidence: 88
    }
  ],
  overallMetrics: {
    aiAccuracy: 89,
    activeInsights: 24,
    highPriority: 8,
    implemented: 12,
    revenueImpact: 285000,
    costSavings: 125000
  }
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
    High: { 
      text: 'HIGH', 
      color: 'bg-red-100 text-red-700 border border-red-200',
      icon: AlertTriangle 
    },
    Medium: { 
      text: 'MEDIUM', 
      color: 'bg-amber-100 text-amber-700 border border-amber-200',
      icon: AlertCircle 
    },
    Low: { 
      text: 'LOW', 
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: TrendingUp 
    },
    Up: { 
      text: 'UP', 
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: TrendingUp 
    },
    Down: { 
      text: 'DOWN', 
      color: 'bg-red-100 text-red-700 border border-red-200',
      icon: TrendingDown 
    }
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
const InsightCard = ({ title, category, icon: Icon, color, insights, onViewDetails }) => {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Card Header */}
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
      
      {/* Insights List */}
      <div className="p-6">
        <ul className="space-y-4">
          {insights.slice(0, 3).map((insight, index) => (
            <li key={index} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:from-blue-50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {insight.trend && <StatusBadge status={insight.trend} />}
                    {insight.priority && <StatusBadge status={insight.priority} />}
                    {insight.riskLevel && <StatusBadge status={insight.riskLevel} />}
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    {insight.product || insight.title || insight.customer || insight.season}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {insight.recommendation || insight.insight || insight.assessment || insight.forecast}
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
        
        {insights.length > 3 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              +{insights.length - 3} more insights available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// AI Recommendation Detail Modal
const RecommendationDetailModal = ({ isOpen, onClose, category, data }) => {
  if (!isOpen) return null;

  const getCategoryConfig = (cat) => {
    switch(cat) {
      case 'stock':
        return {
          title: 'Stock Recommendations',
          icon: Package,
          color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          fields: ['product', 'action', 'recommendation', 'priority', 'currentStock', 'timeline', 'impact']
        };
      case 'sales':
        return {
          title: 'Sales Insights',
          icon: DollarSign,
          color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
          fields: ['title', 'trend', 'insight', 'impact', 'action', 'confidence']
        };
      case 'loans':
        return {
          title: 'Loan Risk Assessment',
          icon: CreditCard,
          color: 'bg-gradient-to-br from-amber-500 to-orange-600',
          fields: ['customer', 'assessment', 'riskLevel', 'outstandingAmount', 'paymentHistory', 'recommendedAction']
        };
      case 'seasonal':
        return {
          title: 'Seasonal Forecasts',
          icon: Calendar,
          color: 'bg-gradient-to-br from-purple-500 to-pink-600',
          fields: ['season', 'forecast', 'impact', 'preparation', 'topProducts', 'confidence']
        };
      default:
        return {
          title: 'AI Insights',
          icon: Lightbulb,
          color: 'bg-gradient-to-br from-gray-500 to-blue-600',
          fields: []
        };
    }
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${config.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{data.length} active insights</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {data.map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {item.product || item.title || item.customer || item.season}
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
                    
                    {item.insight && (
                      <div>
                        <p className="text-sm text-gray-600">Insight</p>
                        <p className="text-gray-900 font-medium">{item.insight}</p>
                      </div>
                    )}
                    
                    {item.assessment && (
                      <div>
                        <p className="text-sm text-gray-600">Assessment</p>
                        <p className="text-gray-900 font-medium">{item.assessment}</p>
                      </div>
                    )}
                    
                    {item.forecast && (
                      <div>
                        <p className="text-sm text-gray-600">Forecast</p>
                        <p className="text-gray-900 font-medium">{item.forecast}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      {item.currentStock && (
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-sm text-gray-600">Current Stock</p>
                          <p className="font-bold text-gray-900">{item.currentStock.toLocaleString()} kg</p>
                        </div>
                      )}
                      
                      {item.outstandingAmount && (
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-sm text-gray-600">Outstanding Amount</p>
                          <p className="font-bold text-gray-900">₹{item.outstandingAmount.toLocaleString()}</p>
                        </div>
                      )}
                      
                      {item.impact && (
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-sm text-gray-600">Impact</p>
                          <p className="font-medium text-emerald-600">{item.impact}</p>
                        </div>
                      )}
                      
                      {item.timeline && (
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-sm text-gray-600">Timeline</p>
                          <p className="font-medium text-gray-900">{item.timeline}</p>
                        </div>
                      )}
                    </div>
                    
                    {item.topProducts && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Top Products</p>
                        <div className="flex flex-wrap gap-2">
                          {item.topProducts.map((product, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.action && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">Recommended Action</p>
                        <p className="text-gray-700 mt-1">{item.action}</p>
                      </div>
                    )}
                    
                    {item.recommendedAction && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">Risk Mitigation</p>
                        <p className="text-gray-700 mt-1">{item.recommendedAction}</p>
                      </div>
                    )}
                    
                    {item.preparation && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">Preparation Required</p>
                        <p className="text-gray-700 mt-1">{item.preparation}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-3">
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg">
                      Mark as Reviewed
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg">
                      Schedule Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={() => alert('All insights marked as reviewed')}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700"
              >
                Mark All as Reviewed
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
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
  const [categoryData, setCategoryData] = useState(null);

  const handleViewDetails = (category) => {
    let data = [];
    switch(category) {
      case 'stock':
        data = mockAIData.stockRecommendations;
        break;
      case 'sales':
        data = mockAIData.salesInsights;
        break;
      case 'loans':
        data = mockAIData.loanRisks;
        break;
      case 'seasonal':
        data = mockAIData.seasonalForecasts;
        break;
    }
    setCategoryData(data);
    setActiveCategory(category);
  };

  const handleCloseModal = () => {
    setActiveCategory(null);
    setCategoryData(null);
  };

  const refreshInsights = () => {
    alert('AI insights refreshed with latest data');
  };

  const exportInsights = () => {
    alert('AI insights exported successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🤖 AI Insights & Recommendations</h1>
            <p className="text-gray-600 mt-2">Intelligent analysis for smarter rice mill management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <select
                className="bg-transparent focus:outline-none text-sm font-medium"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </select>
            </div>
            <button
              onClick={refreshInsights}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh AI
            </button>
            <button
              onClick={exportInsights}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Insights
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">AI Decision Support System</p>
              <p className="text-sm text-blue-700 mt-1">
                These AI recommendations are based on historical data and market trends. 
                They are meant to assist your decision-making process, not replace human judgment.
              </p>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="AI Accuracy Score" 
            value={mockAIData.overallMetrics.aiAccuracy} 
            subtitle="Prediction accuracy rate" 
            icon={Target} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            trend={+3.2} 
            unit="%"
          />
          <KpiCard 
            title="Active Insights" 
            value={mockAIData.overallMetrics.activeInsights} 
            subtitle="Recommendations pending" 
            icon={Lightbulb} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            trend={+18} 
          />
          <KpiCard 
            title="High Priority Alerts" 
            value={mockAIData.overallMetrics.highPriority} 
            subtitle="Require immediate attention" 
            icon={AlertTriangle} 
            color="bg-gradient-to-br from-amber-500 to-orange-600" 
            trend={+25} 
          />
          <KpiCard 
            title="Revenue Impact" 
            value={mockAIData.overallMetrics.revenueImpact} 
            subtitle="From implemented insights" 
            icon={DollarSign} 
            color="bg-gradient-to-br from-purple-500 to-pink-600" 
            trend={+42} 
            unit="₹"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Cost Savings" 
            value={mockAIData.overallMetrics.costSavings} 
            subtitle="From optimized operations" 
            icon={TrendingDown} 
            color="bg-gradient-to-br from-green-500 to-emerald-600" 
            trend={+28} 
            unit="₹"
          />
          <KpiCard 
            title="Insights Implemented" 
            value={mockAIData.overallMetrics.implemented} 
            subtitle="Actions taken" 
            icon={CheckCircle} 
            color="bg-gradient-to-br from-cyan-500 to-blue-600" 
            trend={+35} 
          />
          <KpiCard 
            title="Stock Risk Averted" 
            value={8} 
            subtitle="Potential shortages prevented" 
            icon={Shield} 
            color="bg-gradient-to-br from-red-500 to-rose-600" 
            trend={-12} 
          />
          <KpiCard 
            title="Dealer Risk Reduced" 
            value="74%" 
            subtitle="Payment risk improvement" 
            icon={Users} 
            color="bg-gradient-to-br from-indigo-500 to-purple-600" 
            trend={+8} 
          />
        </div>

        {/* AI Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <InsightCard 
            title="Stock Recommendations" 
            category="Inventory Management" 
            icon={Package} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
            insights={mockAIData.stockRecommendations}
            onViewDetails={() => handleViewDetails('stock')}
          />
          <InsightCard 
            title="Sales Insights" 
            category="Revenue Optimization" 
            icon={DollarSign} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            insights={mockAIData.salesInsights}
            onViewDetails={() => handleViewDetails('sales')}
          />
          <InsightCard 
            title="Loan Risk Assessment" 
            category="Credit Management" 
            icon={CreditCard} 
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            insights={mockAIData.loanRisks}
            onViewDetails={() => handleViewDetails('loans')}
          />
          <InsightCard 
            title="Seasonal Forecasts" 
            category="Demand Planning" 
            icon={Calendar} 
            color="bg-gradient-to-br from-purple-500 to-pink-600"
            insights={mockAIData.seasonalForecasts}
            onViewDetails={() => handleViewDetails('seasonal')}
          />
        </div>

        {/* AI Impact Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-blue-100 p-8 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Activity className="w-7 h-7 text-blue-600" />
            AI Impact Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-5 text-center">
              <div className="text-sm text-gray-600 mb-2">Revenue Increased</div>
              <div className="text-2xl font-bold text-emerald-600">₹2.85L</div>
              <div className="text-xs text-gray-500 mt-1">From AI recommendations</div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center">
              <div className="text-sm text-gray-600 mb-2">Costs Reduced</div>
              <div className="text-2xl font-bold text-red-600">₹1.25L</div>
              <div className="text-xs text-gray-500 mt-1">Through optimization</div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center">
              <div className="text-sm text-gray-600 mb-2">Stockouts Prevented</div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-500 mt-1">Potential shortages</div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center">
              <div className="text-sm text-gray-600 mb-2">Risk Mitigated</div>
              <div className="text-2xl font-bold text-amber-600">8</div>
              <div className="text-xs text-gray-500 mt-1">High-risk situations</div>
            </div>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Target className="w-7 h-7 text-emerald-600" />
            Top 3 Actionable Insights This Week
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Increase Basmati Rice Stock by 25%</h4>
                  <p className="text-sm text-gray-600">Festival season demand expected to increase 40%</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status="High" />
                </div>
              </div>
              <p className="text-sm text-gray-700">Action Required: Increase procurement before October 25th</p>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Follow up with Dealer Abdul</h4>
                  <p className="text-sm text-gray-600">Payment delay risk: High (8 days overdue)</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status="High" />
                </div>
              </div>
              <p className="text-sm text-gray-700">Action Required: Schedule collection visit within 2 days</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Factory className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Optimize Production Schedule</h4>
                  <p className="text-sm text-gray-600">Machine utilization below capacity by 18%</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status="Medium" />
                </div>
              </div>
              <p className="text-sm text-gray-700">Action Required: Review production plan for efficiency improvements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <RecommendationDetailModal 
        isOpen={activeCategory !== null}
        onClose={handleCloseModal}
        category={activeCategory}
        data={categoryData}
      />
    </div>
  );
}

export default AIInsights;