// src/pages/TransportGPS.jsx - COMPLETE ACTIVE TRANSPORT & LIVE GPS PAGE
import React, { useState, useEffect } from 'react';
import { 
  TruckIcon, 
  MapPinIcon, 
  UsersIcon, 
  ClockIcon,
  PhoneIcon,
  MessageCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  NavigationIcon,
  PackageIcon,
  FileTextIcon,
  DownloadIcon,
  UserIcon,
  StarIcon,
  ThermometerIcon,
  WifiIcon,
  WifiOffIcon,
  MapIcon,
  SatelliteIcon,
  EyeIcon,
  ShieldIcon,
  ChevronRightIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XIcon,
  InfoIcon,
  CalendarIcon,
  BatteryIcon,
  FuelIcon,
  ZapIcon
} from 'lucide-react';

// Mock data for Sri Lanka
export const mockTransportData = {
  activeTransports: [
    {
      id: 'TRP-2023-001',
      transportType: 'Rice Delivery',
      status: 'in-transit',
      statusBadge: 'In Transit',
      customer: {
        name: 'Colombo Supermarket',
        phone: '+94 77 123 4567',
        address: '123 Galle Road, Colombo 03'
      },
      driver: {
        name: 'Nimal Perera',
        phone: '+94 76 234 5678',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nimal',
        rating: 4.8,
        completedTrips: 124,
        lastActive: '2 min ago'
      },
      vehicle: {
        id: 'V-001',
        number: 'CAB-7890',
        type: 'Truck',
        capacity: '5000 kg',
        speed: 65,
        temperature: 22,
        fuel: 78,
        battery: 92
      },
      route: {
        start: 'Lanka Rice Mill, Kurunegala',
        destination: 'Colombo Supermarket, Colombo 03',
        distance: 95,
        duration: '2h 15m',
        remainingDistance: 32,
        progress: 66,
        eta: '2023-11-20 16:45',
        currentLocation: {
          lat: 7.4654,
          lng: 80.3658,
          address: 'Near Kegalle Town, Kegalle District'
        }
      },
      timeline: [
        { step: 'Order Placed', time: '2023-11-20 08:00', completed: true },
        { step: 'Confirmed', time: '2023-11-20 08:15', completed: true },
        { step: 'Vehicle Assigned', time: '2023-11-20 08:30', completed: true },
        { step: 'Driver Started', time: '2023-11-20 09:00', completed: true },
        { step: 'In Transit', time: '2023-11-20 09:15', current: true },
        { step: 'Arriving', time: null, pending: true },
        { step: 'Delivered', time: null, pending: true }
      ],
      products: [
        { name: 'Samba Rice', bags: 50, kgPerBag: 25, pricePerKg: 120, totalKG: 1250 },
        { name: 'Nadu Rice', bags: 30, kgPerBag: 25, pricePerKg: 110, totalKG: 750 },
        { name: 'Red Rice', bags: 20, kgPerBag: 25, pricePerKg: 130, totalKG: 500 }
      ],
      documents: [
        { name: 'Delivery Receipt', type: 'PDF', size: '1.2 MB' },
        { name: 'Invoice', type: 'PDF', size: '850 KB' },
        { name: 'Dispatch Summary', type: 'PDF', size: '650 KB' }
      ],
      alerts: [
        { type: 'traffic', message: 'Traffic delay near Kadawatha', time: '15 min ago', delay: '20 min' }
      ],
      lastUpdated: '1 min ago'
    },
    {
      id: 'TRP-2023-002',
      transportType: 'Paddy Pickup',
      status: 'scheduled',
      statusBadge: 'Scheduled',
      customer: {
        name: 'Kandy Farmers Co-op',
        phone: '+94 81 234 5678',
        address: 'Peradeniya Road, Kandy'
      },
      driver: {
        name: 'Sunil Bandara',
        phone: '+94 71 345 6789',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunil',
        rating: 4.6,
        completedTrips: 89,
        lastActive: '1 hour ago'
      },
      vehicle: {
        id: 'V-002',
        number: 'CP-4567',
        type: 'Pickup Truck',
        capacity: '2000 kg',
        speed: 0,
        temperature: 25,
        fuel: 100,
        battery: 100
      },
      route: {
        start: 'Lanka Rice Mill, Kurunegala',
        destination: 'Kandy Farmers Co-op, Kandy',
        distance: 75,
        duration: '1h 45m',
        remainingDistance: 75,
        progress: 0,
        eta: '2023-11-20 15:30',
        currentLocation: {
          lat: 7.4818,
          lng: 80.3609,
          address: 'Lanka Rice Mill Premises'
        }
      },
      timeline: [
        { step: 'Order Placed', time: '2023-11-20 10:00', completed: true },
        { step: 'Confirmed', time: '2023-11-20 10:15', completed: true },
        { step: 'Vehicle Assigned', time: '2023-11-20 10:30', current: true },
        { step: 'Driver Started', time: null, pending: true },
        { step: 'In Transit', time: null, pending: true },
        { step: 'Arriving', time: null, pending: true },
        { step: 'Delivered', time: null, pending: true }
      ],
      products: [
        { name: 'Raw Paddy', bags: 80, kgPerBag: 25, pricePerKg: 85, totalKG: 2000 }
      ],
      documents: [
        { name: 'Purchase Order', type: 'PDF', size: '950 KB' },
        { name: 'Dispatch Note', type: 'PDF', size: '750 KB' }
      ],
      alerts: [],
      lastUpdated: '5 min ago'
    },
    {
      id: 'TRP-2023-003',
      transportType: 'Rice Delivery',
      status: 'delivered',
      statusBadge: 'Delivered',
      customer: {
        name: 'Galle City Mart',
        phone: '+94 91 456 7890',
        address: 'Hospital Road, Galle'
      },
      driver: {
        name: 'Kamal Silva',
        phone: '+94 77 567 8901',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kamal',
        rating: 4.9,
        completedTrips: 156,
        lastActive: '30 min ago'
      },
      vehicle: {
        id: 'V-003',
        number: 'GA-1234',
        type: 'Delivery Van',
        capacity: '1500 kg',
        speed: 0,
        temperature: 24,
        fuel: 45,
        battery: 85
      },
      route: {
        start: 'Lanka Rice Mill, Kurunegala',
        destination: 'Galle City Mart, Galle',
        distance: 120,
        duration: '2h 30m',
        remainingDistance: 0,
        progress: 100,
        eta: '2023-11-20 14:00',
        currentLocation: {
          lat: 6.0535,
          lng: 80.2210,
          address: 'Galle City Mart Premises'
        }
      },
      timeline: [
        { step: 'Order Placed', time: '2023-11-20 06:00', completed: true },
        { step: 'Confirmed', time: '2023-11-20 06:15', completed: true },
        { step: 'Vehicle Assigned', time: '2023-11-20 06:30', completed: true },
        { step: 'Driver Started', time: '2023-11-20 07:00', completed: true },
        { step: 'In Transit', time: '2023-11-20 07:15', completed: true },
        { step: 'Arriving', time: '2023-11-20 09:30', completed: true },
        { step: 'Delivered', time: '2023-11-20 09:45', completed: true }
      ],
      products: [
        { name: 'Keeri Samba', bags: 40, kgPerBag: 25, pricePerKg: 140, totalKG: 1000 },
        { name: 'White Rice', bags: 20, kgPerBag: 25, pricePerKg: 100, totalKG: 500 }
      ],
      documents: [
        { name: 'Delivery Receipt', type: 'PDF', size: '1.1 MB' },
        { name: 'Invoice', type: 'PDF', size: '900 KB' },
        { name: 'Customer Sign-off', type: 'PNG', size: '2.3 MB' }
      ],
      alerts: [],
      lastUpdated: '30 min ago'
    }
  ]
};

