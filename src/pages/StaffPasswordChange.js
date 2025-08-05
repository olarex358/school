// src/pages/StaffPasswordChange.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

// Import the password icon
import passwordIcon from '../icon/password.png';

function StaffPasswordChange() {
  const [loggedInStaff, setLoggedInStaff] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState(''); // For success or error messages

  const [staffs, setStaffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'staff') {
      setLoggedInStaff(user);
    } else {
      navigate('/login'); // Redirect if not logged in as staff
    }
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    if (!loggedInStaff) {
      setMessage('Error: Not logged in as a staff member.');
      return;
    }

    if (newPassword.length < 6) { // Simple validation for new password
      setMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage('New password and confirm password do not match.');
      return;
    }

    try {
      // Simulate sending data to a secure backend API
      const response = await fetch(`http://localhost:5000/api/change-password/${loggedInStaff._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setMessage('Password changed successfully! You will be logged out. Please log in with your new password.');
        
        // Update local state and localStorage for consistency after a successful change
        const updatedStaffs = staffs.map(s => {
          if (s.staffId === loggedInStaff.staffId) {
            return { ...s, password: newPassword }; 
          }
          return s;
        });
        setStaffs(updatedStaffs); 
        localStorage.setItem('loggedInUser', JSON.stringify({ ...loggedInStaff, password: newPassword }));

        // Log out user after successful password change for security
        setTimeout(() => {
          handleLogout();
        }, 2000);

      } else {
        setMessage(data.message || 'An error occurred during password change.');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage('An unexpected error occurred. Please check your network connection.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  if (!loggedInStaff) {
    return <div className="content-section">Loading password change page...</div>;
  }

  return (
    <div className="content-section">
      <h1>Change Password (Staff View)</h1>
      <p>Welcome, {loggedInStaff.firstname} {loggedInStaff.surname}! You can change your password here:</p>

      <form onSubmit={handlePasswordChange} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9', maxWidth: '400px', margin: '20px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={passwordIcon} alt="Password Icon" width="80px" height="80px" />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="oldPassword" style={{ display: 'block', marginBottom: '5px' }}>Old Password:</label>
          <input
            type="password"
            id="oldPassword"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '5px' }}>New Password:</label>
          <input
            type="password"
            id="newPassword"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="confirmNewPassword" style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password:</label>
          <input
            type="password"
            id="confirmNewPassword"
            required
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        {message && <p style={{ color: message.includes('success') ? 'green' : 'red', marginBottom: '15px', textAlign: 'center' }}>{message}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Change Password</button>
      </form>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StaffPasswordChange;