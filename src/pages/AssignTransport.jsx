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
  Loader,
  AlertTriangle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { rtdb as db } from '../firebase/config';
import { ref, onValue, set, update, get, push, remove } from 'firebase/database';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { filterSnapshotByOwner, getCurrentUserEmail } from '../utils/firebaseFilters';
import PopupAlert from '../components/ui/PopupAlert';
import { 
  validateTripAssignment, 
  validateGPSCoordinates,
  classifyNetworkError 
} from '../utils/tripValidation';

export function AssignTransport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userEmail = getCurrentUserEmail(user);
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
  const [recommendedMatches, setRecommendedMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [alert, setAlert] = useState({ isOpen: false, type: 'success', title: '', message: '', details: [] });

  const seedVehicles = () => {
    const fallbackOwner = userEmail || 'owner@colombomill.lk';
    const seeds = {
      'veh-1': {
        owner_email: fallbackOwner,
        vehicleNumber: 'CAB-7890',
        type: 'Truck',
        capacity: '5000 kg',
        fuelType: 'Diesel',
        status: 'Active',
        insuranceStatus: 'valid',
        insuranceExpiry: new Date(Date.now() + 1000*60*60*24*180).toISOString(),
        trackerId: 'TRK-001',
        currentLocation: 'Main Warehouse',
        vehicleImage: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80'
      },
      'veh-2': {
        owner_email: fallbackOwner,
        vehicleNumber: 'CP-4567',
        type: 'Pickup Truck',
        capacity: '2000 kg',
        fuelType: 'Diesel',
        status: 'Active',
        insuranceStatus: 'valid',
        insuranceExpiry: new Date(Date.now() + 1000*60*60*24*120).toISOString(),
        trackerId: 'TRK-002',
        currentLocation: 'Yard A',
        vehicleImage: 'https://images.unsplash.com/photo-1502877828070-33b167ad6860?auto=format&fit=crop&w=800&q=80'
      }
    };
    return Object.keys(seeds).map(key => ({ id: key, ...seeds[key], isAvailable: true }));
  };

  const seedDrivers = () => {
    const fallbackOwner = userEmail || 'owner@colombomill.lk';
    const seeds = {
      'drv-1': {
        owner_email: fallbackOwner,
        name: 'Nimal Perera',
        phone: '+94 76 234 5678',
        role: 'Driver',
        status: 'active',
        experience: '5 years',
        rating: '4.8',
        lastActive: '2 min ago',
        tripsCompleted: 124,
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nimal',
        licenseNumber: 'LIC-001',
        currentLocation: 'Main Warehouse',
        preferredVehicleTypes: ['Truck', 'Lorry']
      },
      'drv-2': {
        owner_email: fallbackOwner,
        name: 'Sunil Bandara',
        phone: '+94 71 345 6789',
        role: 'Driver',
        status: 'active',
        experience: '3 years',
        rating: '4.6',
        lastActive: '5 min ago',
        tripsCompleted: 89,
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunil',
        licenseNumber: 'LIC-002',
        currentLocation: 'Yard A',
        preferredVehicleTypes: ['Pickup Truck', 'Van']
      }
    };
    return Object.keys(seeds).map(key => ({ id: key, ...seeds[key], status: 'Available', isAvailable: true }));
  };

  // Firebase Listeners
  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);
    
    // Load vehicles
    const vehiclesRef = ref(db, 'vehicles');
    const unsubscribeVehicles = onValue(vehiclesRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawList = Object.entries(snapshot.val() || {}).map(([id, val]) => ({ id, ...val }));
        const scoped = filterSnapshotByOwner(snapshot, userEmail);
        const source = scoped.length > 0 ? scoped : rawList; // fallback if records lack owner_email

        const vehiclesList = source.map(item => {
          const status = (item.status || '').toLowerCase();
          const busy = Boolean(item.currentTripId);
          const availableFlag = item.isAvailable;
          return {
            id: item.id,
            ...item,
            isAvailable: availableFlag !== undefined ? availableFlag : (!busy && (status ? status === 'active' : true))
          };
        });
        setVehicles(vehiclesList);
      } else {
        const vehiclesList = seedVehicles();
        setVehicles(vehiclesList);
        try { set(workersRef, Object.fromEntries(vehiclesList.map(v => [v.id, v]))); } catch (e) { /* ignore permission errors */ }
      }
    }, (error) => {
      console.error('Firebase vehicles error:', error);
      toast.error('Failed to load vehicles');
      setVehicles(seedVehicles());
    });

    // Load drivers from workers node
    const workersRef = ref(db, 'workers');
    const unsubscribeDrivers = onValue(workersRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawList = Object.entries(snapshot.val() || {}).map(([id, val]) => ({ id, ...val }));
        const scoped = filterSnapshotByOwner(snapshot, userEmail);
        const source = scoped.length > 0 ? scoped : rawList; // fallback if records lack owner_email

        const driversList = source
          .filter(item => (item.role || '').toLowerCase() === 'driver')
          .map(item => {
            const busy = Boolean(item.currentTripId);
            const availableFlag = item.isAvailable;
            const status = busy ? 'Busy' : 'Available';
            return {
              id: item.id,
              name: item.name,
              phone: item.phone,
              status,
              experience: item.experience || '0 years',
              rating: item.rating || '0.0',
              lastActive: item.lastActive || 'N/A',
              tripsCompleted: item.tripsCompleted || 0,
              driverImage: item.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
              licenseNumber: item.licenseNumber || 'N/A',
              currentLocation: item.currentLocation || 'Unknown',
              isAvailable: availableFlag !== undefined ? availableFlag : !busy,
              preferredVehicleTypes: item.preferredVehicleTypes || ['Lorry', 'Mini Lorry'],
              assignedVehicleId: item.assignedVehicleId || null,
              assignedVehicleNumber: item.assignedVehicleNumber || null
            };
          });
        setDrivers(driversList);
      } else {
        const driversList = seedDrivers();
        setDrivers(driversList);
        try { set(workersRef, Object.fromEntries(driversList.map(d => [d.id, d]))); } catch (e) { /* ignore permission errors */ }
      }
    }, (error) => {
      console.error('Firebase drivers error:', error);
      toast.error('Failed to load drivers');
      setDrivers(seedDrivers());
    });

    // Load orders (pending transport)
    const ordersRef = ref(db, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const ordersList = filterSnapshotByOwner(snapshot, userEmail)
        .filter(item => item.status === 'Pending Transport' || item.status === 'Confirmed' || item.status === 'approved' || item.status === 'pending');
      console.log('AssignTransport loaded orders:', ordersList.map(o => ({ 
        id: o.id, 
        status: o.status,
        deliveryAddress: o.deliveryAddress, 
        dealerAddress: o.dealerAddress, 
        address: o.address 
      })));
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      console.error('Firebase orders error:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    });

    return () => {
      unsubscribeVehicles();
      unsubscribeDrivers();
      unsubscribeOrders();
    };
  }, [userEmail]);

  // Preselect order when navigated from Orders with state (bulletproof)
  useEffect(() => {
    if (!location.state) return;

    const { orderId, order } = location.state;
    console.log('AssignTransport navigation state:', { orderId, order });
    console.log('Order address fields:', {
      deliveryAddress: order?.deliveryAddress,
      dealerAddress: order?.dealerAddress,
      address: order?.address
    });

    if (order) {
      setSelectedOrder(order);
      setFormData(prev => ({
        ...prev,
        tripType: order.type || 'delivery',
        endLocation: order.deliveryAddress || order.pickupAddress || ''
      }));
      return;
    }

    if (orderId && orders.length > 0) {
      const found = orders.find(o => o.id === orderId);
      console.log('Found order from Firebase:', found);
      console.log('Found order address fields:', {
        deliveryAddress: found?.deliveryAddress,
        dealerAddress: found?.dealerAddress,
        address: found?.address
      });
      if (found) {
        setSelectedOrder(found);
        setFormData(prev => ({
          ...prev,
          tripType: found.type || 'delivery',
          endLocation: found.deliveryAddress || found.pickupAddress || ''
        }));
      }
    }
  }, [location.state, orders]);

  // Filter orders based on trip type
  const getFilteredOrders = () => {
    return orders.filter(order => 
      (order.type || 'delivery') === formData.tripType && 
      (order.status === 'Pending Transport' || order.status === 'Confirmed' || order.status === 'approved')
    );
  };

  // Available vehicles loaded from Firebase

  // Available drivers loaded from Firebase workers

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
      setFormData(prev => ({ ...prev, endLocation: address || '' }));
    }
  }, [selectedOrder, formData.tripType]);

  // Calculate recommended matches
  useEffect(() => {
    const calculateMatches = () => {
      const matches = [];
      
      // Find if driver is assigned to selected vehicle
      if (selectedVehicle) {
        const assignedDriver = drivers.find(d => 
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
        const assignedVehicle = vehicles.find(v => 
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
        const compatibleDrivers = drivers
          .filter(d => d.isAvailable && d.id !== formData.driver)
          .filter(d => d.preferredVehicleTypes?.includes(selectedVehicle.type))
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
        const compatibleVehicles = vehicles
          .filter(v => v.isAvailable && v.id !== formData.vehicle)
          .filter(v => selectedDriver.preferredVehicleTypes?.includes(v.type))
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
        const topDrivers = drivers
          .filter(d => d.isAvailable)
          .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
          .slice(0, 2);
        
        topDrivers.forEach(driver => {
          matches.push({
            type: 'top',
            driver,
            reason: `Top rated driver (★ ${driver.rating})`
          });
        });
        
        const availableVehiclesList = vehicles
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
    const order = orders.find(o => o.id === orderId);
    setSelectedOrder(order);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle);
    setFormData(prev => ({ ...prev, vehicle: vehicleId }));
  };

  // Handle driver selection
  const handleDriverSelect = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    setSelectedDriver(driver);
    setFormData(prev => ({ ...prev, driver: driverId }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Order Required',
        message: 'Select an order before assigning transport.',
        details: []
      });
      return;
    }
    setShowConfirmModal(true);
  };

  // Handle confirm assignment - IMPROVED: Now includes validation & error handling
  const handleConfirmAssignment = async () => {
    console.log('🚀 Starting transport assignment...');
    console.log('Selected data:', {
      order: selectedOrder?.id,
      vehicle: selectedVehicle?.id,
      driver: selectedDriver?.id,
      endLocation: formData.endLocation
    });
    
    setIsLoading(true);
    
    try {
      // ==================== VALIDATION ====================
      console.log('🔍 Starting validation...');
      // Fetch active trips to check for conflicts
      const tripsSnapshot = await get(ref(db, 'trips'));
      const activeTrips = tripsSnapshot.exists() 
        ? Object.values(tripsSnapshot.val()).filter(t => 
            ['in-transit', 'scheduled', 'assigned'].includes(t.status)
          )
        : [];
      console.log('📊 Active trips found:', activeTrips.length);
      console.log('👤 Selected driver availability:', {
        id: selectedDriver.id,
        name: selectedDriver.name,
        isAvailable: selectedDriver.isAvailable,
        status: selectedDriver.status
      });

      // Validate all constraints
      const validation = validateTripAssignment(
        {
          orderId: selectedOrder.id,
          vehicleId: selectedVehicle.id,
          driverId: selectedDriver.id,
          endLocation: formData.endLocation
        },
        activeTrips,
        selectedVehicle,
        selectedOrder,
        selectedDriver
      );

      console.log('✅ Validation result:', validation);
      
      if (!validation.isValid) {
        console.log('❌ Validation failed:', validation.errors);
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Cannot Assign Transport',
          message: 'Validation failed:',
          details: validation.errors
        });
        setIsLoading(false);
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Assignment Warnings:', validation.warnings);
      }

      // ==================== CREATE TRIP OBJECT ====================
      console.log('🏗️ Creating trip object...');
      // IMPORTANT: tripId must be the Firebase push() key for system alignment
      // This ensures trips/{tripId} === liveLocations/{tripId}
      const tripRef = push(ref(db, 'trips'));
      const tripId = tripRef.key; // Use Firebase-generated key as single source of truth
      console.log('🆔 Generated tripId:', tripId);
      
      const tripData = {
        tripId,
        orderId: selectedOrder.id,
        orderType: selectedOrder.type,
        vehicleId: selectedVehicle.id,
        driverId: selectedDriver.id,
        driverPhone: selectedDriver.phone, 
        vehicleDetails: {
          vehicleNumber: selectedVehicle.vehicleNumber,
          type: selectedVehicle.type,
          capacity: selectedVehicle.capacity
        },
        driverDetails: {
          name: selectedDriver.name,
          phone: selectedDriver.phone,
          rating: selectedDriver.rating
        },
        orderDetails: selectedOrder,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        scheduledTime: formData.scheduledTime,
        tripType: formData.tripType,
        status: 'assigned',
        progress: 0,
        currentLocation: formData.startLocation,
        gpsTracking: true,
        startedAt: new Date().toISOString(),
        notes: formData.notes,
        estimatedDistance: '75 km',
        estimatedDuration: '2.5 hours',
        waypoints: [],
        timeline: [
          {
            status: 'Assigned',
            timestamp: new Date().toISOString(),
            description: 'Transport assigned to vehicle and driver'
          }
        ],
        owner_email: userEmail
      };

      // ==================== SAVE TO FIREBASE ====================
      console.log('💾 Saving to Firebase...');
      // 1. Create trip record using pre-generated key for alignment
      console.log('📝 Creating trip record...');
      await set(tripRef, tripData);
      console.log('✅ Trip record created successfully');

      // INIT LIVE GPS NODE (IMPORTANT)
      console.log('📍 Initializing GPS tracking...');
      const gpsCoordValidation = validateGPSCoordinates(6.9271, 79.8612);
      if (!gpsCoordValidation.isValid) {
        console.warn('⚠️ GPS Validation:', gpsCoordValidation.error);
      }

      await set(ref(db, `liveLocations/${tripId}`), {
        tripId,
        driverId: selectedDriver.id,
        vehicleId: selectedVehicle.id,
        lat: 6.9271,
        lng: 79.8612,
        speed: 0,
        heading: 0,
        lastUpdated: new Date().toISOString(),
        status: 'active',
        updatedAt: Date.now()
      });
      console.log('✅ GPS tracking initialized');

      // 2. Update order status
      console.log('📦 Updating order status...');
      await update(ref(db, `orders/${selectedOrder.id}`), {
        status: 'In Transit',
        assignedVehicle: selectedVehicle.vehicleNumber,
        assignedDriver: selectedDriver.name,
        tripId,
        assignedAt: new Date().toISOString()
      });
      console.log('✅ Order status updated');

      // 3. Update vehicle status
      console.log('🚛 Updating vehicle status...');
      await update(ref(db, `vehicles/${selectedVehicle.id}`), {
        status: 'On Trip',
        currentTripId: tripId,
        isAvailable: false,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Vehicle status updated');

      // 4. Update driver status (in workers node)
      console.log('👤 Updating driver status...');
      await update(ref(db, `workers/${selectedDriver.id}`), {
        currentTripId: tripId,
        isAvailable: false,
        status: 'on-trip',
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Driver status updated');

      // 5. QUEUE SMS NOTIFICATION (Backend will handle actual sending)
      console.log('📱 Queuing SMS notification...');
      const smsData = {
        to: selectedDriver.phone,
        message: `🚚 New Trip Assigned!
Trip ID: ${tripId}
Vehicle: ${selectedVehicle.vehicleNumber}
From: ${formData.startLocation}
To: ${formData.endLocation}
Time: ${formData.scheduledTime ? formatDateTime(formData.scheduledTime) : 'Immediately'}
Order: ${selectedOrder.id}

Check your dashboard for full details.`,
        tripId,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        driverPhone: selectedDriver.phone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        type: 'trip_assigned'
      };
      console.log('📤 SMS Data:', smsData);

      await push(ref(db, 'notifications/sms_queue'), smsData);
      console.log('✅ SMS notification queued');

      // Update trip status to 'in-transit' for mobile app visibility
      console.log('🔄 Updating trip status to in-transit...');
      await update(ref(db, `trips/${tripId}`), {
        status: 'in-transit',
        startedAt: new Date().toISOString()
      });
      console.log('✅ Trip status updated to in-transit');

      console.log('🎉 Transport assignment completed successfully!');
      console.log('📊 Summary:', {
        tripId,
        orderId: selectedOrder.id,
        driverId: selectedDriver.id,
        vehicleId: selectedVehicle.id,
        driverPhone: selectedDriver.phone
      });

      setShowConfirmModal(false);
      setAlert({
        isOpen: true,
        type: 'success',
        title: 'Transport Assigned Successfully',
        message: `Trip ${tripId} created and notifications sent to driver.`,
        details: [
          `Trip ID: ${tripId}`,
          `Vehicle: ${selectedVehicle.vehicleNumber}`,
          `Driver: ${selectedDriver.name}`,
          `Order: ${selectedOrder.id}`
        ]
      });

      // Go to GPS tracking for this trip after 2 seconds
      setTimeout(() => {
        console.log('🧭 Navigating to GPS tracking page...');
        navigate('/transport-gps', { state: { tripId } });
      }, 2000);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        console.log('🔄 Resetting form...');
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
        setIsLoading(false);
        console.log('✅ Form reset complete');
      }, 3000);

    } catch (error) {
      console.error('❌ Error assigning transport:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });

      const errorClassification = classifyNetworkError(error);
      console.log('📋 Error classification:', errorClassification);
      
      setAlert({
        isOpen: true,
        type: 'error',
        title: `Assignment Failed (${errorClassification.type})`,
        message: errorClassification.message,
        details: [
          errorClassification.suggestion,
          `Technical: ${error.message || 'Unknown error'}`
        ]
      });
      setIsLoading(false);
      console.log('🚨 Error handling complete, loading state reset');
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
    return drivers.filter(driver => driver.isAvailable !== false);
  };

  // Get filtered vehicles for dropdown (only available)
  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle => vehicle.isAvailable !== false);
  };

  // Get assigned driver for a vehicle
  const getAssignedDriverForVehicle = (vehicleId) => {
    return drivers.find(driver => 
      driver.assignedVehicleId === vehicleId && driver.isAvailable
    );
  };

  // Get assigned vehicle for a driver
  const getAssignedVehicleForDriver = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver && driver.assignedVehicleId) {
      return vehicles.find(v => v.id === driver.assignedVehicleId && v.isAvailable);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-900 font-medium">Loading transport data...</span>
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
                onClick={() => navigate('/transport-gps')}
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
                        {order.id} | {(order.type === 'delivery' ? (order.customerName || order.dealerName) : order.supplierName) || 'Unknown'} | {(order.quantity || order.items?.length || 0)} | {order.deliveryAddress || order.pickupAddress || order.address || order.dealerAddress || 'No address'}
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
                                  ? `Customer: ${selectedOrder.customerName || selectedOrder.dealerName || 'Unknown'}`
                                  : `Supplier: ${selectedOrder.supplierName || 'Unknown'}`
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
                              <div className="text-sm text-gray-600">{selectedOrder.quantity || selectedOrder.items?.reduce((sum,i)=>sum + (Number(i.quantity)||0),0) || 'N/A'}</div>
                              <div className="text-sm font-medium text-gray-900">{selectedOrder.value || selectedOrder.totalAmount || ''}</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Delivery Details</div>
                            <div className="text-sm space-y-1">
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                <span className="text-gray-900">
                                  {selectedOrder.type === 'delivery' 
                                    ? (selectedOrder.deliveryAddress || selectedOrder.address || selectedOrder.dealerAddress || 'No address')
                                    : (selectedOrder.pickupAddress || selectedOrder.deliveryAddress || 'No address')
                                  }
                                </span>
                              </div>
                              <div className="text-gray-600">
                                Order Date: {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('en-IN') : selectedOrder.placedOn ? new Date(selectedOrder.placedOn).toLocaleDateString('en-IN') : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    <PopupAlert
                      isOpen={alert.isOpen}
                      type={alert.type}
                      title={alert.title}
                      message={alert.message}
                      details={alert.details}
                      onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
                    />
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
                        if (!Number.isFinite(orderQty) || orderQty <= 0) return true; // no numeric qty, show all
                        if (!Number.isFinite(vehicleCap) || vehicleCap <= 0) return true; // unknown capacity, still show
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
                    {orders.filter(o => o.status === 'Pending Transport' || o.status === 'Confirmed' || o.status === 'approved').length}
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
                    {vehicles.filter(v => v.status === 'Active' && v.isAvailable).length}
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
                    {drivers.filter(d => d.isAvailable).length}
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