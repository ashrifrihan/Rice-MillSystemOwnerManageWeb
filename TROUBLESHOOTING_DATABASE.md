# Database Connection Fix

## Issues Identified and Fixed

### 1. **Multiple Firebase Configurations**
Your project has two Firebase configuration files:
- `src/firebase/index.js` - Uses **environment variables** (.env.local)
- `src/firebase/config.jsx` - Uses **hardcoded credentials**

### 2. **Import Inconsistency**  
Different pages were importing from different sources:
- Some pages: `import { db } from '../firebase'` → Uses index.js (Realtime Database with env vars)
- Other pages: `import { rtdb } from '../firebase/config'` → Uses config.jsx (hardcoded)

### 3. **Solution Applied**
Updated seed and check utilities to explicitly use `'../firebase/index'` which reads from your `.env.local` file with the correct credentials.

## How to Use

### Step 1: Open Settings Page
Navigate to **Settings → Business Tab**

### Step 2: Check Database Status
1. Click **"Check Database"** button
2. This will show you exactly what data exists in each collection:
   - Products
   - Customers
   - Orders
   - Vehicles
   - Loans
   - Workers
   - Stock Updates

### Step 3: Interpret Results

If you see:
```
✓ products: 4 items
✓ customers: 3 items
✓ orders: 3 items
...
```
**Data exists!** The problem is that pages aren't displaying it.

If you see:
```
✗ products: Empty
✗ customers: Empty
...
```
**Data is missing!** Click "Seed Database" to add sample data.

### Step 4: Seed Database (if needed)
If collections are empty:
1. Click **"Seed Database"** button
2. Wait for confirmation
3. Click **"Check Database"** again to verify

## Troubleshooting

### Problem: "Data already exists" but pages show nothing

This means data is in Firebase but pages can't fetch it. Possible causes:

#### A. **Authentication Required**
Check Firebase Realtime Database Rules in Firebase Console:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
⚠️ For development only! Use proper auth rules in production.

#### B. **Wrong Firebase Project**
Verify `.env.local` has correct Firebase credentials:
```env
VITE_FIREBASE_API_KEY=AIzaSyAcBZ7lp9Qf61qu2Hgusm0j4ImUo23ya9E
VITE_FIREBASE_AUTH_DOMAIN=ricemill-lk.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://ricemill-lk-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=ricemill-lk
VITE_FIREBASE_STORAGE_BUCKET=ricemill-lk.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=751522316202
VITE_FIREBASE_APP_ID=1:751522316202:web:3b032b9443bff6c8f8b5d3
```

#### C. **Environment Variables Not Loaded**
If using Vite dev server:
1. Stop the dev server (Ctrl+C)
2. Restart: `npm run dev`
3. Environment variables are only loaded at startup

#### D. **Browser Console Errors**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for Firebase errors like:
   - "Permission denied"
   - "Firebase: No Firebase App"
   - "Failed to get document"

### Problem: Check/Seed buttons don't work

#### Check Browser Console (F12):
- Look for error messages
- Check Network tab for failed requests

#### Verify Firebase Rules:
1. Go to Firebase Console
2. Select your project: **ricemill-lk**
3. Go to **Realtime Database → Rules**
4. Temporarily set to allow all (for testing):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Testing Individual Pages

Once data exists, test each module:

### 1. Inventory Management
- Navigate to **Inventory** page
- Should show 4 products with stock levels
- If empty, check browser console for errors

### 2. Sales & Orders
- Go to **Orders** page
- Should show pending/approved orders
- Check **Customer List** for 3 customers

### 3. Transport
- Go to **Vehicles List**
- Should show 3 vehicles
- Check status and driver info

### 4. Loans
- Navigate to **Loan Management**
- Check different loan statuses

### 5. Workers
- Go to **Worker Attendance**
- Should show 3 staff members

## Quick Diagnostic Commands

Run in browser console (F12):

### Check if Firebase is initialized:
```javascript
console.log(window.firebase)
```

### Check current data:
```javascript
import { ref, get } from 'firebase/database';
import { db } from './firebase/index';

get(ref(db, 'products')).then(snap => {
  console.log('Products:', snap.val());
});
```

## Files Modified

1. ✅ `src/utils/seedDatabase.js` - Fixed import path
2. ✅ `src/utils/checkDatabaseData.js` - Fixed import path  
3. ✅ `src/pages/Settings.jsx` - Added check database functionality

## Next Steps

1. **Check Database** first to see current status
2. **Seed Database** if collections are empty
3. **Refresh browser** to ensure changes take effect
4. **Check each page** to verify data displays
5. **Open browser console** (F12) if issues persist

## Common Solutions

### Data exists but pages are blank:
- ✅ Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- ✅ Clear browser cache
- ✅ Check Firebase Database Rules
- ✅ Verify you're logged in to the app
- ✅ Check browser console for errors

### "Permission Denied" error:
- ✅ Update Firebase Realtime Database Rules to allow read/write
- ✅ Ensure user is authenticated
- ✅ Check Firebase Console → Realtime Database → Rules tab

### Environment variables not working:
- ✅ Restart Vite dev server
- ✅ Verify `.env.local` file exists in project root
- ✅ Check variable names start with `VITE_`

---

**Need More Help?**
1. Run "Check Database" and share the results
2. Open browser console (F12) and share any error messages
3. Verify Firebase Rules in Firebase Console
