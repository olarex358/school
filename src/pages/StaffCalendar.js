// src/pages/StaffCalendar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

// Import the calendar icon
import calendarIcon from '../icon/calender.png';

function StaffCalendar() {
  const [loggedInStaff, setLoggedInStaff] = useState(null);
  const navigate = useNavigate();

  // Load calendar events
  const [allCalendarEvents, , loadingEvents] = useLocalStorage('schoolPortalCalendarEvents', [], 'http://localhost:5000/api/schoolPortalCalendarEvents');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'staff') {
      setLoggedInStaff(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  if (!loggedInStaff || loadingEvents) {
    return <div className="content-section">Loading calendar...</div>;
  }

  // Filter events relevant to staff
  const staffRelevantEvents = allCalendarEvents.filter(event =>
    event.audience === 'all' || event.audience === 'staff'
  ).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

  return (
    <div className="content-section">
      <h1>School Calendar (Staff View)</h1>
      <p>Welcome, {loggedInStaff.firstname} {loggedInStaff.surname}! Here are the important school dates and events:</p>

      {staffRelevantEvents.length > 0 ? (
        staffRelevantEvents.map(event => (
          <div key={event._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center' }}>
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
        <p>No calendar events posted for staff yet.</p>
      )}

      <p style={{ marginTop: '20px' }}>
        For more information on school events, please contact the administration office.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StaffCalendar;