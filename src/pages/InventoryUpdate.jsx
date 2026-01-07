// src/pages/InventoryUpdate.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Save, 
  Package, 
  Upload, 
  Truck, 
  ShoppingCart, 
  Factory,
  Scale,
  IndianRupee,
  AlertTriangle,
  ChevronRight,
  X,
  Image as ImageIcon,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Hash,
  Loader2,
  Clock,
  RefreshCw,
  Database,
  AlertCircle,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUserEmail } from '../utils/firebaseFilters';
import toast from 'react-hot-toast';
import inventoryUpdateService from '../services/inventoryUpdateService';
import PopupAlert from '../components/ui/PopupAlert';

export default function InventoryUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth?.() || {};
  const userEmail = getCurrentUserEmail(user);
  
  // State
  const [activeTab, setActiveTab] = useState('add');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true); // initialization/loading
  const [savingAdd, setSavingAdd] = useState(false); // saving new product
  const [savingUpdate, setSavingUpdate] = useState(false); // saving stock update
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success', // 'success' or 'error'
    title: '',
    message: '',
    details: []
  });
  const [databaseStatus, setDatabaseStatus] = useState({
    hasProducts: false,
    productCount: 0,
    updateCount: 0,
    seeded: false,
    message: 'Checking Firebase...'
  });

  // Form States
  const [newRiceItem, setNewRiceItem] = useState({
    name: '', 
    type: 'Nadu', 
    grade: 'Premium', 
    bags: '', 
    kgPerBag: 50, 
    price_per_kg: '', 
    warehouse: 'Warehouse A',
    min_stock_level: 1000,
    description: ''
  });

  const [stockUpdate, setStockUpdate] = useState({
    productId: '', 
    transactionType: 'Purchase', 
    quantity: '', 
    unit: 'bags',
    notes: '',
    supplier: '',
    reference: '',
    warehouse: 'Warehouse A'
  });

  // Filtered products for dropdown
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialize and load data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check and seed if empty
      const seedResult = await inventoryUpdateService.seedIfEmpty();
      setDatabaseStatus(seedResult);
      
      if (seedResult.seeded) {
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="font-bold">📊 Database Seeded</div>
            <div className="text-sm">Initial data added to Firebase</div>
          </div>
        );
      }
      
    } catch (error) {
      console.error('Error in initialization:', error);
      setDatabaseStatus({
        hasProducts: false,
        productCount: 0,
        updateCount: 0,
        seeded: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products and updates
  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Load products from Firebase
      const allProducts = await inventoryUpdateService.getAllProducts();
      setProducts(allProducts);
      
      // Load updates from Firebase
      const updates = await inventoryUpdateService.getRecentStockUpdates(5);
      setRecentUpdates(updates);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data from Firebase');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Setup real-time listeners
  useEffect(() => {
    // Initial setup
    initializeData();
    loadData();

    // Real-time listeners
    const unsubscribeProducts = inventoryUpdateService.setupRealtimeListener((updatedProducts) => {
      setProducts(updatedProducts);
      
      // Update selected product if it exists
      if (selectedProduct && updatedProducts.length > 0) {
        const updatedSelected = updatedProducts.find(p => p.id === selectedProduct.id);
        if (updatedSelected) {
          setSelectedProduct(updatedSelected);
        }
      }
    });

    const unsubscribeUpdates = inventoryUpdateService.setupUpdatesListener((updatedUpdates) => {
      setRecentUpdates(updatedUpdates.slice(0, 5));
    });

    // Check for edit parameter
    const params = new URLSearchParams(location.search);
    const editProductId = params.get('edit');
    if (editProductId) {
      inventoryUpdateService.getProductById(editProductId).then(product => {
        if (product) {
          setSelectedProduct(product);
          setActiveTab('update');
          setStockUpdate(prev => ({
            ...prev,
            productId: product.id,
            warehouse: product.warehouse
          }));
        }
      });
    }

    // Cleanup
    return () => {
      unsubscribeProducts();
      unsubscribeUpdates();
    };
  }, [initializeData, loadData, location.search, selectedProduct?.id]);

  // Calculate totals
  const totalKg = (parseInt(newRiceItem.bags) || 0) * newRiceItem.kgPerBag;
  const totalValue = totalKg * (parseFloat(newRiceItem.price_per_kg) || 0);

  // Handle input changes for add form - simplified for better typing
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewRiceItem(prev => ({ ...prev, [name]: value }));
  };

  // Handle input changes for update form - simplified
  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setStockUpdate(prev => ({ ...prev, [name]: value }));
  };

  // Handle image file selection for add form
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Create Base64 preview (this will be stored directly in RTDB)
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result || null);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  // Show modal helper function
  const showModal = (type, title, message, details = []) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      details
    });
  };

  // Close modal helper function
  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Add product to Firebase
  const handleAddRiceItemToDB = async () => {
    try {
      if (!newRiceItem.name.trim()) {
        toast.error('Please enter rice name');
        return;
      }

      if (!newRiceItem.bags || parseInt(newRiceItem.bags) <= 0) {
        toast.error('Please enter valid number of bags');
        return;
      }

      if (!newRiceItem.price_per_kg || parseFloat(newRiceItem.price_per_kg) <= 0) {
        toast.error('Please enter valid price per KG');
        return;
      }

      setSavingAdd(true);
      
      const productData = {
        name: newRiceItem.name.trim(),
        type: newRiceItem.type,
        grade: newRiceItem.grade,
        bags: parseInt(newRiceItem.bags),
        kgPerBag: parseInt(newRiceItem.kgPerBag),
        price_per_kg: parseFloat(newRiceItem.price_per_kg),
        warehouse: newRiceItem.warehouse,
        min_stock_level: parseInt(newRiceItem.min_stock_level) || 1000,
        description: newRiceItem.description.trim(),
        image: uploadedImage || null
      };

      const newProduct = await inventoryUpdateService.addProduct(productData, null, userEmail);
      
      showModal(
        'success',
        '✅ Product Added to Firebase',
        newProduct.name,
        [
          `Stock: ${newProduct.current_stock.toLocaleString()} KG`,
          `Value: Rs.${(newProduct.current_stock * newProduct.price_per_kg).toLocaleString()}`
        ]
      );
      
      // Reset form
      setNewRiceItem({
        name: '', 
        type: 'Nadu', 
        grade: 'Premium', 
        bags: '', 
        kgPerBag: 50, 
        price_per_kg: '', 
        warehouse: 'Warehouse A',
        min_stock_level: 1000,
        description: ''
      });
      setUploadedImage(null);
      
      // Switch to update tab
      setActiveTab('update');
      
    } catch (error) {
      console.error('Failed to add product:', error);
      showModal(
        'error',
        '❌ Firebase Error',
        error.message,
        ['Failed to add product to inventory']
      );
    } finally {
      setSavingAdd(false);
    }
  };

  // Update stock in Firebase
  const handleSaveStockUpdateToDB = async () => {
    try {
      if (!stockUpdate.productId) {
        toast.error('Please select a rice item');
        return;
      }

      if (!stockUpdate.quantity || parseFloat(stockUpdate.quantity) <= 0) {
        toast.error('Please enter valid quantity');
        return;
      }

      setSavingUpdate(true);
      
      const product = products.find(p => p.id === stockUpdate.productId);
      if (!product) {
        toast.error('Selected product not found');
        return;
      }

      const updateData = {
        productId: stockUpdate.productId,
        productName: product.name,
        transactionType: stockUpdate.transactionType,
        quantity: parseFloat(stockUpdate.quantity),
        unit: stockUpdate.unit,
        warehouse: stockUpdate.warehouse,
        supplier: stockUpdate.supplier,
        reference: stockUpdate.reference,
        notes: stockUpdate.notes,
        user: 'System'
      };

      await inventoryUpdateService.recordStockUpdate({ ...updateData, ownerEmail: userEmail });
      
      // Get updated product data
      const updatedProduct = await inventoryUpdateService.getProductById(stockUpdate.productId);
      
      showModal(
        'success',
        '✅ Stock Updated in Firebase',
        product.name,
        [
          `${stockUpdate.transactionType}: ${stockUpdate.quantity} ${stockUpdate.unit}`,
          `New Stock: ${updatedProduct?.current_stock?.toLocaleString() || '0'} KG`
        ]
      );
      
      // Reset form but keep product selected
      setStockUpdate(prev => ({
        ...prev,
        quantity: '',
        notes: '',
        supplier: '',
        reference: ''
      }));
      
      // Update selected product with new data
      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      }
      
    } catch (error) {
      console.error('Failed to save stock update:', error);
      showModal(
        'error',
        '❌ Firebase Error',
        error.message,
        ['Failed to update stock']
      );
    } finally {
      setSavingUpdate(false);
    }
  };

  // Handle product selection from dropdown
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setStockUpdate(prev => ({
      ...prev,
      productId: product.id,
      warehouse: product.warehouse || 'Warehouse A'
    }));
    setShowProductDropdown(false);
    setSearchQuery('');
  };

  // Refresh data manually
  const handleRefresh = async () => {
    await loadData();
    toast.success('Data refreshed from Firebase!');
  };

  // Get stock status color
  const getStockStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'low_stock': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      case 'out_of_stock': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  // Get stock status text
  const getStockStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'warning': return 'Warning';
      case 'low_stock': return 'Low Stock';
      case 'critical': return 'Critical';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  // Calculate real stats from Firebase data
  const stats = {
    todayTransactions: recentUpdates.filter(update => {
      if (!update.created_at) return false;
      const updateDate = new Date(update.created_at);
      const today = new Date();
      return updateDate.toDateString() === today.toDateString();
    }).length,
    totalProducts: products.length,
    totalStock: products.reduce((sum, product) => sum + (parseFloat(product.current_stock) || 0), 0),
    lowStockItems: products.filter(p => 
      ['low_stock', 'critical', 'out_of_stock'].includes(p.stock_status)
    ).length,
    totalValue: products.reduce((sum, product) => {
      const stock = parseFloat(product.current_stock) || 0;
      const price = parseFloat(product.price_per_kg) || 0;
      return sum + (stock * price);
    }, 0)
  };

  // Custom Input Field Component - FIXED
  const InputField = ({ label, icon: Icon, children, className = '', htmlFor }) => (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </label>
      )}
      {children}
    </div>
  );

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${
          color === 'blue' ? 'bg-blue-100 text-blue-600' :
          color === 'green' ? 'bg-green-100 text-green-600' :
          color === 'amber' ? 'bg-amber-100 text-amber-600' :
          'bg-purple-100 text-purple-600'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">Connecting to Firebase...</h2>
          <p className="text-gray-500 mt-2">Loading real-time inventory data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="p-8 space-y-8">
        {/* Firebase Status Banner */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-lg border p-6 ${
          databaseStatus.hasProducts 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${
                databaseStatus.hasProducts 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-amber-100 text-amber-600'
              }`}>
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {databaseStatus.hasProducts ? '✅ Firebase Connected' : '⚠️ Database Empty'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {databaseStatus.message}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {databaseStatus.productCount} Products
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {databaseStatus.updateCount} Updates
                  </span>
                  {databaseStatus.seeded && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Auto-seeded
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards - Real Data from Firebase */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="Total Products" 
            value={stats.totalProducts} 
            icon={Package} 
            color="blue"
            subtitle="Active inventory items"
          />
          
          <StatCard 
            title="Total Stock" 
            value={(stats.totalStock / 1000).toFixed(1) + 'K KG'} 
            icon={BarChart3} 
            color="green"
            subtitle="Current inventory weight"
          />
          
          <StatCard 
            title="Low Stock Items" 
            value={stats.lowStockItems} 
            icon={AlertCircle} 
            color="amber"
            subtitle="Need attention"
          />
          
          <StatCard 
            title="Today's Updates" 
            value={stats.todayTransactions} 
            icon={Clock} 
            color="purple"
            subtitle="Transactions today"
          />
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('add')}
              disabled={loading}
              className={`flex-1 px-8 py-6 text-lg font-semibold transition-all flex items-center justify-center gap-3 ${
                activeTab === 'add'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-inner'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`p-2 rounded-xl ${activeTab === 'add' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div>Add New Rice Item</div>
                <div className={`text-sm ${activeTab === 'add' ? 'text-blue-100' : 'text-gray-500'}`}>
                  Register new rice stock
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('update')}
              disabled={loading}
              className={`flex-1 px-8 py-6 text-lg font-semibold transition-all flex items-center justify-center gap-3 ${
                activeTab === 'update'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-inner'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`p-2 rounded-xl ${activeTab === 'update' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600'}`}>
                <Package className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div>Update Stock Levels</div>
                <div className={`text-sm ${activeTab === 'update' ? 'text-emerald-100' : 'text-gray-500'}`}>
                  Modify existing inventory
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Add New Rice Item */}
        {activeTab === 'add' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  Create New Rice Item
                </h2>
                <p className="text-gray-600 mb-8">Register new rice stock with complete details</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Rice Name" icon={Package} htmlFor="name">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g., Nadu Premium Raw Rice"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.name}
                      onChange={handleAddFormChange}
                      disabled={savingAdd}
                    />
                  </InputField>

                  <InputField label="Rice Type" icon={Scale} htmlFor="type">
                    <select 
                      id="type"
                      name="type"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.type}
                      onChange={handleAddFormChange}
                      disabled={savingAdd}
                    >
                      {inventoryUpdateService.getRiceTypes().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </InputField>

                  <InputField label="Grade" icon={Hash} htmlFor="grade">
                    <select 
                      id="grade"
                      name="grade"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.grade}
                      onChange={handleAddFormChange}
                      disabled={savingAdd}
                    >
                      {inventoryUpdateService.getRiceGrades().map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </InputField>

                  <InputField label="Warehouse" icon={Warehouse} htmlFor="warehouse">
                    <select 
                      id="warehouse"
                      name="warehouse"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.warehouse}
                      onChange={handleAddFormChange}
                      disabled={savingAdd}
                    >
                      {inventoryUpdateService.getWarehouseLocations().map(wh => (
                        <option key={wh} value={wh}>{wh}</option>
                      ))}
                    </select>
                  </InputField>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Number of Bags" htmlFor="bags">
                      <input
                        id="bags"
                        name="bags"
                        type="number"
                        min="1"
                        inputMode="numeric"
                        placeholder="e.g., 150"
                        className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                        value={newRiceItem.bags}
                        onChange={handleAddFormChange}
                        disabled={savingAdd}
                      />
                    </InputField>

                    <InputField label="Weight per Bag" htmlFor="kgPerBag">
                      <select 
                        id="kgPerBag"
                        name="kgPerBag"
                        className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                        value={newRiceItem.kgPerBag}
                        onChange={handleAddFormChange}
                        disabled={savingAdd}
                      >
                        <option value="25">25 KG</option>
                        <option value="50">50 KG</option>
                        <option value="100">100 KG</option>
                      </select>
                    </InputField>
                  </div>

                  <InputField label="Price per KG" icon={IndianRupee} htmlFor="price_per_kg">
                    <input
                      id="price_per_kg"
                      name="price_per_kg"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="e.g., 45.00"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.price_per_kg}
                      onChange={handleAddFormChange}
                      disabled={savingAdd}
                    />
                  </InputField>

                  <InputField label="Minimum Stock Level" icon={AlertTriangle} htmlFor="min_stock_level">
                    <input
                      id="min_stock_level"
                      name="min_stock_level"
                      type="number"
                      min="100"
                      inputMode="numeric"
                      placeholder="e.g., 1000 KG"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.min_stock_level}
                      onChange={handleAddFormChange}
                      disabled={savingAdd}
                    />
                  </InputField>
                </div>

                <InputField label="Description (Optional)" className="mt-6" htmlFor="description">
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Add any special notes or quality details..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300 resize-none"
                    value={newRiceItem.description}
                    onChange={handleAddFormChange}
                    disabled={savingAdd}
                  />
                </InputField>
              </div>

              {/* Image Upload Section */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <ImageIcon className="h-6 w-6 text-green-600" />
                  Rice Image (Optional)
                </h3>
                <div 
                  className={`relative border-2 ${uploadedImage ? 'border-green-400' : 'border-dashed border-gray-300'} rounded-2xl p-8 text-center hover:border-blue-400 transition-all cursor-pointer group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !loading && document.getElementById('image-upload').click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={savingAdd}
                  />
                  
                  {uploadedImage ? (
                    <div className="relative">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        className="w-48 h-48 object-cover rounded-2xl mx-auto shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                        }}
                        className="absolute -top-2 -right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                        disabled={savingAdd}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-12 h-12 text-green-400 group-hover:text-green-600 transition" />
                      </div>
                      <p className="text-lg font-semibold text-gray-700">Drop rice image here</p>
                      <p className="text-gray-500 mt-2">or click to browse</p>
                      <p className="text-sm text-gray-400 mt-4">Supports JPG, PNG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <button 
                onClick={handleAddRiceItemToDB} 
                disabled={savingAdd || !newRiceItem.name || !newRiceItem.bags || !newRiceItem.price_per_kg}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-3 group hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingAdd ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Adding Rice Item...
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                    Add Rice Item to Inventory
                    <CheckCircle className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Summary Preview</h3>
                  <p className="text-emerald-100 mb-8">Real-time calculation of your inventory value</p>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-emerald-500/30">
                      <div>
                        <p className="text-emerald-200 text-sm">Total Bags</p>
                        <p className="text-3xl font-bold mt-1">{newRiceItem.bags || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-200 text-sm">Weight per Bag</p>
                        <p className="text-xl font-bold mt-1">{newRiceItem.kgPerBag} KG</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-emerald-200">Total Weight</span>
                        <span className="text-2xl font-bold">{totalKg.toLocaleString()} KG</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-200">Price per KG</span>
                        <span className="text-xl font-bold">Rs.{newRiceItem.price_per_kg || '0.00'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-8 p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
                      <p className="text-emerald-200 text-sm mb-2">Estimated Inventory Value</p>
                      <p className="text-4xl font-bold">Rs.{totalValue.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-4 text-emerald-200 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Ready to add to inventory
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-sm rounded-3xl p-6 border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Quick Tips
                </h4>
                <ul className="space-y-3 text-sm text-amber-700">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    Always verify rice type and grade
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    Set appropriate minimum stock levels
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    Upload clear photos for quality verification
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Update Stock Tab */}
        {activeTab === 'update' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Update Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  Update Stock Levels
                </h2>
                <p className="text-gray-600 mb-8">Modify existing inventory with transaction details</p>

                <div className="space-y-6">
                  {/* Product Selection Dropdown */}
                  <InputField label="Select Rice Item" icon={Package}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowProductDropdown(!showProductDropdown)}
                        className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300 flex items-center justify-between"
                        disabled={savingUpdate || products.length === 0}
                      >
                        <div className="flex items-center gap-3">
                          {selectedProduct ? (
                            <>
                              {selectedProduct.image && (
                                <img 
                                  src={selectedProduct.image} 
                                  alt={selectedProduct.name}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                              )}
                              <div className="text-left">
                                <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                                <div className="text-sm text-gray-600">
                                  {selectedProduct.current_stock?.toLocaleString()} KG • {selectedProduct.warehouse}
                                </div>
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-500">Select a rice item...</span>
                          )}
                        </div>
                        {showProductDropdown ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      {showProductDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-auto">
                          {/* Search Box */}
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                              />
                            </div>
                          </div>
                          
                          {/* Product List */}
                          <div className="py-2">
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => handleProductSelect(product)}
                                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-all border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex-shrink-0">
                                    {product.image ? (
                                      <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                                        <Package className="h-6 w-6 text-emerald-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {product.type} • {product.grade}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.stock_status)}`}>
                                        {getStockStatusText(product.stock_status)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {product.current_stock?.toLocaleString()} KG
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Rs.{product.price_per_kg}/KG
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                      {product.warehouse}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {Math.floor((product.current_stock || 0) / (product.kgPerBag || 50))} bags
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-8 text-center text-gray-500">
                                <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                <p>No products found</p>
                                <p className="text-sm mt-1">Try a different search term</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </InputField>

                  {selectedProduct && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedProduct.image ? (
                            <img 
                              src={selectedProduct.image} 
                              alt={selectedProduct.name}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                              <Package className="h-8 w-8 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-gray-900">{selectedProduct.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">{selectedProduct.type} • {selectedProduct.grade}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(selectedProduct.stock_status)}`}>
                                {getStockStatusText(selectedProduct.stock_status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-gray-700">
                                <span className="font-bold">{selectedProduct.current_stock?.toLocaleString()}</span> KG
                              </span>
                              <span className="text-gray-700">
                                <span className="font-bold">{Math.floor((selectedProduct.current_stock || 0) / (selectedProduct.kgPerBag || 50))}</span> bags
                              </span>
                              <span className="text-gray-700">
                                Rs.<span className="font-bold">{selectedProduct.price_per_kg}</span>/KG
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(null);
                            setStockUpdate(prev => ({ ...prev, productId: '' }));
                          }}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Transaction Type" icon={Truck}>
                      <select 
                        name="transactionType"
                        className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                        value={stockUpdate.transactionType}
                        onChange={handleUpdateFormChange}
                        disabled={savingUpdate || !selectedProduct}
                      >
                        {inventoryUpdateService.getTransactionTypes().map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </InputField>

                    <InputField label="Quantity">
                      <div className="flex gap-3">
                        <input
                          name="quantity"
                          type="number"
                          min="0.01"
                          step="0.01"
                          inputMode="decimal"
                          placeholder="e.g., 50"
                          className="flex-1 px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                          value={stockUpdate.quantity}
                          onChange={handleUpdateFormChange}
                          disabled={savingUpdate || !selectedProduct}
                        />
                        <select 
                          name="unit"
                          className="px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                          value={stockUpdate.unit}
                          onChange={handleUpdateFormChange}
                          disabled={savingUpdate || !selectedProduct}
                        >
                          <option value="bags">Bags</option>
                          <option value="kg">KG</option>
                          <option value="quintals">Quintals</option>
                        </select>
                      </div>
                    </InputField>
                  </div>

                  <InputField label="Warehouse" icon={Warehouse}>
                    <select 
                      name="warehouse"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={stockUpdate.warehouse}
                      onChange={handleUpdateFormChange}
                      disabled={savingUpdate || !selectedProduct}
                    >
                      {inventoryUpdateService.getWarehouseLocations().map(wh => (
                        <option key={wh} value={wh}>{wh}</option>
                      ))}
                    </select>
                  </InputField>

                  <InputField label="Supplier/Customer (Optional)">
                    <input
                      name="supplier"
                      type="text"
                      placeholder="e.g., Supplier name or customer details"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={stockUpdate.supplier}
                      onChange={handleUpdateFormChange}
                      disabled={savingUpdate || !selectedProduct}
                    />
                  </InputField>

                  <InputField label="Reference Number (Optional)">
                    <input
                      name="reference"
                      type="text"
                      placeholder="e.g., Invoice # or Receipt #"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={stockUpdate.reference}
                      onChange={handleUpdateFormChange}
                      disabled={savingUpdate || !selectedProduct}
                    />
                  </InputField>

                  <InputField label="Notes (Optional)">
                    <textarea
                      name="notes"
                      placeholder="Add any special notes about this transaction..."
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300 resize-none"
                      value={stockUpdate.notes}
                      onChange={handleUpdateFormChange}
                      disabled={savingUpdate || !selectedProduct}
                    />
                  </InputField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button 
                  type="button" 
                  onClick={handleSaveStockUpdateToDB} 
                  disabled={savingUpdate || !selectedProduct || !stockUpdate.quantity}
                  className="group py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-3 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingUpdate ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                      Save Stock Update
                    </>
                  )}
                </button>
                <button 
                  onClick={() => navigate('/inventory')}
                  className="py-4 bg-gray-100 text-gray-700 text-lg font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
                >
                  <X className="h-6 w-6" />
                  Cancel
                </button>
              </div>
            </div>

            {/* Quick Actions & Preview */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      if (selectedProduct) {
                        setStockUpdate(prev => ({...prev, transactionType: 'Purchase'}));
                        toast.success('Set to Purchase mode');
                      } else {
                        toast.error('Please select a product first');
                      }
                    }}
                    className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Quick Purchase</div>
                        <div className="text-sm text-gray-600">Add incoming stock</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (selectedProduct) {
                        setStockUpdate(prev => ({...prev, transactionType: 'Sale'}));
                        toast.success('Set to Sale mode');
                      } else {
                        toast.error('Please select a product first');
                      }
                    }}
                    className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Quick Sale</div>
                        <div className="text-sm text-gray-600">Record sales transaction</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
                  </button>
                </div>
              </div>

              {/* Selected Item Preview */}
              {selectedProduct && (
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-xl font-bold mb-6">Stock Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100">Current Stock</span>
                      <span className="text-2xl font-bold">
                        {selectedProduct.current_stock?.toLocaleString() || 0} KG
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100">Available Bags</span>
                      <span className="text-xl font-bold">
                        {Math.floor((selectedProduct.current_stock || 0) / (selectedProduct.kgPerBag || 50))} bags
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100">Price per KG</span>
                      <span className="text-xl font-bold">
                        Rs.{selectedProduct.price_per_kg || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100">Stock Value</span>
                      <span className="text-xl font-bold">
                        Rs.{((selectedProduct.current_stock || 0) * (selectedProduct.price_per_kg || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-emerald-200 mb-2">
                        <span>Stock Level</span>
                        <span>
                          {selectedProduct.min_stock_level ? 
                            Math.min(Math.round(((selectedProduct.current_stock || 0) / selectedProduct.min_stock_level) * 100), 100) : 0
                          }%
                        </span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            selectedProduct.stock_status === 'available' ? 'bg-gradient-to-r from-white to-emerald-200' :
                            selectedProduct.stock_status === 'warning' ? 'bg-yellow-400' :
                            selectedProduct.stock_status === 'low_stock' ? 'bg-orange-400' :
                            selectedProduct.stock_status === 'critical' ? 'bg-red-400' : 'bg-gray-400'
                          }`}
                          style={{ 
                            width: `${Math.min(
                              selectedProduct.min_stock_level ? 
                                ((selectedProduct.current_stock || 0) / selectedProduct.min_stock_level) * 100 : 0, 
                              100
                            )}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-emerald-200 mt-2">
                        <span>0%</span>
                        <span>Min: {selectedProduct.min_stock_level} KG</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Updates from Firebase */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Updates</h3>
                <div className="space-y-4 max-h-80 overflow-auto">
                  {recentUpdates.length > 0 ? (
                    recentUpdates.map((update) => (
                      <div key={update.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            update.transactionType === 'Purchase' || update.transactionType === 'Return' || update.transactionType === 'Initial Stock' ? 
                            'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {update.transactionType === 'Purchase' || update.transactionType === 'Initial Stock' ? (
                              <Truck className="h-4 w-4" />
                            ) : update.transactionType === 'Sale' ? (
                              <ShoppingCart className="h-4 w-4" />
                            ) : (
                              <Package className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{update.productName}</p>
                            <p className="text-sm text-gray-600">
                              {update.quantity} {update.unit} • {update.warehouse}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          update.transactionType === 'Purchase' || update.transactionType === 'Return' || update.transactionType === 'Initial Stock' ? 
                          'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {update.transactionType}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p>No recent updates</p>
                      <p className="text-sm mt-1">Transactions will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database Footer */}
      <div className="mt-8 p-4 mx-8 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-xl rounded-3xl shadow-sm border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-semibold text-blue-800">✅ Connected to Firebase Realtime Database</p>
              <p className="text-sm text-blue-600">
                {products.length} products • {recentUpdates.length} updates • Real-time sync
              </p>
            </div>
          </div>
          <div className="text-xs text-blue-600">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <PopupAlert
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        details={modal.details}
        onClose={closeModal}
      />
    </div>
  );
}