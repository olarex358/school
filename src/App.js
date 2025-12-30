// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import offline utilities
import { initDB } from './utils/offlineDB';
import { offlineApi } from './services/offlineApi';
import { useNetworkStatus, useSyncStatus } from './hooks/useNetworkStatus';
import OfflineBanner from './components/OfflineBanner';


// Import Header and Footer
import Header from './components/Header';
import Footer from './components/Footer';

// Import all page components
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StudentProfile from './pages/StudentProfile';
import StudentResults from './pages/StudentResults';
import StudentSyllabus from './pages/StudentSyllabus';
import StudentCertification from './pages/StudentCertification';
import StudentAttendance from './pages/StudentAttendance';
import StudentSubjects from './pages/StudentSubjects';
import StudentCalendar from './pages/StudentCalendar';
import StudentFees from './pages/StudentFees';
import StudentMails from './pages/StudentMails';
import StudentPasswordChange from './pages/StudentPasswordChange';
import StaffProfile from './pages/StaffProfile';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import StaffManagement from './pages/StaffManagement';
import ResultsManagement from './pages/ResultsManagement';
import ViewReports from './pages/ViewReports';
import AcademicManagement from './pages/AcademicManagement';
import UserPermissionsManagement from './pages/UserPermissionsManagement';

// Import dashboards
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';

// Import staff-specific pages
import StaffSubjects from './pages/StaffSubjects';
import StaffCalendar from './pages/StaffCalendar';
import StaffMails from './pages/StaffMails';
import StaffPasswordChange from './pages/StaffPasswordChange';

// Import Admin components
import AdminMessaging from './pages/AdminMessaging';
import AdminFeesManagement from './pages/AdminFeesManagement';
import AdminCalendarManagement from './pages/AdminCalendarManagement';
import AdminSyllabusManagement from './pages/AdminSyllabusManagement';
import MarkAttendance from './pages/MarkAttendance';
import AdminResultsApproval from './pages/AdminResultsApproval';
import AdminTimetableManagement from './pages/AdminTimetableManagement';
import StudentTimetable from './pages/StudentTimetable';
import StaffTimetable from './pages/StaffTimetable';
import AdminDigitalLibrary from './pages/AdminDigitalLibrary';
import UserDigitalLibrary from './pages/UserDigitalLibrary';
import AdminCertificationManagement from './pages/AdminCertificationManagement';
import StudentCertificationRegistration from './pages/StudentCertificationRegistration';

