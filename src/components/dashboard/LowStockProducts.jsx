// File: C:\Users\RIHAN\Desktop\Rice-Mill-Owner-Web\src\components\dashboard\LowStockProducts.jsx
import React from 'react';
import { AlertTriangle, ShoppingCart } from 'lucide-react';

export function LowStockProducts({ products = [] }) {
  // Default mock data
  const defaultProducts = [
    {
      id: 'P001',
      name: 'Premium Basmati',
      current: '450 kg',
      threshold: '500 kg',
      daysLeft: '3',
      supplier: 'Kumar Farms',
      urgency: 'high',
    },
    {
      id: 'P002',
      name: '25kg Bags',
      current: '800 bags',
      threshold: '1000 bags',
      daysLeft: '5',
      supplier: 'Packaging Co.',
      urgency: 'medium',
    },
    {
      id: 'P003',
      name: 'Brown Rice',
      current: '620 kg',
      threshold: '700 kg',
      daysLeft: '7',
      supplier: 'Patel Mills',
      urgency: 'medium',
    },
    {
      id: 'P004',
      name: 'Rice Bran',
      current: '250 kg',
      threshold: '300 kg',
      daysLeft: '2',
      supplier: 'Local Farms',
      urgency: 'high',
    },
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;

  return (
    <div className="space-y-3">
      {displayProducts.map((product) => (
        <div key={product.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <div className={`p-1 rounded mr-2 ${
                product.urgency === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-xs text-gray-500">{product.supplier}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              product.urgency === 'high' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {product.urgency === 'high' ? 'Urgent' : 'Soon'}
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="text-xs text-gray-500">Current / Threshold</p>
              <p className="text-sm font-medium">
                {product.current} / {product.threshold}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Days Left</p>
              <p className={`text-sm font-medium ${
                parseInt(product.daysLeft) < 3 ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {product.daysLeft} days
              </p>
            </div>
          </div>
          
          <button className="w-full mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center">
            <ShoppingCart className="h-3 w-3 mr-1" />
            Reorder
          </button>
        </div>
      ))}
    </div>
  );
}