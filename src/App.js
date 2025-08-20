// src/App.js
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { useAuth } from './hooks/AuthContext';

// Import all your page components with correct paths
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

// Import Admin Messaging
import AdminMessaging from './pages/AdminMessaging';
import AdminFeesManagement from './pages/AdminFeesManagement';

// Import Admin Calendar and Syllabus Management
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

import { hasPermission } from './permissions';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine the user's role. Use 'guest' if not logged in.
  const userRole = user ? user.type : 'guest';
  
  // Check if the user has permission to access the current route
  if (!hasPermission(userRole, location.pathname)) {
    // Redirect logic for unauthorized users
    if (user) {
      if (user.type === 'admin') return <Navigate to="/dashboard" replace />;
      if (user.type === 'student') return <Navigate to="/student-dashboard" replace />;
      if (user.type === 'staff') return <Navigate to="/staff-dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Header />
      <main style={{ flexGrow: 1, padding: '20px' }}>
        <Routes>
          {/* Public Routes - no protection needed */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<HomePage />} />

          {/* All other routes are now protected by the single ProtectedRoute component */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/student-management" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
          <Route path="/staff-management" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
          <Route path="/results-management" element={<ProtectedRoute><ResultsManagement /></ProtectedRoute>} />
          <Route path="/admin-results-approval" element={<ProtectedRoute><AdminResultsApproval /></ProtectedRoute>} />
          <Route path="/view-reports" element={<ProtectedRoute><ViewReports /></ProtectedRoute>} />
          <Route path="/academic-management" element={<ProtectedRoute><AcademicManagement /></ProtectedRoute>} />
          <Route path="/user-permissions-management" element={<ProtectedRoute><UserPermissionsManagement /></ProtectedRoute>} />
          <Route path="/admin-messaging" element={<ProtectedRoute><AdminMessaging /></ProtectedRoute>} />
          <Route path="/admin-fees-management" element={<ProtectedRoute><AdminFeesManagement /></ProtectedRoute>} />
          <Route path="/admin-calendar-management" element={<ProtectedRoute><AdminCalendarManagement /></ProtectedRoute>} />
          <Route path="/admin-syllabus-management" element={<ProtectedRoute><AdminSyllabusManagement /></ProtectedRoute>} />
          <Route path="/admin-timetable-management" element={<ProtectedRoute><AdminTimetableManagement /></ProtectedRoute>} />
          <Route path="/admin-digital-library" element={<ProtectedRoute><AdminDigitalLibrary /></ProtectedRoute>} />
          <Route path="/admin-certification-management" element={<ProtectedRoute><AdminCertificationManagement /></ProtectedRoute>} />

          <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student-profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
          <Route path='/student-results' element={<ProtectedRoute><StudentResults /></ProtectedRoute>} />
          <Route path='/student-syllabus' element={<ProtectedRoute><StudentSyllabus /></ProtectedRoute>} />
          <Route path='/student-certification' element={<ProtectedRoute><StudentCertification /></ProtectedRoute>} />
          <Route path='/student-attendance' element={<ProtectedRoute><StudentAttendance /></ProtectedRoute>} />
          <Route path='/student-subjects' element={<ProtectedRoute><StudentSubjects /></ProtectedRoute>} />
          <Route path='/student-calendar' element={<ProtectedRoute><StudentCalendar /></ProtectedRoute>} />
          <Route path='/student-fees' element={<ProtectedRoute><StudentFees /></ProtectedRoute>} />
          <Route path='/student-mails' element={<ProtectedRoute><StudentMails /></ProtectedRoute>} />
          <Route path='/student-password-change' element={<ProtectedRoute><StudentPasswordChange /></ProtectedRoute>} />
          <Route path='/student-timetable' element={<ProtectedRoute><StudentTimetable /></ProtectedRoute>} />
          <Route path='/student-digital-library' element={<ProtectedRoute><UserDigitalLibrary /></ProtectedRoute>} />
          <Route path='/student-certification-registration' element={<ProtectedRoute><StudentCertificationRegistration /></ProtectedRoute>} />

          <Route path="/staff-dashboard" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff-profile" element={<ProtectedRoute><StaffProfile /></ProtectedRoute>} />
          <Route path="/staff-subjects" element={<ProtectedRoute><StaffSubjects /></ProtectedRoute>} />
          <Route path="/staff-calendar" element={<ProtectedRoute><StaffCalendar /></ProtectedRoute>} />
          <Route path="/staff-mails" element={<ProtectedRoute><StaffMails /></ProtectedRoute>} />
          <Route path="/staff-password-change" element={<ProtectedRoute><StaffPasswordChange /></ProtectedRoute>} />
          <Route path="/mark-attendance" element={<ProtectedRoute><MarkAttendance /></ProtectedRoute>} />
          <Route path="/staff-timetable" element={<ProtectedRoute><StaffTimetable /></ProtectedRoute>} />
          <Route path="/staff-digital-library" element={<ProtectedRoute><UserDigitalLibrary /></ProtectedRoute>} />
          
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;