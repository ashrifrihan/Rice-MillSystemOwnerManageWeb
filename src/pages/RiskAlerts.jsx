import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Truck,
  Package,
  Users,
  CreditCard,
  Zap,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Shield,
  Home,
  Factory,
  Percent,
  Calculator,
  AlertCircle as AlertCircleIcon,
  RefreshCw,
  X
} from 'lucide-react';

// Mock data simulating AI-generated risk alerts
const mockAIData = {
  riskAlerts: [
    // Stock Risks
    {
      id: 'STK-001',
      title: 'Premium Rice Stock Low',
      description: 'Premium Rice stock will finish in 4 days based on current usage.',
      severity: 'critical',
      probability: 92,
      category: 'stock',
      status: 'new',
      timestamp: '10 min ago',
      impact: 'High - ₹45,000 potential loss',
      actions: [
        'Order Premium Rice immediately',
        'Check with suppliers for quick delivery',
        'Adjust sales priorities'
      ],
      relatedData: 'Daily usage increased by 15% this week. Current stock: 450kg',
      module: 'Inventory',
      affectedEntity: 'Premium Basmati Rice',
      detectionTime: new Date().toISOString(),
      aiConfidence: 94
    },
    {
      id: 'STK-002',
      title: 'Samba Rice Usage Spike',
      description: 'Samba Rice daily usage increased by 30% compared to last week.',
      severity: 'high',
      probability: 85,
      category: 'stock',
      status: 'new',
      timestamp: '25 min ago',
      impact: 'Medium - ₹18,000 revenue at risk',
      actions: [
        'Verify sales data accuracy',
        'Check for bulk orders',
        'Monitor stock levels closely'
      ],
      relatedData: 'Last week: 120kg/day, This week: 156kg/day',
      module: 'Sales',
      affectedEntity: 'Samba Rice',
      detectionTime: new Date().toISOString(),
      aiConfidence: 87
    },
    {
      id: 'STK-003',
      title: 'High Wastage Detected',
      description: 'Unusually high wastage rate in milling process detected.',
      severity: 'medium',
      probability: 78,
      category: 'stock',
      status: 'acknowledged',
      timestamp: '2 hours ago',
      impact: 'Medium - ₹8,500 monthly loss',
      actions: [
        'Inspect milling equipment',
        'Check rice quality standards',
        'Review worker procedures'
      ],
      relatedData: 'Wastage rate: 8.2% (normal: 4-5%)',
      module: 'Production',
      affectedEntity: 'Milling Process',
      detectionTime: new Date().toISOString(),
      aiConfidence: 82
    },
    
    // Transport Risks
    {
      id: 'TRN-001',
      title: 'Lorry Stuck at Location',
      description: 'Lorry TN-45-A-1234 stopped at same location for 42 minutes.',
      severity: 'high',
      probability: 88,
      category: 'transport',
      status: 'new',
      timestamp: '15 min ago',
      impact: 'High - Delayed delivery penalty',
      actions: [
        'Call driver immediately',
        'Check GPS location details',
        'Verify delivery schedule'
      ],
      relatedData: 'Location: Kurunegala. Expected delivery delay: 1-2 hours',
      module: 'Transport',
      affectedEntity: 'Vehicle TN-45-A-1234',
      detectionTime: new Date().toISOString(),
      aiConfidence: 91
    },
    {
      id: 'TRN-002',
      title: 'GPS Route Deviation',
      description: 'Vehicle TN-38-B-5678 took unexpected turn from planned route.',
      severity: 'medium',
      probability: 75,
      category: 'transport',
      status: 'new',
      timestamp: '45 min ago',
      impact: 'Medium - Fuel & time waste',
      actions: [
        'Contact driver for route explanation',
        'Check for road closures/detours',
        'Monitor fuel consumption'
      ],
      relatedData: 'Deviation: 3.2km from planned route. Extra travel time: 12min',
      module: 'Transport',
      affectedEntity: 'Vehicle TN-38-B-5678',
      detectionTime: new Date().toISOString(),
      aiConfidence: 78
    },
    
    // Loan Risks
    {
      id: 'LN-001',
      title: 'Customer Payment Overdue',
      description: 'Customer Ravi overdue 31 days on loan payment.',
      severity: 'high',
      probability: 90,
      category: 'loan',
      status: 'new',
      timestamp: '1 hour ago',
      impact: 'High - ₹45,000 at risk',
      actions: [
        'Contact customer for payment schedule',
        'Send payment reminder',
        'Review credit terms if needed'
      ],
      relatedData: 'Amount overdue: ₹45,000. Previous payment pattern: Regular',
      module: 'Loan Management',
      affectedEntity: 'Dealer Ravi',
      detectionTime: new Date().toISOString(),
      aiConfidence: 93
    },
    {
      id: 'LN-002',
      title: 'Irregular Payment Pattern',
      description: 'Customer Kumar showing irregular payment pattern last 3 months.',
      severity: 'medium',
      probability: 76,
      category: 'loan',
      status: 'new',
      timestamp: '5 hours ago',
      impact: 'Medium - Potential bad debt',
      actions: [
        'Review customer financial status',
        'Check for seasonal business patterns',
        'Consider payment plan adjustment'
      ],
      relatedData: '3 payments missed in 90 days. Balance: ₹82,500',
      module: 'Loan Management',
      affectedEntity: 'Dealer Kumar',
      detectionTime: new Date().toISOString(),
      aiConfidence: 81
    },
    
    // Worker Risks
    {
      id: 'WRK-001',
      title: 'Worker Absent Multiple Days',
      description: 'Worker Siva absent 4 consecutive days without notice.',
      severity: 'medium',
      probability: 85,
      category: 'worker',
      status: 'new',
      timestamp: '2 hours ago',
      impact: 'Medium - Production delay risk',
      actions: [
        'Contact worker for status update',
        'Check emergency contact information',
        'Assign backup worker for shifts'
      ],
      relatedData: 'Last present: 4 days ago. Previous attendance: 98%',
      module: 'Worker Management',
      affectedEntity: 'Worker Siva (W012)',
      detectionTime: new Date().toISOString(),
      aiConfidence: 84
    },
    {
      id: 'WRK-002',
      title: 'Night Shift Late Check-in',
      description: '3 workers consistently late for night shift this week.',
      severity: 'low',
      probability: 72,
      category: 'worker',
      status: 'acknowledged',
      timestamp: '6 hours ago',
      impact: 'Low - Minor productivity loss',
      actions: [
        'Review shift timing effectiveness',
        'Discuss with workers about challenges',
        'Consider shift adjustment if needed'
      ],
      relatedData: 'Average delay: 22 minutes. Affected milling output: 5% reduction',
      module: 'Worker Management',
      affectedEntity: 'Night Shift Crew',
      detectionTime: new Date().toISOString(),
      aiConfidence: 76
    },
    
    // Machine Risks
    {
      id: 'MCH-001',
      title: 'Rice Mill Motor Over-Usage',
      description: 'Main milling motor showing signs of over-usage and strain.',
      severity: 'critical',
      probability: 89,
      category: 'machine',
      status: 'new',
      timestamp: '30 min ago',
      impact: 'High - ₹1.2L repair cost risk',
      actions: [
        'Schedule immediate maintenance check',
        'Reduce milling load temporarily',
        'Order spare parts proactively'
      ],
      relatedData: 'Operating at 92% capacity. Temperature 8°C above normal',
      module: 'Production',
      affectedEntity: 'Main Milling Motor',
      detectionTime: new Date().toISOString(),
      aiConfidence: 90
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
      icon: AlertTriangle 
    },
    high: { 
      text: 'HIGH', 
      color: 'bg-orange-100 text-orange-700 border border-orange-200',
      icon: AlertTriangle 
    },
    medium: { 
      text: 'MEDIUM', 
      color: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      icon: AlertCircle 
    },
    low: { 
      text: 'LOW', 
      color: 'bg-blue-100 text-blue-700 border border-blue-200',
      icon: Bell 
    },
    new: { 
      text: 'NEW', 
      color: 'bg-red-100 text-red-700 border border-red-200',
      icon: AlertTriangle 
    },
    acknowledged: { 
      text: 'ACKNOWLEDGED', 
      color: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      icon: Clock 
    },
    resolved: { 
      text: 'RESOLVED', 
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: CheckCircle 
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

// Category Icon Component
const CategoryIcon = ({ category }) => {
  const config = {
    stock: { icon: Package, color: 'text-blue-600 bg-blue-100' },
    transport: { icon: Truck, color: 'text-emerald-600 bg-emerald-100' },
    loan: { icon: CreditCard, color: 'text-amber-600 bg-amber-100' },
    worker: { icon: Users, color: 'text-purple-600 bg-purple-100' },
    machine: { icon: Factory, color: 'text-red-600 bg-red-100' },
    sales: { icon: TrendingUp, color: 'text-green-600 bg-green-100' }
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
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'high': return 'bg-gradient-to-r from-orange-500 to-amber-600';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      case 'low': return 'bg-gradient-to-r from-blue-500 to-cyan-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Severity Indicator Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityColor(alert.severity)}`}></div>
      
      <div className="relative p-6">
        {/* Header */}
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

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-2">{alert.description}</p>

        {/* Risk Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Probability</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-gray-900">{alert.probability}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getSeverityColor(alert.severity)}`}
                  style={{ width: `${alert.probability}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">AI Confidence</div>
            <div className="text-lg font-bold text-blue-600">{alert.aiConfidence || 85}%</div>
          </div>
        </div>

        {/* Module Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Module:</span> {alert.module}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Affected:</span> {alert.affectedEntity}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => onViewDetails(alert)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
          
          <div className="flex items-center gap-2">
            {alert.status === 'new' && (
              <>
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => onResolve(alert.id)}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
                >
                  Resolve
                </button>
              </>
            )}
            {alert.status === 'acknowledged' && (
              <button
                onClick={() => onResolve(alert.id)}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Risk Detail Modal Component
const RiskDetailModal = ({ isOpen, onClose, alert, onAcknowledge, onResolve }) => {
  if (!isOpen || !alert) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'high': return 'bg-gradient-to-r from-orange-500 to-amber-600';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      case 'low': return 'bg-gradient-to-r from-blue-500 to-cyan-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getImpactIcon = (impact) => {
    if (impact.includes('High')) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (impact.includes('Medium')) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <Bell className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${getSeverityColor(alert.severity).replace('bg-gradient-to-r', 'bg-gradient-to-r from-opacity-20 to-opacity-10')}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CategoryIcon category={alert.category} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={alert.severity} />
                    <span className="text-sm text-gray-600">{alert.timestamp}</span>
                  </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Risk Summary */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Risk Summary</h4>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Description</div>
                        <p className="text-gray-900">{alert.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Severity</div>
                          <StatusBadge status={alert.severity} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Status</div>
                          <StatusBadge status={alert.status} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Module Source</div>
                        <div className="font-medium text-gray-900">{alert.module}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Affected Entity</div>
                        <div className="font-medium text-gray-900">{alert.affectedEntity}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Evidence & Related Data */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Evidence & Detection</h4>
                  <div className="bg-blue-50 rounded-xl p-5">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Detection Time:</span>
                        <span className="font-medium">{new Date(alert.detectionTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Confidence:</span>
                        <span className="font-bold text-blue-600">{alert.aiConfidence || 85}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Probability:</span>
                        <span className="font-bold text-gray-900">{alert.probability}%</span>
                      </div>
                      
                      {alert.relatedData && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="text-sm text-gray-600 mb-1">Related Data</div>
                          <p className="text-sm text-gray-900">{alert.relatedData}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Recommended Actions */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Impact Assessment</h4>
                  <div className={`rounded-xl p-5 ${
                    alert.severity === 'critical' ? 'bg-red-50' :
                    alert.severity === 'high' ? 'bg-orange-50' :
                    alert.severity === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      {getImpactIcon(alert.impact)}
                      <div>
                        <div className="font-semibold text-gray-900">Potential Impact</div>
                        <p className="text-gray-700 mt-1">{alert.impact}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {alert.severity === 'critical' && 'Immediate action required to prevent significant loss'}
                          {alert.severity === 'high' && 'High probability of loss without timely intervention'}
                          {alert.severity === 'medium' && 'Monitor closely and take preventive measures'}
                          {alert.severity === 'low' && 'Informational - monitor for changes'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Recommended Actions</h4>
                  <div className="bg-emerald-50 rounded-xl p-5">
                    <div className="space-y-3">
                      {alert.actions?.map((action, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center mt-0.5">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-gray-900">{action}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {index === 0 && 'Priority action - complete immediately'}
                              {index === 1 && 'Secondary action - complete within 24 hours'}
                              {index === 2 && 'Preventive action - schedule this week'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <div className="text-sm text-gray-600 mb-2">Expected Outcome</div>
                      <p className="text-sm text-emerald-700 font-medium">
                        Risk mitigation and operational stability restoration
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Internal Notes Section */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Add Internal Note</h4>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Add notes about this risk, actions taken, or follow-up required..."
              ></textarea>
            </div>
          </div>
          
          {/* Actions Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Alert ID: {alert.id} • Detected by AI System
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
                
                {alert.status === 'new' && (
                  <>
                    <button
                      onClick={() => {
                        onAcknowledge(alert.id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => {
                        onResolve(alert.id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition"
                    >
                      Mark as Resolved
                    </button>
                  </>
                )}
                
                {alert.status === 'acknowledged' && (
                  <button
                    onClick={() => {
                      onResolve(alert.id);
                      onClose();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlerts(mockAIData.riskAlerts);
      setIsLoading(false);
    };
    loadAlerts();
  }, []);

  const handleAcknowledge = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
  };

  const handleResolve = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Simulate new alerts
      const refreshedAlerts = [...mockAIData.riskAlerts];
      setAlerts(refreshedAlerts);
      setIsLoading(false);
    }, 800);
  };

  const handleExport = () => {
    alert('Risk alerts exported successfully');
  };

  // Calculate stats
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

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.affectedEntity.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Severity filter
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || alert.category === categoryFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading risk alerts...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing system data for potential risks</p>
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
            <p className="text-gray-600 mt-2">Real-time operational and financial risk monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Alerts
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Grid - Risk Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Critical Risks" 
            value={stats.critical} 
            subtitle="Require immediate action" 
            icon={AlertTriangle} 
            color="bg-gradient-to-br from-red-500 to-rose-600" 
            trend={+25} 
          />
          <KpiCard 
            title="High Risks" 
            value={stats.high} 
            subtitle="High chance of loss" 
            icon={AlertTriangle} 
            color="bg-gradient-to-br from-orange-500 to-amber-600" 
            trend={+18} 
          />
          <KpiCard 
            title="New Alerts" 
            value={stats.new} 
            subtitle="Require attention" 
            icon={Bell} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            trend={+12} 
          />
          <KpiCard 
            title="Resolved Today" 
            value={stats.resolved} 
            subtitle="Risks mitigated" 
            icon={CheckCircle} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            trend={+8} 
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Medium Risks" 
            value={stats.medium} 
            subtitle="Needs monitoring" 
            icon={AlertCircle} 
            color="bg-gradient-to-br from-yellow-500 to-amber-600" 
            trend={-5} 
          />
          <KpiCard 
            title="Low Risks" 
            value={stats.low} 
            subtitle="Informational alerts" 
            icon={Bell} 
            color="bg-gradient-to-br from-blue-500 to-cyan-600" 
            trend={+3} 
          />
          <KpiCard 
            title="Acknowledged" 
            value={stats.acknowledged} 
            subtitle="Under review" 
            icon={Clock} 
            color="bg-gradient-to-br from-amber-500 to-orange-600" 
            trend={+15} 
          />
          <KpiCard 
            title="Total Active" 
            value={stats.total} 
            subtitle="All risk alerts" 
            icon={Activity} 
            color="bg-gradient-to-br from-purple-500 to-pink-600" 
            trend={+22} 
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
                  placeholder="Search by risk title, description, or affected entity..."
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="stock">Stock</option>
                <option value="sales">Sales</option>
                <option value="loan">Loans</option>
                <option value="transport">Transport</option>
                <option value="worker">Workers</option>
                <option value="machine">Machine</option>
              </select>
              
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAlerts.map((alert) => (
            <RiskAlertCard 
              key={alert.id} 
              alert={alert}
              onViewDetails={setSelectedAlert}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No risk alerts found</h3>
            <p className="text-gray-500">
              {searchTerm || severityFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search term' 
                : 'Great job! No active risks detected in the system.'}
            </p>
          </div>
        )}

        {/* Risk Type Breakdown */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Risk Types by Module
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Stock & Inventory</div>
                  <div className="text-sm text-gray-600">Low stock, overstock, demand spikes</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                Example: "Samba rice stock expected to run out in 4 days"
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
                Example: "Dealer ABC Traders' loan overdue by 12 days"
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Truck className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Transport & GPS</div>
                  <div className="text-sm text-gray-600">Route deviations, delays, stops</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                Example: "Vehicle KA-1234 stopped for 45 minutes outside route"
              </div>
            </div>
          </div>
        </div>

        {/* AI Explanation Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">How Risk Detection Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">🔍 Data Aggregation</p>
                  <p className="text-sm text-gray-600">Collects data from all modules: Sales, Loans, Transport, Inventory, Workers</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">🤖 AI Analysis</p>
                  <p className="text-sm text-gray-600">AI analyzes patterns, detects anomalies, and predicts potential issues</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">🚨 Risk Prioritization</p>
                  <p className="text-sm text-gray-600">Risks categorized by severity, probability, and potential impact</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <span className="font-semibold">Note:</span> This system provides early warnings only. All decisions require human review and judgment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Detail Modal */}
      <RiskDetailModal 
        isOpen={selectedAlert !== null}
        onClose={() => setSelectedAlert(null)}
        alert={selectedAlert}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
}

export default RiskAlerts;