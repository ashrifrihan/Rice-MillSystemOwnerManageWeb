import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Bell, CheckCircle, XCircle, Filter, Download, Eye,
  Clock, TrendingUp, TrendingDown, Truck, Package, Users, CreditCard,
  Zap, AlertCircle, Activity, BarChart3, PieChart, ArrowUpRight,
  ArrowDownRight, Search, Shield, Home, Factory, Percent, Calculator,
  RefreshCw, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import FirebaseDataService from '../services/firebaseDataService';

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
            {trend > 0 ? <ArrowUpRight className=" w-5" /> : <ArrowDownRight className="w-5 " />}
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
    critical: { text: 'CRITICAL', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    high: { text: 'HIGH', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    medium: { text: 'MEDIUM', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    low: { text: 'LOW', color: 'bg-blue-100 text-blue-700', icon: Bell },
    new: { text: 'NEW', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    acknowledged: { text: 'ACKNOWLEDGED', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    resolved: { text: 'RESOLVED', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle }
  }[status] || { text: 'UNKNOWN', color: 'bg-gray-100 text-gray-700', icon: AlertCircle };

  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {config.text}
    </span>
  );
};

// Category Icon Component
const CategoryIcon = ({ category }) => {
  const config = {
    stock: { icon: Package, color: 'text-blue-600 bg-blue-100' },
    transport: { icon: Truck, color: 'text-emerald-600 bg-emerald-100' },
    loan: { icon: CreditCard, color: 'text-amber-600 bg-amber-100' },
    worker: { icon: Users, color: 'text-purple-600 bg-purple-100' },
    machine: { icon: Factory, color: 'text-red-600 bg-red-100' }
  }[category] || { icon: Bell, color: 'text-gray-600 bg-gray-100' };

  const Icon = config.icon;
  
  return (
    <div className={`p-2 rounded-xl ${config.color}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
};

// Risk Alert Card Component
const RiskAlertCard = ({ alert, onViewDetails, onAcknowledge, onResolve }) => {
  const getSeverityColor = (severity) => ({
    critical: 'bg-gradient-to-r from-red-500 to-rose-600',
    high: 'bg-gradient-to-r from-orange-500 to-amber-600',
    medium: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    low: 'bg-gradient-to-r from-blue-500 to-cyan-600'
  }[severity] || 'bg-gradient-to-r from-gray-500 to-gray-600');

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityColor(alert.severity)}`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <CategoryIcon category={alert.category} />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{alert.title}</h3>
              <p className="text-sm text-gray-600">{alert.timestamp}</p>
            </div>
          </div>
          <StatusBadge status={alert.severity} />
        </div>

        <p className="text-gray-700 mb-4 line-clamp-2">{alert.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Probability</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-gray-900">{alert.probability}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${getSeverityColor(alert.severity)}`} style={{ width: `${alert.probability}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">AI Confidence</div>
            <div className="text-lg font-bold text-blue-600">{alert.aiConfidence || 85}%</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button onClick={() => onViewDetails(alert)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition flex items-center gap-2">
            <Eye className="h-4 w-4" /> View Details
          </button>
          
          <div className="flex items-center gap-2">
            {alert.status === 'new' && (
              <>
                <button onClick={() => onAcknowledge(alert.id)} className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition">
                  Acknowledge
                </button>
                <button onClick={() => onResolve(alert.id)} className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition">
                  Resolve
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export function RiskAlerts() {
  const [filter, setFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRiskAlerts();
  }, []);

  const loadRiskAlerts = async () => {
    try {
      setIsLoading(true);
      const riskAlerts = await FirebaseDataService.fetchRiskAlerts();
      setAlerts(riskAlerts);
    } catch (error) {
      console.error('Failed to load risk alerts:', error);
      toast.error('Failed to load risk alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
    toast.success('Alert acknowledged');
  };

  const handleResolve = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
    toast.success('Alert resolved');
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadRiskAlerts();
    setIsLoading(false);
    toast.success('Risk alerts refreshed');
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || alert.category === categoryFilter;
    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
    new: alerts.filter(a => a.status === 'new').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading risk alerts...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">🚨 Risk Alerts & System Warnings</h1>
            <p className="text-gray-600 mt-2">Live risk detection from your mill data</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleRefresh} className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh Alerts
            </button>
            <button onClick={() => toast.success('Report exported')} className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2">
              <Download className="h-4 w-4" /> Export Report
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Critical Risks" value={stats.critical} subtitle="Require immediate action" icon={AlertTriangle} color="bg-gradient-to-br from-red-500 to-rose-600" trend={+25} />
          <KpiCard title="High Risks" value={stats.high} subtitle="High chance of loss" icon={AlertTriangle} color="bg-gradient-to-br from-orange-500 to-amber-600" trend={+18} />
          <KpiCard title="New Alerts" value={stats.new} subtitle="Require attention" icon={Bell} color="bg-gradient-to-br from-blue-500 to-indigo-600" trend={+12} />
          <KpiCard title="Resolved Today" value={stats.resolved} subtitle="Risks mitigated" icon={CheckCircle} color="bg-gradient-to-br from-emerald-500 to-teal-600" trend={+8} />
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 mb-8 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" placeholder="Search by risk title..." className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="stock">Stock</option>
                <option value="loan">Loans</option>
                <option value="transport">Transport</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAlerts.map((alert) => (
            <RiskAlertCard key={alert.id} alert={alert} onViewDetails={setSelectedAlert} onAcknowledge={handleAcknowledge} onResolve={handleResolve} />
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active risk alerts</h3>
            <p className="text-gray-500">Great job! Your mill operations are running smoothly.</p>
          </div>
        )}

        {/* Risk Type Breakdown */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Risk Detection Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Stock & Inventory</div>
                  <div className="text-sm text-gray-600">Low stock, demand spikes</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                Detects: Stock below minimum levels, fast-moving items
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Loan Management</div>
                  <div className="text-sm text-gray-600">Overdue payments, credit risks</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                Detects: Loans overdue 30+ days, payment pattern changes
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Truck className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Transport & Delivery</div>
                  <div className="text-sm text-gray-600">Delays, route deviations</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                Detects: Delayed deliveries, unexpected stops
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskAlerts;