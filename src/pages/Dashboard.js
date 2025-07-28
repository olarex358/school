// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
import syllabusIcon from '../icon/sylabus.png'; // NEW: Import syllabus icon


function Dashboard() {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState(null);

  // States to hold counts
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [resultEntryCount, setResultEntryCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [feeRecordCount, setFeeRecordCount] = useState(0);
  const [calendarEventCount, setCalendarEventCount] = useState(0);
  const [syllabusEntryCount, setSyllabusEntryCount] = useState(0); // NEW: Syllabus Entry Count

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'admin') {
        setAdminInfo(loggedInUser);
    } else {
        navigate('/login');
    }

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
    const storedFeeRecords = localStorage.getItem('schoolPortalFeeRecords');
    if (storedFeeRecords) {
        setFeeRecordCount(JSON.parse(storedFeeRecords).length);
    }
    const storedCalendarEvents = localStorage.getItem('schoolPortalCalendarEvents');
    if (storedCalendarEvents) {
        setCalendarEventCount(JSON.parse(storedCalendarEvents).length);
    }
    // NEW: Load syllabus entry count
    const storedSyllabusEntries = localStorage.getItem('schoolPortalSyllabusEntries');
    if (storedSyllabusEntries) {
        setSyllabusEntryCount(JSON.parse(storedSyllabusEntries).length);
    }
  }, [navigate]);

  const handleCardClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  if (!adminInfo) {
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
                <li><Link to="/view-reports">View Reports</Link></li>
                <li><Link to="/academic-management">Academic Management</Link></li>
                <li><Link to="/user-permissions-management">User/Permissions Management</Link></li>
                <li><Link to="/admin-messaging">Admin Messaging</Link></li>
                <li><Link to="/admin-fees-management">Fee Management</Link></li>
                <li><Link to="/admin-calendar-management">Calendar Management</Link></li>
                <li><Link to="/admin-syllabus-management">Syllabus Management</Link></li> {/* NEW ADMIN SIDEBAR LINK */}
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
                  Admin Messaging
                </div>
                <div className="card" onClick={() => handleCardClick('/admin-fees-management')}>
                  <img src={feesIcon} alt="Fee Management" width="50px" height="50px" />
                  Fee Management ({feeRecordCount})
                </div>
                <div className="card" onClick={() => handleCardClick('/admin-calendar-management')}>
                  <img src={calendarIcon} alt="Calendar Management" width="50px" height="50px" />
                  Calendar Management ({calendarEventCount})
                </div>
                {/* NEW ADMIN DASHBOARD CARD */}
                <div className="card" onClick={() => handleCardClick('/admin-syllabus-management')}>
                  <img src={syllabusIcon} alt="Syllabus Management" width="50px" height="50px" />
                  Syllabus Management ({syllabusEntryCount})
                </div>
            </div>
        </div>
    </div>
  );
}

export default Dashboard;