const functions = require('firebase-functions');
const admin = require('firebase-admin');
const bucket = admin.storage().bucket();

exports.uploadProfileImage = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }
  
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    const { fileName, fileType, base64Data, timestamp } = req.body;
    
    if (!base64Data || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate file path
    const filePath = `profile-images/${uid}/${timestamp}_${fileName}`;
    const file = bucket.file(filePath);
    
    // Upload file
    await file.save(buffer, {
      metadata: {
        contentType: fileType,
        cacheControl: 'public, max-age=3600'
      }
    });
    
    // Make file public and get download URL
    await file.makePublic();
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    return res.status(200).json({ downloadURL, filePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: error.message });
  }
});
