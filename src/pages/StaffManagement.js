// src/pages/StaffManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { uploadFile } from '../utils/uploadFile';
import ConfirmModal from '../components/ConfirmModal';


function StaffManagement() {
  const navigate = useNavigate();

<<<<<<< HEAD
  // 1. UPDATED: useLocalStorage only for local persistence.
  const [staffs, setStaffs] = useLocalStorage('schoolPortalStaff', []);
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);
  const [students] = useLocalStorage('schoolPortalStudents', []);
  
  // NEW: State for API loading and fetching errors.
  const [loadingStaffs, setLoadingStaffs] = useState(true);
  const [fetchError, setFetchError] = useState(null);
=======
  const { staffs, setStaffs, subjects, students, loading, error } = useData();
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
  
  const [newStaff, setNewStaff] = useState({
    surname: '',
    firstname: '',
    staffId: '',
    role: '',
    gender: '',
    dateOfEmployment: '',
    department: '',
    qualifications: '',
    contactEmail: '',
    contactPhone: '',
    resumeDocument: '',
    assignedSubjects: [],
    assignedClasses: []   
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitButtonText, setSubmitButtonText] = useState('Add Staff');
  const [isEditing, setIsEditing] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
<<<<<<< HEAD
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Used for Deletion
  const [staffToDelete, setStaffToDelete] = useState(null); // Used for Deletion
  
  // ⭐️ NEW: State for Registration Success Modal
  const [isRegSuccessModalOpen, setIsRegSuccessModalOpen] = useState(false);
  const [newlyRegisteredStaff, setNewlyRegisteredStaff] = useState(null);
=======

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

  const showAlert = (msg, action = () => {}) => {
    setModalMessage(msg);
    setModalAction(() => action);
    setIsModalAlert(true);
    setIsModalOpen(true);
  };
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793

  // 2. FIX: Securely fetch initial staff data on component mount
  useEffect(() => {
    const fetchStaffs = async () => {
        setLoadingStaffs(true);
        setFetchError(null);
        
        const adminToken = localStorage.getItem('adminToken'); // Get the token
        
        if (!adminToken) {
            // FIX: If no token, set an error message and stop loading.
            setFetchError('No Admin Token found. Please log in to view staff data.');
            setLoadingStaffs(false);
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/schoolPortalStaff', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`, // CRITICAL FIX: Add the Authorization header
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch staff data (Status: ${response.status}).`);
            }

            const data = await response.json();
            setStaffs(data);
            
        } catch (err) {
            setFetchError(err.message || 'An unexpected error occurred during staff fetch.');
            console.error('Fetch error:', err);
        } finally {
            setLoadingStaffs(false);
        }
    };
    
    fetchStaffs();
  }, [setStaffs, navigate]);

  const uniqueClasses = [...new Set(students.map(s => s.studentClass))].sort();
  const uniqueSubjects = [...new Set(subjects.map(s => s.subjectCode))].sort();

  const validateField = (name, value) => {
    let error = '';
    // ... (Validation logic remains the same) ...
    switch (name) {
      case 'surname':
      case 'firstname':
      case 'department':
      case 'qualifications':
        if (!value.trim()) error = 'This field cannot be empty.';
        break;
      case 'staffId':
        if (!value.trim()) error = 'Staff ID is required.';
        break;
      case 'contactEmail':
<<<<<<< HEAD
        if (!value.trim()) {
          error = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format.';
        }
        break;
      case 'contactPhone':
        if (!value.trim()) {
          error = 'Contact phone is required.';
        } else if (!/^\d{10,15}$/.test(value)) {
          error = 'Invalid phone number (10-15 digits).';
        }
=======
        if (!value.trim()) error = 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email format.';
        break;
      case 'contactPhone':
        if (!value.trim()) error = 'Phone number is required.';
        if (!/^\d{10,15}$/.test(value)) error = 'Invalid phone number (10-15 digits).';
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
        break;
      case 'role':
      case 'gender':
        if (!value) error = 'Please select an option.';
        break;
      case 'dateOfEmployment':
        if (!value) error = 'Date is required.';
        break;
      default:
        break;
    }
    return error;
  };
  
  const handleChange = (e) => {
    const { id, value, type, files, options } = e.target;
    if (type === 'file') {
      const file = files[0];
      setSelectedFile(file);
      setNewStaff(prevStaff => ({
        ...prevStaff,
        [id]: file ? file.name : ''
      }));
<<<<<<< HEAD
      setFormErrors(prevErrors => ({ ...prevErrors, [id]: '' }));
    } else if (id === 'assignedSubjects' || id === 'assignedClasses') {
=======
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: ''
      }));
    } else if (multiple) {
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setNewStaff(prevStaff => ({
        ...prevStaff,
        [id]: selectedValues
      }));
<<<<<<< HEAD
=======
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: validateField(id, selectedValues)
      }));
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
    } else {
      setNewStaff(prevStaff => ({
        ...prevStaff,
        [id]: value
      }));
<<<<<<< HEAD
      setFormErrors(prevErrors => ({ ...prevErrors, [id]: validateField(id, value) }));
=======
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: validateField(id, value)
      }));
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
    }
  };
  
  const generateStaffId = () => {
    const currentYear = new Date().getFullYear();
    const maxCounter = staffs.length > 0
      ? Math.max(...staffs.map(s => parseInt(s.staffId.split('/').pop() || 0)))
      : 0;
    const nextCounter = maxCounter + 1;
    return `BAC/STF/${currentYear}/${String(nextCounter).padStart(4, '0')}`;
  };

  // 3. FIX: Secure API call for submit (POST/PUT) and handle success modal
  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};
    Object.keys(newStaff).forEach(key => {
<<<<<<< HEAD
        if (key === 'password' && isEditing) return; // Skip password validation on edit if blank
=======
      if (key !== 'staffId' && key !== 'resumeDocument') {
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
        const error = validateField(key, newStaff[key]);
        if (error) errors[key] = error;
    });
<<<<<<< HEAD

=======
    if (newStaff.role.includes('Teacher')) {
      if (newStaff.assignedSubjects.length === 0) {
        errors.assignedSubjects = 'Teachers must be assigned at least one subject.';
      }
      if (newStaff.assignedClasses.length === 0) {
        errors.assignedClasses = 'Teachers must be assigned at least one class.';
      }
    }
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showAlert('Please correct the errors in the form.');
      return;
    }
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        setMessage({ type: 'error', text: 'Admin token missing. Please log in to perform this action.' });
        return;
    }
    
    const secureHeaders = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`, 
    };

    let resumeDocPath = newStaff.resumeDocument;
    if (selectedFile) {
      try {
        resumeDocPath = await uploadFile(selectedFile);
      } catch (err) {
        showAlert(err.message);
        return;
      }
    }

    let finalStaffId = newStaff.staffId;
    // Auto-generate ID only for new registration where no ID has been entered
    if (!isEditing && !finalStaffId) {
      finalStaffId = generateStaffId();
    }
<<<<<<< HEAD
    
    const staffToSave = { 
      ...newStaff, 
      staffId: finalStaffId,
      username: finalStaffId,
      password: newStaff.password || (isEditing ? undefined : 'password123')
    };
=======
    const staffToSave = { ...newStaff, staffId: finalStaffId, username: finalStaffId, resumeDocument: resumeDocPath };
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      if (isEditing) {
        // PUT request for editing
        const response = await fetch(`http://localhost:5000/api/schoolPortalStaff/${editStaffId}`, {
          method: 'PUT',
<<<<<<< HEAD
          headers: secureHeaders,
=======
          headers,
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
          body: JSON.stringify(staffToSave),
        });
        if (response.ok) {
          const updatedStaff = await response.json();
          setStaffs(prevStaffs =>
            prevStaffs.map(staff =>
              staff._id === updatedStaff._id ? updatedStaff : staff
            )
          );
<<<<<<< HEAD
          setMessage({ type: 'success', text: `Staff ${updatedStaff.firstname} updated successfully!` });
=======
          showAlert('Staff data updated successfully!');
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to update staff.');
        }
      } else {
        // POST request for new staff
        const response = await fetch('http://localhost:5000/api/schoolPortalStaff', {
          method: 'POST',
<<<<<<< HEAD
          headers: secureHeaders,
          body: JSON.stringify(staffToSave),
        });
        if (response.ok) {
          const newStaffEntry = await response.json();
          setStaffs(prevStaffs => [...prevStaffs, newStaffEntry]);
          
          // ⭐️ NEW: Set staff data and open success modal
          setNewlyRegisteredStaff(newStaffEntry);
          setIsRegSuccessModalOpen(true);
=======
          headers,
          body: JSON.stringify(staffToSave),
        });
        if (response.ok) {
          const newStaffMember = await response.json();
          setStaffs(prevStaffs => [...prevStaffs, newStaffMember]);
          showAlert('New staff registered successfully!');
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to add new staff.');
        }
      }
    } catch (err) {
      showAlert('An unexpected error occurred. Please check your network connection.');
    }
    
<<<<<<< HEAD
    // Clear form and reset state for new registration
    setNewStaff(initialStaffState);
=======
    setNewStaff({
      surname: '',
      firstname: '',
      staffId: '',
      role: '',
      gender: '',
      dateOfEmployment: '',
      department: '',
      qualifications: '',
      contactEmail: '',
      contactPhone: '',
      resumeDocument: '',
      assignedSubjects: [],
      assignedClasses: []
    });
    setSelectedFile(null);
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
    setSubmitButtonText('Add Staff');
    setIsEditing(false);
    setFormErrors({});
  };
  
  const editStaff = (staffIdToEdit) => {
    const staffToEdit = staffs.find(s => s.staffId === staffIdToEdit);
    if (staffToEdit) {
<<<<<<< HEAD
      setNewStaff({ 
        ...staffToEdit, 
        // Ensure multi-select fields are arrays
        assignedSubjects: staffToEdit.assignedSubjects || [],
        assignedClasses: staffToEdit.assignedClasses || [],
        password: '' // Clear password field for security
      });
=======
      setNewStaff(staffToEdit);
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
      setSubmitButtonText('Update Staff');
      setIsEditing(true);
      setEditStaffId(staffToEdit._id);
      setFormErrors({});
      setSelectedFile(null);
    }
  };
  
<<<<<<< HEAD
  const deleteStaff = async (staffIdToDelete) => {
    setStaffToDelete(staffIdToDelete);
    setIsModalOpen(true);
  };

  // 4. FIX: Secure API call for delete
  const confirmDelete = async () => {
    setIsModalOpen(false);
    const staffToDeleteData = staffs.find(s => s.staffId === staffToDelete);
    if (!staffToDeleteData) {
      setMessage({ type: 'error', text: 'Staff not found.' });
      return;
    }
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        setMessage({ type: 'error', text: 'Admin token missing. Please log in to perform this action.' });
        return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/schoolPortalStaff/${staffToDeleteData._id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${adminToken}`, 
        }
      });
      if (response.ok) {
        setStaffs(prevStaffs => prevStaffs.filter(staff => staff.staffId !== staffToDelete));
        setMessage({ type: 'success', text: 'Staff deleted successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to delete staff.' });
=======
  const deleteStaff = (staffIdToDelete) => {
    showConfirm(
      `Are you sure you want to delete staff with ID: ${staffIdToDelete}?`,
      async () => {
        const staffToDelete = staffs.find(s => s.staffId === staffIdToDelete);
        if (!staffToDelete) {
          showAlert('Staff not found.');
          return;
        }
        try {
          const response = await fetch(`http://localhost:5000/api/schoolPortalStaff/${staffToDelete._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          });
          if (response.ok) {
            setStaffs(prevStaffs => prevStaffs.filter(staff => staff.staffId !== staffIdToDelete));
            showAlert('Staff deleted successfully!');
          } else {
            const errorData = await response.json();
            showAlert(errorData.message || 'Failed to delete staff.');
          }
        } catch (err) {
          showAlert('An unexpected error occurred. Please check your network connection.');
        }
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
      }
    );
  };
  
  // 5. NEW: Function to close the success modal
  const closeRegSuccessModal = () => {
      setIsRegSuccessModalOpen(false);
      setNewlyRegisteredStaff(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearchAndForm = () => {
    setSearchTerm('');
    setNewStaff({
      surname: '',
      firstname: '',
      staffId: '',
      role: '',
      gender: '',
      dateOfEmployment: '',
      department: '',
      qualifications: '',
      contactEmail: '',
      contactPhone: '',
      resumeDocument: '',
      assignedSubjects: [],
      assignedClasses: []
    });
    setSelectedFile(null);
    setSubmitButtonText('Add Staff');
    setIsEditing(false);
    setFormErrors({});
  };
  
  const filteredStaffs = staffs.filter(staff =>
    staff.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
<<<<<<< HEAD
  const uniqueSubjects = [...new Set(subjects.map(s => s.subjectName))].sort();
  const uniqueClasses = [...new Set(students.map(s => s.studentClass))].sort();
=======
  if (!loggedInAdmin || loading) {
      return <div className="content-section">Loading staff data...</div>;
  }
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793

  if (error) {
    return <div className="content-section">Error loading data: {error.message}</div>;
  }
  
  if (fetchError) {
      return (
          <div className="content-section" style={{ color: '#dc3545', fontWeight: 'bold', padding: '20px', border: '1px solid #dc3545', borderRadius: '5px' }}>
              Error fetching data: {fetchError}. Please log in or check the API connection.
          </div>
      );
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
      <h2>Staff Management</h2>
      <div className="sub-section">
<<<<<<< HEAD
        <h3>{isEditing ? 'Edit Staff' : 'Add New Staff'}</h3>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form id="staffForm" onSubmit={handleSubmit}>
=======
        <h3>{isEditing ? 'Edit Staff' : 'Register/Edit Staff'}</h3>
        <form id="teacherForm" onSubmit={handleSubmit} className="staff-form">
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
          <div className="form-group">
            <input
              type="text"
              id="surname"
              placeholder="Surname"
              value={newStaff.surname}
              onChange={handleChange}
              className={`form-input ${formErrors.surname ? 'form-input-error' : ''}`}
            />
            {formErrors.surname && <p className="error-message">{formErrors.surname}</p>}
          </div>
          <div className="form-group">
<<<<<<< HEAD
            <label htmlFor="firstname">First Name:</label>
            <input
              type="text"
              id="firstname"
              placeholder="First Name"
              required
=======
            <input
              type="text"
              id="firstname"
              placeholder="First name"
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
              value={newStaff.firstname}
              onChange={handleChange}
              className={`form-input ${formErrors.firstname ? 'form-input-error' : ''}`}
            />
            {formErrors.firstname && <p className="error-message">{formErrors.firstname}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              id="staffId"
<<<<<<< HEAD
              placeholder={isEditing ? "Staff ID" : "Staff ID (Auto-generated/Manual)"}
              value={newStaff.staffId}
              onChange={handleChange}
              readOnly={isEditing} // Assume staff ID is set on creation and shouldn't be edited
              required
              className={formErrors.staffId ? 'input-error' : ''}
            />
            {formErrors.staffId && <p className="error-text">{formErrors.staffId}</p>}
            {!isEditing && (
              <p style={{ fontSize: '0.8em', color: '#555' }}>
                * Leave blank to auto-generate: {generateStaffId()}
              </p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              required
              value={newStaff.role}
              onChange={handleChange}
              className={formErrors.role ? 'input-error' : ''}
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Support">Support Staff</option>
              <option value="Non-Teaching">Non-Teaching</option>
            </select>
            {formErrors.role && <p className="error-text">{formErrors.role}</p>}
=======
              placeholder="Staff ID (Auto-generated)"
              value={isEditing ? newStaff.staffId : generateStaffId()}
              readOnly
              disabled={!isEditing}
              className="form-input form-input-disabled"
            />
            {formErrors.staffId && <p className="error-message">{formErrors.staffId}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              id="role"
              placeholder="Role (e.g., Teacher, Admin)"
              value={newStaff.role}
              onChange={handleChange}
              className={`form-input ${formErrors.role ? 'form-input-error' : ''}`}
            />
            {formErrors.role && <p className="error-message">{formErrors.role}</p>}
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
          </div>
          <div className="form-group">
            <select
              id="gender"
              value={newStaff.gender}
              onChange={handleChange}
              className={`form-input ${formErrors.gender ? 'form-input-error' : ''}`}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.gender && <p className="error-message">{formErrors.gender}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="dateOfEmployment" className="form-label">Date of Employment:</label>
            <input
              type="date"
              id="dateOfEmployment"
              value={newStaff.dateOfEmployment}
              onChange={handleChange}
              className={`form-input ${formErrors.dateOfEmployment ? 'form-input-error' : ''}`}
            />
            {formErrors.dateOfEmployment && <p className="error-message">{formErrors.dateOfEmployment}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              id="department"
<<<<<<< HEAD
              placeholder="Department (e.g., Science, Admin)"
              required
=======
              placeholder="Department (e.g., Science, Arts)"
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
              value={newStaff.department}
              onChange={handleChange}
              className={`form-input ${formErrors.department ? 'form-input-error' : ''}`}
            />
            {formErrors.department && <p className="error-message">{formErrors.department}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              id="qualifications"
<<<<<<< HEAD
              placeholder="Qualifications (e.g., B.Sc. Comp. Sci.)"
              required
=======
              placeholder="Qualifications (e.g., B.Sc. Education)"
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
              value={newStaff.qualifications}
              onChange={handleChange}
              className={`form-input ${formErrors.qualifications ? 'form-input-error' : ''}`}
            />
            {formErrors.qualifications && <p className="error-message">{formErrors.qualifications}</p>}
          </div>
          <div className="form-group">
            <input
              type="email"
              id="contactEmail"
<<<<<<< HEAD
              placeholder="Email Address"
              required
=======
              placeholder="Contact Email"
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
              value={newStaff.contactEmail}
              onChange={handleChange}
              className={`form-input ${formErrors.contactEmail ? 'form-input-error' : ''}`}
            />
            {formErrors.contactEmail && <p className="error-message">{formErrors.contactEmail}</p>}
          </div>
          <div className="form-group">
            <input
              type="tel"
              id="contactPhone"
<<<<<<< HEAD
              placeholder="Phone Number"
              required
=======
              placeholder="Contact Phone"
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
              value={newStaff.contactPhone}
              onChange={handleChange}
              className={`form-input ${formErrors.contactPhone ? 'form-input-error' : ''}`}
            />
<<<<<<< HEAD
            {formErrors.contactPhone && <p className="error-text">{formErrors.contactPhone}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password: {isEditing && <span style={{ color: '#888', fontStyle: 'italic' }}>(Leave blank to keep current)</span>}</label>
            <input
              type="password"
              id="password"
              placeholder={isEditing ? "Leave blank" : "Password"}
              required={!isEditing}
              value={newStaff.password}
              onChange={handleChange}
              className={formErrors.password ? 'input-error' : ''}
            />
            {formErrors.password && <p className="error-text">{formErrors.password}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="assignedSubjects">Assigned Subjects (Hold Ctrl/Cmd to select multiple):</label>
            <select
                id="assignedSubjects"
                multiple
                value={newStaff.assignedSubjects}
                onChange={handleChange}
            >
                {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="assignedClasses">Assigned Classes (Hold Ctrl/Cmd to select multiple):</label>
            <select
                id="assignedClasses"
                multiple
                value={newStaff.assignedClasses}
                onChange={handleChange}
            >
                {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="resumeDocument">Resume/CV (PDF/DOCX):</label>
=======
            {formErrors.contactPhone && <p className="error-message">{formErrors.contactPhone}</p>}
          </div>
          {newStaff.role.includes('Teacher') && (
            <>
              <div className="form-group form-group-full">
                <label htmlFor="assignedSubjects" className="form-label">Assigned Subjects (Ctrl+Click to select multiple):</label>
                <select
                  id="assignedSubjects"
                  multiple
                  value={newStaff.assignedSubjects}
                  onChange={handleChange}
                  className={`form-input multiselect ${formErrors.assignedSubjects ? 'form-input-error' : ''}`}
                >
                  {uniqueSubjects.length > 0 ? (
                    uniqueSubjects.map(subjectCode => (
                      <option key={subjectCode} value={subjectCode}>
                        {subjects.find(s => s.subjectCode === subjectCode)?.subjectName || subjectCode}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No subjects available. Add subjects in Academic Management.</option>
                  )}
                </select>
                {formErrors.assignedSubjects && <p className="error-message">{formErrors.assignedSubjects}</p>}
              </div>
              <div className="form-group form-group-full">
                <label htmlFor="assignedClasses" className="form-label">Assigned Classes (Ctrl+Click to select multiple):</label>
                <select
                  id="assignedClasses"
                  multiple
                  value={newStaff.assignedClasses}
                  onChange={handleChange}
                  className={`form-input multiselect ${formErrors.assignedClasses ? 'form-input-error' : ''}`}
                >
                  {uniqueClasses.length > 0 ? (
                    uniqueClasses.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))
                  ) : (
                    <option value="" disabled>No classes available. Add students to create classes.</option>
                  )}
                </select>
                {formErrors.assignedClasses && <p className="error-message">{formErrors.assignedClasses}</p>}
              </div>
            </>
          )}
          <div className="form-group form-group-full">
            <label htmlFor="resumeDocument" className="form-label">Resume/CV (PDF/Doc/Image):</label>
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
            <input
              type="file"
              id="resumeDocument"
              onChange={handleChange}
<<<<<<< HEAD
              accept=".pdf,.doc,.docx"
              className={formErrors.resumeDocument ? 'input-error' : ''}
            />
            {newStaff.resumeDocument && <p style={{ fontSize: '0.8em', color: '#555' }}>Selected: {newStaff.resumeDocument}</p>}
            {formErrors.resumeDocument && <p className="error-text">{formErrors.resumeDocument}</p>}
=======
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className={`form-input-file ${formErrors.resumeDocument ? 'form-input-error' : ''}`}
            />
            {newStaff.resumeDocument && <p className="file-info">Selected: {newStaff.resumeDocument}</p>}
            {formErrors.resumeDocument && <p className="error-message">{formErrors.resumeDocument}</p>}
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
          </div>
          
          <div className="form-actions">
            <button type="submit" className="form-submit-btn">
              {submitButtonText}
            </button>
            <button type="button" onClick={clearSearchAndForm} className="form-clear-btn">
              Clear Form
            </button>
          </div>
        </form>
      </div>
      <div className="sub-section">
        <h3>Staff List ({filteredStaffs.length} Found)</h3>
        <div className="filter-controls">
          <input
            type="text"
            id="staffSearchFilter"
            placeholder="Search by Name, ID, or Role"
            value={searchTerm}
            onChange={handleSearchChange}
            className="filter-input"
          />
<<<<<<< HEAD
          <button onClick={clearSearchAndForm} className="secondary-button">Clear Search & Form</button>
        </div>
        <div className="table-container">
          <table id="staffTable">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Dept.</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Subjects</th>
                <th>Classes</th>
                <th>Resume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffs.length > 0 ? (
                filteredStaffs.map(staff => (
                <tr key={staff._id}>
                    <td>{staff.staffId}</td>
                    <td>{staff.surname} {staff.firstname}</td>
                    <td>{staff.role}</td>
                    <td>{staff.department}</td>
                    <td>{staff.gender}</td>
                    <td>{staff.contactPhone}</td>
                    <td>{staff.contactEmail}</td>
                    <td>{staff.assignedSubjects && staff.assignedSubjects.length > 0 ? staff.assignedSubjects.join(', ') : 'N/A'}</td>
                    <td>{staff.assignedClasses && staff.assignedClasses.length > 0 ? staff.assignedClasses.join(', ') : 'N/A'}</td>
                    <td>{staff.resumeDocument ? <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulating download of: ${staff.resumeDocument}`); }}>{staff.resumeDocument}</a> : 'N/A'}</td>
                    <td className="action-buttons">
                    <button
                        className="action-btn edit-btn"
                        onClick={() => editStaff(staff.staffId)}>
                        Edit
                    </button>
                    <button
                        className="action-btn delete-btn"
                        onClick={() => deleteStaff(staff.staffId)}>
                        Delete
                    </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="11">No staff found.</td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Existing Deletion Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        message={`Are you sure you want to delete staff with ID: ${staffToDelete}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      {/* ⭐️ NEW Registration Success Modal */}
      {newlyRegisteredStaff && (
          <ConfirmModal
              isOpen={isRegSuccessModalOpen}
              message={`Success! Staff ${newlyRegisteredStaff.firstname} ${newlyRegisteredStaff.surname} has been registered with Staff ID: ${newlyRegisteredStaff.staffId}.`}
              onConfirm={closeRegSuccessModal}
              onCancel={closeRegSuccessModal} // Both actions close the acknowledgment modal
          />
      )}
=======
          <button onClick={clearSearchAndForm} className="filter-clear-btn">
            Clear Filter / Reset Form
          </button>
        </div>
        <div className="table-container">
            <table className="staff-table">
                <thead>
                    <tr>
                        <th>Staff ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Qualifications</th>
                        <th>Subjects</th>
                        <th>Classes</th>
                        <th>Resume</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {filteredStaffs.length > 0 ? (
                    filteredStaffs.map((staff, index) => (
                    <tr key={staff._id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                        <td>{staff.staffId}</td>
                        <td>{staff.firstname} {staff.surname}</td>
                        <td>{staff.role}</td>
                        <td>{staff.department}</td>
                        <td>{staff.contactEmail}</td>
                        <td>{staff.contactPhone}</td>
                        <td>{staff.qualifications}</td>
                        <td>{staff.assignedSubjects && staff.assignedSubjects.length > 0 ? staff.assignedSubjects.join(', ') : 'N/A'}</td>
                        <td>{staff.assignedClasses && staff.assignedClasses.length > 0 ? staff.assignedClasses.join(', ') : 'N/A'}</td>
                        <td>{staff.resumeDocument ? <a href={`http://localhost:5000${staff.resumeDocument}`} target="_blank" rel="noopener noreferrer">{staff.resumeDocument.split('/').pop()}</a> : 'N/A'}</td>
                        <td className="table-actions">
                        <button
                            className="action-btn edit-btn"
                            onClick={() => editStaff(staff.staffId)}>
                            Edit
                        </button>
                        <button
                            className="action-btn delete-btn"
                            onClick={() => deleteStaff(staff.staffId)}>
                            Delete
                        </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="11" className="no-data">No staff found.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
      </div>
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
    </div>
  );
}

export default StaffManagement;