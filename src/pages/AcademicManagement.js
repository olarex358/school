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
  const [editSubjectId, setEditSubjectId] = useState(null); // To store the MongoDB _id
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewSubject(prevSubject => ({
      ...prevSubject,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSubject.subjectName || !newSubject.subjectCode) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
        if (isEditing) {
            // Send PUT request to update
            const response = await fetch(`http://localhost:5000/api/schoolPortalSubjects/${editSubjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubject),
            });
            if (response.ok) {
                const updatedSubject = await response.json();
                setSubjects(prevSubjects =>
                    prevSubjects.map(sub => (sub._id === updatedSubject._id ? updatedSubject : sub))
                );
                alert('Subject data updated successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to update subject.');
            }
        } else {
            // Send POST request to create
            const response = await fetch('http://localhost:5000/api/schoolPortalSubjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubject),
            });
            if (response.ok) {
                const createdSubject = await response.json();
                setSubjects(prevSubjects => [...prevSubjects, createdSubject]);
                alert('New subject added successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to add new subject.');
            }
        }
    } catch (err) {
        alert('An unexpected error occurred. Please check your network connection.');
    }

    // Reset form
    setNewSubject({
      subjectName: '',
      subjectCode: ''
    });
    setSubmitButtonText('Add Subject');
    setIsEditing(false);
    setEditSubjectId(null);
  };

  const editSubject = (subjectCodeToEdit) => {
    const subjectToEdit = subjects.find(s => s.subjectCode === subjectCodeToEdit);
    if (subjectToEdit) {
      setNewSubject(subjectToEdit);
      setSubmitButtonText('Update Subject');
      setIsEditing(true);
      setEditSubjectId(subjectToEdit._id); // Store the MongoDB _id
    }
  };

  const deleteSubject = async (subjectCodeToDelete) => {
    if (window.confirm(`Are you sure you want to delete subject: ${subjectCodeToDelete}?`)) {
        const subjectToDelete = subjects.find(s => s.subjectCode === subjectCodeToDelete);
        if (!subjectToDelete) {
            alert('Subject not found.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/schoolPortalSubjects/${subjectToDelete._id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setSubjects(prevSubjects => prevSubjects.filter(subject => subject.subjectCode !== subjectCodeToDelete));
                alert('Subject deleted successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to delete subject.');
            }
        } catch (err) {
            alert('An unexpected error occurred. Please check your network connection.');
        }
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
    setEditSubjectId(null);
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
              <li key={subject._id}>
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