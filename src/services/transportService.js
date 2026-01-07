/**
 * Transport Service - Driver & Vehicle Matching Algorithm
 * Handles intelligent matching of drivers and vehicles based on:
 * - Vehicle capacity vs order quantity
 * - Vehicle type vs trip type
 * - Driver availability and specialization
 * - Distance capabilities
 * - Current workload
 */

/**
 * Driver-Vehicle Matching Algorithm
 * Scoring Algorithm: weighted combination of factors
 */
export const calculateMatchScore = (driver, vehicle, order, allOrders = []) => {
  if (!driver || !vehicle || !order) return 0;

  let score = 100; // Base score
  let penalties = 0;

  // ============ CAPACITY MATCHING (Weight: 30%) ============
  const vehicleCapacity = parseCapacity(vehicle.capacity);
  const orderWeight = calculateOrderWeight(order);

  if (vehicleCapacity > 0 && orderWeight > 0) {
    // Perfect capacity: 90-95 points
    // Over-capacity: 85-90 points
    // Under-capacity by <20%: 70-80 points
    // Under-capacity by >20%: 0 points (penalty)

    if (orderWeight > vehicleCapacity) {
      penalties += 30; // Can't fit order
    } else if (orderWeight <= vehicleCapacity * 0.8) {
      // Good utilization (80-100% of capacity)
      score += 5; // Bonus for good utilization
    } else {
      // Slight underutilization (60-80%)
      penalties += 5;
    }
  }

  // ============ VEHICLE TYPE MATCHING (Weight: 20%) ============
  const typeScore = calculateVehicleTypeScore(vehicle, order);
  penalties += (10 - typeScore); // Max 10 points for type match

  // ============ DRIVER AVAILABILITY (Weight: 25%) ============
  const driverAvailability = calculateDriverAvailability(driver, allOrders);
  if (driverAvailability < 0.5) {
    // Driver too busy
    penalties += 25;
  } else if (driverAvailability > 0.8) {
    // Driver very available
    score += 10;
  }

  // ============ DISTANCE CAPABILITY (Weight: 15%) ============
  const orderDistance = parseFloat(order.estimatedDistance) || 100;
  const driverLongDistance = driver.preferredVehicleTypes?.includes('Lorry') ? true : false;

  if (orderDistance > 150 && !driverLongDistance) {
    penalties += 15; // Long distance driver preferred
  } else if (orderDistance < 50 && driverLongDistance) {
    penalties += 5; // Underutilization of capable driver
  }

  // ============ DRIVER PREFERENCE MATCH (Weight: 10%) ============
  if (driver.preferredVehicleTypes && vehicle.type) {
    if (driver.preferredVehicleTypes.includes(vehicle.type)) {
      score += 5; // Driver has preference for this vehicle type
    }
  }

  // ============ FINAL SCORE CALCULATION ============
  const finalScore = Math.max(0, score - penalties);

  return {
    score: Math.round(finalScore),
    breakdown: {
      base: score,
      capacityPenalty: penalties <= 30 ? Math.min(30, penalties) : 30,
      availabilityPenalty: driverAvailability < 0.5 ? 25 : 0,
      distancePenalty: orderDistance > 150 && !driverLongDistance ? 15 : 0,
      totalPenalties: penalties
    }
  };
};

/**
 * Get all available drivers and vehicles with their match scores
 */
export const getAvailableDriversAndVehicles = (drivers, vehicles, order, allOrders = []) => {
  const availableDrivers = drivers.filter(d => d.isAvailable && d.status === 'Active');
  const availableVehicles = vehicles.filter(v => v.status === 'Active');

  // Calculate all possible matches
  const allMatches = [];

  availableDrivers.forEach(driver => {
    availableVehicles.forEach(vehicle => {
      // Check if driver is already assigned to vehicle or has no conflicts
      const canAssign = !driver.assignedVehicleId || driver.assignedVehicleId === vehicle.id;

      if (canAssign) {
        const matchResult = calculateMatchScore(driver, vehicle, order, allOrders);

        allMatches.push({
          driver,
          vehicle,
          ...matchResult,
          recommendations: generateRecommendations(driver, vehicle, order, matchResult)
        });
      }
    });
  });

  // Sort by score (descending)
  return allMatches.sort((a, b) => b.score - a.score);
};

/**
 * Get top N best matching combinations
 */
export const getTopMatches = (drivers, vehicles, order, allOrders = [], topN = 3) => {
  const allMatches = getAvailableDriversAndVehicles(drivers, vehicles, order, allOrders);
  return allMatches.slice(0, topN);
};

/**
 * Calculate parking capacity in kg from various formats
 */
function parseCapacity(capacity) {
  if (!capacity) return 0;

  if (typeof capacity === 'number') return capacity;

  const str = String(capacity).toLowerCase();
  const match = str.match(/(\d+(?:\.\d+)?)\s*(kg|ton|tonnes?)/);

  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];

    if (unit === 'kg') return value;
    if (unit.startsWith('ton')) return value * 1000;
  }

  return 0;
}

/**
 * Calculate total weight of order in kg
 */
