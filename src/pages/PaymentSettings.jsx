import React from 'react';
import { ArrowLeftIcon, CreditCardIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PaymentSettings() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-500">Manage payment methods and settings</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-8 text-center">
        <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Settings</h3>
        <p className="text-gray-500">This page is under development</p>
      </div>
    </div>
  );
}