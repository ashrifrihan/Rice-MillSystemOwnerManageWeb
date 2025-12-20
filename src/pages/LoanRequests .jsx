import React, { useState } from 'react';
import { 
  SearchIcon, 
  FilterIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  DollarSignIcon,
  CalendarIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  PackageIcon,
  CreditCardIcon,
  FileTextIcon,
  MessageSquareIcon,
  ShieldIcon,
  XIcon,
  PlusIcon,
  DownloadIcon
} from 'lucide-react';

export function LoanRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'accept' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Mock data for loan requests from dealers
  const [loanRequests, setLoanRequests] = useState([
    {
      id: 'LR-001',
      dealerId: 'D-001',
      dealerName: 'Lak Sathosa Supermarkets',
      contact: '+94 11 234 5678',
      email: 'orders@laksathosa.lk',
      address: '123 Galle Road, Colombo 03',
      type: 'Retail Chain',
      requestDate: '2024-01-20',
      requestedAmount: 2500000,
      requestedQuantity: 5000,
      riceType: 'Premium Basmati',
      purpose: 'Monthly stock purchase',
      repaymentPeriod: '60 days',
      status: 'Pending',
      creditScore: 85,
      existingLoan: 1250000,
      businessYears: 5,
      previousLoans: 3,
      avgLoanAmount: 1800000,
      documents: ['Business License', 'Tax Certificate', 'Bank Statement']
    },
    {
      id: 'LR-002',
      dealerId: 'D-002',
      dealerName: 'Keells Supermarket Chain',
      contact: '+94 11 345 6789',
      email: 'purchase@keells.lk',
      address: '456 Union Place, Colombo 02',
      type: 'Retail Chain',
      requestDate: '2024-01-19',
      requestedAmount: 3500000,
      requestedQuantity: 7000,
      riceType: 'Samba Rice',
      purpose: 'Festival season stock',
      repaymentPeriod: '45 days',
      status: 'Pending',
      creditScore: 92,
      existingLoan: 0,
      businessYears: 7,
      previousLoans: 5,
      avgLoanAmount: 2500000,
      documents: ['Business License', 'Tax Certificate', 'Bank Statement', 'Annual Report']
    },
    {
      id: 'LR-003',
      dealerId: 'D-003',
      dealerName: 'Cargills Food City',
      contact: '+94 11 456 7890',
      email: 'procurement@cargills.lk',
      address: '789 Darley Road, Colombo 10',
      type: 'Retail Chain',
      requestDate: '2024-01-18',
      requestedAmount: 1800000,
      requestedQuantity: 4000,
      riceType: 'Nadu Rice',
      purpose: 'Warehouse restocking',
      repaymentPeriod: '30 days',
      status: 'Pending',
      creditScore: 78,
      existingLoan: 850000,
      businessYears: 4,
      previousLoans: 2,
      avgLoanAmount: 1200000,
      documents: ['Business License', 'Tax Certificate']
    },
    {
      id: 'LR-004',
      dealerId: 'D-004',
      dealerName: 'Hilton Colombo Restaurants',
      contact: '+94 11 567 8901',
      email: 'supplies@hilton.lk',
      address: '2 Sir Chittampalam Gardiner Mawatha, Colombo 02',
      type: 'Restaurant',
      requestDate: '2024-01-17',
      requestedAmount: 1200000,
      requestedQuantity: 2000,
      riceType: 'Jasmine Rice',
      purpose: 'New branch opening',
      repaymentPeriod: '90 days',
      status: 'Pending',
      creditScore: 88,
      existingLoan: 0,
      businessYears: 3,
      previousLoans: 1,
      avgLoanAmount: 800000,
      documents: ['Business License', 'Tax Certificate', 'Property Documents']
    },
    {
      id: 'LR-005',
      dealerId: 'D-005',
      dealerName: 'Nawarathne Wholesalers',
      contact: '+94 36 234 5678',
      email: 'orders@nawarathne.lk',
      address: 'Main Street, Kandy',
      type: 'Wholesaler',
      requestDate: '2024-01-16',
      requestedAmount: 800000,
      requestedQuantity: 1500,
      riceType: 'Red Rice',
      purpose: 'Seasonal purchase',
      repaymentPeriod: '60 days',
      status: 'Pending',
      creditScore: 65,
      existingLoan: 450000,
      businessYears: 4,
      previousLoans: 3,
      avgLoanAmount: 600000,
      documents: ['Business License', 'Tax Certificate']
    },
    {
      id: 'LR-006',
      dealerId: 'D-006',
      dealerName: 'Ambalangoda Fisheries',
      contact: '+94 91 456 7890',
      email: 'purchase@ambalangodafish.lk',
      address: 'Galle Road, Ambalangoda',
      type: 'Institutional',
      requestDate: '2024-01-15',
      requestedAmount: 500000,
      requestedQuantity: 1000,
      riceType: 'Parboiled Rice',
      purpose: 'Employee canteen supplies',
      repaymentPeriod: '30 days',
      status: 'Approved',
      approvedAmount: 400000,
      approvedDate: '2024-01-16',
      approvedBy: 'Manager Rajesh',
      creditScore: 72,
      existingLoan: 0,
      businessYears: 2,
      previousLoans: 0,
      avgLoanAmount: 0,
      documents: ['Business License', 'Tax Certificate']
    },
    {
      id: 'LR-007',
      dealerId: 'D-007',
      dealerName: 'Dilmah Tea Company',
      contact: '+94 11 789 0123',
      email: 'procurement@dilmah.com',
      address: '111 Negombo Road, Peliyagoda',
      type: 'Exporter',
      requestDate: '2024-01-14',
      requestedAmount: 5000000,
      requestedQuantity: 10000,
      riceType: 'Premium Basmati',
      purpose: 'Export order fulfillment',
      repaymentPeriod: '120 days',
      status: 'Rejected',
      rejectionReason: 'Credit limit exceeded',
      rejectedDate: '2024-01-15',
      rejectedBy: 'Manager Sunil',
      creditScore: 90,
      existingLoan: 3250000,
      businessYears: 8,
      previousLoans: 4,
      avgLoanAmount: 3000000,
      documents: ['Business License', 'Tax Certificate', 'Export License', 'Bank Statement']
    }
  ]);

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
              {trend > 0 ? <ArrowUpRightIcon className="w-5 h-5" /> : <ArrowDownRightIcon className="w-5 h-5" />}
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

  // Filter loan requests
  const filteredRequests = loanRequests.filter(request => {
    const matchesSearch = 
      request.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contact.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate KPI stats
  const calculateKPIs = () => {
    const pendingRequests = loanRequests.filter(r => r.status === 'Pending');
    const approvedRequests = loanRequests.filter(r => r.status === 'Approved');
    const rejectedRequests = loanRequests.filter(r => r.status === 'Rejected');
    
    const totalRequestedAmount = loanRequests.reduce((sum, r) => sum + r.requestedAmount, 0);
    const pendingAmount = pendingRequests.reduce((sum, r) => sum + r.requestedAmount, 0);
    const approvedAmount = approvedRequests.reduce((sum, r) => sum + (r.approvedAmount || r.requestedAmount), 0);
    
    const avgProcessingTime = 2.3; // in days
    const approvalRate = loanRequests.length > 0 ? (approvedRequests.length / loanRequests.length) * 100 : 0;

    return {
      totalRequests: loanRequests.length,
      pendingRequests: pendingRequests.length,
      approvedRequests: approvedRequests.length,
      rejectedRequests: rejectedRequests.length,
      totalRequestedAmount,
      pendingAmount,
      approvedAmount,
      avgProcessingTime,
      approvalRate
    };
  };

  const stats = calculateKPIs();

  // Handle accept/reject actions
  const handleAccept = (request) => {
    setSelectedRequest(request);
    setActionType('accept');
    setIsActionModalOpen(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setActionType('reject');
    setRejectionReason('');
    setIsActionModalOpen(true);
  };

  const confirmAction = () => {
    if (!selectedRequest) return;

    if (actionType === 'accept') {
      // Accept the loan request
      const updatedRequests = loanRequests.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: 'Approved',
              approvedAmount: Math.round(req.requestedAmount * 0.9), // Approve 90% of requested
              approvedDate: new Date().toISOString().split('T')[0],
              approvedBy: 'Manager'
            }
          : req
      );
      setLoanRequests(updatedRequests);
    } else if (actionType === 'reject' && rejectionReason.trim()) {
      // Reject the loan request
      const updatedRequests = loanRequests.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: 'Rejected',
              rejectionReason: rejectionReason.trim(),
              rejectedDate: new Date().toISOString().split('T')[0],
              rejectedBy: 'Manager'
            }
          : req
      );
      setLoanRequests(updatedRequests);
    }

    setIsActionModalOpen(false);
    setSelectedRequest(null);
    setActionType('');
    setRejectionReason('');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      Pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: ClockIcon },
      Approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircleIcon },
      Rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircleIcon }
    };
    const configItem = config[status] || config.Pending;
    const Icon = configItem.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${configItem.bg} ${configItem.text}`}>
        <Icon className="h-3.5 w-3.5" />
        {status}
      </span>
    );
  };

  // Get credit score badge
  const getCreditScoreBadge = (score) => {
    if (score >= 90) return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-teal-600 text-white';
    if (score >= 70) return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white';
    return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Total Loan Requests" 
            value={stats.totalRequests}
            subtitle={`${stats.pendingRequests} pending review`}
            icon={FileTextIcon}
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
            trend={+15.2}
          />
          <KpiCard 
            title="Total Requested Amount" 
            value={formatCurrency(stats.totalRequestedAmount)}
            subtitle={`${formatCurrency(stats.pendingAmount)} pending`}
            icon={DollarSignIcon}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            trend={+8.2}
          />
          <KpiCard 
            title="Approval Rate" 
            value={`${stats.approvalRate.toFixed(1)}%`}
            subtitle={`${stats.approvedRequests} approved, ${stats.rejectedRequests} rejected`}
            icon={TrendingUpIcon}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
            trend={+2.3}
          />
          <KpiCard 
            title="Avg Processing Time" 
            value={`${stats.avgProcessingTime} days`}
            subtitle="From request to decision"
            icon={ClockIcon}
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            trend={-1.5}
          />
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by dealer name, request ID, or contact..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/80 rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:bg-white transition-all border border-gray-200 hover:border-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-gray-50/80 rounded-xl px-4 py-3 border border-gray-200">
                <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="bg-transparent focus:outline-none text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
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
              
              <button className="flex items-center gap-2 px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 hover:border-gray-300 transition">
                <DownloadIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loan Requests Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {request.dealerName.charAt(0)}
                        </div>
                        <div className={`absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${getCreditScoreBadge(request.creditScore)}`}>
                          {request.creditScore}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{request.dealerName}</h3>
                        <p className="text-sm text-gray-600">{request.type}</p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {/* Request Info */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600">Requested Amount</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(request.requestedAmount)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600">Quantity</p>
                        <p className="text-lg font-bold text-gray-900">{request.requestedQuantity.toLocaleString()} kg</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl">
                        <PackageIcon className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.riceType}</p>
                          <p className="text-xs text-gray-500">For: {request.purpose}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Repayment:</span>
                        </div>
                        <span className="font-medium text-gray-900">{request.repaymentPeriod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-900">{request.contact}</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-900 truncate">{request.email}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        // View details logic here
                      }}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </button>
                    
                    {request.status === 'Pending' && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleAccept(request)}
                          className="py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          className="py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {request.status === 'Approved' && (
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <p className="text-sm font-medium text-green-700">
                          Approved: {formatCurrency(request.approvedAmount || request.requestedAmount)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          By {request.approvedBy} on {request.approvedDate}
                        </p>
                      </div>
                    )}
                    
                    {request.status === 'Rejected' && (
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-sm font-medium text-red-700">Reason: {request.rejectionReason}</p>
                        <p className="text-xs text-red-600 mt-1">
                          By {request.rejectedBy} on {request.rejectedDate}
                        </p>
                      </div>
                    )}
                  </div>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dealer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount & Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200/30">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {request.dealerName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{request.dealerName}</div>
                            <div className="text-xs text-gray-500">{request.contact}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.riceType}</div>
                          <div className="text-xs text-gray-500">{request.purpose}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            Requested: {request.requestDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-gray-900">{formatCurrency(request.requestedAmount)}</div>
                          <div className="text-sm text-gray-600">{request.requestedQuantity.toLocaleString()} kg</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Repayment: {request.repaymentPeriod}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${getCreditScoreBadge(request.creditScore)}`}>
                          {request.creditScore}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              // View details logic here
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition"
                          >
                            View
                          </button>
                          
                          {request.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAccept(request)}
                                className="flex-1 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleReject(request)}
                                className="flex-1 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredRequests.length === 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
            <FileTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No loan requests found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Accept/Reject Modal */}
      {isActionModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {actionType === 'accept' ? 'Accept Loan Request' : 'Reject Loan Request'}
                </h2>
                <button
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setSelectedRequest(null);
                    setActionType('');
                    setRejectionReason('');
                  }}
                  className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Dealer Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {selectedRequest.dealerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{selectedRequest.dealerName}</div>
                    <div className="text-sm text-gray-600">{selectedRequest.type}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Requested Amount</p>
                    <p className="font-bold text-gray-900">{formatCurrency(selectedRequest.requestedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Credit Score</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getCreditScoreBadge(selectedRequest.creditScore)}`}>
                      {selectedRequest.creditScore}
                    </div>
                  </div>
                </div>
              </div>

              {actionType === 'accept' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approved Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      defaultValue={Math.round(selectedRequest.requestedAmount * 0.9)}
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter approved amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Terms (Optional)
                    </label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Any special terms or conditions..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection *
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">Select a reason...</option>
                      <option value="Credit limit exceeded">Credit limit exceeded</option>
                      <option value="Insufficient credit score">Insufficient credit score</option>
                      <option value="Missing documentation">Missing documentation</option>
                      <option value="High existing loan amount">High existing loan amount</option>
                      <option value="Short business history">Short business history</option>
                      <option value="Request amount too high">Request amount too high</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {rejectionReason === 'Other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specify Reason
                      </label>
                      <textarea
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Please specify the reason..."
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setSelectedRequest(null);
                    setActionType('');
                    setRejectionReason('');
                  }}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition ${
                    actionType === 'accept'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                  }`}
                  disabled={actionType === 'reject' && !rejectionReason.trim()}
                >
                  {actionType === 'accept' ? 'Accept Request' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedRequest && !isActionModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.dealerName}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    {getStatusBadge(selectedRequest.status)}
                    <span className="text-sm text-gray-600">Request ID: {selectedRequest.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Request Details</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Requested Amount</p>
                          <p className="font-bold text-gray-900">{formatCurrency(selectedRequest.requestedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-bold text-gray-900">{selectedRequest.requestedQuantity.toLocaleString()} kg</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rice Type</p>
                        <p className="font-bold text-gray-900">{selectedRequest.riceType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Purpose</p>
                        <p className="font-bold text-gray-900">{selectedRequest.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Repayment Period</p>
                        <p className="font-bold text-gray-900">{selectedRequest.repaymentPeriod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Request Date</p>
                        <p className="font-bold text-gray-900">{selectedRequest.requestDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Dealer Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Business Type</p>
                        <p className="font-bold text-gray-900">{selectedRequest.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-bold text-gray-900">{selectedRequest.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-bold text-gray-900">{selectedRequest.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">{selectedRequest.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Credit Assessment</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Credit Score</p>
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold mt-1 ${getCreditScoreBadge(selectedRequest.creditScore)}`}>
                            {selectedRequest.creditScore}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Business Years</p>
                          <p className="font-bold text-gray-900">{selectedRequest.businessYears} years</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Existing Loan</p>
                          <p className="font-bold text-gray-900">{formatCurrency(selectedRequest.existingLoan)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Previous Loans</p>
                          <p className="font-bold text-gray-900">{selectedRequest.previousLoans}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg Previous Loan</p>
                        <p className="font-bold text-gray-900">{formatCurrency(selectedRequest.avgLoanAmount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Documents</h3>
                    <div className="space-y-2">
                      {selectedRequest.documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/80 rounded-xl">
                          <FileTextIcon className="h-5 w-5 text-amber-600" />
                          <span className="font-medium text-gray-900">{doc}</span>
                          <button className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedRequest.status === 'Approved' && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Approval Details</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Approved Amount</p>
                          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedRequest.approvedAmount)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Approved By</p>
                            <p className="font-bold text-gray-900">{selectedRequest.approvedBy}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Approval Date</p>
                            <p className="font-bold text-gray-900">{selectedRequest.approvedDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status === 'Rejected' && (
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Rejection Details</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Reason for Rejection</p>
                          <p className="font-bold text-red-700">{selectedRequest.rejectionReason}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Rejected By</p>
                            <p className="font-bold text-gray-900">{selectedRequest.rejectedBy}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Rejection Date</p>
                            <p className="font-bold text-gray-900">{selectedRequest.rejectedDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'Pending' && (
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleReject(selectedRequest)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleAccept(selectedRequest)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Accept Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}