import React, { useState } from 'react';
import { 
  ArrowLeft, 
  DollarSign, 
  Search, 
  Filter,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  User,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  Users,
  Bell,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockLoanCollectionData } from '../data/mockData';

export function LoanCollection() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [collectionData, setCollectionData] = useState(mockLoanCollectionData);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionAmount, setCollectionAmount] = useState('');

  const handleCollectPayment = (collection) => {
    setSelectedCollection(collection);
    setCollectionAmount(collection.dueAmount.toString());
    setIsCollectionModalOpen(true);
  };

  const handleSubmitCollection = () => {
    if (!collectionAmount || parseFloat(collectionAmount) <= 0) {
      alert('Please enter a valid collection amount');
      return;
    }

    setCollectionData(prevData => {
      const updatedPending = prevData.pendingCollections.filter(
        item => item.id !== selectedCollection.id
      );
      
      const newCollectionRecord = {
        id: `CH${Date.now()}`,
        loanId: selectedCollection.loanId,
        customer: selectedCollection.customer,
        collectionDate: new Date().toISOString().split('T')[0],
        amount: parseFloat(collectionAmount),
        method: 'Cash',
        collectedBy: 'Current User',
        receiptNo: `RCPT-${Date.now()}`
      };

      return {
        ...prevData,
        pendingCollections: updatedPending,
        collectionHistory: [newCollectionRecord, ...prevData.collectionHistory],
        collectionSummary: {
          ...prevData.collectionSummary,
          collectedThisMonth: prevData.collectionSummary.collectedThisMonth + parseFloat(collectionAmount),
          pendingCollections: prevData.collectionSummary.pendingCollections - parseFloat(collectionAmount),
          collectionRate: ((prevData.collectionSummary.collectedThisMonth + parseFloat(collectionAmount)) / 
            prevData.collectionSummary.totalDue * 100).toFixed(1)
        }
      };
    });

    setIsCollectionModalOpen(false);
    setSelectedCollection(null);
    setCollectionAmount('');
  };

  const filteredCollections = collectionData.pendingCollections.filter(collection => {
    const matchesSearch = collection.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.loanId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || collection.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Overdue': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Upcoming': return 'bg-blue-100 text-blue-700 border border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // KPI Card Component matching dashboard style
  const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend, unit = "₹" }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color} shadow-lg transform group-hover:scale-110 transition-transform`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowUpRight className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900">
          {unit === "₹" && "₹"}
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </h3>
        <p className="text-sm text-gray-600 mt-1 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="group p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:shadow-lg"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Collection</h1>
            <p className="text-gray-500">Manage loan collections and recovery operations</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Total Due" 
          value={collectionData.collectionSummary.totalDue} 
          subtitle="Across all active loans" 
          icon={DollarSign} 
          color="bg-gradient-to-br from-amber-500 to-orange-600" 
          trend={-2.3}
          unit="₹"
        />
        <KpiCard 
          title="Collected This Month" 
          value={collectionData.collectionSummary.collectedThisMonth} 
          subtitle={`${collectionData.collectionSummary.collectionRate}% collection rate`} 
          icon={CheckCircle} 
          color="bg-gradient-to-br from-emerald-500 to-teal-600" 
          trend={+8.2}
          unit="₹"
        />
        <KpiCard 
          title="Pending Collections" 
          value={collectionData.collectionSummary.pendingCollections} 
          subtitle={`${collectionData.pendingCollections.length} pending loans`} 
          icon={AlertTriangle} 
          color="bg-gradient-to-br from-rose-500 to-pink-600" 
          trend={-5.1}
          unit="₹"
        />
        <KpiCard 
          title="Overdue Amount" 
          value={collectionData.collectionSummary.overdueAmount} 
          subtitle={`${collectionData.collectionSummary.overdueLoans} overdue loans`} 
          icon={Clock} 
          color="bg-gradient-to-br from-red-500 to-rose-600" 
          trend={+12.4}
          unit="₹"
        />
      </div>

      {/* Filters - Modern Style */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by customer name, loan ID, or contact..."
              className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-3 bg-gray-50/50 rounded-xl px-4 py-3 border border-gray-200">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="bg-transparent focus:outline-none text-sm font-medium"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition">
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Collections Table */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
                Pending Collections
              </h3>
              <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold">
                {filteredCollections.length} pending
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredCollections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{collection.customer}</div>
                          <div className="text-sm text-gray-600">Loan ID: {collection.loanId}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3" />
                            {collection.contactNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(collection.dueDate).toLocaleDateString('en-IN')}
                      </div>
                      {collection.overdueDays && (
                        <div className="text-xs text-red-600 font-semibold mt-1">
                          {collection.overdueDays} days overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{collection.dueAmount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(collection.status)}`}>
                        {collection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCollectPayment(collection)}
                        className="group px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Collect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCollections.length === 0 && (
              <div className="text-center py-16">
                <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-400 text-lg font-medium mb-2">No pending collections found</div>
                <div className="text-sm text-gray-500">All loan payments are up to date</div>
              </div>
            )}
          </div>
        </div>

        {/* Collection History & Stats Sidebar */}
        <div className="space-y-8">
          {/* Collection Stats */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-emerald-600" />
              Collection Performance
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Collection Rate</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {collectionData.collectionSummary.collectionRate}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                    style={{ width: `${collectionData.collectionSummary.collectionRate}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50/50 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {collectionData.collectionSummary.upcomingLoans}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming Loans</div>
                </div>
                <div className="bg-red-50/50 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {collectionData.collectionSummary.overdueLoans}
                  </div>
                  <div className="text-sm text-gray-600">Overdue Loans</div>
                </div>
              </div>
              
              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition">
                View Analytics Report
              </button>
            </div>
          </div>

          {/* Recent Collections */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Clock className="w-7 h-7 text-blue-600" />
              Recent Collections
            </h3>
            <div className="space-y-4">
              {collectionData.collectionHistory.slice(0, 3).map((record) => (
                <div key={record.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{record.customer}</div>
                      <div className="text-xs text-gray-500">{record.receiptNo}</div>
                    </div>
                    <div className="text-emerald-600 font-bold">₹{record.amount.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{record.method}</span>
                    <span>{new Date(record.collectionDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition">
                View All History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Modal - Enhanced */}
      {isCollectionModalOpen && selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-100">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Collect Payment</h3>
                    <p className="text-sm text-gray-500">Confirm payment collection</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-bold text-gray-900">{selectedCollection.customer}</div>
                    <div className="text-sm text-gray-600">Loan ID: {selectedCollection.loanId}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedCollection.status)}`}>
                    {selectedCollection.status}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  ₹{selectedCollection.dueAmount.toLocaleString('en-IN')}
                </div>
                {selectedCollection.overdueDays && (
                  <div className="text-sm text-red-600 mt-2">
                    ⚠️ Overdue by {selectedCollection.overdueDays} days
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Collection Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg font-semibold"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    max={selectedCollection.dueAmount}
                    step="100"
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-500">
                    Max: ₹{selectedCollection.dueAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-gray-900">
                    Balance: ₹{(selectedCollection.dueAmount - parseFloat(collectionAmount || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <select className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 font-medium">
                  <option value="Cash">💰 Cash</option>
                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Cheque">📄 Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Collection Notes (Optional)
                </label>
                <textarea
                  placeholder="Add notes about this collection..."
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 resize-none"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100">
              <button 
                onClick={() => setIsCollectionModalOpen(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitCollection}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Confirm Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}