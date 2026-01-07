import React, { useState, useEffect } from 'react';
import { rtdb as db } from '../firebase/config';
import { ref, onValue } from 'firebase/database';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { filterSnapshotByOwner, getCurrentUserEmail } from '../utils/firebaseFilters';
import { 
  ArrowLeft, 
  DollarSign, 
  Search, 
  Filter,
  CheckCircle,
  Calendar,
  User,
  FileText,
  Download,
  Clock,
  AlertTriangle,
  CreditCard,
  Scale,
  Truck,
  Package,
  BarChart3,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fallback mock data for settled loans
const mockSettledLoans = [
  {
    id: 'SL-201',
    customer: 'Sharma Foods Ltd',
    riceType: 'Premium Basmati',
    quantity: 4800,
    loanAmount: 2400000,
    interest: 120000,
    totalAmount: 2520000,
    settlementAmount: 2520000,
    issueDate: '2024-08-01',
    dueDate: '2024-10-01',
    settlementDate: '2024-09-28',
    status: 'Fully Settled',
    loanOfficer: 'John Smith',
    settlementMethod: 'Bank Transfer'
  },
  {
    id: 'SL-202',
    customer: 'Keells Supermarket Chain',
    riceType: 'Samba Rice',
    quantity: 5200,
    loanAmount: 2100000,
    interest: 95000,
    totalAmount: 2195000,
    settlementAmount: 2150000,
    issueDate: '2024-07-15',
    dueDate: '2024-09-15',
    settlementDate: '2024-08-30',
    status: 'Early Settlement',
    loanOfficer: 'Anjali Perera',
    settlementMethod: 'Cash'
  },
  {
    id: 'SL-203',
    customer: 'Kumar Restaurants',
    riceType: 'Jasmine Rice',
    quantity: 2600,
    loanAmount: 1100000,
    interest: 52000,
    totalAmount: 1152000,
    settlementAmount: 1152000,
    issueDate: '2024-06-10',
    dueDate: '2024-08-10',
    settlementDate: '2024-08-12',
    status: 'Settled',
    loanOfficer: 'Suresh Fernando',
    settlementMethod: 'Cheque'
  }
];

export function SettledLoans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userEmail = getCurrentUserEmail(user);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateRange, setDateRange] = useState('This Month');
  const [settledLoans, setSettledLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Firebase Listener - Load settled loans
  useEffect(() => {
    if (!userEmail) return;
    
    setLoading(true);
    const settledLoansRef = ref(db, 'settledLoans');
    
    const unsubscribe = onValue(settledLoansRef, (snapshot) => {
      const loansList = filterSnapshotByOwner(snapshot, userEmail);
      const fallback = mockSettledLoans.map(loan => ({ ...loan, owner_email: userEmail }));
      setSettledLoans(loansList.length ? loansList : fallback);
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      toast.error('Failed to load settled loans');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userEmail]);

  const filteredLoans = settledLoans.filter(loan => {
    const matchesSearch = loan?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan?.riceType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || loan?.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Fully Settled': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Early Settlement': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Settled': return 'bg-gray-100 text-gray-700 border border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const downloadSettlementReport = (loan) => {
    setSelectedLoan(loan);
    setIsReportModalOpen(true);
  };

  const generateReport = (loan) => {
    const content = `
      SETTLEMENT REPORT
      =================
      Loan ID: ${loan?.id || 'N/A'}
      Customer: ${loan?.customer || loan?.dealerName || 'N/A'}
      Rice Type: ${loan?.riceType || 'N/A'}
      Quantity: ${loan?.quantity || 0} kg
      Loan Amount: Rs.${(loan?.loanAmount || loan?.amount || 0).toLocaleString('en-IN')}
      Interest: Rs.${(loan?.interest || 0).toLocaleString('en-IN')}
      Total Amount: Rs.${(loan?.totalAmount || loan?.settlementAmount || 0).toLocaleString('en-IN')}
      Settlement Amount: Rs.${(loan?.settlementAmount || loan?.totalAmount || 0).toLocaleString('en-IN')}
      Issue Date: ${loan?.issueDate ? new Date(loan.issueDate).toLocaleDateString('en-IN') : 'N/A'}
      Due Date: ${loan?.dueDate ? new Date(loan.dueDate).toLocaleDateString('en-IN') : 'N/A'}
      Settlement Date: ${loan?.settlementDate ? new Date(loan.settlementDate).toLocaleDateString('en-IN') : 'N/A'}
      Status: ${loan?.status || 'N/A'}
      Loan Officer: ${loan?.loanOfficer || 'John Smith'}
      Settlement Method: ${loan?.settlementMethod || 'Cash'}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlement-report-${loan?.id || 'unknown'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully!');
    setIsReportModalOpen(false);
    setSelectedLoan(null);
  };

  const exportAllReports = () => {
    if (filteredLoans.length === 0) {
      toast.error('No loans to export');
      return;
    }
    
    const combinedContent = filteredLoans.map(loan => `
      ========================================
      Settlement Report: ${loan?.id || 'N/A'}
      ========================================
      Customer: ${loan?.customer || loan?.dealerName || 'N/A'}
      Rice Type: ${loan?.riceType || 'N/A'}
      Quantity: ${loan?.quantity || 0} kg
      Loan Amount: Rs.${(loan?.loanAmount || loan?.amount || 0).toLocaleString('en-IN')}
      Settlement Amount: Rs.${(loan?.settlementAmount || loan?.totalAmount || 0).toLocaleString('en-IN')}
      Settlement Date: ${loan?.settlementDate ? new Date(loan.settlementDate).toLocaleDateString('en-IN') : 'N/A'}
      Status: ${loan?.status || 'N/A'}
      ========================================
    `).join('\n\n');

    const blob = new Blob([`SETTLED LOANS REPORT\nGenerated on: ${new Date().toLocaleDateString('en-IN')}\n\n${combinedContent}`], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-settled-loans-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredLoans.length} loan reports`);
  };

  // Helper function to format Sri Lanka rupee
  const formatLKR = (amount) => {
    return `Rs.${amount.toLocaleString('en-IN')}`;
  };

  // Calculate basic stats
  const calculateStats = () => {
    const totalSettled = settledLoans.length;
    const earlySettlements = settledLoans.filter(loan => loan?.status === 'Early Settlement').length;
    const earlySettlementRate = totalSettled > 0 ? (earlySettlements / totalSettled) * 100 : 0;
    
    const totalAmount = settledLoans.reduce((sum, loan) => sum + (loan?.totalAmount || loan?.settlementAmount || 0), 0);
    const totalInterest = settledLoans.reduce((sum, loan) => sum + (loan?.interest || 0), 0);
    const avgLoanSize = totalSettled > 0 ? totalAmount / totalSettled : 0;

    return {
      totalSettled,
      earlySettlements,
      earlySettlementRate,
      totalAmount,
      totalInterest,
      avgLoanSize
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/loan-management')}
            className="group p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:shadow-lg"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settled Loans</h1>
            <p className="text-gray-500">Historical record of completed and settled loans</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportAllReports}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export All
          </button>
        </div>
      </div>

      {/* Summary Cards - Only loan data, no profit */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Settled Loans */}
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transform group-hover:scale-110 transition-transform">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {stats.totalSettled}
            </h3>
            <p className="text-sm text-gray-600 mt-1 font-medium">Total Settled Loans</p>
            <p className="text-xs text-gray-500 mt-2">Completed loan transactions</p>
          </div>
        </div>

        {/* Total Settlement Value */}
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transform group-hover:scale-110 transition-transform">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              Rs.{stats.totalAmount.toLocaleString('en-IN')}
            </h3>
            <p className="text-sm text-gray-600 mt-1 font-medium">Total Settlement Value</p>
            <p className="text-xs text-gray-500 mt-2">Cumulative settled amount</p>
          </div>
        </div>

        {/* Total Interest Collected */}
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg transform group-hover:scale-110 transition-transform">
                <Scale className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              Rs.{stats.totalInterest.toLocaleString('en-IN')}
            </h3>
            <p className="text-sm text-gray-600 mt-1 font-medium">Total Interest Collected</p>
            <p className="text-xs text-gray-500 mt-2">Interest income from loans</p>
          </div>
        </div>

        {/* Early Settlements */}
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg transform group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {stats.earlySettlements}
            </h3>
            <p className="text-sm text-gray-600 mt-1 font-medium">Early Settlements</p>
            <p className="text-xs text-gray-500 mt-2">{stats.earlySettlementRate.toFixed(1)}% early settlement rate</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by customer, loan ID, or rice type..."
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
                <option value="Fully Settled">Fully Settled</option>
                <option value="Early Settlement">Early Settlement</option>
                <option value="Settled">Settled</option>
              </select>
            </div>
            <div className="flex items-center gap-3 bg-gray-50/50 rounded-xl px-4 py-3 border border-gray-200">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                className="bg-transparent focus:outline-none text-sm font-medium"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settled Loans Table - Full width on larger screens */}
        <div className="lg:col-span-3 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
                Settled Loans History
              </h3>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold">
                  {filteredLoans.length} records
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Interest</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Settlement Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{loan.id}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <User className="w-3 h-3" />
                            {loan.customer}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {loan.riceType} • {loan.quantity} kg
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatLKR(loan.loanAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-blue-600 font-medium">
                        {formatLKR(loan.interest)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {formatLKR(loan.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(loan.settlementDate).toLocaleDateString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Issued: {new Date(loan.issueDate).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadSettlementReport(loan)}
                          className="group px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredLoans.length === 0 && (
              <div className="text-center py-16">
                <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-400 text-lg font-medium mb-2">No settled loans found</div>
                <div className="text-sm text-gray-500">Try adjusting your search or filter criteria</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      {isReportModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-100">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Generate Report</h3>
                    <p className="text-sm text-gray-500">For loan: {selectedLoan.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4">
                <div className="font-bold text-gray-900 mb-2">{selectedLoan.customer}</div>
                <div className="text-sm text-gray-600">Settled on: {new Date(selectedLoan.settlementDate).toLocaleDateString('en-IN')}</div>
                <div className="text-lg font-bold text-gray-900 mt-2">
                  Total: {formatLKR(selectedLoan.totalAmount)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="text-sm text-gray-600">Loan Amount</div>
                  <div className="font-medium text-gray-900">{formatLKR(selectedLoan.loanAmount)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="text-sm text-gray-600">Interest</div>
                  <div className="font-medium text-blue-600">{formatLKR(selectedLoan.interest)}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Report Format
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => generateReport(selectedLoan)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-center"
                  >
                    <div className="font-medium text-gray-900 mb-1">Generate Text Report</div>
                    <div className="text-xs text-gray-500">.txt format</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => generateReport(selectedLoan)}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}