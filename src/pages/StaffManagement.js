// src/pages/StaffManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { uploadFile } from '../utils/uploadFile';
import ConfirmModal from '../components/ConfirmModal';


function StaffManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  const { staffs, setStaffs, subjects, students, loading, error } = useData();
  
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'admin') {
      setLoggedInAdmin(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const uniqueClasses = [...new Set(students.map(s => s.studentClass))].sort();
  const uniqueSubjects = [...new Set(subjects.map(s => s.subjectCode))].sort();

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'surname':
      case 'firstname':
      case 'role':
      case 'department':
      case 'qualifications':
        if (!value.trim()) error = 'This field cannot be empty.';
        break;
      case 'gender':
        if (!value) error = 'Please select gender.';
        break;
      case 'dateOfEmployment':
        if (!value) error = 'Date of employment is required.';
        break;
      case 'contactEmail':
        if (!value.trim()) error = 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email format.';
        break;
      case 'contactPhone':
        if (!value.trim()) error = 'Phone number is required.';
        if (!/^\d{10,15}$/.test(value)) error = 'Invalid phone number (10-15 digits).';
        break;
      case 'assignedSubjects':
        if (newStaff.role.includes('Teacher') && value.length === 0) error = 'Teachers must be assigned at least one subject.';
        break;
      case 'assignedClasses':
        if (newStaff.role.includes('Teacher') && value.length === 0) error = 'Teachers must be assigned at least one class.';
        break;
      default:
        break;
    }
    return error;
  };
  
  const handleChange = (e) => {
    const { id, value, type, files, options, multiple } = e.target;
    if (type === 'file') {
      const file = files[0];
      setSelectedFile(file);
      setNewStaff(prevStaff => ({
        ...prevStaff,
        [id]: file ? file.name : ''
      }));
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: ''
      }));
    } else if (multiple) {
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setNewStaff(prevStaff => ({
        ...prevStaff,
        [id]: selectedValues
      }));
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: validateField(id, selectedValues)
      }));
    } else {
      setNewStaff(prevStaff => ({
        ...prevStaff,
        [id]: value
      }));
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: validateField(id, value)
      }));
    }
  };

  const generateStaffId = () => {
    const currentYear = new Date().getFullYear();
    const maxCounter = staffs.length > 0
      ? Math.max(...staffs.map(s => parseInt(s.staffId.split('/').pop())))
      : 0;
    const nextCounter = maxCounter + 1;
    return `STAFF/${currentYear}/${String(nextCounter).padStart(4, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};
    Object.keys(newStaff).forEach(key => {
      if (key !== 'staffId' && key !== 'resumeDocument') {
        const error = validateField(key, newStaff[key]);
        if (error) errors[key] = error;
      }
    });
    if (newStaff.role.includes('Teacher')) {
      if (newStaff.assignedSubjects.length === 0) {
        errors.assignedSubjects = 'Teachers must be assigned at least one subject.';
      }
      if (newStaff.assignedClasses.length === 0) {
        errors.assignedClasses = 'Teachers must be assigned at least one class.';
      }
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showAlert('Please correct the errors in the form.');
      return;
    }

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
    if (!isEditing) {
      finalStaffId = generateStaffId();
    }
    const staffToSave = { ...newStaff, staffId: finalStaffId, username: finalStaffId, resumeDocument: resumeDocPath };
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      if (isEditing) {
        const response = await fetch(`http://localhost:5000/api/schoolPortalStaff/${editStaffId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(staffToSave),
        });
        if (response.ok) {
          const updatedStaff = await response.json();
          setStaffs(prevStaffs =>
            prevStaffs.map(staff =>
              staff._id === updatedStaff._id ? updatedStaff : staff
            )
          );
          showAlert('Staff data updated successfully!');
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to update staff.');
        }
      } else {
        const response = await fetch('http://localhost:5000/api/schoolPortalStaff', {
          method: 'POST',
          headers,
          body: JSON.stringify(staffToSave),
        });
        if (response.ok) {
          const newStaffMember = await response.json();
          setStaffs(prevStaffs => [...prevStaffs, newStaffMember]);
          showAlert('New staff registered successfully!');
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to add new staff.');
        }
      }
    } catch (err) {
      showAlert('An unexpected error occurred. Please check your network connection.');
    }
    
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
  
  const editStaff = (staffIdToEdit) => {
    const staffToEdit = staffs.find(s => s.staffId === staffIdToEdit);
    if (staffToEdit) {
      setNewStaff(staffToEdit);
      setSubmitButtonText('Update Staff');
      setIsEditing(true);
      setEditStaffId(staffToEdit._id);
      setFormErrors({});
      setSelectedFile(null);
    }
  };
  
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
      }
    );
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
    staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!loggedInAdmin || loading) {
      return <div className="content-section">Loading staff data...</div>;
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
      <h2>Staff Management</h2>
      <div className="sub-section">
        <h3>{isEditing ? 'Edit Staff' : 'Register/Edit Staff'}</h3>
        <form id="teacherForm" onSubmit={handleSubmit} className="staff-form">
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
            <input
              type="text"
              id="firstname"
              placeholder="First name"
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
              placeholder="Department (e.g., Science, Arts)"
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
              placeholder="Qualifications (e.g., B.Sc. Education)"
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
              placeholder="Contact Email"
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
              placeholder="Contact Phone"
              value={newStaff.contactPhone}
              onChange={handleChange}
              className={`form-input ${formErrors.contactPhone ? 'form-input-error' : ''}`}
            />
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
            <input
              type="file"
              id="resumeDocument"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className={`form-input-file ${formErrors.resumeDocument ? 'form-input-error' : ''}`}
            />
            {newStaff.resumeDocument && <p className="file-info">Selected: {newStaff.resumeDocument}</p>}
            {formErrors.resumeDocument && <p className="error-message">{formErrors.resumeDocument}</p>}
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
        <h3>All Staff</h3>
        <div className="filter-controls">
          <input
            type="text"
            id="staffSearchFilter"
            placeholder="Search by Name, ID or Role"
            value={searchTerm}
            onChange={handleSearchChange}
            className="filter-input"
          />
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
    </div>
  );
}

export default StaffManagement;
