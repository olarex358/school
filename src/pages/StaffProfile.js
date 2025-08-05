// src/pages/StaffProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function StaffProfile() {
  const [staffInfo, setStaffInfo] = useState(null);
  const navigate = useNavigate();

  // Load all staff from the backend to get a full list for display
  const [staffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');
  const [subjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'staff') {
      // Find the detailed staff profile from the fetched data
      const detailedStaffInfo = staffs.find(s => s.staffId === loggedInUser.staffId);
      if (detailedStaffInfo) {
        setStaffInfo(detailedStaffInfo);
      } else {
        // If the logged-in user isn't found in the database, log them out
        console.error("Logged-in staff not found in database.");
        localStorage.removeItem('loggedInUser');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate, staffs]);

  const getSubjectName = (subjectCode) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : subjectCode;
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  if (!staffInfo) {
    return <div className="content-section">Loading profile...</div>;
  }
  
  return (
    <div className="content-section">
      <h2>My Profile</h2>
      <div id="profileDetails">
        <p><strong>Full Name:</strong> {staffInfo.firstname} {staffInfo.surname}</p>
        <p><strong>Staff ID:</strong> {staffInfo.staffId}</p>
        <p><strong>Role:</strong> {staffInfo.role}</p>
        <p><strong>Department:</strong> {staffInfo.department}</p>
        <p><strong>Email:</strong> {staffInfo.contactEmail}</p>
        <p><strong>Phone:</strong> {staffInfo.contactPhone}</p>
        <p><strong>Qualifications:</strong> {staffInfo.qualifications}</p>
        {staffInfo.assignedClasses && (
            <p><strong>Assigned Classes:</strong> {staffInfo.assignedClasses.join(', ')}</p>
        )}
        {staffInfo.assignedSubjects && (
            <p><strong>Assigned Subjects:</strong> {staffInfo.assignedSubjects.map(getSubjectName).join(', ')}</p>
        )}
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default StaffProfile;