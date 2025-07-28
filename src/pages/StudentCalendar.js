// src/pages/StudentCalendar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

// Import the calendar icon
import calendarIcon from '../icon/calender.png'; // Corrected spelling

function StudentCalendar() {
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const navigate = useNavigate();
  // NEW: Load calendar events
  const [allCalendarEvents] = useLocalStorage('schoolPortalCalendarEvents', []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'student') {
      setLoggedInStudent(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  if (!loggedInStudent) {
    return <div className="content-section">Loading calendar...</div>;
  }

  // Filter events relevant to students (all or just student-specific if implemented)
  const studentRelevantEvents = allCalendarEvents.filter(event =>
    event.audience === 'all' || event.audience === 'students'
  ).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date


  return (
    <div className="content-section">
      <h1>My Calendar</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here are your important dates and events:</p>

      {studentRelevantEvents.length > 0 ? (
        studentRelevantEvents.map(event => (
          <div key={event.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center' }}>
            <img src={calendarIcon} alt="Calendar Icon" width="40px" height="40px" style={{ marginRight: '15px', flexShrink: 0 }} />
            <div>
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {event.date}</p>
              <p>{event.description}</p>
              <p style={{ marginTop: '5px', fontStyle: 'italic', color: '#555' }}>Audience: {event.audience.charAt(0).toUpperCase() + event.audience.slice(1)}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No calendar events posted for students yet.</p>
      )}

      <p style={{ marginTop: '20px' }}>
        For a more detailed and interactive calendar, please visit the school's official website.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentCalendar;