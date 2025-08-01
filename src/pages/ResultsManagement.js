// src/pages/ResultsManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function ResultsManagement() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [results, setResults] = useLocalStorage('schoolPortalResults', []);
  const [pendingResults, setPendingResults] = useLocalStorage('schoolPortalPendingResults', []);
  const [students] = useLocalStorage('schoolPortalStudents', []);
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);
  const [staffs] = useLocalStorage('schoolPortalStaff', []);

  // NEW STATE: Redefined to match the new table format
  const [newResult, setNewResult] = useState({
    classSelect: '',
    studentNameSelect: '',
    subjectSelect: '',
    termSelect: '',
    firstCaScore: '',
    secondCaScore: '',
    assignmentScore: '',
    examScore: '',
    totalScore: 0,
    grade: '',
    status: 'Pending',
    submittedBy: '',
  });

  const [submitButtonText, setSubmitButtonText] = useState('Add Result');
  const [isEditing, setIsEditing] = useState(false);
  const [editResultId, setEditResultId] = useState(null);
  const [studentIdFilter, setStudentIdFilter] = useState('');
  
  const isTeacher = loggedInUser && loggedInUser.type === 'staff' && loggedInUser.role.includes('Teacher');
  const isAdmin = loggedInUser && loggedInUser.type === 'admin';
  
  // Effect to check login
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && (user.type === 'admin' || (user.type === 'staff' && (user.role.includes('Teacher') || user.role.includes('Results Manager'))))) {
      setLoggedInUser(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Helper function to get student name from ID
  const getStudentName = (admissionNo) => {
    const student = students.find(s => s.admissionNo === admissionNo);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  // Helper function to get subject name from code
  const getSubjectName = (subjectCode) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : 'Unknown Subject';
  };
  
  // NEW HELPER FUNCTION to calculate total score and grade
  const calculateTotalAndGrade = (firstCa, secondCa, assignment, exam) => {
    const total = parseFloat(firstCa) + parseFloat(secondCa) + parseFloat(assignment) + parseFloat(exam);
    let grade = '';
    if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B';
    else if (total >= 50) grade = 'C';
    else if (total >= 40) grade = 'D';
    else grade = 'F';
    return { total, grade };
  };

  // The rest of the component will be added in subsequent steps
// src/pages/ResultsManagement.js (partial view)
// ... code from Part 1 ...
  
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
      newResult.firstCaScore === '' ||
      newResult.secondCaScore === '' ||
      newResult.assignmentScore === '' ||
      newResult.examScore === ''
    ) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Validate scores are numbers between 0 and 100
    const scores = [newResult.firstCaScore, newResult.secondCaScore, newResult.assignmentScore, newResult.examScore];
    for (const score of scores) {
      const numScore = parseInt(score);
      if (isNaN(numScore) || numScore < 0 || numScore > 100) {
        alert('All scores must be numbers between 0 and 100.');
        return;
      }
    }

    const { total, grade } = calculateTotalAndGrade(newResult.firstCaScore, newResult.secondCaScore, newResult.assignmentScore, newResult.examScore);
    
    const resultIdentifier = `${newResult.studentNameSelect}-${newResult.subjectSelect}-${newResult.termSelect}`;
    const resultToAddOrUpdate = { 
      ...newResult, 
      totalScore: total, 
      grade: grade,
      id: resultIdentifier,
      submittedBy: loggedInUser?.staffId || 'Admin',
    };

    if (isTeacher) {
      resultToAddOrUpdate.status = 'Pending';
      setPendingResults(prevResults => {
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
      firstCaScore: '',
      secondCaScore: '',
      assignmentScore: '',
      examScore: '',
      totalScore: 0,
      grade: '',
      status: 'Pending',
      submittedBy: '',
    });
    setSubmitButtonText('Add Result');
    setIsEditing(false);
    setEditResultId(null);
  };
  
  const editResult = (resultIdToEdit) => {
    const resultToEdit = pendingResults.find(r => r.id === resultIdToEdit) || results.find(r => r.id === resultIdToEdit);
    if (resultToEdit) {
      setNewResult(resultToEdit);
      setSubmitButtonText('Update Result');
      setIsEditing(true);
      setEditResultId(resultIdToEdit);
    }
  };

  const deleteResult = (resultIdToDelete) => {
    if (window.confirm(`Are you sure you want to delete this result entry?`)) {
      setPendingResults(prevResults => prevResults.filter(result => result.id !== resultIdToDelete));
      setResults(prevResults => prevResults.filter(result => result.id !== resultIdToDelete));
      alert('Result deleted successfully!');
    }
  };

  const clearFilterAndForm = () => {
    setStudentIdFilter('');
    setNewResult({
      classSelect: '',
      studentNameSelect: '',
      subjectSelect: '',
      termSelect: '',
      firstCaScore: '',
      secondCaScore: '',
      assignmentScore: '',
      examScore: '',
      totalScore: 0,
      grade: '',
      status: 'Pending',
      submittedBy: '',
    });
    setSubmitButtonText('Add Result');
    setIsEditing(false);
    setEditResultId(null);
  };
  
// The rest of the component will be added in subsequent steps
// src/pages/ResultsManagement.js (partial view)
// ... code from Part 2 ...

  const isResultsManager = loggedInUser && loggedInUser.type === 'staff' && loggedInUser.role.includes('Results Manager');

  // Filter results based on logged-in user's role and search term
  const allResults = [...results, ...pendingResults];
  let resultsToDisplay = allResults;

  if (isTeacher) {
    const teacherAssignedClasses = loggedInUser.assignedClasses || [];
    const teacherAssignedSubjects = loggedInUser.assignedSubjects || [];
    const teacherId = loggedInUser.staffId;

    resultsToDisplay = allResults.filter(result =>
        (teacherAssignedClasses.includes(result.classSelect) && teacherAssignedSubjects.includes(result.subjectSelect)) ||
        (result.submittedBy === teacherId)
    );
  } else if (isResultsManager) {
    // Results Manager sees all results for their assigned classes/subjects
    const managerAssignedClasses = loggedInUser.assignedClasses || [];
    const managerAssignedSubjects = loggedInUser.assignedSubjects || [];

    resultsToDisplay = allResults.filter(result =>
        managerAssignedClasses.includes(result.classSelect) && managerAssignedSubjects.includes(result.subjectSelect)
    );
  }

  const filteredResults = studentIdFilter
    ? resultsToDisplay.filter(result => result.studentNameSelect.toLowerCase().includes(studentIdFilter.toLowerCase()))
    : resultsToDisplay;

  // Derived data for form dropdowns
  const uniqueClasses = [...new Set(students.map(s => s.studentClass))].sort();

  const availableClassesForInput = isTeacher || isResultsManager
    ? uniqueClasses.filter(cls => (loggedInUser.assignedClasses || []).includes(cls))
    : uniqueClasses;

  const availableStudentsForInput = isTeacher || isResultsManager
    ? students.filter(s => (loggedInUser.assignedClasses || []).includes(s.studentClass))
    : students;

  const availableSubjectsForInput = isTeacher || isResultsManager
    ? subjects.filter(sub => (loggedInUser.assignedSubjects || []).includes(sub.subjectCode))
    : subjects;

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
          <input
            type="number"
            id="firstCaScore"
            placeholder="1st CA Score (10%)"
            min="0"
            max="10"
            required
            value={newResult.firstCaScore}
            onChange={handleChange}
          />
          <input
            type="number"
            id="secondCaScore"
            placeholder="2nd CA Score (10%)"
            min="0"
            max="10"
            required
            value={newResult.secondCaScore}
            onChange={handleChange}
          />
          <input
            type="number"
            id="assignmentScore"
            placeholder="Assignment Score (20%)"
            min="0"
            max="20"
            required
            value={newResult.assignmentScore}
            onChange={handleChange}
          />
          <input
            type="number"
            id="examScore"
            placeholder="Exam Score (60%)"
            min="0"
            max="60"
            required
            value={newResult.examScore}
            onChange={handleChange}
          />

          {isAdmin ? (
            <button type="submit">{submitButtonText}</button>
          ) : (
            <button type="submit">Submit for Approval</button>
          )}
          <button type="button" onClick={clearFilterAndForm}>Clear / Reset Form</button>
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
        <div className="table-container">
            <table id="resultsTable">
                <thead>
                    <tr>
                        <th>Student Name (ID)</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th>Term</th>
                        <th>1st CA (10%)</th>
                        <th>2nd CA (10%)</th>
                        <th>Assignment (20%)</th>
                        <th>Exam (60%)</th>
                        <th>Total (100%)</th>
                        <th>Grade</th>
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
                        <td>{result.firstCaScore}</td>
                        <td>{result.secondCaScore}</td>
                        <td>{result.assignmentScore}</td>
                        <td>{result.examScore}</td>
                        <td><strong>{result.totalScore}</strong></td>
                        <td><strong>{result.grade}</strong></td>
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
                      <td colSpan="12">No results found.</td>
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