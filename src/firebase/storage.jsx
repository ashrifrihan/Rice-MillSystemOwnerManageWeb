// Firebase Storage
// This is a stub for Firebase Storage
// In a real app, you would import and initialize Firebase Storage here
export const uploadFile = async (file, path) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Generate a mock download URL
  const fileName = file.name || 'file';
  const downloadURL = `https://firebasestorage.googleapis.com/mock/${path}/${fileName}?alt=media`;
  return {
    ref: {
      fullPath: `${path}/${fileName}`,
      name: fileName
    },
    downloadURL
  };
};
export const getDownloadURL = async path => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  // Generate a mock download URL
  return `https://firebasestorage.googleapis.com/mock/${path}?alt=media`;
};
export const deleteFile = async path => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true
  };
};
export const listFiles = async path => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  // Return mock file list
  return [{
    name: 'invoice_001.pdf',
    fullPath: `${path}/invoice_001.pdf`,
    size: 245678,
    contentType: 'application/pdf',
    updated: new Date().toISOString()
  }, {
    name: 'receipt_002.pdf',
    fullPath: `${path}/receipt_002.pdf`,
    size: 187432,
    contentType: 'application/pdf',
    updated: new Date().toISOString()
  }, {
    name: 'product_image.jpg',
    fullPath: `${path}/product_image.jpg`,
    size: 543210,
    contentType: 'image/jpeg',
    updated: new Date().toISOString()
  }];
};