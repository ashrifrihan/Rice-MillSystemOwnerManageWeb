/**
 * AvailableDriversModal.jsx - Shows matched drivers after delivery completion
 * Displays top 3 driver-vehicle combinations with matching scores
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  AlertCircle,
  Star,
  Truck,
  User,
  MapPin,
  Package,
  Zap,
  Award,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getTopMatches } from '../services/transportService';

export function AvailableDriversModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  order, 
  drivers = [], 
  vehicles = [], 
  allOrders = []
}) {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && drivers.length > 0 && vehicles.length > 0 && order) {
      setIsLoading(true);
      // Calculate matches
      const topMatches = getTopMatches(drivers, vehicles, order, allOrders, 5);
      setMatches(topMatches);
      setIsLoading(false);
    }
  }, [isOpen, drivers, vehicles, order, allOrders]);

  const handleAssign = () => {
    if (selectedMatch) {
      onSelect(selectedMatch);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Available Drivers & Vehicles</h2>
            <p className="text-blue-100 text-sm mt-1">Smart matching for optimal delivery performance</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Order Info */}
        <div className="bg-blue-50 border-b border-blue-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Order ID</p>
              <p className="text-lg font-bold text-gray-900">{order?.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Destination</p>
              <p className="text-sm font-medium text-gray-900">{order?.deliveryAddress || order?.endLocation}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Weight</p>
              <p className="text-lg font-bold text-blue-600">{order?.quantity || order?.items?.length || 'Unknown'} kg</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Distance</p>
              <p className="text-lg font-bold text-gray-900">{order?.estimatedDistance || '~'} km</p>
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600">Calculating best matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No available drivers at the moment</p>
              <p className="text-gray-500 text-sm mt-1">Please try again later or check driver availability</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match, index) => (
                <div
                  key={`${match.driver.id}-${match.vehicle.id}`}
                  onClick={() => setSelectedMatch(match)}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                    selectedMatch?.driver.id === match.driver.id && 
                    selectedMatch?.vehicle.id === match.vehicle.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-400'
                  }`}
                >
                  {/* Rank and Score */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600">Match #{index + 1}</h3>
                        {index === 0 && <p className="text-xs text-green-600 font-semibold">🎯 BEST MATCH</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{match.score}</div>
                      <p className="text-xs text-gray-600">Match Score</p>
                    </div>
                  </div>

                  {/* Driver and Vehicle Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Driver Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <img
                            src={match.driver.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.driver.id}`}
                            alt={match.driver.name}
                            className="w-12 h-12 rounded-full border-2 border-white"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{match.driver.name}</h4>
                            {match.driver.rating >= 4.5 && (
                              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs font-semibold text-yellow-700">{match.driver.rating}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">License: {match.driver.licenseNumber}</p>
                          <p className="text-xs text-gray-600">Phone: {match.driver.phone}</p>
                          <div className="mt-2 flex items-center gap-1">
                            {match.driver.isAvailable ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                <span className="text-xs font-semibold">Available</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-3 w-3" />
                                <span className="text-xs font-semibold">Busy</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Truck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{match.vehicle.vehicleNumber}</h4>
                          <p className="text-xs text-gray-600">{match.vehicle.type}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs">
                              <span className="text-gray-600">Capacity:</span>
                              <span className="font-semibold text-gray-900 ml-1">{match.vehicle.capacity}</span>
                            </p>
                            <p className="text-xs">
                              <span className="text-gray-600">Fuel:</span>
                              <span className="font-semibold text-gray-900 ml-1">{match.vehicle.fuelType}</span>
                            </p>
                          </div>
                          <div className="mt-2 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-semibold text-green-600">Ready</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Score Breakdown</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <p className="text-xs text-gray-600">Capacity</p>
                        <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, match.breakdown.capacityPenalty ? 50 : 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Availability</p>
                        <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${match.breakdown.availabilityPenalty ? 50 : 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Distance</p>
                        <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-purple-500 h-1.5 rounded-full" 
                            style={{ width: `${match.breakdown.distancePenalty ? 50 : 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Experience</p>
                        <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-yellow-500 h-1.5 rounded-full" 
                            style={{ width: `${match.driver.rating ? (match.driver.rating / 5) * 100 : 80}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {match.recommendations && match.recommendations.length > 0 && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-2">📌 Recommendations</p>
                      <ul className="space-y-1">
                        {match.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx} className="text-xs text-amber-800">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedMatch}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedMatch
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Assign & Continue
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvailableDriversModal;
