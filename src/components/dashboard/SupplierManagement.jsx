// File: C:\Users\RIHAN\Desktop\Rice-Mill-Owner-Web\src\components\dashboard\SupplierManagement.jsx
import React from 'react';
import { Users, Phone, TrendingUp } from 'lucide-react';

export function SupplierManagement({ suppliers = [] }) {
  // Default mock data
  const defaultSuppliers = [
    {
      id: 'S001',
      name: 'Kumar Farms',
      contact: '98765 43210',
      supplied: '125,000 kg',
      balance: '₹85,000',
      rating: '4.8',
      lastDelivery: 'Today',
    },
    {
      id: 'S002',
      name: 'Patel Mills',
      contact: '98765 43211',
      supplied: '98,500 kg',
      balance: '₹45,000',
      rating: '4.5',
      lastDelivery: 'Yesterday',
    },
    {
      id: 'S003',
      name: 'Green Fields',
      contact: '98765 43212',
      supplied: '156,000 kg',
      balance: '₹120,000',
      rating: '4.9',
      lastDelivery: '2 days ago',
    },
  ];

  const displaySuppliers = suppliers.length > 0 ? suppliers : defaultSuppliers;

  return (
    <div className="space-y-4">
      {displaySuppliers.map((supplier) => (
        <div key={supplier.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-3 w-3 mr-1" />
                  {supplier.contact}
                </div>
              </div>
            </div>
            <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded">
              <TrendingUp className="h-3 w-3 mr-1" />
              {supplier.rating}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Supplied</p>
              <p className="font-medium">{supplier.supplied}</p>
            </div>
            <div>
              <p className="text-gray-500">Balance</p>
              <p className="font-medium">{supplier.balance}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Delivery</p>
              <p className="font-medium">{supplier.lastDelivery}</p>
            </div>
          </div>
          
          <div className="mt-3 flex space-x-2">
            <button className="flex-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
              Call
            </button>
            <button className="flex-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
              Order
            </button>
            <button className="flex-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
              Pay
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}