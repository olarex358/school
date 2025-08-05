// src/pages/StudentProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function StudentProfile() {
  const [studentProfile, setStudentProfile] = useState(null);
  const navigate = useNavigate();

  // Load all students from the backend to find the current user's profile
  const [students, , loadingStudents] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'student') {
      // Find the detailed student profile from the fetched data
      const detailedStudentInfo = students.find(s => s.admissionNo === loggedInUser.admissionNo);
      if (detailedStudentInfo) {
        setStudentProfile(detailedStudentInfo);
      } else {
        // If the logged-in user isn't found in the database, log them out
        console.error("Logged-in student not found in database.");
        localStorage.removeItem('loggedInUser');
        navigate('/login');
      }
    } else {
      navigate('/login'); // Redirect if not logged in as a student
    }
  }, [navigate, students]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/home");
  };

  if (!studentProfile || loadingStudents) {
    return <div className="content-section">Loading profile...</div>;
  }

  return (
    <div className="content-section">
      <h2>My Profile</h2>
      <div id="profileDetails">
        <p><strong>Full Name:</strong> {studentProfile.firstName} {studentProfile.lastName}</p>
        <p><strong>Admission Number:</strong> {studentProfile.admissionNo}</p>
        <p><strong>Class:</strong> {studentProfile.studentClass}</p>
        <p><strong>Date of Birth:</strong> {studentProfile.dob}</p>
        <p><strong>Parent Name:</strong> {studentProfile.parentName}</p>
        <p><strong>Parent Phone:</strong> {studentProfile.parentPhone}</p>
        <p><strong>Address:</strong> {studentProfile.address}</p>
        <p><strong>Enrollment Date:</strong> {studentProfile.enrollmentDate}</p>
        <p><strong>Medical Notes:</strong> {studentProfile.medicalNotes || 'N/A'}</p>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default StudentProfile;