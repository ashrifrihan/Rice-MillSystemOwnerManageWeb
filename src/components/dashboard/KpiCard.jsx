// components/common/KpiCard.jsx (recommended location)
import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export function KpiCard({ title, value, subtitle, icon: Icon, trend, color = "text-blue-600", action, onClick }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">{value}</h3>
            </div>
          </div>
          
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            trend > 0 
              ? 'bg-green-50 text-green-700' 
              : trend < 0 
              ? 'bg-red-50 text-red-700' 
              : 'bg-gray-50 text-gray-600'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : trend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
            <span>{trend > 0 ? '+' : ''}{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      {action && (
        <button
          onClick={onClick}
          className="w-full mt-3 pt-3 border-t border-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors group"
        >
          {action}
          <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}