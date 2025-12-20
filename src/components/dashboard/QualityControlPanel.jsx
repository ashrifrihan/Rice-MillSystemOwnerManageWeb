// File: C:\Users\RIHAN\Desktop\Rice-Mill-Owner-Web\src\components\dashboard\QualityControlPanel.jsx
import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function QualityControlPanel({ tests = [] }) {
  // Default mock data
  const defaultTests = [
    {
      id: 'QC001',
      lotId: 'LOT-2023-156',
      product: 'Premium Basmati',
      moisture: '13.2%',
      broken: '2.1%',
      status: 'pass',
      time: '10:30 AM',
    },
    {
      id: 'QC002',
      lotId: 'LOT-2023-157',
      product: 'Sona Masoori',
      moisture: '15.8%',
      broken: '1.8%',
      status: 'fail',
      time: '11:45 AM',
    },
    {
      id: 'QC003',
      lotId: 'LOT-2023-158',
      product: 'Brown Rice',
      moisture: '12.5%',
      broken: '3.2%',
      status: 'warning',
      time: '2:15 PM',
    },
    {
      id: 'QC004',
      lotId: 'LOT-2023-159',
      product: 'Jasmine Rice',
      moisture: '14.1%',
      broken: '1.5%',
      status: 'pass',
      time: '3:30 PM',
    },
  ];

  const displayTests = tests.length > 0 ? tests : defaultTests;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-3">
      {displayTests.map((test) => (
        <div key={test.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                {getStatusIcon(test.status)}
                <span className="ml-2 text-sm font-medium text-gray-900">{test.product}</span>
              </div>
              <div className="text-xs text-gray-500 ml-7">
                <p>Lot: {test.lotId}</p>
                <div className="flex space-x-3 mt-1">
                  <span>Moisture: {test.moisture}</span>
                  <span>Broken: {test.broken}</span>
                </div>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              test.status === 'pass' 
                ? 'bg-green-100 text-green-800' 
                : test.status === 'fail' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {test.status === 'pass' ? 'Pass' : test.status === 'fail' ? 'Fail' : 'Review'}
            </span>
          </div>
        </div>
      ))}
      <button className="w-full mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-gray-300 rounded-lg hover:bg-gray-50">
        View All Tests
      </button>
    </div>
  );
}