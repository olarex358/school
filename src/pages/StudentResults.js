// src/pages/StudentResults.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function StudentResults() {
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const navigate = useNavigate();

  // Load all results and subjects to display student-specific results
  const [allApprovedResults] = useLocalStorage('schoolPortalResults', []);
  const [allSubjects] = useLocalStorage('schoolPortalSubjects', []);
  const [allPendingResults] = useLocalStorage('schoolPortalPendingResults', []);

  // NEW STATE FOR GRADING LOGIC:
  const [totalScore, setTotalScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);

  // Effect to check if user is a student
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'student') {
      setLoggedInStudent(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Filter results to show only for the current logged-in student and ensure they are approved
  const studentSpecificResults = allApprovedResults.filter(
    result => result.studentNameSelect === loggedInStudent?.admissionNo && result.status === 'Approved'
  );

  // NEW EFFECT FOR CALCULATIONS:
  useEffect(() => {
    if (studentSpecificResults.length > 0) {
      // Calculate total score
      const total = studentSpecificResults.reduce((sum, result) => sum + result.score, 0);
      setTotalScore(total);

      // Calculate average score
      const average = total / studentSpecificResults.length;
      setAverageScore(average.toFixed(2)); // Round to 2 decimal places
    } else {
      setTotalScore(0);
      setAverageScore(0);
    }
  }, [studentSpecificResults]);

  // Helper function to get subject name from code
  const getSubjectName = (subjectCode) => {
    const subject = allSubjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : subjectCode;
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  if (!loggedInStudent) {
    return <div className="content-section">Loading results...</div>;
  }

  return (
    <div className="content-section">
      <h1>My Results</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}!</p>
      
      {/* NEW UI SECTION TO DISPLAY STATS */}
      <div className="sub-section" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
          <div>
              <h3>Total Score:</h3>
              <p style={{fontSize: '1.5em', fontWeight: 'bold'}}>{totalScore}</p>
          </div>
          <div>
              <h3>Average Score:</h3>
              <p style={{fontSize: '1.5em', fontWeight: 'bold'}}>{averageScore}%</p>
          </div>
      </div>
      
      <h3>Your Academic Performance:</h3>
      {studentSpecificResults.length > 0 ? (
        <div className="table-container">
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
