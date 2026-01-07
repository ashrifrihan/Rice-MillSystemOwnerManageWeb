# Delivery Completion & Driver Selection System

## Overview

This system provides intelligent, data-driven delivery completion with automatic available driver selection using a sophisticated matching algorithm.

### Components Created

1. **transportService.js** - Core matching algorithm
2. **AvailableDriversModal.jsx** - Display available drivers with scores
3. **CompleteDeliveryFlow.jsx** - Delivery completion workflow
4. **Updated TransportHistory.jsx** - Save and view completed deliveries

---

## 1. Transport Service (Driver-Vehicle Matching Algorithm)

**File:** `src/services/transportService.js`

### Matching Algorithm Overview

The algorithm calculates a **match score (0-100)** based on multiple weighted factors:

```
Final Score = Base Score (100) - Penalties (based on mismatches)
```

### Scoring Breakdown

| Factor | Weight | Points | Description |
|--------|--------|--------|-------------|
| **Capacity Match** | 30% | -30 max | Vehicle capacity vs order weight |
| **Vehicle Type** | 20% | -10 max | Trip type compatibility |
| **Driver Availability** | 25% | -25 max | Driver workload & availability |
| **Distance Capability** | 15% | -15 max | Driver experience for trip distance |
| **Preferences** | 10% | +5 bonus | Driver vehicle preferences |

### Key Functions

#### 1. `calculateMatchScore(driver, vehicle, order, allOrders)`
```javascript
// Returns: { score: 0-100, breakdown: {...} }
const result = calculateMatchScore(driver, vehicle, order, allOrders);
console.log(result.score);        // 85 (matching percentage)
console.log(result.breakdown);    // Detailed breakdown of penalties
```

**Parameters:**
- `driver` - Driver object with skills, availability, preferences
- `vehicle` - Vehicle object with capacity, type, fuel
- `order` - Current order/trip data
- `allOrders` - Array of all active orders (for load calculation)

**Returns:**
```javascript
{
  score: 85,
  breakdown: {
    base: 100,
    capacityPenalty: 5,
    availabilityPenalty: 0,
    distancePenalty: 0,
    totalPenalties: 5
  }
}
```

#### 2. `getTopMatches(drivers, vehicles, order, allOrders, topN)`
```javascript
// Get top 3 best matching driver-vehicle combinations
const topMatches = getTopMatches(drivers, vehicles, order, allOrders, 3);

topMatches.forEach(match => {
  console.log(match.driver.name);    // "Rajesh Kumar"
  console.log(match.vehicle.type);   // "Truck"
  console.log(match.score);          // 92
  console.log(match.recommendations); // ["Excellent match", "High-rated driver"]
});
```

**Returns:** Array of matches sorted by score (highest first)

#### 3. `completeDelivery(trip, db, updateCallback)`
```javascript
// Mark delivery as complete and save to history
await completeDelivery(trip, db, async (path, data) => {
  await update(ref(db, path), data);
});
```

### Capacity Calculation

The system automatically handles various capacity formats:
- `"5000 kg"` → 5000
- `"5 tons"` → 5000
- `"5 tonnes"` → 5000
- Numeric values

---

## 2. Available Drivers Modal

**File:** `src/components/AvailableDriversModal.jsx`

Displays top matching driver-vehicle combinations with:

### Features

