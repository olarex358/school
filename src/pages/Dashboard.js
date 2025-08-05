// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
// Import icons
import studentIcon from '../icon/profile.png';
import resultsInputIcon from '../icon/attendance.png';
import academicIcon from '../icon/subject.png';
import masterResultIcon from '../icon/result.png';
import staffIcon from '../icon/password.png';
import permissionsIcon from '../icon/settings.png';
import mailsIcon from '../icon/mails.png';
import feesIcon from '../icon/fees.png';
import calendarIcon from '../icon/calender.png';
import syllabusIcon from '../icon/sylabus.png';
import pendingResultsIcon from '../icon/warning.png';
import timetableIcon from '../icon/calender.png';
import digitalLibraryIcon from '../icon/result.png';
import certificationIcon from '../icon/certification.png';

function Dashboard() {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState(null);

  // Load data via hook for real-time updates
  const [students, , loadingStudents] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  const [staffs, , loadingStaffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');
  const [subjects, , loadingSubjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');
  const [results, , loadingResults] = useLocalStorage('schoolPortalResults', [], 'http://localhost:5000/api/schoolPortalResults');
  const [users, , loadingUsers] = useLocalStorage('schoolPortalUsers', [], 'http://localhost:5000/api/schoolPortalUsers');
  const [feeRecords, , loadingFeeRecords] = useLocalStorage('schoolPortalFeeRecords', [], 'http://localhost:5000/api/schoolPortalFeeRecords');
  const [calendarEvents, , loadingCalendarEvents] = useLocalStorage('schoolPortalCalendarEvents', [], 'http://localhost:5000/api/schoolPortalCalendarEvents');
  const [syllabusEntries, , loadingSyllabusEntries] = useLocalStorage('schoolPortalSyllabusEntries', [], 'http://localhost:5000/api/schoolPortalSyllabusEntries');
  const [pendingResults, , loadingPendingResults] = useLocalStorage('schoolPortalPendingResults', [], 'http://localhost:5000/api/schoolPortalPendingResults');
  const [digitalResources, , loadingDigitalResources] = useLocalStorage('schoolPortalDigitalLibrary', [], 'http://localhost:5000/api/schoolPortalDigitalLibrary');
  const [certifications, , loadingCertifications] = useLocalStorage('schoolPortalCertificationResults', [], 'http://localhost:5000/api/schoolPortalCertificationResults');
  
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'admin') {
      setAdminInfo(loggedInUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleCardClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  const loading = loadingStudents || loadingStaffs || loadingSubjects || loadingResults || loadingUsers || loadingFeeRecords || loadingCalendarEvents || loadingSyllabusEntries || loadingPendingResults || loadingDigitalResources || loadingCertifications;

  if (!adminInfo || loading) {
      return <div className="content-section">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Busari-alao College</h2>
        <ul>
            {/* Admin sidebar links */}
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/student-management">Student Management</Link></li>
            <li><Link to="/staff-management">Staff Management</Link></li>
            <li><Link to="/results-management">Results Management</Link></li>
            <li><Link to="/admin-results-approval">Results Approval ({pendingResults.length})</Link></li>
            <li><Link to="/view-reports">View Reports</Link></li>
            <li><Link to="/academic-management">Academic Management</Link></li>
            <li><Link to="/user-permissions-management">User/Permissions Management</Link></li>
            <li><Link to="/admin-messaging">Admin Messaging</Link></li>
            <li><Link to="/admin-fees-management">Fee Management</Link></li>
            <li><Link to="/admin-calendar-management">Calendar Management</Link></li>
            <li><Link to="/admin-syllabus-management">Syllabus Management</Link></li>
            <li><Link to="/admin-timetable-management">Timetable Management</Link></li>
            <li><Link to="/admin-digital-library">Digital Library ({digitalResources.length})</Link></li>
            <li><Link to="/admin-certification-management">Certification Management ({certifications.length})</Link></li>
        </ul>
        <button type="button" id="logoutBtn" onClick={handleLogout}>Logout</button>
      </aside>
      <div className="main-content">
          <h1>Admin Portal Dashboard</h1>
          <div className="top-nav">
              <h2>Welcome, {adminInfo.username}!</h2>
          </div>
          <div className="cards-container">
              <div className="card" onClick={() => handleCardClick('/student-management')}>
                  <img src={studentIcon} alt="Register Students" width="50px" height="50px" />
                  Register Students ({students.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/results-management')}>
                  <img src={resultsInputIcon} alt="Input Result" width="50px" height="50px" />
                  Input Results ({results.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/admin-results-approval')}>
                  <img src={pendingResultsIcon} alt="Results Approval" width="50px" height="50px" />
                  Results Approval ({pendingResults.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/academic-management')}>
                  <img src={academicIcon} alt="Academic Management" width="50px" height="50px" />
                  Academic Management ({subjects.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/view-reports')}>
                  <img src={masterResultIcon} alt="Master Result" width="50px" height="50px" />
                  Master Results (Reports)
              </div>
              <div className="card" onClick={() => handleCardClick('/staff-management')}>
                  <img src={staffIcon} alt="Staff Management" width="50px" height="50px" />
                  Staff Management ({staffs.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/user-permissions-management')}>
                  <img src={permissionsIcon} alt="User Permissions" width="50px" height="50px" />
                  User Permissions ({users.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/admin-messaging')}>
                  <img src={mailsIcon} alt="Admin Messaging" width="50px" height="50px" />
                  Admin Messaging
              </div>
              <div className="card" onClick={() => handleCardClick('/admin-fees-management')}>
                  <img src={feesIcon} alt="Fee Management" width="50px" height="50px" />
                  Fee Management ({feeRecords.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/admin-calendar-management')}>
                  <img src={calendarIcon} alt="Calendar Management" width="50px" height="50px" />
                  Calendar Management ({calendarEvents.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/admin-syllabus-management')}>
                  <img src={syllabusIcon} alt="Syllabus Management" width="50px" height="50px" />
                  Syllabus Management ({syllabusEntries.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/admin-timetable-management')}>
                  <img src={timetableIcon} alt="Timetable Management" width="50px" height="50px" />
                  Timetable Management
              </div>
              <div className="card" onClick={() => handleCardClick('/admin-digital-library')}>
                  <img src={digitalLibraryIcon} alt="Digital Library" width="50px" height="50px" />
                  Digital Library ({digitalResources.length})
              </div>
              <div className="card" onClick={() => handleCardClick('/admin-certification-management')}>
                  <img src={certificationIcon} alt="Certification Management" width="50px" height="50px" />
                  Certification Management ({certifications.length})
              </div>
          </div>
      </div>
    </div>
  );
}

export default Dashboard;