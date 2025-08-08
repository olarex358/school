// src/utils/uploadFile.js

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase";

/**
 * Uploads a file to Firebase Storage.
 * @param {File} file The file object to upload.
 * @param {string} destinationPath The path in Firebase Storage to save the file (e.g., 'digital-library/' or 'resumes/').
 * @returns {Promise<string>} The public download URL of the uploaded file.
 */
export const uploadFile = async (file, destinationPath) => {
  if (!file) {
    throw new Error("No file selected.");
  }

  // Create a unique file name to avoid collisions
  const uniqueFileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${destinationPath}/${uniqueFileName}`);

  try {
    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage upload error:", error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};
