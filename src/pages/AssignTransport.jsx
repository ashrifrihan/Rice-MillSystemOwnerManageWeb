// src/pages/AssignTransport.jsx
import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Package, 
  User, 
  Clock, 
  Fuel, 
  Shield, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Home,
  Factory,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  ShoppingCart,
  Building,
  Box,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AssignTransport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle: '',
    driver: '',
    tripType: 'delivery',
    startLocation: 'Main Warehouse - Colombo',
    endLocation: '',
    scheduledTime: '',
    notes: '',
    immediateStart: false
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [recommendedMatches, setRecommendedMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ==================== MOCK DATA: ORDERS NEEDING TRANSPORT ====================
  const transportOrders = [
    {
      id: 'ORD-1023',
      type: 'delivery',
      customerName: 'ABC Supermarket',
      customerId: 'CUST-001',
      address: '123 Galle Road, Colombo 07',
      deliveryAddress: '123 Galle Road, Colombo 07',
      product: 'Samba Rice',
      quantity: '2000 kg',
      status: 'Pending Transport',
      orderDate: '2024-03-15',
      priority: 'High',
      value: '₨ 85,000',
      items: [
        { name: 'Samba Rice', quantity: '1000 kg', price: '₨ 42,500' },
        { name: 'Basmati Rice', quantity: '1000 kg', price: '₨ 42,500' }
      ]
    },
    {
      id: 'ORD-1024',
      type: 'delivery',
      customerName: 'Green Grocers Ltd',
      customerId: 'CUST-002',
      address: '456 Kandy Road, Kurunegala',
      deliveryAddress: '456 Kandy Road, Kurunegala',
      product: 'Red Rice & Lentils',
      quantity: '3500 kg',
      status: 'Pending Transport',
      orderDate: '2024-03-14',
      priority: 'Medium',
      value: '₨ 120,000',
      items: [
        { name: 'Red Rice', quantity: '2000 kg', price: '₨ 70,000' },
        { name: 'Lentils', quantity: '1500 kg', price: '₨ 50,000' }
      ]
    },
    {
      id: 'ORD-1025',
      type: 'pickup',
      supplierName: 'Farm Fresh Suppliers',
      supplierId: 'SUPP-001',
      address: 'Matale Farm Road, Matale',
      pickupAddress: 'Matale Farm Road, Matale',
      product: 'Organic Paddy',
      quantity: '5000 kg',
      status: 'Pending Transport',
      orderDate: '2024-03-16',
      priority: 'High',
      value: '₨ 175,000',
      items: [
        { name: 'Organic Paddy', quantity: '5000 kg', price: '₨ 175,000' }
      ]
    },
    {
      id: 'ORD-1026',
      type: 'delivery',
      customerName: 'City Restaurant Chain',
      customerId: 'CUST-003',
      address: '789 Marine Drive, Galle',
      deliveryAddress: '789 Marine Drive, Galle',
      product: 'Various Rice Types',
      quantity: '1500 kg',
      status: 'Pending Transport',
      orderDate: '2024-03-16',
      priority: 'Low',
      value: '₨ 65,000',
      items: [
        { name: 'White Rice', quantity: '800 kg', price: '₨ 28,000' },
        { name: 'Brown Rice', quantity: '700 kg', price: '₨ 37,000' }
      ]
    },
    {
      id: 'ORD-1027',
      type: 'pickup',
      supplierName: 'Rice Mill Corp',
      supplierId: 'SUPP-002',
      address: 'Mill Complex, Polonnaruwa',
      pickupAddress: 'Mill Complex, Polonnaruwa',
      product: 'Milled Rice',
      quantity: '8000 kg',
      status: 'Pending Transport',
      orderDate: '2024-03-15',
      priority: 'Medium',
      value: '₨ 280,000',
      items: [
        { name: 'Milled Rice', quantity: '8000 kg', price: '₨ 280,000' }
      ]
    }
  ];

  // Filter orders based on trip type
  const getFilteredOrders = () => {
    return transportOrders.filter(order => 
      order.type === formData.tripType && order.status === 'Pending Transport'
    );
  };

  // ==================== MOCK DATA: VEHICLES ====================
  const availableVehicles = [
    {
      id: 'V001',
      vehicleNumber: 'WP CAB 1234',
      type: 'Lorry',
      capacity: '5000 kg',
      fuelType: 'Diesel',
      insuranceExpiry: '2024-06-30',
      insuranceStatus: 'valid',
      status: 'Active',
      vehicleImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop',
      currentLocation: 'Warehouse Yard',
      mileage: '8.5 km/l',
      trackerId: 'GPS-001',
      chassisNumber: 'TATA1612X1234567',
      isAvailable: true
    },
    {
      id: 'V002',
      vehicleNumber: 'WP KA 5678',
      type: 'Mini Lorry',
      capacity: '2000 kg',
      fuelType: 'Petrol',
      insuranceExpiry: '2024-05-15',
      insuranceStatus: 'expiring',
      status: 'Active',
      vehicleImage: 'https://images.unsplash.com/photo-1557229057-f1342e5829d2?w=400&h=300&fit=crop',
      currentLocation: 'Main Yard',
      mileage: '12 km/l',
      trackerId: 'GPS-002',
      chassisNumber: 'TOYOHLX12345678',
      isAvailable: true
    },
    {
      id: 'V003',
      vehicleNumber: 'NP AB 9012',
      type: 'Three-wheel',
      capacity: '500 kg',
      fuelType: 'Petrol',
      insuranceExpiry: '2024-07-31',
      insuranceStatus: 'valid',
      status: 'Active',
      vehicleImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      currentLocation: 'Service Center',
      mileage: '6.5 km/l',
      trackerId: 'GPS-003',
      chassisNumber: 'ASHLEY1234567',
      isAvailable: true
    },
    {
      id: 'V004',
      vehicleNumber: 'CP XY 7890',
      type: 'Container Truck',
      capacity: '10000 kg',
      fuelType: 'Diesel',
      insuranceExpiry: '2024-09-30',
      insuranceStatus: 'valid',
      status: 'Active',
      vehicleImage: 'https://images.unsplash.com/photo-1557844352-761f16da8c67?w=400&h=300&fit=crop',
      currentLocation: 'Storage Yard',
      mileage: '5.5 km/l',
      trackerId: 'GPS-004',
      chassisNumber: 'MERCEDES789012',
      isAvailable: true
    }
  ];

  // ==================== MOCK DATA: DRIVERS ====================
  const availableDrivers = [
    {
      id: 'D001',
      name: 'Rajesh Kumar',
      phone: '077-1234567',
      status: 'Available',
      experience: '5 years',
      rating: '4.8',
      lastActive: '2 hours ago',
      tripsCompleted: 156,
      driverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      licenseNumber: 'LK-D-123456',
      isAvailable: true,
      preferredVehicleTypes: ['Lorry', 'Container Truck']
    },
    {
      id: 'D002',
      name: 'Suresh Patel',
      phone: '077-2345678',
      status: 'Available',
      experience: '3 years',
      rating: '4.5',
      lastActive: '30 minutes ago',
      tripsCompleted: 89,
      driverImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      licenseNumber: 'LK-D-234567',
      currentLocation: 'Kandy',
      assignedVehicleId: null,
      assignedVehicleNumber: null,
      isAvailable: true,
      preferredVehicleTypes: ['Mini Lorry', 'Three-wheel']
    },
    {
      id: 'D003',
      name: 'Kamal Perera',
      phone: '077-3456789',
      status: 'Available',
      experience: '2 years',
      rating: '4.3',
      lastActive: '1 hour ago',
      tripsCompleted: 45,
      driverImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      licenseNumber: 'LK-D-345678',
      currentLocation: 'Galle',
      isAvailable: true,
      preferredVehicleTypes: ['Three-wheel', 'Mini Lorry']
    },
    {
      id: 'D004',
      name: 'Anil Fernando',
      phone: '077-4567890',
      status: 'Busy',
      experience: '7 years',
      rating: '4.9',
      lastActive: 'Just now',
      tripsCompleted: 234,
      driverImage: 'https://images.unsplash.com/photo-1507591064344-4c6ce005-128?w=400&h=400&fit=crop',
      licenseNumber: 'LK-D-456789',
      currentLocation: 'Colombo',
      assignedVehicleId: null,
      assignedVehicleNumber: null,
      isAvailable: false,
      preferredVehicleTypes: ['Lorry', 'Container Truck']
    },
    {
      id: 'D005',
      name: 'Ravi Silva',
      phone: '077-5678901',
      status: 'Available',
      experience: '4 years',
      rating: '4.6',
      lastActive: '45 minutes ago',
      tripsCompleted: 112,
      driverImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop',
      licenseNumber: 'LK-D-567890',
      currentLocation: 'Negombo',
      assignedVehicleId: null,
      assignedVehicleNumber: null,
      isAvailable: true,
      preferredVehicleTypes: ['Container Truck', 'Lorry']
    }
  ];

  // Auto-set scheduled time to next hour
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    now.setSeconds(0);
    
    const formattedTime = now.toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      scheduledTime: formattedTime
    }));
  }, []);

  // When trip type changes, clear selected order if it doesn't match
  useEffect(() => {
    if (selectedOrder && selectedOrder.type !== formData.tripType) {
      setSelectedOrder(null);
      setFormData(prev => ({ ...prev, endLocation: '' }));
    }
  }, [formData.tripType, selectedOrder]);

  // When order is selected, auto-fill end location
  useEffect(() => {
    if (selectedOrder) {
      const address = formData.tripType === 'delivery' 
        ? selectedOrder.deliveryAddress 
        : selectedOrder.pickupAddress;
      setFormData(prev => ({ ...prev, endLocation: address }));
    }
  }, [selectedOrder, formData.tripType]);

  // Calculate recommended matches
  useEffect(() => {
    const calculateMatches = () => {
      const matches = [];
      
      // Find if driver is assigned to selected vehicle
      if (selectedVehicle) {
        const assignedDriver = availableDrivers.find(d => 
          d.assignedVehicleId === selectedVehicle.id && d.isAvailable
        );
        if (assignedDriver) {
          matches.push({
            type: 'assigned',
            driver: assignedDriver,
            reason: `Regular driver of ${selectedVehicle.vehicleNumber}`
          });
        }
      }
      
      // Find if vehicle is assigned to selected driver
      if (selectedDriver && selectedDriver.assignedVehicleId) {
        const assignedVehicle = availableVehicles.find(v => 
          v.id === selectedDriver.assignedVehicleId && v.isAvailable
        );
        if (assignedVehicle) {
          matches.push({
            type: 'assigned',
            vehicle: assignedVehicle,
            reason: `Regular vehicle of ${selectedDriver.name}`
          });
        }
      }
      
      // Recommend drivers based on vehicle type preferences
      if (selectedVehicle && !selectedDriver) {
        const compatibleDrivers = availableDrivers
          .filter(d => d.isAvailable && d.id !== formData.driver)
          .filter(d => d.preferredVehicleTypes.includes(selectedVehicle.type))
          .slice(0, 2);
        
        compatibleDrivers.forEach(driver => {
          matches.push({
            type: 'compatible',
            driver,
            reason: `Expert in ${selectedVehicle.type} vehicles`
          });
        });
      }
      
      // Recommend vehicles based on driver preferences
      if (selectedDriver && !selectedVehicle) {
        const compatibleVehicles = availableVehicles
          .filter(v => v.isAvailable && v.id !== formData.vehicle)
          .filter(v => selectedDriver.preferredVehicleTypes.includes(v.type))
          .slice(0, 2);
        
        compatibleVehicles.forEach(vehicle => {
          matches.push({
            type: 'compatible',
            vehicle,
            reason: `Matches ${selectedDriver.name}'s expertise`
          });
        });
      }
      
      // If nothing is selected, show top recommendations
      if (!selectedVehicle && !selectedDriver) {
        const topDrivers = availableDrivers
          .filter(d => d.isAvailable)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 2);
        
        topDrivers.forEach(driver => {
          matches.push({
            type: 'top',
            driver,
            reason: `Top rated driver (★ ${driver.rating})`
          });
        });
        
        const availableVehiclesList = availableVehicles
          .filter(v => v.isAvailable)
          .slice(0, 1);
        
        availableVehiclesList.forEach(vehicle => {
          matches.push({
            type: 'top',
            vehicle,
            reason: `Available ${vehicle.type}`
          });
        });
      }
      
      setRecommendedMatches(matches);
    };
    
    calculateMatches();
  }, [selectedVehicle, selectedDriver, formData.driver, formData.vehicle]);

  // Handle order selection
  const handleOrderSelect = (orderId) => {
    const order = transportOrders.find(o => o.id === orderId);
    setSelectedOrder(order);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId) => {
    const vehicle = availableVehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle);
    setFormData(prev => ({ ...prev, vehicle: vehicleId }));
  };

  // Handle driver selection
  const handleDriverSelect = (driverId) => {
    const driver = availableDrivers.find(d => d.id === driverId);
    if (!driver) return;
    
    setSelectedDriver(driver);
    setFormData(prev => ({ ...prev, driver: driverId }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      alert('Please select an order first!');
      return;
    }
    setShowConfirmModal(true);
  };

  // Handle confirm assignment - FIXED: Now creates Trip object
  const handleConfirmAssignment = async () => {
    setIsLoading(true);
    
    try {
      // ==================== CREATE TRIP OBJECT ====================
      const tripId = `TRP-${Math.floor(1000 + Math.random() * 9000)}`;
      const tripData = {
        tripId,
        orderId: selectedOrder.id,
        orderType: selectedOrder.type,
        vehicleId: selectedVehicle.id,
        driverId: selectedDriver.id,
        vehicleDetails: selectedVehicle,
        driverDetails: selectedDriver,
        orderDetails: selectedOrder,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        scheduledTime: formData.scheduledTime,
        tripType: formData.tripType,
        status: 'In Transit',
        progress: 0,
        currentLocation: formData.startLocation,
        gpsTracking: true,
        startedAt: new Date().toISOString(),
        notes: formData.notes,
        // For GPS and progress tracking
        estimatedDistance: '75 km',
        estimatedDuration: '2.5 hours',
        waypoints: [],
        // For UI tracking
        timeline: [
          {
            status: 'Assigned',
            timestamp: new Date().toISOString(),
            description: 'Transport assigned to vehicle and driver'
          }
        ]
      };

      // ==================== UPDATE ORDER STATUS ====================
      const updatedOrder = {
        ...selectedOrder,
        status: 'In Transit',
        assignedVehicle: selectedVehicle.vehicleNumber,
        assignedDriver: selectedDriver.name,
        tripId,
        assignedAt: new Date().toISOString()
      };

      // ==================== UPDATE VEHICLE & DRIVER STATUS ====================
      const updatedVehicle = {
        ...selectedVehicle,
        status: 'On Trip',
        currentTripId: tripId,
        isAvailable: false
      };

      const updatedDriver = {
        ...selectedDriver,
        status: 'Busy',
        currentTripId: tripId,
        isAvailable: false
      };

      console.log('🚀 CREATING TRIP:', tripData);
      console.log('📦 UPDATING ORDER:', updatedOrder);
      console.log('🚚 UPDATING VEHICLE:', updatedVehicle);
      console.log('👤 UPDATING DRIVER:', updatedDriver);

      // In real app, you would make API calls here:
      // 1. POST /trips - Create trip record
      // 2. PUT /orders/{orderId} - Update order status
      // 3. PUT /vehicles/{vehicleId} - Update vehicle status
      // 4. PUT /drivers/{driverId} - Update driver status

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowConfirmModal(false);
      setShowSuccessPopup(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          vehicle: '',
          driver: '',
          tripType: 'delivery',
          startLocation: 'Main Warehouse - Colombo',
          endLocation: '',
          scheduledTime: '',
          notes: '',
          immediateStart: false
        });
        setSelectedOrder(null);
        setSelectedVehicle(null);
        setSelectedDriver(null);
        setShowSuccessPopup(false);
        setIsLoading(false);
      }, 3000);

    } catch (error) {
      console.error('Error assigning transport:', error);
      setIsLoading(false);
      alert('Failed to assign transport. Please try again.');
    }
  };

  // Format date for display
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Immediately';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      selectedOrder &&
      formData.tripType &&
      formData.vehicle &&
      formData.driver &&
      formData.endLocation.trim()
    );
  };

  // Get filtered drivers for dropdown (only available)
  const getAvailableDrivers = () => {
    return availableDrivers.filter(driver => driver.isAvailable);
  };

  // Get filtered vehicles for dropdown (only available)
  const getAvailableVehicles = () => {
    return availableVehicles.filter(vehicle => vehicle.isAvailable);
  };

  // Get assigned driver for a vehicle
  const getAssignedDriverForVehicle = (vehicleId) => {
    return availableDrivers.find(driver => 
      driver.assignedVehicleId === vehicleId && driver.isAvailable
    );
  };

  // Get assigned vehicle for a driver
  const getAssignedVehicleForDriver = (driverId) => {
    const driver = availableDrivers.find(d => d.id === driverId);
    if (driver && driver.assignedVehicleId) {
      return availableVehicles.find(v => v.id === driver.assignedVehicleId && v.isAvailable);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <div className="font-semibold">Transport Assigned Successfully!</div>
              <div className="text-sm">
                Trip {`TRP-${Math.floor(1000 + Math.random() * 9000)}`} created. 
                Order is now "In Transit".
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button 
              onClick={() => navigate('/transport')}
              className="hover:text-blue-600 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Transport
            </button>
            <span>•</span>
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span>Transport</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Assign</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assign Transport</h1>
              <p className="text-gray-600 mt-1">Assign vehicles for deliveries or raw material pickup</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/transport/history')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                View History
              </button>
              <button
                onClick={() => navigate('/transport/live')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition"
              >
                Live Map
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* A. Trip Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Trip Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`p-5 border rounded-2xl text-left transition-all duration-300 ${
                        formData.tripType === 'delivery' 
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                      onClick={() => setFormData({...formData, tripType: 'delivery'})}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${formData.tripType === 'delivery' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Package className={`h-5 w-5 ${formData.tripType === 'delivery' ? 'text-blue-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className={`font-semibold ${formData.tripType === 'delivery' ? 'text-blue-700' : 'text-gray-900'}`}>Delivery</div>
                          <div className="text-sm text-gray-500">Product delivery to customers</div>
                        </div>
                        {formData.tripType === 'delivery' && (
                          <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        End location: <span className="font-medium">Customer Address</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      className={`p-5 border rounded-2xl text-left transition-all duration-300 ${
                        formData.tripType === 'pickup' 
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 ring-2 ring-emerald-200' 
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                      onClick={() => setFormData({...formData, tripType: 'pickup'})}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${formData.tripType === 'pickup' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                          <Factory className={`h-5 w-5 ${formData.tripType === 'pickup' ? 'text-emerald-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className={`font-semibold ${formData.tripType === 'pickup' ? 'text-emerald-700' : 'text-gray-900'}`}>Raw Material Pickup</div>
                          <div className="text-sm text-gray-500">Pickup from suppliers/farms</div>
                        </div>
                        {formData.tripType === 'pickup' && (
                          <CheckCircle className="h-5 w-5 text-emerald-600 ml-auto" />
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        End location: <span className="font-medium">Supplier/Farm Address</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* B. ORDER SELECTION (NEW - MOST IMPORTANT FIX) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Order <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500">
                      {getFilteredOrders().length} orders pending transport
                    </span>
                  </div>
                  
                  <select 
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedOrder?.id || ''}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    required
                  >
                    <option value="">Choose an order to transport</option>
                    {getFilteredOrders().map(order => (
                      <option key={order.id} value={order.id}>
                        {order.id} | {order.type === 'delivery' ? order.customerName : order.supplierName} | {order.quantity} | {order.address}
                      </option>
                    ))}
                  </select>
                  
                  {/* Order Preview Card */}
                  {selectedOrder && (
                    <div className="mt-4 animate-fade-in">
                      <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-purple-100">
                              {selectedOrder.type === 'delivery' ? (
                                <ShoppingCart className="w-5 h-5 text-purple-600" />
                              ) : (
                                <Building className="w-5 h-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-bold text-gray-900">{selectedOrder.id}</h4>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  selectedOrder.priority === 'High' 
                                    ? 'bg-red-100 text-red-700' 
                                    : selectedOrder.priority === 'Medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {selectedOrder.priority} Priority
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {selectedOrder.type === 'delivery' 
                                  ? `Customer: ${selectedOrder.customerName}`
                                  : `Supplier: ${selectedOrder.supplierName}`
                                }
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(null);
                              setFormData(prev => ({ ...prev, endLocation: '' }));
                            }}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                          >
                            Change
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Product Details</div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Box className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">{selectedOrder.product}</span>
                              </div>
                              <div className="text-sm text-gray-600">{selectedOrder.quantity}</div>
                              <div className="text-sm font-medium text-gray-900">{selectedOrder.value}</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Delivery Details</div>
                            <div className="text-sm space-y-1">
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                <span className="text-gray-900">
                                  {selectedOrder.type === 'delivery' 
                                    ? selectedOrder.deliveryAddress 
                                    : selectedOrder.pickupAddress
                                  }
                                </span>
                              </div>
                              <div className="text-gray-600">
                                Order Date: {new Date(selectedOrder.orderDate).toLocaleDateString('en-IN')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* C. Vehicle Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Vehicle <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500">
                      {getAvailableVehicles().length} available
                    </span>
                  </div>
                  <select 
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.vehicle}
                    onChange={(e) => handleVehicleSelect(e.target.value)}
                    disabled={!selectedOrder}
                    required
                  >
                    <option value="">{selectedOrder ? 'Choose a vehicle' : 'Select an order first'}</option>
                    {getAvailableVehicles()
                      .filter(vehicle => {
                        // Filter by capacity if order is selected
                        if (!selectedOrder) return true;
                        const orderQty = parseFloat(selectedOrder.quantity);
                        const vehicleCap = parseFloat(vehicle.capacity);
                        return vehicleCap >= orderQty * 0.8; // Vehicle should have at least 80% of required capacity
                      })
                      .map(vehicle => {
                        const assignedDriver = getAssignedDriverForVehicle(vehicle.id);
                        return (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.vehicleNumber} - {vehicle.type} • {vehicle.capacity}
                            {assignedDriver ? ` (Driver: ${assignedDriver.name})` : ''}
                          </option>
                        );
                      })}
                  </select>
                  
                  {/* Vehicle Preview Card */}
                  {selectedVehicle && (
                    <div className="mt-4 animate-fade-in">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden">
                              <img 
                                src={selectedVehicle.vehicleImage} 
                                alt={selectedVehicle.vehicleNumber}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{selectedVehicle.vehicleNumber}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>{selectedVehicle.type}</span>
                                <span>•</span>
                                <span>{selectedVehicle.capacity}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVehicle(null);
                              setFormData(prev => ({ ...prev, vehicle: '' }));
                            }}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                          >
                            Change
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Fuel className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{selectedVehicle.fuelType}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              selectedVehicle.insuranceStatus === 'valid' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              Insurance: {new Date(selectedVehicle.insuranceExpiry).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{selectedVehicle.currentLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">Tracker: {selectedVehicle.trackerId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              getAssignedDriverForVehicle(selectedVehicle.id)
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              Driver: {getAssignedDriverForVehicle(selectedVehicle.id)?.name || 'Not Assigned'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* D. Driver Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Driver <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500">
                      {getAvailableDrivers().length} available
                    </span>
                  </div>
                  <select 
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.driver}
                    onChange={(e) => handleDriverSelect(e.target.value)}
                    disabled={!selectedOrder}
                    required
                  >
                    <option value="">{selectedOrder ? 'Choose a driver' : 'Select an order first'}</option>
                    {getAvailableDrivers().map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} • {driver.phone} • {driver.experience} • ★ {driver.rating}
                        {driver.assignedVehicleNumber ? ` (Vehicle: ${driver.assignedVehicleNumber})` : ''}
                      </option>
                    ))}
                  </select>
                  
                  {/* Driver Preview Card */}
                  {selectedDriver && (
                    <div className="mt-4 animate-fade-in">
                      <div className="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden">
                              <img 
                                src={selectedDriver.driverImage} 
                                alt={selectedDriver.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{selectedDriver.name}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {selectedDriver.phone}
                                </span>
                                <span>•</span>
                                <span>★ {selectedDriver.rating}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDriver(null);
                              setFormData(prev => ({ ...prev, driver: '' }));
                            }}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                          >
                            Change
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">Last active: {selectedDriver.lastActive}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{selectedDriver.tripsCompleted} trips</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{selectedDriver.currentLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{selectedDriver.experience}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              selectedDriver.status === 'Available' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {selectedDriver.status}
                            </span>
                          </div>
                          {selectedDriver.assignedVehicleNumber && (
                            <div className="flex items-center gap-2 text-sm">
                              <Truck className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">Assigned: {selectedDriver.assignedVehicleNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommended Matches */}
                {selectedOrder && recommendedMatches.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Smart Recommendations for {selectedOrder.id}</h4>
                    </div>
                    <div className="space-y-2">
                      {recommendedMatches.slice(0, 3).map((match, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {match.driver ? match.driver.name : match.vehicle?.vehicleNumber}
                            </div>
                            <div className="text-xs text-gray-600">{match.reason}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (match.driver && !selectedDriver) {
                                handleDriverSelect(match.driver.id);
                              } else if (match.vehicle && !selectedVehicle) {
                                handleVehicleSelect(match.vehicle.id);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs rounded-lg transition ${
                              (match.driver && !selectedDriver) || (match.vehicle && !selectedVehicle)
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={(match.driver && selectedDriver) || (match.vehicle && selectedVehicle)}
                          >
                            {(match.driver && selectedDriver) || (match.vehicle && selectedVehicle) ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* E. Location Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Location
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.startLocation}
                        onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Location <span className="text-red-500">*</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({formData.tripType === 'delivery' ? 'Customer Address' : 'Supplier/Farm Address'})
                      </span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter ${formData.tripType === 'delivery' ? 'customer' : 'supplier'} address`}
                        value={formData.endLocation}
                        onChange={(e) => setFormData({...formData, endLocation: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* F. Schedule Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Time
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="immediateStart"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={formData.immediateStart}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            immediateStart: e.target.checked,
                            scheduledTime: e.target.checked ? '' : prev.scheduledTime
                          }));
                        }}
                      />
                      <label htmlFor="immediateStart" className="ml-2 text-sm text-gray-700">
                        Start immediately
                      </label>
                    </div>
                  </div>
                </div>

                {/* G. Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <textarea
                      rows="3"
                      className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any special instructions... (e.g., Fragile goods, Urgent delivery, Take shorter route, Call customer before arrival)"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center ${
                    isFormValid() && !isLoading
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Creating Trip...
                    </>
                  ) : (
                    'Assign Transport'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Summary & Stats */}
          <div className="space-y-6">
            {/* Trip Summary Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Summary</h3>
              
              {selectedOrder ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Order ID</div>
                      <div className="font-medium text-gray-900">{selectedOrder.id}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Trip Type</div>
                      <div className="font-medium text-gray-900 capitalize">{formData.tripType}</div>
                    </div>
                  </div>
                  
                  {selectedVehicle && (
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Vehicle</div>
                      <div className="font-medium text-gray-900">{selectedVehicle.vehicleNumber}</div>
                      <div className="text-sm text-gray-600">{selectedVehicle.type} • {selectedVehicle.capacity}</div>
                    </div>
                  )}
                  
                  {selectedDriver && (
                    <div className="bg-emerald-50 p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Driver</div>
                      <div className="font-medium text-gray-900">{selectedDriver.name}</div>
                      <div className="text-sm text-gray-600">{selectedDriver.phone} • ★ {selectedDriver.rating}</div>
                    </div>
                  )}
                  
                  {formData.endLocation && (
                    <div className="bg-amber-50 p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Route</div>
                      <div className="font-medium text-gray-900">From: {formData.startLocation}</div>
                      <div className="font-medium text-gray-900">To: {formData.endLocation}</div>
                    </div>
                  )}
                  
                  {formData.scheduledTime && (
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Scheduled Time</div>
                      <div className="font-medium text-gray-900">{formatDateTime(formData.scheduledTime)}</div>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-xl border border-green-200">
                    <div className="text-xs text-gray-500 mb-1">After Assignment</div>
                    <ul className="text-xs space-y-1 text-gray-700">
                      <li>• Order status → "In Transit"</li>
                      <li>• Vehicle status → "On Trip"</li>
                      <li>• Driver status → "Busy"</li>
                      <li>• Trip record created</li>
                      <li>• GPS tracking starts</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Select an order to see trip summary</p>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Transport Dashboard</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ShoppingCart className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700">Orders Pending Transport</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {transportOrders.filter(o => o.status === 'Pending Transport').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">Active Vehicles</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {availableVehicles.filter(v => v.status === 'Active').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-gray-700">Available Drivers</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {availableDrivers.filter(d => d.status === 'Available').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Navigation className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm text-gray-700">Active Trips</span>
                  </div>
                  <span className="font-bold text-gray-900">2</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-blue-100 p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">System Flow</h4>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                      <span><strong>1. Select Order</strong> - Choose what needs transport</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                      <span><strong>2. Assign Vehicle & Driver</strong> - To that order</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                      <span><strong>3. Trip Record Created</strong> - For GPS & progress tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                      <span><strong>4. Order → "In Transit"</strong> - Progress tracked on Live Map</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Confirm Assignment</h3>
                    <p className="text-sm text-gray-500">Assign transport to {selectedOrder?.id}?</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Assignment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedOrder?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vehicle:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedVehicle?.vehicleNumber} ({selectedVehicle?.type})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Driver:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedDriver?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Trip Type:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{formData.tripType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">From:</span>
                    <span className="text-sm font-medium text-gray-900">{formData.startLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">To:</span>
                    <span className="text-sm font-medium text-gray-900">{formData.endLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Scheduled:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDateTime(formData.scheduledTime)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <div className="font-medium mb-1">System Changes After Confirmation:</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Order {selectedOrder?.id}</strong> → "In Transit"</li>
                      <li><strong>{selectedVehicle?.vehicleNumber}</strong> → "On Trip"</li>
                      <li><strong>{selectedDriver?.name}</strong> → "Busy"</li>
                      <li><strong>Trip Record Created</strong> (for GPS tracking)</li>
                      <li><strong>Live Map</strong> will show progress</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-100">
              <button 
                onClick={() => setShowConfirmModal(false)}
                disabled={isLoading}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAssignment}
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating Trip...
                  </>
                ) : (
                  'Confirm Assignment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignTransport;