// src/context/DataContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebase/firebase'; // Import the initialized Firestore instance

const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [data, setData] = useState({
    students: [],
    staffs: [],
    subjects: [],
    results: [],
    pendingResults: [],
    certificationResults: [],
    feeRecords: [],
    calendarEvents: [],
    syllabusEntries: [],
    digitalLibrary: [],
    users: [],
    adminMessages: [],
    certificationRegistrations: [],
    attendanceRecords: [],
    timetables: [],
    notifications: [] // Added for real-time notifications
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbFetchCompleted, setDbFetchCompleted] = useState(false);

  // Effect to check for logged in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    setLoggedInUser(user);
  }, []);

  // Effect to fetch initial data from MongoDB backend
  useEffect(() => {
    if (!loggedInUser) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const endpoints = [
        'schoolPortalStudents',
        'schoolPortalStaff',
        'schoolPortalSubjects',
        'schoolPortalResults',
        'schoolPortalPendingResults',
        'schoolPortalCertificationResults',
        'schoolPortalFeeRecords',
        'schoolPortalCalendarEvents',
        'schoolPortalSyllabusEntries',
        'schoolPortalDigitalLibrary',
        'schoolPortalUsers',
        'schoolPortalAdminMessages',
        'schoolPortalCertificationRegistrations',
        'schoolPortalAttendance',
        'schoolPortalTimetables'
      ];

      const fetchPromises = endpoints.map(endpoint =>
        fetch(`http://localhost:5000/api/${endpoint}`, { headers })
          .then(res => {
            if (res.status === 403 || res.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('loggedInUser');
              navigate('/login');
              return [];
            }
            return res.json();
          })
          .catch(err => {
            console.error(`Failed to fetch ${endpoint}:`, err);
            return [];
          })
      );

      try {
        const results = await Promise.all(fetchPromises);
        const newData = {};
        endpoints.forEach((endpoint, index) => {
          const key = endpoint.replace('schoolPortal', '').replace(/^\w/, c => c.toLowerCase());
          newData[key] = results[index];
        });
        setData(newData);
        setDbFetchCompleted(true);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [loggedInUser, navigate]);
  
  // New Effect for Real-time Firestore Notifications
  useEffect(() => {
    if (!loggedInUser) {
      setData(prev => ({ ...prev, notifications: [] }));
      return;
    }

    const notificationsCollection = collection(db, 'notifications');
    let q;

    if (loggedInUser.type === 'admin') {
      q = query(notificationsCollection, where('recipientType', 'in', ['admin']));
    } else if (loggedInUser.type === 'student') {
      q = query(notificationsCollection, where('recipientType', 'in', ['allStudents', 'individualStudent']), where('recipientId', 'in', [loggedInUser.admissionNo, null]));
    } else if (loggedInUser.type === 'staff') {
      q = query(notificationsCollection, where('recipientType', 'in', ['allStaff', 'individualStaff']), where('recipientId', 'in', [loggedInUser.staffId, null]));
    }
    
    // Subscribe to the query
    if (q) {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })).sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

        setData(prev => ({ ...prev, notifications: newNotifications }));
      }, (err) => {
        console.error("Firestore subscription failed:", err);
      });
      return () => unsubscribe();
    }
  }, [loggedInUser]);

  const value = {
    ...data,
    loading,
    error,
    // Functions to update state directly in the context
    setStudents: (newStudents) => setData(prev => ({ ...prev, students: newStudents })),
    setStaffs: (newStaffs) => setData(prev => ({ ...prev, staffs: newStaffs })),
    setSubjects: (newSubjects) => setData(prev => ({ ...prev, subjects: newSubjects })),
    setResults: (newResults) => setData(prev => ({ ...prev, results: newResults })),
    setPendingResults: (newPending) => setData(prev => ({ ...prev, pendingResults: newPending })),
    setCertificationResults: (newCert) => setData(prev => ({ ...prev, certificationResults: newCert })),
    setFeeRecords: (newFees) => setData(prev => ({ ...prev, feeRecords: newFees })),
    setCalendarEvents: (newEvents) => setData(prev => ({ ...prev, calendarEvents: newEvents })),
    setSyllabusEntries: (newSyllabus) => setData(prev => ({ ...prev, syllabusEntries: newSyllabus })),
    setDigitalLibrary: (newLibrary) => setData(prev => ({ ...prev, digitalLibrary: newLibrary })),
    setUsers: (newUsers) => setData(prev => ({ ...prev, users: newUsers })),
    setAdminMessages: (newMessages) => setData(prev => ({ ...prev, adminMessages: newMessages })),
    setCertificationRegistrations: (newRegs) => setData(prev => ({ ...prev, certificationRegistrations: newRegs })),
    setAttendanceRecords: (newAttendance) => setData(prev => ({ ...prev, attendanceRecords: newAttendance })),
    setTimetables: (newTimetables) => setData(prev => ({ ...prev, timetables: newTimetables })),
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
