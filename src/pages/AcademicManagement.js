// src/pages/AcademicManagement.js
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

function AcademicManagement() {
  // Update hook to get data from the backend
  const [subjects, setSubjects, loadingSubjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');

  const [newSubject, setNewSubject] = useState({
    subjectName: '',
    subjectCode: ''
  });
  const [submitButtonText, setSubmitButtonText] = useState('Add Subject');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewSubject(prevSubject => ({
      ...prevSubject,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSubject.subjectName || !newSubject.subjectCode) {
      alert('Please fill in all required fields.');
      return;
    }
    if (isEditing) {
      setSubjects(prevSubjects =>
        prevSubjects.map(subject =>
          subject.subjectCode === newSubject.subjectCode ? { ...newSubject } : subject
        )
      );
      alert('Subject data updated successfully!');
    } else {
      if (subjects.some(s => s.subjectCode.toLowerCase() === newSubject.subjectCode.toLowerCase())) {
        alert('A subject with this code already exists. Please use a unique code.');
        return;
      }
      setSubjects(prevSubjects => [...prevSubjects, newSubject]);
      alert('New subject added successfully!');
    }
    setNewSubject({
      subjectName: '',
      subjectCode: ''
    });
    setSubmitButtonText('Add Subject');
    setIsEditing(false);
  };

  const editSubject = (subjectCodeToEdit) => {
    const subjectToEdit = subjects.find(s => s.subjectCode === subjectCodeToEdit);
    if (subjectToEdit) {
      setNewSubject(subjectToEdit);
      setSubmitButtonText('Update Subject');
      setIsEditing(true);
    }
  };

  const deleteSubject = (subjectCodeToDelete) => {
    if (window.confirm(`Are you sure you want to delete subject: ${subjectCodeToDelete}?`)) {
      setSubjects(prevSubjects => prevSubjects.filter(subject => subject.subjectCode !== subjectCodeToDelete));
      alert('Subject deleted successfully!');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearchAndForm = () => {
    setSearchTerm('');
    setNewSubject({
      subjectName: '',
      subjectCode: ''
    });
    setSubmitButtonText('Add Subject');
    setIsEditing(false);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingSubjects) {
    return <div className="content-section">Loading subjects data...</div>;
  }

  return (
    <div className="content-section">
      <h1>Academic Management (Subjects)</h1>
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
            readOnly={isEditing}
            disabled={isEditing}
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
        <ul id="subjectList">
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