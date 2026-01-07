# Transport System - Deployment Checklist

**Date:** December 27, 2025  
**Version:** 2.0  
**Status:** Ready for Testing

---

## ✅ Pre-Deployment Verification

### Code Changes Completed

#### Security
- [x] API keys removed from `src/firebase/config.jsx`
- [x] API keys configured in `.env.local`
- [x] `database.rules.json` updated with proper security rules
- [x] Error messages don't expose sensitive information
- [x] GPS data validated before processing

#### Features Implemented
- [x] Trip assignment validation system
- [x] Vehicle availability checking
- [x] Driver availability checking
- [x] Order double-assignment prevention
- [x] Vehicle capacity validation
- [x] GPS coordinate validation
- [x] Connection status monitoring
- [x] Network error classification
- [x] SMS notification queue system
- [x] Offline GPS handling

#### Files Created
- [x] `src/utils/tripValidation.js` - 400+ lines of validation logic
- [x] `TRANSPORT_SYSTEM_SETUP.md` - Complete documentation
- [x] `TRANSPORT_QUICK_REFERENCE.md` - Quick reference guide
- [x] `TRANSPORT_DEPLOYMENT_CHECKLIST.md` - This file

#### Files Modified
- [x] `src/firebase/config.jsx` - Environment variables
- [x] `src/pages/AssignTransport.jsx` - Validation added
- [x] `src/pages/TransportGPS.jsx` - GPS error handling
- [x] `database.rules.json` - Security rules

---

## 🔍 Testing Checklist

### Unit Tests Required

#### Trip Validation
```javascript
// Test validateTripAssignment
// ✅ Should fail with missing orderId
// ✅ Should fail with missing vehicleId
// ✅ Should fail with missing driverId
// ✅ Should fail if vehicle already assigned
// ✅ Should fail if driver already assigned
// ✅ Should fail if order already assigned
// ✅ Should fail if vehicle capacity < order quantity
// ✅ Should pass with valid data
```

#### GPS Validation
```javascript
// Test validateGPSCoordinates
// ✅ Should fail with invalid latitude (< -90 or > 90)
// ✅ Should fail with invalid longitude (< -180 or > 180)
// ✅ Should fail with non-numeric values
// ✅ Should warn if outside Sri Lanka bounds
// ✅ Should pass with valid coordinates
```

#### Connection Status
```javascript
// Test checkGPSConnectionStatus
// ✅ Should return 'online' if updated < 90s ago
// ✅ Should return 'offline' if updated > 90s ago
// ✅ Should return 'unstable' if updated > 63s ago
// ✅ Should return 'never-connected' if no timestamp
```

### Integration Tests Required

#### Trip Creation Flow
```
1. [ ] Navigate to AssignTransport page
2. [ ] Load orders from Firebase
3. [ ] Load vehicles from Firebase
4. [ ] Load drivers from Firebase
5. [ ] Select order (verify preview card shows)
6. [ ] Select vehicle (verify preview card shows)
7. [ ] Select driver (verify preview card shows)
8. [ ] Enter end location
9. [ ] Click "Assign Transport"
10. [ ] Verify validation runs (check console)
11. [ ] Verify trip created in Firebase trips/{tripId}
12. [ ] Verify liveLocations/{tripId} initialized
13. [ ] Verify order status updated to "In Transit"
14. [ ] Verify vehicle status updated to "On Trip"
15. [ ] Verify driver status updated to "on-trip"
16. [ ] Verify SMS queued in notifications/sms_queue
17. [ ] Navigate to TransportGPS (should auto-select trip)
```

#### GPS Tracking Flow
```
1. [ ] Navigate to TransportGPS page
2. [ ] Verify trip appears in list
3. [ ] Click trip to select
4. [ ] Verify map loads with current location
5. [ ] Verify driver info panel shows
6. [ ] Manually update liveLocations/{tripId} with new GPS
7. [ ] Verify map marker moves
8. [ ] Verify current location updates
9. [ ] Verify updatedAt timestamp refreshes
10. [ ] Stop sending GPS updates
11. [ ] Wait 90 seconds
12. [ ] Verify offline indicator appears
13. [ ] Resume GPS updates
14. [ ] Verify online indicator returns
```

