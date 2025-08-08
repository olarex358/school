// src/pages/StudentProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import ConfirmModal from '../components/ConfirmModal';


function StudentProfile() {
  const [studentProfile, setStudentProfile] = useState(null);
  const navigate = useNavigate();

  const [students, , loadingStudents] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalAlert, setIsModalAlert] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'student') {
      const detailedStudentInfo = students.find(s => s.admissionNo === loggedInUser.admissionNo);
      if (detailedStudentInfo) {
        setStudentProfile(detailedStudentInfo);
      } else {
        console.error("Logged-in student not found in database.");
        localStorage.removeItem('loggedInUser');
        navigate('/login');
      }
    } else {
      navigate('/login');
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
      <ConfirmModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        isAlert={isModalAlert}
      />
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="profile-details">
          <div className="profile-item">
            <strong>Full Name:</strong> <span>{studentProfile.firstName} {studentProfile.lastName}</span>
          </div>
          <div className="profile-item">
            <strong>Admission Number:</strong> <span>{studentProfile.admissionNo}</span>
          </div>
          <div className="profile-item">
            <strong>Class:</strong> <span>{studentProfile.studentClass}</span>
          </div>
          <div className="profile-item">
            <strong>Date of Birth:</strong> <span>{studentProfile.dob}</span>
          </div>
          <div className="profile-item">
            <strong>Parent Name:</strong> <span>{studentProfile.parentName}</span>
          </div>
          <div className="profile-item">
            <strong>Parent Phone:</strong> <span>{studentProfile.parentPhone}</span>
          </div>
          <div className="profile-item">
            <strong>Address:</strong> <span>{studentProfile.address}</span>
          </div>
          <div className="profile-item">
            <strong>Enrollment Date:</strong> <span>{studentProfile.enrollmentDate}</span>
          </div>
          <div className="profile-item">
            <strong>Medical Notes:</strong> <span>{studentProfile.medicalNotes || 'N/A'}</span>
          </div>
        </div>
      </div>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default StudentProfile;
