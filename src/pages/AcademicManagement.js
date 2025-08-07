// src/pages/AcademicManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import ConfirmModal from '../components/ConfirmModal';

function AcademicManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Data from the backend via a custom hook
  const [subjects, setSubjects, loadingSubjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');

  const initialSubjectState = {
    subjectName: '',
    subjectCode: ''
  };

  const [newSubject, setNewSubject] = useState(initialSubjectState);
  const [submitButtonText, setSubmitButtonText] = useState('Add Subject');
  const [isEditing, setIsEditing] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'admin') {
      setLoggedInAdmin(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const validateForm = () => {
    let errors = {};
    if (!newSubject.subjectName.trim()) errors.subjectName = 'Subject Name is required.';
    if (!newSubject.subjectCode.trim()) errors.subjectCode = 'Subject Code is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewSubject(prevSubject => ({
      ...prevSubject,
      [id]: value
    }));
    setFormErrors(prevErrors => ({ ...prevErrors, [id]: '' }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
      return;
    }

    try {
        if (isEditing) {
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
                setMessage({ type: 'success', text: 'Subject data updated successfully!' });
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: errorData.message || 'Failed to update subject.' });
            }
        } else {
            const response = await fetch('http://localhost:5000/api/schoolPortalSubjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubject),
            });
            if (response.ok) {
                const createdSubject = await response.json();
                setSubjects(prevSubjects => [...prevSubjects, createdSubject]);
                setMessage({ type: 'success', text: 'New subject added successfully!' });
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: errorData.message || 'Failed to add new subject.' });
            }
        }
    } catch (err) {
        setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
    }

    setNewSubject(initialSubjectState);
    setSubmitButtonText('Add Subject');
    setIsEditing(false);
    setEditSubjectId(null);
    setFormErrors({});
  };

  const editSubject = (subjectIdToEdit) => {
    const subjectToEdit = subjects.find(s => s.subjectCode === subjectIdToEdit);
    if (subjectToEdit) {
      setNewSubject(subjectToEdit);
      setSubmitButtonText('Update Subject');
      setIsEditing(true);
      setEditSubjectId(subjectToEdit._id);
      setFormErrors({});
      setMessage(null);
    }
  };

  const deleteSubject = (subjectCodeToDelete) => {
    setSubjectToDelete(subjectCodeToDelete);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsModalOpen(false);
    const subjectToDeleteData = subjects.find(s => s.subjectCode === subjectToDelete);
    if (!subjectToDeleteData) {
      setMessage({ type: 'error', text: 'Subject not found.' });
      return;
    }
    try {
        const response = await fetch(`http://localhost:5000/api/schoolPortalSubjects/${subjectToDeleteData._id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            setSubjects(prevSubjects => prevSubjects.filter(subject => subject.subjectCode !== subjectToDelete));
            setMessage({ type: 'success', text: 'Subject deleted successfully!' });
        } else {
            const errorData = await response.json();
            setMessage({ type: 'error', text: errorData.message || 'Failed to delete subject.' });
        }
    } catch (err) {
        setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setSubjectToDelete(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearchAndForm = () => {
    setSearchTerm('');
    setNewSubject(initialSubjectState);
    setSubmitButtonText('Add Subject');
    setIsEditing(false);
    setEditSubjectId(null);
    setFormErrors({});
    setMessage(null);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!loggedInAdmin) {
    return <div className="content-section">Access Denied. Please log in as an Admin.</div>;
  }

  if (loadingSubjects) {
    return <div className="content-section">Loading subjects data...</div>;
  }

  return (
    <div className="content-section">
      <h2>Academic Management (Subjects)</h2>
      <div className="sub-section">
        <h3>{isEditing ? 'Edit Subject' : 'Add New Subject'}</h3>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form id="subjectForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subjectName">Subject Name:</label>
            <input
              type="text"
              id="subjectName"
              placeholder="e.g., Mathematics"
              required
              value={newSubject.subjectName}
              onChange={handleChange}
              className={formErrors.subjectName ? 'input-error' : ''}
            />
            {formErrors.subjectName && <p className="error-text">{formErrors.subjectName}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="subjectCode">Subject Code:</label>
            <input
              type="text"
              id="subjectCode"
              placeholder="e.g., MATH101"
              required
              value={newSubject.subjectCode}
              onChange={handleChange}
              readOnly={isEditing}
              disabled={isEditing}
              className={formErrors.subjectCode ? 'input-error' : ''}
            />
            {formErrors.subjectCode && <p className="error-text">{formErrors.subjectCode}</p>}
          </div>
          <div className="form-actions full-width">
            <button type="submit">{submitButtonText}</button>
            <button type="button" onClick={clearSearchAndForm} className="secondary-button">Clear Form</button>
          </div>
        </form>
      </div>
      <div className="sub-section">
        <h3>Existing Subjects</h3>
        <div className="filter-controls">
          <input
            type="text"
            id="subjectSearchFilter"
            placeholder="Search by Name or Code"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button onClick={clearSearchAndForm} className="secondary-button">Clear Filter</button>
        </div>
        <div className="table-container">
          <table id="subjectTable">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Subject Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map(subject => (
                  <tr key={subject._id}>
                    <td>{subject.subjectName}</td>
                    <td>{subject.subjectCode}</td>
                    <td className="action-buttons">
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No subjects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        message={`Are you sure you want to delete subject: ${subjectToDelete}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default AcademicManagement;
