// src/pages/StudentSubjects.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function StudentSubjects() {
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  // Load all subjects to display
  const [allSubjects] = useLocalStorage('schoolPortalSubjects', []);
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
    navigate('/home');
  };

  if (!loggedInStudent) {
    return <div className="content-section">Loading subjects...</div>;
  }

  return (
    <div className="content-section">
      <h1>My Subjects</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here are the subjects available:</p>

      {allSubjects.length > 0 ? (
        <div className="table-container"> {/* Using table-container for styling from admin.css */}
          <table id="studentSubjectsTable">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Subject Code</th>
                {/* Add a column for enrollment status if you implement that later */}
              </tr>
            </thead>
            <tbody>
              {allSubjects.map(subject => (
                <tr key={subject.subjectCode}>
                  <td>{subject.subjectName}</td>
                  <td>{subject.subjectCode}</td>
                  {/* Add enrollment status here */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No subjects have been registered in the system yet.</p>
      )}

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentSubjects;