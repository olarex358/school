// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer'; // <--- Ensure this line is present

// Import your page components
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import StaffManagement from './pages/StaffManagement';
import ResultsManagement from './pages/ResultsManagement';
import ViewReports from './pages/ViewReports';
import AcademicManagement from './pages/AcademicManagement';
import UserPermissionsManagement from './pages/UserPermissionsManagement';

function App() {
  return (
    <div className="App">
      <Header />
      <main style={{ flexGrow: 1, padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student-management" element={<StudentManagement />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/results-management" element={<ResultsManagement />} />
          <Route path="/view-reports" element={<ViewReports />} />
          <Route path="/academic-management" element={<AcademicManagement />} />
          <Route path="/user-permissions-management" element={<UserPermissionsManagement />} />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </main>
      <Footer /> {/* <--- Ensure this line is present */}
    </div>
  );
}

export default App;