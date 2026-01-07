// src/firebase/storage.js
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app  from './index';

const storage = getStorage(app);

export const uploadInventoryImage = async (file, riceId) => {
  try {
    const storageRef = ref(storage, `inventory_images/${riceId}_${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteInventoryImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const getImageUrl = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
};