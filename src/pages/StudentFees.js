// src/pages/StudentFees.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the fees icon
import feesIcon from '../icon/fees.png';

function StudentFees() {
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
    return <div className="content-section">Loading fee details...</div>;
  }

  return (
    <div className="content-section">
      <h1>My Fees</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here is an overview of your school fees:</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center' }}>
        <img src={feesIcon} alt="Fees Icon" width="80px" height="80px" style={{ marginRight: '20px' }} />
        <div>
          <h3>Academic Year {new Date().getFullYear() - 1}/{new Date().getFullYear()} Fees</h3>
          <p><strong>Tuition Fee:</strong> ₦150,000.00</p>
          <p><strong>Development Levy:</strong> ₦25,000.00</p>
          <p><strong>Sport & Extra-curricular:</strong> ₦15,000.00</p>
          <p><strong>Total Due:</strong> ₦190,000.00</p>
          <p style={{marginTop: '10px', color: 'green', fontWeight: 'bold'}}>Status: Paid in Full</p> {/* Placeholder status */}
        </div>
      </div>

      <p style={{ marginTop: '20px' }}>
        For detailed payment history or inquiries, please contact the bursary department.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentFees;