// File: C:\Users\RIHAN\Desktop\Rice-Mill-Owner-Web\src\components\dashboard\VehicleDriverPanel.jsx
import React from 'react';
import { Truck, MapPin, Phone, Clock } from 'lucide-react';

export function VehicleDriverPanel({ vehicles = [] }) {
  // Default mock data
  const defaultVehicles = [
    {
      id: 'V001',
      plate: 'MH-01-AB-1234',
      driver: 'Rajesh Kumar',
      status: 'active',
      location: 'Near Bandra',
      eta: '15 mins',
      load: '80 Bags',
      contact: '98765 43210',
    },
    {
      id: 'V002',
      plate: 'MH-01-CD-5678',
      driver: 'Suresh Patel',
      status: 'idle',
      location: 'At Mill',
      eta: '-',
      load: 'Empty',
      contact: '98765 43211',
    },
    {
      id: 'V003',
      plate: 'MH-01-EF-9012',
      driver: 'Amit Singh',
      status: 'active',
      location: 'Thane Highway',
      eta: '45 mins',
      load: '120 Bags',
      contact: '98765 43212',
    },
  ];

  const displayVehicles = vehicles.length > 0 ? vehicles : defaultVehicles;

  return (
    <div className="space-y-4">
      {displayVehicles.map((vehicle) => (
        <div key={vehicle.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                vehicle.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{vehicle.plate}</h4>
                <p className="text-sm text-gray-600">{vehicle.driver}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs rounded-full ${
              vehicle.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : vehicle.status === 'idle'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {vehicle.status === 'active' ? 'Active' : 'Idle'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{vehicle.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-700">ETA: {vehicle.eta}</span>
            </div>
            <div className="flex items-center">
              <Truck className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-700">Load: {vehicle.load}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{vehicle.contact}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}