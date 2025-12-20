import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
export function Card({
  title,
  value,
  change,
  positive
}) {
  return <div className="bg-white rounded-lg shadow p-5 border border-rice-beige-100">
      <h3 className="text-sm font-medium text-rice-brown-500">{title}</h3>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-rice-brown-800">{value}</p>
        <div className={`flex items-center text-sm ${positive ? 'text-rice-green-600' : 'text-red-600'}`}>
          {positive ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
          <span>{change}</span>
        </div>
      </div>
    </div>;
}