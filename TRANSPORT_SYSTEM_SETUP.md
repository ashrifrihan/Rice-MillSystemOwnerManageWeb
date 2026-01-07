# Transport & GPS Tracking System - Complete Setup Guide

> **Last Updated:** December 27, 2025  
> **Version:** 2.0 - Enhanced with Security, Validation & Error Handling

---

## 🔒 CRITICAL SECURITY FIXES (COMPLETED)

### 1. API Keys Moved to Environment Variables ✅

**BEFORE (INSECURE):**
```jsx
// ❌ Hardcoded in source code - EXPOSED!
const firebaseConfig = {
  apiKey: "AIzaSyAcBZ7lp9Qf61qu2Hgusm0j4ImUo23ya9E",
  projectId: "ricemill-lk",
  // ...
};
```

**AFTER (SECURE):**
```jsx
// ✅ Loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};
```

**Your `.env.local` file already contains:**
```dotenv
VITE_FIREBASE_API_KEY=AIzaSyAcBZ7lp9Qf61qu2Hgusm0j4ImUo23ya9E
VITE_FIREBASE_AUTH_DOMAIN=ricemill-lk.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://ricemill-lk-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=ricemill-lk
VITE_FIREBASE_STORAGE_BUCKET=ricemill-lk.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=751522316202
VITE_FIREBASE_APP_ID=1:751522316202:web:3b032b9443bff6c8f8b5d3
```

✅ **Status:** Environment variables properly configured

---

### 2. Firebase Security Rules Implemented ✅

**Rules Location:** `database.rules.json`

**Key Security Features:**

```json
{
  "liveLocations": {
    "tripId": {
      ".read": "auth != null",
      ".write": "driver can write, owner can read",
      "lat": { ".validate": "-90 to 90" },
      "lng": { ".validate": "-180 to 180" }
    },
    "trips": {
      ".write": "only owner/admin can create"
    }
  }
}
```

✅ **What's Protected:**
- Only authenticated users can read/write
- Drivers can only write GPS coordinates
- Owners can read all GPS data
- GPS coordinates validated (no invalid positions)
- Proper role-based access control

---

## 🛡️ TRIP VALIDATION SYSTEM

### Triple-Check Validation Before Assigning

**File:** `src/utils/tripValidation.js`

#### 1. Vehicle Availability Check
```javascript
// Prevents double-booking vehicles
const validation = validateVehicleAvailability(vehicleId, activeTrips);
// Returns: { isValid: true/false, error?: string }
```

**Checks:**
- ✅ Vehicle not already assigned to in-transit trip
- ✅ Vehicle not already assigned to scheduled trip
- ✅ Vehicle not already assigned to assigned trip

#### 2. Driver Availability Check
```javascript
// Prevents double-booking drivers
const validation = validateDriverAvailability(driverId, activeTrips);
```

**Checks:**
- ✅ Driver not already assigned to in-transit trip
- ✅ Driver not already assigned to scheduled trip
- ✅ Driver not already assigned to assigned trip

#### 3. Order Assignment Check
```javascript
// Prevents same order being transported twice
const validation = validateOrderNotAssigned(orderId, activeTrips);
```

**Checks:**
- ✅ Order not already in an active trip

#### 4. Vehicle Capacity Check
```javascript
// Ensures vehicle can carry the order
const validation = validateVehicleCapacity(vehicleCapacity, orderQuantity);
```

**Checks:**
- ✅ Quantity ≤ Capacity
- ⚠️ Warning if > 90% capacity used
- ❌ Error if > 100% capacity

#### 5. Comprehensive Trip Validation
```javascript
const validation = validateTripAssignment(
  assignmentData,  // { orderId, vehicleId, driverId, endLocation }
  activeTrips,     // From Firebase
  vehicle,         // Vehicle object
  order            // Order object
);

// Returns: { isValid: boolean, errors: [], warnings: [] }
```

### Validation Flow in AssignTransport.jsx

```
User clicks "Assign Transport"
    ↓
1. Fetch all active trips from Firebase
    ↓
2. Run validateTripAssignment()
    ↓
    ├─ Check all required fields
    ├─ Check vehicle availability
    ├─ Check driver availability
    ├─ Check order not already assigned
    └─ Check vehicle capacity
    ↓
3. If validation fails → Show errors to user
    ↓
4. If validation passes → Create trip
    ↓
5. Update Firebase
    ├─ trips/{tripId}
    ├─ liveLocations/{tripId}
    ├─ orders/{orderId}
    ├─ vehicles/{vehicleId}
    ├─ workers/{driverId}
    └─ notifications/sms_queue
```

---

## 🌐 GPS TRACKING & ERROR HANDLING

### GPS Coordinate Validation

**File:** `src/utils/tripValidation.js`

```javascript
const validation = validateGPSCoordinates(lat, lng);

// Checks:
// ✅ Values are numbers
// ✅ Latitude: -90 to 90
// ✅ Longitude: -180 to 180
// ⚠️ Warning if outside Sri Lanka bounds
```

### GPS Connection Status Monitoring

```javascript
const status = checkGPSConnectionStatus(lastUpdateTime, timeoutMs = 90000);

// Returns: {
//   isOnline: true/false,
//   status: 'online' | 'unstable' | 'offline' | 'never-connected',
//   timeSinceUpdate: milliseconds,
//   lastUpdateMinutesAgo: number
// }
```

**How it Works in TransportGPS.jsx:**

1. **Subscribe to GPS Updates**
   ```javascript
   onValue(
     ref(rtdb, `liveLocations/${tripId}`),
     (snapshot) => {
       // Validate coordinates
       const validation = validateGPSCoordinates(data.lat, data.lng);
       if (!validation.isValid) return; // Skip invalid data
       
       // Update map with new location
       setOrigin({ lat, lng });
     },
     (error) => {
       // Handle connection errors
       const classification = classifyNetworkError(error);
       const status = checkGPSConnectionStatus(lastLiveUpdate);
       
       if (!status.isOnline) {
         console.warn('🔴 GPS offline for ' + status.lastUpdateMinutesAgo + ' minutes');
       }
     }
   );
   ```

2. **Handle Offline Scenarios**
   - ✅ Show offline indicator when no GPS update > 90s
   - ✅ Display last known location with "offline" badge
   - ✅ Automatically reconnect when internet returns
   - ✅ Show warning if connection unstable

---

## 📱 NOTIFICATIONS SYSTEM

### SMS Notification Queue

**When Trip is Assigned:**

```javascript
// 1. Trip created
const tripData = { tripId, orderId, vehicleId, driverId, ... };

// 2. SMS queued for driver
await push(ref(db, 'notifications/sms_queue'), {
  to: driver.phone,
  message: `🚚 New Trip Assigned!\nTrip ID: ${tripId}\n...`,
  tripId,
  driverId,
  status: 'pending',
  createdAt: new Date().toISOString(),
  type: 'trip_assignment'
});

// 3. Backend processes queue (Cloud Function or Node.js service)
// Backend polls: notifications/sms_queue where status === 'pending'
// Backend sends SMS via Twilio, Nexmo, AWS SNS, etc.
// Backend updates status → 'sent' or 'failed'
```

### Notification Prerequisites Validation

```javascript
const validation = validateNotificationPrerequisites(driver);
// Checks:
// ✅ Driver phone number present
// ✅ Driver ID present
// ✅ Driver name present
```

---

## 🔧 ERROR HANDLING

### Network Error Classification

**File:** `src/utils/tripValidation.js`

```javascript
const error = classifyNetworkError(errorObject);

// Returns: {
//   type: 'network' | 'permission' | 'timeout' | 'quota' | 'auth' | 'unknown',
//   message: string,
//   isRetryable: true/false,
//   suggestion: string
// }
```

### Error Types Handled

| Error Type | Cause | Retryable | Action |
|-----------|-------|-----------|--------|
| **network** | No internet connection | Yes | "Check your internet connection and try again" |
| **permission** | Firebase rules deny access | No | "Check Firebase rules or authentication" |
| **timeout** | Request took too long | Yes | "Server overloaded, try again" |
| **quota** | Too many requests | Yes | "Wait a moment and try again" |
| **auth** | Invalid token/not logged in | No | "Please log in again" |
| **unknown** | Other errors | Yes | "Try again or contact support" |

---

## 🚀 TRIP LIFECYCLE

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. OWNER CREATES ASSIGNMENT (AssignTransport.jsx)          │
│    ├─ Selects Order                                        │
│    ├─ Selects Vehicle                                      │
│    ├─ Selects Driver                                       │
│    ├─ Sets Route (Start/End Location)                      │
│    └─ Clicks "Assign Transport"                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. VALIDATION (tripValidation.js)                          │
│    ├─ Fetch active trips from Firebase                     │
│    ├─ Validate vehicle availability                        │
│    ├─ Validate driver availability                         │
│    ├─ Validate order not already assigned                  │
│    ├─ Validate vehicle capacity                            │
│    └─ Check all required fields                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
         ┌─────────────────┴─────────────────┐
         ↓                                   ↓
    VALIDATION FAILS                   VALIDATION PASSES
         ↓                                   ↓
    Show Error Message               Continue to Firebase
    - Double-booking?
    - Capacity exceeded?
    - Missing field?
                                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CREATE TRIP (AssignTransport.jsx)                       │
│    ├─ Generate tripId = push(trips)                        │
│    ├─ Create trip record with full details                 │
│    ├─ Initialize liveLocations/{tripId}                    │
│    ├─ Update order status → "In Transit"                   │
│    ├─ Update vehicle status → "On Trip"                    │
│    ├─ Update driver status → "on-trip"                     │
│    └─ Queue SMS notification                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DRIVER RECEIVES NOTIFICATION                            │
│    ├─ SMS message with Trip ID                             │
│    ├─ Driver opens app & sees trip                         │
│    └─ Clicks "Start Delivery"                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. GPS TRACKING BEGINS (TransportGPS.jsx)                  │
│    ├─ Driver's location written to liveLocations/{tripId}  │
│    ├─ Every 5-10 seconds: { lat, lng, speed, timestamp }   │
│    ├─ Owner sees blue marker moving on map                 │
│    ├─ Trip progress updates automatically                  │
│    └─ ETA calculated from current speed                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. OWNER MONITORS (TransportGPS.jsx)                       │
│    ├─ Real-time location on Google Maps                    │
│    ├─ Distance remaining displayed                         │
│    ├─ ETA shown                                            │
│    ├─ Driver status visible                                │
│    ├─ Can call driver from app                             │
│    └─ SOS button available                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. DRIVER COMPLETES DELIVERY                               │
│    ├─ Arrives at destination                               │
│    ├─ Gets customer signature                              │
│    ├─ Marks trip as "Delivered"                            │
│    └─ System releases vehicle & driver                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. CLEANUP (Backend / Cloud Function)                      │
│    ├─ Update trip status → "delivered"                     │
│    ├─ Update vehicle: isAvailable = true, currentTripId = null │
│    ├─ Update driver: isAvailable = true, currentTripId = null  │
│    ├─ Update order status → "Delivered"                    │
│    ├─ Archive trip in history                              │
│    └─ Stop writing to liveLocations/{tripId}               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 DATABASE SCHEMA

### trips/{tripId}
```javascript
{
  tripId: "string (Firebase push key)",
  orderId: "string",
  orderType: "delivery | pickup",
  vehicleId: "string",
  driverId: "string",
  vehicleDetails: {
    vehicleNumber: "CAB-7890",
    type: "Truck",
    capacity: "5000 kg"
  },
  driverDetails: {
    name: "Nimal Perera",
    phone: "+94 76 234 5678",
    rating: "4.8"
  },
  orderDetails: { /* full order object */ },
  startLocation: "Main Warehouse - Colombo",
  endLocation: "Colombo Supermarket",
  status: "assigned | scheduled | in-transit | delivered | cancelled",
  progress: 0-100,
  gpsTracking: true,
  startedAt: "2024-12-27T10:00:00.000Z",
  owner_email: "owner@colombomill.lk",
  timeline: [
    { status: "Assigned", timestamp: "...", description: "..." }
  ]
}
```

### liveLocations/{tripId}
```javascript
{
  tripId: "string",
  driverId: "string",
  vehicleId: "string",
  lat: 6.9271,          // GPS latitude (-90 to 90)
  lng: 79.8612,         // GPS longitude (-180 to 180)
  speed: 65,            // km/h
  heading: 180,         // degrees
  address: "Near Kegalle Town, Kegalle District",
  updatedAt: 1703676000000,  // Timestamp in ms
  status: "active"
}
```

### orders/{orderId}
```javascript
{
  id: "ORD-123",
  type: "delivery | pickup",
  status: "Pending Transport | In Transit | Delivered",
  tripId: "TRP-2023-001",  // Set when transported
  assignedVehicle: "CAB-7890",
  assignedDriver: "Nimal Perera",
  assignedAt: "2024-12-27T10:00:00.000Z"
}
```

