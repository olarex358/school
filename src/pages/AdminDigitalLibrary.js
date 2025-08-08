// src/pages/AdminDigitalLibrary.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { uploadFile } from '../utils/uploadFile';
import ConfirmModal from '../components/ConfirmModal';


function AdminDigitalLibrary() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  const { digitalLibrary, setDigitalLibrary, students, loading, error } = useData();

  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    audience: 'all',
    applicableClass: 'all',
    filename: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editResourceId, setEditResourceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState(() => {});
  const [isModalAlert, setIsModalAlert] = useState(false);

  const showConfirm = (msg, action) => {
    setModalMessage(msg);
    setModalAction(() => action);
    setIsModalAlert(false);
    setIsModalOpen(true);
  };

  const showAlert = (msg) => {
    setModalMessage(msg);
    setIsModalAlert(true);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'admin') {
      setLoggedInAdmin(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const uniqueClasses = ['all', ...new Set(students.map(s => s.studentClass))].sort();

  const validateForm = () => {
    let errors = {};
    if (!resourceForm.title.trim()) errors.title = 'Title is required.';
    if (!resourceForm.description.trim()) errors.description = 'Description is required.';
    if (!resourceForm.audience) errors.audience = 'Audience is required.';
    if (!selectedFile && !isEditing) errors.filename = 'A file is required.';
    if (!resourceForm.applicableClass) errors.applicableClass = 'Applicable Class is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setSelectedFile(file);
      setResourceForm(prev => ({ ...prev, filename: file ? file.name : '' }));
      setFormErrors(prev => ({ ...prev, filename: '' }));
    } else {
      setResourceForm(prev => ({ ...prev, [id]: value }));
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert('Please correct the errors in the form.');
      return;
    }
    
    let filePath = resourceForm.filename;

    if (selectedFile) {
        try {
            filePath = await uploadFile(selectedFile, 'digital-library');
        } catch (err) {
            showAlert(err.message);
            return;
        }
    }

    const resourceToSave = {
      ...resourceForm,
      filename: filePath,
      timestamp: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      if (isEditing) {
        const response = await fetch(`http://localhost:5000/api/schoolPortalDigitalLibrary/${editResourceId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(resourceToSave),
        });
        if (response.ok) {
          const updatedResource = await response.json();
          setDigitalLibrary(prev =>
            prev.map(res => (res._id === updatedResource._id ? updatedResource : res))
          );
          showAlert('Resource updated successfully!');
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to update resource.');
        }
      } else {
        const response = await fetch('http://localhost:5000/api/schoolPortalDigitalLibrary', {
          method: 'POST',
          headers,
          body: JSON.stringify(resourceToSave),
        });
        if (response.ok) {
          const newResource = await response.json();
          setDigitalLibrary(prev => [...prev, newResource]);
          showAlert('New resource added successfully!');
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to add new resource.');
        }
      }
    } catch (err) {
      showAlert('An unexpected error occurred. Please check your network connection.');
    }
    
    setResourceForm({
      title: '',
      description: '',
      audience: 'all',
      applicableClass: 'all',
      filename: ''
    });
    setSelectedFile(null);
    setIsEditing(false);
    setEditResourceId(null);
    setFormErrors({});
  };

  const editResource = (idToEdit) => {
    const resource = digitalLibrary.find(res => res._id === idToEdit);
    if (resource) {
      setResourceForm(resource);
      setIsEditing(true);
      setEditResourceId(idToEdit);
      setSelectedFile(null);
      setFormErrors({});
    }
  };

  const deleteResource = (idToDelete) => {
    showConfirm(
      'Are you sure you want to delete this resource?',
      async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/schoolPortalDigitalLibrary/${idToDelete}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          });
          if (response.ok) {
            setDigitalLibrary(prev => prev.filter(res => res._id !== idToDelete));
            showAlert('Resource deleted successfully!');
          } else {
            const errorData = await response.json();
            showAlert(errorData.message || 'Failed to delete resource.');
          }
        } catch (err) {
          showAlert('An unexpected error occurred. Please check your network connection.');
        }
      }
    );
  };

  const clearForm = () => {
    setResourceForm({
      title: '',
      description: '',
      audience: 'all',
      applicableClass: 'all',
      filename: ''
    });
    setSelectedFile(null);
    setIsEditing(false);
    setEditResourceId(null);
    setFormErrors({});
  };

  const filteredResources = digitalLibrary.filter(res =>
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.filename.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  if (!loggedInAdmin || loading) {
    return <div className="content-section">Loading resources data...</div>;
  }

  if (error) {
    return <div className="content-section">Error loading data: {error.message}</div>;
  }

  return (
    <div className="content-section">
      <ConfirmModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={() => { modalAction(); setIsModalOpen(false); }}
        onCancel={() => setIsModalOpen(false)}
        isAlert={isModalAlert}
      />
      <h1>Digital Library Management</h1>
      <div className="sub-section">
        <h2>{isEditing ? 'Edit Digital Resource' : 'Add New Digital Resource'}</h2>
        <form onSubmit={handleSubmit} className="digital-library-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">Resource Title:</label>
            <input
              type="text"
              id="title"
              value={resourceForm.title}
              onChange={handleChange}
              placeholder="e.g., JSS1 Math Textbook"
              className={`form-input ${formErrors.title ? 'form-input-error' : ''}`}
            />
            {formErrors.title && <p className="error-message">{formErrors.title}</p>}
          </div>
          <div className="form-group form-group-full">
            <label htmlFor="description" className="form-label">Description:</label>
            <textarea
              id="description"
              value={resourceForm.description}
              onChange={handleChange}
              rows="3"
              placeholder="A brief description of the resource."
              className={`form-input ${formErrors.description ? 'form-input-error' : ''}`}
            ></textarea>
            {formErrors.description && <p className="error-message">{formErrors.description}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="audience" className="form-label">Audience:</label>
            <select
              id="audience"
              value={resourceForm.audience}
              onChange={handleChange}
              className={`form-input ${formErrors.audience ? 'form-input-error' : ''}`}
            >
              <option value="all">All (Students & Staff)</option>
              <option value="students">Students Only</option>
              <option value="staff">Staff Only</option>
            </select>
            {formErrors.audience && <p className="error-message">{formErrors.audience}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="applicableClass" className="form-label">Applicable Class:</label>
            <select
              id="applicableClass"
              value={resourceForm.applicableClass}
              onChange={handleChange}
              className={`form-input ${formErrors.applicableClass ? 'form-input-error' : ''}`}
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            {formErrors.applicableClass && <p className="error-message">{formErrors.applicableClass}</p>}
          </div>
          <div className="form-group form-group-full">
            <label htmlFor="filename" className="form-label">File Upload:</label>
            <input
              type="file"
              id="filename"
              onChange={handleChange}
              className={`form-input-file ${formErrors.filename ? 'form-input-error' : ''}`}
              disabled={isEditing}
            />
            {formErrors.filename && <p className="error-message">{formErrors.filename}</p>}
            {resourceForm.filename && <small className="file-info">Selected: {selectedFile?.name || resourceForm.filename.split('/').pop().substring(14)}</small>}
          </div>
          <div className="form-actions">
            <button type="submit" className="form-submit-btn">
              {isEditing ? 'Update Resource' : 'Add Resource'}
            </button>
            <button type="button" onClick={clearForm} className="form-clear-btn">
              Clear Form
            </button>
          </div>
        </form>
      </div>
      <div className="sub-section">
        <h2>All Digital Resources</h2>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <div className="table-container">
          <table className="digital-library-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>File</th>
                <th>Audience</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map((res, index) => (
                  <tr key={res._id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>{res.title}</td>
                    <td>{res.description.substring(0, 50)}...</td>
                    <td>
                      <a href={res.filename} target="_blank" rel="noopener noreferrer">
                        {res.filename.split('/').pop().split('-').slice(1).join('-')}
                      </a>
                    </td>
                    <td>{res.audience}</td>
                    <td>{res.applicableClass}</td>
                    <td className="table-actions">
                      <button className="action-btn edit-btn" onClick={() => editResource(res._id)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => deleteResource(res._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No digital resources found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDigitalLibrary;
