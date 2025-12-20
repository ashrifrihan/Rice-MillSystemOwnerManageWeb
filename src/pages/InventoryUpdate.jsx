import React, { useState } from 'react';
import { 
  Search, 
  ArrowLeft, 
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
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InventoryUpdate() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add');
  const [uploadedImage, setUploadedImage] = useState(null);

  // Form States
  const [newRiceItem, setNewRiceItem] = useState({
    name: '', 
    type: 'Nadu', 
    grade: 'Premium', 
    bags: '', 
    kgPerBag: 50, 
    pricePerKg: '', 
    warehouse: 'Warehouse A',
    minStockLevel: 1000,
    description: ''
  });

  const [stockUpdate, setStockUpdate] = useState({
    itemId: '', 
    transactionType: 'Purchase', 
    quantity: '', 
    unit: 'bags',
    notes: '',
    supplier: '',
    reference: ''
  });

  // Rice types and categories
  const riceTypes = ['Nadu', 'Samba', 'Basmati', 'Jasmine', 'Brown Rice', 'Parboiled', 'Raw Rice', 'Broken Rice'];
  const riceGrades = ['Premium', 'Grade A', 'Grade B', 'Grade C'];
  const warehouses = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Cold Storage', 'Processing Unit'];
  const transactionTypes = ['Purchase', 'Sale', 'Transfer', 'Adjustment', 'Return', 'Quality Rejection'];

  const totalKg = (parseInt(newRiceItem.bags) || 0) * newRiceItem.kgPerBag;
  const totalValue = totalKg * (parseFloat(newRiceItem.pricePerKg) || 0);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Recent rice items for quick selection
  const recentRiceItems = [
    { id: 'RICE001', name: 'Nadu Raw Rice', stock: 7500, warehouse: 'Warehouse A' },
    { id: 'RICE002', name: 'Samba Rice', stock: 1200, warehouse: 'Warehouse B' },
    { id: 'RICE003', name: 'Premium Basmati', stock: 5000, warehouse: 'Warehouse C' },
    { id: 'RICE004', name: 'Brown Rice Organic', stock: 450, warehouse: 'Warehouse A' }
  ];

  // Stats for current operations
  const stats = {
    todayTransactions: 12,
    pendingUpdates: 3,
    avgProcessingTime: '8.5 min'
  };

  const InputField = ({ label, icon: Icon, children, className = '' }) => (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </label>
      )}
      {children}
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Enhanced Header */}
      

      <div className="p-8 space-y-8">
        

        {/* Enhanced Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 px-8 py-6 text-lg font-semibold transition-all flex items-center justify-center gap-3 ${
                activeTab === 'add'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-inner'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
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
              className={`flex-1 px-8 py-6 text-lg font-semibold transition-all flex items-center justify-center gap-3 ${
                activeTab === 'update'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-inner'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
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
                  <InputField label="Rice Name" icon={Package}>
                    <input
                      type="text"
                      placeholder="e.g., Nadu Premium Raw Rice"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.name}
                      onChange={(e) => setNewRiceItem({...newRiceItem, name: e.target.value})}
                    />
                  </InputField>

                  <InputField label="Rice Type" icon={Scale}>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.type}
                      onChange={(e) => setNewRiceItem({...newRiceItem, type: e.target.value})}
                    >
                      {riceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </InputField>

                  <InputField label="Grade" icon={Hash}>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.grade}
                      onChange={(e) => setNewRiceItem({...newRiceItem, grade: e.target.value})}
                    >
                      {riceGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </InputField>

                  <InputField label="Warehouse" icon={Warehouse}>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.warehouse}
                      onChange={(e) => setNewRiceItem({...newRiceItem, warehouse: e.target.value})}
                    >
                      {warehouses.map(wh => (
                        <option key={wh} value={wh}>{wh}</option>
                      ))}
                    </select>
                  </InputField>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Number of Bags">
                      <input
                        type="number"
                        placeholder="e.g., 150"
                        className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                        value={newRiceItem.bags}
                        onChange={(e) => setNewRiceItem({...newRiceItem, bags: e.target.value})}
                      />
                    </InputField>

                    <InputField label="Weight per Bag">
                      <select 
                        className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                        value={newRiceItem.kgPerBag}
                        onChange={(e) => setNewRiceItem({...newRiceItem, kgPerBag: parseInt(e.target.value)})}
                      >
                        <option value="25">25 KG</option>
                        <option value="50">50 KG</option>
                        <option value="100">100 KG</option>
                      </select>
                    </InputField>
                  </div>

                  <InputField label="Price per KG" icon={IndianRupee}>
                    <input
                      type="number"
                      placeholder="e.g., 45.00"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.pricePerKg}
                      onChange={(e) => setNewRiceItem({...newRiceItem, pricePerKg: e.target.value})}
                    />
                  </InputField>

                  <InputField label="Minimum Stock Level" icon={AlertTriangle}>
                    <input
                      type="number"
                      placeholder="e.g., 1000 KG"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={newRiceItem.minStockLevel}
                      onChange={(e) => setNewRiceItem({...newRiceItem, minStockLevel: e.target.value})}
                    />
                  </InputField>
                </div>

                <InputField label="Description (Optional)" className="mt-6">
                  <textarea
                    placeholder="Add any special notes or quality details..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300 resize-none"
                    value={newRiceItem.description}
                    onChange={(e) => setNewRiceItem({...newRiceItem, description: e.target.value})}
                  />
                </InputField>
              </div>

              {/* Image Upload Section */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <ImageIcon className="h-6 w-6 text-green-600" />
                  Rice Image
                </h3>
                <div 
                  className={`relative border-2 ${uploadedImage ? 'border-green-400' : 'border-dashed border-gray-300'} rounded-2xl p-8 text-center hover:border-blue-400 transition-all cursor-pointer group`}
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  
                  {uploadedImage ? (
                    <div className="relative">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        className="w-48 h-48 object-cover rounded-2xl mx-auto shadow-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                        }}
                        className="absolute -top-2 -right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
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

              <button className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-3 group hover:from-blue-700 hover:to-indigo-700">
                <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                Add Rice Item to Inventory
                <CheckCircle className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Summary Preview</h3>
                  <p className="text-blue-100 mb-8">Real-time calculation of your inventory value</p>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-blue-500/30">
                      <div>
                        <p className="text-blue-200 text-sm">Total Bags</p>
                        <p className="text-3xl font-bold mt-1">{newRiceItem.bags || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-200 text-sm">Weight per Bag</p>
                        <p className="text-xl font-bold mt-1">{newRiceItem.kgPerBag} KG</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Total Weight</span>
                        <span className="text-2xl font-bold">{totalKg.toLocaleString()} KG</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Price per KG</span>
                        <span className="text-xl font-bold">₹{newRiceItem.pricePerKg || '0.00'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-8 p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
                      <p className="text-blue-200 text-sm mb-2">Estimated Inventory Value</p>
                      <p className="text-4xl font-bold">₹{totalValue.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-4 text-blue-200 text-sm">
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
                  <InputField label="Select Rice Item" icon={Package}>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={stockUpdate.itemId}
                      onChange={(e) => setStockUpdate({...stockUpdate, itemId: e.target.value})}
                    >
                      <option value="">Select a rice item...</option>
                      {recentRiceItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.stock.toLocaleString()} KG) - {item.warehouse}
                        </option>
                      ))}
                    </select>
                  </InputField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Transaction Type" icon={Truck}>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                        value={stockUpdate.transactionType}
                        onChange={(e) => setStockUpdate({...stockUpdate, transactionType: e.target.value})}
                      >
                        {transactionTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </InputField>

                    <InputField label="Quantity">
                      <div className="flex gap-3">
                        <input
                          type="number"
                          placeholder="e.g., 50"
                          className="flex-1 px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                          value={stockUpdate.quantity}
                          onChange={(e) => setStockUpdate({...stockUpdate, quantity: e.target.value})}
                        />
                        <select 
                          className="px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                          value={stockUpdate.unit}
                          onChange={(e) => setStockUpdate({...stockUpdate, unit: e.target.value})}
                        >
                          <option value="bags">Bags</option>
                          <option value="kg">KG</option>
                          <option value="quintals">Quintals</option>
                        </select>
                      </div>
                    </InputField>
                  </div>

                  <InputField label="Supplier/Customer (Optional)">
                    <input
                      type="text"
                      placeholder="e.g., Supplier name or customer details"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={stockUpdate.supplier}
                      onChange={(e) => setStockUpdate({...stockUpdate, supplier: e.target.value})}
                    />
                  </InputField>

                  <InputField label="Reference Number (Optional)">
                    <input
                      type="text"
                      placeholder="e.g., Invoice # or Receipt #"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                      value={stockUpdate.reference}
                      onChange={(e) => setStockUpdate({...stockUpdate, reference: e.target.value})}
                    />
                  </InputField>

                  <InputField label="Notes (Optional)">
                    <textarea
                      placeholder="Add any special notes about this transaction..."
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300 resize-none"
                      value={stockUpdate.notes}
                      onChange={(e) => setStockUpdate({...stockUpdate, notes: e.target.value})}
                    />
                  </InputField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button className="group py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-3 hover:from-emerald-700 hover:to-teal-700">
                  <Save className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Save Stock Update
                </button>
                <button className="py-4 bg-gray-100 text-gray-700 text-lg font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3">
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
                  <button className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all flex items-center justify-between group">
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
                  
                  <button className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all flex items-center justify-between group">
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
              {stockUpdate.itemId && (
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-xl font-bold mb-6">Selected Item</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100">Current Stock</span>
                      <span className="text-2xl font-bold">7,500 KG</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100">Available Bags</span>
                      <span className="text-xl font-bold">150 bags</span>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-emerald-200 mb-2">
                        <span>Stock Level</span>
                        <span>75%</span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-white to-emerald-200 w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Updates */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Updates</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Nadu Raw Rice</p>
                      <p className="text-sm text-gray-600">+500 KG • 2 hours ago</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Purchase</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Samba Rice</p>
                      <p className="text-sm text-gray-600">-200 KG • 4 hours ago</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Sale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add missing Clock icon component
const Clock = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);