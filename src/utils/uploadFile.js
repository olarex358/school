// src/utils/uploadFile.js

/**
 * Uploads a file to the backend API and returns the file path.
 * @param {File} file The file object to upload.
 * @returns {Promise<string>} The file path from the server.
 */
export const uploadFile = async (file) => {
  if (!file) {
    throw new Error("No file selected.");
  }

  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("User not authenticated.");
  }

  try {
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      // Check if the response is JSON, otherwise read as text
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const errorData = isJson ? await response.json() : await response.text();
      throw new Error(errorData.message || errorData || 'File upload failed.');
    }

    const data = await response.json();
    return data.filePath;
  } catch (error) {
    console.error("File upload utility error:", error);
    throw error;
  }
};
