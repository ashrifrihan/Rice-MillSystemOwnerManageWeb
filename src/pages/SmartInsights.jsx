import React, { useState, useEffect } from 'react';
import {
  BrainIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  LightbulbIcon,
  ZapIcon,
  TargetIcon,
  CalendarIcon,
  DownloadIcon,
  FilterIcon
} from 'lucide-react';
import { mockAIData } from '../data/mockData';
import toast from 'react-hot-toast';

export function SmartInsights() {
  const [timeframe, setTimeframe] = useState('month');
  const [category, setCategory] = useState('all');
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setInsights(mockAIData.smartInsights);
      setIsLoading(false);
    };
    loadInsights();
  }, [timeframe, category]);

  const InsightCard = ({ insight }) => {
    const getIcon = (type) => {
      switch (type) {
        case 'revenue': return <TrendingUpIcon className="h-5 w-5" />;
        case 'cost': return <TrendingDownIcon className="h-5 w-5" />;
        case 'efficiency': return <ZapIcon className="h-5 w-5" />;
        case 'opportunity': return <TargetIcon className="h-5 w-5" />;
        default: return <LightbulbIcon className="h-5 w-5" />;
      }
    };

    const getColor = (type) => {
      switch (type) {
        case 'revenue': return 'text-green-600 bg-green-100';
        case 'cost': return 'text-red-600 bg-red-100';
        case 'efficiency': return 'text-blue-600 bg-blue-100';
        case 'opportunity': return 'text-purple-600 bg-purple-100';
        default: return 'text-yellow-600 bg-yellow-100';
      }
    };

    return (
      <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${getColor(insight.type)}`}>
            {getIcon(insight.type)}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            insight.impact === 'high' ? 'bg-red-100 text-red-800' : 
            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {insight.impact} impact
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
        <p className="text-gray-600 mb-4">{insight.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Confidence:</span>
            <span className="font-medium text-gray-900">{insight.confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${insight.confidence}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{insight.category}</span>
            <div className="flex gap-2">
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                View Details
              </button>
              <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <BrainIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Generating smart insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Insights</h1>
          <p className="text-gray-500 mt-1">AI-powered actionable insights for your business</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="bg-transparent focus:outline-none text-sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>
          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
            <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="bg-transparent focus:outline-none text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="sales">Sales</option>
              <option value="inventory">Inventory</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Insights
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Insights</h3>
              <p className="text-2xl font-semibold text-gray-900">{insights.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <LightbulbIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">High Impact</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {insights.filter(i => i.impact === 'high').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <ZapIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Avg Confidence</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <TargetIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Applied</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {insights.filter(i => i.applied).length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <TrendingUpIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {insights
          .filter(insight => category === 'all' || insight.category === category)
          .map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))
        }
      </div>

      {/* Empty State */}
      {insights.filter(insight => category === 'all' || insight.category === category).length === 0 && (
        <div className="text-center py-12">
          <LightbulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more insights</p>
        </div>
      )}
    </div>
  );
}