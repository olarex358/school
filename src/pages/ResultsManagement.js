// src/pages/ResultsManagement.js
import React, {useState} from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

function ResultsManagement() {
  // State for the list of results
  const [results, setResults] = useLocalStorage('schoolPortalResults',[]);
  // State for data to populate dropdowns (students and subjects)
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // State for new result form inputs
  const [newResult, setNewResult] = useState({
    classSelect: '',
    studentNameSelect: '', // Will store student's admissionNo
    subjectSelect: '',     // Will store subjectCode
    termSelect: '',
    caType: '', // Renamed from 'CA' to 'caType' for clarity
    score: ''
  });

  // State to control button text (Add/Update)
  const [submitButtonText, setSubmitButtonText] = useState('Add Result');
  // State to keep track if we are in edit mode
  const [isEditing, setIsEditing] = useState(false);
  // State to store the ID of the result being edited (combination of student/subject/term/caType)
  const [editResultId, setEditResultId] = useState(null);
  // State for filter by student ID
  const [studentIdFilter, setStudentIdFilter] = useState('');


  // useEffect to load students and subjects from localStorage on initial mount
  useLocalStorage(() => {
    const storedStudents = localStorage.getItem('schoolPortalStudents');
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
    const storedSubjects = localStorage.getItem('schoolPortalSubjects');
    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects));
    }
    // Load results as well
    const storedResults = localStorage.getItem('schoolPortalResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
  }, []); // Empty dependency array means this runs only once on mount

  // useEffect to save results to localStorage whenever the 'results' state changes
  useLocalStorage(() => {
    if (results.length > 0 || localStorage.getItem('schoolPortalResults')) {
      localStorage.setItem('schoolPortalResults', JSON.stringify(results));
    }
  }, [results]); // This effect runs whenever 'results' state changes

  // Handle input changes for the form
  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewResult(prevResult => ({
      ...prevResult,
      [id]: value
    }));
  };

  // Handle form submission (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
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

    // Create a unique identifier for each result entry (student + subject + term + CA type)
    const resultIdentifier = `${newResult.studentNameSelect}-${newResult.subjectSelect}-${newResult.termSelect}-${newResult.caType}`;
    const resultToAddOrUpdate = { ...newResult, score: score, id: resultIdentifier }; // Add unique ID

    if (isEditing) {
      // Update existing result
      setResults(prevResults =>
        prevResults.map(result =>
          result.id === editResultId ? resultToAddOrUpdate : result
        )
      );
      alert('Result updated successfully!');
    } else {
      // Add new result
      // Check for duplicate entry for the same student, subject, term, and CA type
      if (results.some(r => r.id === resultIdentifier)) {
        alert('This result entry already exists. Please edit it or choose different criteria.');
        return;
      }
      setResults(prevResults => [...prevResults, resultToAddOrUpdate]);
      alert('Result added successfully!');
    }

    // Reset form and state after submission
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

  // Function to populate form for editing
  const editResult = (resultIdToEdit) => {
    const resultToEdit = results.find(r => r.id === resultIdToEdit);
    if (resultToEdit) {
      setNewResult(resultToEdit); // Populate the form state with result data
      setSubmitButtonText('Update Result');
      setIsEditing(true);
      setEditResultId(resultIdToEdit);
    }
  };

  // Function to delete result
  const deleteResult = (resultIdToDelete) => {
    if (window.confirm(`Are you sure you want to delete this result entry?`)) {
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
      score: ''
    });
    setSubmitButtonText('Add Result');
    setIsEditing(false);
    setEditResultId(null);
  };

  // Filter results based on student admission number
  const filteredResults = studentIdFilter
    ? results.filter(result => result.studentNameSelect.toLowerCase().includes(studentIdFilter.toLowerCase()))
    : results;

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
            {/* Dynamically populate classes based on available students, or hardcode if preferred */}
            <option value="JSS 1">JSS 1</option>
            <option value="JSS 2">JSS 2</option>
            <option value="JSS 3">JSS 3</option>
            <option value="SS 1">SS 1</option>
            <option value="SS 2">SS 2</option>
            <option value="SS 3">SS 3</option>
          </select>
          <select
            id="studentNameSelect"
            required
            value={newResult.studentNameSelect}
            onChange={handleChange}
            // Only show students for the selected class, if a class is selected
            // (Advanced: filter `students` state based on `newResult.classSelect` before mapping)
          >
            <option value="">Select Student Name</option>
            {students
                .filter(student => !newResult.classSelect || student.studentClass === newResult.classSelect.replace(' ', ''))
                .map(student => (
                <option key={student.admissionNo} value={student.admissionNo}>
                    {student.firstName} {student.lastName} ({student.admissionNo})
                </option>
            ))}
          </select>
          <select
            id="subjectSelect"
            required
            value={newResult.subjectSelect}
            onChange={handleChange}
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.subjectCode} value={subject.subjectCode}>
                {subject.subjectName} ({subject.subjectCode})
              </option>
            ))}
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
          {/* Export button placeholder */}
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
        <div className="table-container"> {/* Using table for results list */}
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
                    <tr key={result.id}> {/* Use the unique identifier as key */}
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
