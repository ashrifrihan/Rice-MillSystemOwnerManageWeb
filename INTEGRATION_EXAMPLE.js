/**
 * INTEGRATION EXAMPLE
 * How to use the delivery completion system in existing pages
 * 
 * Add this to your DeliveryTracking.jsx or TransportGPS.jsx
 */

// ============ STEP 1: IMPORTS ============
import CompleteDeliveryFlow from '../components/CompleteDeliveryFlow';
import { getTopMatches } from '../services/transportService';

// ============ STEP 2: ADD STATE ============
export function DeliveryTracking() {
  // ... existing state ...
  const [showCompletionFlow, setShowCompletionFlow] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // ============ STEP 3: ADD BUTTON ============
  return (
    <div>
      {/* Existing code... */}

      {/* Add this button in your trip details or table */}
      <button
        onClick={() => {
          setSelectedTrip(currentTrip);
          setShowCompletionFlow(true);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all"
      >
        <CheckCircle className="h-5 w-5" />
        Complete Delivery
      </button>

      {/* ============ STEP 4: ADD COMPLETION FLOW ============ */}
      {showCompletionFlow && selectedTrip && (
        <CompleteDeliveryFlow
          trip={selectedTrip}
          drivers={drivers}
          vehicles={vehicles}
          allOrders={orders}
          onComplete={(result) => {
            // Handle completion result
            console.log('✓ Delivery completed:', result.completedTrip);
            console.log('✓ Next driver assigned:', result.nextDriver?.name);
            console.log('✓ Match score:', result.matchScore);

            // Optional: Navigate to transport history
            // navigate('/transport-history');

            // Optional: Show success toast
            toast.success(
              `✓ Delivery completed! Driver ${result.nextDriver?.name || 'selected'} assigned for next trip.`
            );
          }}
          onClose={() => {
            setShowCompletionFlow(false);
            setSelectedTrip(null);
          }}
        />
      )}
    </div>
  );
}

// ============ ALTERNATIVE: USE IN MODAL ============
export function TripDetailsModal({ trip, onClose }) {
  const [showCompletion, setShowCompletion] = useState(false);

  if (showCompletion) {
    return (
      <CompleteDeliveryFlow
        trip={trip}
        drivers={drivers}
        vehicles={vehicles}
        allOrders={orders}
        onComplete={(result) => {
          toast.success('Delivery completed!');
          onClose();
        }}
        onClose={() => setShowCompletion(false)}
      />
    );
  }

  return (
    <div className="modal">
      {/* Trip details... */}
      <button
        onClick={() => setShowCompletion(true)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Complete Delivery
      </button>
    </div>
  );
}

// ============ ADVANCED: BATCH COMPLETION ============
// Complete multiple deliveries and get driver recommendations
export function batchCompleteDeliveries(trips, drivers, vehicles, orders) {
  const results = [];

  trips.forEach((trip) => {
    // Get recommended drivers for each trip
    const topMatches = getTopMatches(
      drivers,
      vehicles,
      trip,
      orders,
      3
    );

    results.push({
      trip: trip.id,
      completedAt: new Date().toISOString(),
      topMatches: topMatches.map(m => ({
        driverId: m.driver.id,
        vehicleId: m.vehicle.id,
        score: m.score,
        recommendations: m.recommendations
      }))
    });
  });

  return results;
}

// ============ HELPER: CHECK IF DELIVERY CAN COMPLETE ============
export function canCompleteDelivery(trip) {
  const checks = {
    hasDeliveryProof: !!trip.deliveryProof?.uploadedAt,
    hasDriverSignature: !!trip.deliveryProof?.notes,
    hasGPSLocation: !!(trip.route?.currentLocation),
    isInTransit: trip.status === 'in-transit' || trip.status === 'active'
  };

  return {
    canComplete: Object.values(checks).every(v => v),
    checks
  };
}

// ============ USAGE EXAMPLE IN TEMPLATE ============
{canCompleteDelivery(trip).canComplete ? (
  <button
    onClick={handleComplete}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    ✓ Complete Delivery
  </button>
) : (
  <div className="bg-amber-50 border border-amber-200 rounded p-3">
    <p className="text-amber-900 font-medium mb-2">Missing requirements:</p>
    <ul className="text-sm text-amber-800">
      {!canCompleteDelivery(trip).checks.hasDeliveryProof && (
        <li>• Delivery proof not uploaded</li>
      )}
      {!canCompleteDelivery(trip).checks.hasGPSLocation && (
        <li>• GPS location not captured</li>
      )}
    </ul>
  </div>
)}

// ============ DATA FLOW DIAGRAM ============
/*
USER CLICKS "COMPLETE DELIVERY"
         ↓
CompleteDeliveryFlow Modal Opens
         ↓
    STEP 1: Confirm
    - Show trip summary
    - Display GPS location
    - User confirms completion
         ↓
    STEP 2: Processing
    - Save to trips/{id} status = "Delivered"
    - Save to transportHistory/{id}
    - Calculate available drivers
         ↓
    STEP 3: Select Driver
    - Show AvailableDriversModal
    - Display top 3-5 matches
    - AI scoring (0-100)
    - User selects driver
         ↓
    ASSIGNMENT
    - Update workers/{driverId}
    - Set assignedVehicleId
    - Save assignment record
         ↓
    COMPLETE
    - onComplete callback fires
    - Navigation to next screen
    - Success notification
*/

// ============ DATABASE OPERATIONS ============
/*
FIREBASE WRITES:

1. Update Trip Status
   trips/{tripId} = {
     status: "Delivered",
     completedAt: "2024-01-15T18:30:00Z",
     deliveryProof: { ... }
   }

2. Save to History
   transportHistory/{tripId} = {
     ... (complete trip record) ...
     completedAt: "2024-01-15T18:30:00Z"
   }

3. Assign Driver
   workers/{driverId} = {
     assignedVehicleId: "veh-1",
     assignedVehicleNumber: "WP CAB 1234",
     status: "busy"
   }

4. Create Assignment (optional)
   assignments/{assignmentId} = {
     driverId: "drv-1",
     vehicleId: "veh-1",
     assignedAt: "2024-01-15T18:30:00Z",
     matchScore: 92
   }
*/

// ============ ERROR HANDLING ============
try {
  const result = await completeDeliveryAndAssign(trip, driver, vehicle);
  console.log('✓ Success:', result);
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    toast.error('You do not have permission to complete this delivery');
  } else if (error.code === 'NETWORK_ERROR') {
    toast.error('Network error. Please check your connection');
  } else {
    toast.error('Failed to complete delivery: ' + error.message);
  }
}

// ============ REAL-TIME UPDATES ============
// Listen for delivery completions in real-time
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';

export function listenToCompletedDeliveries() {
  const historyRef = ref(db, 'transportHistory');
  const recentQuery = query(historyRef, orderByChild('completedAt'), limitToLast(10));

  onValue(recentQuery, (snapshot) => {
    const completed = snapshot.val();
    console.log('Recent completions:', completed);
    
    // Update UI
    setCompletedDeliveries(Object.values(completed || {}));
  });
}

// ============ METRICS & ANALYTICS ============
export function getDeliveryMetrics(completedDeliveries) {
  return {
    totalCompleted: completedDeliveries.length,
    totalDistance: completedDeliveries.reduce((sum, trip) => {
      return sum + (parseFloat(trip.distance) || 0);
    }, 0),
    totalRevenue: completedDeliveries.reduce((sum, trip) => {
      const rev = parseInt(trip.revenue?.replace(/[^\d]/g, '') || 0);
      return sum + rev;
    }, 0),
    averageCompletionTime: completedDeliveries.reduce((sum, trip) => {
      // Calculate time from start to completion
      return sum + (parseFloat(trip.duration) || 0);
    }, 0) / completedDeliveries.length,
    topDriver: completedDeliveries.reduce((top, trip) => {
      const count = (top[trip.driver?.name] || 0) + 1;
      return { ...top, [trip.driver?.name]: count };
    }, {}),
    proofUploadRate: (
      completedDeliveries.filter(t => t.proofStatus === 'uploaded').length / 
      completedDeliveries.length * 100
    ).toFixed(2) + '%'
  };
}

// ============ NOTIFICATION EXAMPLE ============
// Send notification when delivery completed
async function notifyDeliveryComplete(trip, nextDriver) {
  const message = {
    title: 'Delivery Completed',
    body: `Trip ${trip.id} completed. Next driver: ${nextDriver.name}`,
    data: {
      tripId: trip.id,
      nextDriverId: nextDriver.id,
      matchScore: nextDriver.score
    }
  };

  // Send via Firebase Cloud Messaging or custom API
  await sendNotification(trip.driver.id, message);
  
  // Notify next driver
  if (nextDriver) {
    await sendNotification(nextDriver.id, {
      title: 'New Delivery Assigned',
      body: `You have been assigned for delivery to ${trip.customer.address}`,
      data: { tripId: trip.id }
    });
  }
}
