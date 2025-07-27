// src/pages/ResultsManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import useLocalStorage from '../hooks/useLocalStorage';

function ResultsManagement() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [loggedInUser, setLoggedInUser] = useState(null); // To store logged-in user info

  const [results, setResults] = useLocalStorage('schoolPortalResults', []);
  const [students] = useLocalStorage('schoolPortalStudents', []);
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);
  const [staffs] = useLocalStorage('schoolPortalStaff', []); // NEW: Load staff data to get assigned classes/subjects

  const [newResult, setNewResult] = useState({
    classSelect: '',
    studentNameSelect: '',
    subjectSelect: '',
    termSelect: '',
    caType: '',
    score: ''
  });

  const [submitButtonText, setSubmitButtonText] = useState('Add Result');
  const [isEditing, setIsEditing] = useState(false);
  const [editResultId, setEditResultId] = useState(null);
  const [studentIdFilter, setStudentIdFilter] = useState('');

  // NEW: Effect to check login and set user info
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && (user.type === 'admin' || user.type === 'staff')) {
      setLoggedInUser(user);
    } else {
      navigate('/login'); // Redirect if not admin or staff
    }
  }, [navigate]);


  // Handle input changes for the form (remains the same)
  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewResult(prevResult => ({
      ...prevResult,
      [id]: value
    }));
  };

  // Handle form submission (Add or Update) (remains the same)
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
    const resultToAddOrUpdate = { ...newResult, score: score, id: resultIdentifier };

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

    setNewResult({
      classSelect: '',
      studentNameSelect: '',
      subjectSelect: '',
      termSelect: '',
      caType: '',
      score: ''
    });
    setSubmitButtonText('Add Result');
    setIsEditing(false);
    setEditResultId(null);
  };

  // Function to populate form for editing (remains the same)
  const editResult = (resultIdToEdit) => {
    const resultToEdit = results.find(r => r.id === resultIdToEdit);
    if (resultToEdit) {
      setNewResult(resultToEdit);
      setSubmitButtonText('Update Result');
      setIsEditing(true);
      setEditResultId(resultIdToEdit);
    }
  };

  // Function to delete result (remains the same)
  const deleteResult = (resultIdToDelete) => {
    if (window.confirm(`Are you sure you want to delete this result entry?`)) {
      setResults(prevResults => prevResults.filter(result => result.id !== resultIdToDelete));
      alert('Result deleted successfully!');
    }
  };

  // Clear filter and reset form (remains the same)
  const clearFilterAndForm = () => {
    setStudentIdFilter('');
    setNewResult({
      classSelect: '',
      studentNameSelect: '',
      subjectSelect: '',
      termSelect: '',
      caType: '',
      score: ''
    });
    setSubmitButtonText('Add Result');
    setIsEditing(false);
    setEditResultId(null);
  };

  // Filter results based on student admission number (remains the same)
  const filteredResults = studentIdFilter
    ? results.filter(result => result.studentNameSelect.toLowerCase().includes(studentIdFilter.toLowerCase()))
    : results;

  // Helper function to get student name from ID (remains the same)
  const getStudentName = (admissionNo) => {
      const student = students.find(s => s.admissionNo === admissionNo);
      return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  // Helper function to get subject name from code (remains the same)
  const getSubjectName = (subjectCode) => {
      const subject = subjects.find(s => s.subjectCode === subjectCode);
      return subject ? subject.subjectName : 'Unknown Subject';
  };

  // Get unique classes from existing students for the dropdown
  const uniqueClasses = [...new Set(students.map(s => s.studentClass))].sort();


  // NEW: Filtered Students and Subjects based on loggedInUser role
  const isTeacher = loggedInUser && loggedInUser.type === 'staff' && loggedInUser.role.includes('Teacher');
  const teacherAssignedClasses = isTeacher ? loggedInUser.assignedClasses || [] : [];
  const teacherAssignedSubjects = isTeacher ? loggedInUser.assignedSubjects || [] : [];

  const availableClassesForInput = isTeacher
    ? uniqueClasses.filter(cls => teacherAssignedClasses.includes(cls))
    : uniqueClasses; // Admin sees all classes

  const availableStudentsForInput = isTeacher
    ? students.filter(s => teacherAssignedClasses.includes(s.studentClass))
    : students; // Admin sees all students

  const availableSubjectsForInput = isTeacher
    ? subjects.filter(sub => teacherAssignedSubjects.includes(sub.subjectCode))
    : subjects; // Admin sees all subjects


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
            {availableClassesForInput.map(className => ( // Use filtered classes
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
            {availableStudentsForInput // Use filtered students
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
            {availableSubjectsForInput.map(subject => ( // Use filtered subjects
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
          <button type="submit">{submitButtonText}</button>
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {filteredResults.length > 0 ? (
                    filteredResults.map(result => (
                    <tr key={result.id}>
                        <td>{getStudentName(result.studentNameSelect)} ({result.studentNameSelect})</td>
                        <td>{result.classSelect}</td>
                        <td>{getSubjectName(result.subjectSelect)}</td>
                        <td>{result.termSelect}</td>
                        <td>{result.caType}</td>
                        <td>{result.score}</td>
                        <td>
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
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="7">No results found.</td>
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
