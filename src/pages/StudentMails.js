// src/pages/StudentMails.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the mails icon
import mailsIcon from '../icon/mails.png';

function StudentMails() {
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
    return <div className="content-section">Loading mails...</div>;
  }

  return (
    <div className="content-section">
      <h1>My Mails</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here are your recent messages and announcements:</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <img src={mailsIcon} alt="Mails Icon" width="60px" height="60px" style={{ marginRight: '15px' }} />
          <div>
            <strong>Subject: Important Announcement - Term Exams Schedule</strong><br/>
            <em>From: School Administration | Date: July 20, 2025</em>
          </div>
        </div>
        <p style={{marginBottom: '10px'}}>
          Dear Students, please find the updated schedule for the upcoming term examinations.
          Ensure you prepare adequately and adhere to the guidelines.
        </p>
        <hr style={{margin: '15px 0'}}/>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <img src={mailsIcon} alt="Mails Icon" width="60px" height="60px" style={{ marginRight: '15px' }} />
          <div>
            <strong>Subject: Your Results are Available!</strong><br/>
            <em>From: Academic Department | Date: July 15, 2025</em>
          </div>
        </div>
        <p>
          Your first term results have been published. You can view them on the "My Results" page.
        </p>
      </div>

      <p style={{ marginTop: '20px' }}>
        For any mail-related issues or to compose a new message, please visit the IT support desk.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentMails;