// src/pages/StudentResults.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function StudentResults() {
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  // Load all results and subjects to display student-specific results
  const [allResults] = useLocalStorage('schoolPortalResults', []);
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
    return <div className="content-section">Loading results...</div>;
  }

  // Filter results to show only for the current logged-in student
  const studentSpecificResults = allResults.filter(
    result => result.studentNameSelect === loggedInStudent.admissionNo
  );

  // Helper function to get subject name from code
  const getSubjectName = (subjectCode) => {
      const subject = allSubjects.find(s => s.subjectCode === subjectCode);
      return subject ? subject.subjectName : subjectCode;
  };

  return (
    <div className="content-section">
      <h1>My Results</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}!</p>
      <h3>Your Academic Performance:</h3>

      {studentSpecificResults.length > 0 ? (
        <div className="table-container"> {/* Use table-container for styling from admin.css */}
          <table id="studentResultsTable">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Term</th>
                <th>Type</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {studentSpecificResults.map(result => (
                <tr key={result.id}>
                  <td>{getSubjectName(result.subjectSelect)}</td>
                  <td>{result.termSelect}</td>
                  <td>{result.caType}</td>
                  <td>{result.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No results have been entered for you yet.</p>
      )}

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentResults;