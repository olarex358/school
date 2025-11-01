// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

/**
 * Custom hook for managing state that persists in localStorage.
 * Designed ONLY for local state persistence.
 * @param {string} key The key under which the data is stored in localStorage.
 * @param {any} initialValue The default value if nothing is found in localStorage.
 * @returns {[any, Function, boolean]} [storedValue, setStoredValue, isLoading]
 */
function useLocalStorage(key, initialValue) {
  // Use a state variable to track if the initial load from localStorage is complete
  const [isLoading, setIsLoading] = useState(true);

  // State to store our value, initialized from localStorage or initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item && item !== 'undefined' ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error, return initialValue
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // Effect to handle writing the storedValue back to localStorage whenever it changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      // Set loading to false once the state has been initialized from localStorage
      // and written back.
      setIsLoading(false); 
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);

  // We return the state, the setter, and the local storage loading status
  return [storedValue, setStoredValue, isLoading];
}

export default useLocalStorage;