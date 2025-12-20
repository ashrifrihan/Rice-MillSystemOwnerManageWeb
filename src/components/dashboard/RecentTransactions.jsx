// File: C:\Users\RIHAN\Desktop\Rice-Mill-Owner-Web\src\components\dashboard\RecentTransactions.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function RecentTransactions({ transactions = [] }) {
  // Default mock data
  const defaultTransactions = [
    {
      id: 'T001',
      time: '10:30 AM',
      type: 'Purchase',
      product: 'Raw Paddy',
      supplier: 'Kumar Farms',
      amount: '₹125,000',
      status: 'Completed',
    },
    {
      id: 'T002',
      time: '11:45 AM',
      type: 'Sale',
      product: 'Premium Basmati',
      supplier: 'Sharma Foods',
      amount: '₹85,000',
      status: 'Completed',
    },
    {
      id: 'T003',
      time: '2:15 PM',
      type: 'Purchase',
      product: 'Sona Masoori',
      supplier: 'Patel Mills',
      amount: '₹92,000',
      status: 'Pending',
    },
    {
      id: 'T004',
      time: '3:30 PM',
      type: 'Sale',
      product: 'Brown Rice',
      supplier: 'Green Grocers',
      amount: '₹45,000',
      status: 'Completed',
    },
    {
      id: 'T005',
      time: '4:45 PM',
      type: 'Purchase',
      product: 'Packaging Bags',
      supplier: 'Packaging Co.',
      amount: '₹18,500',
      status: 'Completed',
    },
  ];

  const displayData = transactions.length > 0 ? transactions : defaultTransactions;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {displayData.map((txn) => (
            <tr key={txn.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{txn.time}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  txn.type === 'Purchase' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {txn.type === 'Purchase' ? 'Buy' : 'Sell'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{txn.product}</p>
                  <p className="text-gray-500 text-xs">{txn.supplier}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium">
                <div className="flex items-center">
                  {txn.type === 'Purchase' ? 
                    <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" /> : 
                    <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
                  }
                  {txn.amount}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  txn.status === 'Completed' 
                    ? 'bg-green-100 text-green-800' 
                    : txn.status === 'Pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {txn.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}