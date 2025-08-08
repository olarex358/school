// src/pages/StaffPasswordChange.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import ConfirmModal from '../components/ConfirmModal';


// Import the password icon
import passwordIcon from '../icon/password.png';

function StaffPasswordChange() {
  const [loggedInStaff, setLoggedInStaff] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [staffs, setStaffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalAlert, setIsModalAlert] = useState(false);

  const showAlert = (msg, action = () => {}) => {
    setModalMessage(msg);
    setIsModalAlert(true);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'staff') {
      setLoggedInStaff(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    if (newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters long.';
    }
    if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = 'New passwords do not match.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!loggedInStaff) {
      showAlert('Error: Not logged in as a staff member.');
      return;
    }
    
    if (!validateForm()) {
      showAlert('Please correct the errors in the form.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/change-password/${loggedInStaff._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      
      const data = await response.json();

      if (response.ok) {
        showAlert('Password changed successfully! You will be logged out. Please log in with your new password.', () => {
          handleLogout();
        });
        
        const updatedStaffs = staffs.map(s => {
          if (s.staffId === loggedInStaff.staffId) {
            return { ...s, password: newPassword }; 
          }
          return s;
        });
        setStaffs(updatedStaffs); 
        localStorage.setItem('loggedInUser', JSON.stringify({ ...loggedInStaff, password: newPassword }));

      } else {
        showAlert(data.message || 'An error occurred during password change.');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showAlert('An unexpected error occurred. Please check your network connection.');
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
      <ConfirmModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        isAlert={isModalAlert}
      />
      <h1>Change Password (Staff View)</h1>
      <p>Welcome, {loggedInStaff.firstname} {loggedInStaff.surname}! You can change your password here:</p>

      <form onSubmit={handlePasswordChange} className="password-change-form">
        <div className="form-icon-container">
          <img src={passwordIcon} alt="Password Icon" className="form-icon" />
        </div>
        <div className="form-group">
          <label htmlFor="oldPassword" className="form-label">Old Password:</label>
          <input
            type="password"
            id="oldPassword"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword" className="form-label">New Password:</label>
          <input
            type="password"
            id="newPassword"
            required
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setFormErrors(prev => ({...prev, newPassword: ''}));
            }}
            className={`form-input ${formErrors.newPassword ? 'form-input-error' : ''}`}
          />
          {formErrors.newPassword && <p className="error-message">{formErrors.newPassword}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password:</label>
          <input
            type="password"
            id="confirmNewPassword"
            required
            value={confirmNewPassword}
            onChange={(e) => {
              setConfirmNewPassword(e.target.value);
              setFormErrors(prev => ({...prev, confirmNewPassword: ''}));
            }}
            className={`form-input ${formErrors.confirmNewPassword ? 'form-input-error' : ''}`}
          />
          {formErrors.confirmNewPassword && <p className="error-message">{formErrors.confirmNewPassword}</p>}
        </div>
        <button type="submit" className="form-submit-btn">Change Password</button>
      </form>

      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default StaffPasswordChange;
