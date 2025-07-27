// src/pages/StaffCalendar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the calendar icon
import calendarIcon from '../icon/calender.png';

function StaffCalendar() {
  const [loggedInStaff, setLoggedInStaff] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    // Ensure user is logged in and is staff
    if (user && user.type === 'staff') {
      setLoggedInStaff(user);
    } else {
      navigate('/login'); // Redirect if not logged in as staff
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  if (!loggedInStaff) {
    return <div className="content-section">Loading staff calendar...</div>;
  }

  return (
    <div className="content-section">
      <h1>School Calendar (Staff View)</h1>
      <p>Welcome, {loggedInStaff.firstname} {loggedInStaff.surname}! Here are the important dates and events for staff:</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center' }}>
        <img src={calendarIcon} alt="Calendar Icon" width="80px" height="80px" style={{ marginRight: '20px' }} />
        <div>
          <h3>Academic Year {new Date().getFullYear()} - Key Staff Dates</h3>
          <p><strong>August 10:</strong> Staff Orientation & Training</p>
          <p><strong>September 01:</strong> First Term Begins (Classes Resume)</p>
          <p><strong>October 1:</strong> Faculty Meeting - Q1 Review</p>
          <p><strong>November 25:</strong> Grade Submission Deadline - Term 1</p>
          <p><strong>December 15:</strong> Staff Holiday Party</p>
          <p style={{marginTop: '10px', fontStyle: 'italic', color: '#555'}}>Detailed departmental schedules are available on the internal portal.</p>
        </div>
      </div>

      <p style={{ marginTop: '20px' }}>
        For a comprehensive and interactive calendar, please check the school's internal staff portal.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StaffCalendar;