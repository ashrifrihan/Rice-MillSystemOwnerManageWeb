# 🔧 Firebase CORS & Storage Configuration - Complete Guide

## Status: ✅ 90% Complete

Your Firebase Storage configuration is **almost ready**! The final step requires authentication.

---

## What's Already Done ✅

1. **✓ storage.rules** - Firebase Storage rules file created with proper permissions
2. **✓ firebase.json** - Updated to reference storage rules  
3. **✓ cors.json** - CORS configuration ready
4. **✓ Project configured** - firebase.json has correct project ID

---

## Step 1: Authenticate with Firebase

Run this command in your terminal (it will open your browser):

```bash
firebase login
```

**What it does:**
- Opens a browser for Google authentication
- Authenticates your Firebase CLI with your Google account
- Saves credentials locally

---

## Step 2: Deploy Storage Rules

After authentication, run:

```bash
firebase deploy --only storage --project ricemill-lk
```

**What it does:**
- Uploads `storage.rules` to Firebase
- Enables proper read/write permissions
- Activates public read access for images

---

## Step 3: Apply CORS Configuration

You have two options:

### Option A: Using gsutil (Recommended)

First, install Google Cloud SDK if you haven't:
- Download: https://cloud.google.com/sdk/docs/install-cloud-sdk
- Install and restart your terminal

Then run:
```bash
gcloud auth login
gcloud config set project ricemill-lk
gsutil cors set cors.json gs://ricemill-lk.firebasestorage.app
```

### Option B: Using Firebase Console (Fastest)

1. Go to: https://console.firebase.google.com
2. Select project: **ricemill-lk**
3. Go to: **Storage** → **Settings** → **CORS**
4. Note: You may need to set CORS differently in console

---

## Step 4: Verify Everything Works

After deploying rules:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart dev server** (npm run dev)
3. **Try uploading an image** in the inventory form
4. **Image should display** with no CORS errors

---

## What These Configurations Do

### storage.rules
```
- Allows PUBLIC READ access to all images
- Allows AUTHENTICATED users to WRITE/DELETE files
- Specific permissions for inventory_images and profile_images folders
```

### cors.json
```
- Allows requests from: http://localhost:5174 (your dev server)
- Allows methods: GET, HEAD, DELETE, PUT, POST
- Cache duration: 1 hour
```

---

## Troubleshooting

### Error: "File not authenticated"
→ Run `firebase login` and authenticate with your Google account

### Error: "CORS error" after deployment
→ Make sure you applied BOTH storage rules AND CORS configuration
→ Clear browser cache and restart dev server

### Error: "gsutil not found"
→ Install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install-cloud-sdk

### Image still won't upload
→ Check browser console for specific error
→ Verify Firebase project ID is correct: `ricemill-lk`

---

## Files Location

- `storage.rules` - Firebase Storage permissions (created)
- `cors.json` - CORS configuration (already existed)
- `firebase.json` - Firebase project config (updated)

---

## Quick Reference Commands

```bash
# Authenticate
firebase login

# Deploy storage rules
firebase deploy --only storage --project ricemill-lk

# Apply CORS (if gsutil installed)
gsutil cors set cors.json gs://ricemill-lk.firebasestorage.app

# Verify CORS is set (if gsutil installed)
gsutil cors get gs://ricemill-lk.firebasestorage.app

# List Firebase projects
firebase projects:list
```

---

## Next Steps

1. **Run:** `firebase login`
2. **Run:** `firebase deploy --only storage --project ricemill-lk`
3. **Clear cache** and restart dev server
4. **Test image upload** in the inventory form

---

**Need Help?** Check the error messages in your browser console (F12) for specific details.
