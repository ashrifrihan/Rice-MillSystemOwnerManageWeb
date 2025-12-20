import React, { useState } from 'react';
import { 
  Search, 
  Plus,
  Phone,
  Mail,
  MapPin, 
  User,
  ShoppingBag,
  Calendar,
  Filter,
  Eye,
  CreditCard,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';

export function CustomerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    type: 'Wholesaler',
    status: 'Active',
    creditLimit: 0,
    primaryContact: '',
    paymentTerms: '30 Days',
    notes: ''
  });

  // KPI Card Component (similar to dashboard)
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
          {value}
        </h3>
        <p className="text-sm text-gray-600 mt-1 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  // Currency formatter for Sri Lanka
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'Rs. 0';
    if (amount >= 10000000) {
      return `Rs. ${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `Rs. ${(amount / 100000).toFixed(1)} L`;
    } else if (amount >= 1000) {
      return `Rs. ${(amount / 1000).toFixed(1)} K`;
    }
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  // Simple customer data
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Lak Sathosa Supermarkets',
      contact: '+94 11 234 5678',
      email: 'orders@laksathosa.lk',
      address: '123 Galle Road, Colombo 03',
      type: 'Retail Chain',
      status: 'Active',
      creditLimit: 5000000,
      creditUsed: 2850000,
      creditAvailable: 2150000,
      totalOrders: 145,
      totalSpent: 45000000,
      avgOrderValue: 310345,
      lastOrder: '2024-01-15',
      paymentTerms: '30 Days',
      primaryContact: 'Mr. Rajapaksa',
      pendingAmount: 1250000,
    },
    {
      id: 2,
      name: 'Keells Supermarket Chain',
      contact: '+94 11 345 6789',
      email: 'purchase@keells.lk',
      address: '456 Union Place, Colombo 02',
      type: 'Retail Chain',
      status: 'Active',
      creditLimit: 8000000,
      creditUsed: 4500000,
      creditAvailable: 3500000,
      totalOrders: 232,
      totalSpent: 72000000,
      avgOrderValue: 310345,
      lastOrder: '2024-01-14',
      paymentTerms: '15 Days',
      primaryContact: 'Mr. Mendis',
      pendingAmount: 0,
    },
    {
      id: 3,
      name: 'Cargills Food City',
      contact: '+94 11 456 7890',
      email: 'procurement@cargills.lk',
      address: '789 Darley Road, Colombo 10',
      type: 'Retail Chain',
      status: 'Active',
      creditLimit: 3000000,
      creditUsed: 1250000,
      creditAvailable: 1750000,
      totalOrders: 98,
      totalSpent: 32000000,
      avgOrderValue: 326530,
      lastOrder: '2024-01-13',
      paymentTerms: '45 Days',
      primaryContact: 'Mr. Silva',
      pendingAmount: 2500000,
    },
    {
      id: 4,
      name: 'Hilton Colombo Restaurants',
      contact: '+94 11 567 8901',
      email: 'supplies@hilton.lk',
      address: '2 Sir Chittampalam Gardiner Mawatha, Colombo 02',
      type: 'Restaurant',
      status: 'Active',
      creditLimit: 2000000,
      creditUsed: 850000,
      creditAvailable: 1150000,
      totalOrders: 68,
      totalSpent: 18000000,
      avgOrderValue: 264705,
      lastOrder: '2024-01-12',
      paymentTerms: 'COD',
      primaryContact: 'Chef Kamal',
      pendingAmount: 0,
    },
    {
      id: 5,
      name: 'Nawarathne Wholesalers',
      contact: '+94 36 234 5678',
      email: 'orders@nawarathne.lk',
      address: 'Main Street, Kandy',
      type: 'Wholesaler',
      status: 'Active',
      creditLimit: 1200000,
      creditUsed: 450000,
      creditAvailable: 750000,
      totalOrders: 85,
      totalSpent: 15000000,
      avgOrderValue: 176470,
      lastOrder: '2024-01-08',
      paymentTerms: '30 Days',
      primaryContact: 'Mr. Nawarathne',
      pendingAmount: 0,
    },
    {
      id: 6,
      name: 'Polonnaruwa Rice Mill',
      contact: '+94 27 345 6789',
      email: 'sales@polonnaruwamill.lk',
      address: 'Polonnaruwa Main Road',
      type: 'Distributor',
      status: 'Inactive',
      creditLimit: 2500000,
      creditUsed: 0,
      creditAvailable: 2500000,
      totalOrders: 38,
      totalSpent: 12000000,
      avgOrderValue: 315789,
      lastOrder: '2023-12-20',
      paymentTerms: 'COD',
      primaryContact: 'Mr. Weerasinghe',
      pendingAmount: 0,
    }
  ]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'All' || customer.type === filterType;
    
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'totalOrders': return b.totalOrders - a.totalOrders;
      case 'totalSpent': return b.totalSpent - a.totalSpent;
      case 'lastOrder': return new Date(b.lastOrder) - new Date(a.lastOrder);
      default: return 0;
    }
  });

  // Calculate KPI stats
  const calculateKPIs = () => {
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalPending = customers.reduce((sum, c) => sum + c.pendingAmount, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalCreditUsed = customers.reduce((sum, c) => sum + c.creditUsed, 0);
    const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);
    const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;

    return {
      totalCustomers: customers.length,
      activeCustomers,
      totalRevenue,
      totalPending,
      avgOrderValue,
      totalCreditUsed,
      creditUtilization
    };
  };

  const stats = calculateKPIs();

  const handleAddCustomer = () => {
    const newCustomerWithId = {
      ...newCustomer,
      id: customers.length + 1,
      creditUsed: 0,
      creditAvailable: newCustomer.creditLimit,
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      lastOrder: 'Never',
      pendingAmount: 0
    };

    setCustomers(prev => [...prev, newCustomerWithId]);
    setIsAddCustomerModalOpen(false);
    
    // Reset form
    setNewCustomer({
      name: '',
      contact: '',
      email: '',
      address: '',
      type: 'Wholesaler',
      status: 'Active',
      creditLimit: 0,
      primaryContact: '',
      paymentTerms: '30 Days',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      Active: { bg: 'bg-green-100', text: 'text-green-700' },
      Inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
    };
    const configItem = config[status] || config.Active;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${configItem.bg} ${configItem.text}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Total Customers" 
            value={stats.totalCustomers}
            subtitle={`${stats.activeCustomers} active customers`}
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
            trend={+12.4}
          />
          <KpiCard 
            title="Total Revenue" 
            value={formatCurrency(stats.totalRevenue)}
            subtitle="Lifetime customer value"
            icon={DollarSign}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            trend={+8.2}
          />
          <KpiCard 
            title="Pending Amount" 
            value={formatCurrency(stats.totalPending)}
            subtitle="Collections due from customers"
            icon={CreditCard}
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            trend={-3.1}
          />
          <KpiCard 
            title="Credit Utilization" 
            value={`${stats.creditUtilization.toFixed(1)}%`}
            subtitle="Of total credit limit"
            icon={TrendingUp}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
            trend={+2.3}
          />
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/80 rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-gray-50/80 rounded-xl px-4 py-3 border border-gray-200">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="bg-transparent focus:outline-none text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Wholesaler">Wholesalers</option>
                  <option value="Retail Chain">Retail Chains</option>
                  <option value="Restaurant">Restaurants</option>
                  <option value="Distributor">Distributors</option>
                </select>
              </div>
              
              <div className="flex bg-gray-50/80 rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  List
                </button>
              </div>
              
              <button 
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Customer
              </button>
            </div>
          </div>
        </div>

        {/* Customers Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-600">{customer.type}</p>
                      </div>
                    </div>
                    {getStatusBadge(customer.status)}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.contact}</p>
                        <p className="text-xs text-gray-500">{customer.primaryContact}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                    </div>
                  </div>

                  {/* Simple Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600">Credit Limit</p>
                      <p className="font-bold text-gray-900">{formatCurrency(customer.creditLimit)}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600">Orders</p>
                      <p className="font-bold text-gray-900">{customer.totalOrders}</p>
                    </div>
                  </div>

                  {/* View Details Button Only */}
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setIsDetailModalOpen(true);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type & Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit Limit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200/30">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.contact}</div>
                          <div className="text-xs text-gray-500">{customer.primaryContact}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className="text-sm text-gray-900">{customer.type}</span>
                          {getStatusBadge(customer.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(customer.creditLimit)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{customer.totalOrders}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(customer.totalSpent)} total</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredCustomers.length === 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Add New Customer
            </button>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Customer</h2>
                <button
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.contact}
                    onChange={(e) => setNewCustomer({...newCustomer, contact: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="+94 00 000 0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="customer@example.lk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Type
                  </label>
                  <select
                    value={newCustomer.type}
                    onChange={(e) => setNewCustomer({...newCustomer, type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Retail Chain">Retail Chain</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Limit (Rs.)
                  </label>
                  <input
                    type="number"
                    value={newCustomer.creditLimit}
                    onChange={(e) => setNewCustomer({...newCustomer, creditLimit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="500000"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newCustomer.name || !newCustomer.contact}
                >
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal - View Only */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-600">{selectedCustomer.type}</span>
                    {getStatusBadge(selectedCustomer.status)}
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Contact Number</p>
                    <p className="font-medium text-gray-900">{selectedCustomer.contact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Primary Contact</p>
                    <p className="font-medium text-gray-900">{selectedCustomer.primaryContact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Terms</p>
                    <p className="font-medium text-gray-900">{selectedCustomer.paymentTerms}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">Credit Limit</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedCustomer.creditLimit)}</p>
                    <p className="text-xs text-gray-600 mt-1">Available: {formatCurrency(selectedCustomer.creditAvailable)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold text-gray-900">{selectedCustomer.totalOrders}</p>
                    <p className="text-xs text-gray-600 mt-1">Revenue: {formatCurrency(selectedCustomer.totalSpent)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Last Order</p>
                    <p className="font-medium text-gray-900">
                      {selectedCustomer.lastOrder === 'Never' ? 'Never' : 
                        new Date(selectedCustomer.lastOrder).toLocaleDateString('en-LK', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Amount</p>
                    <p className="font-medium text-gray-900">{formatCurrency(selectedCustomer.pendingAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}