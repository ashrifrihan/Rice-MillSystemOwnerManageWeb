// src/pages/Inventory.jsx
import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  DownloadIcon,
  PackageIcon,
  IndianRupeeIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  BarChart3Icon,
  WarehouseIcon,
  ScaleIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  PieChart,
  Clock,
  Activity,
  Truck,
  Thermometer,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import inventoryService from '../services/inventoryService';
import { seedInventoryData, seedMovementsData } from '../services/seedInventory';
import { useAuth } from '../contexts/AuthContext';
import { filterByOwner, getCurrentUserEmail } from '../utils/firebaseFilters';

export function Inventory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userEmail = getCurrentUserEmail(user);
  
  // State
  const [inventory, setInventory] = useState([]);
  const [kpiCounts, setKpiCounts] = useState({
    totalBags: 0,
    totalKg: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    avgQualityScore: 0,
    inventoryTurnover: 0,
    stockAccuracy: 0,
    activeWarehouses: 0
  });
  const [inventoryDistribution, setInventoryDistribution] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [lowStockPredictions, setLowStockPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [dateRange, setDateRange] = useState('Today');

  // Rice types and categories
  const riceTypes = ['Nadu', 'Samba', 'Raw Rice', 'Broken Rice', 'Basmati', 'Jasmine', 'Brown Rice', 'Parboiled'];
  const riceGrades = ['Premium', 'Grade A', 'Grade B', 'Grade C'];
  const warehouseLocations = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Cold Storage'];

  // Initialize and seed data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Seed initial data if needed
        await seedInventoryData();
        await seedMovementsData();
        
        // Set up real-time listeners with owner filter
        const unsubscribeInventory = inventoryService.subscribeToInventory((data) => {
          // Filter inventory by owner; if empty but data exists, fall back to raw
          const filteredData = filterByOwner(data, userEmail);
          setInventory((filteredData && filteredData.length > 0) ? filteredData : (data || []));
        });
        
        const unsubscribeKPIs = inventoryService.subscribeToKPIs(setKpiCounts);
        
        // Load other data
        loadAdditionalData();
        
        return () => {
          unsubscribeInventory();
          unsubscribeKPIs();
        };
      } catch (error) {
        console.error('Error initializing inventory data:', error);
        toast.error('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      initializeData();
    }
  }, [userEmail]);

  // Load additional data
  const loadAdditionalData = async () => {
    try {
      // Load distribution
      const distribution = await inventoryService.getInventoryDistribution();
      setInventoryDistribution(distribution || []);
      
      // Load movements
      const movements = await inventoryService.getRecentMovements(5);
      setRecentMovements(movements);
      
      // Load low stock predictions
      const predictions = await inventoryService.getLowStockPredictions();
      setLowStockPredictions(predictions);
    } catch (error) {
      console.error('Error loading additional data:', error);
      toast.error('Failed to load inventory analytics');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      await inventoryService.updateKPIs();
      await inventoryService.updateInventoryDistribution();
      await loadAdditionalData();
      toast.success('Inventory data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await inventoryService.deleteInventoryItem(id);
        toast.success(`${name} deleted successfully`);
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      const exportData = {
        inventory,
        kpiCounts,
        distribution: inventoryDistribution,
        movements: recentMovements,
        predictions: lowStockPredictions,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `rice-inventory-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesWarehouse = filterWarehouse === 'All' || item.warehouse === filterWarehouse;
    
    return matchesSearch && matchesType && matchesStatus && matchesWarehouse;
  });

  // Enhanced KPI Card Component
  const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend, unit = "", prefix = "" }) => (
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
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit}
        </h3>
        <p className="text-sm text-gray-600 mt-1 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const config = {
      'In Stock': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircleIcon },
      'Low Stock': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: AlertTriangleIcon },
      'Out of Stock': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircleIcon },
      'Critical': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertTriangleIcon },
      'Receiving': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      'Issuing': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      'Transfer': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
      'High': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
    };
    
    const configItem = config[status] || config['In Stock'];
    const Icon = configItem.icon;
    
    return (
      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${configItem.bg} ${configItem.text} ${configItem.border}`}>
        {Icon && <Icon className="h-3.5 w-3.5 mr-1" />}
        {status}
      </span>
    );
  };

  // Movement type icon
  const MovementIcon = ({ type }) => {
    const icons = {
      'Receiving': ArrowDownRight,
      'Issuing': ArrowUpRight,
      'Transfer': Truck
    };
    const Icon = icons[type] || Truck;
    return <Icon className="h-4 w-4" />;
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">Loading Inventory...</h2>
          <p className="text-gray-500 mt-2">Fetching real-time data from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rice Inventory Management</h1>
          <p className="text-gray-500 mt-2">
            {inventory.length} items • Real-time from Firebase Database • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/update')}
            className="group relative overflow-hidden inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl transition-all"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Stock Update
          </button>
          <button
            onClick={() => navigate('/history')}
            className="group relative overflow-hidden inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-lg transition-all"
          >
            <BarChart3Icon className="h-5 w-5 mr-2" />
            View History
          </button>
          <button
            onClick={handleExport}
            className="group relative overflow-hidden inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 hover:shadow-lg transition-all"
          >
            <DownloadIcon className="h-5 w-5 mr-2" />
            Export Report
          </button>
          <button
            onClick={handleRefresh}
            className="group relative overflow-hidden inline-flex items-center px-6 py-3 border border-blue-300 text-sm font-medium rounded-2xl text-blue-700 bg-blue-50 hover:bg-blue-100 hover:shadow-lg transition-all"
          >
            <Loader2 className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Total Stock Value" 
          value={kpiCounts.totalValue || 0} 
          subtitle="Across all warehouses" 
          icon={IndianRupeeIcon} 
          color="bg-gradient-to-br from-emerald-500 to-teal-600" 
          trend={+12.4} 
          prefix="Rs."
        />
        <KpiCard 
          title="Total Bags" 
          value={kpiCounts.totalBags || 0} 
          subtitle={`${(kpiCounts.totalKg || 0).toLocaleString()} KG total`} 
          icon={PackageIcon} 
          color="bg-gradient-to-br from-amber-500 to-orange-600" 
          trend={+8.2} 
        />
        <KpiCard 
          title="Low Stock Items" 
          value={kpiCounts.lowStockItems || 0} 
          subtitle={`${kpiCounts.outOfStockItems || 0} out of stock`} 
          icon={AlertTriangleIcon} 
          color="bg-gradient-to-br from-red-500 to-rose-600" 
          trend={-3.1}
        />
        <KpiCard 
          title="Stock Accuracy" 
          value={kpiCounts.stockAccuracy || 0} 
          subtitle="Physical vs System" 
          icon={ScaleIcon} 
          color="bg-gradient-to-br from-purple-500 to-pink-600" 
          unit="%"
        />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard 
          title="Avg Quality Score" 
          value={(kpiCounts.avgQualityScore || 0).toFixed(1)} 
          subtitle="Based on inspections" 
          icon={Thermometer} 
          color="bg-gradient-to-br from-cyan-500 to-blue-600" 
          trend={+2.1}
          unit="%"
        />
        <KpiCard 
          title="Inventory Turnover" 
          value={kpiCounts.inventoryTurnover || 0} 
          subtitle="Times per month" 
          icon={TrendingUpIcon} 
          color="bg-gradient-to-br from-green-500 to-emerald-600" 
          trend={+15.7}
        />
        <KpiCard 
          title="Active Warehouses" 
          value={kpiCounts.activeWarehouses || 0} 
          subtitle="All locations" 
          icon={WarehouseIcon} 
          color="bg-gradient-to-br from-violet-500 to-purple-600" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Inventory Distribution */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <PieChart className="w-8 h-8 text-purple-600" />
                Inventory Distribution by Type
              </h2>
              <div className="flex gap-2">
                {["Week", "Month", "Year"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setDateRange(t)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition ${
                      dateRange === t
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 hover:bg-purple-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Pie Chart Visualization */}
              <div className="flex-1">
                <div className="relative w-full h-64 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {inventoryDistribution.map((item, index) => (
                      <div
                        key={item.category}
                        className={`absolute inset-0 rounded-full border-12 ${
                          index === 0 ? 'bg-amber-500' :
                          index === 1 ? 'bg-emerald-500' :
                          index === 2 ? 'bg-purple-500' :
                          index === 3 ? 'bg-orange-500' : 'bg-blue-500'
                        } opacity-70`}
                        style={{
                          clipPath: `circle(50% at 50% 50%)`,
                          transform: `rotate(${index * 72}deg)`,
                          transformOrigin: 'center'
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {(inventoryDistribution.reduce((sum, item) => {
                            const quantity = parseInt(item.quantity.replace(/[^\d]/g, '')) || 0;
                            return sum + quantity;
                          }, 0)).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Distribution List */}
              <div className="flex-1">
                <div className="space-y-4">
                  {inventoryDistribution.length > 0 ? (
                    inventoryDistribution.map((item, index) => (
                      <div key={item.category || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded ${
                            index === 0 ? 'bg-amber-500' :
                            index === 1 ? 'bg-emerald-500' :
                            index === 2 ? 'bg-purple-500' :
                            index === 3 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.category || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{item.items || 0} items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{item.value || 0}%</div>
                          <div className="text-sm text-gray-600">{item.quantity || '0 kg'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No distribution data available
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => inventoryService.updateInventoryDistribution()}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Update Distribution Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Activity className="w-7 h-7 text-blue-600" />
            Recent Stock Movements
          </h3>
          <div className="space-y-4">
            {recentMovements.length > 0 ? (
              recentMovements.map((movement) => (
                <div key={movement.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        movement.type === 'Receiving' ? 'bg-blue-100 text-blue-600' :
                        movement.type === 'Issuing' ? 'bg-purple-100 text-purple-600' :
                        'bg-indigo-100 text-indigo-600'
                      }`}>
                        <MovementIcon type={movement.type} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{movement.itemName || movement.item}</p>
                        <p className="text-xs text-gray-600">ID: {movement.id}</p>
                      </div>
                    </div>
                    <StatusBadge status={movement.type} />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <p className="text-sm text-gray-600">
                        Quantity: <span className="font-bold">{movement.quantity} kg</span>
                      </p>
                      {movement.type === 'Transfer' ? (
                        <p className="text-xs text-gray-500">From {movement.from} to {movement.to}</p>
                      ) : (
                        <p className="text-xs text-gray-500">Warehouse: {movement.warehouse}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(movement.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent movements
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/inventory/history')}
            className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            View All Movements
          </button>
        </div>
      </div>

      {/* AI Low Stock Predictions - Enhanced */}
      {lowStockPredictions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 backdrop-blur-xl rounded-3xl shadow-xl border border-amber-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangleIcon className="h-8 w-8 text-amber-600" />
              <h3 className="text-2xl font-bold text-amber-800">AI Low Stock Predictions</h3>
            </div>
            <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-semibold">
              {lowStockPredictions.length} Critical Items
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {lowStockPredictions.map((item, index) => (
              <div key={index} className="group bg-white/80 rounded-2xl p-6 hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">Type: {item.type}</p>
                  </div>
                  <StatusBadge status={item.riskLevel} />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Current Stock</span>
                      <span className="font-bold text-gray-900">{item.currentStock} kg</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.riskLevel === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${(item.currentStock / item.totalKg) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Predicted Out:</span>
                    <span className="font-bold text-red-600">{item.predictedOutDate}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-bold text-gray-900">{item.confidence}%</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition">
                  Reorder Now →
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-semibold text-gray-900">⚠️ Immediate Action Required</p>
                  <p className="text-sm text-gray-600">These items will run out within 7 days based on current usage</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">
                Bulk Reorder All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-grow">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition" />
              </div>
              <input
                type="text"
                placeholder="Search rice by name, type, or ID..."
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              {riceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
            >
              <option value="All">All Warehouses</option>
              {warehouseLocations.map(wh => (
                <option key={wh} value={wh}>{wh}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Inventory Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Rice Inventory</h3>
            <div className="text-sm text-gray-600">
              Showing {filteredInventory.length} of {inventory.length} items
              {loading && <Loader2 className="inline h-4 w-4 ml-2 animate-spin" />}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rice Details</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock Levels</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Warehouse</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value & Price</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status & Trend</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/30 divide-y divide-gray-200/30">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="relative">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-gray-100"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&size=56`;
                            }}
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center ring-2 ring-gray-100">
                            <PackageIcon className="h-7 w-7 text-blue-600" />
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <PackageIcon className="h-3 w-3 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="inline-block px-2 py-1 bg-gray-100 rounded-lg">{item.type}</span>
                          <span className="inline-block px-2 py-1 bg-gray-100 rounded-lg ml-2">{item.grade}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">ID: {item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-900">
                          {item.currentStock ? item.currentStock.toLocaleString() : 0} KG
                        </span>
                        <span className="text-xs text-gray-500">{item.bags || 0} bags</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            (item.currentStock / (item.totalKg || 1)) > 0.5 ? 'bg-emerald-500' :
                            (item.currentStock / (item.totalKg || 1)) > 0.2 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(((item.currentStock || 0) / (item.totalKg || 1)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Min: {item.minStockLevel || 1000} KG</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <WarehouseIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.warehouse}</div>
                        <div className="text-xs text-gray-500">Last updated: {item.lastUpdated}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        Rs.{((item.currentStock || 0) * (item.pricePerKg || 0)).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Rs.{item.pricePerKg || 0}/KG</div>
                      <div className="text-xs text-gray-500 mt-1">Total value</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <StatusBadge status={item.status} />
                      {item.trend && (
                        <div className={`flex items-center gap-1 text-sm font-semibold ${item.trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.trend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          {Math.abs(item.trend)}% {item.movement}
                        </div>
                      )}
                      {item.qualityScore && (
                        <div className="text-xs text-gray-600">
                          Quality: <span className="font-bold">{item.qualityScore}%</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/update?edit=${item.id}`)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors group"
                        title="Edit stock"
                      >
                        <EditIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => navigate(`/history?item=${item.id}`)}
                        className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors group"
                        title="View history"
                      >
                        <EyeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                        title="Delete item"
                      >
                        <TrashIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl rotate-45"></div>
              <PackageIcon className="relative h-12 w-12 text-gray-400 mx-auto transform -rotate-45" />
            </div>
            <div className="text-xl font-semibold text-gray-400 mb-2">No rice items found</div>
            <div className="text-gray-500">Try adjusting your search or filters</div>
            <button
              onClick={() => navigate('/update')}
              className="mt-4 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Rice Item
            </button>
          </div>
        )}
      </div>

      {/* Database Status */}
      <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-xl rounded-3xl shadow-sm border border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-semibold text-emerald-800">✅ Database Connection Active</p>
              <p className="text-sm text-emerald-600">
                Connected to Firebase • {inventory.length} items • Real-time updates enabled
              </p>
            </div>
          </div>
          <div className="text-xs text-emerald-600">
            Last sync: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}