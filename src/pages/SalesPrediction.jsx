import React, { useState, useEffect } from 'react';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  DownloadIcon,
  BarChart3Icon,
  UsersIcon,
  IndianRupeeIcon,
  TargetIcon
} from 'lucide-react';
import { mockAIData } from '../data/mockData';
import toast from 'react-hot-toast';

export function SalesPrediction() {
  const [timeframe, setTimeframe] = useState('month');
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPredictions = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPredictions(mockAIData.salesPredictions);
      setIsLoading(false);
    };
    loadPredictions();
  }, [timeframe]);

  const SalesChart = ({ data }) => {
    const maxSales = Math.max(...data.map(d => d.actual || d.predicted));
    
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h4>
        <div className="flex items-end justify-between h-40 gap-2">
          {data.map((point, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-end justify-center gap-1 h-32 w-full">
                {/* Actual Sales */}
                {point.actual && (
                  <div 
                    className="w-3 bg-blue-500 rounded-t"
                    style={{ height: `${(point.actual / maxSales) * 100}px` }}
                    title={`Actual: Rs. ${point.actual}`}
                  ></div>
                )}
                {/* Predicted Sales */}
                {point.predicted && (
                  <div 
                    className="w-3 bg-green-500 rounded-t opacity-80"
                    style={{ height: `${(point.predicted / maxSales) * 100}px` }}
                    title={`Predicted: Rs. ${point.predicted}`}
                  ></div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                {point.period}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Predicted</span>
          </div>
        </div>
      </div>
    );
  };

  const PredictionCard = ({ prediction }) => {
    const growth = prediction.growthRate;
    const isPositive = growth >= 0;

    return (
      <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{prediction.period}</h3>
            <p className="text-sm text-gray-500">{prediction.type} Prediction</p>
          </div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUpIcon className="h-5 w-5" /> : <TrendingDownIcon className="h-5 w-5" />}
            <span className="font-semibold">{Math.abs(growth)}%</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Predicted Sales</span>
            <span className="text-lg font-bold text-gray-900">
              Rs. {prediction.predictedSales?.toLocaleString()}
            </span>
          </div>

          {prediction.actualSales && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Actual Sales</span>
              <span className="text-lg font-semibold text-gray-700">
                Rs. {prediction.actualSales.toLocaleString()}
            </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Confidence</span>
            <span className="font-medium text-gray-900">{prediction.confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${prediction.confidence}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{prediction.products} products</span>
            <button 
              onClick={() => setSelectedPrediction(prediction)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <BarChart3Icon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Analyzing sales patterns...</p>
        </div>
      </div>
    );
  }

  const totalPredicted = predictions.reduce((sum, p) => sum + (p.predictedSales || 0), 0);
  const totalGrowth = predictions.reduce((sum, p) => sum + p.growthRate, 0) / predictions.length;
  const highConfidence = predictions.filter(p => p.confidence >= 80).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Prediction</h1>
          <p className="text-gray-500 mt-1">AI-powered sales forecasting and trend analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="bg-transparent focus:outline-none text-sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <IndianRupeeIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Predicted</h3>
              <p className="text-2xl font-semibold text-gray-900">Rs. {totalPredicted.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <TrendingUpIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Growth</h3>
              <p className="text-2xl font-semibold text-gray-900">{totalGrowth.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <TargetIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">High Confidence</h3>
              <p className="text-2xl font-semibold text-gray-900">{highConfidence}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Products</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(predictions.flatMap(p => p.products)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Sales Forecast Overview</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Historical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Forecast</span>
            </div>
          </div>
        </div>
        <SalesChart data={predictions.flatMap(p => p.history || [])} />
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {predictions.map((prediction, index) => (
          <PredictionCard key={index} prediction={prediction} />
        ))}
      </div>

      {/* Prediction Detail Modal */}
      {selectedPrediction && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedPrediction.period}</h3>
                    <p className="text-gray-500">{selectedPrediction.type} Sales Prediction</p>
                  </div>
                  <button
                    onClick={() => setSelectedPrediction(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SalesChart data={selectedPrediction.history} />
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Prediction Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Predicted Sales:</span>
                          <span className="font-bold text-lg">
                            Rs. {selectedPrediction.predictedSales?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Growth Rate:</span>
                          <span className={`font-semibold ${selectedPrediction.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedPrediction.growthRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence Level:</span>
                          <span className="font-semibold">{selectedPrediction.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Key Factors</h4>
                      <ul className="space-y-2 text-sm">
                        {selectedPrediction.factors?.map((factor, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-0.5">
                              {index + 1}
                            </div>
                            <span className="ml-2 text-gray-700">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                      <p className="text-sm text-gray-700">{selectedPrediction.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedPrediction(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                  Adjust Targets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}