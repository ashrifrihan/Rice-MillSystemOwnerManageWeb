import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowLeft, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Factory, 
  BarChart3, 
  Warehouse,
  Filter,
  X,
  ChevronDown,
  Package,
  IndianRupee,
  FileText,
  Clock,
  User,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import inventoryUpdateService from '../services/inventoryUpdateService';

export default function InventoryHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterItem = searchParams.get('item');

  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [chartView, setChartView] = useState('grid');

  // Load real history from Firebase
  useEffect(() => {
    let unsub = null;

    const load = async () => {
      try {
        // initial load
        const updates = await inventoryUpdateService.getRecentStockUpdates(200);
        // normalize records and derive type (in/out)
        const normalized = updates.map(u => {
          const incomingTypes = ['Purchase', 'Return', 'Initial Stock', 'Adjustment'];
          const outgoingTypes = ['Sale', 'Damage', 'Quality Rejection'];
          const type = incomingTypes.includes(u.transactionType) ? 'in' : (outgoingTypes.includes(u.transactionType) ? 'out' : 'in');
          return {
            id: u.id,
            created_at: u.created_at || u.updated_at || u.timestamp,
            productId: u.productId,
            productName: u.productName || u.productName,
            transactionType: u.transactionType,
            quantity: u.quantity || u.quantity_kg || 0,
            unit: u.unit || (u.quantity_kg ? 'KG' : 'KG'),
            quantity_kg: u.quantity_kg || (u.unit === 'bags' && u.quantity ? u.quantity * (u.kgPerBag || 50) : u.quantity) || 0,
            warehouse: u.warehouse || '',
            reference: u.reference || '',
            notes: u.notes || '',
            user: u.user || u.performedBy || '',
            supplier: u.supplier || '',
            customer: u.customer || '',
            pricePerKg: u.price_per_kg || u.pricePerKg || 0,
            createdRaw: u,
            type
          };
        });
        setHistory(normalized);

        // realtime listener
        unsub = inventoryUpdateService.setupUpdatesListener((updated) => {
          const norm = updated.map(u => {
            const incomingTypes = ['Purchase', 'Return', 'Initial Stock', 'Adjustment'];
            const outgoingTypes = ['Sale', 'Damage', 'Quality Rejection'];
            const type = incomingTypes.includes(u.transactionType) ? 'in' : (outgoingTypes.includes(u.transactionType) ? 'out' : 'in');
            return {
              id: u.id,
              created_at: u.created_at || u.updated_at || u.timestamp,
              productId: u.productId,
              productName: u.productName || u.productName,
              transactionType: u.transactionType,
              quantity: u.quantity || u.quantity_kg || 0,
              unit: u.unit || (u.quantity_kg ? 'KG' : 'KG'),
              quantity_kg: u.quantity_kg || (u.unit === 'bags' && u.quantity ? u.quantity * (u.kgPerBag || 50) : u.quantity) || 0,
              warehouse: u.warehouse || '',
              reference: u.reference || '',
              notes: u.notes || '',
              user: u.user || u.performedBy || '',
              supplier: u.supplier || '',
              customer: u.customer || '',
              pricePerKg: u.price_per_kg || u.pricePerKg || 0,
              createdRaw: u,
              type
            };
          });
          setHistory(norm);
        });
      } catch (err) {
        console.error('Error loading history from Firebase', err);
      }
    };

    load();

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const filteredHistory = history.filter(item => {
    const performedBy = (item.user || item.performedBy || '').toString();
    const matchesSearch = (item.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (item.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               performedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType.toLowerCase();
    const matchesItem = !filterItem || item.productId === filterItem;
    
    // Date filtering
    const itemDate = new Date(item.created_at || item.date || item.createdRaw?.created_at || item.createdRaw?.timestamp || 0);
    const now = new Date();
    let cutoffDate = new Date();
    
    switch(dateRange) {
      case 'Today':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'Last 7 Days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'Last 30 Days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'Last 90 Days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        cutoffDate = new Date(0); // All time
    }
    
    const matchesDate = dateRange === 'All Time' || itemDate >= cutoffDate;
    
    return matchesSearch && matchesType && matchesItem && matchesDate;
  });

  // Statistics
  const totalIn = filteredHistory.filter(item => item.type === 'in').reduce((sum, item) => sum + (item.quantity_kg || item.totalKg || 0), 0);
  const totalOut = filteredHistory.filter(item => item.type === 'out').reduce((sum, item) => sum + (item.quantity_kg || item.totalKg || 0), 0);
  const netChange = totalIn - totalOut;
  const totalValue = filteredHistory.reduce((sum, item) => {
    const kg = item.quantity_kg || item.totalKg || 0;
    const price = item.pricePerKg || item.createdRaw?.price_per_kg || 0;
    return sum + (kg * price);
  }, 0);
  const avgTransactionValue = filteredHistory.length > 0 ? totalValue / filteredHistory.length : 0;

  const viewDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  // Download JSON invoice for a record
  const downloadInvoice = (record) => {
    try {
      const data = {
        id: record.id,
        reference: record.reference,
        productId: record.productId,
        productName: record.productName,
        transactionType: record.transactionType,
        type: record.type,
        quantity: record.quantity,
        unit: record.unit,
        quantity_kg: record.quantity_kg || record.totalKg || 0,
        pricePerKg: record.pricePerKg || record.createdRaw?.price_per_kg || 0,
        totalValue: record.totalValue ?? ((record.quantity_kg || record.totalKg || 0) * (record.pricePerKg || record.createdRaw?.price_per_kg || 0)),
        warehouse: record.warehouse,
        supplier: record.supplier,
        customer: record.customer,
        user: record.user || record.performedBy || 'System',
        notes: record.notes || ''
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${record.id || Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice', err);
    }
  };

  const printReceipt = (record) => {
    try {
      const total = record.totalValue ?? ((record.quantity_kg || record.totalKg || 0) * (record.pricePerKg || record.createdRaw?.price_per_kg || 0));
      const html = `
        <html>
          <head>
            <title>Invoice ${record.reference || record.id}</title>
            <style>body{font-family: Arial, sans-serif; padding:20px;} h1{font-size:18px;} table{width:100%;border-collapse:collapse;} td,th{padding:8px;border:1px solid #ddd}</style>
          </head>
          <body>
            <h1>Invoice ${record.reference || record.id}</h1>
            <p><strong>Product:</strong> ${record.productName || ''} (${record.productId || ''})</p>
            <p><strong>Type:</strong> ${record.transactionType || record.type || ''}</p>
            <p><strong>Quantity:</strong> ${record.quantity || 0} ${record.unit || ''} (${(record.quantity_kg || record.totalKg || 0)} KG)</p>
            <p><strong>Price per KG:</strong> Rs.${(record.pricePerKg || record.createdRaw?.price_per_kg || 0)}</p>
            <p><strong>Total:</strong> Rs.${total}</p>
            <p><strong>Warehouse:</strong> ${record.warehouse || ''}</p>
            <p><strong>Performed by:</strong> ${record.user || record.performedBy || 'System'}</p>
            <hr />
            <p>${record.notes || ''}</p>
          </body>
        </html>
      `;
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
      }
    } catch (err) {
      console.error('Print failed', err);
    }
  };

  const StatusBadge = ({ status, type }) => {
    const isIn = type === 'in';
    const config = {
      'Purchase': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Purchase' },
      'Sale': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Sale' },
      'Transfer': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Transfer' },
      'Adjustment': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Adjustment' }
    };
    
    const configItem = config[status] || config['Purchase'];
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${configItem.bg} ${configItem.text} ${configItem.border}`}>
        {isIn ? (
          <ArrowDownRight className="h-3 w-3" />
        ) : (
          <ArrowUpRight className="h-3 w-3" />
        )}
        {configItem.label}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
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
          {value}
        </h3>
        <p className="text-sm text-gray-600 mt-1 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Enhanced Header */}
      

      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Total Transactions" 
            value={filteredHistory.length} 
            subtitle={`${history.length} total`} 
            icon={BarChart3} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            trend={+12.4}
          />
          <KpiCard 
            title="Stock In" 
            value={`+${totalIn.toLocaleString()} kg`} 
            subtitle="Added to inventory" 
            icon={TrendingUp} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            trend={+15.2}
          />
          <KpiCard 
            title="Stock Out" 
            value={`-${totalOut.toLocaleString()} kg`} 
            subtitle="Removed from inventory" 
            icon={TrendingDown} 
            color="bg-gradient-to-br from-red-500 to-rose-600" 
            trend={+8.7}
          />
          <KpiCard 
            title="Net Change" 
            value={`${netChange >= 0 ? '+' : ''}${netChange.toLocaleString()} kg`} 
            subtitle="Overall stock movement" 
            icon={Activity} 
            color={`bg-gradient-to-br ${netChange >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600'}`}
          />
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200 flex items-center">
              <button
                onClick={() => setChartView('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  chartView === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setChartView('chart')}
                className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  chartView === 'chart'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Chart View
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredHistory.length} of {history.length} transactions
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition"
            >
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            <select
              className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-3 focus:ring-blue-500/30 text-sm font-medium"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Filter Transactions</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 border border-gray-200"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="In">Stock In Only</option>
                  <option value="Out">Stock Out Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 border border-gray-200"
                  value="All"
                  onChange={() => {}}
                >
                  <option value="All">All Warehouses</option>
                  <option value="A">Warehouse A</option>
                  <option value="B">Warehouse B</option>
                  <option value="C">Warehouse C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value Range
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 border border-gray-200"
                  value="All"
                  onChange={() => {}}
                >
                  <option value="All">Any Value</option>
                  <option value="low">Under Rs.50,000</option>
                  <option value="medium">Rs.50,000 - Rs.2,00,000</option>
                  <option value="high">Over Rs.2,00,000</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setFilterType('All');
                  setDateRange('Last 30 Days');
                }}
                className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
              <div className="text-sm text-gray-600">
                Sorted by: <span className="font-medium text-gray-900">Most Recent</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & ID</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Details</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity & Weight</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Warehouse</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-gray-200/30">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div>
                        <div className="font-bold text-gray-900">{formatDate(item.created_at || item.date || item.createdRaw?.created_at)}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{item.id}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <Clock className="h-3 w-3" />
                          {new Date(item.created_at || item.date || item.createdRaw?.created_at || item.createdRaw?.timestamp || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                            item.type === 'in' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {item.type === 'in' ? (
                              <ArrowDownRight className="h-3 w-3 text-white" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-600 font-mono">{item.productId}</div>
                          <div className="flex items-center gap-2 mt-2">
                            {item.trend && (
                              <span className={`text-xs font-semibold ${item.trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {item.trend > 0 ? '↑' : '↓'} {Math.abs(item.trend)}%
                              </span>
                            )}
                            {item.qualityScore && (
                              <span className="text-xs text-gray-500">
                                Quality: <span className="font-bold">{item.qualityScore}%</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <StatusBadge status={item.transactionType} type={item.type} />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          {item.user || item.performedBy || 'System'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{item.reference}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className={`text-xl font-bold ${item.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.type === 'in' ? '+' : '-'}{item.quantity} {item.unit}
                        </div>
                        <div className="text-sm text-gray-900">{((item.quantity_kg || item.totalKg || 0)).toLocaleString()} KG</div>
                        <div className="text-xs text-gray-500">{item.kgPerBag || item.createdRaw?.kgPerBag || 'N/A'} KG per bag</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                          <Warehouse className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.warehouse}</div>
                          {item.fromWarehouse && (
                            <div className="text-xs text-gray-500">From: {item.fromWarehouse}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <div className="text-xl font-bold text-gray-900">Rs.{((item.totalValue ?? ((item.quantity_kg || item.totalKg || 0) * (item.pricePerKg || item.createdRaw?.price_per_kg || 0))) ).toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Rs.{(item.pricePerKg || item.createdRaw?.price_per_kg || 0)}/KG</div>
                        <div className="text-xs text-gray-500 mt-2">Total value</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewDetails(item)}
                          className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors group"
                          title="View details"
                        >
                          <Eye className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => {/* Download invoice */}}
                          className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors group"
                          title="Download invoice"
                        >
                          <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-16">
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl rotate-45"></div>
                <BarChart3 className="relative h-12 w-12 text-gray-400 mx-auto transform -rotate-45" />
              </div>
              <div className="text-xl font-semibold text-gray-400 mb-2">No transactions found</div>
              <div className="text-gray-500">Try adjusting your filters or search term</div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Total Value Moved</h3>
              <IndianRupee className="h-6 w-6 text-emerald-200" />
            </div>
            <div className="text-3xl font-bold mb-2">Rs.{totalValue.toLocaleString()}</div>
            <div className="text-emerald-200 text-sm">
              Across {filteredHistory.length} transactions
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Average Transaction</h3>
              <BarChart3 className="h-6 w-6 text-blue-200" />
            </div>
            <div className="text-3xl font-bold mb-2">Rs.{avgTransactionValue.toLocaleString()}</div>
            <div className="text-blue-200 text-sm">
              Average value per transaction
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Warehouse Activity</h3>
              <Warehouse className="h-6 w-6 text-purple-200" />
            </div>
            <div className="text-3xl font-bold mb-2">3 Active</div>
            <div className="text-purple-200 text-sm">
              Warehouses with recent activity
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Detail Modal */}
      {isDetailModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Transaction Details</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="font-mono text-lg text-gray-600">{selectedRecord.reference}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedRecord.type === 'in' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedRecord.type === 'in' ? 'Stock In' : 'Stock Out'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => downloadInvoice(selectedRecord)}
                    className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Product Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Package className="h-6 w-6 text-blue-600" />
                      Product Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Product Name</span>
                        <span className="font-bold text-gray-900">{selectedRecord.productName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Product ID</span>
                        <span className="font-mono font-bold text-gray-900">{selectedRecord.productId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Quality Score</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedRecord.qualityScore >= 95 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : selectedRecord.qualityScore >= 90 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {selectedRecord.qualityScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Movement */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Stock Movement</h3>
                    <div className="space-y-6">
                        {(() => {
                          const prev = selectedRecord.previousStock ?? null;
                          const changeKg = selectedRecord.quantity_kg ?? selectedRecord.totalKg ?? 0;
                          const after = selectedRecord.newStock ?? (prev !== null ? (selectedRecord.type === 'in' ? (prev + changeKg) : (prev - changeKg)) : null);
                          const progressDenom = (prev !== null ? (prev + changeKg + 1000) : null);
                          const percentChange = (prev && prev > 0) ? ((changeKg / prev) * 100) : null;

                          return (
                            <>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-white/80 rounded-2xl">
                                  <div className="text-sm text-gray-600 mb-1">Before</div>
                                  <div className="text-2xl font-bold text-gray-900">{prev !== null ? prev.toLocaleString() + ' KG' : 'N/A'}</div>
                                </div>
                                <div className="p-4 bg-white/80 rounded-2xl">
                                  <div className="text-sm text-gray-600 mb-1">Change</div>
                                  <div className={`text-2xl font-bold ${selectedRecord.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {selectedRecord.type === 'in' ? '+' : '-'}{changeKg.toLocaleString()} KG
                                  </div>
                                </div>
                                <div className="p-4 bg-white/80 rounded-2xl">
                                  <div className="text-sm text-gray-600 mb-1">After</div>
                                  <div className="text-2xl font-bold text-blue-600">{after !== null ? after.toLocaleString() + ' KG' : 'N/A'}</div>
                                </div>
                              </div>

                              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                  style={{ 
                                    width: `${progressDenom ? Math.min((after / progressDenom) * 100, 100) : 0}%` 
                                  }}
                                ></div>
                              </div>

                              <div className="text-center text-sm text-gray-600">
                                {percentChange !== null ? `Stock level ${selectedRecord.type === 'in' ? 'increased' : 'decreased'} by ${percentChange.toFixed(1)}%` : 'Stock level change N/A'}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Transaction Details */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Transaction Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Transaction Type</span>
                        <span className="font-bold text-gray-900">{selectedRecord.transactionType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Date & Time</span>
                        <span className="font-bold text-gray-900">
                          {new Date(selectedRecord.created_at || selectedRecord.date || selectedRecord.createdRaw?.created_at || selectedRecord.createdRaw?.timestamp || 0).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Performed By</span>
                        <span className="font-bold text-gray-900">{selectedRecord.user || selectedRecord.performedBy || 'System'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Warehouse</span>
                        <span className="font-bold text-gray-900">{selectedRecord.warehouse}</span>
                      </div>
                      {selectedRecord.supplier && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Supplier</span>
                          <span className="font-bold text-gray-900">{selectedRecord.supplier}</span>
                        </div>
                      )}
                      {selectedRecord.customer && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Customer</span>
                          <span className="font-bold text-gray-900">{selectedRecord.customer}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-600">Total Value</div>
                          <div className="text-4xl font-bold text-gray-900">Rs.{((selectedRecord.totalValue ?? ((selectedRecord.quantity_kg || selectedRecord.totalKg || 0) * (selectedRecord.pricePerKg || selectedRecord.createdRaw?.price_per_kg || 0))).toLocaleString())}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Price per KG</div>
                          <div className="text-2xl font-bold text-amber-600">Rs.{(selectedRecord.pricePerKg || selectedRecord.createdRaw?.price_per_kg || 0)}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/80 rounded-2xl">
                          <div className="text-sm text-gray-600">Quantity</div>
                          <div className="text-xl font-bold text-gray-900">{selectedRecord.quantity} {selectedRecord.unit}</div>
                        </div>
                        <div className="p-4 bg-white/80 rounded-2xl">
                          <div className="text-sm text-gray-600">Total Weight</div>
                          <div className="text-xl font-bold text-gray-900">{((selectedRecord.quantity_kg || selectedRecord.totalKg) || 0).toLocaleString()} KG</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mt-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-600" />
                    Notes & Comments
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedRecord.notes || 'No additional notes provided for this transaction.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-8 py-3 text-gray-700 hover:text-gray-900 font-medium transition"
                >
                  Close
                </button>
                <button
                  onClick={() => printReceipt(selectedRecord)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}