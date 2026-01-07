# Employee Verification Guide 🔍

## How to Verify Employees are Stored in Firebase

### **Method 1: Browser Console (Easiest)**

1. **Open your app** → Add an employee
2. **Press F12** → Open Developer Console
3. **Look for messages:**
   ```
   ✅ ALL EMPLOYEES FROM FIREBASE: [...]
   ✅ EMPLOYEE SAVED TO FIREBASE: {...}
   ```
4. **This proves:**
   - Data IS being saved to Firebase
   - Data structure is correct
   - All fields are stored

### **Method 2: Debug View Panel (Recommended)**

1. **Click** "🔍 View All Employees (Debug)" button
2. **See:**
   - List of ALL employees (including pending)
   - Click any employee to see FULL data
   - Document metadata stored
   - Raw JSON export

### **Method 3: Firebase Console (Manual Verification)**

1. Go to: `https://console.firebase.google.com/`
2. Select your project
3. Navigate: **Realtime Database** → **Data**
4. Expand: **workers**
5. You'll see:
   ```
   workers/
   ├── -OkXyZ123abc
   │   ├── name: "Kamal Perera"
   │   ├── type: "driver"
   │   ├── status: "pending"
   │   ├── documents:
   │   │   ├── nicFront: { provided: true, fileName: "..." }
   │   │   └── nicBack: { provided: true, fileName: "..." }
   │   └── ...
   ```

---

## Why Only One Person Shows in Main Table?

### **This is CORRECT behavior!** ✅

**Active Employees Table shows only:** `status === 'active'`

**Employee visibility:**
- ✅ General Workers → `status: 'active'` → **Visible in table**
- ✅ Supervisors → `status: 'active'` → **Visible in table**
- 🔴 Drivers → `status: 'pending'` → **NOT visible (waiting admin approval)**

### **How to see pending drivers:**

1. Click **"Pending Approvals"** button (Admin only)
2. Or use **Debug View** to see all employees

---

## Data Structure Confirmation

### Employee stored as:
```json
{
  "id": "-OkXyZ123abc",
  "name": "Kamal Perera",
  "nic": "901234567V",
  "phone": "+94771234567",
  "type": "driver",
  "status": "pending",
  "documents": {
    "nicFront": {
      "provided": true,
      "fileName": "nic_front.jpg",
      "verified": false
    },
    "nicBack": {
      "provided": true,
      "fileName": "nic_back.jpg",
      "verified": false
    },
    "licenseFront": {
      "provided": true,
      "fileName": "license.jpg",
      "verified": false
    }
  }
}
```

---

## Console Output Example

After adding an employee, you'll see:

```
✅ EMPLOYEE SAVED TO FIREBASE: {
  workerId: "-OkXyZ123abc"
  name: "Kamal Perera"
  type: "driver"
  status: "pending"
  documents: {...}
}

✅ ALL EMPLOYEES FROM FIREBASE: [
  { name: "Kamal Perera", type: "driver", status: "pending" }
  { name: "John Worker", type: "worker", status: "active" }
]
```

---

## Viva Answer (Use This!)

**"When an employee is added, the data is immediately persisted to Firebase Realtime Database with a unique auto-generated ID. General workers and supervisors are activated immediately and appear in the attendance table. Drivers are marked as pending and require admin approval before they become active. All employee data including personal information, role, status, and document metadata are stored in Firebase under the `/workers` node for easy retrieval and management."**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No console logs | Check Firebase connection in config.jsx |
| Data not appearing in Debug View | Refresh page (F5) or check Firebase rules |
| Employee saved but not visible | Check if they're a driver (pending status) |
| Documents showing as "Missing" | Check if files were uploaded in modal |

---

**All data is being saved correctly. The system is working as designed!** ✅
