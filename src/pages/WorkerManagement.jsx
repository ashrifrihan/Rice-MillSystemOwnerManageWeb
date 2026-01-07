import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { rtdb as db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { filterSnapshotByOwner, getCurrentUserEmail } from '../utils/firebaseFilters';
import {
  Search, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Truck, User, Shield, 
  Users, X, Loader2, Database, Phone, Mail, ChevronLeft, ChevronRight,
  IndianRupee as IndianRupeeIcon, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const storage = getStorage();

// ==================== UTILITY FUNCTIONS ====================
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

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const generateWorkerId = () => `W${Date.now().toString().slice(-6)}`;

// ==================== KPI CARD ====================
const KpiCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow border border-gray-100 p-6 hover:shadow-lg transition">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  </div>
);

// ==================== STATUS BADGE ====================
const StatusBadge = ({ status }) => {
  const config = {
    active: { text: 'Active', bg: 'bg-emerald-100', color: 'text-emerald-700', icon: CheckCircle },
    pending: { text: 'Pending', bg: 'bg-amber-100', color: 'text-amber-700', icon: Clock },
    rejected: { text: 'Rejected', bg: 'bg-red-100', color: 'text-red-700', icon: XCircle },
    present: { text: 'Present', bg: 'bg-emerald-100', color: 'text-emerald-700', icon: CheckCircle },
    absent: { text: 'Absent', bg: 'bg-red-100', color: 'text-red-700', icon: XCircle },
    'On Leave': { text: 'On Leave', bg: 'bg-amber-100', color: 'text-amber-700', icon: Clock },
    Paid: { text: 'Paid', bg: 'bg-emerald-100', color: 'text-emerald-700', icon: CheckCircle },
    Pending: { text: 'Pending', bg: 'bg-amber-100', color: 'text-amber-700', icon: Clock },
  }[status] || { text: 'Unknown', bg: 'bg-gray-100', color: 'text-gray-700', icon: Clock };

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {config.text}
    </span>
  );
};

// ==================== ROLE BADGE ====================
const RoleBadge = ({ role, type }) => {
  const config = {
    driver: { color: 'bg-blue-100 text-blue-700', icon: Truck },
    worker: { color: 'bg-green-100 text-green-700', icon: User },
    supervisor: { color: 'bg-purple-100 text-purple-700', icon: Shield }
  }[type?.toLowerCase()] || { color: 'bg-gray-100 text-gray-700', icon: User };

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {role}
    </span>
  );
};

