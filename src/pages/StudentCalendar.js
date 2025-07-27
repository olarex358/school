// src/pages/StudentCalendar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the calendar icon
import calendarIcon from '../icon/calender.png';
function StudentCalendar() {
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
    return <div className="content-section">Loading calendar...</div>;
  }

  return (
    <div className="content-section">
      <h1>My Calendar</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here are your important dates and events:</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center' }}>
        <img src="/calender.png" alt="Calendar Icon" width="80px" height="80px" style={{ marginRight: '20px' }} />
        <img src={calendarIcon} alt="Calendar Icon" width="80px" height="80px" style={{ marginRight: '20px' }} />
        <div>
          <h3>Academic Year {new Date().getFullYear()} - Key Dates</h3>
          <p><strong>August 15:</strong> New Academic Year Begins</p>
          <p><strong>September 10-15:</strong> First Term Exams</p>
          <p><strong>October 20:</strong> Parent-Teacher Conference</p>
          <p><strong>December 20 - January 5:</strong> Winter Break</p>
          <p style={{marginTop: '10px', fontStyle: 'italic', color: '#555'}}>Check back regularly for updates to the school calendar.</p>
        </div>
      </div>

      <p style={{ marginTop: '20px' }}>
        For a more detailed and interactive calendar, please visit the school's official website.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentCalendar;