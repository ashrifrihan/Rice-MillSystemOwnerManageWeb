// src/components/LiveDeliveryTracker.jsx
import React from 'react';
import { TruckIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';

export function LiveDeliveryTracker({ deliveries, setSelectedDelivery }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Loading':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'In Transit':
        return <TruckIcon className="h-4 w-4 text-blue-500" />;
      case 'Delivered':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'Delayed':
        return <ClockIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 h-full">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Live Delivery Tracker</h2>
      <div className="space-y-3">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            onClick={() => setSelectedDelivery(delivery)}
            className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div className="flex-shrink-0 mr-3">{getStatusIcon(delivery.status)}</div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-900">
                  #{delivery.orderId} - {delivery.customer}
                </p>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${delivery.status === 'Delivered'
                    ? 'bg-green-100 text-green-800'
                    : delivery.status === 'In Transit'
                    ? 'bg-blue-100 text-blue-800'
                    : delivery.status === 'Loading'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'}`}
                >
                  {delivery.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Driver: {delivery.driver} | ETA: {delivery.eta}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveDeliveryTracker;