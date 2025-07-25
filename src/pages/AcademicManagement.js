// src/pages/AcademicManagement.js
import React, {useState} from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

function AcademicManagement() {
  // State for the list of subjects
  const [subjects, setSubjects] = useLocalStorage('schoolPortalSubjects',[]);

  // State for new subject form inputs
  const [newSubject, setNewSubject] = useState({
    subjectName: '',
    subjectCode: ''
  });

  // State to control button text (Add/Update)
  const [submitButtonText, setSubmitButtonText] = useState('Add Subject');
  // State to keep track if we are in edit mode
  const [isEditing, setIsEditing] = useState(false);
  // State for search filter (optional for subjects, but included for consistency)
  const [searchTerm, setSearchTerm] = useState('');

  // useEffect to load subjects from localStorage on initial component mount
  useLocalStorage(() => {
    const storedSubjects = localStorage.getItem('schoolPortalSubjects');
    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects));
    }
  }, []);

  // useEffect to save subjects to localStorage whenever the 'subjects' state changes
  useLocalStorage(() => {
    if (subjects.length > 0 || localStorage.getItem('schoolPortalSubjects')) {
        localStorage.setItem('schoolPortalSubjects', JSON.stringify(subjects));
    }
  }, [subjects]);

  // Handle input changes for the form
  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewSubject(prevSubject => ({
      ...prevSubject,
      [id]: value
    }));
  };

  // Handle form submission (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !newSubject.subjectName ||
      !newSubject.subjectCode
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (isEditing) {
      // Update existing subject
      setSubjects(prevSubjects =>
        prevSubjects.map(subject =>
          subject.subjectCode === newSubject.subjectCode ? { ...newSubject } : subject
        )
      );
      alert('Subject data updated successfully!');
    } else {
      // Add new subject
      // Check for duplicate subject code before adding
      if (subjects.some(s => s.subjectCode.toLowerCase() === newSubject.subjectCode.toLowerCase())) {
          alert('A subject with this code already exists. Please use a unique code.');
          return;
      }
      setSubjects(prevSubjects => [...prevSubjects, newSubject]);
      alert('New subject added successfully!');
    }

    // Reset form and state after submission
    setNewSubject({
      subjectName: '',
      subjectCode: ''
    });
    setSubmitButtonText('Add Subject');
    setIsEditing(false);
  };

  // Function to populate form for editing
  const editSubject = (subjectCodeToEdit) => {
    const subjectToEdit = subjects.find(s => s.subjectCode === subjectCodeToEdit);
    if (subjectToEdit) {
      setNewSubject(subjectToEdit);
      setSubmitButtonText('Update Subject');
      setIsEditing(true);
    }
  };

  // Function to delete subject
  const deleteSubject = (subjectCodeToDelete) => {
    if (window.confirm(`Are you sure you want to delete subject: ${subjectCodeToDelete}?`)) {
      setSubjects(prevSubjects => prevSubjects.filter(subject => subject.subjectCode !== subjectCodeToDelete));
      alert('Subject deleted successfully!');
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search filter and reset form if in edit mode
  const clearSearchAndForm = () => {
    setSearchTerm('');
    setNewSubject({
      subjectName: '',
      subjectCode: ''
    });
    setSubmitButtonText('Add Subject');
    setIsEditing(false);
  };

  // Filter subjects based on search term (case-insensitive)
  const filteredSubjects = subjects.filter(subject =>
    subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="content-section">
      <h1>Academic Management (Subjects)</h1> {/* Updated from h2 to h1 based on provided HTML */}

      <div className="sub-section">
        <h2>{isEditing ? 'Edit Subject' : 'Add/Edit Subject'}</h2>
        <form id="subjectForm" onSubmit={handleSubmit}>
          <input
            type="text"
            id="subjectName"
            placeholder="Subject Name (e.g., Mathematics)"
            required
            value={newSubject.subjectName}
            onChange={handleChange}
          />
          <input
            type="text"
            id="subjectCode"
            placeholder="Subject Code (e.g., MATH101)"
            required
            value={newSubject.subjectCode}
            onChange={handleChange}
            readOnly={isEditing} // Make code read-only when editing an existing subject
            disabled={isEditing} // Visually disable it too when editing
          />
          <button type="submit">{submitButtonText}</button>
        </form>
      </div>

      <div className="sub-section">
        <h3>Existing Subjects</h3>
        <input
          type="text"
          id="subjectSearchFilter"
          placeholder="Search by Name or Code"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button onClick={clearSearchAndForm}>Clear Filter / Reset Form</button>
        <ul id="subjectList"> {/* Using ul for consistency with provided HTML */}
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map(subject => (
              <li key={subject.subjectCode}>
                <strong>{subject.subjectName}</strong> ({subject.subjectCode})
                <span>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => editSubject(subject.subjectCode)}>
                    Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => deleteSubject(subject.subjectCode)}>
                    Delete
                  </button>
                </span>
              </li>
            ))
          ) : (
            <li>No subjects found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default AcademicManagement;