function calculateOrderWeight(order) {
  // If quantity is given
  if (order.quantity) {
    const qty = parseFloat(order.quantity);
    if (!isNaN(qty)) return qty;
  }

  // If items are given, sum them up
  if (Array.isArray(order.items)) {
    return order.items.reduce((sum, item) => {
      const itemWeight = parseFloat(item.quantity) || 0;
      return sum + itemWeight;
    }, 0);
  }

  // Default estimate
  return 500; // Default 500kg if unknown
}

/**
 * Score vehicle type match with order type (0-10 scale)
 */
function calculateVehicleTypeScore(vehicle, order) {
  const tripType = (order.type || '').toLowerCase();
  const vehicleType = (vehicle.type || '').toLowerCase();

  const typeMatching = {
    'delivery': ['truck', 'lorry', 'pickup truck', 'van'],
    'pickup': ['truck', 'lorry', 'pickup truck'],
    'long-haul': ['truck', 'lorry', 'tanker'],
    'local': ['van', 'pickup truck', 'small lorry'],
    'rice delivery': ['truck', 'lorry', 'pickup truck'],
    'paddy pickup': ['truck', 'lorry', 'pickup truck'],
  };

  const acceptableTypes = typeMatching[tripType] || typeMatching['delivery'];
  const isMatch = acceptableTypes.some(type => vehicleType.includes(type));

  return isMatch ? 10 : 5; // 10 if match, 5 if partial
}

/**
 * Calculate driver availability (0-1 scale)
 * Based on number of active trips
 */
function calculateDriverAvailability(driver, allOrders = []) {
  // Count active trips for this driver
  const activeTrips = allOrders.filter(
    order => order.assignedDriver?.id === driver.id && 
             (order.status === 'in-transit' || order.status === 'assigned')
  ).length;

  // Maximum concurrent trips: 1-2
  const maxConcurrentTrips = 2;
  const availability = Math.max(0, (maxConcurrentTrips - activeTrips) / maxConcurrentTrips);

  return availability;
}

/**
 * Generate human-readable recommendations
 */
function generateRecommendations(driver, vehicle, order, matchResult) {
  const recommendations = [];

  if (matchResult.score >= 80) {
    recommendations.push('✓ Excellent match - Highly recommended');
  } else if (matchResult.score >= 60) {
    recommendations.push('○ Good match - Suitable for this order');
  } else {
    recommendations.push('△ Fair match - Use if preferred options unavailable');
  }

  // Capacity feedback
  const vehicleCapacity = parseCapacity(vehicle.capacity);
  const orderWeight = calculateOrderWeight(order);
  if (orderWeight > vehicleCapacity) {
    recommendations.push('⚠ Vehicle capacity may be insufficient');
  } else if (orderWeight < vehicleCapacity * 0.3) {
    recommendations.push('~ Vehicle is over-capacity for this order');
  }

  // Distance feedback
  const orderDistance = parseFloat(order.estimatedDistance) || 100;
  if (orderDistance > 200) {
    recommendations.push('~ Long distance trip - Verify driver experience');
  }

  // Driver experience
  if (driver.rating >= 4.5) {
    recommendations.push('⭐ High-rated driver');
  }

  return recommendations;
}

/**
 * Complete a delivery and save to transport history
 */
export const completeDelivery = async (trip, db, updateCallback) => {
  if (!trip || !trip.id) {
    throw new Error('Invalid trip data');
  }

  const completedTrip = {
    ...trip,
    status: 'Delivered',
    completedAt: new Date().toISOString(),
    deliveryProof: trip.deliveryProof || {
      uploadedAt: new Date().toISOString(),
      gpsLocation: `${trip.route?.currentLocation?.lat}, ${trip.route?.currentLocation?.lng}`,
      notes: 'Delivered'
    }
  };

  // Save to history
  try {
    // Update trips status
    await updateCallback(`trips/${trip.id}`, { status: 'Delivered', completedAt: completedTrip.completedAt });

    // Save to transport history
    await updateCallback(`transportHistory/${trip.id}`, completedTrip);

    return completedTrip;
  } catch (error) {
    console.error('Error completing delivery:', error);
    throw error;
  }
};

/**
 * Get summary statistics for transport operations
 */
export const getTransportStatistics = (allTrips = []) => {
  const totalTrips = allTrips.length;
  const completedTrips = allTrips.filter(t => t.status === 'Delivered').length;
  const inTransitTrips = allTrips.filter(t => t.status === 'in-transit' || t.status === 'active').length;
  const totalDistance = allTrips.reduce((sum, t) => {
    const distance = parseFloat(t.estimatedDistance) || 0;
    return sum + distance;
  }, 0);

  return {
    totalTrips,
    completedTrips,
    inTransitTrips,
    completionRate: totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0,
    totalDistance: Math.round(totalDistance),
    averageTripsPerDriver: totalTrips > 0 ? (totalTrips / 10).toFixed(1) : 0 // Assuming ~10 drivers
  };
};

export default {
  calculateMatchScore,
  getAvailableDriversAndVehicles,
  getTopMatches,
  completeDelivery,
  getTransportStatistics
};
