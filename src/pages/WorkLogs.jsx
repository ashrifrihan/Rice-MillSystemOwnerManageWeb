import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Factory,
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Timer,
  Calculator,
  Truck as TruckIcon,
  Package as PackageIcon,
  Factory as FactoryIcon,
  Clock as ClockIcon,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data for work logs
const mockWorkerData = {
  allWorkers: [
    {
      id: 'W001',
      name: 'Rajesh Perera',
      role: 'Driver',
      type: 'driver',
      approved: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
      attendance: { present: true }
    },
    {
      id: 'W002',
      name: 'Kamal Silva',
      role: 'General Worker',
      type: 'worker',
      approved: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kamal',
      attendance: { present: true }
    },
    {
      id: 'W003',
      name: 'Sunil Bandara',
      role: 'Supervisor',
      type: 'supervisor',
      approved: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunil',
      attendance: { present: true }
    },
    {
      id: 'W004',
      name: 'Nimal Fernando',
      role: 'Driver',
      type: 'driver',
      approved: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nimal',
      attendance: { present: false }
    },
    {
      id: 'W005',
      name: 'Anil Rathnayake',
      role: 'General Worker',
      type: 'worker',
      approved: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anil',
      attendance: { present: true }
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
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-lg text-gray-600 ml-1">{unit}</span>}
      </h3>
      <p className="text-sm text-gray-600 mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    Completed: { 
      text: 'Completed', 
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: CheckCircle 
    },
    Partial: { 
      text: 'Partial', 
      color: 'bg-amber-100 text-amber-700 border border-amber-200',
      icon: Clock 
    },
    Cancelled: { 
      text: 'Cancelled', 
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

// Add Work Log Modal Component
const AddWorkLogModal = ({ isOpen, onClose, onSubmit, workers, selectedDate }) => {
  const [formData, setFormData] = useState({
    workerId: '',
    startTime: '08:00',
    endTime: '17:00',
    workCategory: '',
    description: '',
    quantity: '',
    remarks: '',
    // Driver specific fields
    vehicleNumber: '',
    tripReference: '',
    distanceCovered: '',
    tripsCompleted: 1
  });

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkerSelect = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    setSelectedWorker(worker);
    handleInputChange('workerId', workerId);
  };

  const calculateTotalHours = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    const diff = (end - start) / (1000 * 60 * 60);
    return diff > 0 ? diff.toFixed(1) : 0;
  };

  const totalHours = calculateTotalHours();

  const handleSubmit = () => {
    if (!formData.workerId || !formData.workCategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    const worker = workers.find(w => w.id === formData.workerId);
    
    const logData = {
      id: `LOG-${Date.now()}`,
      workerId: formData.workerId,
      workerName: worker.name,
      workerRole: worker.role,
      workerType: worker.type,
      date: selectedDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      totalHours: parseFloat(totalHours),
      workCategory: formData.workCategory,
      description: formData.description,
      quantity: formData.quantity ? parseInt(formData.quantity) : null,
      remarks: formData.remarks,
      status: 'Completed',
      recordedAt: new Date().toISOString(),
      recordedBy: 'Admin'
    };

    // Add driver specific fields if worker is driver
    if (worker.type === 'driver') {
      logData.vehicleNumber = formData.vehicleNumber;
      logData.tripReference = formData.tripReference;
      logData.distanceCovered = formData.distanceCovered;
      logData.tripsCompleted = parseInt(formData.tripsCompleted);
    }

    onSubmit(logData);
    onClose();
    setFormData({
      workerId: '',
      startTime: '08:00',
      endTime: '17:00',
      workCategory: '',
      description: '',
      quantity: '',
      remarks: '',
      vehicleNumber: '',
      tripReference: '',
      distanceCovered: '',
      tripsCompleted: 1
    });
    setSelectedWorker(null);
    setCurrentStep(1);
  };

  if (!isOpen) return null;

  const approvedPresentWorkers = workers.filter(w => w.approved && w.attendance?.present);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add Work Log</h3>
                <div className="flex items-center gap-4 mt-1">
                  <div className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>1. Select Worker</div>
                  <div className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>2. Work Details</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {currentStep === 1 ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Select Worker</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approvedPresentWorkers.map(worker => (
                      <button
                        key={worker.id}
                        onClick={() => handleWorkerSelect(worker.id)}
                        className={`p-4 border rounded-xl text-left transition-colors ${
                          formData.workerId === worker.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={worker.photo} 
                            alt={worker.name}
                            className="h-10 w-10 rounded-lg"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{worker.name}</div>
                            <div className="text-sm text-gray-600">{worker.role}</div>
                            <div className="text-xs text-gray-500">ID: {worker.id}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {approvedPresentWorkers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <div className="text-gray-400 text-lg font-medium mb-2">No workers available</div>
                    <div className="text-sm text-gray-500">Only approved and present workers can have work logs</div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.workerId}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Work Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Work Details</h4>
                  
                  {selectedWorker && (
                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={selectedWorker.photo} 
                          alt={selectedWorker.name}
                          className="h-12 w-12 rounded-lg"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{selectedWorker.name}</div>
                          <div className="text-sm text-gray-600">{selectedWorker.role}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Start Time *</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">End Time *</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Work Category based on role */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Work Category *</label>
                      <select
                        value={formData.workCategory}
                        onChange={(e) => handleInputChange('workCategory', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {selectedWorker?.type === 'worker' ? (
                          <>
                            <option value="Paddy Unloading">Paddy Unloading</option>
                            <option value="Rice Packing">Rice Packing</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Machine Operation">Machine Operation</option>
                            <option value="Store Arrangement">Store Arrangement</option>
                            <option value="Quality Check">Quality Check</option>
                          </>
                        ) : selectedWorker?.type === 'driver' ? (
                          <>
                            <option value="Delivery">Delivery</option>
                            <option value="Raw Material Pickup">Raw Material Pickup</option>
                            <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                            <option value="Loading Assistance">Loading Assistance</option>
                          </>
                        ) : (
                          <>
                            <option value="Supervision">Supervision</option>
                            <option value="Quality Control">Quality Control</option>
                            <option value="Worker Management">Worker Management</option>
                          </>
                        )}
                      </select>
                    </div>
                    
                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows="2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe the work performed..."
                      />
                    </div>
                    
                    {/* Output/Distance */}
                    {selectedWorker?.type === 'worker' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Output (Optional)</label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Bags/KG handled"
                        />
                      </div>
                    ) : selectedWorker?.type === 'driver' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Vehicle Number</label>
                          <input
                            type="text"
                            value={formData.vehicleNumber}
                            onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="KA-01-AB-1234"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Distance Covered (km)</label>
                          <input
                            type="number"
                            value={formData.distanceCovered}
                            onChange={(e) => handleInputChange('distanceCovered', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Distance in km"
                          />
                        </div>
                      </>
                    ) : null}
                    
                    {/* Remarks */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Remarks (Optional)</label>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                        rows="2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Work Summary</p>
                        <p className="text-sm text-gray-600">
                          {formData.startTime} - {formData.endTime} • Total: {totalHours} hours
                        </p>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {selectedWorker?.type === 'driver' ? 'Driver Log' : 'Worker Log'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.workCategory}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Work Log
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Work Log Details Modal
const WorkLogDetailsModal = ({ isOpen, onClose, log }) => {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Work Log Details</h3>
                <p className="text-sm text-gray-600 mt-1">{log.date} • {log.workerName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Worker Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Worker Information</h4>
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={log.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + log.workerName} 
                      alt={log.workerName}
                      className="h-16 w-16 rounded-2xl"
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{log.workerName}</div>
                      <div className="text-sm text-gray-600">{log.workerRole}</div>
                      <div className="text-xs text-gray-500">ID: {log.workerId}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance Status:</span>
                      <span className="font-medium text-emerald-600">Present</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Logged By:</span>
                      <span className="font-medium">{log.recordedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Logged At:</span>
                      <span className="font-medium">{new Date(log.recordedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Task Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Task Details</h4>
                <div className="bg-blue-50 rounded-xl p-5">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Work Category</div>
                      <div className="font-bold text-gray-900 text-lg">{log.workCategory}</div>
                    </div>
                    
                    {log.description && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Description</div>
                        <div className="text-gray-900">{log.description}</div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Time</div>
                        <div className="font-medium text-gray-900">{log.startTime} - {log.endTime}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Total Hours</div>
                        <div className="font-bold text-gray-900 text-lg">{log.totalHours}h</div>
                      </div>
                    </div>
                    
                    {log.quantity && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Output</div>
                        <div className="font-medium text-gray-900">{log.quantity} {log.workCategory.includes('Packing') ? 'bags' : 'KG'}</div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-200">
                      <StatusBadge status={log.status} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Driver Specific Details */}
            {log.workerType === 'driver' && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Driver Specific Details</h4>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Vehicle</div>
                      <div className="font-bold text-gray-900">{log.vehicleNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Trip Reference</div>
                      <div className="font-medium text-gray-900">{log.tripReference || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Distance Covered</div>
                      <div className="font-bold text-gray-900">{log.distanceCovered || '0'} km</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Trips Completed</div>
                      <div className="font-medium text-gray-900">{log.tripsCompleted || 1}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Daily Work Output Chart Component
const DailyWorkOutputChart = ({ logs }) => {
  const workerOutput = logs.reduce((acc, log) => {
    if (!acc[log.workerName]) {
      acc[log.workerName] = {
        name: log.workerName,
        role: log.workerRole,
        output: log.quantity || 0,
        hours: log.totalHours
      };
    } else {
      acc[log.workerName].output += log.quantity || 0;
      acc[log.workerName].hours += log.totalHours;
    }
    return acc;
  }, {});

  const chartData = Object.values(workerOutput);
  const maxOutput = Math.max(...chartData.map(d => d.output), 1);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <BarChart3 className="w-7 h-7 text-blue-600" />
        Daily Work Output
      </h3>
      
      <div className="space-y-4">
        {chartData.map((worker, index) => (
          <div key={worker.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{worker.name}</div>
                  <div className="text-xs text-gray-600">{worker.role}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {worker.output > 0 ? `${worker.output} units` : `${worker.hours}h`}
                </div>
                <div className="text-xs text-gray-600">{worker.hours}h worked</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full" 
                style={{ width: `${(worker.output / maxOutput) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hours Worked Chart Component
const HoursWorkedChart = () => {
  const weeklyData = [
    { day: 'Mon', hours: 42, workers: 18 },
    { day: 'Tue', hours: 48, workers: 20 },
    { day: 'Wed', hours: 45, workers: 19 },
    { day: 'Thu', hours: 40, workers: 17 },
    { day: 'Fri', hours: 52, workers: 21 },
    { day: 'Sat', hours: 36, workers: 15 },
    { day: 'Sun', hours: 18, workers: 6 }
  ];

  const maxHours = Math.max(...weeklyData.map(d => d.hours));

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <Activity className="w-7 h-7 text-purple-600" />
        Weekly Hours Worked
      </h3>
      
      <div className="h-64 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm font-medium">Total Hours</span>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            Weekly Total: {weeklyData.reduce((sum, d) => sum + d.hours, 0)} hours
          </div>
        </div>
        
        <div className="flex-1 flex items-end justify-between space-x-4">
          {weeklyData.map((dayData) => (
            <div key={dayData.day} className="flex flex-col items-center flex-1">
              <div className="text-center text-sm font-medium text-gray-600 mb-2">
                {dayData.day}
              </div>
              <div className="relative w-full h-48 flex items-end justify-center">
                <div 
                  className="absolute bottom-0 w-6 bg-purple-500/80 rounded-t-lg" 
                  style={{ height: `${(dayData.hours / maxHours) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {dayData.hours}h • {dayData.workers} workers
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Role Based Summary Component
const RoleBasedSummary = ({ logs }) => {
  const summary = logs.reduce((acc, log) => {
    if (!acc[log.workerRole]) {
      acc[log.workerRole] = {
        count: 0,
        totalHours: 0,
        output: 0,
        icon: log.workerType === 'driver' ? TruckIcon : 
              log.workerType === 'supervisor' ? FactoryIcon : PackageIcon
      };
    }
    acc[log.workerRole].count++;
    acc[log.workerRole].totalHours += log.totalHours;
    acc[log.workerRole].output += log.quantity || 0;
    return acc;
  }, {});

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <Users className="w-7 h-7 text-emerald-600" />
        Role-Based Summary
      </h3>
      
      <div className="space-y-6">
        {Object.entries(summary).map(([role, data]) => {
          const Icon = data.icon;
          return (
            <div key={role} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{role}s</div>
                    <div className="text-sm text-gray-600">{data.count} active today</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{data.totalHours.toFixed(1)}h</div>
                  <div className="text-sm text-gray-600">total hours</div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                {role === 'Driver' ? (
                  <div className="text-sm text-gray-600">Trips & deliveries completed</div>
                ) : role === 'Supervisor' ? (
                  <div className="text-sm text-gray-600">Supervision & management tasks</div>
                ) : (
                  <div className="text-sm text-gray-600">
                    {data.output > 0 ? `${data.output} units produced` : 'General work activities'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Component
export function WorkLogs() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [workLogs, setWorkLogs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Generate mock work logs
    const logs = mockWorkerData.allWorkers
      .filter(worker => worker.approved && worker.attendance?.present)
      .map(worker => {
        const isDriver = worker.type === 'driver';
        const workCategories = isDriver 
          ? ['Delivery', 'Raw Material Pickup', 'Vehicle Maintenance']
          : ['Paddy Unloading', 'Rice Packing', 'Cleaning', 'Machine Operation'];
        
        return {
          id: `LOG-${Math.random().toString(36).substr(2, 9)}`,
          workerId: worker.id,
          workerName: worker.name,
          workerRole: worker.role,
          workerType: worker.type,
          photo: worker.photo,
          date: selectedDate,
          startTime: '08:00',
          endTime: '17:00',
          totalHours: 8.0,
          workCategory: workCategories[Math.floor(Math.random() * workCategories.length)],
          description: 'Daily work activities completed',
          quantity: isDriver ? null : Math.floor(Math.random() * 100) + 20,
          remarks: Math.random() > 0.7 ? 'Special task completed' : '',
          status: ['Completed', 'Partial'][Math.floor(Math.random() * 2)],
          recordedAt: new Date().toISOString(),
          recordedBy: 'Admin',
          // Driver specific
          vehicleNumber: isDriver ? `KA-01-AB-${Math.floor(Math.random() * 9000) + 1000}` : null,
          tripReference: isDriver ? `TRIP-${Math.floor(Math.random() * 1000)}` : null,
          distanceCovered: isDriver ? Math.floor(Math.random() * 200) + 50 : null,
          tripsCompleted: isDriver ? Math.floor(Math.random() * 5) + 1 : null
        };
      });

    setWorkLogs(logs);
  }, [selectedDate]);

  const filteredLogs = workLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.workCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || log.workerType === filterRole;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleAddLog = (logData) => {
    setWorkLogs(prev => [logData, ...prev]);
    toast.success('Work log added successfully');
  };

  const handleDeleteLog = (logId) => {
    setWorkLogs(prev => prev.filter(log => log.id !== logId));
    toast.success('Work log deleted');
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };

  // Calculate stats
  const stats = {
    totalTasks: workLogs.length,
    activeWorkers: new Set(workLogs.map(log => log.workerId)).size,
    completedTasks: workLogs.filter(log => log.status === 'Completed').length,
    pendingTasks: workLogs.filter(log => log.status === 'Partial').length,
    totalHours: workLogs.reduce((sum, log) => sum + log.totalHours, 0),
    avgHoursPerWorker: workLogs.length > 0 
      ? (workLogs.reduce((sum, log) => sum + log.totalHours, 0) / 
         new Set(workLogs.map(log => log.workerId)).size).toFixed(1)
      : 0
  };

  const handleEditLog = (logId) => {
    toast.success('Edit functionality - Admin only');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Logs</h1>
            <p className="text-gray-600 mt-2">Daily work activities & productivity tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent focus:outline-none text-sm font-medium"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Work Log
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Total Tasks Logged" 
            value={stats.totalTasks} 
            subtitle="Today's work records" 
            icon={Activity} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            trend={+15} 
          />
          <KpiCard 
            title="Active Workers" 
            value={stats.activeWorkers} 
            subtitle="Working today" 
            icon={Users} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            trend={+8} 
          />
          <KpiCard 
            title="Completed Tasks" 
            value={stats.completedTasks} 
            subtitle="Fully completed" 
            icon={CheckCircle} 
            color="bg-gradient-to-br from-green-500 to-emerald-600" 
            trend={+12} 
          />
          <KpiCard 
            title="Total Hours" 
            value={stats.totalHours.toFixed(1)} 
            subtitle="Worked today" 
            icon={Clock} 
            color="bg-gradient-to-br from-purple-500 to-pink-600" 
            trend={+5.2} 
            unit="h"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Avg Hours/Worker" 
            value={stats.avgHoursPerWorker} 
            subtitle="Productivity metric" 
            icon={Calculator} 
            color="bg-gradient-to-br from-amber-500 to-orange-600" 
            trend={+2.4} 
            unit="h"
          />
          <KpiCard 
            title="Pending Tasks" 
            value={stats.pendingTasks} 
            subtitle="Requires follow-up" 
            icon={AlertCircle} 
            color="bg-gradient-to-br from-red-500 to-rose-600" 
            trend={-3} 
          />
          <KpiCard 
            title="Driver Tasks" 
            value={workLogs.filter(l => l.workerType === 'driver').length} 
            subtitle="Transport activities" 
            icon={Truck} 
            color="bg-gradient-to-br from-cyan-500 to-blue-600" 
            trend={+18} 
          />
          <KpiCard 
            title="Worker Output" 
            value={workLogs.reduce((sum, log) => sum + (log.quantity || 0), 0)} 
            subtitle="Total units produced" 
            icon={Package} 
            color="bg-gradient-to-br from-indigo-500 to-purple-600" 
            trend={+22} 
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <DailyWorkOutputChart logs={workLogs} />
          </div>
          <div>
            <RoleBasedSummary logs={workLogs} />
          </div>
        </div>

        {/* Hours Worked Chart */}
        <div className="mb-8">
          <HoursWorkedChart />
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
                  placeholder="Search by worker name or work type..."
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="driver">Drivers</option>
                <option value="worker">Workers</option>
                <option value="supervisor">Supervisors</option>
              </select>
            </div>
          </div>
        </div>

        {/* Work Logs Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Worker Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Work Type & Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time & Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Output / Distance
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
                {currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={log.photo} 
                          alt={log.workerName}
                          className="h-10 w-10 rounded-lg border-2 border-gray-200"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{log.workerName}</div>
                          <div className="text-sm text-gray-600">{log.workerRole}</div>
                          <div className="text-xs text-gray-500">ID: {log.workerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{log.workCategory}</div>
                        <div className="text-sm text-gray-600">{log.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {log.startTime} → {log.endTime}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {log.totalHours}h
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {log.workerType === 'driver' ? (
                          <>
                            <div className="text-sm text-gray-900">{log.distanceCovered} km</div>
                            <div className="text-xs text-gray-600">{log.tripsCompleted} trips</div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">
                              {log.quantity ? `${log.quantity} units` : '-'}
                            </div>
                            <div className="text-xs text-gray-600">Output</div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(log)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditLog(log.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                          title="Edit (Admin only)"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredLogs.length === 0 && (
            <div className="text-center py-16">
              <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-400 text-lg font-medium mb-2">No work logs found</div>
              <div className="text-sm text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Add work logs to get started'}
              </div>
            </div>
          )}

          {/* Pagination */}
          {filteredLogs.length > 0 && (
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
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length}
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
          {filteredLogs.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-700">
                  <span className="font-bold">Total Hours Logged:</span> {stats.totalHours.toFixed(1)}h | 
                  <span className="text-emerald-600 font-bold ml-4"> Completed:</span> {stats.completedTasks} | 
                  <span className="text-amber-600 font-bold ml-4"> Partial:</span> {stats.pendingTasks}
                </div>
                <div className="mt-2 sm:mt-0 text-sm text-gray-600">
                  {stats.activeWorkers} workers active today
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddWorkLogModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLog}
        workers={mockWorkerData.allWorkers.filter(w => w.approved && w.attendance?.present)}
        selectedDate={selectedDate}
      />
      
      <WorkLogDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedLog(null);
        }}
        log={selectedLog}
      />
    </div>
  );
}

export default WorkLogs;