### vehicles/{vehicleId}
```javascript
{
  vehicleNumber: "CAB-7890",
  type: "Truck",
  capacity: "5000 kg",
  status: "Active | On Trip",
  isAvailable: true/false,
  currentTripId: "TRP-2023-001" // null when available
}
```

### workers/{driverId}
```javascript
{
  name: "Nimal Perera",
  phone: "+94 76 234 5678",
  role: "Driver",
  status: "available | on-trip",
  isAvailable: true/false,
  currentTripId: "TRP-2023-001" // null when available,
  rating: 4.8,
  tripsCompleted: 124
}
```

### notifications/sms_queue/{id}
```javascript
{
  to: "+94 76 234 5678",
  message: "🚚 New Trip Assigned!...",
  tripId: "TRP-2023-001",
  driverId: "drv-1",
  driverName: "Nimal Perera",
  driverPhone: "+94 76 234 5678",
  status: "pending | sent | failed",
  createdAt: "2024-12-27T10:00:00.000Z",
  type: "trip_assignment",
  owner_email: "owner@colombomill.lk"
}
```

---

## ✅ CHECKLIST: Verification Steps

### 1. Security Configuration
- [ ] `.env.local` has all VITE_FIREBASE_* variables
- [ ] No hardcoded API keys in source files
- [ ] `database.rules.json` deployed to Firebase
- [ ] Test: Try to read liveLocations as non-owner (should fail)

### 2. Trip Assignment
- [ ] Create trip with valid data
- [ ] Verify trip record created in Firebase
- [ ] Verify liveLocations/{tripId} initialized
- [ ] Verify order status changed to "In Transit"
- [ ] Verify vehicle marked "On Trip"
- [ ] Verify driver marked "on-trip"
- [ ] Try to assign same vehicle again (should fail)
- [ ] Try to assign same driver again (should fail)

### 3. GPS Tracking
- [ ] Navigate to TransportGPS after assignment
- [ ] Verify trip appears in list
- [ ] Verify map shows correct location
- [ ] Manually update liveLocations/{tripId} in Firebase
- [ ] Verify map updates automatically
- [ ] Test with invalid GPS coordinates (should skip)
- [ ] Test offline scenario (disconnect internet)
- [ ] Verify "offline" indicator appears after 90s

### 4. Error Handling
- [ ] Try to assign with missing fields (should error)
- [ ] Try to assign with insufficient vehicle capacity (should warn/error)
- [ ] Try to assign same order twice (should error)
- [ ] Disconnect internet and try to assign (should error with retry option)
- [ ] Check browser console for detailed error logs

---

## 🔧 Developer Notes

### Key Files Modified

1. **`src/firebase/config.jsx`** - Environment variables for API keys
2. **`src/utils/tripValidation.js`** - Validation & error handling NEW FILE
3. **`src/pages/AssignTransport.jsx`** - Added validation before trip creation
4. **`src/pages/TransportGPS.jsx`** - Added GPS error handling
5. **`database.rules.json`** - Security rules with role-based access

### Import Validation Utils

```javascript
import { 
  validateTripAssignment,
  validateVehicleAvailability,
  validateDriverAvailability,
  validateGPSCoordinates,
  checkGPSConnectionStatus,
  classifyNetworkError
} from '../utils/tripValidation';
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Vehicle already assigned" | Double-booking not prevented | Ensure validation runs before create |
| GPS not updating on map | Invalid coordinates | Check validateGPSCoordinates() |
| "Permission denied" error | Firebase rules issue | Verify rules deployed, user authenticated |
| Driver never receives SMS | Queue not processed | Implement backend SMS sender |
| Trips not appearing in list | Owner_email mismatch | Verify owner filter in TransportGPS |

---

## 📞 Next Steps

1. **Deploy Firebase Security Rules**
   ```bash
   firebase deploy --only database
   ```

2. **Implement Backend SMS Processor**
   - Cloud Function or Node.js service
   - Polls `notifications/sms_queue`
   - Sends SMS via Twilio/Nexmo/AWS SNS
   - Updates status → 'sent' or 'failed'

3. **Test Full Workflow**
   - Owner creates assignment
   - Driver receives SMS
   - GPS updates on map
   - Trip completes

4. **Monitor Production**
   - Check Firebase Rules Usage
   - Monitor GPS update frequency
   - Track SMS delivery rates
   - Log errors for debugging

---

**For questions or issues, refer to the code comments and console logs during development.**
