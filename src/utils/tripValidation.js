/**
 * Trip Validation & Error Handling Utilities
 * 
 * Prevents double-booking, validates assignments, handles GPS failures
 */

/**
 * Validates that a vehicle is not already assigned to another trip
 * @param {string} vehicleId - Vehicle ID to check
 * @param {Array} activeTrips - List of active trips from Firebase
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateVehicleAvailability = (vehicleId, activeTrips = []) => {
  if (!vehicleId) {
    return { isValid: false, error: 'Vehicle ID is required' };
  }

  const existingTrip = activeTrips.find(trip => 
    trip.vehicleId === vehicleId && 
    ['in-transit', 'scheduled', 'assigned'].includes(trip.status)
  );

  if (existingTrip) {
    return {
      isValid: false,
      error: `Vehicle is already assigned to trip ${existingTrip.tripId}. Status: ${existingTrip.status}`
    };
  }

  return { isValid: true };
};

/**
 * Validates that a driver is not already assigned to another trip
 * @param {string} driverId - Driver ID to check
 * @param {Array} activeTrips - List of active trips from Firebase
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateDriverAvailability = (driverId, activeTrips = []) => {
  if (!driverId) {
    return { isValid: false, error: 'Driver ID is required' };
  }

  const existingTrip = activeTrips.find(trip => 
    trip.driverId === driverId && 
    ['in-transit', 'scheduled', 'assigned'].includes(trip.status)
  );

  if (existingTrip) {
    return {
      isValid: false,
      error: `Driver is already assigned to trip ${existingTrip.tripId}. Status: ${existingTrip.status}`
    };
  }

  return { isValid: true };
};

/**
 * Validates that an order hasn't already been assigned
 * @param {string} orderId - Order ID to check
 * @param {Array} activeTrips - List of active trips from Firebase
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateOrderNotAssigned = (orderId, activeTrips = []) => {
  if (!orderId) {
    return { isValid: false, error: 'Order ID is required' };
  }

  const existingTrip = activeTrips.find(trip => 
    trip.orderId === orderId && 
    ['in-transit', 'scheduled', 'assigned'].includes(trip.status)
  );

  if (existingTrip) {
    return {
      isValid: false,
      error: `Order is already assigned to trip ${existingTrip.tripId}`
    };
  }

  return { isValid: true };
};

/**
 * Validates vehicle capacity vs order quantity
 * @param {number} vehicleCapacity - Vehicle capacity (numeric, in kg)
 * @param {number} orderQuantity - Order quantity (numeric, in kg)
 * @returns {Object} - { isValid: boolean, error?: string, capacityPercent?: number }
 */
export const validateVehicleCapacity = (vehicleCapacity, orderQuantity) => {
  const capacity = parseFloat(vehicleCapacity);
  const quantity = parseFloat(orderQuantity);

  if (!Number.isFinite(capacity) || capacity <= 0) {
    return { isValid: true, capacityPercent: null }; // Can't validate, allow it
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { isValid: true, capacityPercent: null }; // No quantity specified, allow
  }

  const percent = (quantity / capacity) * 100;

  if (percent > 100) {
    return {
      isValid: false,
      error: `Order quantity (${quantity}kg) exceeds vehicle capacity (${capacity}kg)`,
      capacityPercent: percent
    };
  }

  if (percent > 90) {
    return {
      isValid: true, // Allow but warn
      error: `Order will use ${percent.toFixed(0)}% of vehicle capacity (${quantity}kg / ${capacity}kg)`,
      capacityPercent: percent,
      isWarning: true
    };
  }

  return { isValid: true, capacityPercent: percent };
};

/**
 * Validates all trip assignment data
 * @param {Object} assignmentData - { orderId, vehicleId, driverId, endLocation }
 * @param {Array} activeTrips - List of active trips
 * @param {Object} vehicle - Vehicle data
 * @param {Object} order - Order data
 * @param {Object} driver - Driver data (optional, for availability check)
 * @returns {Object} - { isValid: boolean, errors: string[], warnings: string[] }
 */
