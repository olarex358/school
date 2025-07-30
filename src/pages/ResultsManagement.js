// src/pages/ResultsManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function ResultsManagement() { console.log('ResultsManagement component is mounting')
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Data from localStorage
  const [results, setResults] = useLocalStorage('schoolPortalResults', []);
  const [pendingResults, setPendingResults] = useLocalStorage('schoolPortalPendingResults', []);
  const [students] = useLocalStorage('schoolPortalStudents', []);
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);
  

  // Form states
  const [newResult, setNewResult] = useState({
    classSelect: '',
    studentNameSelect: '',
    subjectSelect: '',
    termSelect: '',
    caType: '',
    score: '',
    status: 'Pending',
  });
  
  const [submitButtonText, setSubmitButtonText] = useState('Add Result');
  const [isEditing, setIsEditing] = useState(false);
  const [editResultId, setEditResultId] = useState(null);
  const [studentIdFilter, setStudentIdFilter] = useState('');

  // Define user roles and access flags at the top for use throughout the component
  const isTeacher = loggedInUser && loggedInUser.type === 'staff' && loggedInUser.role.includes('Teacher');
  const isAdmin = loggedInUser && loggedInUser.type === 'admin';
// src/pages/ResultsManagement.js (partial view)
// ... code from Part 1 ...

  // Helper functions to get names from IDs
  const getStudentName = (admissionNo) => {
    const student = students.find(s => s.admissionNo === admissionNo);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getSubjectName = (subjectCode) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : 'Unknown Subject';
  };

  // Effect to check login and set user info
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && (user.type === 'admin' || (user.type === 'staff' && (user.role.includes('Teacher') || user.role.includes('Results Manager'))))) {
      setLoggedInUser(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Derived data for form dropdowns
  const uniqueClasses = [...new Set(students.map(s => s.studentClass))].sort();

  const availableClassesForInput = isTeacher
    ? uniqueClasses.filter(cls => loggedInUser.assignedClasses.includes(cls))
    : uniqueClasses;

  const availableStudentsForInput = isTeacher
    ? students.filter(s => loggedInUser.assignedClasses.includes(s.studentClass))
    : students;

  const availableSubjectsForInput = isTeacher
    ? subjects.filter(sub => loggedInUser.assignedSubjects.includes(sub.subjectCode))
    : subjects;
// src/pages/ResultsManagement.js (partial view)
// ... code from Part 2 ...

  // Handle input changes for the form
  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewResult(prevResult => ({
      ...prevResult,
      [id]: value
    }));
  };

  // Handle form submission (Add or Update for Admin, Submit for Teacher)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !newResult.classSelect ||
      !newResult.studentNameSelect ||
      !newResult.subjectSelect ||
      !newResult.termSelect ||
      !newResult.caType ||
      newResult.score === ''
    ) {
      alert('Please fill in all required fields.');
      return;
    }
    const score = parseInt(newResult.score);
    if (isNaN(score) || score < 0 || score > 100) {
      alert('Score must be a number between 0 and 100.');
      return;
    }

    const resultIdentifier = `${newResult.studentNameSelect}-${newResult.subjectSelect}-${newResult.termSelect}-${newResult.caType}`;
    const resultToAddOrUpdate = { 
        ...newResult, 
        score: score, 
        id: resultIdentifier,
        submittedBy: loggedInUser?.staffId || 'Admin',
    };

    if (isTeacher) {
      // Teacher workflow: Submit for approval
      resultToAddOrUpdate.status = 'Pending';
      setPendingResults(prevResults => {
        // Check if this result already exists in the pending list
        const existingIndex = prevResults.findIndex(r => r.id === resultToAddOrUpdate.id);
        if (existingIndex > -1) {
          const updated = [...prevResults];
          updated[existingIndex] = resultToAddOrUpdate;
          return updated;
        } else {
          return [...prevResults, resultToAddOrUpdate];
        }
      });
      alert('Result submitted for approval!');
    } else {
      // Admin workflow: Add or update directly to final results
      if (isEditing) {
        setResults(prevResults =>
          prevResults.map(result =>
            result.id === editResultId ? resultToAddOrUpdate : result
          )
        );
        alert('Result updated successfully!');
      } else {
        if (results.some(r => r.id === resultIdentifier)) {
          alert('This result entry already exists. Please edit it or choose different criteria.');
          return;
        }
        setResults(prevResults => [...prevResults, resultToAddOrUpdate]);
        alert('Result added successfully!');
      }
    }

    // Reset form and state after submission
    setNewResult({
      classSelect: '',
      studentNameSelect: '',
      subjectSelect: '',
      termSelect: '',
      caType: '',
      score: '',
      status: 'Pending'
    });
    setSubmitButtonText('Add Result');
    setIsEditing(false);
    setEditResultId(null);
  };
  
  // Function to populate form for editing (handles both pending and approved)
  const editResult = (resultIdToEdit) => {
    // Check pending results first, then final results
    const resultToEdit = pendingResults.find(r => r.id === resultIdToEdit) || results.find(r => r.id === resultIdToEdit);
    if (resultToEdit) {
      setNewResult(resultToEdit);
      setSubmitButtonText('Update Result');
      setIsEditing(true);
      setEditResultId(resultIdToEdit);
    }
  };

  // Function to delete result (handles both pending and approved)
  const deleteResult = (resultIdToDelete) => {
    if (window.confirm(`Are you sure you want to delete this result entry?`)) {
      // Delete from both lists, as it might exist in either
      setPendingResults(prevResults => prevResults.filter(result => result.id !== resultIdToDelete));
      setResults(prevResults => prevResults.filter(result => result.id !== resultIdToDelete));
      alert('Result deleted successfully!');
    }
  };

  // Clear filter and reset form
  const clearFilterAndForm = () => {
    setStudentIdFilter('');
    setNewResult({
      classSelect: '',
      studentNameSelect: '',
      subjectSelect: '',
      termSelect: '',
      caType: '',
      score: '',
      status: 'Pending'
    });
    setSubmitButtonText('Add Result');
    setIsEditing(false);
    setEditResultId(null);
  };
