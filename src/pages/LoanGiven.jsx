import React, { useState } from 'react';
import { 
  SearchIcon, 
  FilterIcon,
  CalendarIcon,
  EyeIcon,
  DownloadIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  PackageIcon,
  CreditCardIcon,
  FileTextIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarSignIcon,
  UsersIcon,
  TrendingUpIcon,
  BarChart3Icon,
  XIcon,
  PrinterIcon,
  CopyIcon,
  PhoneIcon,
  MailIcon,
  UserIcon
} from 'lucide-react';

// Loan Details Popup Component - Matching LoanCollection style
const LoanDetailsPopup = ({ loan, onClose }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-medium text-gray-900">📋 Loan Details</h3>
            <p className="text-sm text-gray-500 mt-1">{loan.id} • {loan.dealerName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Dealer Name</p>
                <p className="font-medium text-gray-900">{loan.dealerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-medium text-gray-900">{loan.contact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rice Type</p>
                <p className="font-medium text-gray-900">{loan.riceType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-medium text-gray-900">{loan.quantity.toLocaleString()} kg</p>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(loan.amount)}</p>
            </div>
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(loan.paidAmount)}</p>
            </div>
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p className={`text-lg font-semibold ${loan.remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {formatCurrency(loan.remainingAmount)}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Issued Date</p>
              <p className="font-medium text-gray-900">{formatDate(loan.issueDate)}</p>
            </div>
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-medium text-gray-900">{formatDate(loan.dueDate)}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                loan.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                loan.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                loan.status === 'Partially Repaid' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                {loan.status}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Risk Level</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                loan.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                loan.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {loan.riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Repayment Progress</span>
              <span className="font-medium">{loan.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  loan.progress === 100 ? 'bg-green-500' : 
                  loan.progress >= 50 ? 'bg-emerald-500' : 
                  'bg-amber-500'
                }`}
                style={{ width: `${loan.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatCurrency(loan.paidAmount)} paid of {formatCurrency(loan.amount)}
            </div>
          </div>

          {/* Days Information */}
          <div className="bg-amber-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  {loan.daysLeft < 0 ? 
                    `${Math.abs(loan.daysLeft)} days overdue` : 
                    `${loan.daysLeft} days remaining`
                  }
                </span>
              </div>
              <span className="text-xs text-amber-600">
                Due on {formatDate(loan.dueDate)}
              </span>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              placeholder="Add notes about this loan..."
              className="w-full border border-gray-200 p-2 rounded text-sm"
              rows="3"
              defaultValue="Loan issued for rice purchase. Regular payments being made."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(loan, null, 2));
              alert('Loan details copied to clipboard!');
            }}
            className="px-4 py-2 rounded border border-gray-200 hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
          >
            <CopyIcon className="h-4 w-4" />
            Copy
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 rounded border border-gray-200 hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
          >
            <PrinterIcon className="h-4 w-4" />
            Print
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Download Modal Component - Matching LoanCollection style
const DownloadModal = ({ loan, onClose }) => {
  const [format, setFormat] = useState('pdf');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeFinancial, setIncludeFinancial] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);

  const handleDownload = () => {
    console.log(`Downloading loan ${loan.id} in ${format} format`);
    
    // Create download content
    const content = `
LOAN DETAILS REPORT
===================

BASIC INFORMATION
-----------------
Loan ID: ${loan.id}
Dealer Name: ${loan.dealerName}
Contact: ${loan.contact}
Rice Type: ${loan.riceType}
Quantity: ${loan.quantity} kg

FINANCIAL INFORMATION
---------------------
Total Amount: Rs. ${loan.amount.toLocaleString()}
Amount Paid: Rs. ${loan.paidAmount.toLocaleString()}
Remaining Amount: Rs. ${loan.remainingAmount.toLocaleString()}
Repayment Progress: ${loan.progress}%

LOAN DATES
----------
Issue Date: ${new Date(loan.issueDate).toLocaleDateString()}
Due Date: ${new Date(loan.dueDate).toLocaleDateString()}
Days ${loan.daysLeft < 0 ? `Overdue: ${Math.abs(loan.daysLeft)} days` : `Remaining: ${loan.daysLeft} days`}

STATUS INFORMATION
------------------
Loan Status: ${loan.status}
Risk Level: ${loan.riskLevel}

GENERATED ON: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-${loan.id}-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">📥 Download Loan Report</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Loan Info Preview */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p><strong>Loan ID:</strong> {loan.id}</p>
            <p><strong>Dealer:</strong> {loan.dealerName}</p>
            <p><strong>Amount:</strong> Rs. {loan.amount.toLocaleString()}</p>
            <p><strong>Status:</strong> {loan.status}</p>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['PDF', 'CSV', 'Excel'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt.toLowerCase())}
                  className={`py-2 rounded text-sm font-medium transition ${
                    format === fmt.toLowerCase() 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include in Report
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600">Basic loan details</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeFinancial}
                  onChange={(e) => setIncludeFinancial(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600">Financial information</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeTimeline}
                  onChange={(e) => setIncludeTimeline(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600">Payment timeline</span>
              </label>
            </div>
          </div>

          {/* Download Preview */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DownloadIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Download Preview</p>
                <p className="text-xs text-gray-600">
                  File: loan-{loan.id}-report.{format}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-200 hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleDownload}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium flex items-center gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export function LoanGiven() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadLoan, setDownloadLoan] = useState(null);

  // EXACT KPI Card Component from your design
  const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend, unit }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUpRightIcon className="w-3 h-3" /> : <ArrowDownRightIcon className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  // Currency formatter for Sri Lanka
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0';
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}`;
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}`;
    }
    return `${amount.toLocaleString('en-LK')}`;
  };

  // Get currency unit
  const getCurrencyUnit = (amount) => {
    if (amount >= 10000000) return 'Cr';
    if (amount >= 100000) return 'L';
    if (amount >= 1000) return 'K';
    return '';
  };

  // Mock data for issued loans
  const loans = [
    {
      id: 'LG-001',
      dealerName: 'Lak Sathosa Supermarkets',
      contact: '+94 11 234 5678',
      riceType: 'Premium Basmati',
      quantity: 5000,
      amount: 2500000,
      remainingAmount: 1250000,
      paidAmount: 1250000,
      issueDate: '2024-01-15',
      dueDate: '2024-03-15',
      status: 'Partially Repaid',
      riskLevel: 'Low',
      daysLeft: 28,
      progress: 50
    },
    {
      id: 'LG-002',
      dealerName: 'Keells Supermarket Chain',
      contact: '+94 11 345 6789',
      riceType: 'Samba Rice',
      quantity: 7000,
      amount: 3500000,
      remainingAmount: 3500000,
      paidAmount: 0,
      issueDate: '2024-01-10',
      dueDate: '2024-02-25',
      status: 'Active',
      riskLevel: 'Medium',
      daysLeft: 5,
      progress: 0
    },
    {
      id: 'LG-003',
      dealerName: 'Cargills Food City',
      contact: '+94 11 456 7890',
      riceType: 'Nadu Rice',
      quantity: 4000,
      amount: 1800000,
      remainingAmount: 1800000,
      paidAmount: 0,
      issueDate: '2024-01-05',
      dueDate: '2024-01-30',
      status: 'Overdue',
      riskLevel: 'High',
      daysLeft: -3,
      progress: 0
    },
    {
      id: 'LG-004',
      dealerName: 'Hilton Colombo Restaurants',
      contact: '+94 11 567 8901',
      riceType: 'Jasmine Rice',
      quantity: 2000,
      amount: 1200000,
      remainingAmount: 0,
      paidAmount: 1200000,
      issueDate: '2023-12-15',
      dueDate: '2024-02-15',
      status: 'Fully Repaid',
      riskLevel: 'Low',
      daysLeft: 0,
      progress: 100
    },
    {
      id: 'LG-005',
      dealerName: 'Nawarathne Wholesalers',
      contact: '+94 36 234 5678',
      riceType: 'Red Rice',
      quantity: 1500,
      amount: 800000,
      remainingAmount: 200000,
      paidAmount: 600000,
      issueDate: '2024-01-20',
      dueDate: '2024-04-20',
      status: 'Partially Repaid',
      riskLevel: 'Medium',
      daysLeft: 64,
      progress: 75
    },
    {
      id: 'LG-006',
      dealerName: 'Ambalangoda Fisheries',
      contact: '+94 91 456 7890',
      riceType: 'Parboiled Rice',
      quantity: 1000,
      amount: 500000,
      remainingAmount: 250000,
      paidAmount: 250000,
      issueDate: '2024-01-25',
      dueDate: '2024-03-25',
      status: 'Partially Repaid',
      riskLevel: 'Low',
      daysLeft: 38,
      progress: 50
    }
  ];

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.riceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.contact.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'All' || loan.status === filterStatus;
    const matchesRisk = filterRisk === 'All' || loan.riskLevel === filterRisk;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Calculate KPI stats
  const calculateKPIs = () => {
    const activeLoans = loans.filter(l => l.status === 'Active');
    const overdueLoans = loans.filter(l => l.status === 'Overdue');
    const fullyRepaidLoans = loans.filter(l => l.status === 'Fully Repaid');
    
    const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
    const totalPaid = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);
    const repaymentRate = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

    return {
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      fullyRepaidLoans: fullyRepaidLoans.length,
      totalAmount,
      totalRemaining,
      totalPaid,
      repaymentRate
    };
  };

  const stats = calculateKPIs();

  // View handlers
  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
  };

  const handleDownloadLoan = (loan) => {
    setDownloadLoan(loan);
    setShowDownloadModal(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      Active: 'bg-blue-100 text-blue-700',
      Overdue: 'bg-red-100 text-red-700',
      'Partially Repaid': 'bg-amber-100 text-amber-700',
      'Fully Repaid': 'bg-green-100 text-green-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const getRiskBadge = (riskLevel) => {
    const config = {
      Low: 'bg-emerald-100 text-emerald-700',
      Medium: 'bg-amber-100 text-amber-700',
      High: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[riskLevel] || 'bg-gray-100 text-gray-700'}`}>
        {riskLevel}
      </span>
    );
  };

  const getDaysBadge = (daysLeft) => {
    if (daysLeft < 0) {
      return (
        <div className="flex items-center text-red-600 text-xs font-medium">
          <AlertTriangleIcon className="w-3 h-3 mr-1" />
          {Math.abs(daysLeft)} days overdue
        </div>
      );
    } else if (daysLeft <= 7) {
      return (
        <div className="flex items-center text-amber-600 text-xs font-medium">
          <ClockIcon className="w-3 h-3 mr-1" />
          {daysLeft} days left
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-blue-600 text-xs font-medium">
          <CalendarIcon className="w-3 h-3 mr-1" />
          {daysLeft} days left
        </div>
      );
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-LK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Loans Given</h1>
          <p className="text-gray-500">Overview of all issued loans with status and risk assessment</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Loans" 
            value={stats.totalLoans}
            subtitle={`${stats.activeLoans} active • ${stats.overdueLoans} overdue`}
            icon={FileTextIcon}
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            trend={+8.2}
          />
          <KpiCard 
            title="Total Amount" 
            value={`Rs. ${formatCurrency(stats.totalAmount)}${getCurrencyUnit(stats.totalAmount)}`}
            subtitle={`${stats.fullyRepaidLoans} loans fully repaid`}
            icon={DollarSignIcon}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            trend={+12.4}
          />
          <KpiCard 
            title="Outstanding" 
            value={`Rs. ${formatCurrency(stats.totalRemaining)}${getCurrencyUnit(stats.totalRemaining)}`}
            subtitle="Amount yet to be repaid"
            icon={CreditCardIcon}
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
            trend={-5.2}
          />
          <KpiCard 
            title="Repayment Rate" 
            value={`${stats.repaymentRate.toFixed(1)}%`}
            subtitle={`Rs. ${formatCurrency(stats.totalPaid)} collected`}
            icon={TrendingUpIcon}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
            trend={+3.8}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search loans by dealer, ID, rice type..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="bg-transparent focus:outline-none text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Partially Repaid">Partially Repaid</option>
                  <option value="Fully Repaid">Fully Repaid</option>
                </select>
              </div>
              
              <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="bg-transparent focus:outline-none text-sm"
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                >
                  <option value="All">All Risk</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loans Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoans.map((loan) => (
              <div key={loan.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {loan.dealerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{loan.dealerName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{loan.id}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{loan.contact}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>

                  {/* Loan details */}
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Amount</p>
                        <p className="font-bold text-gray-900">Rs. {formatCurrency(loan.amount)}{getCurrencyUnit(loan.amount)}</p>
                      </div>
                      <div className={`rounded-lg p-3 ${
                        loan.remainingAmount === 0 ? 'bg-green-50' : 'bg-amber-50'
                      }`}>
                        <p className="text-xs text-gray-600">Remaining</p>
                        <p className={`font-bold ${
                          loan.remainingAmount === 0 ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          Rs. {formatCurrency(loan.remainingAmount)}{getCurrencyUnit(loan.remainingAmount)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <PackageIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{loan.riceType}</span>
                      </div>
                      <span className="font-medium text-gray-900">{loan.quantity.toLocaleString()} kg</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Due</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatDate(loan.dueDate)}</span>
                    </div>
                  </div>

                  {/* Status indicators */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      {getRiskBadge(loan.riskLevel)}
                      {getDaysBadge(loan.daysLeft)}
                    </div>
                    <div className="text-xs font-medium text-gray-900">
                      {loan.progress}% repaid
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          loan.progress === 100 ? 'bg-green-500' : 
                          loan.progress >= 50 ? 'bg-emerald-500' : 
                          loan.progress > 0 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${loan.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewLoan(loan)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </button>
                    
                    <button
                      onClick={() => handleDownloadLoan(loan)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      title="Download Loan Report"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Loans</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{loan.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{loan.dealerName}</div>
                            <div className="text-xs text-gray-500">{loan.contact}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          Rs. {formatCurrency(loan.amount)}{getCurrencyUnit(loan.amount)}
                        </div>
                        <div className="text-xs text-gray-500">{loan.riceType} • {loan.quantity}kg</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(loan.status)}
                          {getRiskBadge(loan.riskLevel)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(loan.dueDate)}</div>
                        {getDaysBadge(loan.daysLeft)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Repaid</span>
                            <span>{loan.progress}%</span>
                          </div>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                loan.progress === 100 ? 'bg-green-500' : 
                                loan.progress >= 50 ? 'bg-emerald-500' : 
                                'bg-amber-500'
                              }`}
                              style={{ width: `${loan.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewLoan(loan)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadLoan(loan)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                            title="Download Loan Report"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredLoans.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No loans found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Popup Modals */}
      {selectedLoan && (
        <LoanDetailsPopup 
          loan={selectedLoan} 
          onClose={() => setSelectedLoan(null)} 
        />
      )}

      {showDownloadModal && downloadLoan && (
        <DownloadModal 
          loan={downloadLoan} 
          onClose={() => {
            setShowDownloadModal(false);
            setDownloadLoan(null);
          }} 
        />
      )}
    </div>
  );
}