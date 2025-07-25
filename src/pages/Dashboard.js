// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation

// Import icons (assuming you've placed these in a publicly accessible or asset folder)
// For this example, we'll assume a direct path from the public folder or similar setup
// In a real app, you might import them directly if using a build tool that handles images.
import studentIcon from '../icon/profile.png'; //
import resultIcon from '../icon/attendance.png'; // Using attendance icon for results as per your admin.html card
import academicIcon from '../icon/subject.png'; // Using subject icon for academic as per your admin.html card
import masterResultIcon from '../icon/result.png'; // Using result icon for master result as per your admin.html card
import staffIcon from '../icon/password.png'; // Using password icon for staff as per your admin.html card
import permissionsIcon from '../icon/settings.png'; // Using settings icon for permissions as per your admin.html card


function Dashboard() {
  const navigate = useNavigate(); // Hook to get the navigate function

  // States to hold counts
  const [studentCount, setStudentCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [resultEntryCount, setResultEntryCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  // useEffect to load counts from localStorage on component mount
  useEffect(() => {
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
  }, []); // Empty dependency array means this runs only once on mount

  const handleCardClick = (path) => {
    navigate(path); // Programmatically navigate to the given path
  };

  return (
    <div className="content-section">
      <h1>Admin Portal Dashboard</h1>
      <div className="top-nav">
         {/* This section could be for welcome message or user profile info */}
         {/* Placeholder, you can add dynamic user info here later */}
         <h2>Welcome Admin!</h2>
      </div>
      <div className="cards-container">
        <div className="card" onClick={() => handleCardClick('/student-management')}>
          <img src={studentIcon} alt="Register Students" width="50px" height="50px" />
          Register Students ({studentCount})
        </div>
        <div className="card" onClick={() => handleCardClick('/results-management')}>
          <img src={resultIcon} alt="Input Result" width="50px" height="50px" />
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
      </div>
    </div>
  );
}

export default Dashboard;
