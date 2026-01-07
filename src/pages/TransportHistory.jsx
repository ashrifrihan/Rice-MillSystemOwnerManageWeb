// src/pages/TransportHistory.jsx - FIREBASE VERSION
import React, { useState, useEffect } from 'react';
import { rtdb as db } from '../firebase/config';
import { ref, onValue } from 'firebase/database';
import toast from 'react-hot-toast';
import { 
  Truck, 
  Search, 
  Filter,
  Download,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Camera,
  Eye,
  FileText,
  ChevronDown,
  X,
  User,
  Package,
  Home,
  Building,
  Mail,
  Phone,
  Image as ImageIcon,
  FileCheck,
  FileX,
  Clock as ClockIcon,
  Shield,
  Printer,
  Share2
} from 'lucide-react';

// Mock data kept as fallback
const mockTransportHistory = {
  trips: [
    {
      id: 'TRP-2024-001',
      vehicleNumber: 'WP CAB 1234',
      driver: {
        name: 'Rajesh Kumar',
        phone: '+94 77 123 4567',
        license: 'DL-845672'
      },
      type: 'Rice Delivery',
      customer: {
        name: 'Perera Foods Ltd',
        address: '123 Kandy Road, Kandy',
        contactPerson: 'Mr. Perera',
        phone: '+94 81 234 5678',
        email: 'orders@pererafoods.lk'
      },
      startLocation: 'Lanka Rice Mill, Kurunegala',
      endLocation: 'Perera Foods Ltd, Kandy',
      startTime: '2024-01-15 08:00',
      endTime: '2024-01-15 18:15',
      deliveredAt: '2024-01-15 18:10',
      status: 'Delivered',
      proofStatus: 'uploaded',
      distance: '95 km',
      duration: '10h 15m',
      products: [
        { name: 'Premium Basmati Rice', bags: 50, kgPerBag: 25, totalKG: 1250 },
        { name: 'Samba Rice', bags: 30, kgPerBag: 25, totalKG: 750 }
      ],
      revenue: 'Rs. 85,000',
      expenses: 'Rs. 38,500',
      profit: 'Rs. 46,500',
      deliveryProof: {
        images: [
          { id: 'IMG001', url: 'https://images.unsplash.com/photo-1583223667854-e7b2c6457568?w=400', caption: 'Goods at delivery location', time: '18:05' },
          { id: 'IMG002', url: 'https://images.unsplash.com/photo-1583223667854-e7b2c6457568?w-400', caption: 'Customer signature', time: '18:08' },
          { id: 'IMG003', url: 'https://images.unsplash.com/photo-1583223667854-e7b2c6457568?w=400', caption: 'Storefront', time: '18:10' }
        ],
        uploadedAt: '2024-01-15 18:12',
        gpsLocation: '7.2906° N, 80.6337° E',
        notes: 'All products received in good condition'
      }
    },
    {
      id: 'TRP-2024-002',
      vehicleNumber: 'WP KA 5678',
      driver: {
        name: 'Suresh Perera',
        phone: '+94 71 234 5678',
        license: 'DL-739485'
      },
      type: 'Paddy Pickup',
      customer: {
        name: 'Farmers Cooperative',
        address: 'Farm Road, Gampaha',
        contactPerson: 'Mrs. Silva',
        phone: '+94 33 456 7890'
      },
      startLocation: 'Lanka Rice Mill, Kurunegala',
      endLocation: 'Farmers Market, Gampaha',
      startTime: '2024-01-15 09:30',
      endTime: '2024-01-15 16:45',
      deliveredAt: '2024-01-15 16:40',
      status: 'Delivered',
      proofStatus: 'pending',
      distance: '75 km',
      duration: '7h 15m',
      products: [
        { name: 'Raw Paddy', bags: 80, kgPerBag: 25, totalKG: 2000 }
      ],
      revenue: 'Rs. 62,000',
      expenses: 'Rs. 28,200',
      profit: 'Rs. 33,800',
      deliveryProof: null
    },
    {
      id: 'TRP-2024-003',
      vehicleNumber: 'NP AB 9012',
      driver: {
        name: 'Kamal Silva',
        phone: '+94 77 345 6789',
        license: 'DL-921645'
      },
      type: 'Rice Delivery',
      customer: {
        name: 'Fernando Grocery Chain',
        address: 'Main Street, Galle',
        contactPerson: 'Mr. Fernando',
        phone: '+94 91 567 8901'
      },
      startLocation: 'Lanka Rice Mill, Kurunegala',
      endLocation: 'Fernando Grocery, Galle',
      startTime: '2024-01-14 07:00',
      endTime: '2024-01-14 21:30',
      deliveredAt: '2024-01-14 21:25',
      status: 'Delivered',
      proofStatus: 'uploaded',
      distance: '120 km',
      duration: '14h 30m',
      products: [
        { name: 'Mixed Rice Varieties', bags: 65, kgPerBag: 25, totalKG: 1625 },
        { name: 'Red Rice', bags: 20, kgPerBag: 25, totalKG: 500 }
      ],
      revenue: 'Rs. 98,500',
      expenses: 'Rs. 44,800',
      profit: 'Rs. 53,700',
      deliveryProof: {
        images: [
          { id: 'IMG004', url: 'https://images.unsplash.com/photo-1583223667854-e7b2c6457568?w=400', caption: 'Delivery completed', time: '21:20' }
        ],
        uploadedAt: '2024-01-14 21:28',
        gpsLocation: '6.0535° N, 80.2210° E',
        notes: 'Customer satisfied with quality'
      }
    },
    {
      id: 'TRP-2024-004',
      vehicleNumber: 'CP XY 3456',
      driver: {
        name: 'Anil Fernando',
        phone: '+94 76 456 7890',
        license: 'DL-834756'
      },
      type: 'Rice Delivery',
      customer: {
        name: 'Silva Restaurants',
        address: 'Hotel Road, Matara',
        contactPerson: 'Mr. Silva',
        phone: '+94 41 678 9012'
      },
      startLocation: 'Lanka Rice Mill, Kurunegala',
      endLocation: 'Silva Restaurants, Matara',
      startTime: '2024-01-13 10:00',
      endTime: '2024-01-13 19:45',
      deliveredAt: '2024-01-13 19:40',
      status: 'Delivered',
      proofStatus: 'rejected',
      distance: '150 km',
      duration: '9h 45m',
      products: [
        { name: 'Brown Rice', bags: 40, kgPerBag: 25, totalKG: 1000 },
        { name: 'Jasmine Rice', bags: 20, kgPerBag: 25, totalKG: 500 }
      ],
      revenue: 'Rs. 49,800',
      expenses: 'Rs. 23,100',
      profit: 'Rs. 26,700',
      deliveryProof: {
        images: [
          { id: 'IMG005', url: 'https://images.unsplash.com/photo-1583223667854-e7b2c6457568?w=400', caption: 'Partial delivery', time: '19:35' }
        ],
        uploadedAt: '2024-01-13 19:42',
        gpsLocation: '5.9480° N, 80.5353° E',
        notes: 'Incomplete delivery, missing 5 bags',
        rejectedReason: 'Incomplete delivery documentation'
      }
    },
    {
      id: 'TRP-2024-005',
      vehicleNumber: 'WP CAB 1234',
      driver: {
        name: 'Rajesh Kumar',
        phone: '+94 77 123 4567',
        license: 'DL-845672'
      },
      type: 'Paddy Pickup',
      customer: {
        name: 'Local Farmers Group',
        address: 'Rural Road, Kurunegala',
        contactPerson: 'Mr. Bandara',
        phone: '+94 37 789 0123'
      },
      startLocation: 'Lanka Rice Mill, Kurunegala',
      endLocation: 'Rural Collection Center, Kurunegala',
      startTime: '2024-01-12 06:30',
      endTime: '2024-01-12 17:20',
      deliveredAt: '2024-01-12 17:15',
      status: 'Delivered',
      proofStatus: 'uploaded',
      distance: '45 km',
      duration: '10h 50m',
      products: [
        { name: 'Raw Paddy', bags: 75, kgPerBag: 25, totalKG: 1875 }
      ],
      revenue: 'Rs. 61,200',
      expenses: 'Rs. 30,800',
      profit: 'Rs. 30,400',
      deliveryProof: {
        images: [
          { id: 'IMG006', url: 'https://images.unsplash.com/photo-1583223667854-e7b2c6457568?w=400', caption: 'Paddy loading', time: '17:10' },
          { id: 'IMG007', url: 'https://images.unsplash.com/photo-1583223667854-e7b2c6457568?w=400', caption: 'Quality check', time: '17:12' }
        ],
        uploadedAt: '2024-01-12 17:18',
        gpsLocation: '7.4818° N, 80.3609° E',
        notes: 'Paddy quality Grade A'
      }
    }
  ],
  summary: {
    totalTrips: 28,
    completedTrips: 25,
    delayedTrips: 3,
    totalDistance: '18,500 km',
    totalRevenue: 'Rs. 24,25,000',
    totalProfit: 'Rs. 10,78,500',
    proofUploaded: 18,
    proofPending: 7,
    proofRejected: 3
  }
};

// KPI Card Component (Keeping the exact design you requested)
const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend, unit = "" }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} shadow-lg transform group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
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

// Delivery Proof Badge Component
const ProofBadge = ({ status }) => {
  const config = {
    uploaded: {
      text: 'Proof Uploaded',
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: FileCheck
    },
    pending: {
      text: 'Proof Pending',
      color: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      icon: ClockIcon
    },
    rejected: {
      text: 'Proof Rejected',
      color: 'bg-red-100 text-red-700 border border-red-200',
      icon: FileX
    }
  };
  
  const { text, color, icon: Icon } = config[status] || config.pending;
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {text}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    Delivered: {
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      icon: CheckCircle
    },
    'In Transit': {
      color: 'bg-blue-100 text-blue-700 border border-blue-200',
      icon: Truck
    },
    Scheduled: {
      color: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      icon: Clock
    },
    Cancelled: {
      color: 'bg-red-100 text-red-700 border border-red-200',
      icon: X
    }
  };
  
  const { color, icon: Icon } = config[status] || config.Scheduled;
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {status}
    </span>
  );
};

// Type Badge Component
const TypeBadge = ({ type }) => {
  const isDelivery = type.includes('Delivery');
  const color = isDelivery ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
  const Icon = isDelivery ? Package : Truck;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3 mr-1.5" />
      {type}
    </span>
  );
};

