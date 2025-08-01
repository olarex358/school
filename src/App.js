// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
// Import Header and Footer - these will now be general for all pages
import Header from './components/Header';
import Footer from './components/Footer';

// Import all your page components with correct paths
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StudentProfile from './pages/StudentProfile';
import StudentResults from './pages/StudentResults';
import StudentSyllabus from './pages/StudentSyllabus';
import StudentCertification from './pages/StudentCertification';
import StudentAttendance from './pages/StudentAttendance';
import StudentSubjects from './pages/StudentSubjects';
import StudentCalendar from './pages/StudentCalendar'; // Corrected path and spelling
import StudentFees from './pages/StudentFees';
import StudentMails from './pages/StudentMails'; // Corrected path
import StudentPasswordChange from './pages/StudentPasswordChange';
import StaffProfile from './pages/StaffProfile';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import StaffManagement from './pages/StaffManagement';
import ResultsManagement from './pages/ResultsManagement';
import ViewReports from './pages/ViewReports';
import AcademicManagement from './pages/AcademicManagement';
import UserPermissionsManagement from './pages/UserPermissionsManagement'; // Corrected path

// Import dashboards
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';

// Import staff-specific pages
import StaffSubjects from './pages/StaffSubjects';
import StaffCalendar from './pages/StaffCalendar';
import StaffMails from './pages/StaffMails';
import StaffPasswordChange from './pages/StaffPasswordChange';

// Import Admin Messaging
import AdminMessaging from './pages/AdminMessaging';

// Import AdminFeesManagement
import AdminFeesManagement from './pages/AdminFeesManagement';

// Import Admin Calendar and Syllabus Management
import AdminCalendarManagement from './pages/AdminCalendarManagement';
import AdminSyllabusManagement from './pages/AdminSyllabusManagement';
import MarkAttendance from './pages/MarkAttendance'
import AdminResultsApproval from './pages/AdminResultsApproval';
import AdminTimetableManagement from './pages/AdminTimetableManagement';
import StudentTimetable from './pages/StudentTimetable';
import StaffTimetable from './pages/StaffTimetable';
import AdminDigitalLibrary from './pages/AdminDigitalLibrary';
import UserDigitalLibrary from './pages/UserDigitalLibrary';

