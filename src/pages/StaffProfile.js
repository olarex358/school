// src/pages/StaffProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StaffProfile() {
  const [staffProfile, setStaffProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'staff') {
      setStaffProfile(loggedInUser);
    } else {
      navigate('/login'); // Redirect if not logged in as staff
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  if (!staffProfile) {
    return <div className="content-section">Loading staff profile...</div>;
  }

  return (
    <div className="content-section">
      <h2>My Profile</h2>
      <div id="profileDetails">
        <p><strong>Full Name:</strong> {staffProfile.firstname} {staffProfile.surname}</p>
        <p><strong>Staff ID:</strong> {staffProfile.staffId}</p>
        <p><strong>Role:</strong> {staffProfile.role}</p>
        {/* Add more staff-specific details here as needed */}
        {/* For example, if you add subject assigned or class assigned to staff in StaffManagement */}
        {staffProfile.subject && <p><strong>Subject:</strong> {staffProfile.subject}</p>}
        {staffProfile.classAssigned && <p><strong>Class Assigned:</strong> {staffProfile.classAssigned}</p>}
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default StaffProfile;