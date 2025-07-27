// src/pages/StudentSyllabus.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentSyllabus() {
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
    return <div className="content-section">Loading syllabus...</div>;
  }

  return (
    <div className="content-section">
      <h1>My Syllabus</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here is a general overview of your syllabus:</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9' }}>
        <h3>JSS 1 - First Term Curriculum Highlights</h3>
        <ul>
          <li>Mathematics: Basic Arithmetic, Fractions, Decimals</li>
          <li>English Language: Grammar, Comprehension, Essay Writing</li>
          <li>Basic Science: Living and Non-living Things, States of Matter</li>
          <li>Social Studies: Our Community, Culture, and Values</li>
          <li>Civic Education: Rights and Responsibilities of Citizens</li>
          <li><img src={require("../icon/sylabus.png")} alt="Syllabus Icon" width="100px" height="100px" style={{float: 'right', marginLeft: '15px'}} /></li>
        </ul>
        <p>
          Please note that this is a general outline. For detailed subject-specific syllabus and learning objectives,
          kindly refer to the academic department or your subject teachers.
        </p>
      </div>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentSyllabus;