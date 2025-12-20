import React from 'react';
import { Link } from 'react-router-dom';
import { mockInventoryData } from '../../data/mockData';
export function InventorySummary() {
  return <div className="bg-white rounded-lg shadow p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Inventory Summary</h2>
        <Link to="/inventory" className="text-sm text-indigo-600 hover:text-indigo-900">
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {mockInventoryData.summary.map(item => <div key={item.product} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {item.product}
              </p>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {item.quantity} kg
              </p>
              <p className={`text-xs ${item.status === 'Low' ? 'text-red-600' : 'text-green-600'}`}>
                {item.status}
              </p>
            </div>
          </div>)}
      </div>
    </div>;
}