#### Error Handling Flow
```
1. [ ] Try to assign with missing order → Error shown
2. [ ] Try to assign with missing vehicle → Error shown
3. [ ] Try to assign with missing driver → Error shown
4. [ ] Try to assign same vehicle twice → Error with detail
5. [ ] Try to assign same driver twice → Error with detail
6. [ ] Disconnect internet and try to assign → Network error
7. [ ] Invalid GPS coordinates sent → Skipped gracefully
8. [ ] Check browser console → Proper error logs
```

---

## 🚀 Deployment Steps

### Step 1: Pre-Deployment
```bash
# 1. Verify .env.local has all required variables
cat .env.local
# Should contain all VITE_FIREBASE_* keys

# 2. Verify no API keys in source files
grep -r "AIzaSy" src/
# Should return nothing

# 3. Run build
npm run build

# 4. Check for build errors
# Should see: "vite v4.x.x building for production..."
```

### Step 2: Deploy Firebase Rules
```bash
# 1. Preview rules
firebase rules:test

# 2. Deploy rules to production
firebase deploy --only database

# 3. Verify deployment
firebase database:get rules
# Should show new security rules with role-based access
```

### Step 3: Update Production Environment
```bash
# Option 1: Vercel/Netlify deployment
# 1. Add environment variables to production settings
# 2. Deploy: git push to main branch
# 3. Verify deployment successful

# Option 2: Manual deployment
# 1. npm run build
# 2. Upload dist/ to hosting (Apache, Nginx, etc.)
# 3. Test: Visit production URL
```

### Step 4: Post-Deployment Verification
```bash
# 1. Visit production URL in browser
# 2. Open Console (F12 > Console tab)
# 3. Should see NO errors about missing environment variables
# 4. Try creating a trip
# 5. Check Firebase Console > Database for new trip record
# 6. Try monitoring trip on GPS page
```

---

## 🔐 Security Deployment Checklist

- [ ] All API keys in `.env.local` (not in source)
- [ ] `.gitignore` includes `.env.local` 
- [ ] Production `.env` configured on hosting platform
- [ ] Firebase Rules deployed with proper authentication
- [ ] Test: Try to read liveLocations as non-owner (should fail)
- [ ] Test: Try to write to liveLocations as non-driver (should fail)
- [ ] Test: Try to create trip without authentication (should fail)
- [ ] Console shows NO security warnings
- [ ] Error messages don't expose API keys or sensitive data

---

## 📊 Performance Considerations

### GPS Updates
- Currently: Every 5-10 seconds from driver app
- Firebase Realtime DB cost: ~$1-5/month for 1000 trips/month
- Throttle strategy: Handled automatically by driver app
- Recommendation: Increase interval to 15-30s in high-traffic scenarios

### Map API Calls
- Directions calculated: Once per trip (60s throttle)
- Geocoding: On-demand
- Cost: Google Maps API billing required
- Recommendation: Monitor API usage in Google Console

### Database Queries
- Trip assignments: Pre-fetch all active trips (1 query)
- GPS updates: Subscribed to single trip (1 listener)
- Recommendation: Archive completed trips to separate path

---

## 🆘 Troubleshooting Guide

### Issue: "Environment variables not found"
**Solution:**
```bash
# 1. Check .env.local exists
ls -la .env.local

# 2. Verify all VITE_* keys present
grep "VITE_FIREBASE" .env.local

# 3. Restart dev server
npm run dev
```

### Issue: "Permission denied" on trip creation
**Solution:**
```bash
# 1. Check user authentication
console.log('User:', auth.currentUser);

# 2. Check Firebase rules
firebase database:get rules

# 3. Verify user has 'owner' or 'admin' role
# Check: /users/{uid}/role in Firebase
```

### Issue: GPS not updating on map
**Solution:**
```bash
# 1. Check GPS coordinates in Firebase
firebase database:get liveLocations/TRP-2023-001

# 2. Verify coordinates are valid
# Latitude should be 5.8 - 7.9 (Sri Lanka)
# Longitude should be 79.6 - 81.9 (Sri Lanka)

# 3. Check TransportGPS console logs
# Should show GPS updates every 5-10 seconds
```

### Issue: SMS not sent to driver
**Solution:**
```javascript
// 1. Check SMS queue in Firebase
firebase database:get notifications/sms_queue

// 2. Verify backend SMS sender running
// Check: Cloud Functions logs or backend service logs

// 3. Test SMS directly
// Send test SMS from Google Cloud SMS or Twilio console
```

---

## 📈 Monitoring & Maintenance

### Daily Checks
```javascript
// 1. Monitor active trips
firebase database:get trips --filter 'status==in-transit'

// 2. Check GPS updates frequency
// Should see updatedAt every 5-10 seconds

// 3. Review error logs
// Check browser console for any warnings

// 4. Verify vehicle/driver availability flags
firebase database:get vehicles
// All should have isAvailable and currentTripId fields
```

### Weekly Checks
```javascript
// 1. Archive completed trips
// Move status='delivered' to history/

// 2. Review validation errors
// Check: How many failed assignments? Why?

// 3. Check SMS delivery rate
// Count: pending vs sent vs failed

// 4. Monitor Firebase costs
// Should be < $10/month for typical usage
```

### Monthly Tasks
```javascript
// 1. Database optimization
// Delete old completed trips (> 30 days)

// 2. Security audit
// Verify Firebase rules still appropriate

// 3. Performance review
// Check: Response times, error rates

// 4. User feedback
// Collect issues from drivers/owners
```

---

## 🎓 Training Required

### For Owners/Admin
- How to create trip assignment
- How to monitor GPS on TransportGPS page
- How to interpret error messages
- How to contact driver from app

### For Drivers
- How to receive trip notifications
- How to start GPS sharing
- How to update trip status
- How to handle connection issues

### For Backend/DevOps
- How to send SMS from notification queue
- How to monitor Firebase performance
- How to handle database errors
- How to scale system for multiple trips

---

## 📞 Support & Documentation

### For Developers
- See: `src/utils/tripValidation.js` - Function documentation
- See: `database.rules.json` - Security rules comments
- See: `TRANSPORT_SYSTEM_SETUP.md` - Detailed technical guide

### For Operations
- See: `TRANSPORT_QUICK_REFERENCE.md` - Quick reference
- See: Console logs during operation
- See: Firebase Console > Realtime Database

### For End Users
- See: In-app error messages
- See: Tooltips and help text
- Contact: Support team for issues

---

## ✅ Final Sign-Off

Before marking as "Ready for Production":

- [ ] All code reviewed and tested
- [ ] Security audit completed
- [ ] Performance verified
- [ ] Documentation complete
- [ ] Team trained
- [ ] Monitoring setup
- [ ] Rollback plan documented
- [ ] Stakeholder approval obtained

**Approved By:** _________________  
**Date:** _________________  
**Notes:** _________________

---

## 📅 Rollback Plan

If issues discovered in production:

```bash
# 1. Revert code to previous version
git revert <commit-hash>
npm run build

# 2. Revert Firebase rules (if needed)
firebase deploy --only database

# 3. Restart application
npm run dev  # or deploy to production

# 4. Monitor for issues
# Check Firebase Console
# Check browser console for errors
```

---

**Status:** ✅ **READY FOR TESTING**

Next Steps:
1. Run all tests listed above
2. Fix any issues found
3. Get team sign-off
4. Deploy to staging first
5. Final verification in staging
6. Deploy to production

