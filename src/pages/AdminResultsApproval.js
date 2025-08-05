// src/pages/AdminResultsApproval.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function AdminResultsApproval() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Update hooks to get data from the backend
  const [pendingResults, setPendingResults, loadingPending] = useLocalStorage('schoolPortalPendingResults', [], 'http://localhost:5000/api/schoolPortalPendingResults');
  const [approvedResults, setApprovedResults, loadingApproved] = useLocalStorage('schoolPortalResults', [], 'http://localhost:5000/api/schoolPortalResults');
  const [students] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  const [subjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');
  const [staffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');

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

  const handleApprove = async (resultId) => {
    if (window.confirm('Are you sure you want to approve this result?')) {
      const resultToApprove = pendingResults.find(r => r.id === resultId);
      if (!resultToApprove) {
        setMessage({ type: 'error', text: 'Result not found in pending list.' });
        return;
      }
      const approvedResult = { ...resultToApprove, status: 'Approved' };

      try {
        // 1. Send a POST request to add the approved result to the 'results' collection
        const addResponse = await fetch('http://localhost:5000/api/schoolPortalResults', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(approvedResult),
        });

        // 2. Send a DELETE request to remove the result from the 'pendingResults' collection
        const deleteResponse = await fetch(`http://localhost:5000/api/schoolPortalPendingResults/${resultToApprove._id}`, {
          method: 'DELETE',
        });

        if (addResponse.ok && deleteResponse.ok) {
          // Update local state after successful backend operations
          setPendingResults(prevPending => prevPending.filter(r => r.id !== resultId));
          setApprovedResults(prevApproved => [...prevApproved, approvedResult]);
          setMessage({ type: 'success', text: 'Result approved and moved to final records.' });
        } else {
          setMessage({ type: 'error', text: 'Failed to approve result. Please try again.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
      }
    }
  };

  const handleReject = async (resultId) => {
    if (window.confirm('Are you sure you want to reject this result?')) {
      const resultToReject = pendingResults.find(r => r.id === resultId);
      if (!resultToReject) {
        setMessage({ type: 'error', text: 'Result not found in pending list.' });
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/schoolPortalPendingResults/${resultToReject._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setPendingResults(prevPending => prevPending.filter(r => r.id !== resultId));
          setMessage({ type: 'success', text: 'Result rejected and removed from pending list.' });
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to reject result.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
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

  if (loadingPending || loadingApproved) {
    return <div className="content-section">Loading pending results...</div>;
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
                    <td>{result.totalScore}</td>
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