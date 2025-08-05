// src/pages/StaffManagement.js
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

function StaffManagement() {
  // Update hooks to get data from the backend
  const [staffs, setStaffs, loadingStaffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');
  const [subjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');
  const [students] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  
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
  const [submitButtonText, setSubmitButtonText] = useState('Add Staff');
  const [isEditing, setIsEditing] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null); // Keep track of the database ID for editing
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);

  // Derived data for form dropdowns
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
    }
    else {
      setNewStaff(prevStaff => ({
        ...prevStaff,
        [id]: value
      }));
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: validateField(id, value)
      }));
    }
    setMessage(null);
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
    setMessage(null);
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
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
      return;
    }
    let finalStaffId = newStaff.staffId;
    if (!isEditing) {
      finalStaffId = generateStaffId();
    }
    const staffToSave = { ...newStaff, staffId: finalStaffId, username: finalStaffId }; // Set username for backend
    
    try {
      if (isEditing) {
        const response = await fetch(`http://localhost:5000/api/schoolPortalStaff/${editStaffId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffToSave),
        });
        if (response.ok) {
          const updatedStaff = await response.json();
          setStaffs(prevStaffs =>
            prevStaffs.map(staff =>
              staff._id === updatedStaff._id ? updatedStaff : staff
            )
          );
          setMessage({ type: 'success', text: 'Staff data updated successfully!' });
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to update staff.' });
        }
      } else {
        const response = await fetch('http://localhost:5000/api/schoolPortalStaff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffToSave),
        });
        if (response.ok) {
          const newStaffMember = await response.json();
          setStaffs(prevStaffs => [...prevStaffs, newStaffMember]);
          setMessage({ type: 'success', text: 'New staff registered successfully!' });
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to add new staff.' });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
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
      setEditStaffId(staffToEdit._id); // Store the database ID
      setFormErrors({});
      setMessage(null);
    }
  };
  
  const deleteStaff = async (staffIdToDelete) => {
    if (window.confirm(`Are you sure you want to delete staff with ID: ${staffIdToDelete}?`)) {
      const staffToDelete = staffs.find(s => s.staffId === staffIdToDelete);
      if (!staffToDelete) {
        setMessage({ type: 'error', text: 'Staff not found.' });
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/schoolPortalStaff/${staffToDelete._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setStaffs(prevStaffs => prevStaffs.filter(staff => staff.staffId !== staffIdToDelete));
          setMessage({ type: 'success', text: 'Staff deleted successfully!' });
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to delete staff.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
      }
    }
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
    setSubmitButtonText('Add Staff');
    setIsEditing(false);
    setFormErrors({});
    setMessage(null);
  };
  
  const filteredStaffs = staffs.filter(staff =>
    staff.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loadingStaffs) {
      return <div className="content-section">Loading staff data...</div>;
  }
  
  return (
    <div className="content-section">
      <h2>Staff Management</h2>
      <div className="sub-section">
        <h3>{isEditing ? 'Edit Staff' : 'Register/Edit Staff'}</h3>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form id="teacherForm" onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="surname"
              placeholder="Surname"
              required
              value={newStaff.surname}
              onChange={handleChange}
              style={{ borderColor: formErrors.surname ? 'red' : '' }}
            />
            {formErrors.surname && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.surname}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="firstname"
              placeholder="First name"
              required
              value={newStaff.firstname}
              onChange={handleChange}
              style={{ borderColor: formErrors.firstname ? 'red' : '' }}
            />
            {formErrors.firstname && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.firstname}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="staffId"
              placeholder="Staff ID (Auto-generated)"
              value={isEditing ? newStaff.staffId : generateStaffId()}
              readOnly
              disabled={!isEditing}
              style={{ borderColor: formErrors.staffId ? 'red' : '' }}
            />
            {formErrors.staffId && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.staffId}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="role"
              placeholder="Role (e.g., Teacher, Admin)"
              required
              value={newStaff.role}
              onChange={handleChange}
              style={{ borderColor: formErrors.role ? 'red' : '' }}
            />
            {formErrors.role && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.role}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <select
              id="gender"
              required
              value={newStaff.gender}
              onChange={handleChange}
              style={{ borderColor: formErrors.gender ? 'red' : '' }}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.gender && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.gender}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="dateOfEmployment" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#555' }}>Date of Employment:</label>
            <input
              type="date"
              id="dateOfEmployment"
              required
              value={newStaff.dateOfEmployment}
              onChange={handleChange}
              style={{ borderColor: formErrors.dateOfEmployment ? 'red' : '' }}
            />
            {formErrors.dateOfEmployment && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.dateOfEmployment}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="department"
              placeholder="Department (e.g., Science, Arts)"
              required
              value={newStaff.department}
              onChange={handleChange}
              style={{ borderColor: formErrors.department ? 'red' : '' }}
            />
            {formErrors.department && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.department}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="qualifications"
              placeholder="Qualifications (e.g., B.Sc. Education)"
              required
              value={newStaff.qualifications}
              onChange={handleChange}
              style={{ borderColor: formErrors.qualifications ? 'red' : '' }}
            />
            {formErrors.qualifications && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.qualifications}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              id="contactEmail"
              placeholder="Contact Email"
              required
              value={newStaff.contactEmail}
              onChange={handleChange}
              style={{ borderColor: formErrors.contactEmail ? 'red' : '' }}
            />
            {formErrors.contactEmail && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.contactEmail}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="tel"
              id="contactPhone"
              placeholder="Contact Phone"
              required
              value={newStaff.contactPhone}
              onChange={handleChange}
              style={{ borderColor: formErrors.contactPhone ? 'red' : '' }}
            />
            {formErrors.contactPhone && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.contactPhone}</p>}
          </div>
          {newStaff.role.includes('Teacher') && (
            <>
              <div style={{ marginBottom: '10px', flex: '1 1 100%' }}>
                <label htmlFor="assignedSubjects" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#555' }}>Assigned Subjects (Ctrl+Click to select multiple):</label>
                <select
                  id="assignedSubjects"
                  multiple
                  value={newStaff.assignedSubjects}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: formErrors.assignedSubjects ? 'red' : '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
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
                {formErrors.assignedSubjects && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.assignedSubjects}</p>}
              </div>
              <div style={{ marginBottom: '10px', flex: '1 1 100%' }}>
                <label htmlFor="assignedClasses" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#555' }}>Assigned Classes (Ctrl+Click to select multiple):</label>
                <select
                  id="assignedClasses"
                  multiple
                  value={newStaff.assignedClasses}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: formErrors.assignedClasses ? 'red' : '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
                >
                  {uniqueClasses.length > 0 ? (
                    uniqueClasses.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))
                  ) : (
                    <option value="" disabled>No classes available. Add students to create classes.</option>
                  )}
                </select>
                {formErrors.assignedClasses && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.assignedClasses}</p>}
              </div>
            </>
          )}
          <div style={{ marginBottom: '10px', flex: '1 1 100%' }}>
            <label htmlFor="resumeDocument" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#555' }}>Resume/CV (PDF/Doc/Image):</label>
            <input
              type="file"
              id="resumeDocument"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', borderColor: formErrors.resumeDocument ? 'red' : '' }}
            />
            {newStaff.resumeDocument && <p style={{ fontSize: '0.8em', color: '#555' }}>Selected: {newStaff.resumeDocument}</p>}
            {formErrors.resumeDocument && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.resumeDocument}</p>}
          </div>
          <button type="submit">{submitButtonText}</button>
        </form>
      </div>
      <div className="sub-section">
        <h3>All Staff</h3>
        <input
          type="text"
          id="staffSearchFilter"
          placeholder="Search by Name, ID or Role"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button onClick={clearSearchAndForm}>Clear Filter / Reset Form</button>
        <div className="table-container">
            <table id="staffTable">
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
                    filteredStaffs.map(staff => (
                    <tr key={staff._id}>
                        <td>{staff.staffId}</td>
                        <td>{staff.firstname} {staff.surname}</td>
                        <td>{staff.role}</td>
                        <td>{staff.department}</td>
                        <td>{staff.contactEmail}</td>
                        <td>{staff.contactPhone}</td>
                        <td>{staff.qualifications}</td>
                        <td>{staff.assignedSubjects && staff.assignedSubjects.length > 0 ? staff.assignedSubjects.join(', ') : 'N/A'}</td>
                        <td>{staff.assignedClasses && staff.assignedClasses.length > 0 ? staff.assignedClasses.join(', ') : 'N/A'}</td>
                        <td>{staff.resumeDocument ? <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulating download of: ${staff.resumeDocument}`); }}>{staff.resumeDocument}</a> : 'N/A'}</td>
                        <td>
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
    </div>
  );
}

export default StaffManagement;