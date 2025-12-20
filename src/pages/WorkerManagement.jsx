import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EditIcon,
  TrashIcon,
  ArrowUpDownIcon,
  EyeIcon,
  IndianRupeeIcon,
  BadgeCheckIcon,
  BadgeXIcon,
  CalendarDaysIcon
} from 'lucide-react';
import { mockWorkerData } from '../data/mockData';
import toast from 'react-hot-toast';

export function WorkerManagement() {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // State for workers and pagination
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [workersPerPage, setWorkersPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // State for modals and panels
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // KPI counts
  const [kpiCounts, setKpiCounts] = useState({
    total: 0,
    present: 0,
    absent: 0,
    onLeave: 0,
    monthlyPayroll: 0
  });

  // New worker form state
  const [newWorker, setNewWorker] = useState({
    id: '',
    name: '',
    role: 'Driver',
    contact: '',
    dailyWage: '',
    joinDate: '',
    status: 'Present',
    address: '',
    email: '',
    image: null,
    imagePreview: null
  });

  // Filter and sort workers
  useEffect(() => {
    let filtered = mockWorkerData.allWorkers.filter((worker) => {
      const matchesSearch =
        searchTerm === '' ||
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'All' || worker.role === filterRole;
      const matchesStatus = filterStatus === 'All' || worker.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });

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

    setFilteredWorkers(filtered);
    setCurrentPage(1);

    // Update KPI counts
    const presentWorkers = mockWorkerData.allWorkers.filter(w => w.status === 'Present').length;
    const absentWorkers = mockWorkerData.allWorkers.filter(w => w.status === 'Absent').length;
    const onLeaveWorkers = mockWorkerData.allWorkers.filter(w => w.status === 'On Leave').length;
    const monthlyPayroll = mockWorkerData.allWorkers.reduce((total, w) => {
      return w.status === 'Present' ? total + parseInt(w.dailyWage || 0) * 30 : total;
    }, 0);

    setKpiCounts({
      total: mockWorkerData.allWorkers.length,
      present: presentWorkers,
      absent: absentWorkers,
      onLeave: onLeaveWorkers,
      monthlyPayroll: monthlyPayroll
    });
  }, [searchTerm, filterRole, filterStatus, sortConfig]);

  // Search results for dropdown
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = mockWorkerData.allWorkers.filter(
        worker =>
          worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.id.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  // Auto mark absent before 12 PM
  useEffect(() => {
    const now = new Date();
    if (now.getHours() < 12) {
      // This would typically update the actual data, but we're using mock data
      console.log("Marking absent workers for the day");
    }
  }, []);

  // Get current workers for pagination
  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = filteredWorkers.slice(indexOfFirstWorker, indexOfLastWorker);
  const totalPages = Math.ceil(filteredWorkers.length / workersPerPage);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Open worker detail panel
  const openDetailPanel = (worker) => {
    setSelectedWorker(worker);
    setIsDetailPanelOpen(true);
  };

  // Handle status filter from KPI cards
  const handleKpiFilter = (status) => {
    setFilterStatus(status);
  };

  // Handle export data
  const handleExport = (format) => {
    toast.success(`Workers data exported as ${format.toUpperCase()}`);
  };

  // Handle inputs & images
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditModalOpen && selectedWorker) {
      setSelectedWorker({ ...selectedWorker, [name]: value });
    } else {
      setNewWorker({ ...newWorker, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEditModalOpen && selectedWorker) {
        setSelectedWorker({ ...selectedWorker, image: file, imagePreview: reader.result });
      } else {
        setNewWorker({ ...newWorker, image: file, imagePreview: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add/Edit/Delete Worker
  const handleAddWorker = () => {
    const newId = `W${(mockWorkerData.allWorkers.length + 1).toString().padStart(3, '0')}`;
    const workerToAdd = { ...newWorker, id: newId };
    
    // In a real app, this would update the backend
    mockWorkerData.allWorkers.push(workerToAdd);
    
    setNewWorker({
      id: '', name: '', role: 'Driver', contact: '', dailyWage: '', 
      joinDate: '', status: 'Present', address: '', email: '', 
      image: null, imagePreview: null
    });
    setIsAddModalOpen(false);
    toast.success(`Worker ${workerToAdd.name} added successfully`);
  };

  const handleUpdateWorker = () => {
    // In a real app, this would update the backend
    const updatedWorkers = mockWorkerData.allWorkers.map(worker => 
      worker.id === selectedWorker.id ? selectedWorker : worker
    );
    mockWorkerData.allWorkers = updatedWorkers;
    
    setIsEditModalOpen(false);
    toast.success(`Worker ${selectedWorker.name} updated successfully`);
  };

  const handleDeleteWorker = () => {
    // In a real app, this would update the backend
    mockWorkerData.allWorkers = mockWorkerData.allWorkers.filter(
      worker => worker.id !== selectedWorker.id
    );
    
    setIsDeleteModalOpen(false);
    toast.success(`Worker ${selectedWorker.name} deleted successfully`);
  };

  const openEditModal = (worker, e) => {
    e.stopPropagation();
    setSelectedWorker({ ...worker, imagePreview: worker.image });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (worker, e) => {
    e.stopPropagation();
    setSelectedWorker(worker);
    setIsDeleteModalOpen(true);
  };

  // Mark Present manually
  const markPresent = (id, e) => {
    e.stopPropagation();
    // In a real app, this would update the backend
    mockWorkerData.allWorkers = mockWorkerData.allWorkers.map(w => 
      w.id === id ? { ...w, status: 'Present' } : w
    );
    toast.success('Worker marked as present');
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor, textColor, icon;
    switch (status) {
      case 'Present':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />;
        break;
      case 'On Leave':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <ClockIcon className="h-3.5 w-3.5 mr-1" />;
        break;
      case 'Absent':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = <XCircleIcon className="h-3.5 w-3.5 mr-1" />;
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = null;
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        {status}
      </span>
    );
  };

  // Role badge component
  const RoleBadge = ({ role }) => {
    let bgColor, textColor;
    switch (role) {
      case 'Driver':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'Loader':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'Machine Operator':
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-800';
        break;
      case 'Supervisor':
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Worker Management</h1>
          <p className="text-gray-500 mt-1">Manage and track all workers and attendance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Worker
          </button>
          <div className="relative">
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => handleExport('excel')}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search workers by name or ID..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 text-sm border border-gray-200">
                {searchResults.map((worker) => (
                  <div
                    key={worker.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      setSearchTerm('')
                      openDetailPanel(worker)
                    }}
                  >
                    <div>
                      <span className="font-medium">{worker.id}</span>
                      <span className="text-gray-600 ml-2">- {worker.name}</span>
                    </div>
                    <RoleBadge role={worker.role} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="bg-transparent focus:outline-none text-sm"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option>All Roles</option>
                <option>Driver</option>
                <option>Loader</option>
                <option>Machine Operator</option>
                <option>Supervisor</option>
                <option>Cleaner</option>
              </select>
            </div>
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <BadgeCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="bg-transparent focus:outline-none text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>All Status</option>
                <option>Present</option>
                <option>Absent</option>
                <option>On Leave</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setFilterStatus('All')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <UserIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Workers</h3>
              <p className="text-2xl font-semibold text-gray-900">{kpiCounts.total}</p>
            </div>
          </div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleKpiFilter('Present')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <BadgeCheckIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Present</h3>
              <p className="text-2xl font-semibold text-gray-900">{kpiCounts.present}</p>
            </div>
          </div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleKpiFilter('Absent')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <BadgeXIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Absent</h3>
              <p className="text-2xl font-semibold text-gray-900">{kpiCounts.absent}</p>
            </div>
          </div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleKpiFilter('On Leave')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
              <CalendarDaysIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">On Leave</h3>
              <p className="text-2xl font-semibold text-gray-900">{kpiCounts.onLeave}</p>
            </div>
          </div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <IndianRupeeIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Monthly Payroll</h3>
              <p className="text-2xl font-semibold text-gray-900">Rs. {kpiCounts.monthlyPayroll.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'id', label: 'Worker ID' },
                  { key: 'name', label: 'Name' },
                  { key: 'role', label: 'Role' },
                  { key: 'contact', label: 'Contact' },
                  { key: 'dailyWage', label: 'Daily Wage' },
                  { key: 'status', label: 'Status' },
                  { key: 'joinDate', label: 'Join Date' },
                  { key: 'actions', label: 'Actions' }
                ].map((column) => (
                  <th 
                    key={column.key} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => column.key !== 'actions' && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.key !== 'actions' && (
                        <ArrowUpDownIcon className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentWorkers.length > 0 ? (
                currentWorkers.map((worker) => (
                  <tr 
                    key={worker.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openDetailPanel(worker)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{worker.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                          {worker.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                          <div className="text-xs text-gray-500">{worker.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={worker.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{worker.contact}</div>
                      <div className="text-xs text-gray-500">Phone</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Rs. {worker.dailyWage}</div>
                      <div className="text-xs text-gray-500">Per day</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={worker.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{worker.joinDate}</div>
                      <div className="text-xs text-gray-500">2 years ago</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDetailPanel(worker)
                          }}
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={(e) => openEditModal(worker, e)}
                          title="Edit worker"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        {worker.status !== 'Present' && (
                          <button 
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={(e) => markPresent(worker.id, e)}
                            title="Mark as present"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={(e) => openDeleteModal(worker, e)}
                          title="Delete worker"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No workers found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredWorkers.length > 0 && (
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstWorker + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastWorker, filteredWorkers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredWorkers.length}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                  value={workersPerPage}
                  onChange={(e) => setWorkersPerPage(Number(e.target.value))}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-4 w-4" />
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
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Worker Detail Side Panel */}
      {isDetailPanelOpen && selectedWorker && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDetailPanelOpen(false)}></div>
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  {/* Header */}
                  <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Worker Details</h2>
                      <button
                        type="button"
                        className="text-white hover:text-blue-200 transition-colors"
                        onClick={() => setIsDetailPanelOpen(false)}
                      >
                        <XIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm">{selectedWorker.id}</span>
                      <div className="ml-3">
                        <StatusBadge status={selectedWorker.status} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto py-6 px-6">
                    {/* Profile Section */}
                    <div className="mb-6 text-center">
                      <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold mb-3">
                        {selectedWorker.name.charAt(0)}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedWorker.name}</h2>
                      <div className="mt-1">
                        <RoleBadge role={selectedWorker.role} />
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Contact Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm font-medium text-gray-900">{selectedWorker.contact}</p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <MailIcon className="h-4 w-4 mr-1" />
                          {selectedWorker.email || 'No email provided'}
                        </p>
                        <div className="flex items-start mt-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-500">
                            {selectedWorker.address || 'No address provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Employment Details */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Employment Details
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">Join Date:</span>
                          <span className="text-sm font-medium">{selectedWorker.joinDate}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">Daily Wage:</span>
                          <span className="text-sm font-medium">Rs. {selectedWorker.dailyWage}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Monthly Estimate:</span>
                          <span className="text-sm font-medium">Rs. {parseInt(selectedWorker.dailyWage || 0) * 30}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Attendance Stats */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Attendance This Month</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-green-700">22</div>
                          <div className="text-xs text-green-600">Present</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-red-700">3</div>
                          <div className="text-xs text-red-600">Absent</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-yellow-700">5</div>
                          <div className="text-xs text-yellow-600">Leave</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={() => setIsDetailPanelOpen(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={(e) => openEditModal(selectedWorker, e)}
                    >
                      <EditIcon className="h-4 w-4 mr-2 inline" />
                      Edit Worker
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {isAddModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-5">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <PlusIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-1 ml-4 text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Worker</h3>
                    <p className="text-sm text-gray-500 mt-1">Add a new worker to the system</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newWorker.name}
                      onChange={handleInputChange}
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={newWorker.role}
                        onChange={handleInputChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option>Driver</option>
                        <option>Loader</option>
                        <option>Machine Operator</option>
                        <option>Supervisor</option>
                        <option>Cleaner</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={newWorker.status}
                        onChange={handleInputChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option>Present</option>
                        <option>Absent</option>
                        <option>On Leave</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <input
                        type="text"
                        name="contact"
                        value={newWorker.contact}
                        onChange={handleInputChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="dailyWage" className="block text-sm font-medium text-gray-700 mb-1">Daily Wage (Rs.)</label>
                      <input
                        type="number"
                        name="dailyWage"
                        value={newWorker.dailyWage}
                        onChange={handleInputChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={newWorker.email}
                      onChange={handleInputChange}
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                    <input
                      type="date"
                      name="joinDate"
                      value={newWorker.joinDate}
                      onChange={handleInputChange}
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={newWorker.address}
                      onChange={handleInputChange}
                      rows="2"
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Full address"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {newWorker.imagePreview && (
                      <div className="mt-2">
                        <img src={newWorker.imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={handleAddWorker}
                >
                  Add Worker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {isEditModalOpen && selectedWorker && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-5">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <EditIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-1 ml-4 text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Worker</h3>
                    <p className="text-sm text-gray-500 mt-1">Update worker information</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={selectedWorker.name}
                      onChange={handleInputChange}
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={selectedWorker.role}
                        onChange={handleInputChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option>Driver</option>
                        <option>Loader</option>
                        <option>Machine Operator</option>
                        <option>Supervisor</option>
                        <option>Cleaner</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={selectedWorker.status}
                        onChange={handleInputChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option>Present</option>
                        <option>Absent</option>
                        <option>On Leave</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-contact" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <input
                        type="text"
                        name="contact"
                        value={selectedWorker.contact}
                        onChange={handleInputChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-dailyWage" className="block text-sm font-medium text-gray-700 mb-1">Daily Wage (Rs.)</label>
                      <input
                        type="number"
                        name="dailyWage"
                        value={selectedWorker.dailyWage}
                        onChange={handleInputChange}
                        className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={selectedWorker.email || ''}
                      onChange={handleInputChange}
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-joinDate" className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                    <input
                      type="date"
                      name="joinDate"
                      value={selectedWorker.joinDate}
                      onChange={handleInputChange}
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={selectedWorker.address || ''}
                      onChange={handleInputChange}
                      rows="2"
                      className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Full address"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedWorker.imagePreview && (
                      <div className="mt-2">
                        <img src={selectedWorker.imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={handleUpdateWorker}
                >
                  Update Worker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedWorker && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-6 py-5">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-1 ml-4 text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Worker</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <strong>{selectedWorker.name}</strong>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  onClick={handleDeleteWorker}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}