// src/pages/StudentCertification.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the certification icon
import certificationIcon from '../icon/certification.png';

function StudentCertification() {
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
    return <div className="content-section">Loading certification details...</div>;
  }

  return (
    <div className="content-section">
      <h1>My Certification</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here are your academic certifications:</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center' }}>
        <img src={certificationIcon} alt="Certification Icon" width="80px" height="80px" style={{ marginRight: '20px' }} />
        <div>
            <h3>High School Diploma - Class of {new Date().getFullYear() - 1}</h3>
            <p>Awarded for successful completion of all academic requirements.</p>
            <p><strong>Date Issued:</strong> June {new Date().getFullYear() - 1}, Busari-alao College</p>
            <p style={{fontStyle: 'italic', color: '#555'}}>Status: Verified</p>
        </div>
      </div>

      <p style={{ marginTop: '20px' }}>
        For official transcripts and verification of your certification, please contact the school administration office.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentCertification;