// src/pages/TransportGPS.jsx - FIXED VERSION
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Clock,
  Phone,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Navigation,
  Package,
  FileText,
  Download,
  User,
  Star,
  Map,
  Satellite,
  Search,
  Filter,
  ChevronRight,
  Zap,
  Navigation as NavIcon,
  Route,
  Compass,
  Gauge,
  MapPin as PinIcon,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Target
} from 'lucide-react';

import { GoogleMap, Marker, DirectionsRenderer, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { rtdb } from '../firebase/config.jsx';
import { ref, onValue } from 'firebase/database';
// import { sampleTripsData } from '../utils/seedSampleTransports.js';

// FIX 1: Define libraries as static constant outside component
const GOOGLE_MAPS_LIBRARIES = ['geometry'];

// Custom Vehicle Icon Component
const VehicleIcon = ({ rotation = 0, speed = 0 }) => (
  <div className="relative" style={{ transform: `rotate(${rotation}deg)` }}>
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" strokeWidth="3"/>
      <path d="M20 8L26 20H14L20 8Z" fill="white"/>
      <circle cx="20" cy="20" r="5" fill="white"/>
    </svg>
    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {Math.round(speed)}
    </div>
  </div>
);

// Main Component
export function TransportGPS() {
  const location = useLocation();
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapsDisabled = import.meta.env.VITE_DISABLE_MAPS === 'true' || !googleMapsApiKey;
  
  // State management
  const [transports, setTransports] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState('roadmap');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [vehicleRotation, setVehicleRotation] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 });
  const [mapZoom, setMapZoom] = useState(7);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Removed showSeedingModal and isSeedingInProgress states
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [vehicleSpeed, setVehicleSpeed] = useState(65);

  // FIX 2: Use useMemo for directions state to prevent recreation
  const [directions, setDirections] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);

  // FIX 3: Use useRef for map reference and debouncing
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const lastCenterUpdateRef = useRef(Date.now());
  const lastZoomUpdateRef = useRef(Date.now());
  const updateTimeoutRef = useRef(null);
  const tripIdRef = useRef(null); // FIX: Lock GPS subscription by ID

  // FIX 4: Use useJsApiLoader with stable libraries array
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsDisabled ? 'DISABLED' : googleMapsApiKey,
    libraries: GOOGLE_MAPS_LIBRARIES, // Using static constant
  });

  // Normalize trip data to handle different structures
  const normalizeTripData = (trip) => {
    if (!trip) return null;

    return {
      ...trip,
      // Normalize customer info
      customer: trip.customer || {
        name: trip.orderDetails?.customerName || trip.orderDetails?.dealerName || 'Unknown Customer',
        address: trip.orderDetails?.deliveryAddress || trip.orderDetails?.dealerAddress || trip.endLocation || 'No address',
        phone: trip.orderDetails?.customerPhone || trip.orderDetails?.dealerPhone || ''
      },
      // Normalize vehicle info
      vehicle: trip.vehicle || trip.vehicleDetails || {
        type: 'Vehicle',
        capacity: trip.vehicleDetails?.capacity || 'Unknown',
        number: trip.vehicleDetails?.vehicleNumber || 'Unknown'
      },
      // Normalize driver info
      driver: trip.driver || trip.driverDetails || {
        name: trip.driverDetails?.name || 'Unknown Driver',
        phone: trip.driverDetails?.phone || '',
        rating: trip.driverDetails?.rating || 0
      },
      // Normalize route info
      route: trip.route || {
        start: trip.startLocation || 'Unknown',
        destination: trip.endLocation || trip.orderDetails?.deliveryAddress || 'Unknown',
        distance: trip.estimatedDistance || 'Unknown',
        duration: trip.estimatedDuration || 'Unknown',
        progress: trip.progress || 0,
        eta: trip.scheduledTime || 'Unknown',
        currentLocation: trip.currentLocation ? {
          lat: trip.currentLocation.lat,
          lng: trip.currentLocation.lng,
          address: trip.currentLocation.address || trip.startLocation || 'Unknown'
        } : null
      }
    };
  };

  const safeNumber = (value) => {
    if (value === null || value === undefined) return null;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isFinite(num) ? num : null;
  };

  // FIX 5: Memoize the calculateRoute function
  const calculateRoute = useCallback((originPoint, destPoint) => {
    if (!isLoaded || !window.google?.maps || !originPoint || !destPoint) return;
    
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }

    directionsServiceRef.current.route(
      {
        origin: originPoint,
        destination: destPoint,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        }
      }
    );
  }, [isLoaded]);

  // FIX 6: Initialize data - FIXED: Preserve Firebase trip keys
  useEffect(() => {
    setLoading(true);
    
    const tripsRef = ref(rtdb, 'trips');
    const unsubscribe = onValue(
      tripsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          // No trips available
          setTransports([]);
          setSelectedTransport(null);
          setLoading(false);
          return;
        }

        // FIX: Preserve Firebase keys as trip IDs
        const tripsArray = Object.entries(data).map(([key, trip]) =>
          normalizeTripData({ ...trip, id: key })
        );
        
        setTransports(tripsArray);

        const stateTripId = location.state?.tripId;
        const selected = stateTripId 
          ? tripsArray.find(t => t.id === stateTripId || t.tripId === stateTripId)
          : tripsArray[0] || null;
        
        setSelectedTransport(selected ? normalizeTripData(selected) : null);
        setLoading(false);
      },
      (error) => {
        setTransports([]);
        setSelectedTransport(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [location.state?.tripId]);

  // FIX 7: Subscribe to GPS updates - FIXED: Lock by ID + proper data handling
  useEffect(() => {
    if (!selectedTransport?.id) return;
    if (tripIdRef.current === selectedTransport.id) return;

    tripIdRef.current = selectedTransport.id;
    
    const gpsRef = ref(rtdb, `liveLocations/${selectedTransport.id}`);
    const unsubscribe = onValue(gpsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data) {
        setConnectionStatus('disconnected');
        return;
      }

      const lat = Number(data.lat);
      const lng = Number(data.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setConnectionStatus('disconnected');
        return;
      }

      const newOrigin = { lat, lng };
      setOrigin(newOrigin);
      
      setConnectionStatus('connected');
      setLastLiveUpdate(Date.now());
      
      // Update transport data with correct structure
      setSelectedTransport(prev => ({
        ...prev,
        route: {
          ...prev.route,
          currentLocation: {
            lat,
            lng,
            address: data.address || ''
          }
        }
      }));
    }, (error) => {
      setConnectionStatus('disconnected');
    });

    return () => {
      tripIdRef.current = null;
      unsubscribe();
    };
  }, [selectedTransport?.id]);

  // FIX 9: Calculate destination and route - optimized
  useEffect(() => {
    if (!isLoaded || !selectedTransport || !origin) return;

    // Handle different trip data structures
    const destAddress = selectedTransport.route?.destination || 
                       selectedTransport.customer?.address ||
                       selectedTransport.endLocation ||
                       selectedTransport.orderDetails?.deliveryAddress ||
                       selectedTransport.orderDetails?.dealerAddress;
    
    if (!destAddress) {
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destAddress }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        const dest = { lat: loc.lat(), lng: loc.lng() };
        setDestination(dest);
        
        // Calculate route
        calculateRoute(origin, dest);
      }
    });
  }, [isLoaded, selectedTransport, origin, calculateRoute]);

  // FIX 10: Handle center changes with debouncing
  const handleCenterChanged = useCallback(() => {
    if (!mapRef.current) return;
    
    const now = Date.now();
    // Debounce center updates - only update every 500ms
    if (now - lastCenterUpdateRef.current < 500) return;
    
    try {
      const center = mapRef.current.getCenter();
      if (center) {
        setMapCenter({ lat: center.lat(), lng: center.lng() });
        lastCenterUpdateRef.current = now;
      }
    } catch (error) {
      console.warn('Error getting map center:', error);
    }
  }, []);

  // FIX 11: Handle zoom changes with debouncing
  const handleZoomChanged = useCallback(() => {
    if (!mapRef.current) return;
    
    const now = Date.now();
    // Debounce zoom updates - only update every 300ms
    if (now - lastZoomUpdateRef.current < 300) return;
    
    try {
      const zoom = mapRef.current.getZoom();
      setMapZoom(zoom);
      lastZoomUpdateRef.current = now;
    } catch (error) {
      console.warn('Error getting map zoom:', error);
    }
  }, []);

  // FIX 12: Handle map load
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    
    // Center on origin if available
    if (origin) {
      map.panTo(origin);
      map.setZoom(14);
    }
  }, [origin]);

  // FIX 13: Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Clear timeout if exists
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // FIX 14: Handle transport selection
  const handleSelectTransport = (transport) => {
    const normalizedTransport = normalizeTripData(transport);
    setSelectedTransport(normalizedTransport);
    if (normalizedTransport.route?.currentLocation?.lat && normalizedTransport.route?.currentLocation?.lng) {
      const newCenter = {
        lat: Number(normalizedTransport.route.currentLocation.lat) || 7.8731,
        lng: Number(normalizedTransport.route.currentLocation.lng) || 80.7718,
      };
      
      // Only update map if it's loaded
      if (mapRef.current) {
        mapRef.current.panTo(newCenter);
        mapRef.current.setZoom(12);
      }
      setMapCenter(newCenter);
      setMapZoom(12);
    }
  };

  // FIX 15: Filter transports - memoized
  const filteredTransports = useMemo(() => {
    return transports.filter((transport) => {
      const matchesSearch = transport.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transport.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transport.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           transport.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [transports, searchTerm, filterStatus]);

  // Calculate progress
  const progressValue = selectedTransport?.route?.progress || 
                       (selectedTransport?.route?.remainingDistance && selectedTransport?.route?.distance
                         ? Math.round(((selectedTransport.route.distance - selectedTransport.route.remainingDistance) / 
                                      selectedTransport.route.distance) * 100)
                         : 0);

  // Connection status indicator
  const ConnectionIndicator = () => (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`}></div>
      <span className="text-xs font-medium">
        {connectionStatus === 'connected' ? 'Live' : 'Offline'}
      </span>
    </div>
  );

  // Map Controls
  const MapControls = () => (
    <div className="absolute top-4 right-4 z-10">
      <div className="flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200">
        <button
          onClick={() => setMapView(mapView === 'roadmap' ? 'satellite' : 'roadmap')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Toggle map view"
        >
          {mapView === 'roadmap' ? 
            <Satellite className="h-5 w-5 text-gray-700" /> : 
            <Map className="h-5 w-5 text-gray-700" />
          }
        </button>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh location"
        >
          <RefreshCw className={`h-5 w-5 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => {
            if (origin && mapRef.current) {
              mapRef.current.panTo(origin);
              mapRef.current.setZoom(15);
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Center on vehicle"
        >
          <Target className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={() => {
            setIsFullscreen(!isFullscreen);
            if (!isFullscreen && mapContainerRef.current) {
              mapContainerRef.current.requestFullscreen();
            } else if (document.fullscreenElement) {
              document.exitFullscreen();
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Toggle fullscreen"
        >
          {isFullscreen ? 
            <Minimize2 className="h-5 w-5 text-gray-700" /> : 
            <Maximize2 className="h-5 w-5 text-gray-700" />
          }
        </button>
      </div>
    </div>
  );

  // Zoom Controls
  const ZoomControls = () => (
    <div className="absolute right-4 bottom-4 z-10">
      <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200">
        <button
          onClick={() => mapRef.current && mapRef.current.setZoom(mapRef.current.getZoom() + 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </button>
        <div className="border-t border-gray-200 my-1"></div>
        <button
          onClick={() => mapRef.current && mapRef.current.setZoom(mapRef.current.getZoom() - 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading GPS Tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live GPS Tracking</h1>
              <p className="text-gray-600">Real-time monitoring of transport vehicles</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Removed Load Sample Data button */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Map */}
          <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'lg:w-2/3'}`}>
            <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 ${
              isFullscreen ? 'h-screen' : 'h-[500px]'
            } relative`} ref={mapContainerRef}>
              {/* Map Container */}
              <div className="absolute inset-0">
                {loadError || mapsDisabled ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="text-3xl mb-3">🗺️</div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Unavailable</h3>
                      <p className="text-gray-600 text-sm">Configure Google Maps API to enable tracking</p>
                    </div>
                  </div>
                ) : isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={mapZoom}
                    options={{
                      mapTypeId: mapView,
                      disableDefaultUI: true,
                      zoomControl: false,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                      styles: [
                        {
                          featureType: "poi",
                          elementType: "labels",
                          stylers: [{ visibility: "off" }]
                        },
                        {
                          featureType: "transit",
                          elementType: "labels",
                          stylers: [{ visibility: "off" }]
                        }
                      ]
                    }}
                    onLoad={handleMapLoad}
                    // FIX 16: Removed onCenterChanged and onZoomChanged to prevent infinite loops
                  >
                    {/* Vehicle Marker */}
                    {origin && (
                      <Marker
                        position={origin}
                        icon={{
                          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="3"/>
                              <path d="M20 8L26 20H14L20 8Z" fill="white"/>
                              <circle cx="20" cy="20" r="5" fill="white"/>
                            </svg>
                          `)}`,
                          scaledSize: new window.google.maps.Size(40, 40),
                          anchor: new window.google.maps.Point(20, 20),
                        }}
                      />
                    )}
                    
                    {/* Destination Marker */}
                    {destination && (
                      <Marker
                        position={destination}
                        icon={{
                          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="16" cy="16" r="14" fill="#10B981" stroke="white" stroke-width="3"/>
                              <circle cx="16" cy="16" r="6" fill="white"/>
                            </svg>
                          `)}`,
                          scaledSize: new window.google.maps.Size(32, 32),
                          anchor: new window.google.maps.Point(16, 16),
                        }}
                      />
                    )}
                    
                    {/* Directions Renderer */}
                    {directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          suppressMarkers: true,
                          polylineOptions: {
                            strokeColor: '#3B82F6',
                            strokeOpacity: 0.5,
                            strokeWeight: 3,
                          }
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 animate-pulse"></div>
                )}
              </div>

              {/* Map Controls */}
              <MapControls />
              
              {/* Zoom Controls */}
              <ZoomControls />

              {/* Minimal Location Info Overlay */}
              {origin && (
                <div className="absolute bottom-4 left-4 z-10 max-w-xs">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <PinIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Current Location</span>
                      </div>
                      <ConnectionIndicator />
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {selectedTransport?.route?.currentLocation?.address || 'Updating...'}
                    </div>
                  </div>
                </div>
              )}

              {/* Fullscreen Exit Button */}
              {isFullscreen && (
                <div className="absolute top-20 right-4 z-10">
                  <button
                    onClick={() => {
                      setIsFullscreen(false);
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      }
                    }}
                    className="px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-lg shadow border border-gray-200 font-medium"
                  >
                    Exit Fullscreen
                  </button>
                </div>
              )}
            </div>

            {/* Transport List */}
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Active Transports</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="assigned">Assigned</option>
                      <option value="in-transit">In Transit</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Driver</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">ETA</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredTransports.slice(0, 5).map((transport) => (
                      <tr 
                        key={transport.id}
                        className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                          selectedTransport?.id === transport.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleSelectTransport(transport)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 text-sm">{transport.id}</div>
                          <div className="text-xs text-gray-500">{transport.type || 'Transport'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transport.status === 'in-transit' || transport.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : transport.status === 'assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : transport.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {transport.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{transport.driver?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {transport.route?.eta?.split(' ')[1] || '--:--'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${transport.route?.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{transport.route?.progress || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel - All Details */}
          <div className="lg:w-1/3 space-y-4">
            {/* Transport Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTransport?.id}</h3>
                  <p className="text-gray-600 text-sm">{selectedTransport?.type || 'Transport'}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{vehicleSpeed} km/h</div>
                  <div className="text-xs text-gray-500">Current Speed</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs font-medium text-blue-800 mb-1">Customer</div>
                  <div className="font-semibold text-gray-900">{selectedTransport?.customer?.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-600 mt-1">{selectedTransport?.customer?.address || 'No address'}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Vehicle</div>
                    <div className="font-semibold text-gray-900">{selectedTransport?.vehicle?.type || 'Truck'}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Capacity</div>
                    <div className="font-semibold text-gray-900">{selectedTransport?.vehicle?.capacity || '--'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Route className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Total Distance</div>
                      <div className="font-bold text-gray-900">
                        {selectedTransport?.route?.distance ? `${selectedTransport.route.distance} km` : '--'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Compass className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">Remaining</div>
                      <div className="font-bold text-gray-900">
                        {selectedTransport?.route?.remainingDistance ? `${selectedTransport.route.remainingDistance} km` : '--'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-sm text-gray-600">Estimated Arrival</div>
                      <div className="font-bold text-gray-900">
                        {selectedTransport?.route?.eta ? selectedTransport.route.eta.split(' ')[1] : '--'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="font-bold text-blue-600">{selectedTransport?.route?.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${selectedTransport?.route?.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Location Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Location Details</h3>
                <ConnectionIndicator />
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Address</div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedTransport?.route?.currentLocation?.address || 'No location data'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Latitude</div>
                    <div className="text-sm font-medium text-gray-900">
                      {origin?.lat?.toFixed(6) || '--'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">Longitude</div>
                    <div className="text-sm font-medium text-gray-900">
                      {origin?.lng?.toFixed(6) || '--'}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-600">Last Update</div>
                      <div className="text-sm font-medium text-gray-900">
                        {lastLiveUpdate ? new Date(lastLiveUpdate).toLocaleTimeString() : '--:--'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Speed</div>
                      <div className="text-sm font-bold text-blue-600">{vehicleSpeed} km/h</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h3>
              
              <div className="flex items-start gap-3">
                <img 
                  src={selectedTransport?.driver?.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver'}
                  alt="Driver"
                  className="w-12 h-12 rounded-lg border-2 border-white shadow"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{selectedTransport?.driver?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{selectedTransport?.driver?.phone || 'No phone'}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{selectedTransport?.driver?.rating || '4.8'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="p-2 bg-blue-100 rounded-lg mb-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-900">Call Driver</span>
                </button>
                
                <button className="flex flex-col items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="p-2 bg-green-100 rounded-lg mb-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-900">Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Removed Seeding Modal */}
    </div>
  );
}

export default TransportGPS;