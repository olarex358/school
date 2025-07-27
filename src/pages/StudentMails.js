// src/pages/StudentMails.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage'; // Import useLocalStorage

// Import the mails icon
import mailsIcon from '../icon/mails.png';

function StudentMails() {
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const navigate = useNavigate();
  // Load all admin messages
  const [adminMessages] = useLocalStorage('schoolPortalAdminMessages', []);

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
    navigate('/login');
  };

  if (!loggedInStudent) {
    return <div className="content-section">Loading mails...</div>;
  }

  // Filter messages relevant to this student
  const studentRelevantMessages = adminMessages.filter(msg =>
    msg.recipientType === 'allStudents' ||
    (msg.recipientType === 'individualStudent' && msg.recipientId === loggedInStudent.admissionNo)
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first

  return (
    <div className="content-section">
      <h1>My Mails</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here are your recent messages and announcements:</p>

      {studentRelevantMessages.length > 0 ? (
        studentRelevantMessages.map(mail => (
          <div key={mail.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img src={mailsIcon} alt="Mail Icon" width="40px" height="40px" style={{ marginRight: '10px' }} />
              <div>
                <strong>Subject: {mail.subject}</strong><br/>
                <em>From: {mail.sender} | Date: {new Date(mail.timestamp).toLocaleDateString()} {new Date(mail.timestamp).toLocaleTimeString()}</em>
              </div>
            </div>
            <p>{mail.body}</p>
          </div>
        ))
      ) : (
        <p>No new messages for you.</p>
      )}

      <p style={{ marginTop: '20px' }}>
        For any mail-related issues or to compose a new message, please visit the IT support desk.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentMails;