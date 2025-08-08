// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { hasPermission } from '../permissions';

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
import digitalLibraryIcon from '../icon/library.png';
import certificationIcon from '../icon/certification.png';

const adminNavLinks = [
  { to: "/dashboard", text: "Dashboard", icon: masterResultIcon },
  { to: "/student-management", text: "Student Management", icon: studentIcon },
  { to: "/staff-management", text: "Staff Management", icon: staffIcon },
  { to: "/results-management", text: "Results Management", icon: resultsInputIcon },
  { to: "/admin-results-approval", text: "Results Approval", icon: pendingResultsIcon },
  { to: "/view-reports", text: "View Reports", icon: masterResultIcon },
  { to: "/academic-management", text: "Academic Management", icon: academicIcon },
  { to: "/user-permissions-management", text: "User/Permissions Management", icon: permissionsIcon },
  { to: "/admin-messaging", text: "Admin Messaging", icon: mailsIcon },
  { to: "/admin-fees-management", text: "Fee Management", icon: feesIcon },
  { to: "/admin-calendar-management", text: "Calendar Management", icon: calendarIcon },
  { to: "/admin-syllabus-management", text: "Syllabus Management", icon: syllabusIcon },
  { to: "/admin-timetable-management", text: "Timetable Management", icon: timetableIcon },
  { to: "/admin-digital-library", text: "Digital Library", icon: digitalLibraryIcon },
  { to: "/admin-certification-management", text: "Certification Management", icon: certificationIcon },
];

function Dashboard() {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState(null);

  const { 
    students, staffs, subjects, results, pendingResults,
    certificationResults, feeRecords, calendarEvents,
    syllabusEntries, digitalLibrary, users, loading, error
  } = useData();
  
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
    localStorage.removeItem('token');
    navigate('/home');
  };

  if (!adminInfo) {
      return <div className="content-section">Loading admin info...</div>;
  }
  
  if (loading) {
      return <div className="content-section">Loading data...</div>;
  }

  if (error) {
    return <div className="content-section">Error loading data: {error.message}</div>;
  }

  const filteredNavLinks = adminNavLinks.filter(link => hasPermission('admin', link.to));

  const getCount = (path) => {
    switch (path) {
      case '/student-management': return students?.length || 0;
      case '/staff-management': return staffs?.length || 0;
      case '/results-management': return results?.length || 0;
      case '/admin-results-approval': return pendingResults?.length || 0;
      case '/academic-management': return subjects?.length || 0;
      case '/user-permissions-management': return users?.length || 0;
      case '/admin-fees-management': return feeRecords?.length || 0;
      case '/admin-calendar-management': return calendarEvents?.length || 0;
      case '/admin-syllabus-management': return syllabusEntries?.length || 0;
      case '/admin-digital-library': return digitalLibrary?.length || 0;
      case '/admin-certification-management': return certificationResults?.length || 0;
      default: return null;
    }
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Busari-alao College</h2>
        <ul>
            {filteredNavLinks.map(link => (
              <li key={link.to}><Link to={link.to}>{link.text}</Link></li>
            ))}
        </ul>
        <button type="button" id="logoutBtn" onClick={handleLogout}>Logout</button>
      </aside>
      <div className="main-content">
          <h1>Admin Portal Dashboard</h1>
          <div className="top-nav">
              <h2>Welcome, {adminInfo.username}!</h2>
          </div>
          <div className="cards-container">
              {filteredNavLinks.map(link => (
                <div className="card" key={link.to} onClick={() => handleCardClick(link.to)}>
                    <img src={link.icon} alt={link.text} width="50px" height="50px" />
                    {link.text}
                    {getCount(link.to) !== null && ` (${getCount(link.to)})`}
                </div>
              ))}
          </div>
      </div>
    </div>
  );
}

export default Dashboard;