// src/pages/ResultsManagement.js (partial view)
// ... code from Part 3 ...

  // NEW: Filter results based on logged-in user's role and search term
  // This logic is placed here, before the return statement, so the JSX can use the final filtered list.
  const allResults = [...results, ...pendingResults];
  let resultsToDisplay = allResults;

  if (isTeacher) {
    const teacherClasses = loggedInUser.assignedClasses || [];
    const teacherSubjects = loggedInUser.assignedSubjects || [];
    const teacherId = loggedInUser.staffId;

    resultsToDisplay = allResults.filter(result =>
        (teacherClasses.includes(result.classSelect) && teacherSubjects.includes(result.subjectSelect)) ||
        (result.submittedBy === teacherId)
    );
  }

  const filteredResults = studentIdFilter
    ? resultsToDisplay.filter(result => result.studentNameSelect.toLowerCase().includes(studentIdFilter.toLowerCase()))
    : resultsToDisplay;

  if (!loggedInUser) {
    return <div className="content-section">Access Denied. Please log in as Admin or Staff.</div>;
  }

  return (
    <div className="content-section">
      <h1>Results Management</h1>
      <div className="sub-section">
        <h2>{isEditing ? 'Edit Student Result' : 'Input/Edit Student Result'}</h2>
        <form id="resultForm" onSubmit={handleSubmit}>
          <select
            id="classSelect"
            required
            value={newResult.classSelect}
            onChange={handleChange}
          >
            <option value="">Select Class</option>
            {availableClassesForInput.map(className => (
                <option key={className} value={className}>{className}</option>
            ))}
            {availableClassesForInput.length === 0 && <option value="" disabled>No classes assigned/available</option>}
          </select>
          <select
            id="studentNameSelect"
            required
            value={newResult.studentNameSelect}
            onChange={handleChange}
          >
            <option value="">Select Student Name</option>
            {availableStudentsForInput
                .filter(student => !newResult.classSelect || student.studentClass === newResult.classSelect.replace(' ', ''))
                .map(student => (
                <option key={student.admissionNo} value={student.admissionNo}>
                    {student.firstName} {student.lastName} ({student.admissionNo})
                </option>
            ))}
            {availableStudentsForInput.length === 0 && <option value="" disabled>No students assigned/available</option>}
          </select>
          <select
            id="subjectSelect"
            required
            value={newResult.subjectSelect}
            onChange={handleChange}
          >
            <option value="">Select Subject</option>
            {availableSubjectsForInput.map(subject => (
              <option key={subject.subjectCode} value={subject.subjectCode}>
                {subject.subjectName} ({subject.subjectCode})
              </option>
            ))}
            {availableSubjectsForInput.length === 0 && <option value="" disabled>No subjects assigned/available</option>}
          </select>
          <select
            id="termSelect"
            required
            value={newResult.termSelect}
            onChange={handleChange}
          >
            <option value="">Select Term</option>
            <option value="Term 1">First Term</option>
            <option value="Term 2">Second Term</option>
            <option value="Term 3">Third Term</option>
          </select>
          <select
            id="caType"
            required
            value={newResult.caType}
            onChange={handleChange}
          >
            <option value="">CA/Exam Type</option>
            <option value="First CA">First CA</option>
            <option value="Second CA">Second CA</option>
            <option value="Exam">Exam</option>
            <option value="Practical">Practical</option>
            <option value="Certification">Certification</option>
          </select>
          <input
            type="number"
            id="score"
            placeholder="Score (0-100)"
            min="0"
            max="100"
            required
            value={newResult.score}
            onChange={handleChange}
          />
          {/* Conditional Status Dropdown for Admin */}
          {isAdmin && (
            <select
                id="status"
                value={newResult.status}
                onChange={handleChange}
            >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
            </select>
          )}
          {/* Conditional Submit Button */}
          {isAdmin ? (
              <button type="submit">{submitButtonText}</button>
          ) : (
              <button type="submit">Submit for Approval</button>
          )}
          <button type="button" onClick={() => alert('Export All Results (CSV) logic goes here!')}>
            Export All Results (CSV)
          </button>
        </form>
      </div>
      <div className="sub-section">
        <h2>All Results</h2>
        <input
          type="text"
          id="studentIdFilter"
          placeholder="Filter by Student Admission No."
          value={studentIdFilter}
          onChange={(e) => setStudentIdFilter(e.target.value)}
        />
        <button id="clearResultFilterBtn" onClick={clearFilterAndForm}>Clear Filter / Reset Form</button>
        <div className="table-container">
            <table id="resultsTable">
                <thead>
                    <tr>
                        <th>Student Name (ID)</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th>Term</th>
                        <th>Type</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {filteredResults.length > 0 ? (
                    filteredResults.map(result => {
                      const isSubmittedByMe = isTeacher && result.submittedBy === loggedInUser.staffId;
                      const canEditOrDelete = isAdmin || (isSubmittedByMe && result.status === 'Pending');

                      return (
                      <tr key={result.id}>
                        <td>{getStudentName(result.studentNameSelect)} ({result.studentNameSelect})</td>
                        <td>{result.classSelect}</td>
                        <td>{getSubjectName(result.subjectSelect)}</td>
                        <td>{result.termSelect}</td>
                        <td>{result.caType}</td>
                        <td>{result.score}</td>
                        <td>
                          <span style={{ color: result.status === 'Approved' ? 'green' : result.status === 'Rejected' ? 'red' : 'orange' }}>
                            {result.status}
                          </span>
                        </td>
                        <td>
                          {canEditOrDelete ? (
                            <>
                              <button
                                className="action-btn edit-btn"
                                onClick={() => editResult(result.id)}>
                                Edit
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => deleteResult(result.id)}>
                                Delete
                              </button>
                            </>
                          ) : (
                            <span>No Actions</span>
                          )}
                        </td>
                      </tr>
                      );
                    })
                ) : (
                    <tr>
                      <td colSpan="8">No results found.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default ResultsManagement;
