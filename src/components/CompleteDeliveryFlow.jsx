/**
 * CompleteDeliveryFlow.jsx - Handle delivery completion and next driver selection
 * Integrates with transportService.js for smart driver-vehicle matching
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock,
  MapPin,
  Truck,
  User,
  Phone,
  X,
  ChevronRight
} from 'lucide-react';
import { rtdb as db } from '../firebase/config';
import { ref, update, push } from 'firebase/database';
import toast from 'react-hot-toast';
import { completeDelivery, getTopMatches } from '../services/transportService';
import AvailableDriversModal from './AvailableDriversModal';

export function CompleteDeliveryFlow({ 
  trip, 
  drivers = [], 
  vehicles = [], 
  allOrders = [],
  onComplete,
  onClose 
}) {
  const [step, setStep] = useState('confirm'); // 'confirm' -> 'processing' -> 'select-driver'
  const [isLoading, setIsLoading] = useState(false);
  const [completedTrip, setCompletedTrip] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [topMatches, setTopMatches] = useState([]);

  // Complete delivery and get next available drivers
  const handleCompleteDelivery = async () => {
    if (!trip) return;

    setIsLoading(true);
    try {
      // Update trip status to delivered
      const tripRef = ref(db, `trips/${trip.id}`);
      const now = new Date().toISOString();
      
      await update(tripRef, {
        status: 'Delivered',
        completedAt: now,
        deliveryProof: {
          uploadedAt: now,
          gpsLocation: trip.route?.currentLocation ? 
            `${trip.route.currentLocation.lat}, ${trip.route.currentLocation.lng}` : 
            'N/A',
          notes: 'Delivery completed'
        }
      });

      // Save to transport history
      const historyRef = ref(db, `transportHistory/${trip.id}`);
      const completedTripData = {
        ...trip,
        status: 'Delivered',
        completedAt: now,
        deliveryProof: {
          uploadedAt: now,
          gpsLocation: trip.route?.currentLocation ? 
            `${trip.route.currentLocation.lat}, ${trip.route.currentLocation.lng}` : 
            'N/A',
          notes: 'Delivery completed'
        }
      };
      
      await update(historyRef, completedTripData);
      
      setCompletedTrip(completedTripData);
      setStep('processing');

      // Calculate next available drivers after a short delay
      setTimeout(() => {
        const matches = getTopMatches(drivers, vehicles, trip, allOrders, 3);
        setTopMatches(matches);
        setStep('select-driver');
      }, 1500);

      toast.success('✓ Delivery marked as completed!');
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery');
      setIsLoading(false);
    }
  };

  const handleDriverSelected = async (match) => {
    try {
      // Assign next trip to selected driver and vehicle
      const nextTripRef = push(ref(db, 'trips'));
      
      // Create assignment record
      await update(ref(db, `assignments/${nextTripRef.key}`), {
        driver: match.driver,
        vehicle: match.vehicle,
        status: 'assigned',
        assignedAt: new Date().toISOString(),
        matchScore: match.score
      });

      // Update driver assignment
      await update(ref(db, `workers/${match.driver.id}`), {
        assignedVehicleId: match.vehicle.id,
        assignedVehicleNumber: match.vehicle.vehicleNumber,
        status: 'busy'
      });

      toast.success(`✓ Driver ${match.driver.name} assigned for next delivery!`);
      
      if (onComplete) {
        onComplete({ 
          completedTrip, 
          nextDriver: match.driver,
          nextVehicle: match.vehicle,
          matchScore: match.score
        });
      }

      onClose();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Failed to assign driver');
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete({ completedTrip });
    }
    onClose();
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
          {/* Step 1: Confirm Completion */}
          {step === 'confirm' && (
            <>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Complete Delivery</h2>
                    <p className="text-blue-100 text-sm mt-1">Finalize trip and select next driver</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-lg">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Trip Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Trip ID</p>
                      <p className="text-lg font-bold text-gray-900">{trip?.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Destination</p>
                      <p className="text-sm font-medium text-gray-900">{trip?.route?.destination || trip?.endLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Driver</p>
                      <p className="text-sm font-medium text-gray-900">{trip?.driver?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold">Vehicle</p>
                      <p className="text-sm font-medium text-gray-900">{trip?.vehicle?.number}</p>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Delivery completed at destination</p>
                      <p className="text-sm text-gray-600 mt-1">{trip?.customer?.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Customer signature confirmed</p>
                      <p className="text-sm text-gray-600 mt-1">Goods received in good condition</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Next step: Select available driver</p>
                      <p className="text-sm text-gray-600 mt-1">AI will recommend best matches based on capacity, distance, and availability</p>
                    </div>
                  </div>
                </div>

                {/* GPS Location */}
                {trip?.route?.currentLocation && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Delivery Location (GPS)</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {trip.route.currentLocation.lat?.toFixed(6)}, {trip.route.currentLocation.lng?.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteDelivery}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Mark as Delivered
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <div className="p-12 text-center">
              <div className="inline-block mb-6">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Delivery...</h3>
              <p className="text-gray-600 mb-6">Calculating available drivers and recommended matches</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  Saving delivery completion
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  Updating transport history
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  Finding available drivers
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Driver Selection (via Modal) */}
        </div>
      </div>

      {/* Available Drivers Modal */}
      <AvailableDriversModal
        isOpen={step === 'select-driver'}
        onClose={handleSkip}
        onSelect={handleDriverSelected}
        order={trip}
        drivers={drivers}
        vehicles={vehicles}
        allOrders={allOrders}
      />
    </>
  );
}

export default CompleteDeliveryFlow;
