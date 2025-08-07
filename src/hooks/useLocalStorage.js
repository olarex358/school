// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue, backendUrl) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item && item !== 'undefined' ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (backendUrl) {
      setLoading(true);
      setError(null);

      const fetchData = async () => {
        try {
          const response = await fetch(backendUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch from backend: ${response.statusText}`);
          }
          const data = await response.json();
          setStoredValue(data);
          window.localStorage.setItem(key, JSON.stringify(data));
          setLoading(false);
        } catch (err) {
          console.warn(`Backend fetch failed for key "${key}". Falling back to localStorage.`, err);
          setError(err);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [key, backendUrl]);

  useEffect(() => {
    if (!backendUrl) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue, backendUrl]);
  
  const setLocalValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setLocalValue, loading, error];
}

export default useLocalStorage;