// src/pages/StaffManagement.js
import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import ConfirmModal from '../components/ConfirmModal';

function StaffManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Data from the backend via a custom hook
  const [staffs, setStaffs, loadingStaffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');
  const [subjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');
  const [students] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  
  const initialStaffState = {
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
    assignedClasses: [],
    password: ''
  };

  const [newStaff, setNewStaff] = useState(initialStaffState);
  const [submitButtonText, setSubmitButtonText] = useState('Add Staff');
  const [isEditing, setIsEditing] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Derived data for form dropdowns
  const uniqueClasses = [...new Set(students.map(s => s.studentClass))].sort();
  const uniqueSubjects = [...new Set(subjects.map(s => s.subjectCode))].sort();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'admin') {
      setLoggedInAdmin(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

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
        if (!value.trim()) {
          error = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Invalid email format.';
        }
        break;
      case 'contactPhone':
        if (!value.trim()) {
          error = 'Phone number is required.';
        } else if (!/^\d{10,15}$/.test(value)) {
          error = 'Invalid phone number (10-15 digits).';
        }
        break;
      case 'assignedSubjects':
        if (newStaff.role.includes('Teacher') && value.length === 0) error = 'Teachers must be assigned at least one subject.';
        break;
      case 'assignedClasses':
        if (newStaff.role.includes('Teacher') && value.length === 0) error = 'Teachers must be assigned at least one class.';
        break;
      case 'password':
        if (!isEditing && !value) error = 'Password is required for new staff.';
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
      setFormErrors(prevErrors => ({ ...prevErrors, [id]: '' }));
    } else if (multiple) {
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setNewStaff(prevStaff => ({ ...prevStaff, [id]: selectedValues }));
      setFormErrors(prevErrors => ({ ...prevErrors, [id]: validateField(id, selectedValues) }));
    } else {
      setNewStaff(prevStaff => ({ ...prevStaff, [id]: value }));
      setFormErrors(prevErrors => ({ ...prevErrors, [id]: validateField(id, value) }));
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
      if (key !== 'staffId' && key !== 'resumeDocument' && key !== 'password') {
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

    if (!isEditing && !newStaff.password) {
      errors.password = 'Password is required for new staff.';
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
    
    const staffToSave = { 
      ...newStaff, 
      staffId: finalStaffId, 
      username: finalStaffId,
      password: newStaff.password || (isEditing ? undefined : 'password123')
    };
    
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
    
    setNewStaff(initialStaffState);
    setSubmitButtonText('Add Staff');
    setIsEditing(false);
    setFormErrors({});
  };
  
  const editStaff = (staffIdToEdit) => {
    const staffToEdit = staffs.find(s => s.staffId === staffIdToEdit);
    if (staffToEdit) {
      setNewStaff({ ...staffToEdit, password: '' });
      setSubmitButtonText('Update Staff');
      setIsEditing(true);
      setEditStaffId(staffToEdit._id);
      setFormErrors({});
      setMessage(null);
    }
  };
  
  const deleteStaff = async (staffIdToDelete) => {
    setStaffToDelete(staffIdToDelete);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsModalOpen(false);
    const staffToDeleteData = staffs.find(s => s.staffId === staffToDelete);
    if (!staffToDeleteData) {
      setMessage({ type: 'error', text: 'Staff not found.' });
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/schoolPortalStaff/${staffToDeleteData._id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setStaffs(prevStaffs => prevStaffs.filter(staff => staff.staffId !== staffToDelete));
        setMessage({ type: 'success', text: 'Staff deleted successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to delete staff.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setStaffToDelete(null);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearchAndForm = () => {
    setSearchTerm('');
    setNewStaff(initialStaffState);
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
  
  if (!loggedInAdmin) {
    return <div className="content-section">Access Denied. Please log in as an Admin.</div>;
  }

  if (loadingStaffs) {
      return <div className="content-section">Loading staff data...</div>;
  }
  
  return (
    <div className="content-section">
      <h2>Staff Management</h2>
      <div className="sub-section">
        <h3>{isEditing ? 'Edit Staff' : 'Register New Staff'}</h3>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form id="teacherForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="surname">Surname:</label>
            <input
              type="text"
              id="surname"
              placeholder="Surname"
              required
              value={newStaff.surname}
              onChange={handleChange}
              className={formErrors.surname ? 'input-error' : ''}
            />
            {formErrors.surname && <p className="error-text">{formErrors.surname}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="firstname">First name:</label>
            <input
              type="text"
              id="firstname"
              placeholder="First name"
              required
              value={newStaff.firstname}
              onChange={handleChange}
              className={formErrors.firstname ? 'input-error' : ''}
            />
            {formErrors.firstname && <p className="error-text">{formErrors.firstname}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="staffId">Staff ID:</label>
            <input
              type="text"
              id="staffId"
              placeholder="Staff ID (Auto-generated)"
              value={isEditing ? newStaff.staffId : generateStaffId()}
              readOnly
              disabled={!isEditing}
              className={formErrors.staffId ? 'input-error' : ''}
            />
            {formErrors.staffId && <p className="error-text">{formErrors.staffId}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <input
              type="text"
              id="role"
              placeholder="Role (e.g., Teacher, Admin)"
              required
              value={newStaff.role}
              onChange={handleChange}
              className={formErrors.role ? 'input-error' : ''}
            />
            {formErrors.role && <p className="error-text">{formErrors.role}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              required
              value={newStaff.gender}
              onChange={handleChange}
              className={formErrors.gender ? 'input-error' : ''}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.gender && <p className="error-text">{formErrors.gender}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="dateOfEmployment">Date of Employment:</label>
            <input
              type="date"
              id="dateOfEmployment"
              required
              value={newStaff.dateOfEmployment}
              onChange={handleChange}
              className={formErrors.dateOfEmployment ? 'input-error' : ''}
            />
            {formErrors.dateOfEmployment && <p className="error-text">{formErrors.dateOfEmployment}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="department">Department:</label>
            <input
              type="text"
              id="department"
              placeholder="Department (e.g., Science, Arts)"
              required
              value={newStaff.department}
              onChange={handleChange}
              className={formErrors.department ? 'input-error' : ''}
            />
            {formErrors.department && <p className="error-text">{formErrors.department}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="qualifications">Qualifications:</label>
            <input
              type="text"
              id="qualifications"
              placeholder="Qualifications (e.g., B.Sc. Education)"
              required
              value={newStaff.qualifications}
              onChange={handleChange}
              className={formErrors.qualifications ? 'input-error' : ''}
            />
            {formErrors.qualifications && <p className="error-text">{formErrors.qualifications}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email:</label>
            <input
              type="email"
              id="contactEmail"
              placeholder="Contact Email"
              required
              value={newStaff.contactEmail}
              onChange={handleChange}
              className={formErrors.contactEmail ? 'input-error' : ''}
            />
            {formErrors.contactEmail && <p className="error-text">{formErrors.contactEmail}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="contactPhone">Contact Phone:</label>
            <input
              type="tel"
              id="contactPhone"
              placeholder="Contact Phone"
              required
              value={newStaff.contactPhone}
              onChange={handleChange}
              className={formErrors.contactPhone ? 'input-error' : ''}
            />
            {formErrors.contactPhone && <p className="error-text">{formErrors.contactPhone}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password: {isEditing && <span className="text-gray-500">(Leave blank to keep current)</span>}</label>
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
          {newStaff.role.includes('Teacher') && (
            <Fragment>
              <div className="form-group full-width">
                <label htmlFor="assignedSubjects">Assigned Subjects (Ctrl+Click to select multiple):</label>
                <select
                  id="assignedSubjects"
                  multiple
                  value={newStaff.assignedSubjects}
                  onChange={handleChange}
                  className={formErrors.assignedSubjects ? 'input-error' : ''}
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
                {formErrors.assignedSubjects && <p className="error-text">{formErrors.assignedSubjects}</p>}
              </div>
              <div className="form-group full-width">
                <label htmlFor="assignedClasses">Assigned Classes (Ctrl+Click to select multiple):</label>
                <select
                  id="assignedClasses"
                  multiple
                  value={newStaff.assignedClasses}
                  onChange={handleChange}
                  className={formErrors.assignedClasses ? 'input-error' : ''}
                >
                  {uniqueClasses.length > 0 ? (
                    uniqueClasses.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))
                  ) : (
                    <option value="" disabled>No classes available. Add students to create classes.</option>
                  )}
                </select>
                {formErrors.assignedClasses && <p className="error-text">{formErrors.assignedClasses}</p>}
              </div>
            </Fragment>
          )}
          <div className="form-group full-width">
            <label htmlFor="resumeDocument">Resume/CV (PDF/Doc/Image):</label>
            <input
              type="file"
              id="resumeDocument"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className={formErrors.resumeDocument ? 'input-error' : ''}
            />
            {newStaff.resumeDocument && <p className="text-sm text-gray-500 mt-1">Selected: {newStaff.resumeDocument}</p>}
            {formErrors.resumeDocument && <p className="error-text">{formErrors.resumeDocument}</p>}
          </div>
          <div className="form-actions">
            <button type="submit">{submitButtonText}</button>
            <button type="button" onClick={clearSearchAndForm} className="secondary-button">Clear Form</button>
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
          />
          <button onClick={clearSearchAndForm} className="secondary-button">Clear Filter</button>
        </div>
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
       <ConfirmModal
        isOpen={isModalOpen}
        message={`Are you sure you want to delete staff with ID: ${staffToDelete}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default StaffManagement;
