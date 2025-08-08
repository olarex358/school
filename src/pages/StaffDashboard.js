// src/pages/StaffDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { hasPermission } from '../permissions';

// Import icons for cards
import profileIcon from '../icon/profile.png';
import resultsInputIcon from '../icon/attendance.png';
import viewReportsIcon from '../icon/result.png';
import subjectIcon from '../icon/subject.png';
import calendarIcon from '../icon/calender.png';
import mailsIcon from '../icon/mails.png';
import passwordIcon from '../icon/password.png';
import attendanceIcon from '../icon/attendance.png';
import timetableIcon from '../icon/calender.png'; 
import libraryIcon from '../icon/library.png';

const staffNavLinks = [
  { to: "/staff-profile", text: "My Profile", icon: profileIcon },
  { to: "/results-management", text: "Input Results", icon: resultsInputIcon },
  { to: "/view-reports", text: "View Reports", icon: viewReportsIcon },
  { to: "/mark-attendance", text: "Mark Attendance", icon: attendanceIcon },
  { to: "/staff-subjects", text: "My Subjects", icon: subjectIcon },
  { to: "/staff-calendar", text: "School Calendar", icon: calendarIcon },
  { to: "/staff-mails", text: "Internal Mails", icon: mailsIcon },
  { to: "/staff-timetable", text: "My Timetable", icon: timetableIcon },
  { to: "/staff-digital-library", text: "Digital Library", icon: libraryIcon }, 
  { to: "/staff-password-change", text: "Change Password", icon: passwordIcon },
];

function StaffDashboard() {
  const [staffInfo, setStaffInfo] = useState(null);
  const navigate = useNavigate();

  const {
    staffs,
    loading,
    error
  } = useData();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'staff') {
      const detailedStaffInfo = staffs.find(s => s.staffId === loggedInUser.staffId);
      if (detailedStaffInfo) {
        setStaffInfo(detailedStaffInfo);
      } else {
        console.error("Logged-in staff not found in database.");
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate, staffs]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    navigate('/home');
  };

  const handleCardClick = (path) => {
    navigate(path);
  };
  
  if (!staffInfo || loading) {
    return <div className="content-section">Loading staff dashboard...</div>;
  }
  
  if (error) {
    return <div className="content-section">Error loading data: {error.message}</div>;
  }

  // Filter links based on permissions
  const filteredNavLinks = staffNavLinks.filter(link => hasPermission('staff', link.to));

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Busari-alao College</h2>
        <ul>
            {filteredNavLinks.map(link => (
              <li key={link.to}><Link to={link.to}>{link.text}</Link></li>
            ))}
        </ul>
        <button type="button" onClick={handleLogout}>Logout</button>
      </aside>
      <div className="main-content">
          <h1>Staff Dashboard</h1>
          <div className="top-nav">
              <h2> Welcome, {staffInfo.firstname} {staffInfo.surname}</h2>
              <p><strong>Role:</strong><span>{staffInfo.role}</span></p>
          </div>
          <div className="cards-container">
              {filteredNavLinks.map(link => (
                <div className="card" key={link.to} onClick={() => handleCardClick(link.to)}>
                    <img src={link.icon} alt={link.text} width="50px" height="50px"/>
                    {link.text}
                </div>
              ))}
          </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
