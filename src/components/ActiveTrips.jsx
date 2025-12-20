// src/components/ActiveTrips.jsx
import React from 'react';
import { NavigationIcon, ClockIcon } from 'lucide-react';

export function ActiveTrips({ trips }) {
  const getTripStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-purple-100 text-purple-800';
      case 'Delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trips.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{trip.id}</div>
                  <div className="text-xs text-gray-500">{trip.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{trip.vehicleId}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{trip.startLocation} → {trip.endLocation}</div>
                  <div className="text-xs text-gray-500">{trip.distanceCovered} / {trip.totalDistance}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: trip.progress }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{trip.progress}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTripStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                      <NavigationIcon className="h-4 w-4" />
                      Track
                    </button>
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                      <ClockIcon className="h-4 w-4" />
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActiveTrips;