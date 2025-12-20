import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  IndianRupee as IndianRupeeIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Printer,
  Mail,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calculator,
  Percent,
  Shield,
  Banknote,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data for salary management
const mockWorkerData = {
  allWorkers: [
    {
      id: 'W001',
      name: 'Rajesh Perera',
      role: 'Driver',
      dailyWage: 1500,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
      bankAccount: '1234567890',
      bankName: 'Commercial Bank',
      ifsc: 'CB0123456',
      attendance: {
        presentDays: 22,
        totalDays: 26,
        lateArrivals: 2,
        earlyLeaves: 1
      }
    },
    {
      id: 'W002',
      name: 'Kamal Silva',
      role: 'General Worker',
      dailyWage: 1200,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kamal',
      bankAccount: '2345678901',
      bankName: 'People\'s Bank',
      ifsc: 'PB0123457',
      attendance: {
        presentDays: 20,
        totalDays: 26,
        lateArrivals: 5,
        earlyLeaves: 0
      }
    },
    {
      id: 'W003',
      name: 'Sunil Bandara',
      role: 'Supervisor',
      dailyWage: 2000,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunil',
      bankAccount: '3456789012',
      bankName: 'Bank of Ceylon',
      ifsc: 'BC0123458',
      attendance: {
        presentDays: 24,
        totalDays: 26,
        lateArrivals: 0,
        earlyLeaves: 0
      }
    },
    {
      id: 'W004',
      name: 'Nimal Fernando',
      role: 'Driver',
      dailyWage: 1400,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nimal',
      bankAccount: '4567890123',
      bankName: 'Hatton National Bank',
      ifsc: 'HN0123459',
      attendance: {
        presentDays: 18,
        totalDays: 26,
        lateArrivals: 8,
        earlyLeaves: 2
      }
    },
    {
      id: 'W005',
      name: 'Anil Rathnayake',
      role: 'General Worker',
      dailyWage: 1100,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anil',
      bankAccount: '5678901234',
      bankName: 'Sampath Bank',
      ifsc: 'SB0123460',
      attendance: {
        presentDays: 21,
        totalDays: 26,
        lateArrivals: 3,
        earlyLeaves: 1
      }
    },
    {
      id: 'W006',
      name: 'Saman Kumara',
      role: 'General Worker',
      dailyWage: 1150,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=saman',
      bankAccount: '6789012345',
      bankName: 'NDB Bank',
      ifsc: 'ND0123461',
      attendance: {
        presentDays: 19,
        totalDays: 26,
        lateArrivals: 6,
        earlyLeaves: 3
      }
    },
    {
      id: 'W007',
      name: 'Chandana Perera',
      role: 'Driver',
      dailyWage: 1550,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chandana',
      bankAccount: '7890123456',
      bankName: 'Commercial Bank',
      ifsc: 'CB0123462',
      attendance: {
        presentDays: 23,
        totalDays: 26,
        lateArrivals: 1,
        earlyLeaves: 0
      }
    }
  ]
};

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
            {trend > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900">
        {unit === "₹" && "₹"}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit === "kg" && " kg"}
      </h3>
      <p className="text-sm text-gray-600 mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    Paid: { 
      text: 'Paid', 
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: CheckCircle 
    },
    Pending: { 
      text: 'Pending', 
      color: 'bg-amber-100 text-amber-700 border border-amber-200',
      icon: Clock 
    },
    Overdue: { 
      text: 'Overdue', 
      color: 'bg-red-100 text-red-700 border border-red-200',
      icon: XCircle 
    }
  }[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: Clock };

  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {config.text}
    </span>
  );
};

