import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  ShoppingCart, 
  User, 
  Search, 
  Calendar,
  Truck,
  Package,
  Percent,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Bell,
  Download,
  Box,
  Tag,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewSale() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  
  const [items, setItems] = useState([
    { 
      id: 1, 
      product: '', 
      qty: '', 
      price: '', 
      total: 0,
      availableStock: 0,
      unit: 'kg'
    }
  ]);

  const products = [
    { name: 'Samba Rice Premium', price: 350, stock: 3500, unit: 'kg', category: 'Premium' },
    { name: 'Nadu Rice', price: 280, stock: 7500, unit: 'kg', category: 'Regular' },
    { name: 'Kekulu Rice', price: 320, stock: 1200, unit: 'kg', category: 'Regular' },
    { name: 'Red Rice', price: 400, stock: 450, unit: 'kg', category: 'Special' },
    { name: 'Basmati Rice', price: 550, stock: 3450, unit: 'kg', category: 'Premium' },
    { name: 'Parboiled Rice', price: 300, stock: 2800, unit: 'kg', category: 'Regular' },
    { name: 'Keeri Samba', price: 380, stock: 1200, unit: 'kg', category: 'Premium' },
    { name: 'Sudu Kakulu', price: 290, stock: 5000, unit: 'kg', category: 'Regular' }
  ];

  const customers = [
    { name: 'Lanka Foods Ltd', type: 'Wholesaler', creditLimit: 5000000, pending: 1250000 },
    { name: 'Cargills Food City', type: 'Retail Chain', creditLimit: 3000000, pending: 450000 },
    { name: 'Keells Super', type: 'Retail Chain', creditLimit: 4000000, pending: 1200000 },
    { name: 'Arpico Supercentre', type: 'Retail Chain', creditLimit: 2500000, pending: 350000 },
    { name: 'Pelwatte Dairy', type: 'Manufacturer', creditLimit: 2000000, pending: 0 },
    { name: 'Ceylon Tea Traders', type: 'Exporter', creditLimit: 10000000, pending: 2500000 },
    { name: 'Colombo Restaurant Group', type: 'Restaurant', creditLimit: 1500000, pending: 450000 },
    { name: 'Galle Fort Hotels', type: 'Hotel', creditLimit: 1800000, pending: 600000 }
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: FileText },
    { id: 'card', name: 'Credit Card', icon: CreditCard },
    { id: 'cheque', name: 'Cheque', icon: FileText },
    { id: 'bank', name: 'Bank Transfer', icon: Download },
    { id: 'credit', name: 'Credit (30 Days)', icon: Tag }
  ];

  const addItem = () => {
    setItems(prev => [...prev, { 
      id: Date.now(), 
      product: '', 
      qty: '', 
      price: '', 
      total: 0,
      availableStock: 0,
      unit: 'kg'
    }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        if (field === 'product') {
          const prod = products.find(p => p.name === value);
          if (prod) {
            updated.price = prod.price.toString();
            updated.availableStock = prod.stock;
            updated.unit = prod.unit;
          }
        }
        
        if (field === 'qty' || field === 'price' || field === 'product') {
          const qty = parseFloat(updated.qty) || 0;
          const price = parseFloat(updated.price) || 0;
          updated.total = qty * price;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const calculateSummary = () => {
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const discount = subtotal * 0.02; // 2% discount
    const vat = (subtotal - discount) * 0.08; // 8% VAT (Sri Lanka)
    const nbt = (subtotal - discount) * 0.02; // 2% NBT (Sri Lanka)
    const total = subtotal + vat + nbt - discount;
    
    const selectedCustomer = customers.find(c => c.name === customer);
    const creditUsed = selectedCustomer ? selectedCustomer.pending + total : total;
    const creditAvailable = selectedCustomer ? selectedCustomer.creditLimit - creditUsed : 0;
    
    return {
      subtotal,
      discount,
      vat,
      nbt,
      total,
      creditUsed,
      creditAvailable,
      creditLimit: selectedCustomer?.creditLimit || 0
    };
  };

  const summary = calculateSummary();

  const getStockStatus = (item) => {
    if (!item.qty || !item.availableStock) return 'neutral';
    const qty = parseFloat(item.qty);
    const available = parseFloat(item.availableStock);
    
    if (qty > available) return 'critical';
    if (qty > available * 0.8) return 'warning';
    return 'good';
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
       

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Customer & Info */}
          <div className="space-y-6">
            {/* Customer Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                Customer Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer
                  </label>
                  <select 
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-gray-300"
                  >
                    <option value="">Choose a customer...</option>
                    {customers.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name} • {c.type}
                      </option>
                    ))}
                  </select>
                </div>

                {customer && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{customer}</p>
                        <p className="text-xs text-gray-600">
                          {customers.find(c => c.name === customer)?.type}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Credit Limit</span>
                        <span className="font-bold">{formatCurrency(summary.creditLimit)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Credit Used</span>
                        <span className="font-bold text-amber-600">{formatCurrency(summary.creditUsed)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Available</span>
                        <span className={`font-bold ${summary.creditAvailable > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(summary.creditAvailable)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Credit Usage</span>
                        <span>{summary.creditLimit > 0 ? ((summary.creditUsed / summary.creditLimit) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${summary.creditAvailable > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${summary.creditLimit > 0 ? Math.min((summary.creditUsed / summary.creditLimit) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Delivery */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment & Delivery</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Sale Date
                  </label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="h-3 w-3 inline mr-1" />
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-2 rounded-lg border transition-all flex items-center justify-center gap-1.5 text-xs ${
                            paymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 text-gray-600'
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="font-medium">{method.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Sale Items */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  Sale Items
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={addItem}
                    className="group px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-gray-50 rounded-lg mb-3 text-xs">
                <div className="col-span-5 font-semibold text-gray-700">Product</div>
                <div className="col-span-2 font-semibold text-gray-700 text-center">Quantity</div>
                <div className="col-span-2 font-semibold text-gray-700 text-center">Unit Price</div>
                <div className="col-span-2 font-semibold text-gray-700 text-center">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <div 
                      key={item.id} 
                      className="grid grid-cols-12 gap-3 p-4 bg-gray-50/50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                    >
                      <div className="col-span-5">
                        <select
                          value={item.product}
                          onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                          className="w-full px-3 py-2.5 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                        >
                          <option value="">Select a product...</option>
                          {products.map(p => (
                            <option key={p.name} value={p.name}>
                              {p.name} • {formatCurrency(p.price)}/{p.unit} • Stock: {p.stock.toLocaleString()} {p.unit}
                            </option>
                          ))}
                        </select>
                        
                        {item.product && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <div className={`w-2 h-2 rounded-full ${
                              stockStatus === 'critical' ? 'bg-red-500' :
                              stockStatus === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                            }`}></div>
                            <span className={`text-xs ${
                              stockStatus === 'critical' ? 'text-red-600' :
                              stockStatus === 'warning' ? 'text-amber-600' : 'text-green-600'
                            }`}>
                              {item.availableStock.toLocaleString()} {item.unit} available
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-2">
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                            className={`w-full px-3 py-2.5 bg-white rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-2 ${
                              stockStatus === 'critical' ? 'focus:ring-red-500 border-red-300' :
                              stockStatus === 'warning' ? 'focus:ring-amber-500 border-amber-300' :
                              'focus:ring-blue-500 border-gray-300'
                            }`}
                          />
                          {item.unit && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                              {item.unit}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="px-3 py-2.5 bg-gray-100 rounded-lg text-sm font-bold text-center">
                          {formatCurrency(item.price || 0)}
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg text-sm font-bold text-center shadow">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                      
                      <div className="col-span-1 flex justify-end">
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Remove item"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notes Section */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add special instructions, delivery notes..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-gray-300 resize-none"
                />
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Invoice Summary</h3>
                  <div className="flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-emerald-200" />
                    <span className="text-emerald-200 text-xs">All amounts in Sri Lankan Rupees</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">Subtotal</span>
                        <span className="text-xl font-bold">{formatCurrency(summary.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">Discount (2%)</span>
                        <span className="font-bold">{formatCurrency(summary.discount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">VAT (8%)</span>
                        <span className="font-bold">{formatCurrency(summary.vat)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">NBT (2%)</span>
                        <span className="font-bold">{formatCurrency(summary.nbt)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                      <div className="text-center">
                        <div className="text-emerald-200 text-xs mb-1">Grand Total</div>
                        <div className="text-3xl font-bold">{formatCurrency(summary.total)}</div>
                      </div>
                      
                      <div className="space-y-2 mt-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-emerald-200">Items</span>
                          <span className="font-bold">{items.filter(i => i.product).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-200">Payment</span>
                          <span className="font-bold">
                            {paymentMethods.find(p => p.id === paymentMethod)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-200">Status</span>
                          <span className="font-bold">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-emerald-400/30">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-emerald-200 text-xs">Total Weight</p>
                        <p className="font-bold">
                          {items.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0).toLocaleString()} kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-200 text-xs">Invoice #</p>
                        <p className="font-bold font-mono">INV-{new Date().getFullYear()}-001</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-emerald-700/40 backdrop-blur border-t border-emerald-400/20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-emerald-200" />
                    <p className="text-emerald-200 text-xs">
                      {summary.creditAvailable < 0 
                        ? 'Credit limit exceeded! Review order.' 
                        : 'Review order before finalizing'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/orders')}
                      className="px-5 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition text-sm"
                    >
                      Cancel
                    </button>
                    <button className="px-5 py-2 bg-white text-emerald-700 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Create Sale Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}