// src/pages/StudentProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentProfile() {
  const [studentProfile, setStudentProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'student') {
      setStudentProfile(loggedInUser);
    } else {
      navigate('/login'); // Redirect if not logged in as a student
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/home");
  };

  if (!studentProfile) {
    return <div className="content-section">Loading profile...</div>;
  }

  return (
    <div className="content-section">
      <h2>My Profile</h2>
      <div id="profileDetails"> {/* ID from bac profile-1.txt */}
        <p><strong>Full Name:</strong> {studentProfile.firstName} {studentProfile.lastName}</p>
        <p><strong>Admission Number:</strong> {studentProfile.admissionNo}</p>
        <p><strong>Class:</strong> {studentProfile.studentClass}</p>
        <p><strong>Date of Birth:</strong> {studentProfile.dob}</p>
        <p><strong>Parent Name:</strong> {studentProfile.parentName}</p> {/* Assuming this is desired instead of 'phone' */}
        <p><strong>Parent Phone:</strong> {studentProfile.parentPhone}</p> {/* Assuming this is desired instead of 'username' */}
        {/* Note: In your bac profile-1.txt, it shows phone and username. Our StudentManagement collects parentName/Phone.
            Adjust these lines based on what student data you actually store. */}
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default StudentProfile;