// Delivery Proof Modal Component
const DeliveryProofModal = ({ trip, onClose }) => {
  if (!trip) return null;
  
  const hasProof = trip.proofStatus === 'uploaded' || trip.proofStatus === 'rejected';
  
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
                <h3 className="text-lg font-semibold text-gray-900">Delivery Proof - {trip.id}</h3>
                <p className="text-sm text-gray-600">Submitted by {trip.driver.name}</p>
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
            {/* Trip Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Delivered At</span>
                      <span className="font-medium">{trip.deliveredAt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customer</span>
                      <span className="font-medium">{trip.customer.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="font-medium text-right">{trip.endLocation}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Driver Information</h4>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{trip.driver.name}</div>
                      <div className="text-sm text-gray-600">{trip.driver.phone}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Proof Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <ProofBadge status={trip.proofStatus} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uploaded At</span>
                      <span className="font-medium">{trip.deliveryProof?.uploadedAt || 'Not uploaded'}</span>
                    </div>
                    {trip.proofStatus === 'rejected' && trip.deliveryProof?.rejectedReason && (
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-gray-600">Rejection Reason</span>
                        <span className="font-medium text-red-600 text-right">{trip.deliveryProof.rejectedReason}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {trip.deliveryProof?.gpsLocation && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">GPS Location</h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{trip.deliveryProof.gpsLocation}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Proof Images */}
            {hasProof && trip.deliveryProof?.images && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Delivery Proof Images</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trip.deliveryProof.images.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden group">
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{image.caption}</div>
                          <div className="text-xs text-gray-500">{image.time}</div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="flex-1 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">
                            View Full
                          </button>
                          <button className="flex-1 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Notes */}
            {trip.deliveryProof?.notes && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Driver Notes</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{trip.deliveryProof.notes}</p>
                </div>
              </div>
            )}
            
            {/* No Proof Message */}
            {!hasProof && (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-400 text-lg font-medium mb-2">No Proof Uploaded</div>
                <div className="text-sm text-gray-500">Driver has not uploaded delivery proof images yet</div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
              >
                Close
              </button>
              {hasProof && (
                <>
                  <button className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print Proof
                  </button>
                  <button className="px-4 py-2 text-white bg-emerald-600 rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trip Details Modal Component
const TripDetailsModal = ({ trip, onClose }) => {
  if (!trip) return null;
  
  const totalKG = trip.products.reduce((sum, product) => sum + product.totalKG, 0);
  const totalBags = trip.products.reduce((sum, product) => sum + product.bags, 0);
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-3xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Trip Details - {trip.id}</h3>
                <p className="text-sm text-gray-600">Completed on {trip.deliveredAt}</p>
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
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Route Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-green-600 mt-1" />
                      <div>
                        <div className="font-medium">Start</div>
                        <div className="text-sm text-gray-600">{trip.startLocation}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 text-red-600 mt-1" />
                      <div>
                        <div className="font-medium">Destination</div>
                        <div className="text-sm text-gray-600">{trip.endLocation}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{trip.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{trip.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Name</span>
                      <span className="font-medium">{trip.customer.name}</span>
                    </div>
                    {trip.customer.contactPerson && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Contact Person</span>
                        <span className="font-medium">{trip.customer.contactPerson}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="font-medium">{trip.customer.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Driver & Vehicle</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{trip.driver.name}</div>
                        <div className="text-sm text-gray-600">{trip.driver.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Truck className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{trip.vehicleNumber}</div>
                        <div className="text-sm text-gray-600">{trip.type}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Trip Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <StatusBadge status={trip.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Proof Status</span>
                      <ProofBadge status={trip.proofStatus} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Start Time</span>
                      <span className="font-medium">{trip.startTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">End Time</span>
                      <span className="font-medium">{trip.endTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Products Delivered</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 bg-gray-100 px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  <div>Product</div>
                  <div className="text-center">Bags</div>
                  <div className="text-center">KG per Bag</div>
                  <div className="text-right">Total KG</div>
                </div>
                {trip.products.map((product, index) => (
                  <div key={index} className={`px-4 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
                    <div className="grid grid-cols-4 items-center">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-center">{product.bags}</div>
                      <div className="text-center">{product.kgPerBag} kg</div>
                      <div className="text-right font-medium">{product.totalKG.toLocaleString()} kg</div>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-100">
                  <div className="grid grid-cols-4 items-center">
                    <div className="font-medium">Total</div>
                    <div className="text-center font-medium">{totalBags}</div>
                    <div></div>
                    <div className="text-right font-bold text-emerald-700">{totalKG.toLocaleString()} kg</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Financial Summary */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Financial Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">Revenue</div>
                  <div className="text-2xl font-bold text-blue-700">{trip.revenue}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 mb-1">Expenses</div>
                  <div className="text-2xl font-bold text-red-700">{trip.expenses}</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <div className="text-sm text-emerald-600 mb-1">Profit</div>
                  <div className="text-2xl font-bold text-emerald-700">{trip.profit}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
              >
                Close
              </button>
              <button className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700">
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function TransportHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterProof, setFilterProof] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedProofTrip, setSelectedProofTrip] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate KPI values from trips data
  const calculateKPIs = () => {
    const totalTrips = trips.length;
    const proofUploaded = trips.filter(t => t.proofStatus === 'uploaded').length;
    const proofPending = trips.filter(t => t.proofStatus === 'pending').length;
    const proofRejected = trips.filter(t => t.proofStatus === 'rejected').length;

    // Parse revenue and expenses
    const totalRevenue = trips.reduce((sum, trip) => {
      const rev = parseInt(trip.revenue?.replace(/[^\d]/g, '') || 0);
      return sum + rev;
    }, 0);

    const totalExpenses = trips.reduce((sum, trip) => {
      const exp = parseInt(trip.expenses?.replace(/[^\d]/g, '') || 0);
      return sum + exp;
    }, 0);

    const totalProfit = totalRevenue - totalExpenses;

    return {
      totalTrips,
      proofUploaded,
      proofPending,
      proofRejected,
      totalRevenue: `Rs. ${totalRevenue.toLocaleString()}`,
      totalExpenses: `Rs. ${totalExpenses.toLocaleString()}`,
      totalProfit: `Rs. ${totalProfit.toLocaleString()}`
    };
  };

  const kpis = calculateKPIs();

  // Normalize trip data to handle different structures
  const normalizeTripData = (trip) => {
    if (!trip) return null;

    return {
      ...trip,
      // Normalize customer info
      customer: trip.customer || {
        name: trip.orderDetails?.customerName || trip.orderDetails?.dealerName || 'Unknown Customer',
        address: trip.orderDetails?.deliveryAddress || trip.orderDetails?.dealerAddress || trip.endLocation || 'No address',
        phone: trip.orderDetails?.customerPhone || trip.orderDetails?.dealerPhone || '',
        contactPerson: trip.orderDetails?.contactPerson || ''
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
        license: trip.driverDetails?.license || '',
        rating: trip.driverDetails?.rating || 0,
        photo: trip.driverDetails?.photo || ''
      },
      // Normalize products
      products: trip.products || [],
      // Normalize financial data
      revenue: trip.revenue || 'Rs. 0',
      expenses: trip.expenses || 'Rs. 0',
      profit: trip.profit || 'Rs. 0',
      // Normalize delivery proof
      deliveryProof: trip.deliveryProof || null,
      proofStatus: trip.proofStatus || 'pending',
      // Normalize trip details with defaults
      type: trip.type || 'Transport',
      status: trip.status || 'Scheduled',
      vehicleNumber: trip.vehicleNumber || 'Unknown',
      startLocation: trip.startLocation || 'Unknown',
      endLocation: trip.endLocation || 'Unknown',
      startTime: trip.startTime || 'N/A',
      endTime: trip.endTime || 'N/A',
      deliveredAt: trip.deliveredAt || new Date().toISOString().split('T')[0] + ' N/A',
      distance: trip.distance || 'Unknown',
      duration: trip.duration || 'Unknown'
    };
  };

  // Firebase Listener - Load transport history from transportHistory collection & trips collection
  useEffect(() => {
    setLoading(true);
    
    // Listen to completed trips from both transportHistory and completed trips
    const historyRef = ref(db, 'transportHistory');
    const tripsRef = ref(db, 'trips');
    
    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const completedTrips = Object.keys(data)
          .map(key => normalizeTripData({ ...data[key], id: key }))
          .filter(trip => trip.status === 'Delivered');
        setTrips(completedTrips);
        setLoading(false);
      } else {
        // Check regular trips as fallback
        const tripsUnsubscribe = onValue(tripsRef, (tripsSnapshot) => {
          if (tripsSnapshot.exists()) {
            const tripsData = tripsSnapshot.val();
            const completedTrips = Object.keys(tripsData)
              .map(key => normalizeTripData({ ...tripsData[key], id: key }))
              .filter(trip => trip.status === 'Delivered');
            setTrips(completedTrips.length > 0 ? completedTrips : mockTransportHistory.trips);
          } else {
            setTrips(mockTransportHistory.trips);
          }
          setLoading(false);
        }, (error) => {
          console.error('Firebase trips error:', error);
          setTrips(mockTransportHistory.trips);
          setLoading(false);
        });
        
        return () => tripsUnsubscribe();
      }
    }, (error) => {
      console.error('Firebase history error:', error);
      toast.error('Failed to load transport history');
      setTrips(mockTransportHistory.trips);
      setLoading(false);
    });

    return () => unsubscribeHistory();
  }, []);

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    const matchesType = filterType === 'all' || trip.type === filterType;
    const matchesProof = filterProof === 'all' || trip.proofStatus === filterProof;
    
    return matchesSearch && matchesStatus && matchesType && matchesProof;
  });

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setShowDetails(true);
  };

  const handleViewProof = (trip) => {
    setSelectedProofTrip(trip);
    setShowProof(true);
  };

  const exportToCSV = () => {
    const headers = ['Trip ID', 'Vehicle', 'Driver', 'Type', 'Customer', 'Delivery Date', 'Status', 'Proof Status', 'Distance', 'Revenue', 'Profit'];
    const csvData = filteredTrips.map(trip => [
      trip.id,
      trip.vehicleNumber,
      trip.driver.name,
      trip.type,
      trip.customer.name,
      trip.deliveredAt,
      trip.status,
      trip.proofStatus,
      trip.distance,
      trip.revenue,
      trip.profit
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transport-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transport History</h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Completed deliveries & proof verification
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard 
              title="Total Trips" 
              value={kpis.totalTrips} 
              subtitle="All transport deliveries" 
              icon={Truck} 
              color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            />
            <KpiCard 
              title="Proof Uploaded" 
              value={kpis.proofUploaded} 
              subtitle="Verified deliveries" 
              icon={FileCheck} 
              color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            />
            <KpiCard 
              title="Total Revenue" 
              value={kpis.totalRevenue} 
              subtitle="Transport earnings" 
              icon={FileText} 
              color="bg-gradient-to-br from-purple-500 to-pink-600" 
            />
            <KpiCard 
              title="Net Profit" 
              value={kpis.totalProfit} 
              subtitle="After all expenses" 
              icon={CheckCircle} 
              color="bg-gradient-to-br from-amber-500 to-orange-600" 
            />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6 shadow-sm">
          <div className="p-5 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Trip ID, vehicle, driver, or customer..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <select
                  className="px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Rice Delivery">Rice Delivery</option>
                  <option value="Paddy Pickup">Paddy Pickup</option>
                </select>
                
                <select
                  className="px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filterProof}
                  onChange={(e) => setFilterProof(e.target.value)}
                >
                  <option value="all">All Proof Status</option>
                  <option value="uploaded">Proof Uploaded</option>
                  <option value="pending">Proof Pending</option>
                  <option value="rejected">Proof Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Proof Pending', value: mockTransportHistory.summary.proofPending, color: 'bg-yellow-50 text-yellow-600', icon: ClockIcon },
                { label: 'Proof Rejected', value: mockTransportHistory.summary.proofRejected, color: 'bg-red-50 text-red-600', icon: FileX },
                { label: 'Total Distance', value: mockTransportHistory.summary.totalDistance, color: 'bg-blue-50 text-blue-600', icon: MapPin },
                { label: 'Delayed Trips', value: mockTransportHistory.summary.delayedTrips, color: 'bg-orange-50 text-orange-600', icon: AlertTriangle }
              ].map((stat, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</div>
                    <div className={`p-2 rounded-lg ${stat.color.split(' ')[0]}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transport History Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vehicle & Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer & Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Proof Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{trip.id}</div>
                      <div className="text-sm text-gray-500">Delivered: {(trip.deliveredAt || 'N/A').split(' ')[0]}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Truck className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{trip.vehicleNumber}</div>
                          <div className="text-sm text-gray-600">{trip.driver?.name || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{trip.customer?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-600 truncate max-w-xs">{trip.endLocation || 'Unknown'}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {trip.distance || 'Unknown'} • 
                        <Clock className="h-3 w-3 ml-2" />
                        {trip.duration || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{(trip.deliveredAt || 'N/A').split(' ')[0]}</div>
                      <div className="text-sm text-gray-500">{(trip.deliveredAt || 'N/A').split(' ')[1] || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={trip.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={trip.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ProofBadge status={trip.proofStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(trip)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleViewProof(trip)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            trip.proofStatus === 'uploaded' 
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                              : trip.proofStatus === 'rejected'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {trip.proofStatus === 'uploaded' ? (
                            <>
                              <Eye className="h-3 w-3 inline mr-1" />
                              Proof
                            </>
                          ) : trip.proofStatus === 'rejected' ? (
                            <>
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              View
                            </>
                          ) : (
                            <>
                              <ClockIcon className="h-3 w-3 inline mr-1" />
                              Pending
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredTrips.length === 0 && (
            <div className="text-center py-16">
              <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-400 text-lg font-medium mb-2">No trips found</div>
              <div className="text-sm text-gray-500">Try adjusting your search or filter criteria</div>
            </div>
          )}

          {/* Summary Footer */}
          {filteredTrips.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredTrips.length}</span> trips
                </p>
                <div className="mt-2 sm:mt-0 flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span>Proof Uploaded: {mockTransportHistory.summary.proofUploaded}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Pending: {mockTransportHistory.summary.proofPending}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Rejected: {mockTransportHistory.summary.proofRejected}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetails && (
        <TripDetailsModal 
          trip={selectedTrip} 
          onClose={() => {
            setShowDetails(false);
            setSelectedTrip(null);
          }} 
        />
      )}
      
      {showProof && (
        <DeliveryProofModal 
          trip={selectedProofTrip} 
          onClose={() => {
            setShowProof(false);
            setSelectedProofTrip(null);
          }} 
        />
      )}
    </div>
  );
}

export default TransportHistory;