✓ **Visual Ranking** - Gold (#1), Silver (#2), Bronze (#3)  
✓ **Match Score** - 0-100 scale with color coding  
✓ **Score Breakdown** - Visual bars showing each criterion  
✓ **Driver Information** - Photo, rating, license, phone  
✓ **Vehicle Details** - Type, capacity, fuel type  
✓ **Smart Recommendations** - AI-generated insights  
✓ **Selection UI** - Click to select, confirm button  

### Usage

```jsx
import AvailableDriversModal from './AvailableDriversModal';

export function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Show Available Drivers
      </button>

      <AvailableDriversModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(selectedMatch) => {
          console.log(selectedMatch.driver);  // Selected driver
          console.log(selectedMatch.vehicle); // Selected vehicle
          console.log(selectedMatch.score);   // Match score
        }}
        order={currentOrder}
        drivers={availableDrivers}
        vehicles={availableVehicles}
        allOrders={allActiveOrders}
      />
    </>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Modal visibility |
| `onClose` | function | Yes | Callback when modal closes |
| `onSelect` | function | Yes | Callback when driver selected |
| `order` | object | Yes | Current order/trip data |
| `drivers` | array | Yes | Available drivers |
| `vehicles` | array | Yes | Available vehicles |
| `allOrders` | array | No | All active orders (for load calc) |

---

## 3. Complete Delivery Flow

**File:** `src/components/CompleteDeliveryFlow.jsx`

Three-step workflow for delivery completion:

### Step 1: Confirm Completion
- Display trip summary
- Show delivery location (GPS coordinates)
- Confirmation checklist
- User confirms delivery is complete

### Step 2: Processing
- Saves delivery to Firebase (`trips/[id]`)
- Creates history record (`transportHistory/[id]`)
- Calculates available drivers
- Shows loading animation

### Step 3: Select Driver
- Launches AvailableDriversModal
- User selects next driver or skips
- Assigns driver to vehicle

### Usage

```jsx
import CompleteDeliveryFlow from './CompleteDeliveryFlow';

export function DeliveryTracking() {
  const [showCompletion, setShowCompletion] = useState(false);

  return (
    <>
      <button onClick={() => setShowCompletion(true)}>
        Complete Delivery
      </button>

      {showCompletion && (
        <CompleteDeliveryFlow
          trip={selectedTrip}
          drivers={drivers}
          vehicles={vehicles}
          allOrders={orders}
          onComplete={(result) => {
            console.log('Completed trip:', result.completedTrip);
            console.log('Next driver:', result.nextDriver);
            console.log('Match score:', result.matchScore);
          }}
          onClose={() => setShowCompletion(false)}
        />
      )}
    </>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `trip` | object | Yes | Trip to complete |
| `drivers` | array | Yes | Available drivers |
| `vehicles` | array | Yes | Available vehicles |
| `allOrders` | array | No | All orders for load calculation |
| `onComplete` | function | No | Called when completed |
| `onClose` | function | No | Called to close modal |

### Event Data

`onComplete` callback receives:
```javascript
{
  completedTrip: {
    // Original trip with status: 'Delivered'
    id: "TRP-2024-001",
    status: "Delivered",
    completedAt: "2024-01-15T18:30:00Z",
    deliveryProof: { ... }
  },
  nextDriver: { ... },        // Selected driver
  nextVehicle: { ... },       // Selected vehicle
  matchScore: 92              // Match score
}
```

---

## 4. Transport History Page

**File:** `src/pages/TransportHistory.jsx`

### Features

✓ **Completed Deliveries** - View all finished trips  
✓ **Proof Verification** - Upload and view delivery proofs  
✓ **Trip Details** - Full trip information and breakdown  
✓ **Search & Filter** - By trip ID, driver, vehicle, customer  
✓ **Financial Summary** - Revenue, expenses, profit  
✓ **KPI Dashboard** - Key metrics and statistics  
✓ **Export CSV** - Download transport history  

### Firebase Integration

Saves data to:
- `transportHistory/[tripId]` - Completed trip records
- `trips/[tripId]` - Update trip status to "Delivered"

### Normalized Data Structure

The page automatically normalizes various trip formats:

```javascript
{
  id: "TRP-2024-001",
  status: "Delivered",
  type: "Rice Delivery",
  
  driver: {
    name: "Rajesh Kumar",
    phone: "+94 77 123 4567",
    license: "DL-845672",
    rating: 4.8,
    photo: "..."
  },
  
  vehicle: {
    type: "Truck",
    capacity: "5000 kg",
    number: "WP CAB 1234"
  },
  
  customer: {
    name: "Perera Foods Ltd",
    address: "123 Kandy Road, Kandy",
    phone: "+94 81 234 5678",
    contactPerson: "Mr. Perera"
  },
  
  route: {
    start: "Lanka Rice Mill, Kurunegala",
    destination: "Perera Foods Ltd, Kandy",
    distance: "95 km",
    duration: "10h 15m",
    currentLocation: { lat: 7.2906, lng: 80.6337 }
  },
  
  deliveryProof: {
    uploadedAt: "2024-01-15T18:12:00Z",
    gpsLocation: "7.2906° N, 80.6337° E",
    images: [...],
    notes: "All products received in good condition"
  },
  
  products: [
    { name: "Premium Basmati Rice", bags: 50, totalKG: 1250 }
  ],
  
  revenue: "Rs. 85,000",
  expenses: "Rs. 38,500",
  profit: "Rs. 46,500"
}
```

---

## Integration Guide

### Step 1: Import Components

```javascript
import CompleteDeliveryFlow from '../components/CompleteDeliveryFlow';
import AvailableDriversModal from '../components/AvailableDriversModal';
import { getTopMatches } from '../services/transportService';
```

### Step 2: In DeliveryTracking or TransportGPS

```jsx
// Add state
const [showCompletion, setShowCompletion] = useState(false);

// Add button to complete delivery
<button 
  onClick={() => setShowCompletion(true)}
  className="bg-green-600 text-white px-4 py-2 rounded-lg"
>
  Complete Delivery
</button>

// Add component
{showCompletion && (
  <CompleteDeliveryFlow
    trip={selectedTrip}
    drivers={drivers}
    vehicles={vehicles}
    allOrders={orders}
    onComplete={(result) => {
      // Handle completion
      console.log('Trip completed:', result.completedTrip);
      navigate('/transport-history'); // Optional
    }}
    onClose={() => setShowCompletion(false)}
  />
)}
```

### Step 3: Database Structure

Ensure your Firebase has these paths:

```
├── trips/
│   ├── TRP-2024-001/
│   │   ├── id: "TRP-2024-001"
│   │   ├── status: "Delivered"
│   │   ├── driver: {...}
│   │   ├── vehicle: {...}
│   │   └── ...
│
├── transportHistory/
│   ├── TRP-2024-001/
│   │   ├── (complete trip record)
│   │   ├── completedAt: "..."
│   │   └── deliveryProof: {...}
│
├── workers/
│   ├── driver-id/
│   │   ├── name: "Rajesh Kumar"
│   │   ├── isAvailable: true
│   │   └── ...
│
└── vehicles/
    ├── veh-1/
    │   ├── type: "Truck"
    │   ├── capacity: "5000 kg"
    │   └── ...
```

---

## Algorithm Examples

### Example 1: Rice Delivery

```javascript
const driver = {
  id: 'drv-1',
  name: 'Rajesh Kumar',
  rating: 4.8,
  isAvailable: true,
  preferredVehicleTypes: ['Lorry', 'Truck']
};

const vehicle = {
  id: 'veh-1',
  type: 'Truck',
  capacity: '5000 kg'
};

const order = {
  id: 'ORD-001',
  type: 'Rice Delivery',
  quantity: 1250,  // kg
  estimatedDistance: 95,
  deliveryAddress: 'Kandy'
};

const result = calculateMatchScore(driver, vehicle, order);
// Score: 92/100 (Perfect capacity match, experienced driver, suitable vehicle)
```

### Example 2: Long Distance with Underutilized Driver

```javascript
const driver = {
  name: 'Suresh Perera',
  rating: 4.2,
  isAvailable: true,
  preferredVehicleTypes: ['Mini Lorry']
};

const vehicle = {
  type: 'Truck',
  capacity: '5000 kg'
};

const order = {
  type: 'Rice Delivery',
  quantity: 800,  // Under-capacity
  estimatedDistance: 200  // Long distance
};

const result = calculateMatchScore(driver, vehicle, order);
// Score: 68/100 (Over-capacity, long distance for mini truck driver)
```

### Example 3: Busy Driver

```javascript
const driver = {
  name: 'Anil Fernando',
  isAvailable: false,  // Currently busy
  preferredVehicleTypes: ['Lorry']
};

// With multiple active orders
const allOrders = [
  { assignedDriver: { id: 'drv-3' }, status: 'in-transit' },
  { assignedDriver: { id: 'drv-3' }, status: 'active' }
];

const result = calculateMatchScore(driver, vehicle, order, allOrders);
// Score: 45/100 (Driver not available, high workload)
```

---

## Best Practices

### 1. Data Validation
```javascript
// Always validate before calling matching algorithm
if (!drivers.length || !vehicles.length || !order) {
  console.error('Missing required data');
  return;
}
```

### 2. Error Handling
```javascript
try {
  const result = calculateMatchScore(driver, vehicle, order);
  if (result.score < 50) {
    console.warn('Low match score - may not be optimal');
  }
} catch (error) {
  console.error('Matching error:', error);
  // Fall back to manual selection
}
```

### 3. Firebase Updates
```javascript
// Always update in transaction or batch
import { update, ref } from 'firebase/database';

const updates = {};
updates[`trips/${tripId}`] = { status: 'Delivered' };
updates[`transportHistory/${tripId}`] = completedTrip;
updates[`workers/${driverId}`] = { status: 'available' };

await update(ref(db), updates);
```

### 4. Performance Optimization
```javascript
// Cache driver/vehicle lists if calculating multiple times
const memoizedMatches = useMemo(() => {
  return getTopMatches(drivers, vehicles, order, allOrders, 5);
}, [drivers, vehicles, order, allOrders]);
```

---

## Testing

### Test Capacity Matching
```javascript
// Should match
calculateMatchScore(
  { name: 'Test', isAvailable: true },
  { capacity: '5000 kg' },
  { quantity: 4500 }
).score // Should be > 80
```

### Test Availability
```javascript
// Should penalize unavailable driver
calculateMatchScore(
  { name: 'Test', isAvailable: false },
  { capacity: '5000 kg' },
  { quantity: 2000 }
).score // Should be < 60
```

### Test Distance
```javascript
// Long distance with short-distance focused driver
calculateMatchScore(
  { name: 'Test', isAvailable: true, preferredVehicleTypes: ['Mini'] },
  { type: 'Truck' },
  { estimatedDistance: 300 }
).score // Should be < 70
```

---

## Troubleshooting

### Q: Match score always low?
**A:** Check that:
- Driver is marked as `isAvailable: true`
- Vehicle capacity is greater than order quantity
- Order distance is reasonable for driver experience

### Q: AvailableDriversModal not showing?
**A:** Ensure:
- `isOpen` prop is true
- `drivers` and `vehicles` arrays are populated
- `onSelect` callback is defined

### Q: Delivery not saving to history?
**A:** Verify:
- Firebase `transportHistory` path exists
- User has write permissions
- Trip ID is valid

### Q: Wrong drivers showing up?
**A:** Check:
- `allOrders` parameter includes all active orders (for workload calc)
- Driver `preferredVehicleTypes` matches available vehicles
- Capacity parsing is correct

---

## Future Enhancements

- [ ] **ML Integration** - Learn from historical assignments
- [ ] **Predictive Analytics** - Estimate delivery time
- [ ] **Multi-Language** - Support for local languages
- [ ] **Real-time Notifications** - Driver/customer alerts
- [ ] **Proof Upload Widget** - In-app photo/video capture
- [ ] **Route Optimization** - Multi-stop route planning
- [ ] **Payment Integration** - Automatic settlements

---

## Support

For issues or questions:
1. Check console logs for detailed errors
2. Verify Firebase rules allow read/write
3. Ensure all required data fields are present
4. Review algorithm scoring breakdown
