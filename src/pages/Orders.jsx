import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  User, 
  Clock, 
  Calendar, 
  Package, 
  Truck, 
  Factory,
  IndianRupee,
  AlertTriangle,
  ChevronRight,
  Download,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  BarChart3,
  Check,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Warehouse,
  Scale,
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ShoppingBag,
  FileText,
  MoreVertical,
  ArrowUpDown
} from 'lucide-react';

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionOrder, setActionOrder] = useState(null);
  const [actionType, setActionType] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('All');

  // Mock dealer-placed orders (awaiting approval)
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: 'ORD-2025-0481',
      dealerName: 'Sharma Foods Ltd',
      dealerId: 'DLR-102',
      dealerContact: '+91 98765 43210',
      dealerEmail: 'sharma@foods.com',
      dealerAddress: '123 Market Road, Mumbai - 400001',
      placedBy: 'Rajesh Sharma',
      placedOn: '2025-03-14T10:30:00',
      items: [
        { name: 'Nadu Rice', quantity: 50, unit: 'bags', price: 3800, subtotal: 190000 },
        { name: 'Samba Rice', quantity: 30, unit: 'bags', price: 3200, subtotal: 96000 }
      ],
      totalAmount: 286000,
      deliveryAddress: '123 Market Road, Mumbai - 400001',
      deliveryDate: '2025-03-16',
      notes: 'Urgent delivery requested for restaurant opening',
      paymentTerms: '50% advance, 50% on delivery',
      creditLimit: 500000,
      creditUsed: 285000,
      creditAvailable: 215000,
      previousOrders: 12,
      avgOrderValue: 235000,
      loyaltyTier: 'Platinum',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'ORD-2025-0482',
      dealerName: 'Patel Grocery Chain',
      dealerId: 'DLR-108',
      dealerContact: '+91 98765 43211',
      dealerEmail: 'patel@groceries.com',
      dealerAddress: 'Gandhi Nagar, Ahmedabad - 380001',
      placedBy: 'Anil Patel',
      placedOn: '2025-03-14T14:15:00',
      items: [
        { name: 'Basmati Premium', quantity: 40, unit: 'bags', price: 8500, subtotal: 340000 },
        { name: 'Brown Rice', quantity: 20, unit: 'bags', price: 3600, subtotal: 72000 }
      ],
      totalAmount: 412000,
      deliveryAddress: 'Gandhi Nagar, Ahmedabad - 380001',
      deliveryDate: '2025-03-18',
      notes: 'Payment on delivery, requires quality certificate',
      paymentTerms: '100% on delivery',
      creditLimit: 300000,
      creditUsed: 45000,
      creditAvailable: 255000,
      previousOrders: 8,
      avgOrderValue: 185000,
      loyaltyTier: 'Gold',
      status: 'pending',
      priority: 'normal'
    },
    {
      id: 'ORD-2025-0483',
      dealerName: 'Singh Exports',
      dealerId: 'DLR-095',
      dealerContact: '+91 98765 43212',
      dealerEmail: 'singh@exports.com',
      dealerAddress: 'Industrial Area, Delhi - 110001',
      placedBy: 'Gurpreet Singh',
      placedOn: '2025-03-13T09:45:00',
      items: [
        { name: 'Jasmine Rice', quantity: 60, unit: 'bags', price: 6300, subtotal: 378000 }
      ],
      totalAmount: 378000,
      deliveryAddress: 'Port Warehouse, Mumbai - 400001',
      deliveryDate: '2025-03-20',
      notes: 'Export quality required, needs phytosanitary certificate',
      paymentTerms: '30 days credit',
      creditLimit: 1000000,
      creditUsed: 250000,
      creditAvailable: 750000,
      previousOrders: 25,
      avgOrderValue: 420000,
      loyaltyTier: 'Platinum',
      status: 'pending',
      priority: 'medium'
    }
  ]);

  const [approvedOrders, setApprovedOrders] = useState([
    {
      id: 'ORD-2025-0479',
      dealerName: 'Gupta Wholesalers',
      dealerId: 'DLR-087',
      placedBy: 'Sanjay Gupta',
      placedOn: '2025-03-13T11:20:00',
      approvedBy: 'Rice Mill Owner',
      approvedOn: '2025-03-13T16:20:00',
      items: [
        { name: 'Raw Paddy', quantity: 100, unit: 'quintals', price: 3200, subtotal: 320000 }
      ],
      totalAmount: 320000,
      status: 'approved',
      productionStatus: 'processing',
      expectedDelivery: '2025-03-18',
      paymentStatus: 'pending'
    },
    {
      id: 'ORD-2025-0478',
      dealerName: 'Kumar Restaurants',
      dealerId: 'DLR-091',
      placedBy: 'Vikram Kumar',
      placedOn: '2025-03-12T15:45:00',
      approvedBy: 'Rice Mill Owner',
      approvedOn: '2025-03-12T17:30:00',
      items: [
        { name: 'Premium Basmati', quantity: 25, unit: 'bags', price: 9500, subtotal: 237500 }
      ],
      totalAmount: 237500,
      status: 'approved',
      productionStatus: 'completed',
      expectedDelivery: '2025-03-15',
      paymentStatus: 'paid'
    },
    {
      id: 'ORD-2025-0477',
      dealerName: 'Sharma Foods Ltd',
      dealerId: 'DLR-102',
      placedBy: 'Rajesh Sharma',
      placedOn: '2025-03-11T10:15:00',
      approvedBy: 'Rice Mill Owner',
      approvedOn: '2025-03-11T14:45:00',
      items: [
        { name: 'Brown Rice', quantity: 35, unit: 'bags', price: 3600, subtotal: 126000 },
        { name: 'Nadu Rice', quantity: 45, unit: 'bags', price: 3800, subtotal: 171000 }
      ],
      totalAmount: 297000,
      status: 'approved',
      productionStatus: 'packaging',
      expectedDelivery: '2025-03-14',
      paymentStatus: 'partial'
    }
  ]);

  const [rejectedOrders, setRejectedOrders] = useState([
    {
      id: 'ORD-2025-0476',
      dealerName: 'Patel Grocery Chain',
      dealerId: 'DLR-108',
      placedBy: 'Anil Patel',
      placedOn: '2025-03-10T16:30:00',
      rejectedBy: 'Rice Mill Owner',
      rejectedOn: '2025-03-11T10:15:00',
      items: [
        { name: 'Premium Basmati', quantity: 25, unit: 'bags', price: 9500, subtotal: 237500 }
      ],
      totalAmount: 237500,
      status: 'rejected',
      reason: 'Credit limit exceeded',
      notes: 'Customer needs to clear outstanding payment'
    },
    {
      id: 'ORD-2025-0475',
      dealerName: 'Singh Exports',
      dealerId: 'DLR-095',
      placedBy: 'Gurpreet Singh',
      placedOn: '2025-03-09T14:20:00',
      rejectedBy: 'Rice Mill Owner',
      rejectedOn: '2025-03-09T16:45:00',
      items: [
        { name: 'Jasmine Rice', quantity: 75, unit: 'bags', price: 6300, subtotal: 472500 }
      ],
      totalAmount: 472500,
      status: 'rejected',
      reason: 'Insufficient stock',
      notes: 'Will be available next week'
    }
  ]);

  useEffect(() => {
    // In a real app, you would fetch orders from API here
  }, []);

  const handleApproveOrder = (orderId) => {
    const orderToApprove = pendingOrders.find(order => order.id === orderId);
    if (orderToApprove) {
      const approvedOrder = {
        ...orderToApprove,
        status: 'approved',
        approvedBy: 'Rice Mill Owner',
        approvedOn: new Date().toISOString(),
        productionStatus: 'pending',
        paymentStatus: 'pending'
      };
      
      setPendingOrders(prev => prev.filter(order => order.id !== orderId));
      setApprovedOrders(prev => [approvedOrder, ...prev]);
      setIsDetailModalOpen(false);
    }
  };

  const handleRejectOrder = (orderId, reason) => {
    const orderToReject = pendingOrders.find(order => order.id === orderId);
    if (orderToReject) {
      const rejectedOrder = {
        ...orderToReject,
        status: 'rejected',
        rejectedBy: 'Rice Mill Owner',
        rejectedOn: new Date().toISOString(),
        reason: reason
      };
      
      setPendingOrders(prev => prev.filter(order => order.id !== orderId));
      setRejectedOrders(prev => [rejectedOrder, ...prev]);
      setIsConfirmModalOpen(false);
      setRejectReason('');
    }
  };

  const openConfirmModal = (order, type) => {
    setActionOrder(order);
    setActionType(type);
    setIsConfirmModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'High' },
      medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Medium' },
      normal: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Normal' }
    };
    const configItem = config[priority] || config.normal;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${configItem.bg} ${configItem.text} ${configItem.border}`}>
        {configItem.label} Priority
      </span>
    );
  };

  const getTierBadge = (tier) => {
    const config = {
      Platinum: { bg: 'bg-gradient-to-r from-gray-700 to-gray-900', text: 'text-white', label: 'Platinum' },
      Gold: { bg: 'bg-gradient-to-r from-amber-500 to-yellow-600', text: 'text-white', label: 'Gold' },
      Silver: { bg: 'bg-gradient-to-r from-gray-400 to-gray-600', text: 'text-white', label: 'Silver' }
    };
    const configItem = config[tier] || { bg: 'bg-gray-100', text: 'text-gray-700', label: tier };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${configItem.bg} ${configItem.text}`}>
        {configItem.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: XCircle }
    };
    const configItem = config[status] || config.pending;
    const Icon = configItem.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${configItem.bg} ${configItem.text} ${configItem.border}`}>
        <Icon className="h-3.5 w-3.5 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Filtering and sorting
  const getFilteredOrders = () => {
    let orders = [];
    switch(viewMode) {
      case 'pending': orders = pendingOrders; break;
      case 'approved': orders = approvedOrders; break;
      case 'rejected': orders = rejectedOrders; break;
      default: orders = [];
    }

    let filtered = orders.filter(order => 
      order.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.placedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply additional status filter for table views
    if (viewMode === 'approved' && filterStatus !== 'All') {
      filtered = filtered.filter(order => order.productionStatus === filterStatus.toLowerCase());
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredOrders = getFilteredOrders();
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const stats = {
    pending: pendingOrders.length,
    approved: approvedOrders.length,
    rejected: rejectedOrders.length,
    totalValue: pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0) +
                approvedOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    avgApprovalTime: '2.4 hours'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Enhanced Header */}
      

      <div className="p-8 space-y-8">
        {/* Stats Overview */}
          

        {/* View Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => {
                setViewMode('pending');
                setCurrentPage(1);
              }}
              className={`flex-1 px-8 py-6 text-lg font-semibold transition-all flex items-center justify-center gap-3 ${
                viewMode === 'pending'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-inner'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-xl ${viewMode === 'pending' ? 'bg-white/20' : 'bg-amber-100 text-amber-600'}`}>
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div>Pending Approval</div>
                <div className={`text-sm ${viewMode === 'pending' ? 'text-amber-100' : 'text-gray-500'}`}>
                  {pendingOrders.length} orders waiting
                </div>
              </div>
            </button>
            <button
              onClick={() => {
                setViewMode('approved');
                setCurrentPage(1);
              }}
              className={`flex-1 px-8 py-6 text-lg font-semibold transition-all flex items-center justify-center gap-3 ${
                viewMode === 'approved'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-inner'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-xl ${viewMode === 'approved' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600'}`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div>Approved Orders</div>
                <div className={`text-sm ${viewMode === 'approved' ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {approvedOrders.length} work orders
                </div>
              </div>
            </button>
            <button
              onClick={() => {
                setViewMode('rejected');
                setCurrentPage(1);
              }}
              className={`flex-1 px-8 py-6 text-lg font-semibold transition-all flex items-center justify-center gap-3 ${
                viewMode === 'rejected'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-inner'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-xl ${viewMode === 'rejected' ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>
                <XCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div>Rejected Orders</div>
                <div className={`text-sm ${viewMode === 'rejected' ? 'text-red-100' : 'text-gray-500'}`}>
                  {rejectedOrders.length} declined orders
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Pending Orders View (Detailed Cards) */}
        {viewMode === 'pending' && (
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Clear!</h3>
                <p className="text-gray-600">No pending orders requiring approval</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl">
                          <Package className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">#{order.id}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            {getPriorityBadge(order.priority)}
                            {getTierBadge(order.loyaltyTier)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                        <p className="text-gray-600">Placed on {formatDate(order.placedOn)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Dealer Information */}
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Dealer Details
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600">Dealer Name</p>
                              <p className="font-bold text-lg text-gray-900">{order.dealerName}</p>
                              <p className="text-sm text-gray-500">ID: {order.dealerId}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{order.dealerContact}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{order.dealerEmail}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                              <span className="text-sm">{order.dealerAddress}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5">
                          <h4 className="text-lg font-bold text-gray-900 mb-4">Credit Status</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Credit Limit</span>
                              <span className="font-bold">₹{order.creditLimit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Credit Used</span>
                              <span className="font-bold text-amber-600">₹{order.creditUsed.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Available Credit</span>
                              <span className={`font-bold ${order.creditAvailable > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{order.creditAvailable.toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Credit Usage</span>
                                <span>{((order.creditUsed / order.creditLimit) * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${order.creditAvailable > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min((order.creditUsed / order.creditLimit) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5">
                          <h4 className="text-lg font-bold text-gray-900 mb-4">Order Items</h4>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-white/80 rounded-xl">
                                <div>
                                  <p className="font-bold text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">₹{item.subtotal.toLocaleString()}</p>
                                  <p className="text-sm text-gray-600">₹{item.price}/{item.unit}</p>
                                </div>
                              </div>
                            ))}
                            <div className="pt-3 border-t border-amber-200">
                              <div className="flex justify-between font-bold text-lg">
                                <span>Total Amount</span>
                                <span>₹{order.totalAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-purple-600" />
                            Delivery Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600">Delivery Address</p>
                              <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Delivery Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Payment Terms</p>
                              <p className="font-medium text-gray-900">{order.paymentTerms}</p>
                            </div>
                            {order.notes && (
                              <div className="p-3 bg-amber-100/50 rounded-xl">
                                <p className="text-sm text-amber-800 font-medium">📝 Note: {order.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Panel */}
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-2xl p-6">
                          <h4 className="text-xl font-bold mb-6 text-center">Approve Order?</h4>
                          <div className="space-y-4">
                            <button
                              onClick={() => openConfirmModal(order, 'approve')}
                              className="w-full py-4 bg-white text-emerald-600 rounded-xl text-lg font-bold hover:shadow-xl transition flex items-center justify-center gap-3"
                            >
                              <CheckCircle className="w-6 h-6" />
                              Approve Order
                            </button>
                            <button
                              onClick={() => openConfirmModal(order, 'reject')}
                              className="w-full py-4 bg-red-500 text-white rounded-xl text-lg font-bold hover:bg-red-600 transition flex items-center justify-center gap-3"
                            >
                              <XCircle className="w-6 h-6" />
                              Reject Order
                            </button>
                          </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur rounded-2xl p-5 border border-gray-200">
                          <h4 className="text-lg font-bold text-gray-900 mb-4">Dealer History</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Previous Orders</span>
                              <span className="font-bold">{order.previousOrders}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Order Value</span>
                              <span className="font-bold">₹{order.avgOrderValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Loyalty Tier</span>
                              {getTierBadge(order.loyaltyTier)}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Placed By</span>
                              <span className="font-bold">{order.placedBy}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Approved & Rejected Orders Table View */}
        {(viewMode === 'approved' || viewMode === 'rejected') && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Filters for Approved Orders */}
            {viewMode === 'approved' && (
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search approved orders..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/80 rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 border border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center bg-gray-50/80 rounded-xl px-3 py-2 border border-gray-200">
                      <Filter className="h-5 w-5 text-gray-400 mr-2" />
                      <select
                        className="bg-transparent focus:outline-none text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Packaging">Packaging</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gray-50/50">
                  <tr>
                    {[
                      { key: 'id', label: 'Order ID' },
                      { key: 'dealerName', label: 'Dealer' },
                      { key: 'placedBy', label: 'Placed By' },
                      { key: 'totalAmount', label: 'Amount' },
                      { key: viewMode === 'approved' ? 'productionStatus' : 'reason', label: viewMode === 'approved' ? 'Status' : 'Reason' },
                      { key: viewMode === 'approved' ? 'approvedOn' : 'rejectedOn', label: viewMode === 'approved' ? 'Approved On' : 'Rejected On' },
                      { key: 'actions', label: 'Actions' }
                    ].map((column) => (
                      <th 
                        key={column.key} 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => column.key !== 'actions' && handleSort(column.key)}
                      >
                        <div className="flex items-center">
                          {column.label}
                          {column.key !== 'actions' && (
                            <ArrowUpDown className="h-3 w-3 ml-1" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200/30">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50/50 transition-colors"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                              <div className="text-xs text-gray-500">{order.dealerId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.dealerName}</div>
                            <div className="text-xs text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-medium text-sm">
                              {order.placedBy.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{order.placedBy}</div>
                              <div className="text-xs text-gray-500">{formatDate(order.placedOn)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {viewMode === 'approved' ? (
                            getStatusBadge(order.productionStatus)
                          ) : (
                            <span className="text-sm font-medium text-red-700">{order.reason}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(viewMode === 'approved' ? order.approvedOn : order.rejectedOn)}
                          </div>
                          <div className="text-xs text-gray-500">
                            by {viewMode === 'approved' ? order.approvedBy : order.rejectedBy}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                              title="View details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {viewMode === 'approved' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle work order actions
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition"
                                title="View work order"
                              >
                                <FileText className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          {viewMode === 'approved' ? (
                            <>
                              <CheckCircle className="h-12 w-12 text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-1">No approved orders</h3>
                              <p className="text-gray-500">Approved orders will appear here</p>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-12 w-12 text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-1">No rejected orders</h3>
                              <p className="text-gray-500">Rejected orders will appear here</p>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastOrder, filteredOrders.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredOrders.length}</span> results
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 rounded-xl"
                      value={ordersPerPage}
                      onChange={(e) => setOrdersPerPage(Number(e.target.value))}
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 text-sm font-medium ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        let pageNumber
                        if (totalPages <= 5) {
                          pageNumber = index + 1
                        } else if (currentPage <= 3) {
                          pageNumber = index + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + index
                        } else {
                          pageNumber = currentPage - 2 + index
                        }
                        return (
                          <button
                            key={index}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && actionOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {actionType === 'approve' ? 'Approve Order' : 'Reject Order'}
                </h2>
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setRejectReason('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  {actionType === 'approve' 
                    ? `Are you sure you want to approve order #${actionOrder.id}?` 
                    : `Are you sure you want to reject order #${actionOrder.id}?`
                  }
                </p>
                <p className="font-bold text-gray-900">{actionOrder.dealerName}</p>
                <p className="text-lg font-bold text-gray-900 mt-2">₹{actionOrder.totalAmount.toLocaleString()}</p>
              </div>

              {actionType === 'reject' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/80 rounded-xl text-base focus:outline-none focus:ring-3 focus:ring-red-500/30 border border-gray-200"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Credit limit exceeded">Credit limit exceeded</option>
                    <option value="Insufficient stock">Insufficient stock</option>
                    <option value="Payment issues">Payment issues</option>
                    <option value="Delivery constraints">Delivery constraints</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setRejectReason('');
                  }}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionType === 'approve') {
                      handleApproveOrder(actionOrder.id);
                    } else if (actionType === 'reject' && rejectReason) {
                      handleRejectOrder(actionOrder.id, rejectReason);
                    }
                  }}
                  className={`px-6 py-3 rounded-xl font-bold hover:shadow-lg transition ${
                    actionType === 'approve'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700'
                  } ${actionType === 'reject' && !rejectReason ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={actionType === 'reject' && !rejectReason}
                >
                  {actionType === 'approve' ? 'Approve Order' : 'Reject Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600 mt-2">#{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Dealer Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Dealer Name</p>
                        <p className="font-bold text-lg text-gray-900">{selectedOrder.dealerName}</p>
                        <p className="text-sm text-gray-500">ID: {selectedOrder.dealerId}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="font-medium text-gray-900">{selectedOrder.dealerContact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{selectedOrder.dealerEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/80 rounded-xl">
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">₹{item.subtotal.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">₹{item.price}/{item.unit}</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-amber-200">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Amount</span>
                          <span>₹{selectedOrder.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Order Status</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="mt-2">
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                      </div>
                      {selectedOrder.approvedOn && (
                        <div>
                          <p className="text-sm text-gray-600">Approved On</p>
                          <p className="font-medium text-gray-900">{formatDate(selectedOrder.approvedOn)}</p>
                        </div>
                      )}
                      {selectedOrder.rejectedOn && (
                        <div>
                          <p className="text-sm text-gray-600">Rejected On</p>
                          <p className="font-medium text-gray-900">{formatDate(selectedOrder.rejectedOn)}</p>
                        </div>
                      )}
                      {selectedOrder.reason && (
                        <div className="p-3 bg-red-100/50 rounded-xl">
                          <p className="text-sm text-red-800 font-medium">Reason: {selectedOrder.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Delivery Address</p>
                        <p className="font-medium text-gray-900">{selectedOrder.deliveryAddress}</p>
                      </div>
                      {selectedOrder.deliveryDate && (
                        <div>
                          <p className="text-sm text-gray-600">Delivery Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedOrder.deliveryDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Payment Terms</p>
                        <p className="font-medium text-gray-900">{selectedOrder.paymentTerms}</p>
                      </div>
                      {selectedOrder.notes && (
                        <div className="p-3 bg-amber-100/50 rounded-xl">
                          <p className="text-sm text-amber-800 font-medium">📝 Note: {selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}