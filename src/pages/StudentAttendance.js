// src/pages/StudentAttendance.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the attendance icon
import attendanceIcon from '../icon/attendance.png';

function StudentAttendance() {
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    // Ensure user is logged in and is a student
    if (user && user.type === 'student') {
      setLoggedInStudent(user);
    } else {
      navigate('/login'); // Redirect if not logged in as a student
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  if (!loggedInStudent) {
    return <div className="content-section">Loading attendance records...</div>;
  }

  return (
    <div className="content-section">
      <h1>My Attendance</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here is your attendance overview:</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center' }}>
        <img src={attendanceIcon} alt="Attendance Icon" width="80px" height="80px" style={{ marginRight: '20px' }} />
        <div>
          <h3>Term 1: September - December {new Date().getFullYear()}</h3>
          <p><strong>Classes Attended:</strong> 95 out of 100</p>
          <p><strong>Attendance Rate:</strong> 95%</p>
          <p><strong>Late Arrivals:</strong> 2</p>
          <p style={{marginTop: '10px', color: 'blue', fontWeight: 'bold'}}>Status: Excellent</p> {/* Placeholder status */}
        </div>
      </div>

      <p style={{ marginTop: '20px' }}>
        For detailed attendance breakdown by subject or date, please contact your class teacher.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentAttendance;