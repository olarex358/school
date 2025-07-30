// src/pages/AdminResultsApproval.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function AdminResultsApproval() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Data from localStorage
  const [pendingResults, setPendingResults] = useLocalStorage('schoolPortalPendingResults', []);
  const [approvedResults, setApprovedResults] = useLocalStorage('schoolPortalResults', []);
  const [students] = useLocalStorage('schoolPortalStudents', []);
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);
  const [staffs] = useLocalStorage('schoolPortalStaff', []); // To get teacher name

  // UI States
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect the route
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'admin') {
      setLoggedInAdmin(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Helper functions
  const getStudentName = (admissionNo) => {
    const student = students.find(s => s.admissionNo === admissionNo);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getSubjectName = (subjectCode) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : 'Unknown Subject';
  };

  const getTeacherName = (staffId) => {
    const teacher = staffs.find(s => s.staffId === staffId);
    return teacher ? `${teacher.firstname} ${teacher.surname}` : 'Unknown Teacher';
  };

  // Approval logic
  const handleApprove = (resultId) => {
    if (window.confirm('Are you sure you want to approve this result?')) {
      const resultToApprove = pendingResults.find(r => r.id === resultId);
      if (resultToApprove) {
        // Create the final result object with status as Approved
        const approvedResult = { ...resultToApprove, status: 'Approved' };
        
        // Remove from pending list
        setPendingResults(prevPending => prevPending.filter(r => r.id !== resultId));
        
        // Add to the final approved results list, overwriting if an old one exists (important for re-submissions)
        setApprovedResults(prevApproved => {
          const existingIndex = prevApproved.findIndex(r => r.id === resultId);
          if (existingIndex > -1) {
              const updated = [...prevApproved];
              updated[existingIndex] = approvedResult;
              return updated;
          }
          return [...prevApproved, approvedResult];
        });

        setMessage({ type: 'success', text: 'Result approved and moved to final records.' });
      } else {
        setMessage({ type: 'error', text: 'Result not found in pending list.' });
      }
    }
  };

  // Rejection logic
  const handleReject = (resultId) => {
    if (window.confirm('Are you sure you want to reject this result?')) {
      const resultToReject = pendingResults.find(r => r.id === resultId);
      if (resultToReject) {
        // We could save rejected results to another list, but for now, we'll just remove it.
        setPendingResults(prevPending => prevPending.filter(r => r.id !== resultId));
        // A rejected result is not added to the final approved list.
        setMessage({ type: 'error', text: 'Result rejected and removed from pending list.' });
      } else {
        setMessage({ type: 'error', text: 'Result not found in pending list.' });
      }
    }
  };

  const filteredPendingResults = pendingResults.filter(result =>
    getStudentName(result.studentNameSelect).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSubjectName(result.subjectSelect).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTeacherName(result.submittedBy).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!loggedInAdmin) {
    return <div className="content-section">Access Denied. Please log in as an Admin.</div>;
  }

  return (
    <div className="content-section">
      <h1>Results Approval</h1>
      <p>Review and manage results submitted by teachers for approval.</p>

      <div className="sub-section">
        <h2>Pending Results ({pendingResults.length})</h2>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}

        <input
          type="text"
          placeholder="Search by student, subject, or teacher"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        />

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student Name (ID)</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Submitted By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPendingResults.length > 0 ? (
                filteredPendingResults.map(result => (
                  <tr key={result.id}>
                    <td>{getStudentName(result.studentNameSelect)} ({result.studentNameSelect})</td>
                    <td>{result.classSelect}</td>
                    <td>{getSubjectName(result.subjectSelect)}</td>
                    <td>{result.score}</td>
                    <td>{getTeacherName(result.submittedBy)}</td>
                    <td>
                      <button className="action-btn edit-btn" onClick={() => handleApprove(result.id)}>Approve</button>
                      <button className="action-btn delete-btn" onClick={() => handleReject(result.id)}>Reject</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No pending results to approve.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminResultsApproval;
