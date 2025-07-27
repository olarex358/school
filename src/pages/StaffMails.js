// src/pages/StaffMails.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the mails icon
import mailsIcon from '../icon/mails.png';

function StaffMails() {
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
    return <div className="content-section">Loading staff mails...</div>;
  }

  return (
    <div className="content-section">
      <h1>Internal Mails (Staff View)</h1>
      <p>Welcome, {loggedInStaff.firstname} {loggedInStaff.surname}! Here are your recent internal messages:</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <img src={mailsIcon} alt="Mails Icon" width="60px" height="60px" style={{ marginRight: '15px' }} />
          <div>
            <strong>Subject: New Curriculum Guidelines for {new Date().getFullYear()} / {new Date().getFullYear() + 1} Academic Year</strong><br/>
            <em>From: Academic Head | Date: July 25, {new Date().getFullYear()}</em>
          </div>
        </div>
        <p style={{marginBottom: '10px'}}>
          Dear Staff, please review the attached document regarding the revised curriculum guidelines.
        </p>
        <hr style={{margin: '15px 0'}}/>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <img src={mailsIcon} alt="Mails Icon" width="60px" height="60px" style={{ marginRight: '15px' }} />
          <div>
            <strong>Subject: Important - Staff Meeting Reminder (August 1st)</strong><br/>
            <em>From: Principal's Office | Date: July 20, {new Date().getFullYear()}</em>
          </div>
        </div>
        <p>
          This is a reminder for the mandatory staff meeting on August 1st at 10:00 AM in the main hall.
        </p>
      </div>

      <p style={{ marginTop: '20px' }}>
        For composing new messages or accessing the full mail archive, please use the school's dedicated communication platform.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StaffMails;