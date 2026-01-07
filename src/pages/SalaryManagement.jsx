import React, { useState, useEffect } from 'react';
import { ref, onValue, get, set, update, push } from 'firebase/database';
import { rtdb as db } from '../firebase/config';
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
  CreditCard,
  Loader2,
  Database,
  RefreshCw,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import PopupAlert from '../components/ui/PopupAlert';

// Utility functions
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helpers
const parseCurrency = (val) => {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const digits = val.replace(/[^0-9.\-]/g, '');
    const n = Number(digits);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
};

const normalizeSalaryEntry = (key, raw) => {
  const entry = { id: key, ...(raw || {}) };
  entry.dailyWage = parseCurrency(entry.dailyWage);
  entry.basicSalary = parseCurrency(entry.basicSalary || entry.basic_salary || entry.basic);
  entry.netSalary = parseCurrency(entry.netSalary || entry.net_salary || entry.salary || entry.net);
  entry.workingDays = Number(entry.workingDays) || Number(entry.working_days) || 0;
  entry.attendance = entry.attendance || {};
  entry.attendance.presentDays = Number(entry.attendance.presentDays) || Number(entry.attendance.present_days) || 0;
  entry.attendance.totalDays = Number(entry.attendance.totalDays) || 26;
  entry.attendance.lateArrivals = Number(entry.attendance.lateArrivals) || 0;
  entry.attendance.earlyLeaves = Number(entry.attendance.earlyLeaves) || 0;
  if (entry.status) entry.status = String(entry.status).charAt(0).toUpperCase() + String(entry.status).slice(1);
  return entry;
};

const generateWorkerId = () => {
  return `W${Date.now().toString().slice(-6)}`;
};

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
        {unit === "Rs." && "Rs."}
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
    workingDays: salaryData?.workingDays || 0,
    totalDays: 26,
    attendancePercentage: Math.round(((salaryData?.workingDays || 0) / 26) * 100),
    lateArrivals: worker.attendance?.lateArrivals || 0,
    earlyLeaves: worker.attendance?.earlyLeaves || 0
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
          
          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Sri Lanka Rice Mills</h1>
              <p className="text-gray-600">No. 123, Galle Road, Colombo 03</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Employee Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
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
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Salary Breakdown</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Basic Salary:</span>
                        <span className="font-medium">Rs.{(salaryData?.basicSalary || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Salary:</span>
                        <span className="text-lg font-bold text-gray-900">Rs.{(salaryData?.netSalary || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="text-2xl font-bold text-emerald-600">Rs.{(salaryData?.netSalary || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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
  );
};

// Add Worker Modal Component
const AddWorkerModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'General Worker',
    dailyWage: 1000,
    bankName: 'Commercial Bank',
    bankAccount: '',
    ifsc: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.dailyWage && formData.bankAccount) {
      onSave(formData);
      setFormData({
        name: '',
        role: 'General Worker',
        dailyWage: 1000,
        bankName: 'Commercial Bank',
        bankAccount: '',
        ifsc: '',
        phone: '',
        address: ''
      });
      onClose();
    } else {
      toast.error('Please fill all required fields');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-md my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Worker</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="General Worker">General Worker</option>
                  <option value="Driver">Driver</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Manager">Manager</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Wage (Rs.) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.dailyWage}
                  onChange={(e) => setFormData({...formData, dailyWage: parseInt(e.target.value) || 1000})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              >
                <option value="Commercial Bank">Commercial Bank</option>
                <option value="People's Bank">People's Bank</option>
                <option value="Bank of Ceylon">Bank of Ceylon</option>
                <option value="Hatton National Bank">Hatton National Bank</option>
                <option value="Sampath Bank">Sampath Bank</option>
                <option value="NDB Bank">NDB Bank</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.ifsc}
                  onChange={(e) => setFormData({...formData, ifsc: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Add Worker
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Component
export function SalaryManagement() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [searchTerm, setSearchTerm] = useState('');
  const [salaryData, setSalaryData] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupAlert, setPopupAlert] = useState({ isOpen: false, type: 'success', title: '', message: '', details: [] });
  const [databaseStatus, setDatabaseStatus] = useState({
    hasWorkers: false,
    hasSalaries: false,
    workerCount: 0,
    salaryCount: 0,
    seeded: false
  });

  // Check and initialize Firebase database
  const initializeDatabase = async () => {
    try {
      setLoading(true);
      console.log('Initializing Firebase database...');

      // Check workers under /workers node
      const workersRef = ref(db, 'workers');
      const workersSnapshot = await get(workersRef);
      const workersCount = workersSnapshot.exists() ? Object.keys(workersSnapshot.val()).length : 0;

      // Check if salaries exist for current month
      const salariesRef = ref(db, `salaries/${selectedMonth}`);
      const salariesSnapshot = await get(salariesRef);
      const salariesCount = salariesSnapshot.exists() ? Object.keys(salariesSnapshot.val()).length : 0;

      setDatabaseStatus({
        hasWorkers: workersCount > 0,
        hasSalaries: salariesCount > 0,
        workerCount: workersCount,
        salaryCount: salariesCount,
        seeded: false
      });

      console.log('Database status:', {
        hasWorkers: workersCount > 0,
        hasSalaries: salariesCount > 0,
        workerCount: workersCount,
        salaryCount: salariesCount
      });
    } catch (error) {
      console.error('Error initializing database:', error);
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'Database Error',
        message: 'Failed to initialize salary database.',
        details: [error.message || 'Unknown error']
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data from Firebase
  useEffect(() => {
    initializeDatabase();

    // Listen to workers data
    const workersRef = ref(db, 'workers');
    const unsubscribeWorkers = onValue(workersRef, (snapshot) => {
      if (snapshot.exists()) {
        const workersData = snapshot.val();
        const workersList = Object.keys(workersData).map(key => ({
          id: key,
          ...workersData[key]
        }));
        setWorkers(workersList);
        console.log('Workers loaded:', workersList);
      } else {
        setWorkers([]);
      }
    });

    // Listen to salaries
    const salariesRef = ref(db, `salaries/${selectedMonth}`);
    const unsubscribeSalaries = onValue(salariesRef, (snapshot) => {
      if (snapshot.exists()) {
        const salariesData = snapshot.val();
        const salariesList = Object.keys(salariesData)
          .map(key => normalizeSalaryEntry(key, salariesData[key]))
          .filter(e => e && e.id && (e.name || e.workerId));
        
        console.log('Salaries loaded:', salariesList);
        setSalaryData(salariesList);
      } else {
        // If no salary data exists for this month, we'll create from workers
        console.log('No salaries found for this month');
        setSalaryData([]);
      }
    });

    return () => {
      unsubscribeWorkers();
      unsubscribeSalaries();
    };
  }, [selectedMonth]);

  // Update salary data when workers change or month changes
  useEffect(() => {
    const loadOrCreateSalaryData = async () => {
      try {
        const salariesRef = ref(db, `salaries/${selectedMonth}`);
        const salariesSnapshot = await get(salariesRef);
        
        if (salariesSnapshot.exists()) {
          const salariesData = salariesSnapshot.val();
          const salariesList = Object.keys(salariesData)
            .map(key => normalizeSalaryEntry(key, salariesData[key]))
            .filter(e => e && e.id);
          
          console.log('Loaded existing salaries:', salariesList);
          setSalaryData(salariesList);
        } else if (workers.length > 0) {
          // Create salary entries from workers for this month
          console.log('Creating salary entries from workers...');
          const salaryPromises = workers.map(async (worker) => {
            const workerSalaryRef = ref(db, `salaries/${selectedMonth}/${worker.id}`);
            const existingSalary = await get(workerSalaryRef);
            
            if (!existingSalary.exists()) {
              // Create new salary entry
              const newSalary = {
                workerId: worker.id,
                name: worker.name,
                role: worker.role || 'General Worker',
                bankAccount: worker.bankAccount || '',
                bankName: worker.bankName || 'Commercial Bank',
                ifsc: worker.ifsc || '',
                dailyWage: worker.dailyWage || 1000,
                workingDays: 0,
                basicSalary: 0,
                netSalary: 0,
                status: 'Pending',
                attendance: {
                  presentDays: 0,
                  totalDays: 26,
                  lateArrivals: 0,
                  earlyLeaves: 0
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              await set(workerSalaryRef, newSalary);
              return newSalary;
            } else {
              return normalizeSalaryEntry(worker.id, existingSalary.val());
            }
          });
          
          const createdSalaries = await Promise.all(salaryPromises);
          const validSalaries = createdSalaries.filter(s => s && s.id);
          console.log('Created salaries:', validSalaries);
          setSalaryData(validSalaries);
        } else {
          setSalaryData([]);
        }
      } catch (error) {
        console.error('Error loading/creating salary data:', error);
      }
    };

    if (workers.length > 0 || selectedMonth) {
      loadOrCreateSalaryData();
    }
  }, [selectedMonth, workers]);

  const filteredData = salaryData.filter(worker =>
    worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.bankAccount?.includes(searchTerm)
  );

  const sanitizedData = filteredData.map(w => ({
    ...w,
    basicSalary: parseCurrency(w.basicSalary),
    netSalary: parseCurrency(w.netSalary),
    dailyWage: parseCurrency(w.dailyWage) || 1000,
    workingDays: Number(w.workingDays) || 0
  }));

  // Calculate basic salary from daily wage and working days
  const calculateBasicSalary = (worker) => {
    const dailyWage = parseCurrency(worker.dailyWage) || 1000;
    const workingDays = Number(worker.workingDays) || 0;
    return dailyWage * workingDays;
  };

  // Calculate net salary (basic + adjustments)
  const calculateNetSalary = (worker) => {
    const basic = calculateBasicSalary(worker);
    return basic;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sanitizedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Add new worker
  const handleAddWorker = async (workerData) => {
    try {
      const workerId = generateWorkerId();
      
      // Save worker under /workers node
      const workerRef = ref(db, `workers/${workerId}`);
      
      const newWorker = {
        id: workerId,
        name: workerData.name,
        role: workerData.role,
        dailyWage: parseInt(workerData.dailyWage) || 1000,
        bankAccount: workerData.bankAccount,
        bankName: workerData.bankName,
        ifsc: workerData.ifsc,
        phone: workerData.phone,
        address: workerData.address,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await set(workerRef, newWorker);

      // Initialize salary for current month
      const salaryRef = ref(db, `salaries/${selectedMonth}/${workerId}`);
      const newSalary = {
        workerId: workerId,
        name: newWorker.name,
        role: newWorker.role,
        bankAccount: newWorker.bankAccount,
        bankName: newWorker.bankName,
        ifsc: newWorker.ifsc,
        dailyWage: newWorker.dailyWage,
        workingDays: 0,
        basicSalary: 0,
        netSalary: 0,
        status: 'Pending',
        attendance: {
          presentDays: 0,
          totalDays: 26,
          lateArrivals: 0,
          earlyLeaves: 0
        },
        paymentDate: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await set(salaryRef, newSalary);

      // Also add to local state for immediate UI update
      setWorkers(prev => [...prev, newWorker]);
      setSalaryData(prev => [...prev, newSalary]);
      setPopupAlert({
        isOpen: true,
        type: 'success',
        title: 'Worker Added',
        message: `${workerData.name} added with a salary profile for ${selectedMonth}.`,
        details: []
      });
    } catch (error) {
      console.error('Error adding worker:', error);
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'Add Worker Failed',
        message: 'Could not add the worker. Please try again.',
        details: [error.message || 'Unknown error']
      });
    }
  };

  // Pay salary
  const handlePaySalary = async (workerId) => {
    try {
      const worker = salaryData.find(w => w.id === workerId);
      if (!worker) return;
      
      // Calculate salaries
      const basicSalary = calculateBasicSalary(worker);
      const netSalary = calculateNetSalary(worker);
      
      const salaryRef = ref(db, `salaries/${selectedMonth}/${workerId}`);
      
      const updates = {
        status: 'Paid',
        workingDays: worker.workingDays || 0,
        basicSalary: basicSalary,
        netSalary: netSalary,
        paymentDate: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await update(salaryRef, updates);

      // Record payment
      try {
        const amount = netSalary;
        const paymentRecord = {
          workerId,
          name: worker.name || null,
          amount,
          method: 'Bank Transfer',
          transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
          paymentDate: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        const paymentRef = ref(db, `payments/${selectedMonth}/${workerId}/${Date.now()}`);
        await set(paymentRef, paymentRecord);
      } catch (err) {
        console.warn('Failed to write payment record:', err);
      }

      // Optimistic update
      setSalaryData(prev => prev.map(w =>
        w.id === workerId ? { ...w, ...updates } : w
      ));
      setPopupAlert({
        isOpen: true,
        type: 'success',
        title: 'Salary Paid',
        message: `${worker.name || 'Worker'} marked as paid for ${selectedMonth}.`,
        details: [`Amount: Rs.${netSalary.toLocaleString()}`]
      });
    } catch (error) {
      console.error('Error paying salary:', error);
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'Payment Failed',
        message: 'Could not mark salary as paid.',
        details: [error.message || 'Unknown error']
      });
    }
  };

  // Delete worker
  const handleDeleteWorker = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        // Delete from workers
        const workerRef = ref(db, `workers/${workerId}`);
        await set(workerRef, null);

        // Delete from salaries for current month
        const salaryRef = ref(db, `salaries/${selectedMonth}/${workerId}`);
        await set(salaryRef, null);

        // Update local state
        setWorkers(prev => prev.filter(w => w.id !== workerId));
        setSalaryData(prev => prev.filter(w => w.id !== workerId));
        setPopupAlert({
          isOpen: true,
          type: 'success',
          title: 'Worker Deleted',
          message: 'The worker and salary entry were removed.',
          details: []
        });
      } catch (error) {
        console.error('Error deleting worker:', error);
        setPopupAlert({
          isOpen: true,
          type: 'error',
          title: 'Delete Failed',
          message: 'Unable to delete this worker.',
          details: [error.message || 'Unknown error']
        });
      }
    }
  };

  // Generate receipt
  const handleGenerateReceipt = (worker) => {
    setSelectedWorker(worker);
    setShowReceipt(true);
  };

  // Update working days
  const handleUpdateWorkingDays = async (workerId, days) => {
    try {
      const salaryRef = ref(db, `salaries/${selectedMonth}/${workerId}`);
      const worker = salaryData.find(w => w.id === workerId);
      
      if (worker) {
        const workingDays = Math.max(0, Math.min(26, parseInt(days) || 0));
        const basicSalary = (worker.dailyWage || 1000) * workingDays;
        const netSalary = basicSalary;
        
        const updates = {
          workingDays: workingDays,
          basicSalary: basicSalary,
          netSalary: netSalary,
          updated_at: new Date().toISOString()
        };
        
        await update(salaryRef, updates);
        
        // Optimistic update
        setSalaryData(prev => prev.map(w =>
          w.id === workerId ? { ...w, ...updates } : w
        ));

        setPopupAlert({
          isOpen: true,
          type: 'success',
          title: 'Working Days Updated',
          message: 'Attendance details saved for this worker.',
          details: []
        });
      }
    } catch (error) {
      console.error('Error updating working days:', error);
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update working days.',
        details: [error.message || 'Unknown error']
      });
    }
  };

  // Calculate statistics
  const totalSalary = sanitizedData.reduce((sum, worker) => {
    const net = calculateNetSalary(worker);
    return sum + (net || 0);
  }, 0);
  
  const paidSalary = sanitizedData
    .filter(worker => worker.status === 'Paid')
    .reduce((sum, worker) => {
      const net = calculateNetSalary(worker);
      return sum + (net || 0);
    }, 0);
    
  const pendingSalary = sanitizedData
    .filter(worker => worker.status === 'Pending')
    .reduce((sum, worker) => {
      const net = calculateNetSalary(worker);
      return sum + (net || 0);
    }, 0);
    
  const averageSalary = sanitizedData.length > 0 ? Math.round(totalSalary / sanitizedData.length) : 0;
  const paidEmployees = sanitizedData.filter(worker => worker.status === 'Paid').length;
  const pendingEmployees = sanitizedData.filter(worker => worker.status === 'Pending').length;
  const totalEmployees = sanitizedData.length;
  const attendanceRate = sanitizedData.length > 0 
    ? Math.round(sanitizedData.reduce((sum, worker) => sum + (worker.workingDays || 0), 0) / (sanitizedData.length * 26) * 100)
    : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">Loading Salary Data...</h2>
          <p className="text-gray-500 mt-2">Connecting to Firebase Database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Firebase Status Banner */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-lg border p-6 mb-8 ${
          databaseStatus.hasWorkers 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${
                databaseStatus.hasWorkers 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-amber-100 text-amber-600'
              }`}>
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {databaseStatus.hasWorkers ? '✅ Firebase Connected' : '⚠️ No Workers Found'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {databaseStatus.hasWorkers 
                    ? `${databaseStatus.workerCount} workers found • ${databaseStatus.salaryCount} salary records`
                    : 'No workers found — add workers to populate payroll'}
                </p>
              </div>
            </div>
            <button
              onClick={() => initializeDatabase()}
              className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salary Management System</h1>
            <p className="text-gray-600 mt-2">
              {salaryData.length} employees • {selectedMonth} • Real-time Firebase Database
            </p>
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
            <button
              onClick={() => setShowAddWorker(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Worker
            </button>
            <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2">
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
            subtitle={`${totalEmployees} employees`} 
            icon={IndianRupeeIcon} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            trend={+8.2} 
            unit="Rs."
          />
          <KpiCard 
            title="Paid Salary" 
            value={paidSalary} 
            subtitle={`${paidEmployees} employees paid`} 
            icon={CheckCircle} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            trend={+12.4} 
            unit="Rs."
          />
          <KpiCard 
            title="Pending Salary" 
            value={pendingSalary} 
            subtitle={`${pendingEmployees} pending payments`} 
            icon={AlertCircle} 
            color="bg-gradient-to-br from-amber-500 to-orange-600" 
            trend={-3.1} 
            unit="Rs."
          />
          <KpiCard 
            title="Avg Salary" 
            value={averageSalary} 
            subtitle="Per employee" 
            icon={Calculator} 
            color="bg-gradient-to-br from-purple-500 to-pink-600" 
            trend={+5.7} 
            unit="Rs."
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
                  placeholder="Search by name, ID, role, or bank account..."
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
                    Daily Wage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bank Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Salary Calculation
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
                {currentItems.map((worker) => {
                  const basicSalary = calculateBasicSalary(worker);
                  const netSalary = calculateNetSalary(worker);
                  
                  return (
                    <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border-2 border-gray-200">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{worker.name || `Worker ${worker.id}`}</div>
                            <div className="text-xs text-gray-500">ID: {worker.id}</div>
                            <div className="text-sm text-gray-600">{worker.role || 'General Worker'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="26"
                              value={worker.workingDays || 0}
                              onChange={(e) => handleUpdateWorkingDays(worker.id, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center text-sm"
                            />
                            <span className="text-gray-600">/26</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round(((worker.workingDays || 0) / 26) * 100)}% attendance
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900">
                            Rs.{(worker.dailyWage || 1000).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            per day
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">{worker.bankName || 'Commercial Bank'}</div>
                          <div className="text-xs text-gray-600">Acc: {worker.bankAccount || 'N/A'}</div>
                          <div className="text-xs text-gray-600">IFSC: {worker.ifsc || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            <span className="font-semibold">Basic:</span> Rs.{basicSalary.toLocaleString()}
                          </div>
                          <div className="text-lg font-bold text-emerald-600">
                            Rs.{netSalary.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(worker.dailyWage || 1000).toLocaleString()} × {(worker.workingDays || 0)} days
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={worker.status || 'Pending'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {(!worker.status || worker.status === 'Pending') && netSalary > 0 && (
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
                          <button
                            onClick={() => handleDeleteWorker(worker.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Delete worker"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-400 text-lg font-medium mb-2">No employees found</div>
              <div className="text-sm text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Add workers to get started'}
              </div>
              <button
                onClick={() => setShowAddWorker(true)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add First Worker
              </button>
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
                  <span className="font-bold">Total Payable:</span> Rs.{totalSalary.toLocaleString()} | 
                  <span className="text-emerald-600 font-bold ml-4"> Paid:</span> Rs.{paidSalary.toLocaleString()} | 
                  <span className="text-amber-600 font-bold ml-4"> Pending:</span> Rs.{pendingSalary.toLocaleString()}
                </div>
                <div className="mt-2 sm:mt-0 text-sm text-gray-600">
                  {paidEmployees} paid • {pendingEmployees} pending • {attendanceRate}% avg attendance
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
        salaryData={selectedWorker}
      />

      {/* Add Worker Modal */}
      <AddWorkerModal
        isOpen={showAddWorker}
        onClose={() => setShowAddWorker(false)}
        onSave={handleAddWorker}
      />

      <PopupAlert
        isOpen={popupAlert.isOpen}
        type={popupAlert.type}
        title={popupAlert.title}
        message={popupAlert.message}
        details={popupAlert.details}
        onClose={() => setPopupAlert(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default SalaryManagement;