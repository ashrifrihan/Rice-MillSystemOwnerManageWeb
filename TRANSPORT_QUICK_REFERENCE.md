# Transport System - Quick Reference

## 🎯 What Was Implemented

### ✅ Security Fixes
- [x] API keys moved to `.env.local` (no longer hardcoded)
- [x] Firebase Security Rules with role-based access
- [x] GPS coordinate validation
- [x] Error classification and handling

### ✅ Trip Validation
- [x] Prevent vehicle double-booking
- [x] Prevent driver double-booking  
- [x] Prevent order double-assignment
- [x] Vehicle capacity validation
- [x] All required fields validation

### ✅ GPS & Error Handling
- [x] GPS coordinate validation (-90/90 lat, -180/180 lng)
- [x] Connection status monitoring
- [x] Offline detection (after 90 seconds)
- [x] Graceful fallbacks
- [x] Network error classification

### ✅ Notifications
- [x] SMS queue system implemented
- [x] Trip assignment notifications queued
- [x] Driver phone validation

---

## 📚 File Reference

### New Files Created
```
src/utils/tripValidation.js          ← Validation & error handling
TRANSPORT_SYSTEM_SETUP.md            ← Complete documentation
TRANSPORT_QUICK_REFERENCE.md         ← This file
```

### Files Modified
```
src/firebase/config.jsx              ← Environment variables
src/pages/AssignTransport.jsx        ← Validation added
src/pages/TransportGPS.jsx           ← GPS error handling
database.rules.json                  ← Security rules
```

---

## 🚀 How to Use

### 1. Create Trip Assignment
```javascript
// File: AssignTransport.jsx

// User clicks "Assign Transport"
const handleConfirmAssignment = async () => {
  // Validation happens automatically:
  // 1. Fetch active trips
  // 2. Run validateTripAssignment()
  // 3. If valid: Create trip
  // 4. If invalid: Show error message
};
```

### 2. Monitor GPS in Real-Time
```javascript
// File: TransportGPS.jsx

// GPS automatically monitored with:
// - Coordinate validation
// - Connection status checking
// - Automatic offline detection
// - Error recovery
```

### 3. Use Validation Directly
```javascript
import { 
  validateTripAssignment,
  validateVehicleAvailability,
  checkGPSConnectionStatus 
} from '../utils/tripValidation';

// Check vehicle availability
const check = validateVehicleAvailability(vehicleId, activeTrips);
if (!check.isValid) console.error(check.error);

// Check GPS connection
const status = checkGPSConnectionStatus(lastUpdateTime);
if (!status.isOnline) console.warn('GPS offline');
```

---

## 🔍 Testing Scenarios

### Scenario 1: Assign Trip Successfully
```
1. Select order with status "Pending Transport"
2. Select available vehicle
3. Select available driver
4. Enter end location
5. Click "Assign Transport"
✅ Result: Trip created, SMS queued, nav to GPS
```

### Scenario 2: Vehicle Double-Booking
```
1. Create first trip with Vehicle A
2. Try to assign Vehicle A to another order
❌ Result: Error "Vehicle is already assigned to trip..."
```

### Scenario 3: GPS Goes Offline
```
1. Open TransportGPS for active trip
2. Watch driver location update (every 5-10 seconds)
3. Stop GPS updates from driver app
4. Wait 90 seconds
⚠️ Result: Offline indicator appears, last location shown
```

### Scenario 4: Invalid GPS Coordinates
```
1. Backend/test sends invalid GPS (lat: 200, lng: 500)
❌ Result: Invalid data rejected, last valid location shown
```

---

## 📊 Database Structure at a Glance

```
Firebase Realtime Database
├─ trips/
│  └─ TRP-2023-001/
│     ├─ tripId, orderId, driverId, vehicleId
│     ├─ status: "assigned" | "in-transit" | "delivered"
│     └─ owner_email (for filtering)
│
├─ liveLocations/
│  └─ TRP-2023-001/
│     ├─ lat, lng (GPS coordinates)
│     ├─ speed, heading
│     └─ updatedAt (timestamp)
│
├─ orders/
│  └─ ORD-123/
│     ├─ status: "In Transit"
│     ├─ tripId: "TRP-2023-001"
│     └─ assignedDriver, assignedVehicle
│
├─ vehicles/
│  └─ veh-1/
│     ├─ isAvailable: false (when on trip)
│     ├─ currentTripId: "TRP-2023-001"
│     └─ status: "On Trip"
│
├─ workers/
│  └─ drv-1/
│     ├─ isAvailable: false (when busy)
│     ├─ currentTripId: "TRP-2023-001"
│     └─ status: "on-trip"
│
└─ notifications/
   └─ sms_queue/
      └─ {id}/
         ├─ to: "+94 76 234 5678"
         ├─ message: "🚚 New Trip..."
         ├─ status: "pending" → "sent" | "failed"
         └─ tripId: "TRP-2023-001"
```

