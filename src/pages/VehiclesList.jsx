// src/pages/VehiclesList.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, set, update, get, push, remove } from 'firebase/database';
import { rtdb as db } from '../firebase/config';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { filterSnapshotByOwner, getCurrentUserEmail } from '../utils/firebaseFilters';
import { 
  Truck, 
  Search, 
  Filter,
  Plus,
  Grid,
  List,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Shield,
  Clock,
  FileText,
  Download,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  MapPin,
  Settings,
  Phone,
  MessageSquare,
  Printer,
  Navigation,
  Users,
  FileUp,
  Camera,
  Fuel,
  Check,
  X,
  Home,
  Package,
  DollarSign,
  Image as ImageIcon,
  UserCheck,
  UserX,
  Upload,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Package as PackageIcon,
  AlertCircle,
  Thermometer,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Users as UsersIcon,
  Map,
  Wifi,
  Battery,
  Zap,
  Shield as ShieldIcon,
  Scale,
  Wrench
} from 'lucide-react';

export function VehiclesList() {
  const { user } = useAuth();
  const userEmail = getCurrentUserEmail(user);
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  // Current user role (change this based on actual auth)
  const currentUserRole = 'owner'; // Change to 'admin' or 'owner'
  const currentUserName = currentUserRole === 'admin' ? 'Admin User' : 'Rice Mill Owner';

  // FIREBASE LISTENER - Load vehicles from Firebase
  useEffect(() => {
    setLoading(true);
    const vehiclesRef = ref(db, 'vehicles');
    
    const unsubscribe = onValue(vehiclesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const vehiclesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setVehicles(vehiclesList);
      } else {
        setVehicles([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      toast.error('Failed to load vehicles');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Computed dashboard data from Firebase vehicles
  const dashboardData = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'Active').length,
    pendingApprovals: vehicles.filter(v => v.approvalStatus === 'Pending').length,
    underMaintenance: vehicles.filter(v => v.status === 'Maintenance').length,
    insuranceExpiring: vehicles.filter(v => {
      if (!v.insuranceExpiry) return false;
      const expiryDate = new Date(v.insuranceExpiry);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow;
    }).length,
    maintenanceAlerts: vehicles.filter(v => v.maintenanceAlerts && v.maintenanceAlerts.length > 0).length
  };

  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '',
    type: 'Lorry',
    capacity: '',
    fuelType: 'Diesel',
    vehicleModel: '',
    chassisNumber: '',
    engineNumber: '',
    registrationDate: '',
    insuranceExpiry: '',
    assignedRoute: '',
    trackerId: '',
    ownerName: 'Mills Rice Mill',
    ownerContact: '011-2345678',
    vehicleImage: null
  });

  const [editForm, setEditForm] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      (vehicle.vehicleNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vehicle.type?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || vehicle.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  // Simplified Status badge colors - Clean and minimal
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Available': return 'bg-green-100 text-green-800';
      case 'On Trip': return 'bg-blue-100 text-blue-800';
      case 'Pending Approval': return 'bg-amber-100 text-amber-800';
      case 'Edit Request': return 'bg-orange-100 text-orange-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Simplified Approval status colors
  const getApprovalStatusColor = (approvalStatus) => {
    switch (approvalStatus) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700';
      case 'Pending': return 'bg-amber-50 text-amber-700';
      case 'Edit Pending': return 'bg-orange-50 text-orange-700';
      case 'Rejected': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Insurance status colors
  const getInsuranceColor = (status) => {
    switch (status) {
      case 'valid': return 'text-emerald-600';
      case 'expiring': return 'text-amber-600';
      case 'expiring-soon': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Insurance status text
  const getInsuranceText = (expiryDate, status) => {
    if (status === 'expiring-soon') return 'Expiring soon';
    if (status === 'expiring') return 'Expiring';
    return new Date(expiryDate).toLocaleDateString('en-IN');
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document upload
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      file,
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'image',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));
    setUploadedDocuments([...uploadedDocuments, ...newDocs]);
  };

  // Remove document
  const removeDocument = (index) => {
    const updatedDocs = [...uploadedDocuments];
    updatedDocs.splice(index, 1);
    setUploadedDocuments(updatedDocs);
  };

  // Show success popup
  const showPopupMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  // Handle actions
  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleEditClick = (vehicle) => {
    if (vehicle.status === 'Active') {
      setSelectedVehicle(vehicle);
      setEditForm({
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        capacity: vehicle.capacity,
        fuelType: vehicle.fuelType,
        vehicleModel: vehicle.vehicleModel || '',
        chassisNumber: vehicle.chassisNumber || '',
        engineNumber: vehicle.engineNumber || '',
        registrationDate: vehicle.registrationDate || '',
        insuranceExpiry: vehicle.insuranceExpiry || '',
        assignedRoute: vehicle.assignedRoute || '',
        trackerId: vehicle.trackerId || '',
        vehicleImage: vehicle.vehicleImage
      });
      setShowEditModal(true);
    } else if (vehicle.status === 'Rejected') {
      setSelectedVehicle(vehicle);
      setShowResubmitModal(true);
    }
  };

  const handleApproveClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowApproveModal(true);
  };

  const handleRejectClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleAssignClick = (vehicle) => {
    // VehiclesList responsibility: ONLY navigate to assignment page
    // AssignTransport.jsx handles all trip creation logic
    navigate(`/assign-transport?vehicleId=${vehicle.id}`);
  };

  const handleStatusClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowStatusModal(true);
  };

  // Handle form submissions
  const handleAddVehicle = async () => {
    if (!imagePreview) {
      toast.error('Please upload a vehicle image');
      return;
    }

    if (!newVehicle.vehicleNumber || !newVehicle.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newVehicleRef = push(ref(db, 'vehicles'));
      const newVehicleData = {
        vehicleNumber: newVehicle.vehicleNumber,
        type: newVehicle.type,
        capacity: newVehicle.capacity,
        fuelType: newVehicle.fuelType,
        vehicleModel: newVehicle.vehicleModel,
        chassisNumber: newVehicle.chassisNumber,
        engineNumber: newVehicle.engineNumber,
        registrationDate: newVehicle.registrationDate,
        insuranceExpiry: newVehicle.insuranceExpiry,
        assignedRoute: newVehicle.assignedRoute,
        trackerId: newVehicle.trackerId,
        ownerName: newVehicle.ownerName,
        ownerContact: newVehicle.ownerContact,
        vehicleImage: imagePreview,
        driver: 'Not Assigned',
        driverContact: 'N/A',
        status: 'Pending Approval',
        approvalStatus: 'Pending',
        insuranceStatus: 'valid',
        addedOn: new Date().toISOString().split('T')[0],
        lastEdited: new Date().toISOString().split('T')[0],
        addedBy: currentUserName,
        approvedBy: null,
        approvedOn: null,
        documents: uploadedDocuments.map(doc => ({
          name: doc.name,
          type: doc.type,
          uploadedOn: new Date().toISOString().split('T')[0]
        })),
        totalTrips: 0,
        currentLocation: 'Mill Yard',
        editRequests: [],
        mileage: '0 km/l',
        lastService: new Date().toISOString().split('T')[0]
      };

      await set(newVehicleRef, newVehicleData);

      setNewVehicle({
        vehicleNumber: '',
        type: 'Lorry',
        capacity: '',
        fuelType: 'Diesel',
        vehicleModel: '',
        chassisNumber: '',
        engineNumber: '',
        registrationDate: '',
        insuranceExpiry: '',
        assignedRoute: '',
        trackerId: '',
        ownerName: 'Mills Rice Mill',
        ownerContact: '011-2345678',
        vehicleImage: null
      });
      setImagePreview(null);
      setUploadedImage(null);
      setUploadedDocuments([]);
      setShowAddModal(false);
      
      toast.success('Vehicle submitted successfully for admin approval!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
    }
  };

  // KPI Card Component - NOT CHANGED as requested
  const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend, unit = "" }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
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
          {unit}
        </h3>
        <p className="text-sm text-gray-600 mt-1 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  const handleEditSubmit = async () => {
    // Create edit request instead of direct edit
    try {
      const vehicleRef = ref(db, `vehicles/${selectedVehicle.id}`);
      
      const existingEditRequests = selectedVehicle.editRequests || [];
      const newEditRequest = {
        field: 'capacity',
        oldValue: selectedVehicle.capacity,
        newValue: editForm.capacity,
        requestedBy: currentUserName,
        requestedOn: new Date().toISOString().split('T')[0],
        reason: 'Requested edit'
      };

      await update(vehicleRef, {
        status: 'Edit Request',
        approvalStatus: 'Edit Pending',
        lastEdited: new Date().toISOString().split('T')[0],
        editRequests: [...existingEditRequests, newEditRequest]
      });

      setShowEditModal(false);
      
      toast.success('Edit request submitted for admin approval.');
    } catch (error) {
      console.error('Error submitting edit request:', error);
      toast.error('Failed to submit edit request');
    }
  };

  const handleApproveVehicle = async () => {
    // Only admin can approve
    if (currentUserRole !== 'admin') {
      toast.error('Only admin users can approve vehicles.');
      return;
    }

    try {
      const vehicleRef = ref(db, `vehicles/${selectedVehicle.id}`);
      const updateData = {
        status: selectedVehicle.status === 'Edit Request' ? 'Active' : 'Active',
        approvalStatus: ' ',
        approvedBy: currentUserName,
        approvedOn: new Date().toISOString().split('T')[0]
      };

      // If it was an edit request, apply the changes
      if (selectedVehicle.status === 'Edit Request' && selectedVehicle.editRequests?.length > 0) {
        updateData.capacity = selectedVehicle.editRequests[0].newValue;
      }

      await update(vehicleRef, updateData);
      setShowApproveModal(false);
      
      toast.success('Vehicle approved successfully!');
    } catch (error) {
      console.error('Error approving vehicle:', error);
      toast.error('Failed to approve vehicle');
    }
  };

  const handleRejectVehicle = async () => {
    // Only admin can reject
    if (currentUserRole !== 'admin') {
      toast.error('Only admin users can reject vehicles.');
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }

    try {
      const vehicleRef = ref(db, `vehicles/${selectedVehicle.id}`);
      await update(vehicleRef, {
        status: 'Rejected',
        approvalStatus: 'Rejected',
        rejectionReason: rejectionReason
      });

      setShowRejectModal(false);
      setRejectionReason('');
      
      toast.success('Vehicle rejected.');
    } catch (error) {
      console.error('Error rejecting vehicle:', error);
      toast.error('Failed to reject vehicle');
    }
  };

  const handleResubmitVehicle = async () => {
    try {
      const vehicleRef = ref(db, `vehicles/${selectedVehicle.id}`);
      await update(vehicleRef, {
        status: 'Pending Approval',
        approvalStatus: 'Pending',
        lastEdited: new Date().toISOString().split('T')[0],
        rejectionReason: ''
      });

      setShowResubmitModal(false);
      
      toast.success('Vehicle resubmitted for approval!');
    } catch (error) {
      console.error('Error resubmitting vehicle:', error);
      toast.error('Failed to resubmit vehicle');
    }
  };

  const handleAssignTransport = () => {
    alert(`Transport assigned to vehicle ${selectedVehicle.vehicleNumber}`);
    setShowAssignModal(false);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const vehicleRef = ref(db, `vehicles/${selectedVehicle.id}`);
      await update(vehicleRef, {
        status: newStatus,
        lastStatusChange: new Date().toISOString(),
        lastEdited: new Date().toISOString().split('T')[0]
      });

      setShowStatusModal(false);
      toast.success(`Vehicle status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast.error('Failed to update vehicle status');
    }
  };

  // UPDATED Vehicle Card Component for Grid View - Simplified
  const VehicleCard = ({ vehicle }) => (
    <div className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Vehicle Image */}
      <div className="h-40 bg-gray-100 overflow-hidden relative">
        <img 
          src={vehicle.vehicleImage} 
          alt={vehicle.vehicleNumber}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop';
          }}
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
            {vehicle.status}
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Header with Vehicle Number */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{vehicle.vehicleNumber}</h3>
          <p className="text-sm text-gray-600">{vehicle.type} • {vehicle.capacity}</p>
        </div>

        {/* Vehicle Details - Simplified */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(vehicle.status)}`}>
              {vehicle.status === 'Active' || vehicle.status === 'Available' ? '✓ ' + vehicle.status : vehicle.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Approval</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getApprovalStatusColor(vehicle.approvalStatus)}`}>
              {vehicle.approvalStatus === 'Approved' ? '✓ Approved' : vehicle.approvalStatus}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Insurance</span>
            <span className={`text-xs font-medium ${getInsuranceColor(vehicle.insuranceStatus)}`}>
              {getInsuranceText(vehicle.insuranceExpiry, vehicle.insuranceStatus)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => handleViewDetails(vehicle)}
            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          
          {/* Status Change Button - For both owner and admin */}
          {(currentUserRole === 'owner' || currentUserRole === 'admin') && vehicle.approvalStatus === 'Approved' && (
            <button
              onClick={() => handleStatusClick(vehicle)}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1"
            >
              <Settings className="w-4 h-4" />
              Status
            </button>
          )}
          
          {/* Edit/Resubmit button - Only for owners on Active or Rejected vehicles */}
          {currentUserRole === 'owner' && (vehicle.status === 'Active' || vehicle.status === 'Rejected') && (
            <button
              onClick={() => handleEditClick(vehicle)}
              className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition flex items-center justify-center gap-1"
            >
              <Edit className="w-4 h-4" />
              {vehicle.status === 'Rejected' ? 'Resubmit' : 'Edit'}
            </button>
          )}

          {/* Admin only buttons */}
          {currentUserRole === 'admin' && (
            <>
              {vehicle.status === 'Active' && (
                <button
                  onClick={() => handleAssignClick(vehicle)}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-1"
                  title="Assign Transport"
                >
                  <Truck className="w-4 h-4" />
                </button>
              )}
              
              {(vehicle.status === 'Pending Approval' || vehicle.status === 'Edit Request') && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleApproveClick(vehicle)}
                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    title="Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRejectClick(vehicle)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // UPDATED Vehicle Table Row Component for Table View - Simplified
  const VehicleTableRow = ({ vehicle }) => (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <img 
              src={vehicle.vehicleImage} 
              alt={vehicle.vehicleNumber}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop';
              }}
            />
          </div>
          <div>
            <div className="font-medium text-gray-900">{vehicle.vehicleNumber}</div>
            <div className="text-xs text-gray-500">{vehicle.type}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{vehicle.capacity}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
          {vehicle.status === 'Active' || vehicle.status === 'Available' ? '✓ ' + vehicle.status : vehicle.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getApprovalStatusColor(vehicle.approvalStatus)}`}>
          {vehicle.approvalStatus === 'Approved' ? '✓ Approved' : vehicle.approvalStatus}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`text-xs font-medium ${getInsuranceColor(vehicle.insuranceStatus)}`}>
          {getInsuranceText(vehicle.insuranceExpiry, vehicle.insuranceStatus)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDetails(vehicle)}
            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {/* Status Change Button - For both owner and admin */}
          {(currentUserRole === 'owner' || currentUserRole === 'admin') && vehicle.approvalStatus === 'Approved' && (
            <button
              onClick={() => handleStatusClick(vehicle)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              title="Change Status"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          
          {/* Edit/Resubmit button - Only for owners */}
          {currentUserRole === 'owner' && (vehicle.status === 'Active' || vehicle.status === 'Rejected') && (
            <button
              onClick={() => handleEditClick(vehicle)}
              className={`p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition`}
              title={vehicle.status === 'Rejected' ? 'Resubmit' : 'Edit'}
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {/* Admin only buttons */}
          {currentUserRole === 'admin' && (
            <>
              {vehicle.status === 'Active' && (
                <button
                  onClick={() => handleAssignClick(vehicle)}
                  className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  title="Assign Transport"
                >
                  <Truck className="w-4 h-4" />
                </button>
              )}
              
              {(vehicle.status === 'Pending Approval' || vehicle.status === 'Edit Request') && (
                <>
                  <button
                    onClick={() => handleApproveClick(vehicle)}
                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    title="Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRejectClick(vehicle)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <div className="font-semibold">Success!</div>
              <div className="text-sm">{successMessage}</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vehicles</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`px-2 py-1 rounded text-xs font-medium ${currentUserRole === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {currentUserRole === 'admin' ? 'Admin User' : 'Rice Mill Owner'}
              </div>
              <p className="text-gray-500">Manage all vehicles across different statuses</p>
            </div>
          </div>
          
         <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Vehicle
          </button>
        </div>

        {/* ========== KPI DASHBOARD ========== */}
        <div className="mb-8">
          {/* Primary KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard 
              title="Total Vehicles" 
              value={dashboardData.totalVehicles} 
              subtitle="Fleet size" 
              icon={Truck} 
              color="bg-gradient-to-br from-blue-500 to-indigo-600" 
              trend={+8.2} 
            />
            <KpiCard 
              title="Active Vehicles" 
              value={dashboardData.activeVehicles} 
              subtitle="Currently operational" 
              icon={Activity} 
              color="bg-gradient-to-br from-emerald-500 to-teal-600" 
              trend={+12.4} 
            />
            <KpiCard 
              title="Pending Approvals" 
              value={dashboardData.pendingApprovals} 
              subtitle="Awaiting review" 
              icon={AlertCircle} 
              color="bg-gradient-to-br from-amber-500 to-orange-600" 
              trend={+3.1} 
            />
            <KpiCard 
              title="Under Maintenance" 
              value={dashboardData.underMaintenance} 
              subtitle="Repair/Service" 
              icon={Settings} 
              color="bg-gradient-to-br from-purple-500 to-pink-600" 
              trend={-2.4} 
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <KpiCard 
              title="Insurance Expiring" 
              value={dashboardData.insuranceExpiring} 
              subtitle="Renewal required" 
              icon={Shield} 
              color="bg-gradient-to-br from-red-500 to-rose-600" 
              trend={+1.5} 
            />
            <KpiCard 
              title="Maintenance Alerts" 
              value={dashboardData.maintenanceAlerts} 
              subtitle="Service due" 
              icon={AlertTriangle} 
              color="bg-gradient-to-br from-orange-500 to-red-600" 
              trend={+2.3} 
            />
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by vehicle number or type..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-3 bg-gray-50/50 rounded-xl px-4 py-3 border border-gray-200">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="bg-transparent focus:outline-none text-sm font-medium w-full md:w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Active">Active</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Edit Request">Edit Request</option>
                <option value="Rejected">Rejected</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-50/50 rounded-xl p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white shadow-sm text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        

        {/* Content Area */}
        {viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {paginatedVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Approval
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Insurance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedVehicles.map(vehicle => (
                    <VehicleTableRow key={vehicle.id} vehicle={vehicle} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredVehicles.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    currentPage === i + 1
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredVehicles.length === 0 && (
          <div className="text-center py-16 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100">
            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-400 text-lg font-medium mb-2">No vehicles found</div>
            <div className="text-sm text-gray-500">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>

      {/* =============== ALL MODALS =============== */}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Add New Vehicle</h3>
                    <p className="text-sm text-gray-500">Vehicle will require admin approval</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-48 h-32 object-cover rounded-lg mx-auto mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setUploadedImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <div className="text-sm text-gray-600 mb-2">Click to upload vehicle image</div>
                      <div className="text-xs text-gray-500">Supported: JPG, PNG (Max 5MB)</div>
                    </>
                  )}
                  <input
                    type="file"
                    id="vehicle-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="vehicle-image"
                    className="mt-4 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer text-sm font-medium"
                  >
                    Choose Image
                  </label>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition">
                  <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-600 mb-2">Click to upload documents</div>
                  <div className="text-xs text-gray-500">Supported: PDF, JPG, PNG (Max 10MB each)</div>
                  <input
                    type="file"
                    id="vehicle-documents"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    onChange={handleDocumentUpload}
                  />
                  <label
                    htmlFor="vehicle-documents"
                    className="mt-4 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer text-sm font-medium"
                  >
                    Choose Documents
                  </label>
                </div>
                
                {/* Uploaded Documents List */}
                {uploadedDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                            <div className="text-xs text-gray-500">{doc.size} • {doc.type.toUpperCase()}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="WP CAB 1234"
                    value={newVehicle.vehicleNumber}
                    onChange={(e) => setNewVehicle({...newVehicle, vehicleNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  >
                    <option value="Lorry">Lorry</option>
                    <option value="Mini Lorry">Mini Lorry</option>
                    <option value="Three-wheel">Three-wheel</option>
                    <option value="Container Truck">Container Truck</option>
                    <option value="Pickup Truck">Pickup Truck</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (kg) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newVehicle.fuelType}
                    onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="TATA1612X1234567"
                    value={newVehicle.chassisNumber}
                    onChange={(e) => setNewVehicle({...newVehicle, chassisNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CRDE4D34T56789"
                    value={newVehicle.engineNumber}
                    onChange={(e) => setNewVehicle({...newVehicle, engineNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newVehicle.registrationDate}
                    onChange={(e) => setNewVehicle({...newVehicle, registrationDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Expiry
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newVehicle.insuranceExpiry}
                    onChange={(e) => setNewVehicle({...newVehicle, insuranceExpiry: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddVehicle}
                disabled={!imagePreview || !newVehicle.vehicleNumber || !newVehicle.capacity}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden">
                    <img 
                      src={selectedVehicle.vehicleImage} 
                      alt={selectedVehicle.vehicleNumber}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedVehicle.vehicleNumber}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedVehicle.status)}`}>
                        {selectedVehicle.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getApprovalStatusColor(selectedVehicle.approvalStatus)}`}>
                        {selectedVehicle.approvalStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Vehicle Image Preview */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4">
                  <img 
                    src={selectedVehicle.vehicleImage} 
                    alt={selectedVehicle.vehicleNumber}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              </div>

              {/* Basic Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Vehicle Type</div>
                    <div className="font-medium text-gray-900">{selectedVehicle.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Capacity</div>
                    <div className="font-medium text-gray-900">{selectedVehicle.capacity}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Fuel Type</div>
                    <div className="font-medium text-gray-900">{selectedVehicle.fuelType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Insurance Expiry</div>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedVehicle.insuranceExpiry).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Added By</div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {selectedVehicle.addedBy === 'Rice Mill Owner' ? (
                        <>
                          <User className="w-4 h-4 text-emerald-600" />
                          Rice Mill Owner
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 text-blue-600" />
                          {selectedVehicle.addedBy}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Approved By</div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {selectedVehicle.approvedBy ? (
                        <>
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          {selectedVehicle.approvedBy}
                        </>
                      ) : (
                        'Pending'
                      )}
                    </div>
                  </div>
                  {selectedVehicle.approvedOn && (
                    <div>
                      <div className="text-sm text-gray-600">Approved On</div>
                      <div className="font-medium text-gray-900">
                        {new Date(selectedVehicle.approvedOn).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedVehicle.documents?.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-gray-100 rounded" title="Download">
                            <Download className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded" title="View">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                      <div className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadedOn).toLocaleDateString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval & Edit Logs */}
              {selectedVehicle.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Rejection Reason
                  </h4>
                  <div className="text-sm text-gray-700 bg-white p-4 rounded-lg">
                    {selectedVehicle.rejectionReason}
                  </div>
                </div>
              )}

              {selectedVehicle.editRequests?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Edit Requests</h4>
                  {selectedVehicle.editRequests?.map((edit, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg mb-3">
                      <div className="font-medium text-gray-900 mb-2">
                        {edit.field}: <span className="text-gray-600">{edit.oldValue}</span> → <span className="text-emerald-600">{edit.newValue}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Requested by {edit.requestedBy} on {new Date(edit.requestedOn).toLocaleDateString('en-IN')}
                      </div>
                      {edit.reason && (
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Reason:</span> {edit.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Edit Vehicle</h3>
                    <p className="text-sm text-gray-500">Changes will require admin approval</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
                    value={editForm.vehicleNumber}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.type}
                    onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                  >
                    <option value="Lorry">Lorry</option>
                    <option value="Mini Lorry">Mini Lorry</option>
                    <option value="Three-wheel">Three-wheel</option>
                    <option value="Container Truck">Container Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (kg) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({...editForm, capacity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.fuelType}
                    onChange={(e) => setEditForm({...editForm, fuelType: e.target.value})}
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edit Reason *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Please explain why you're making these changes..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Submit Edit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Vehicle Modal (Admin Only) */}
      {showApproveModal && selectedVehicle && currentUserRole === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Approve Vehicle</h3>
                    <p className="text-sm text-gray-500">{selectedVehicle.vehicleNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowApproveModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 mb-6">
                <div className="font-medium text-gray-900 mb-2">Are you sure you want to approve this vehicle?</div>
                <div className="text-sm text-gray-600">
                  This will change the status to <span className="font-semibold">Active</span> and make it available for assignments.
                </div>
              </div>

              {selectedVehicle.status === 'Edit Request' && selectedVehicle.editRequests?.length > 0 && (
                <div className="mb-6">
                  <div className="font-medium text-gray-900 mb-2">Changes to be approved:</div>
                  {selectedVehicle.editRequests?.map((edit, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {edit.field}: {edit.oldValue} → {edit.newValue}
                      </div>
                      {edit.reason && (
                        <div className="text-xs text-gray-500 mt-1">Reason: {edit.reason}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100">
              <button 
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleApproveVehicle}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Vehicle Modal (Admin Only) */}
      {showRejectModal && selectedVehicle && currentUserRole === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Reject Vehicle</h3>
                    <p className="text-sm text-gray-500">{selectedVehicle.vehicleNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-4 mb-6">
                <div className="font-medium text-gray-900 mb-2">Please provide a reason for rejection</div>
                <div className="text-sm text-gray-600">
                  This will change the status to <span className="font-semibold">Rejected</span>.
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Please provide a detailed reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectVehicle}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                disabled={!rejectionReason.trim()}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Transport Modal */}
      {showAssignModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Assign Transport</h3>
                    <p className="text-sm text-gray-500">{selectedVehicle.vehicleNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Transport Schedule
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choose a transport schedule</option>
                    <option value="TR001">Colombo → Kandy (Today, 10:00 AM)</option>
                    <option value="TR002">Kandy → Galle (Today, 2:00 PM)</option>
                    <option value="TR003">Colombo → Jaffna (Tomorrow, 8:00 AM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Driver
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choose a driver</option>
                    <option value="D001">Rajesh Kumar (Available)</option>
                    <option value="D002">Suresh Patel (Available)</option>
                    <option value="D003">Kamal Perera (Available)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100">
              <button 
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignTransport}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resubmit Vehicle Modal */}
      {showResubmitModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Resubmit Vehicle</h3>
                    <p className="text-sm text-gray-500">{selectedVehicle.vehicleNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowResubmitModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6">
                {selectedVehicle.rejectionReason && (
                  <div className="mb-3">
                    <div className="font-medium text-gray-900 mb-1">Previous Rejection Reason:</div>
                    <div className="text-sm text-gray-600">{selectedVehicle.rejectionReason}</div>
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  This will resubmit the vehicle for admin approval with status: <span className="font-semibold">Pending Approval</span>.
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resubmission Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Explain what changes you've made..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Updated Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                  <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Upload corrected documents</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100">
              <button 
                onClick={() => setShowResubmitModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleResubmitVehicle}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Resubmit for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => setShowStatusModal(false)} />
            
            <div className="inline-block w-full max-w-md my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-blue-600" />
                  Change Vehicle Status
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Update status for {selectedVehicle.vehicleNumber}
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusChange('Available')}
                    className="w-full p-4 border-2 border-green-200 bg-green-50 hover:bg-green-100 rounded-xl text-left transition"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">Available</div>
                        <div className="text-sm text-green-700">Vehicle is ready for trips</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('On Trip')}
                    className="w-full p-4 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition"
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">On Trip</div>
                        <div className="text-sm text-blue-700">Vehicle is currently on a delivery</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('Maintenance')}
                    className="w-full p-4 border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 rounded-xl text-left transition"
                  >
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium text-orange-900">Maintenance</div>
                        <div className="text-sm text-orange-700">Vehicle is under maintenance</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-100">
                <button 
                  onClick={() => setShowStatusModal(false)}
                  className="px-6 py-2 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}