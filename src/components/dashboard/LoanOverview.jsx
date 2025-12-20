import React from 'react';
import { DollarSignIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
export function LoanOverview({
  loans
}) {
  return <div className="bg-white rounded-lg shadow p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Loan Overview</h2>
        <Link to="/loan-management" className="text-sm text-indigo-600 hover:text-indigo-900">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500">Active Loans</p>
          <p className="text-lg font-semibold text-gray-900">18</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-lg font-semibold text-gray-900">Rs 645,800</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <p className="text-xs text-red-500">Overdue</p>
          <p className="text-lg font-semibold text-red-700">3</p>
        </div>
      </div>
      <div className="space-y-3">
        {loans.map(loan => <div key={loan.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
            <div className="flex-shrink-0 mr-3">
              {loan.status === 'Overdue' ? <AlertTriangleIcon className="h-5 w-5 text-red-500" /> : loan.status === 'Fully Repaid' ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <DollarSignIcon className="h-5 w-5 text-blue-500" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {loan.customer}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  ₹{loan.amount}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">
                  {loan.riceType} - {loan.quantity}kg
                </p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${loan.status === 'Fully Repaid' ? 'bg-green-100 text-green-800' : loan.status === 'Active' ? 'bg-blue-100 text-blue-800' : loan.status === 'Partially Repaid' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {loan.status}
                </span>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
}