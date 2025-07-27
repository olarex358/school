// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Import icons for cards (ensure these paths are correct relative to src/pages/)
import studentIcon from '../icon/profile.png';
import resultsInputIcon from '../icon/attendance.png'; // Using attendance icon for input results
import academicIcon from '../icon/subject.png';
import masterResultIcon from '../icon/result.png';
import staffIcon from '../icon/password.png';
import permissionsIcon from '../icon/settings.png';
import mailsIcon from '../icon/mails.png';


function Dashboard() {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState(null); // State to hold logged-in admin info

  // States to hold counts
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [resultEntryCount, setResultEntryCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'admin') {
        setAdminInfo(loggedInUser); // Set admin info
    } else {
        navigate('/login'); // Redirect if not logged in as admin
    }

    // Load counts from localStorage
    const storedStudents = localStorage.getItem('schoolPortalStudents');
    if (storedStudents) {
      setStudentCount(JSON.parse(storedStudents).length);
    }
    const storedStaff = localStorage.getItem('schoolPortalStaff');
    if (storedStaff) {
      setStaffCount(JSON.parse(storedStaff).length);
    }
    const storedSubjects = localStorage.getItem('schoolPortalSubjects');
    if (storedSubjects) {
      setSubjectCount(JSON.parse(storedSubjects).length);
    }
    const storedResults = localStorage.getItem('schoolPortalResults');
    if (storedResults) {
      setResultEntryCount(JSON.parse(storedResults).length);
    }
    const storedUsers = localStorage.getItem('schoolPortalUsers');
    if (storedUsers) {
      setUserCount(JSON.parse(storedUsers).length);
    }
  }, [navigate]);

  const handleCardClick = (path) => {
    navigate(path);
  };

  // LOGOUT FUNCTIONALITY
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser'); // Clear login state
    navigate('/login'); // Redirect to login page
  };

  if (!adminInfo) {
      return <div className="content-section">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="container">
        <aside className="sidebar">
            <h2>Busari-alao College</h2>
            <ul>
                {/* Admin sidebar navigation links */}
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/student-management">Student Management</Link></li>
                <li><Link to="/staff-management">Staff Management</Link></li>
                <li><Link to="/results-management">Results Management</Link></li>
                <li><Link to="/view-reports">View Reports</Link></li>
                <li><Link to="/academic-management">Academic Management</Link></li>
                <li><Link to="/user-permissions-management">User/Permissions Management</Link></li>
                <li><Link to="/admin-messaging">Admin Messaging</Link></li>
            </ul>
            <button type="button" id="logoutBtn" onClick={handleLogout}>Logout</button> {/* LOGOUT BUTTON */}
        
            </aside>

        <div className="main-content">
            <h1>Admin Portal Dashboard</h1>
            <div className="top-nav">
                <h2>Welcome, {adminInfo.username}!</h2>
            </div>
            <div className="cards-container">
                <div className="card" onClick={() => handleCardClick('/student-management')}>
                  <img src={studentIcon} alt="Register Students" width="50px" height="50px" />
                  Register Students ({studentCount})
                </div>
                <div className="card" onClick={() => handleCardClick('/results-management')}>
                  <img src={resultsInputIcon} alt="Input Result" width="50px" height="50px" />
                  Input Results ({resultEntryCount})
                </div>
                <div className="card" onClick={() => handleCardClick('/academic-management')}>
                  <img src={academicIcon} alt="Academic Management" width="50px" height="50px" />
                  Academic Management ({subjectCount})
                </div>
                <div className="card" onClick={() => handleCardClick('/view-reports')}>
                  <img src={masterResultIcon} alt="Master Result" width="50px" height="50px" />
                  Master Results (Reports)
                </div>
                <div className="card" onClick={() => handleCardClick('/staff-management')}>
                  <img src={staffIcon} alt="Staff Management" width="50px" height="50px" />
                  Staff Management ({staffCount})
                </div>
                <div className="card" onClick={() => handleCardClick('/user-permissions-management')}>
                  <img src={permissionsIcon} alt="User Permissions" width="50px" height="50px" />
                  User Permissions ({userCount})
                </div>
                <div className="card" onClick={() => handleCardClick('/admin-messaging')}>
                  <img src={mailsIcon} alt="Admin Messaging" width="50px" height="50px" />
                  Mail Management
                </div>
                
            </div>
        </div>
    </div>
  );
}

export default Dashboard;