// src/pages/AdminResultsApproval.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function AdminResultsApproval() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Use the useData hook to get data from the centralized context
  const { pendingResults, approvedResults, students, subjects, staffs, loading, error, setPendingResults, setResults } = useData();

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

  // Helper functions to get names
  const getStudentName = (admissionNo) => {
    const student = students.find(s => s.admissionNo === admissionNo);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getSubjectName = (subjectCode) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : 'Unknown Subject';
  };

  const getTeacherName = (staffId) => {
    const staff = staffs.find(s => s.staffId === staffId);
    return staff ? `${staff.firstname} ${staff.surname}` : 'Unknown Staff';
  };

  const handleApprove = async (resultId) => {
    const resultToApprove = pendingResults.find(res => res.id === resultId);
    if (!resultToApprove) return;

    // Call the backend API to move the result from pending to approved
    try {
      const response = await fetch(`http://localhost:5000/api/schoolPortalResults`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(resultToApprove)
      });
      if (!response.ok) throw new Error('Failed to approve result.');
      
      const newApprovedResult = await response.json();

      // Remove from pending list and add to approved list in the context
      const updatedPendingResults = pendingResults.filter(res => res.id !== resultId);
      setPendingResults(updatedPendingResults);
      setResults([...approvedResults, newApprovedResult]);

      setMessage('Result approved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error approving result:', error);
      setMessage('Failed to approve result.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReject = async (resultId) => {
    const resultToReject = pendingResults.find(res => res.id === resultId);
    if (!resultToReject) return;

    // Call the backend API to delete the pending result
    try {
      const response = await fetch(`http://localhost:5000/api/schoolPortalPendingResults/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to reject result.');

      // Remove from pending list in the context
      const updatedPendingResults = pendingResults.filter(res => res.id !== resultId);
      setPendingResults(updatedPendingResults);
      
      setMessage('Result rejected successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error rejecting result:', error);
      setMessage('Failed to reject result.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredPendingResults = pendingResults.filter(result =>
    getStudentName(result.studentNameSelect).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSubjectName(result.subjectSelect).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="admin-results-approval-page">
      <div className="admin-content">
        <h2>Results Approval Management</h2>
        {message && <p className="message">{message}</p>}
        <div className="search-and-export">
          <input
            type="text"
            placeholder="Search pending results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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