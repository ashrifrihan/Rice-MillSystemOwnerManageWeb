import React from 'react';
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AIRecommendations({ recommendations }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        
        <Link
          to="/ai-insights"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
        >
          View all →
        </Link>
      </div>

      {/* Recommendation List */}
      <div className="space-y-4">
        {recommendations.map((item, index) => (
          <div
            key={index}
            className="flex items-start p-4 rounded-xl border border-gray-100 shadow-sm bg-gray-50 hover:bg-gray-100 transition"
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 mr-4 p-2 rounded-full shadow-sm ${
                item.action === 'Increase'
                  ? 'bg-green-100 text-green-600'
                  : item.action === 'Decrease'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {item.action === 'Increase' ? (
                <TrendingUp className="h-5 w-5" />
              ) : item.action === 'Decrease' ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <Lightbulb className="h-5 w-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {item.product}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {item.recommendation}
              </p>

              {/* Priority Tag */}
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${
                    item.priority === 'High'
                      ? 'bg-red-100 text-red-700'
                      : item.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {item.priority} Priority
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
