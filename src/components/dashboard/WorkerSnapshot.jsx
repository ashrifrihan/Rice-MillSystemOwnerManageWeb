import React from 'react';
import { UsersIcon, UserCheckIcon, UserXIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
export function WorkerSnapshot({
  workers,
  summary
}) {
  return <div className="bg-white rounded-lg shadow p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Worker Snapshot</h2>
        <Link to="/worker-management" className="text-sm text-indigo-600 hover:text-indigo-900">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <UsersIcon className="h-4 w-4 mx-auto mb-1 text-gray-500" />
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-semibold text-gray-900">{summary.total}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <UserCheckIcon className="h-4 w-4 mx-auto mb-1 text-green-500" />
          <p className="text-xs text-green-600">Present</p>
          <p className="text-lg font-semibold text-green-700">
            {summary.present}
          </p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <UserXIcon className="h-4 w-4 mx-auto mb-1 text-red-500" />
          <p className="text-xs text-red-500">Absent</p>
          <p className="text-lg font-semibold text-red-700">{summary.absent}</p>
        </div>
      </div>
      <div className="space-y-3">
        {workers.map(worker => <div key={worker.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
            <div className="flex-shrink-0 mr-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                {worker.name.substring(0, 2)}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {worker.name}
                </p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${worker.status === 'Present' ? 'bg-green-100 text-green-800' : worker.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {worker.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {worker.role} | ₹{worker.dailyWage}/day
              </p>
            </div>
          </div>)}
      </div>
    </div>;
}