// Timeline Component
const Timeline = ({ timeline }) => {
  return (
    <div className="space-y-4">
      {timeline.map((item, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              item.completed 
                ? 'bg-green-100 border-2 border-green-500' 
                : item.current 
                ? 'bg-blue-100 border-2 border-blue-500 animate-pulse' 
                : 'bg-gray-100 border-2 border-gray-300'
            }`}>
              {item.completed ? (
                <CheckCircleIcon className={`h-4 w-4 ${item.completed ? 'text-green-600' : 'text-gray-400'}`} />
              ) : item.current ? (
                <ClockIcon className="h-4 w-4 text-blue-600" />
              ) : (
                <div className="text-xs font-medium text-gray-400">{index + 1}</div>
              )}
            </div>
            {index < timeline.length - 1 && (
              <div className={`absolute left-4 top-8 w-0.5 h-10 ${
                timeline[index + 1]?.completed || timeline[index + 1]?.current 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
              }`}></div>
            )}
          </div>
          
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className={`font-medium ${
                  item.completed 
                    ? 'text-green-700' 
                    : item.current 
                    ? 'text-blue-700' 
                    : 'text-gray-500'
                }`}>
                  {item.step}
                </h4>
                {item.time && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(`2023-11-20T${item.time.split(' ')[1]}`).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                )}
              </div>
              
              {item.completed && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
              )}
              {item.current && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full animate-pulse">
                  In Progress
                </span>
              )}
              {item.pending && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                  Pending
                </span>
              )}
            </div>
            
            {item.step === 'In Transit' && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <NavigationIcon className="h-4 w-4" />
                  <span>Vehicle is currently enroute to destination</span>
                </div>
              </div>
            )}
            
            {item.step === 'Delivered' && item.completed && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Delivery completed successfully</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Component
export function TransportGPS() {
  const [selectedTransport, setSelectedTransport] = useState(mockTransportData.activeTransports[0]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mapView, setMapView] = useState('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastUpdateTime, setLastUpdateTime] = useState('Just now');

  // Auto refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      const minutes = ['Just now', '1 min ago', '2 min ago', '3 min ago', '4 min ago', '5 min ago'];
      setLastUpdateTime(minutes[Math.floor(Math.random() * minutes.length)]);
      
      // Simulate location update for active transport
      if (selectedTransport.status === 'in-transit') {
        const updatedTransport = {
          ...selectedTransport,
          route: {
            ...selectedTransport.route,
            remainingDistance: Math.max(0, selectedTransport.route.remainingDistance - 1),
            progress: Math.min(100, selectedTransport.route.progress + 1)
          },
          lastUpdated: 'Just now'
        };
        setSelectedTransport(updatedTransport);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedTransport]);

  // Filter transports
  const filteredTransports = mockTransportData.activeTransports.filter(transport => {
    const matchesSearch = 
      transport.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.driver.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && transport.status === 'in-transit') ||
      (filterStatus === 'scheduled' && transport.status === 'scheduled') ||
      (filterStatus === 'delivered' && transport.status === 'delivered');
    
    return matchesSearch && matchesStatus;
  });

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'in-transit': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'delivered': return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Calculate total amount
  const calculateTotalAmount = (products) => {
    return products.reduce((total, product) => {
      return total + (product.totalKG * product.pricePerKg);
    }, 0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  // Handle transport selection
  const handleSelectTransport = (transport) => {
    setSelectedTransport(transport);
  };

  // Handle SOS
  const handleSOS = () => {
    alert(`🚨 Emergency alert sent for transport ${selectedTransport.id}! Authorities and management have been notified.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Active Transport & Live GPS Tracking</h1>
              <p className="text-gray-600 mt-2">Real-time monitoring of rice & paddy deliveries in Sri Lanka</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated: <span className="font-medium">{lastUpdateTime}</span>
              </div>
              
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RefreshCwIcon className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'} (30s)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMapView('map')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  mapView === 'map' 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapIcon className="h-4 w-4" />
                Map
              </button>
              <button 
                onClick={() => setMapView('satellite')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  mapView === 'satellite' 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SatelliteIcon className="h-4 w-4" />
                Satellite
              </button>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCwIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <EyeIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Live Map */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 mb-6">
              {/* Map Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Live GPS Tracking</h2>
                    <p className="text-gray-600">Real-time location monitoring</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">
                      Connection: <span className={`font-medium ${selectedTransport.driver.lastActive === '2 min ago' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedTransport.driver.lastActive === '2 min ago' ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <NavigationIcon className="h-4 w-4" />
                      Navigate
                    </button>
                  </div>
                </div>
              </div>

              {/* Map Container */}
              <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                {/* Mock Map with Sri Lanka outline */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-80 h-80">
                    {/* Sri Lanka outline with route */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200"></div>
                    
                    {/* Route line */}
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2">
                      <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <path 
                          d="M10,30 Q50,10 90,70" 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="3" 
                          strokeDasharray="5,5"
                        />
                      </svg>
                    </div>
                    
                    {/* Start and End markers */}
                    <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <MapPinIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm">
                          Kurunegala
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
                      <div className="relative">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <MapPinIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap">
                          {selectedTransport.customer.name.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                    
                    {/* Moving vehicle indicator */}
                    <div 
                      className="absolute w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                      style={{
                        left: `${70 - (selectedTransport.route.progress / 100) * 40}%`,
                        top: `${40 + (selectedTransport.route.progress / 100) * 30}%`
                      }}
                    >
                      <TruckIcon className="h-6 w-6 text-white" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Controls */}
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <button className="p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
                    <ArrowUpIcon className="h-5 w-5 text-gray-700" />
                  </button>
                  <button className="p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
                    <ArrowDownIcon className="h-5 w-5 text-gray-700" />
                  </button>
                  <button className="p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
                    <NavigationIcon className="h-5 w-5 text-gray-700" />
                  </button>
                </div>

                {/* Current Location Info */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-xl border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <MapPinIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">Current Location</div>
                        <div className="text-gray-600">{selectedTransport.route.currentLocation.address}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Lat: {selectedTransport.route.currentLocation.lat}, Lng: {selectedTransport.route.currentLocation.lng}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Progress & Metrics */}
              <div className="p-6 border-t border-gray-200">
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Route Progress</span>
                    <span className="font-semibold">{selectedTransport.route.progress}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${selectedTransport.route.progress}%` }}
                      ></div>
                    </div>
                    <div 
                      className="absolute top-1/2 w-6 h-6 bg-white border-4 border-blue-500 rounded-full transform -translate-y-1/2"
                      style={{ left: `${selectedTransport.route.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">{selectedTransport.route.distance} km</div>
                    <div className="text-sm text-blue-600 font-medium">Total Distance</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{selectedTransport.route.remainingDistance} km</div>
                    <div className="text-sm text-green-600 font-medium">Remaining</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">{selectedTransport.route.duration}</div>
                    <div className="text-sm text-purple-600 font-medium">Duration</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                    <div className="text-2xl font-bold text-orange-700">
                      {selectedTransport.route.eta.split(' ')[1]}
                    </div>
                    <div className="text-sm text-orange-600 font-medium">ETA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ETA & Alerts Section */}
            {selectedTransport.alerts.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertTriangleIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-800">Route Alerts</h3>
                    <p className="text-yellow-700">Active alerts affecting this transport</p>
                  </div>
                </div>
                
                {selectedTransport.alerts.map((alert, index) => (
                  <div key={index} className="bg-white/80 p-4 rounded-xl border border-yellow-200 mb-3 last:mb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <div>
                          <div className="font-medium text-gray-900">{alert.message}</div>
                          <div className="text-sm text-gray-500">{alert.time} • Estimated delay: {alert.delay}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Traffic Alert
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Delivery Timeline</h3>
                <div className="text-sm text-gray-500">
                  Last updated: {selectedTransport.lastUpdated}
                </div>
              </div>
              
              <Timeline timeline={selectedTransport.timeline} />
            </div>

            {/* Product & Load Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Product & Load Details</h3>
              
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bags</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">KG/Bag</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total KG</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price/KG</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {selectedTransport.products.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <PackageIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">Rice Product</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{product.bags}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{product.kgPerBag} kg</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{product.totalKG.toLocaleString()} kg</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">Rs. {product.pricePerKg.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-blue-600">
                            Rs. {(product.totalKG * product.pricePerKg).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Total Transport Amount</div>
                    <div className="text-sm text-gray-600">Including all products and charges</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(calculateTotalAmount(selectedTransport.products))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Transport Details */}
          <div className="lg:w-1/3 space-y-6">
            {/* Order/Transport Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedTransport.id}</h3>
                  <p className="text-gray-600">{selectedTransport.transportType}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedTransport.status)}`}>
                  {selectedTransport.statusBadge}
                </span>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-500 mb-2">Customer Details</div>
                  <div className="font-semibold text-gray-900">{selectedTransport.customer.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{selectedTransport.customer.address}</div>
                  <div className="text-sm text-gray-600">{selectedTransport.customer.phone}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-3">Estimated Arrival</div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <ClockIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedTransport.route.eta.split(' ')[1]}
                      </div>
                      <div className="text-sm text-gray-500">Today, {selectedTransport.route.eta.split(' ')[0]}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver & Vehicle Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Driver & Vehicle</h3>
              
              {/* Driver Info */}
              <div className="flex items-start gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                <img 
                  src={selectedTransport.driver.photo} 
                  alt={selectedTransport.driver.name}
                  className="w-16 h-16 rounded-xl border-2 border-white shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{selectedTransport.driver.name}</div>
                      <div className="text-gray-600">{selectedTransport.driver.phone}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{selectedTransport.driver.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-500">
                      {selectedTransport.driver.completedTrips} trips
                    </span>
                    <span className="text-gray-500">
                      Last active: {selectedTransport.driver.lastActive}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Vehicle Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TruckIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{selectedTransport.vehicle.number}</div>
                      <div className="text-sm text-gray-600">{selectedTransport.vehicle.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{selectedTransport.vehicle.capacity}</div>
                    <div className="text-sm text-gray-600">Capacity</div>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Communication Card - Simplified */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Communication</h3>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <PhoneIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Call Driver</div>
                      <div className="text-sm text-gray-600">{selectedTransport.driver.phone}</div>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </button>
                
                
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Documents</h3>
              
              <div className="space-y-3">
                {selectedTransport.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <FileTextIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-500">{doc.type} • {doc.size}</div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white rounded-lg transition-colors">
                      <DownloadIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Transport List - Bottom Section */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Active Transports</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search transports..."
                      className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <select
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">In Transit</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ETA</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredTransports.map((transport) => (
                    <tr 
                      key={transport.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedTransport.id === transport.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectTransport(transport)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{transport.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <PackageIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{transport.transportType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transport.status)}`}>
                          {transport.statusBadge}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{transport.customer.name}</div>
                        <div className="text-sm text-gray-500">{transport.customer.address.split(',')[0]}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{transport.driver.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {transport.route.eta.split(' ')[1]}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(calculateTotalAmount(transport.products))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTransport(transport);
                          }}
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {filteredTransports.length} of {mockTransportData.activeTransports.length} transports
                {searchTerm && ` • Searching: "${searchTerm}"`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransportGPS;