// src/utils/firebaseFilters.js
// Helper functions to filter Firebase data by owner

/**
 * Gets the current user's email from user object
 * @param {Object} user - Firebase user object
 * @returns {string} User email or empty string
 */
export const getCurrentUserEmail = (user) => {
  if (!user) return '';
  return user.email || user.userEmail || user.mail || '';
};

/**
 * Filters an array of Firebase items by owner email
 * @param {Array} items - Array of items from Firebase
 * @param {string} ownerEmail - Email of the current logged-in user
 * @returns {Array} Filtered array containing only the user's items
 */
export const filterByOwner = (items, ownerEmail) => {
  if (!items || !Array.isArray(items)) return [];
  if (!ownerEmail) return items; // If no owner email, return all (for backwards compatibility)
  
  return items.filter(item => {
    // Check various possible owner field names
    return item.owner_email === ownerEmail || 
           item.ownerEmail === ownerEmail ||
           item.owner === ownerEmail ||
           item.userId === ownerEmail ||
           item.user_email === ownerEmail;
  });
};

/**
 * Filters Firebase snapshot data by owner email
 * @param {Object} snapshot - Firebase snapshot
 * @param {string} ownerEmail - Email of the current logged-in user
 * @returns {Array} Filtered array of items
 */
export const filterSnapshotByOwner = (snapshot, ownerEmail) => {
  if (!snapshot || !snapshot.exists()) return [];
  
  const data = snapshot.val();
  const items = [];
  
  Object.keys(data).forEach(key => {
    const item = { id: key, ...data[key] };
    
    // Debug - show ALL fields in the item
    console.log("🔍 Full item data:", item);
    
    // Multiple ways to check if item belongs to this owner
    const isOwner =
      // Direct email match (both camelCase and snake_case)
      item.ownerEmail === ownerEmail ||
      item.owner_email === ownerEmail ||
      // Rice mill owner name match (case insensitive)
      item.riceMillOwner?.toLowerCase() === ownerEmail?.toLowerCase() ||
      // Check if userEmail is contained in riceMillOwner
      item.riceMillOwner?.toLowerCase().includes(ownerEmail?.toLowerCase()) ||
      // Check if riceMillId matches something
      item.riceMillId === ownerEmail;

    // Debug logging for each item
    console.log("🔍 Filter check:", {
      itemId: item.id,
      'item.ownerEmail': item.ownerEmail,
      'item.owner_email': item.owner_email,
      'item.riceMillOwner': item.riceMillOwner,
      'searching for': ownerEmail,
      'isOwner': isOwner
    });

    if (isOwner) {
      console.log("✅ MATCH FOUND - Adding item:", item.id);
      items.push(item);
    } else {
      console.log("❌ NO MATCH - Skipping item:", item.id);
    }
  });

  console.log("📊 Found items for", ownerEmail, ":", items.length);
  return items;
};

/**
 * Adds owner information to an item before saving
 * @param {Object} item - Item data to be saved
 * @param {Object} user - Current user object
 * @param {string} millId - Optional mill ID
 * @returns {Object} Item with owner information added
 */
export const addOwnerInfo = (item, user, millId = null) => {
  const ownerEmail = getCurrentUserEmail(user);
  
  return {
    ...item,
    owner_email: ownerEmail,
    ownerEmail: ownerEmail, // Backwards compatibility
    rice_mill_id: millId || item.rice_mill_id || 'default_mill',
    created_by: ownerEmail,
    updated_by: ownerEmail,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Checks if an item belongs to the current user
 * @param {Object} item - Item to check
 * @param {string} ownerEmail - Current user's email
 * @returns {boolean} True if item belongs to user
 */
export const belongsToUser = (item, ownerEmail) => {
  if (!item || !ownerEmail) return false;
  
  return item.owner_email === ownerEmail ||
         item.ownerEmail === ownerEmail ||
         item.owner === ownerEmail ||
         item.userId === ownerEmail ||
         item.user_email === ownerEmail;
};

/**
 * Gets mill ID from user or defaults
 * @param {Object} user - User object
 * @returns {string} Mill ID
 */
export const getMillId = (user) => {
  if (!user) return 'default_mill';
  return user.rice_mill_id || user.millId || user.mill_id || 'default_mill';
};
