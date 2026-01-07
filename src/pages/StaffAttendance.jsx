// src/pages/StaffAttendance.jsx - UPDATED VERSION WITH KPI DESIGN
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ref, onValue, push, set, get } from 'firebase/database';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import app, { rtdb as db, auth } from '../firebase/config';
  import { 
    Search,
    Filter,
    UserCheck,
    X,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle,
    XCircle,
    Clock,
    Check,
    Truck,
    User,
    Shield,
    FileUp,
    Users,
    UserX
    , Plus,
    Calendar,
    Download,
    TrendingUp,
    Activity,
    PieChart,
    AlertTriangle,
    Camera,
    Key,
    Phone,
    Mail,
    LogIn,
    XIcon,
    AlertCircle,
    Bell
  } from 'lucide-react';
  import PopupAlert from '../components/ui/PopupAlert';


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

    const validateForm = () => {
      if (!formData.name.trim()) return 'Full name is required';
      if (!formData.nic.trim()) return 'NIC number is required';
      if (!formData.phone.trim()) return 'Phone number is required';
      if (!formData.address.trim()) return 'Address is required';

      if (formData.type === 'driver') {
        if (!formData.licenseNumber.trim()) return 'License number is required';
        if (!formData.licenseExpiry) return 'License expiry date is required';
        if (!formData.vehicleType.trim()) return 'Vehicle type is required';
        if (!formData.nicFront) return 'NIC front image is required';
        if (!formData.nicBack) return 'NIC back image is required';
        if (!formData.licenseFront) return 'Driving license image is required';
      }

      return null;
    };

    const validateStep = (currentStep) => {
      if (currentStep === 1) {
        if (!formData.name.trim()) return 'Full name is required';
        if (!formData.nic.trim()) return 'NIC is required';
        if (!formData.phone.trim()) return 'Phone number is required';
        if (!formData.address.trim()) return 'Address is required';
      }

      if (currentStep === 2 && formData.type === 'driver') {
        if (!formData.licenseNumber.trim()) return 'License number is required';
        if (!formData.licenseExpiry) return 'License expiry date is required';
        if (!formData.vehicleType.trim()) return 'Vehicle type is required';
      }

      return null;
    };

    const handleSubmit = () => {
      const error = validateForm();
      if (error) {
        alert(error);
        return;
      }

      const isDriver = formData.type === 'driver';
      
      const newWorker = {
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + formData.name,
        salary: formData.type === 'driver' ? 'Rs. 40,000' : 
                formData.type === 'supervisor' ? 'Rs. 55,000' : 'Rs. 32,000',
        rating: 0
      };

      onSubmit(newWorker)
        .then(() => {
          onClose();
        })
        .catch(() => {
          alert('Failed to save employee. Check console.');
        });
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
                      onClick={() => {
                        const err = validateStep(1);
                        if (err) return alert(err);
                        setStep(2);
                      }}
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
                      onClick={() => {
                        const err = validateStep(2);
                        if (err) return alert(err);
                        setStep(3);
                      }}
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
                          {formData.type === 'driver' ? (
                            <>
                              <span className="font-semibold">Driver applications require admin approval.</span> 
                              After submission, the driver will be in <span className="font-semibold">"Pending Approval"</span> status. 
                              Admin approval is required before the driver can mark attendance and receive payroll.
                            </>
                          ) : (
                            <>
                              Supervisors and General Workers are <span className="font-semibold">automatically approved.</span> 
                              They will be active immediately and can start marking attendance right away.
                            </>
                          )}
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

                            {/* Document Status for Admin Review */}
                            <div className="mt-3">
                              <div className="text-sm font-medium text-gray-700 mb-2">Document Status:</div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className={`p-2 rounded ${worker.documents?.nicFront?.provided ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  NIC Front: {worker.documents?.nicFront?.provided ? '✓' : '✗'}
                                </div>
                                <div className={`p-2 rounded ${worker.documents?.nicBack?.provided ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  NIC Back: {worker.documents?.nicBack?.provided ? '✓' : '✗'}
                                </div>
                                <div className={`p-2 rounded ${worker.documents?.licenseFront?.provided ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  License: {worker.documents?.licenseFront?.provided ? '✓' : worker.type === 'driver' ? '✗' : 'N/A'}
                                </div>
                              </div>
                            </div>
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
    const { userProfile } = useAuth();
    const isAdmin = userProfile?.role === 'admin';
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [workers, setWorkers] = useState([]);
    const [showAddWorker, setShowAddWorker] = useState(false);
    const [showPendingWorkers, setShowPendingWorkers] = useState(false);
    const [attendance, setAttendance] = useState({});
    const [loadingWorkers, setLoadingWorkers] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [error, setError] = useState(null);
    const [weeklyData, setWeeklyData] = useState([]);
    const [popupAlert, setPopupAlert] = useState({ isOpen: false, type: 'success', title: '', message: '', details: [] });
    
    // Debug: Show all employees (including pending) for verification
    const [showDebugView, setShowDebugView] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    
    // Toggle to show all employees (including pending) vs only active
    const [showAllEmployees, setShowAllEmployees] = useState(false);
    
    // Admin notifications system
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Helpers to normalize status values coming from RTDB
    const normalizeStatus = (status) => (status || '').toString().toLowerCase().trim();
    const isActiveStatus = (status, approvedFlag) => {
      const s = normalizeStatus(status);
      return approvedFlag === true || s === 'active' || s === 'approved' || s.includes('active');
    };

    // Ensure we are authenticated (anonymous sign-in is enough to satisfy RTDB rules)
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          try {
            await signInAnonymously(auth);
            console.log('✅ Signed in anonymously for RTDB access');
          } catch (err) {
            console.error('Anonymous sign-in failed', err);
            setError('Cannot read Firebase data (auth required).');
          }
        }
      });
      return () => unsubscribe();
    }, []);
    
    // Create admin notification
    const createAdminNotification = async (type, title, message, details = {}) => {
      try {
        const notificationData = {
          id: Date.now().toString(),
          type, // 'employee_approved', 'employee_rejected', 'employee_added'
          title,
          message,
          details,
          timestamp: new Date().toISOString(),
          read: false,
          recipient: 'admin@gmail.com'
        };
        
        // Save to Firebase notifications collection
        const notificationRef = push(ref(db, 'notifications'));
        await set(notificationRef, notificationData);
        
        // Add to local state for immediate display
        setNotifications(prev => [notificationData, ...prev]);
        
        console.log('✅ Admin notification created:', notificationData);
      } catch (error) {
        console.error('Failed to create admin notification:', error);
      }
    };

    // Mark notification as read
    const markNotificationAsRead = async (notificationId) => {
      try {
        // Find the notification in Firebase and mark as read
        const notificationsRef = ref(db, 'notifications');
        const snapshot = await get(notificationsRef);
        
        snapshot.forEach(child => {
          if (child.val().id === notificationId) {
            set(child.ref, { ...child.val(), read: true });
          }
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    };
    
    // Get today's attendance data
    const todayAttendance = attendance || {};

// Filter approved workers (normalize status to avoid casing/whitespace issues)
  const approvedWorkers = workers.filter(worker => isActiveStatus(worker.status, worker.approved));
  const pendingWorkers = workers.filter(worker => normalizeStatus(worker.status) === 'pending');

  // Attendance authorization: only admin/supervisor can mark attendance
  const canMarkAttendance = isAdmin || userProfile?.role === 'supervisor';
  
  // Get selected employee details for debug view
  const selectedEmployee = selectedEmployeeId 
    ? workers.find(w => w.id === selectedEmployeeId) 
    : null;
    
    // Filter based on search and role (if no approved workers, fall back to full list so data still shows)
    const baseList = (showAllEmployees || approvedWorkers.length === 0) ? workers : approvedWorkers;
    const filteredWorkers = baseList.filter(worker => {
      const matchesSearch = searchTerm === '' || 
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.nic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || worker.type === filterRole;
      return matchesSearch && matchesRole;
    });

    // Calculate stats for KPI cards
    const activeCount = approvedWorkers.length || workers.length;
    const stats = {
      totalEmployees: activeCount,
      presentToday: Object.values(todayAttendance).filter(a => a.status === 'present').length,
      absentToday: Object.values(todayAttendance).filter(a => a.status === 'absent').length,
      pendingApprovals: pendingWorkers.length,
      attendanceRate: activeCount > 0 
        ? Math.round((Object.values(todayAttendance).filter(a => a.status === 'present').length / activeCount) * 100)
        : 0,
      avgMonthlyAttendance: weeklyData.length ? Math.round((weeklyData.reduce((s, d) => s + d.present, 0) / Math.max(1, weeklyData.reduce((s, d) => s + d.present + d.absent, 0))) * 100) : 0,
      lateArrivals: 0,
      perfectAttendance: 0
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
      try {
        // persist to Firebase (UI will update via listener)
        set(ref(db, `attendance/${selectedDate}/${workerId}`), { status: 'present', checkIn: currentTime })
          .catch(err => console.error('Failed to save attendance present', err));
      } catch (err) {
        console.error('markPresent failed', err);
        setError('Unable to mark present right now');
      }
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
      try {
        set(ref(db, `attendance/${selectedDate}/${workerId}`), { status: 'absent', checkIn: null })
          .catch(err => console.error('Failed to save attendance absent', err));
      } catch (err) {
        console.error('markAbsent failed', err);
        setError('Unable to mark absent right now');
      }
    };

    // Subscribe to workers list from Firebase
    useEffect(() => {
      setLoadingWorkers(true);
      try {
        const workersRef = ref(db, 'workers');
        const unsubscribe = onValue(workersRef, (snap) => {
          const list = [];
          snap.forEach(child => list.push({ id: child.key, ...child.val() }));
          
          // DEBUG: Log all employees to browser console
          console.log('✅ ALL EMPLOYEES FROM FIREBASE:', list);
          console.log(`Total: ${list.length} employees`);
          list.forEach(emp => {
            console.log(`  - ${emp.name} (ID: ${emp.id}, Type: ${emp.type}, Status: ${emp.status})`);
          });
          
          if (list.length === 0) {
            // Fallback: derive workers from current month salaries if /workers is empty
            (async () => {
              try {
                const month = new Date().toISOString().slice(0, 7);
                const salariesSnap = await get(ref(db, `salaries/${month}`));
                const salariesVal = salariesSnap.val() || {};
                const derived = Object.keys(salariesVal).map(key => ({
                  id: key,
                  name: salariesVal[key].name || `Employee ${key}`,
                  role: salariesVal[key].role || 'General Worker',
                  type: (salariesVal[key].role || '').toLowerCase().includes('driver') ? 'driver' :
                        (salariesVal[key].role || '').toLowerCase().includes('supervisor') ? 'supervisor' : 'worker',
                  approved: true,
                  status: 'active',
                  bankAccount: salariesVal[key].bankAccount || '',
                  bankName: salariesVal[key].bankName || '',
                  ifsc: salariesVal[key].ifsc || '',
                  photo: salariesVal[key].photo || (`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(salariesVal[key].name || key)}`)
                }));
                setWorkers(derived);
              } catch (e) {
                console.warn('Fallback load from salaries failed', e);
                setWorkers([]);
              }
            })();
          } else {
            setWorkers(list);
          }
          setLoadingWorkers(false);
        }, (err) => {
          console.error('workers onValue error', err);
          setError('Failed to load employees');
          setWorkers([]);
          setLoadingWorkers(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('subscribe workers failed', err);
        setError('Failed to subscribe to employees');
        setWorkers([]);
        setLoadingWorkers(false);
      }
    }, []);

    // Fetch weekly attendance (last 7 days) from Firebase
    useEffect(() => {
      let mounted = true;
      const fetchWeekly = async () => {
        try {
          const days = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const iso = d.toISOString().split('T')[0];
            days.push(iso);
          }

          const results = [];
          for (const day of days) {
            const snap = await get(ref(db, `attendance/${day}`));
            const val = snap.val() || {};
            const present = Object.values(val).filter(a => a.status === 'present').length;
            const absent = Object.values(val).filter(a => a.status === 'absent').length;
            results.push({ day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }), present, absent });
          }

          if (mounted) setWeeklyData(results);
        } catch (err) {
          console.error('Failed to fetch weekly attendance', err);
          // fallback to minimal derived data from today
          const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
          setWeeklyData([{ day: today, present: Object.values(todayAttendance).filter(a => a.status === 'present').length, absent: Object.values(todayAttendance).filter(a => a.status === 'absent').length }]);
        }
      };

      fetchWeekly();
      return () => { mounted = false; };
    }, [selectedDate]);

    // Subscribe to attendance for selectedDate
    useEffect(() => {
      setLoadingAttendance(true);
      try {
        const attendanceRef = ref(db, `attendance/${selectedDate}`);
        const unsubscribe = onValue(attendanceRef, (snap) => {
          const val = snap.val() || {};
          setAttendance(val);
          setLoadingAttendance(false);
        }, (err) => {
          console.error('attendance onValue error', err);
          setError('Failed to load attendance');
          setAttendance({});
          setLoadingAttendance(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('subscribe attendance failed', err);
        setError('Failed to subscribe to attendance');
        setAttendance({});
        setLoadingAttendance(false);
      }
    }, [selectedDate]);

    // Load admin notifications
    useEffect(() => {
      if (!isAdmin) return;
      
      const notificationsRef = ref(db, 'notifications');
      const unsubscribe = onValue(notificationsRef, (snap) => {
        const notificationsData = [];
        snap.forEach(child => {
          notificationsData.push(child.val());
        });
        // Sort by timestamp (newest first)
        notificationsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(notificationsData);
      }, (err) => {
        console.error('Failed to load notifications:', err);
      });

      return () => unsubscribe();
    }, [isAdmin]);

    // Add new worker (pending approval)
    const handleAddWorker = async (newWorker) => {
      try {
        // Create a new worker key first (so we can reference files under this ID)
        const newRef = push(ref(db, 'workers'));
        const workerId = newRef.key;

        // Document URLs (empty since no Firebase Storage - using metadata instead)
        // Documents are tracked via metadata for admin verification

        // Determine approval status based on employee type
        const isDriver = newWorker.type === 'driver';
        const initialApproved = !isDriver; // Only non-drivers are auto-approved
        const initialStatus = initialApproved ? 'active' : 'pending';

        // Authentication accounts are provisioned by administrator (no client-side auth creation)
        const authUid = null;

        const workerData = {
          id: workerId,
          name: newWorker.name,
          nic: newWorker.nic,
          phone: newWorker.phone,
          address: newWorker.address,
          email: newWorker.email || '',
          role: newWorker.role,
          type: newWorker.type,
          licenseNumber: newWorker.licenseNumber || '',
          licenseExpiry: newWorker.licenseExpiry || '',
          vehicleType: newWorker.vehicleType || '',
          status: initialStatus,
          approved: initialApproved,
          authUid: authUid,
          joinDate: new Date().toISOString().split('T')[0],
          photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newWorker.name || 'employee')}`,
          salary: newWorker.type === 'driver' ? 'Rs. 40,000' : newWorker.type === 'supervisor' ? 'Rs. 55,000' : 'Rs. 32,000',
          rating: 0,
          documents: {
            nicFront: {
              provided: true,
              fileName: newWorker.nicFront?.name || 'manual-entry',
              verified: false
            },
            nicBack: {
              provided: true,
              fileName: newWorker.nicBack?.name || 'manual-entry',
              verified: false
            },
            licenseFront: {
              provided: newWorker.type === 'driver',
              fileName: newWorker.type === 'driver' ? (newWorker.licenseFront?.name || 'manual-entry') : '',
              verified: false
            }
          }
        };

        // Save to Realtime Database under the generated key
        await set(newRef, workerData);
        
        // DEBUG: Log confirmation
        console.log('✅ EMPLOYEE SAVED TO FIREBASE - ' + newWorker.type + ':', {
          workerId: workerId,
          name: newWorker.name,
          type: newWorker.type,
          status: initialStatus,
          documents: workerData.documents
        });

        // optimistic local update
        setWorkers(prev => [...prev, workerData]);
        
        // Show appropriate success message
        if (newWorker.type === 'driver') {
          setPopupAlert({
            isOpen: true,
            type: 'success',
            title: 'Driver Added (Pending)',
            message: `${newWorker.name} added. Needs admin approval before activation.`,
            details: []
          });
        } else {
          setPopupAlert({
            isOpen: true,
            type: 'success',
            title: 'Employee Added',
            message: `${newWorker.name} is active and ready to work.`,
            details: []
          });
        }
        // Create admin notification for new employee
        if (newWorker.type === 'driver') {
          await createAdminNotification(
            'employee_added',
            'New Driver Application',
            `${newWorker.name} has applied for a driver position and needs approval`,
            {
              employeeId: workerId,
              employeeName: newWorker.name,
              employeeType: 'driver',
              status: 'pending',
              licenseNumber: newWorker.licenseNumber,
              vehicleType: newWorker.vehicleType,
              appliedAt: new Date().toISOString()
            }
          );
        } else {
          await createAdminNotification(
            'employee_added',
            'New Employee Added',
            `${newWorker.name} (${newWorker.type}) has been added and is active`,
            {
              employeeId: workerId,
              employeeName: newWorker.name,
              employeeType: newWorker.type,
              status: 'active',
              addedBy: userProfile?.email || 'Owner',
              addedAt: new Date().toISOString()
            }
          );
        }
      } catch (err) {
        console.error('Failed to add worker to Firebase', err);
        setError('Unable to add employee right now. Please try again later.');
      }
    };

    // Approve worker
    const handleApproveWorker = async (workerId) => {
      if (!isAdmin) {
        setPopupAlert({
          isOpen: true,
          type: 'error',
          title: 'Permission Denied',
          message: 'Only admins can approve employees.',
          details: []
        });
        return;
      }
      try {
        // set approved status in Firebase
        const updates = {
          status: 'active',
          approved: true,
          updated_at: new Date().toISOString()
        };
        await set(ref(db, `workers/${workerId}/status`), 'active');
        await set(ref(db, `workers/${workerId}/approved`), true);

        // optimistic local update
        setWorkers(prev => prev.map(worker => 
          worker.id === workerId 
            ? { ...worker, ...updates, approved: true }
            : worker
        ));

        // Create admin notification
        const approvedWorker = workers.find(w => w.id === workerId);
        if (approvedWorker) {
          await createAdminNotification(
            'employee_approved',
            'Employee Approved',
            `${approvedWorker.name} has been approved and is now active`,
            {
              employeeId: workerId,
              employeeName: approvedWorker.name,
              employeeType: approvedWorker.type,
              approvedBy: userProfile?.email || 'Admin',
              approvedAt: new Date().toISOString()
            }
          );
        }

        setPopupAlert({
          isOpen: true,
          type: 'success',
          title: 'Employee Approved',
          message: 'The worker is now active and ready for scheduling.',
          details: []
        });
      } catch (err) {
        console.error('Failed to approve worker in Firebase', err);
        setError('Failed to approve employee.');
      }
    };

    // Reject worker
    const handleRejectWorker = async (workerId, reason) => {
      if (!isAdmin) {
        setPopupAlert({
          isOpen: true,
          type: 'error',
          title: 'Permission Denied',
          message: 'Only admins can reject employees.',
          details: []
        });
        return;
      }
      try {
        // mark rejected in Firebase (keep record)
        await set(ref(db, `workers/${workerId}/status`), 'rejected');
        await set(ref(db, `workers/${workerId}/rejectionReason`), reason || 'No reason provided');
        await set(ref(db, `workers/${workerId}/approved`), false);

        // optimistic local update
        setWorkers(prev => prev.filter(worker => worker.id !== workerId));
        
        // Create admin notification
        const rejectedWorker = workers.find(w => w.id === workerId);
        if (rejectedWorker) {
          await createAdminNotification(
            'employee_rejected',
            'Employee Application Rejected',
            `${rejectedWorker.name}'s application has been rejected`,
            {
              employeeId: workerId,
              employeeName: rejectedWorker.name,
              employeeType: rejectedWorker.type,
              rejectionReason: reason || 'No reason provided',
              rejectedBy: userProfile?.email || 'Admin',
              rejectedAt: new Date().toISOString()
            }
          );
        }
        
        setPopupAlert({
          isOpen: true,
          type: 'success',
          title: 'Employee Rejected',
          message: 'Application rejected and removed from the list.',
          details: [reason || 'No reason provided']
        });
      } catch (err) {
        console.error('Failed to reject worker in Firebase', err);
        setError('Failed to reject employee.');
      }
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
                {/* Pending Approvals Button - Admin Only */}
                {isAdmin && (
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
                )}
                
                {/* Add Employee Button */}
                <button
                  onClick={() => setShowAddWorker(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Employee
                </button>
                
                {/* Admin Notifications Bell - Admin Only */}
                {isAdmin && (
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                    title="Admin Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                )}
                
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

            {/* Admin Notifications Dropdown */}
            {isAdmin && showNotifications && (
              <div className="absolute top-20 right-4 z-50 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Admin Notifications
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notifications.filter(n => !n.read).length} unread notifications
                  </p>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          if (!notification.read) {
                            markNotificationAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                notification.type === 'employee_approved' ? 'bg-green-100 text-green-800' :
                                notification.type === 'employee_rejected' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {notification.type.replace('_', ' ').toUpperCase()}
                              </span>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}

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
            <AttendanceTrendChart data={weeklyData.length ? weeklyData : [{ day: 'N/A', present: 0, absent: 0 }]} />
            <RoleDistributionChart data={[
              { role: 'Drivers', count: workers.filter(w => w.type === 'driver').length, color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
              { role: 'Workers', count: workers.filter(w => w.type === 'worker').length, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
              { role: 'Supervisors', count: workers.filter(w => w.type === 'supervisor').length, color: 'bg-gradient-to-br from-purple-500 to-pink-600' }
            ]} />
          </div>

          {/* DEBUG VIEW — Verify Firebase Data (TEMPORARY) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-blue-200 mb-8 p-6">
            <button
              onClick={() => setShowDebugView(!showDebugView)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {showDebugView ? '🔍 Hide Debug View' : '🔍 View All Employees (Debug)'}
            </button>

            {showDebugView && (
              <div className="mt-6 space-y-6">
                {/* All Employees List */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    ✅ All Employees in Firebase ({workers.length} total)
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {workers.length === 0 ? (
                      <p className="text-gray-500">No employees found in Firebase</p>
                    ) : (
                      workers.map(w => (
                        <button
                          key={w.id}
                          onClick={() => setSelectedEmployeeId(w.id)}
                          className={`w-full p-3 rounded-lg text-left transition ${
                            selectedEmployeeId === w.id
                              ? 'bg-blue-100 border-2 border-blue-500'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-bold text-gray-900">{w.name}</div>
                          <div className="text-sm text-gray-600">
                            ID: {w.id} • Type: {w.type} • Status: <span className={w.status === 'active' ? 'text-emerald-600 font-bold' : 'text-orange-600 font-bold'}>{w.status}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Selected Employee Full Data */}
                {selectedEmployee && (
                  <div className="bg-white rounded-2xl p-6 border border-emerald-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      📋 Full Employee Data: {selectedEmployee.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Info */}
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-semibold">ID</p>
                          <p className="font-bold text-gray-900 break-all">{selectedEmployee.id}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-semibold">Name</p>
                          <p className="font-bold text-gray-900">{selectedEmployee.name}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-semibold">NIC</p>
                          <p className="font-bold text-gray-900">{selectedEmployee.nic}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-semibold">Phone</p>
                          <p className="font-bold text-gray-900">{selectedEmployee.phone}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-semibold">Email</p>
                          <p className="font-bold text-gray-900">{selectedEmployee.email || 'Not provided'}</p>
                        </div>
                      </div>

                      {/* Status & Type */}
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-semibold">Type</p>
                          <p className="font-bold text-gray-900 capitalize">{selectedEmployee.type}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-semibold">Role</p>
                          <p className="font-bold text-gray-900">{selectedEmployee.role}</p>
                        </div>
                        <div className={`${selectedEmployee.status === 'active' ? 'bg-emerald-50' : 'bg-orange-50'} p-3 rounded-lg`}>
                          <p className="text-xs text-gray-500 font-semibold">Status</p>
                          <p className={`font-bold capitalize ${selectedEmployee.status === 'active' ? 'text-emerald-700' : 'text-orange-700'}`}>
                            {selectedEmployee.status}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-semibold">Join Date</p>
                          <p className="font-bold text-gray-900">{selectedEmployee.joinDate}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 font-semibold">Salary</p>
                          <p className="font-bold text-gray-900">{selectedEmployee.salary}</p>
                        </div>
                      </div>

                      {/* Driver-specific Info */}
                      {selectedEmployee.type === 'driver' && (
                        <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                          <p className="text-sm font-bold text-blue-900">Driver Information</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">License #</p>
                              <p className="font-bold text-gray-900">{selectedEmployee.licenseNumber || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Expiry</p>
                              <p className="font-bold text-gray-900">{selectedEmployee.licenseExpiry || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Vehicle Type</p>
                              <p className="font-bold text-gray-900">{selectedEmployee.vehicleType || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Document Status */}
                      {selectedEmployee.documents && (
                        <div className="md:col-span-2 bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                          <p className="text-sm font-bold text-purple-900">Document Status (Metadata)</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className={`p-3 rounded ${selectedEmployee.documents?.nicFront?.provided ? 'bg-green-100' : 'bg-red-100'}`}>
                              <p className="text-xs font-semibold">NIC Front</p>
                              <p className={`text-sm font-bold ${selectedEmployee.documents?.nicFront?.provided ? 'text-green-700' : 'text-red-700'}`}>
                                {selectedEmployee.documents?.nicFront?.provided ? '✓ Uploaded' : '✗ Missing'}
                              </p>
                              {selectedEmployee.documents?.nicFront?.fileName && (
                                <p className="text-xs text-gray-600 mt-1">{selectedEmployee.documents.nicFront.fileName}</p>
                              )}
                            </div>
                            <div className={`p-3 rounded ${selectedEmployee.documents?.nicBack?.provided ? 'bg-green-100' : 'bg-red-100'}`}>
                              <p className="text-xs font-semibold">NIC Back</p>
                              <p className={`text-sm font-bold ${selectedEmployee.documents?.nicBack?.provided ? 'text-green-700' : 'text-red-700'}`}>
                                {selectedEmployee.documents?.nicBack?.provided ? '✓ Uploaded' : '✗ Missing'}
                              </p>
                              {selectedEmployee.documents?.nicBack?.fileName && (
                                <p className="text-xs text-gray-600 mt-1">{selectedEmployee.documents.nicBack.fileName}</p>
                              )}
                            </div>
                            <div className={`p-3 rounded ${selectedEmployee.documents?.licenseFront?.provided ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <p className="text-xs font-semibold">License</p>
                              <p className={`text-sm font-bold ${selectedEmployee.documents?.licenseFront?.provided ? 'text-green-700' : 'text-gray-700'}`}>
                                {selectedEmployee.documents?.licenseFront?.provided ? '✓ Uploaded' : selectedEmployee.type === 'driver' ? '✗ Missing' : 'N/A'}
                              </p>
                              {selectedEmployee.documents?.licenseFront?.fileName && (
                                <p className="text-xs text-gray-600 mt-1">{selectedEmployee.documents.licenseFront.fileName}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Raw JSON (Advanced) */}
                    <details className="mt-4 p-3 bg-gray-900 rounded-lg text-gray-100 text-xs font-mono">
                      <summary className="cursor-pointer font-bold mb-2">Raw Firebase JSON</summary>
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(selectedEmployee, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            )}
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
                {isAdmin && (
                  <button
                    onClick={() => setShowAllEmployees(!showAllEmployees)}
                    className={`px-4 py-3 rounded-xl font-medium hover:shadow-lg transition ${
                      showAllEmployees
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showAllEmployees ? '✓ All Employees' : 'Show All Employees'}
                  </button>
                )}
                
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
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <RoleBadge role={worker.role} type={worker.type} />
                            <StatusBadge status={normalizeStatus(worker.status) || (worker.approved ? 'active' : 'pending')} />
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
        
        {isAdmin && (
          <PendingApprovalsModal 
            isOpen={showPendingWorkers}
            onClose={() => setShowPendingWorkers(false)}
            workers={workers}
            onApprove={handleApproveWorker}
            onReject={handleRejectWorker}
          />
        )}

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

  export default StaffAttendance;