export const validateTripAssignment = (assignmentData, activeTrips, vehicle, order, driver) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!assignmentData.orderId) errors.push('Order is required');
  if (!assignmentData.vehicleId) errors.push('Vehicle is required');
  if (!assignmentData.driverId) errors.push('Driver is required');
  if (!assignmentData.endLocation?.trim()) errors.push('End location is required');

  // Check availability
  if (assignmentData.vehicleId) {
    const vehicleCheck = validateVehicleAvailability(assignmentData.vehicleId, activeTrips);
    if (!vehicleCheck.isValid) errors.push(vehicleCheck.error);
  }

  if (assignmentData.driverId) {
    // First check driver's availability status if available
    if (driver && driver.isAvailable === false) {
      errors.push(`Driver ${driver.name} is not available (marked as unavailable)`);
    } else {
      // Fallback to checking active trips
      const driverCheck = validateDriverAvailability(assignmentData.driverId, activeTrips);
      if (!driverCheck.isValid) errors.push(driverCheck.error);
    }
  }

  if (assignmentData.orderId) {
    const orderCheck = validateOrderNotAssigned(assignmentData.orderId, activeTrips);
    if (!orderCheck.isValid) errors.push(orderCheck.error);
  }

  // Check capacity
  if (vehicle && order) {
    const capacityCheck = validateVehicleCapacity(vehicle.capacity, order.quantity);
    if (!capacityCheck.isValid) {
      errors.push(capacityCheck.error);
    } else if (capacityCheck.isWarning) {
      warnings.push(capacityCheck.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * GPS Data Validation
 * Checks if GPS coordinates are reasonable
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateGPSCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { isValid: false, error: 'Invalid GPS coordinates (not numbers)' };
  }

  // Check valid latitude range (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    return { isValid: false, error: `Invalid latitude: ${latitude} (must be between -90 and 90)` };
  }

  // Check valid longitude range (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    return { isValid: false, error: `Invalid longitude: ${longitude} (must be between -180 and 180)` };
  }

  // Sri Lanka coordinates bounds check (optional but helpful)
  const sriLankaLatMin = 5.8;
  const sriLankaLatMax = 7.9;
  const sriLankaLngMin = 79.6;
  const sriLankaLngMax = 81.9;

  if (
    latitude < sriLankaLatMin || latitude > sriLankaLatMax ||
    longitude < sriLankaLngMin || longitude > sriLankaLngMax
  ) {
    return {
      isValid: true, // Still valid, but warning
      warning: `GPS coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) appear to be outside Sri Lanka. Please verify.`
    };
  }

  return { isValid: true };
};

/**
 * Handles GPS offline scenarios gracefully
 * @param {number} lastUpdateTime - Timestamp of last GPS update
 * @param {number} timeoutMs - How long before considering GPS offline (default 90s)
 * @returns {Object} - { isOnline: boolean, status: string, timeSinceUpdate: number }
 */
export const checkGPSConnectionStatus = (lastUpdateTime, timeoutMs = 90000) => {
  if (!lastUpdateTime) {
    return {
      isOnline: false,
      status: 'never-connected',
      timeSinceUpdate: null
    };
  }

  const now = Date.now();
  const timeSinceUpdate = now - lastUpdateTime;

  if (timeSinceUpdate > timeoutMs) {
    return {
      isOnline: false,
      status: 'offline',
      timeSinceUpdate,
      lastUpdateMinutesAgo: Math.floor(timeSinceUpdate / 60000)
    };
  }

  const isWarning = timeSinceUpdate > timeoutMs * 0.7;

  return {
    isOnline: true,
    status: isWarning ? 'unstable' : 'online',
    timeSinceUpdate,
    isWarning
  };
};

/**
 * Validates notification prerequisites before sending
 * @param {Object} driver - Driver object
 * @returns {Object} - { canSend: boolean, errors: string[] }
 */
export const validateNotificationPrerequisites = (driver) => {
  const errors = [];

  if (!driver) {
    errors.push('Driver object is required');
    return { canSend: false, errors };
  }

  if (!driver.phone) {
    errors.push('Driver phone number is missing (SMS cannot be sent)');
  }

  if (!driver.id) {
    errors.push('Driver ID is missing');
  }

  if (!driver.name) {
    errors.push('Driver name is missing');
  }

  return {
    canSend: errors.length === 0,
    errors
  };
};

/**
 * Network error handler
 * Classifies network errors and suggests remediation
 * @param {Error} error - The error object
 * @returns {Object} - { type: string, message: string, isRetryable: boolean, suggestion: string }
 */
export const classifyNetworkError = (error) => {
  const errorMessage = (error?.message || '').toLowerCase();
  const errorCode = error?.code;

  if (errorMessage.includes('network') || errorMessage.includes('offline')) {
    return {
      type: 'network',
      message: 'Network connection unavailable',
      isRetryable: true,
      suggestion: 'Check your internet connection and try again'
    };
  }

  if (errorMessage.includes('permission') || errorCode === 'PERMISSION_DENIED') {
    return {
      type: 'permission',
      message: 'Permission denied',
      isRetryable: false,
      suggestion: 'Check Firebase security rules or your authentication status'
    };
  }

  if (errorMessage.includes('timeout') || errorCode === 'ETIMEDOUT') {
    return {
      type: 'timeout',
      message: 'Request timeout',
      isRetryable: true,
      suggestion: 'The server took too long to respond. Try again.'
    };
  }

  if (errorMessage.includes('quota') || errorCode === 'QUOTA_EXCEEDED') {
    return {
      type: 'quota',
      message: 'Service quota exceeded',
      isRetryable: true,
      suggestion: 'Too many requests. Please wait a moment and try again.'
    };
  }

  if (errorCode === 'INVALID_TOKEN' || errorCode === 'AUTH_ERROR') {
    return {
      type: 'auth',
      message: 'Authentication error',
      isRetryable: false,
      suggestion: 'Please log in again'
    };
  }

  return {
    type: 'unknown',
    message: error?.message || 'An unknown error occurred',
    isRetryable: true,
    suggestion: 'Try again or contact support if the problem persists'
  };
};

export default {
  validateVehicleAvailability,
  validateDriverAvailability,
  validateOrderNotAssigned,
  validateVehicleCapacity,
  validateTripAssignment,
  validateGPSCoordinates,
  checkGPSConnectionStatus,
  validateNotificationPrerequisites,
  classifyNetworkError
};
