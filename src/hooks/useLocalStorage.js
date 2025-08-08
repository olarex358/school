// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

function useLocalStorage(key, initialValue) {
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
  
  // This hook now returns the relevant data from the context
  // based on the key, and still allows local state updates.
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
}

export default useLocalStorage;