// Payment Receipt Modal Component
const PaymentReceiptModal = ({ isOpen, onClose, worker, salaryData }) => {
  if (!isOpen || !worker) return null;

  const receiptData = {
    receiptNumber: `REC-${Date.now().toString().slice(-8)}`,
    paymentDate: new Date().toLocaleDateString(),
    paymentMethod: 'Bank Transfer',
    transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    workingDays: salaryData.workingDays,
    totalDays: 26,
    attendancePercentage: Math.round((salaryData.workingDays / 26) * 100),
    lateArrivals: worker.attendance.lateArrivals,
    earlyLeaves: worker.attendance.earlyLeaves
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    toast.success('Receipt sent to worker\'s email');
    onClose();
  };

  const handleDownload = () => {
    toast.success('Receipt downloaded successfully');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
                <p className="text-sm text-gray-600 mt-1">Salary payment confirmation for {worker.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Receipt Content */}
          <div className="p-6">
            {/* Company Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Sri Lanka Rice Mills</h1>
              <p className="text-gray-600">No. 123, Galle Road, Colombo 03</p>
              <p className="text-gray-600">Phone: +94 11 234 5678 | Email: accounts@ricemills.lk</p>
            </div>
            
            {/* Receipt Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Employee Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={worker.photo} 
                        alt={worker.name}
                        className="h-12 w-12 rounded-lg"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{worker.name}</div>
                        <div className="text-sm text-gray-600">ID: {worker.id} • {worker.role}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{worker.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account:</span>
                        <span className="font-medium">{worker.bankAccount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IFSC:</span>
                        <span className="font-medium">{worker.ifsc}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Attendance Summary</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Working Days:</span>
                        <span className="font-bold">{receiptData.workingDays}/{receiptData.totalDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Attendance Rate:</span>
                        <span className="font-bold text-emerald-600">{receiptData.attendancePercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Late Arrivals:</span>
                        <span className="font-bold">{receiptData.lateArrivals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Early Leaves:</span>
                        <span className="font-bold">{receiptData.earlyLeaves}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Details</h4>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Receipt No:</span>
                        <span className="font-medium">{receiptData.receiptNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Date:</span>
                        <span className="font-medium">{receiptData.paymentDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{receiptData.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium">{receiptData.transactionId}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Salary Breakdown</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Basic Salary:</span>
                        <span className="font-medium">₹{salaryData.basicSalary?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Salary:</span>
                        <span className="text-lg font-bold text-gray-900">₹{salaryData.netSalary?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="text-2xl font-bold text-emerald-600">₹{salaryData.netSalary?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Signature Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-center">
                    <div className="border-b border-gray-400 pb-1 mb-2 inline-block">
                      <span className="text-sm font-medium">Employee Signature</span>
                    </div>
                    <div className="h-16"></div>
                  </div>
                </div>
                <div>
                  <div className="text-center">
                    <div className="border-b border-gray-400 pb-1 mb-2 inline-block">
                      <span className="text-sm font-medium">Authorized Signature</span>
                    </div>
                    <div className="h-16"></div>
                    <div className="text-sm font-medium text-gray-900">Sri Lanka Rice Mills</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Note */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                This is a computer-generated receipt. No physical signature required.
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send to Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export function SalaryManagement() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  const [salaryData, setSalaryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    // Calculate salary for each worker
    const data = mockWorkerData.allWorkers.map(worker => {
      const workingDays = worker.attendance.presentDays;
      const basicSalary = parseInt(worker.dailyWage || 0) * workingDays;
      const netSalary = basicSalary;
      const status = Math.random() > 0.7 ? 'Paid' : 'Pending';

      return {
        ...worker,
        workingDays,
        basicSalary,
        netSalary,
        status
      };
    });

    setSalaryData(data);
  }, [selectedMonth]);

  const filteredData = salaryData.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePaySalary = (workerId) => {
    setSalaryData(prev => prev.map(worker =>
      worker.id === workerId ? { ...worker, status: 'Paid' } : worker
    ));
    toast.success('Salary marked as paid');
  };

  const handleGenerateReceipt = (worker) => {
    const workerSalaryData = salaryData.find(w => w.id === worker.id);
    setSelectedWorker({ ...worker, salaryData: workerSalaryData });
    setShowReceipt(true);
  };

  // Calculate summary stats
  const totalSalary = salaryData.reduce((sum, worker) => sum + worker.netSalary, 0);
  const paidSalary = salaryData
    .filter(worker => worker.status === 'Paid')
    .reduce((sum, worker) => sum + worker.netSalary, 0);
  const pendingSalary = salaryData
    .filter(worker => worker.status === 'Pending')
    .reduce((sum, worker) => sum + worker.netSalary, 0);
  const averageSalary = salaryData.length > 0 ? Math.round(totalSalary / salaryData.length) : 0;
  const paidEmployees = salaryData.filter(worker => worker.status === 'Paid').length;
  const pendingEmployees = salaryData.filter(worker => worker.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salary Management System</h1>
            <p className="text-gray-600 mt-2">Process salaries, generate receipts, and track payments</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent focus:outline-none text-sm font-medium"
              />
            </div>
            <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Payroll
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Total Payroll" 
            value={totalSalary} 
            subtitle={`${salaryData.length} employees`} 
            icon={IndianRupeeIcon} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            trend={+8.2} 
            unit="₹"
          />
          <KpiCard 
            title="Paid Salary" 
            value={paidSalary} 
            subtitle={`${paidEmployees} employees paid`} 
            icon={CheckCircle} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            trend={+12.4} 
            unit="₹"
          />
          <KpiCard 
            title="Pending Salary" 
            value={pendingSalary} 
            subtitle={`${pendingEmployees} pending payments`} 
            icon={AlertCircle} 
            color="bg-gradient-to-br from-amber-500 to-orange-600" 
            trend={-3.1} 
            unit="₹"
          />
          <KpiCard 
            title="Avg Salary" 
            value={averageSalary} 
            subtitle="Per employee" 
            icon={Calculator} 
            color="bg-gradient-to-br from-purple-500 to-pink-600" 
            trend={+5.7} 
            unit="₹"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Paid Employees" 
            value={paidEmployees} 
            subtitle="Salary processed" 
            icon={Users} 
            color="bg-gradient-to-br from-green-500 to-emerald-600" 
            trend={+25} 
          />
          <KpiCard 
            title="Pending Payments" 
            value={pendingEmployees} 
            subtitle="Requires action" 
            icon={Clock} 
            color="bg-gradient-to-br from-red-500 to-rose-600" 
            trend={-15} 
          />
          <KpiCard 
            title="Avg Attendance" 
            value="89%" 
            subtitle="This month" 
            icon={Percent} 
            color="bg-gradient-to-br from-cyan-500 to-blue-600" 
            trend={+2.8} 
          />
          <KpiCard 
            title="Bank Transfers" 
            value={paidEmployees} 
            subtitle="Processed successfully" 
            icon={CreditCard} 
            color="bg-gradient-to-br from-indigo-500 to-purple-600" 
            trend={+18} 
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 mb-8 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, ID, or bank account..."
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Employee Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Working Days
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bank Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={worker.photo} 
                          alt={worker.name}
                          className="h-12 w-12 rounded-2xl border-2 border-gray-200"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{worker.name}</div>
                          <div className="text-xs text-gray-500">ID: {worker.id}</div>
                          <div className="text-sm text-gray-600">{worker.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-gray-900">{worker.workingDays}/26</div>
                        <div className="text-sm text-gray-600">
                          {Math.round((worker.workingDays / 26) * 100)}% attendance
                        </div>
                        <div className="text-xs text-amber-600">
                          Late: {worker.attendance.lateArrivals} • Early: {worker.attendance.earlyLeaves}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{worker.basicSalary?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          ₹{worker.dailyWage?.toLocaleString()} × {worker.workingDays} days
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{worker.bankName}</div>
                        <div className="text-xs text-gray-600">Acc: {worker.bankAccount}</div>
                        <div className="text-xs text-gray-600">IFSC: {worker.ifsc}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xl font-bold text-gray-900">
                        ₹{worker.netSalary?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={worker.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {worker.status === 'Pending' && (
                          <button
                            onClick={() => handlePaySalary(worker.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition flex items-center gap-1"
                            title="Mark as paid"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Pay Now
                          </button>
                        )}
                        {worker.status === 'Paid' && (
                          <button
                            onClick={() => handleGenerateReceipt(worker)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition flex items-center gap-1"
                            title="Generate receipt"
                          >
                            <FileText className="h-3 w-3" />
                            Receipt
                          </button>
                        )}
                        <button 
                          onClick={() => handleGenerateReceipt(worker)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-400 text-lg font-medium mb-2">No employees found</div>
              <div className="text-sm text-gray-500">
                {searchTerm ? 'Try a different search term' : 'No salary data available'}
              </div>
            </div>
          )}

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center gap-4">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <span className="text-sm text-gray-700">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Summary Footer */}
          {filteredData.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-700">
                  <span className="font-bold">Total Payable:</span> ₹{totalSalary.toLocaleString()} | 
                  <span className="text-emerald-600 font-bold ml-4"> Paid:</span> ₹{paidSalary.toLocaleString()} | 
                  <span className="text-amber-600 font-bold ml-4"> Pending:</span> ₹{pendingSalary.toLocaleString()}
                </div>
                <div className="mt-2 sm:mt-0 text-sm text-gray-600">
                  {paidEmployees} paid • {pendingEmployees} pending
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal 
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setSelectedWorker(null);
        }}
        worker={selectedWorker}
        salaryData={selectedWorker?.salaryData}
      />
    </div>
  );
}

export default SalaryManagement;