---

## 🔑 Key Validation Functions

### `validateTripAssignment(assignmentData, activeTrips, vehicle, order)`
```javascript
// Checks everything before trip creation
Returns: { isValid: boolean, errors: [], warnings: [] }

// Example
const result = validateTripAssignment(
  { orderId, vehicleId, driverId, endLocation },
  activeTrips,
  vehicle,
  order
);

if (!result.isValid) {
  // Show result.errors to user
}
```

### `validateVehicleAvailability(vehicleId, activeTrips)`
```javascript
// Prevents assigning same vehicle to multiple trips
Returns: { isValid: true/false, error?: string }
```

### `validateGPSCoordinates(lat, lng)`
```javascript
// Validates GPS before using on map
Returns: { isValid: true/false, error?: string, warning?: string }
```

### `checkGPSConnectionStatus(lastUpdateTime, timeoutMs = 90000)`
```javascript
// Monitors GPS connection health
Returns: { 
  isOnline: true/false,
  status: 'online' | 'unstable' | 'offline' | 'never-connected',
  timeSinceUpdate: ms,
  lastUpdateMinutesAgo: number
}
```

### `classifyNetworkError(error)`
```javascript
// Categorizes errors for better UX
Returns: {
  type: 'network' | 'permission' | 'timeout' | 'quota' | 'auth' | 'unknown',
  message: string,
  isRetryable: boolean,
  suggestion: string
}
```

---

## 🚨 Error Messages Users Might See

| Error | Cause | Fix |
|-------|-------|-----|
| "Vehicle is already assigned" | Double-booking | Wait for vehicle to return |
| "Driver is already assigned" | Driver busy | Select different driver |
| "Order already has a trip" | Order already assigned | Check existing trip |
| "Vehicle capacity exceeded" | Order too heavy | Select larger vehicle |
| "Select an order first" | Missing order | Choose order from list |
| "Assignment failed (network)" | No internet | Check connection, retry |
| "Permission denied" | Firebase rules | Verify user logged in |
| "GPS offline for 5+ minutes" | Driver disconnected | Check driver status |

---

## 🔐 Security Checklist

Before going to production:

- [ ] All API keys in `.env.local` (not in source)
- [ ] `.gitignore` includes `.env.local`
- [ ] Firebase Rules deployed with role-based access
- [ ] Security Rules tested (try unauthorized access)
- [ ] GPS coordinates validated before map display
- [ ] Error messages don't expose sensitive data
- [ ] SMS queue secured (owner_email filter)
- [ ] Timestamps validated (no timezone issues)

---

## 🐛 Debugging Tips

### Check Validation Errors
```javascript
// Open browser console while assigning trip
console.log('Validation result:', validation);
// Shows exactly which checks failed
```

### Monitor Firebase Updates
```javascript
// Firebase Console > Realtime Database
// Watch these paths:
// - trips/{tripId}
// - liveLocations/{tripId}
// - orders/{orderId}
// - vehicles/{vehicleId}
// - workers/{driverId}
```

### GPS Connection Status
```javascript
// In TransportGPS.jsx, check:
const connStatus = checkGPSConnectionStatus(lastLiveUpdate);
console.log('GPS Status:', connStatus);
// Shows if online/offline with exact timing
```

### Network Errors
```javascript
// Catch clause shows:
const errorClass = classifyNetworkError(error);
console.error('Error type:', errorClass.type);
console.error('Suggestion:', errorClass.suggestion);
```

---

## 📞 Common Questions

**Q: How do I know if GPS is working?**
A: Check `lastLiveUpdate` timestamp in TransportGPS. Should update every 5-10 seconds.

**Q: Why can't I assign a vehicle?**
A: Check console for validation errors. Usually: double-booking, capacity issue, or missing fields.

**Q: How does SMS get sent to driver?**
A: SMS queued in Firebase, backend service polls queue and sends via Twilio/SMS provider.

**Q: What if driver loses internet during trip?**
A: Last GPS location shown, "offline" badge displayed, reconnects automatically when internet returns.

**Q: How do I reset a stuck trip?**
A: Manually update Firebase:
- Set trip status to "delivered"
- Set vehicle isAvailable to true, currentTripId to null
- Set driver isAvailable to true, currentTripId to null

---

## 📚 Additional Documentation

For detailed information, see:
- `TRANSPORT_SYSTEM_SETUP.md` - Complete setup guide
- `src/utils/tripValidation.js` - Comments in code
- `database.rules.json` - Security rules documentation
- Firebase Console - Real-time database structure

---

**Last Updated:** December 27, 2025  
**Version:** 2.0  
**Status:** ✅ Production Ready