// Helper component for protected routes
const ProtectedRoute = ({ children, allowedTypes }) => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  
  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && !Array.isArray(allowedTypes)) {
    console.error("ProtectedRoute: allowedTypes must be an array.");
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(loggedInUser.type)) {
    if (loggedInUser.type === 'admin') return <Navigate to="/dashboard" replace />;
    if (loggedInUser.type === 'student') return <Navigate to="/student-dashboard" replace />;
    if (loggedInUser.type === 'staff') return <Navigate to="/staff-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const user = localStorage.getItem('loggedInUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse loggedInUser from localStorage:", error);
      return null;
    }
  });

  const { isOnline, showOfflineBanner } = useNetworkStatus();
  const { syncStatus, updateSyncStatus } = useSyncStatus();
  const [isOfflineInitialized, setIsOfflineInitialized] = useState(false);
  const [appStatus, setAppStatus] = useState({
    message: 'Initializing...',
    progress: 0
  });

  // Initialize offline database
  useEffect(() => {
    const initializeOfflineFeatures = async () => {
      try {
        setAppStatus({ message: 'Initializing offline database...', progress: 20 });
        
        // Initialize IndexedDB
        await initDB();
        console.log('✅ IndexedDB initialized');
        setAppStatus({ message: 'Database ready', progress: 40 });
        
        // Check for pending sync if online
        if (navigator.onLine) {
          setAppStatus({ message: 'Checking for pending sync...', progress: 60 });
          await offlineApi.syncPendingOperations();
        }
        
        // Pre-load essential data based on user type
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (user && navigator.onLine) {
          setAppStatus({ message: 'Pre-loading data...', progress: 80 });
          await preloadEssentialData(user.type);
        }
        
        setAppStatus({ message: 'Ready', progress: 100 });
        setIsOfflineInitialized(true);
        
        console.log('🚀 Offline features initialized successfully');
        
      } catch (error) {
        console.error('❌ Failed to initialize offline features:', error);
        setAppStatus({ 
          message: `Initialization error: ${error.message}`, 
          progress: 100 
        });
        setIsOfflineInitialized(true); // Still set to true to allow app to function
      }
    };

    initializeOfflineFeatures();
  }, []);

  // Function to pre-load essential data
  const preloadEssentialData = async (userType) => {
    try {
      console.log(`📥 Pre-loading data for ${userType}...`);
      
      const loadPromises = [];
      
      // Common data for all users
      loadPromises.push(offlineApi.get('schoolPortalSubjects'));
      
      switch (userType) {
        case 'admin':
          loadPromises.push(
            offlineApi.get('schoolPortalStudents'),
            offlineApi.get('schoolPortalStaff'),
            offlineApi.get('schoolPortalUsers'),
            offlineApi.get('schoolPortalCalendarEvents')
          );
          break;
        case 'student':
          loadPromises.push(
            offlineApi.get('schoolPortalStudents'),
            offlineApi.get('schoolPortalCalendarEvents'),
            offlineApi.get('schoolPortalTimetables')
          );
          break;
        case 'staff':
          loadPromises.push(
            offlineApi.get('schoolPortalStudents'),
            offlineApi.get('schoolPortalStaff'),
            offlineApi.get('schoolPortalTimetables')
          );
          break;
      }
      
      await Promise.allSettled(loadPromises);
      console.log('✅ Essential data pre-loaded successfully');
      
    } catch (error) {
      console.warn('⚠️ Some data failed to pre-load:', error);
    }
  };

  // Sync when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      if (loggedInUser) {
        console.log('🌐 Back online, checking for sync...');
        
        // Small delay to ensure network is stable
        setTimeout(async () => {
          await offlineApi.syncPendingOperations();
          await updateSyncStatus(offlineApi);
        }, 3000);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [loggedInUser, updateSyncStatus]);

  // Periodic sync check
  useEffect(() => {
    if (!isOnline) return;
    
    const interval = setInterval(async () => {
      await updateSyncStatus(offlineApi);
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [isOnline, updateSyncStatus]);

  // Listen for storage changes (logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'loggedInUser') {
        const user = localStorage.getItem('loggedInUser');
        setLoggedInUser(user ? JSON.parse(user) : null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show loading screen while initializing
  if (!isOfflineInitialized) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>School Portal</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>{appStatus.message}</p>
          
          {/* Progress bar */}
          <div style={{
            width: '300px',
            height: '6px',
            backgroundColor: '#e0e0e0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${appStatus.progress}%`,
              height: '100%',
              backgroundColor: '#3498db',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          
          <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
            {isOnline ? '🌐 Online' : '📴 Offline'} • Initializing offline capabilities...
          </p>
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="App">
      <OfflineBanner />
      
      <Header />
      
      <main style={{ 
        flexGrow: 1, 
        padding: '20px',
        minHeight: 'calc(100vh - 120px)'
      }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<HomePage />} />

          {/* Admin Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedTypes={['admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/student-management" element={<ProtectedRoute allowedTypes={['admin']}><StudentManagement /></ProtectedRoute>} />
          <Route path="/staff-management" element={<ProtectedRoute allowedTypes={['admin']}><StaffManagement /></ProtectedRoute>} />
          <Route path="/results-management" element={<ProtectedRoute allowedTypes={['admin']}><ResultsManagement /></ProtectedRoute>} />
          <Route path="/admin-results-approval" element={<ProtectedRoute allowedTypes={['admin']}><AdminResultsApproval /></ProtectedRoute>} />
          <Route path="/view-reports" element={<ProtectedRoute allowedTypes={['admin']}><ViewReports /></ProtectedRoute>} />
          <Route path="/academic-management" element={<ProtectedRoute allowedTypes={['admin']}><AcademicManagement /></ProtectedRoute>} />
          <Route path="/user-permissions-management" element={<ProtectedRoute allowedTypes={['admin']}><UserPermissionsManagement /></ProtectedRoute>} />
          <Route path="/admin-messaging" element={<ProtectedRoute allowedTypes={['admin']}><AdminMessaging /></ProtectedRoute>} />
          <Route path="/admin-fees-management" element={<ProtectedRoute allowedTypes={['admin']}><AdminFeesManagement /></ProtectedRoute>} />
          <Route path="/admin-calendar-management" element={<ProtectedRoute allowedTypes={['admin']}><AdminCalendarManagement /></ProtectedRoute>} />
          <Route path="/admin-syllabus-management" element={<ProtectedRoute allowedTypes={['admin']}><AdminSyllabusManagement /></ProtectedRoute>} />
          <Route path="/admin-timetable-management" element={<ProtectedRoute allowedTypes={['admin']}><AdminTimetableManagement /></ProtectedRoute>} />
          <Route path="/admin-digital-library" element={<ProtectedRoute allowedTypes={['admin']}><AdminDigitalLibrary /></ProtectedRoute>} />
          <Route path="/admin-certification-management" element={<ProtectedRoute allowedTypes={['admin']}><AdminCertificationManagement /></ProtectedRoute>} />

          {/* Student Protected Routes */}
          <Route path="/student-dashboard" element={<ProtectedRoute allowedTypes={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student-profile" element={<ProtectedRoute allowedTypes={['student']}><StudentProfile /></ProtectedRoute>} />
          <Route path='/student-results' element={<ProtectedRoute allowedTypes={['student']}><StudentResults /></ProtectedRoute>} />
          <Route path='/student-syllabus' element={<ProtectedRoute allowedTypes={['student']}><StudentSyllabus /></ProtectedRoute>} />
          <Route path='/student-certification' element={<ProtectedRoute allowedTypes={['student']}><StudentCertification /></ProtectedRoute>} />
          <Route path='/student-attendance' element={<ProtectedRoute allowedTypes={['student']}><StudentAttendance /></ProtectedRoute>} />
          <Route path='/student-subjects' element={<ProtectedRoute allowedTypes={['student']}><StudentSubjects /></ProtectedRoute>} />
          <Route path='/student-calendar' element={<ProtectedRoute allowedTypes={['student']}><StudentCalendar /></ProtectedRoute>} />
          <Route path='/student-fees' element={<ProtectedRoute allowedTypes={['student']}><StudentFees /></ProtectedRoute>} />
          <Route path='/student-mails' element={<ProtectedRoute allowedTypes={['student']}><StudentMails /></ProtectedRoute>} />
          <Route path='/student-password-change' element={<ProtectedRoute allowedTypes={['student']}><StudentPasswordChange /></ProtectedRoute>} />
          <Route path='/student-timetable' element={<ProtectedRoute allowedTypes={['student']}><StudentTimetable /></ProtectedRoute>} />
          <Route path='/student-digital-library' element={<ProtectedRoute allowedTypes={['student']}><UserDigitalLibrary /></ProtectedRoute>} />
          <Route path='/student-certification-registration' element={<ProtectedRoute allowedTypes={['student']}><StudentCertificationRegistration /></ProtectedRoute>} />

          {/* Staff Protected Routes */}
          <Route path="/staff-dashboard" element={<ProtectedRoute allowedTypes={['staff']}><StaffDashboard/></ProtectedRoute>} />
          <Route path="/staff-profile" element={<ProtectedRoute allowedTypes={['staff']}><StaffProfile /></ProtectedRoute>} />
          <Route path="/staff-subjects" element={<ProtectedRoute allowedTypes={['staff']}><StaffSubjects /></ProtectedRoute>} />
          <Route path="/staff-calendar" element={<ProtectedRoute allowedTypes={['staff']}><StaffCalendar /></ProtectedRoute>} />
          <Route path="/staff-mails" element={<ProtectedRoute allowedTypes={['staff']}><StaffMails /></ProtectedRoute>} />
          <Route path="/staff-password-change" element={<ProtectedRoute allowedTypes={['staff']}><StaffPasswordChange /></ProtectedRoute>} />
          <Route path="/mark-attendance" element={<ProtectedRoute allowedTypes={['staff']}><MarkAttendance/></ProtectedRoute>} />
          <Route path="/results-management" element={<ProtectedRoute allowedTypes={['admin', 'staff']}><ResultsManagement /></ProtectedRoute>} />
          <Route path="/view-reports" element={<ProtectedRoute allowedTypes={['admin', 'staff']}><ViewReports /></ProtectedRoute>} />
          <Route path="/staff-timetable" element={<ProtectedRoute allowedTypes={['staff']}><StaffTimetable /></ProtectedRoute>} />
          <Route path="/staff-digital-library" element={<ProtectedRoute allowedTypes={['staff']}><UserDigitalLibrary /></ProtectedRoute>} />

          {/* Catch-all route for 404 pages */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h2>404 - Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
              <button 
                onClick={() => window.history.back()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '20px'
                }}
              >
                Go Back
              </button>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;