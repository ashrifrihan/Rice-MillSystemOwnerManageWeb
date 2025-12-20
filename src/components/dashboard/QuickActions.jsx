import React from 'react';
import { PlusCircleIcon, CheckCircleIcon, DollarSignIcon, TruckIcon } from 'lucide-react';
export function QuickActions() {
  const actions = [{
    name: 'Add Stock',
    icon: PlusCircleIcon,
    color: 'bg-rice-green-600',
    onClick: () => console.log('Add Stock clicked')
  }, {
    name: 'Approve Order',
    icon: CheckCircleIcon,
    color: 'bg-rice-brown-600',
    onClick: () => console.log('Approve Order clicked')
  }, {
    name: 'Add Loan Rice',
    icon: DollarSignIcon,
    color: 'bg-rice-beige-600',
    onClick: () => console.log('Add Loan Rice clicked')
  }, {
    name: 'Assign Delivery',
    icon: TruckIcon,
    color: 'bg-blue-600',
    onClick: () => console.log('Assign Delivery clicked')
  }];
  return <div className="bg-white rounded-lg shadow p-5 h-full">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => <button key={index} onClick={action.onClick} className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className={`${action.color} text-white p-2 rounded-full mb-2`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {action.name}
            </span>
          </button>)}
      </div>
    </div>;
}