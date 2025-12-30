import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

function useLocalStorage(key, initialValue) {
<<<<<<< HEAD
  // Get from local storage then parse stored json or return initialValue
  const readValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
=======
    // Now we use the data from the centralized context instead of local state
    const {
        students, staffs, subjects, results, pendingResults,
        certificationResults, feeRecords, calendarEvents,
        syllabusEntries, digitalLibrary, users, adminMessages,
        certificationRegistrations, attendanceRecords, timetables,
        loading, error
    } = useData();

    // The state is now managed at the top level in DataContext, but we can
    // still provide local state for form inputs or other temporary data.
    const [localState, setLocalState] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item && item !== 'undefined' ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // This effect ensures local state stays in sync with localStorage if needed
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(localState));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, localState]);

    // This hook now returns the relevant data from the centralized context
    switch (key) {
        case 'schoolPortalStudents':
            return [students, setLocalState, loading, error];
        case 'schoolPortalStaff':
            return [staffs, setLocalState, loading, error];
        case 'schoolPortalSubjects':
            return [subjects, setLocalState, loading, error];
        case 'schoolPortalResults':
            return [results, setLocalState, loading, error];
        case 'schoolPortalPendingResults':
            return [pendingResults, setLocalState, loading, error];
        case 'schoolPortalCertificationResults':
            return [certificationResults, setLocalState, loading, error];
        case 'schoolPortalFeeRecords':
            return [feeRecords, setLocalState, loading, error];
        case 'schoolPortalCalendarEvents':
            return [calendarEvents, setLocalState, loading, error];
        case 'schoolPortalSyllabusEntries':
            return [syllabusEntries, setLocalState, loading, error];
        case 'schoolPortalDigitalLibrary':
            return [digitalLibrary, setLocalState, loading, error];
        case 'schoolPortalUsers':
            return [users, setLocalState, loading, error];
        case 'schoolPortalAdminMessages':
            return [adminMessages, setLocalState, loading, error];
        case 'schoolPortalCertificationRegistrations':
            return [certificationRegistrations, setLocalState, loading, error];
        case 'schoolPortalAttendance':
            return [attendanceRecords, setLocalState, loading, error];
        case 'schoolPortalTimetables':
            return [timetables, setLocalState, loading, error];
        default:
            return [localState, setLocalState, loading, error];
    }
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
}

export default useLocalStorage;