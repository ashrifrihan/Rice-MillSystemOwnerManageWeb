import React from 'react';
import { FileTextIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
export function ProposalsStatus({
  proposals,
  summary
}) {
  return <div className="bg-white rounded-lg shadow p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Proposals Status</h2>
        <Link to="/proposals" className="text-sm text-indigo-600 hover:text-indigo-900">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <ClockIcon className="h-4 w-4 mx-auto mb-1 text-blue-500" />
          <p className="text-xs text-blue-600">Pending</p>
          <p className="text-lg font-semibold text-blue-700">
            {summary.pending}
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <CheckCircleIcon className="h-4 w-4 mx-auto mb-1 text-green-500" />
          <p className="text-xs text-green-600">Approved</p>
          <p className="text-lg font-semibold text-green-700">
            {summary.approved}
          </p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <XCircleIcon className="h-4 w-4 mx-auto mb-1 text-red-500" />
          <p className="text-xs text-red-500">Rejected</p>
          <p className="text-lg font-semibold text-red-700">
            {summary.rejected}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {proposals.map(proposal => <div key={proposal.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
            <div className="flex-shrink-0 mr-3">
              <FileTextIcon className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {proposal.title}
                </p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${proposal.status === 'Approved' ? 'bg-green-100 text-green-800' : proposal.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                  {proposal.status}
                </span>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">{proposal.category}</p>
                <p className="text-xs text-gray-500">₹{proposal.budget}</p>
              </div>
            </div>
          </div>)}
      </div>
      <div className="mt-3 text-center">
        <Link to="/proposals" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Submit Proposal
        </Link>
      </div>
    </div>;
}