// Helper component for protected routes
const ProtectedRoute = ({ children, allowedTypes }) => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
 console.log('ProtectedRoute check:');
 console.log('loggedInUser:',loggedInUser);
 console.log('allowedTypes:',allowedTypes);
  if (!loggedInUser) { console.log('->Not loggedin,redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Ensure allowedTypes is always an array before using .includes
  if (allowedTypes && !Array.isArray(allowedTypes)) {
      console.error("ProtectedRoute: allowedTypes must be an array.");
      return <Navigate to="/login" replace />; // Or redirect to a generic error page
  }

  if (allowedTypes && !allowedTypes.includes(loggedInUser.type)) 
    { console.log('-> User type not allowed,redirectig based on type');
    if (loggedInUser.type === 'admin') return <Navigate to="/dashboard" replace />;
    if (loggedInUser.type === 'student') return <Navigate to="/student-dashboard" replace />;
    if (loggedInUser.type === 'staff') return <Navigate to="/staff-dashboard" replace />;
    return <Navigate to="/login" replace />; // Fallback
  }console.log('->Access granted');

  return children;
};


function App() {
  // Robust initialization of loggedInUser state from localStorage
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const user = localStorage.getItem('loggedInUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse loggedInUser from localStorage:", error);
      return null;
    }
  });

  // Effect to listen for localStorage changes for loggedInUser (e.g., logout from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem('loggedInUser');
      setLoggedInUser(user ? JSON.parse(user) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Runs once on mount and cleans up on unmount


  return (
    <div className="App">
      <Header /> {/* Always render Header */}

      <main style={{ flexGrow: 1, padding: '20px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={
            // If logged in and at /home, redirect to dashboard. Otherwise show HomePage.
            loggedInUser ? (
                loggedInUser.type === 'admin' ? <Navigate to="/dashboard" replace /> :
                loggedInUser.type === 'student' ? <Navigate to="/student-dashboard" replace /> :
                loggedInUser.type === 'staff' ? <Navigate to="/staff-dashboard" replace /> :
                <HomePage /> // Fallback if type is unknown but logged in
            ) : (
                <HomePage /> // If not logged in, show HomePage
            )
          } />

          {/* Default / route: Redirects to appropriate dashboard if logged in, otherwise to HomePage */}
          <Route path="/" element={
            loggedInUser ? (
              loggedInUser.type === 'admin' ? <Navigate to="/dashboard" replace /> :
              loggedInUser.type === 'student' ? <Navigate to="/student-dashboard" replace /> :
              loggedInUser.type === 'staff' ? <Navigate to="/staff-dashboard" replace /> :
              <Navigate to="/login" replace /> // Fallback for unknown type or corrupted data
            ) : (
              <HomePage /> // If NOT logged in, render HomePage
            )
          } />

          {/* Admin Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedTypes={['admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/student-management" element={<ProtectedRoute allowedTypes={['admin']}><StudentManagement /></ProtectedRoute>} />
          <Route path="/staff-management" element={<ProtectedRoute allowedTypes={['admin']}><StaffManagement /></ProtectedRoute>} />
           <Route path="/admin-timetable-management" element={<ProtectedRoute allowedTypes={['admin']}><AdminTimetableManagement /></ProtectedRoute>} /> {/* */}
<Route path="/results-management" element={<ProtectedRoute allowedTypes={['admin', 'staff']}><ResultsManagement /></ProtectedRoute>} />
<Route path="/view-reports" element={<ProtectedRoute allowedTypes={['admin', 'staff']}><ViewReports /></ProtectedRoute>} /><Route path="/academic-management" element={<ProtectedRoute allowedTypes={['admin']}><AcademicManagement /></ProtectedRoute>} />
          <Route path="/user-permissions-management" element={<ProtectedRoute allowedTypes={['admin']}><UserPermissionsManagement /></ProtectedRoute>} />
          <Route path="/admin-messaging" element={<ProtectedRoute allowedTypes={['admin']}><AdminMessaging /></ProtectedRoute>} />
          <Route path="/admin-fees-management" element={<ProtectedRoute allowedTypes={['admin']}><AdminFeesManagement /></ProtectedRoute>} />
          <Route path="/admin-calendar-management" element={<ProtectedRoute allowedTypes={['admin']}><AdminCalendarManagement /></ProtectedRoute>} />
          <Route path="/admin-syllabus-management" element={<ProtectedRoute allowedTypes={['admin']}><AdminSyllabusManagement /></ProtectedRoute>} />
          <Route path="/admin-results-approval" element={<ProtectedRoute allowedTypes={['admin']}><AdminResultsApproval /></ProtectedRoute>} />
          <Route path="/admin-digital-library" element={<ProtectedRoute allowedTypes={['admin']}><AdminDigitalLibrary /></ProtectedRoute>} />
          

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
          {/* Staff Protected Routes */}
          <Route path="/staff-dashboard" element={<ProtectedRoute allowedTypes={['staff']}><StaffDashboard/></ProtectedRoute>} />
          <Route path="/staff-profile" element={<ProtectedRoute allowedTypes={['staff']}><StaffProfile /></ProtectedRoute>} />
          <Route path="/staff-subjects" element={<ProtectedRoute allowedTypes={['staff']}><StaffSubjects /></ProtectedRoute>} />
          <Route path="/staff-calendar" element={<ProtectedRoute allowedTypes={['staff']}><StaffCalendar /></ProtectedRoute>} />
          <Route path="/staff-mails" element={<ProtectedRoute allowedTypes={['staff']}><StaffMails /></ProtectedRoute>} />
          <Route path="/staff-password-change" element={<ProtectedRoute allowedTypes={['staff']}><StaffPasswordChange /></ProtectedRoute>} />
          <Route path="/mark-attendance" element={<ProtectedRoute allowedTypes={['staff']}><MarkAttendance/></ProtectedRoute>} />
          <Route path="/results-management" element={<ProtectedRoute allowedTypes={['admin', 'staff']}><ResultsManagement /></ProtectedRoute>} />
          {/* MODIFIED LINE: Now allows both 'admin' and 'staff' */}
          <Route path="/view-reports" element={<ProtectedRoute allowedTypes={['admin', 'staff']}><ViewReports /></ProtectedRoute>} />
          <Route path="/staff-timetable" element={<ProtectedRoute allowedTypes={['staff']}><StaffTimetable /></ProtectedRoute>} /> 
          <Route path="/staff-digital-library" element={<ProtectedRoute allowedTypes={['staff']}><UserDigitalLibrary /></ProtectedRoute>} />
          {/* Catch-all route for 404 pages */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </main>
      <Footer /> {/* Always render Footer */}
    </div>
  );
}

export default App;