// ==================== MAIN COMPONENT ====================
export function WorkerManagement() {
  // STATE
  const { user } = useAuth();
  const userEmail = getCurrentUserEmail(user);
  const [activeTab, setActiveTab] = useState('workers');
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [salaryData, setSalaryData] = useState([]);
  const [workLogsData, setWorkLogsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [databaseStatus, setDatabaseStatus] = useState({ hasWorkers: false, workerCount: 0 });

  // LOAD DATA FROM FIREBASE
  useEffect(() => {
    if (!userEmail) return;
    
    setLoading(true);

    const workersRef = ref(db, 'workers');
    const unsubWorkers = onValue(workersRef, (snap) => {
      const list = filterSnapshotByOwner(snap, userEmail);
      setWorkers(list);
      setDatabaseStatus({ hasWorkers: list.length > 0, workerCount: list.length });
    });

    const attendanceRef = ref(db, `attendance/${selectedDate}`);
    const unsubAttendance = onValue(attendanceRef, (snap) => {
      setAttendance(snap.val() || {});
    });

    const salariesRef = ref(db, `salaries/${selectedMonth}`);
    const unsubSalaries = onValue(salariesRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setSalaryData(list);
      } else {
        setSalaryData([]);
      }
    });

    const logsRef = ref(db, 'workLogs');
    const unsubLogs = onValue(logsRef, (snap) => {
      const list = filterSnapshotByOwner(snap, userEmail);
      setWorkLogsData(list.filter(l => l.date === selectedDate));
    });

    setLoading(false);

    return () => {
      unsubWorkers();
      unsubAttendance();
      unsubSalaries();
      unsubLogs();
    };
  }, [selectedDate, selectedMonth, userEmail]);

  // HANDLERS
  const handleAddWorker = async (workerData) => {
    try {
      const workerId = generateWorkerId();
      const newWorker = {
        ...workerData,
        owner_email: userEmail,
        status: 'pending',
        approved: false,
        joinDate: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      await set(ref(db, `workers/${workerId}`), newWorker);

      const newSalary = {
        workerId, name: newWorker.name, role: newWorker.role,
        dailyWage: newWorker.dailyWage || 1000,
        workingDays: 0, basicSalary: 0, netSalary: 0,
        status: 'Pending', created_at: new Date().toISOString()
      };
      await set(ref(db, `salaries/${selectedMonth}/${workerId}`), newSalary);

      toast.success(`Worker ${workerData.name} added - pending approval`);
      setShowAddWorker(false);
    } catch (err) {
      toast.error('Failed to add worker');
    }
  };

  const handleApproveWorker = async (workerId) => {
    try {
      await set(ref(db, `workers/${workerId}/status`), 'active');
      await set(ref(db, `workers/${workerId}/approved`), true);
      toast.success('Worker approved');
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const markPresent = async (workerId) => {
    try {
      const time = new Date().toLocaleTimeString();
      await set(ref(db, `attendance/${selectedDate}/${workerId}`), { status: 'present', checkIn: time });
      toast.success('Marked present');
    } catch (err) {
      toast.error('Error');
    }
  };

  const markAbsent = async (workerId) => {
    try {
      await set(ref(db, `attendance/${selectedDate}/${workerId}`), { status: 'absent', checkIn: null });
      toast.success('Marked absent');
    } catch (err) {
      toast.error('Error');
    }
  };

  const handleUpdateWorkingDays = async (workerId, days) => {
    try {
      const workingDays = Math.max(0, Math.min(26, parseInt(days) || 0));
      const worker = salaryData.find(w => w.id === workerId);
      if (worker) {
        const dailyWage = parseCurrency(worker.dailyWage) || 1000;
        const basicSalary = dailyWage * workingDays;

        await update(ref(db, `salaries/${selectedMonth}/${workerId}`), {
          workingDays, basicSalary, netSalary: basicSalary,
          updated_at: new Date().toISOString()
        });

        toast.success('Days updated');
      }
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handlePaySalary = async (workerId) => {
    try {
      const worker = salaryData.find(w => w.id === workerId);
      if (!worker) return;

      const dailyWage = parseCurrency(worker.dailyWage) || 1000;
      const basicSalary = dailyWage * (worker.workingDays || 0);

      await update(ref(db, `salaries/${selectedMonth}/${workerId}`), {
        status: 'Paid',
        basicSalary, netSalary: basicSalary,
        paymentDate: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      toast.success('Marked as paid');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (window.confirm('Delete worker and all records?')) {
      try {
        await set(ref(db, `workers/${workerId}`), null);
        await set(ref(db, `salaries/${selectedMonth}/${workerId}`), null);
        toast.success('Deleted');
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  // CALCULATIONS
  const stats = {
    totalWorkers: workers.length,
    activeWorkers: workers.filter(w => w.status === 'active').length,
    presentToday: Object.values(attendance).filter(a => a.status === 'present').length,
    totalPayroll: salaryData.reduce((sum, w) => sum + parseCurrency(w.netSalary), 0),
  };

  const filteredWorkers = workers.filter(w =>
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSalary = salaryData.filter(w =>
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = workLogsData.filter(l =>
    l.workerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PAGINATION
  const getPaginatedData = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  const getTotalPages = (data) => Math.ceil(data.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* FIREBASE STATUS */}
        <div className={`rounded-lg shadow p-6 mb-8 border ${
          databaseStatus.hasWorkers 
            ? 'bg-green-50 border-green-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-4">
            <Database className={`h-6 w-6 ${databaseStatus.hasWorkers ? 'text-green-600' : 'text-amber-600'}`} />
            <div>
              <h3 className="font-bold text-gray-900">
                {databaseStatus.hasWorkers ? '✅ Firebase Connected' : '⚠️ No Workers'}
              </h3>
              <p className="text-sm text-gray-600">
                {databaseStatus.workerCount} workers • Real-time Database
              </p>
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Worker Management</h1>
            <p className="text-gray-600 mt-2">Staff • Attendance • Salary • Work Logs</p>
          </div>
          <button
            onClick={() => setShowAddWorker(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Worker
          </button>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Total" value={stats.totalWorkers} icon={Users} color="bg-blue-600" />
          <KpiCard title="Active" value={stats.activeWorkers} icon={CheckCircle} color="bg-emerald-600" />
          <KpiCard title="Present Today" value={stats.presentToday} icon={Clock} color="bg-amber-600" />
          <KpiCard title="Payroll" value={`Rs.${(stats.totalPayroll / 1000).toFixed(1)}K`} icon={IndianRupeeIcon} color="bg-purple-600" />
        </div>

        {/* TABS */}
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'workers', label: '👥 Workers' },
              { id: 'attendance', label: '📋 Attendance' },
              { id: 'salary', label: '💰 Salary' },
              { id: 'workLogs', label: '📝 Work Logs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={`px-6 py-4 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-6">
            {/* WORKERS */}
            {activeTab === 'workers' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData(filteredWorkers).map(worker => (
                      <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold">{worker.name}</div>
                          <div className="text-xs text-gray-500">{worker.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <RoleBadge role={worker.role} type={worker.type} />
                        </td>
                        <td className="px-6 py-4 text-sm">{worker.phone}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={worker.status} />
                        </td>
                        <td className="px-6 py-4">
                          {worker.status === 'pending' && (
                            <button
                              onClick={() => handleApproveWorker(worker.id)}
                              className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteWorker(worker.id)}
                            className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ATTENDANCE */}
            {activeTab === 'attendance' && (
              <div>
                <div className="mb-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Worker</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(workers.filter(w => w.status === 'active')).map(worker => {
                        const att = attendance[worker.id] || {};
                        return (
                          <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold">{worker.name}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={att.status || 'absent'} />
                            </td>
                            <td className="px-6 py-4 text-sm">{att.checkIn || '-'}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => markPresent(worker.id)}
                                className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 mr-2"
                              >
                                ✓ Present
                              </button>
                              <button
                                onClick={() => markAbsent(worker.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                ✗ Absent
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SALARY */}
            {activeTab === 'salary' && (
              <div>
                <div className="mb-4">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Days</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Salary</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(filteredSalary).map(worker => (
                        <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold">{worker.name}</td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="0"
                              max="26"
                              value={worker.workingDays || 0}
                              onChange={(e) => handleUpdateWorkingDays(worker.id, e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm">Rs.{(parseCurrency(worker.dailyWage) || 1000)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600">Rs.{parseCurrency(worker.netSalary)}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={worker.status} />
                          </td>
                          <td className="px-6 py-4">
                            {worker.status === 'Pending' && (
                              <button
                                onClick={() => handlePaySalary(worker.id)}
                                className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                              >
                                Pay
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* WORK LOGS */}
            {activeTab === 'workLogs' && (
              <div>
                <div className="mb-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Worker</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(filteredLogs).map(log => (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold">{log.workerName}</td>
                          <td className="px-6 py-4 text-sm">{log.workCategory}</td>
                          <td className="px-6 py-4 text-sm">{log.startTime} - {log.endTime}</td>
                          <td className="px-6 py-4 text-sm">{log.totalHours}h</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={log.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No logs for this date</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {(activeTab === 'workers' ? filteredWorkers : 
            activeTab === 'salary' ? filteredSalary : 
            filteredLogs).length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {getTotalPages(activeTab === 'workers' ? filteredWorkers : activeTab === 'salary' ? filteredSalary : filteredLogs)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= getTotalPages(activeTab === 'workers' ? filteredWorkers : activeTab === 'salary' ? filteredSalary : filteredLogs)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD WORKER MODAL */}
      {showAddWorker && (
        <AddWorkerModal onClose={() => setShowAddWorker(false)} onAdd={handleAddWorker} />
      )}
    </div>
  );
}

// ==================== ADD WORKER MODAL ====================
function AddWorkerModal({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'worker',
    role: 'General Worker',
    dailyWage: '',
    profileImage: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.dailyWage) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setUploading(true);
      let profileImageUrl = formData.profileImage || '';
      if (imageFile) {
        const storagePath = `workers/${Date.now()}_${imageFile.name}`;
        const snap = await uploadBytes(storageRef(storage, storagePath), imageFile);
        profileImageUrl = await getDownloadURL(snap.ref);
      }
      onAdd({ ...formData, profileImage: profileImageUrl });
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Worker</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-between mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1 mx-1 rounded ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="space-y-2">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="worker">Worker</option>
              <option value="driver">Driver</option>
              <option value="supervisor">Supervisor</option>
            </select>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="General Worker">General Worker</option>
              <option value="Machine Operator">Machine Operator</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Driver">Driver</option>
            </select>
            <input
              type="number"
              name="dailyWage"
              placeholder="Daily Wage (Rs.)"
              value={formData.dailyWage}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={() => step < 2 ? setStep(step + 1) : handleSubmit()}
            disabled={uploading}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg ${uploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {step === 2 ? (uploading ? 'Uploading...' : 'Add') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkerManagement;
