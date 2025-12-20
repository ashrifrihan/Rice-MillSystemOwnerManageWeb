// src/pages/StaffAttendance.jsx - UPDATED VERSION WITH KPI DESIGN
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  User, 
  Plus,
  Truck,
  Shield,
  Users,
  Phone,
  Camera,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  PieChart,
  X,
  UserCheck,
  UserX,
  Key,
  LogIn,
  Check,
  X as XIcon,
  Eye,
  Home,
  Mail,
  FileUp,
  Users as UsersIcon,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Activity
} from 'lucide-react';

// Mock data for workers and attendance
const mockWorkerData = {
  allWorkers: [
    {
      id: 'W001',
      name: 'Rajesh Perera',
      nic: '901234567V',
      phone: '+94 77 123 4567',
      address: '123 Galle Road, Colombo 03',
      role: 'Driver',
      type: 'driver',
      licenseNumber: 'DL-845672',
      licenseExpiry: '2025-06-30',
      vehicleType: 'Truck',
      joinDate: '2023-01-15',
      status: 'active',
      approved: true,
      password: 'DRV001@2024',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
      salary: 'Rs. 45,000',
      rating: 4.8
    },
    {
      id: 'W002',
      name: 'Kamal Silva',
      nic: '901234568V',
      phone: '+94 71 234 5678',
      address: '456 Kandy Road, Kurunegala',
      role: 'General Worker',
      type: 'worker',
      joinDate: '2023-03-20',
      status: 'active',
      approved: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kamal',
      salary: 'Rs. 35,000',
      rating: 4.5
    },
    {
      id: 'W003',
      name: 'Sunil Bandara',
      nic: '901234569V',
      phone: '+94 76 345 6789',
      address: '789 Matara Road, Galle',
      role: 'Supervisor',
      type: 'supervisor',
      joinDate: '2023-02-10',
      status: 'active',
      approved: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunil',
      salary: 'Rs. 55,000',
      rating: 4.9
    },
    {
      id: 'W004',
      name: 'Nimal Fernando',
      nic: '901234570V',
      phone: '+94 77 456 7890',
      address: '321 Anuradhapura Road, Polonnaruwa',
      role: 'Driver',
      type: 'driver',
      licenseNumber: 'DL-739485',
      licenseExpiry: '2024-12-31',
      vehicleType: 'Delivery Van',
      joinDate: '2023-05-15',
      status: 'active',
      approved: true,
      password: 'DRV004@2024',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nimal',
      salary: 'Rs. 42,000',
      rating: 4.6
    },
    {
      id: 'W005',
      name: 'Anil Rathnayake',
      nic: '901234571V',
      phone: '+94 71 567 8901',
      address: '654 Badulla Road, Monaragala',
      role: 'General Worker',
      type: 'worker',
      joinDate: '2023-04-05',
      status: 'active',
      approved: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anil',
      salary: 'Rs. 34,000',
      rating: 4.4
    },
    {
      id: 'W006',
      name: 'Saman Kumara',
      nic: '901234572V',
      phone: '+94 76 678 9012',
      address: '987 Trincomalee Road, Batticaloa',
      role: 'General Worker',
      type: 'worker',
      joinDate: '2023-06-20',
      status: 'active',
      approved: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=saman',
      salary: 'Rs. 33,000',
      rating: 4.3
    },
    {
      id: 'W007',
      name: 'Chandana Perera',
      nic: '901234573V',
      phone: '+94 77 789 0123',
      address: '147 Ratnapura Road, Kalutara',
      role: 'Driver',
      type: 'driver',
      licenseNumber: 'DL-921645',
      licenseExpiry: '2025-03-15',
      vehicleType: 'Pickup Truck',
      joinDate: '2023-07-10',
      status: 'active',
      approved: true,
      password: 'DRV007@2024',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chandana',
      salary: 'Rs. 44,000',
      rating: 4.7
    },
    // Pending approval workers
    {
      id: 'W008',
      name: 'Gihan Silva',
      nic: '901234574V',
      phone: '+94 71 890 1234',
      address: '258 Puttalam Road, Chilaw',
      role: 'Driver',
      type: 'driver',
      licenseNumber: 'DL-834756',
      licenseExpiry: '2024-11-30',
      vehicleType: 'Truck',
      joinDate: '2023-11-20',
      status: 'pending',
      approved: false,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gihan',
      salary: 'Rs. 40,000',
      rating: 0
    },
    {
      id: 'W009',
      name: 'Nisansala Fernando',
      nic: '901234575V',
      phone: '+94 76 901 2345',
      address: '369 Kegalle Road, Mawanella',
      role: 'General Worker',
      type: 'worker',
      joinDate: '2023-11-18',
      status: 'pending',
      approved: false,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nisansala',
      salary: 'Rs. 32,000',
      rating: 0
    }
  ],
  attendance: {
    '2023-11-20': {
      W001: { status: 'present', checkIn: '08:15' },
      W002: { status: 'present', checkIn: '08:00' },
      W003: { status: 'present', checkIn: '07:45' },
      W004: { status: 'absent' },
      W005: { status: 'present', checkIn: '08:30' },
      W006: { status: 'absent' },
      W007: { status: 'present', checkIn: '08:10' }
    },
    weeklyData: [
      { day: 'Mon', present: 18, absent: 3 },
      { day: 'Tue', present: 20, absent: 1 },
      { day: 'Wed', present: 19, absent: 2 },
      { day: 'Thu', present: 17, absent: 4 },
      { day: 'Fri', present: 21, absent: 0 },
      { day: 'Sat', present: 15, absent: 6 },
      { day: 'Sun', present: 6, absent: 15 }
    ],
    roleDistribution: [
      { role: 'Drivers', count: 5, color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
      { role: 'Workers', count: 15, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
      { role: 'Supervisors', count: 2, color: 'bg-gradient-to-br from-purple-500 to-pink-600' }
    ],
    monthlyStats: {
      avgAttendance: 89,
      lateArrivals: 12,
      perfectAttendance: 8,
      pendingRequests: 3
    }
  }
};

// KPI Card Component with Dashboard Design
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
    present: { 
      text: 'Present', 
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: CheckCircle 
    },
    absent: { 
      text: 'Absent', 
      color: 'bg-red-100 text-red-700 border border-red-200',
      icon: XCircle 
    },
    pending: { 
      text: 'Pending', 
      color: 'bg-amber-100 text-amber-700 border border-amber-200',
      icon: Clock 
    },
    active: { 
      text: 'Active', 
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: CheckCircle 
    },
    approved: { 
      text: 'Approved', 
      color: 'bg-blue-100 text-blue-700 border border-blue-200',
      icon: Check 
    },
    late: {
      text: 'Late',
      color: 'bg-orange-100 text-orange-700 border border-orange-200',
      icon: Clock
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

// Role Badge Component
const RoleBadge = ({ role, type }) => {
  const config = {
    driver: { 
      color: 'bg-blue-100 text-blue-700',
      icon: Truck 
    },
    worker: { 
      color: 'bg-green-100 text-green-700',
      icon: User 
    },
    supervisor: { 
      color: 'bg-purple-100 text-purple-700',
      icon: Shield 
    }
  }[type] || { color: 'bg-gray-100 text-gray-700', icon: User };

  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {role}
    </span>
  );
};

// Add Worker Modal Component
const AddWorkerModal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    phone: '',
    address: '',
    email: '',
    role: 'worker',
    type: 'worker',
    licenseNumber: '',
    licenseExpiry: '',
    vehicleType: '',
    nicFront: null,
    nicBack: null,
    licenseFront: null,
    profilePhoto: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      handleInputChange(field, file);
    }
  };

  const handleSubmit = () => {
    // Generate worker ID
    const workerId = `W${String(mockWorkerData.allWorkers.length + 1).padStart(3, '0')}`;
    
    const newWorker = {
      ...formData,
      id: workerId,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      approved: false,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + formData.name,
      salary: formData.type === 'driver' ? 'Rs. 40,000' : 
              formData.type === 'supervisor' ? 'Rs. 55,000' : 'Rs. 32,000',
      rating: 0
    };

    onSubmit(newWorker);
    onClose();
    setStep(1);
    setFormData({
      name: '',
      nic: '',
      phone: '',
      address: '',
      email: '',
      role: 'worker',
      type: 'worker',
      licenseNumber: '',
      licenseExpiry: '',
      vehicleType: '',
      nicFront: null,
      nicBack: null,
      licenseFront: null,
      profilePhoto: null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        {/* Modal content */}
        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
                <div className="flex items-center gap-4 mt-1">
                  <div className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>1. Basic Info</div>
                  <div className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>2. Role Info</div>
                  <div className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>3. Documents</div>
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
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">NIC Number *</label>
                      <input
                        type="text"
                        value={formData.nic}
                        onChange={(e) => handleInputChange('nic', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="901234567V"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="worker@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Address *</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Full address"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Next: Role Information
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Role Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Role Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Employee Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => {
                          handleInputChange('type', e.target.value);
                          handleInputChange('role', e.target.value === 'driver' ? 'Driver' : 
                            e.target.value === 'supervisor' ? 'Supervisor' : 'General Worker');
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="worker">General Worker</option>
                        <option value="driver">Driver</option>
                        <option value="supervisor">Supervisor</option>
                      </select>
                    </div>
                    
                    {formData.type === 'driver' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Driving License Number *</label>
                          <input
                            type="text"
                            value={formData.licenseNumber}
                            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="DL-123456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">License Expiry Date *</label>
                          <input
                            type="date"
                            value={formData.licenseExpiry}
                            onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Vehicle Type Allowed *</label>
                          <input
                            type="text"
                            value={formData.vehicleType}
                            onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Truck, Van, etc."
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Next: Documents
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Documents Upload */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Document Upload</h4>
                  
                  <div className="space-y-4">
                    {/* NIC Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">NIC Images *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <div className="text-sm font-medium">NIC Front Side</div>
                          <div className="text-xs text-gray-500 mt-1">Upload clear image</div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload('nicFront', e.target.files[0])}
                            className="hidden"
                            id="nicFront"
                          />
                          <label htmlFor="nicFront" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">
                            Choose File
                          </label>
                        </div>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <div className="text-sm font-medium">NIC Back Side</div>
                          <div className="text-xs text-gray-500 mt-1">Upload clear image</div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload('nicBack', e.target.files[0])}
                            className="hidden"
                            id="nicBack"
                          />
                          <label htmlFor="nicBack" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">
                            Choose File
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Driver License Upload */}
                    {formData.type === 'driver' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Driver License Image *</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <div className="text-sm font-medium">Driver License Front Side</div>
                          <div className="text-xs text-gray-500 mt-1">Valid driving license</div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload('licenseFront', e.target.files[0])}
                            className="hidden"
                            id="licenseFront"
                          />
                          <label htmlFor="licenseFront" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">
                            Choose File
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {/* Profile Photo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Profile Photo (Optional)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm font-medium">Profile Photo</div>
                        <div className="text-xs text-gray-500 mt-1">Optional - will generate avatar if not uploaded</div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])}
                          className="hidden"
                          id="profilePhoto"
                        />
                        <label htmlFor="profilePhoto" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">
                          Choose File
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-orange-800">Important Notice</div>
                      <div className="text-sm text-orange-700 mt-1">
                        After submission, employee will be in <span className="font-semibold">"Pending Approval"</span> status. 
                        Admin approval is required before the employee can mark attendance and receive payroll.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition"
                  >
                    Submit for Approval
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

// Pending Approvals Modal Component
const PendingApprovalsModal = ({ isOpen, onClose, workers, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);

  if (!isOpen) return null;

  const pendingWorkers = workers.filter(w => w.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-orange-600" />
                  Pending Approvals
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingWorkers.length} employees waiting for admin approval
                </p>
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
            {pendingWorkers.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-400 text-lg font-medium mb-2">No pending approvals</div>
                <div className="text-sm text-gray-500">All employees are approved and active</div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWorkers.map((worker) => (
                  <div key={worker.id} className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl p-5 hover:shadow-lg transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <img 
                          src={worker.photo} 
                          alt={worker.name}
                          className="h-16 w-16 rounded-2xl border-4 border-white shadow"
                        />
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{worker.name}</div>
                          <div className="text-sm text-gray-600 mt-1">NIC: {worker.nic} • Phone: {worker.phone}</div>
                          <div className="flex items-center gap-3 mt-3">
                            <RoleBadge role={worker.role} type={worker.type} />
                            <div className="text-xs text-gray-500">
                              Applied: {new Date(worker.joinDate).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {worker.type === 'driver' && (
                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">License:</span>
                                <span className="font-medium ml-2">{worker.licenseNumber}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Expiry:</span>
                                <span className="font-medium ml-2">{worker.licenseExpiry}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onApprove(worker.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedWorker(worker)}
                          className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg flex items-center gap-2"
                        >
                          <XIcon className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reject Reason Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => setSelectedWorker(null)} />
            
            <div className="inline-block w-full max-w-md my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Reject Employee Application</h3>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <div className="font-medium text-gray-900">{selectedWorker.name}</div>
                  <div className="text-sm text-gray-600 mt-1">NIC: {selectedWorker.nic}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Reason for Rejection *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide reason for rejection..."
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedWorker(null);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (rejectReason.trim()) {
                        onReject(selectedWorker.id, rejectReason);
                        setSelectedWorker(null);
                        setRejectReason('');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Attendance Trend Chart Component
const AttendanceTrendChart = ({ data }) => {
  const maxTotal = Math.max(...data.map(d => d.present + d.absent));
  
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          Weekly Attendance Trend
        </h2>
      </div>
      
      <div className="h-64 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-sm font-medium">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm font-medium">Absent</span>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            Avg Attendance: {Math.round(data.reduce((sum, d) => sum + d.present, 0) / data.length)} employees
          </div>
        </div>
        
        <div className="flex-1 flex items-end justify-between space-x-4">
          {data.map((dayData, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-center text-sm font-medium text-gray-600 mb-2">
                {dayData.day}
              </div>
              <div className="relative w-full h-48 flex items-end justify-center">
                <div className="absolute bottom-0 w-6 bg-emerald-500/80 rounded-t-lg" 
                  style={{ height: `${(dayData.present / maxTotal) * 100}%` }}>
                </div>
                <div className="absolute bottom-0 w-6 bg-red-500/80 rounded-t-lg ml-8" 
                  style={{ height: `${(dayData.absent / maxTotal) * 100}%` }}>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <span className="text-emerald-600 font-bold">{dayData.present}</span> / 
                <span className="text-red-600 font-bold"> {dayData.absent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">📊 Weekly Insight</p>
            <p className="text-sm text-gray-600">Friday shows 100% attendance - highest performance day</p>
          </div>
          <div className="text-emerald-600 font-bold">↑ 12% better than last week</div>
        </div>
      </div>
    </div>
  );
};

// Role Distribution Pie Chart Component
const RoleDistributionChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
        <PieChart className="w-7 h-7 text-purple-600" />
        Workforce Distribution
      </h3>
      
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-48 h-48 mb-6">
          <div className="absolute inset-0 rounded-full border-8 border-blue-500"></div>
          <div className="absolute inset-8 rounded-full border-8 border-emerald-500"></div>
          <div className="absolute inset-16 rounded-full border-8 border-purple-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-sm text-gray-600">Total Employees</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.role} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${item.color.replace('bg-gradient-to-br', 'bg')}`}></div>
              <span className="font-medium text-gray-900">{item.role}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">{item.count}</div>
              <div className="text-sm text-gray-600">{Math.round((item.count / total) * 100)}%</div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition">
        Download Workforce Report
      </button>
    </div>
  );
};

// Main Component
export function StaffAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [workers, setWorkers] = useState(mockWorkerData.allWorkers);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showPendingWorkers, setShowPendingWorkers] = useState(false);
  const [attendance, setAttendance] = useState(mockWorkerData.attendance[selectedDate] || {});
  
  // Get today's attendance data
  const todayAttendance = mockWorkerData.attendance[selectedDate] || {};

  // Filter approved workers
  const approvedWorkers = workers.filter(worker => worker.approved);
  const pendingWorkers = workers.filter(worker => !worker.approved);
  
  // Filter based on search and role
  const filteredWorkers = approvedWorkers.filter(worker => {
    const matchesSearch = searchTerm === '' || 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.nic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || worker.type === filterRole;
    return matchesSearch && matchesRole;
  });

  // Calculate stats for KPI cards
  const stats = {
    totalEmployees: approvedWorkers.length,
    presentToday: Object.values(todayAttendance).filter(a => a.status === 'present').length,
    absentToday: Object.values(todayAttendance).filter(a => a.status === 'absent').length,
    pendingApprovals: pendingWorkers.length,
    attendanceRate: approvedWorkers.length > 0 
      ? Math.round((Object.values(todayAttendance).filter(a => a.status === 'present').length / approvedWorkers.length) * 100)
      : 0,
    avgMonthlyAttendance: mockWorkerData.attendance.monthlyStats.avgAttendance,
    lateArrivals: mockWorkerData.attendance.monthlyStats.lateArrivals,
    perfectAttendance: mockWorkerData.attendance.monthlyStats.perfectAttendance
  };

  // Mark attendance as present
  const markPresent = (workerId) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const newAttendance = {
      ...todayAttendance,
      [workerId]: {
        status: 'present',
        checkIn: currentTime
      }
    };
    
    setAttendance(newAttendance);
    console.log(`${workerId} marked present at ${currentTime}`);
  };

  // Mark attendance as absent
  const markAbsent = (workerId) => {
    const newAttendance = {
      ...todayAttendance,
      [workerId]: {
        status: 'absent',
        checkIn: null
      }
    };
    
    setAttendance(newAttendance);
    console.log(`${workerId} marked absent`);
  };

  // Add new worker (pending approval)
  const handleAddWorker = (newWorker) => {
    setWorkers(prev => [...prev, newWorker]);
    alert(`Employee ${newWorker.name} added successfully! Waiting for admin approval.`);
  };

  // Approve worker
  const handleApproveWorker = (workerId) => {
    setWorkers(prev => prev.map(worker => 
      worker.id === workerId 
        ? { 
            ...worker, 
            status: 'active', 
            approved: true,
            // Generate password for drivers after approval
            ...(worker.type === 'driver' && { password: `DRV${worker.id.slice(1)}@${new Date().getFullYear()}` })
          }
        : worker
    ));
    alert('Employee approved successfully!');
  };

  // Reject worker
  const handleRejectWorker = (workerId, reason) => {
    setWorkers(prev => prev.filter(worker => worker.id !== workerId));
    alert(`Employee application rejected. Reason: ${reason}`);
  };

  // Export attendance
  const exportAttendance = () => {
    const csvData = filteredWorkers.map(worker => {
      const att = todayAttendance[worker.id] || { status: 'absent', checkIn: null };
      return {
        'Employee ID': worker.id,
        'Name': worker.name,
        'Role': worker.role,
        'NIC': worker.nic,
        'Status': att.status,
        'Check In Time': att.checkIn || '-',
        'Date': selectedDate
      };
    });

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Actions */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Management System</h1>
              <p className="text-gray-600 mt-2">
                Manage workforce, track daily attendance & handle approvals
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Pending Approvals Button - ALWAYS VISIBLE */}
              <button
                onClick={() => setShowPendingWorkers(true)}
                className={`relative px-4 py-2.5 rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2 ${
                  stats.pendingApprovals > 0 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Pending Approvals
                {stats.pendingApprovals > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {stats.pendingApprovals}
                  </span>
                )}
              </button>
              
              {/* Add Employee Button */}
              <button
                onClick={() => setShowAddWorker(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Employee
              </button>
              
              {/* Date Selector */}
              <div className="flex items-center bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent focus:outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* KPI Grid - Using Dashboard Design Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard 
              title="Total Employees" 
              value={stats.totalEmployees} 
              subtitle={`${approvedWorkers.length} active • ${pendingWorkers.length} pending`} 
              icon={Users} 
              color="bg-gradient-to-br from-blue-500 to-indigo-600" 
              trend={+8.2} 
            />
            
            <KpiCard 
              title="Present Today" 
              value={stats.presentToday} 
              subtitle={`${stats.attendanceRate}% attendance rate`} 
              icon={UserCheck} 
              color="bg-gradient-to-br from-emerald-500 to-teal-600" 
              trend={+5.4} 
            />
            
            <KpiCard 
              title="Absent Today" 
              value={stats.absentToday} 
              subtitle={`${stats.absentToday > 0 ? 'Action required' : 'All present!'}`} 
              icon={UserX} 
              color="bg-gradient-to-br from-red-500 to-rose-600" 
              trend={-2.1} 
            />
            
            <KpiCard 
              title="Monthly Attendance" 
              value={`${stats.avgMonthlyAttendance}%`} 
              subtitle="Average this month" 
              icon={TrendingUp} 
              color="bg-gradient-to-br from-purple-500 to-pink-600" 
              trend={+3.7} 
            />
          </div>

          {/* Secondary KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <KpiCard 
              title="Late Arrivals" 
              value={stats.lateArrivals} 
              subtitle="This month" 
              icon={Clock} 
              color="bg-gradient-to-br from-orange-500 to-amber-600" 
              trend={-12} 
            />
            
            <KpiCard 
              title="Perfect Attendance" 
              value={stats.perfectAttendance} 
              subtitle="Employees with 100% attendance" 
              icon={CheckCircle} 
              color="bg-gradient-to-br from-cyan-500 to-blue-600" 
              trend={+25} 
            />
            
            <KpiCard 
              title="Drivers Active" 
              value={approvedWorkers.filter(w => w.type === 'driver').length} 
              subtitle="On duty today" 
              icon={Truck} 
              color="bg-gradient-to-br from-green-500 to-emerald-600" 
              trend={+8} 
            />
            
            <KpiCard 
              title="Pending Approvals" 
              value={stats.pendingApprovals} 
              subtitle="Waiting for admin" 
              icon={AlertCircle} 
              color="bg-gradient-to-br from-amber-500 to-orange-600" 
              trend={+15} 
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AttendanceTrendChart data={mockWorkerData.attendance.weeklyData} />
          <RoleDistributionChart data={mockWorkerData.attendance.roleDistribution} />
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
                  placeholder="Search by name, NIC, or ID..."
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
                <option value="worker">General Workers</option>
                <option value="supervisor">Supervisors</option>
              </select>
              
              <button
                onClick={exportAttendance}
                className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Today's Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Employee Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role & Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Today's Attendance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mark Attendance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkers.map((worker) => {
                  const att = todayAttendance[worker.id] || { status: 'absent', checkIn: null };
                  const isDriver = worker.type === 'driver';
                  
                  return (
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
                            {isDriver && worker.password && (
                              <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Key className="h-3 w-3" />
                                Password: {worker.password}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <RoleBadge role={worker.role} type={worker.type} />
                          <StatusBadge status="active" />
                          <div className="text-xs text-gray-600">Joined: {worker.joinDate}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {worker.phone}
                          </div>
                          {worker.email && (
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {worker.email}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{worker.address}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <StatusBadge status={att.status} />
                          {att.checkIn && (
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <LogIn className="h-3 w-3 text-gray-400" />
                              Checked in at {att.checkIn}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {att.status !== 'present' && (
                            <button
                              onClick={() => markPresent(worker.id)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Mark Present
                            </button>
                          )}
                          
                          {att.status !== 'absent' && (
                            <button
                              onClick={() => markAbsent(worker.id)}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition flex items-center gap-2"
                            >
                              <XIcon className="h-4 w-4" />
                              Mark Absent
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredWorkers.length === 0 && (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-400 text-lg font-medium mb-2">No employees found</div>
              <div className="text-sm text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Add employees to get started'}
              </div>
            </div>
          )}

          {/* Summary Footer */}
          {filteredWorkers.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-bold">{filteredWorkers.length}</span> of <span className="font-bold">{stats.totalEmployees}</span> active employees
                  {stats.pendingApprovals > 0 && (
                    <span className="text-orange-600 ml-2 font-medium">
                      ({stats.pendingApprovals} waiting for approval)
                    </span>
                  )}
                </p>
                <div className="mt-2 sm:mt-0 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium">Present: {stats.presentToday}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Absent: {stats.absentToday}</span>
                  </div>
                  <div className="font-bold text-gray-900">
                    Today's Attendance Rate: {stats.attendanceRate}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddWorkerModal 
        isOpen={showAddWorker} 
        onClose={() => setShowAddWorker(false)}
        onSubmit={handleAddWorker}
      />
      
      <PendingApprovalsModal 
        isOpen={showPendingWorkers}
        onClose={() => setShowPendingWorkers(false)}
        workers={workers}
        onApprove={handleApproveWorker}
        onReject={handleRejectWorker}
      />
    </div>
  );
}

export default StaffAttendance;