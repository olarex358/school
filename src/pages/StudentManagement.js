// src/pages/StudentManagement.js
import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import ConfirmModal from '../components/ConfirmModal';

function StudentManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // 1. UPDATED: useLocalStorage now only handles local state persistence.
  const [students, setStudents] = useLocalStorage('schoolPortalStudents', []);
  // NEW: State for API loading and fetching errors.
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [fetchError, setFetchError] = useState(null); 
  
  const initialStudentState = {
    firstName: '',
    lastName: '',
    dob: '',
    admissionNo: '',
    parentName: '',
    parentPhone: '',
    studentClass: '',
    gender: '',
    address: '',
    enrollmentDate: '',
    medicalNotes: '',
    admissionDocument: '',
    password: ''
  };

  const [newStudent, setNewStudent] = useState(initialStudentState);
  const [submitButtonText, setSubmitButtonText] = useState('Register Student');
  const [isEditing, setIsEditing] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isNewStudentMode, setIsNewStudentMode] = useState(true);
  const [classFilter, setClassFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false); // Used for Deletion
  const [studentToDelete, setStudentToDelete] = useState(null); // Used for Deletion
  
  // ⭐️ NEW: State for Registration Success Modal
  const [isRegSuccessModalOpen, setIsRegSuccessModalOpen] = useState(false);
  const [newlyRegisteredStudent, setNewlyRegisteredStudent] = useState(null);

  // 2. NEW EFFECT: Securely fetch initial student data on component mount
  useEffect(() => {
    const fetchStudents = async () => {
        setLoadingStudents(true);
        setFetchError(null);
        
        const adminToken = localStorage.getItem('adminToken'); // Get the token
        
        if (!adminToken) {
            // If no token, show an error and stop loading
            setFetchError('No Admin Token found. Please log in.');
            setLoadingStudents(false);
            // navigate('/login'); // Optional: redirect to login
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/schoolPortalStudents', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`, // THE FIX: Add the Authorization header
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch student data (Status: ${response.status}).`);
            }

            const data = await response.json();
            setStudents(data); // This updates local storage via the hook
            
        } catch (err) {
            setFetchError(err.message || 'An unexpected error occurred during fetch.');
            console.error('Fetch error:', err);
        } finally {
            setLoadingStudents(false);
        }
    };
    
    fetchStudents();
  }, [setStudents, navigate]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
      case 'parentName':
      case 'address':
        if (!value.trim()) error = 'This field cannot be empty.';
        break;
      case 'dob':
      case 'enrollmentDate':
        if (!value) error = 'Date is required.';
        break;
      case 'parentPhone':
        if (!value.trim()) {
          error = 'Parent phone is required.';
        } else if (!/^\d{10,15}$/.test(value)) {
          error = 'Invalid phone number (10-15 digits).';
        }
        break;
      case 'studentClass':
      case 'gender':
        if (!value) error = 'Please select an option.';
        break;
      case 'admissionNo':
        if (!isNewStudentMode && !value.trim()) error = 'Admission number is required for old students.';
        break;
      case 'password':
        if (!isEditing && !value) error = 'Password is required for new students.';
        break;
      default:
        break;
    }
    return error;
  };
  
  const handleChange = (e) => {
    const { id, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setNewStudent(prevStudent => ({
        ...prevStudent,
        [id]: file ? file.name : ''
      }));
      setFormErrors(prevErrors => ({ ...prevErrors, [id]: '' }));
    } else {
      setNewStudent(prevStudent => ({
        ...prevStudent,
        [id]: value
      }));
      setFormErrors(prevErrors => ({ ...prevErrors, [id]: validateField(id, value) }));
    }
    setMessage(null);
  };
  
  const handleStudentModeChange = (e) => {
    const isNew = e.target.value === 'new';
    setIsNewStudentMode(isNew);
    // Clear admissionNo state when switching to New Student mode, 
    // so the auto-generated number can be displayed as a placeholder.
    setNewStudent(prevStudent => ({
      ...prevStudent,
      admissionNo: isNew ? '' : prevStudent.admissionNo
    }));
    setFormErrors({});
    setMessage(null);
  };
  
  const generateAdmissionNumber = () => {
    const currentYear = new Date().getFullYear();
    const maxCounter = students.length > 0
      ? Math.max(...students.map(s => parseInt(s.admissionNo.split('/').pop() || 0)))
      : 0;
    const nextCounter = maxCounter + 1;
    return `BAC/STD/${currentYear}/${String(nextCounter).padStart(4, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    let errors = {};
    Object.keys(newStudent).forEach(key => {
      // Skip validation for admissionNo in New Student mode, as it's auto-generated
      if (key === 'admissionNo' && isNewStudentMode) return;
      if (key === 'password' && isEditing) return;
      const error = validateField(key, newStudent[key]);
      if (error) errors[key] = error;
    });

    if (!isEditing && !newStudent.password) {
      errors.password = 'Password is required for new students.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
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

    let finalAdmissionNo = newStudent.admissionNo;
    // ⭐️ FIX 1: The auto-generation logic must ONLY run if it's a NEW registration AND we are in NEW STUDENT mode.
    if (!isEditing && isNewStudentMode) {
      finalAdmissionNo = generateAdmissionNumber();
    }
    // For Old Student mode (!isNewStudentMode), finalAdmissionNo already holds the manually input value from state.
    
    const studentToSave = { 
      ...newStudent, 
      admissionNo: finalAdmissionNo, 
      username: finalAdmissionNo,
      password: newStudent.password || (isEditing ? undefined : 'password123')
    };
    
    try {
      if (isEditing) {
        const response = await fetch(`http://localhost:5000/api/schoolPortalStudents/${editStudentId}`, {
          method: 'PUT',
          headers: secureHeaders,
          body: JSON.stringify(studentToSave),
        });
        if (response.ok) {
          const updatedStudent = await response.json();
          setStudents(prevStudents =>
            prevStudents.map(student =>
              student._id === updatedStudent._id ? updatedStudent : student
            )
          );
          setMessage({ type: 'success', text: 'Student data updated successfully!' });
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to update student.' });
        }
      } else {
        const response = await fetch('http://localhost:5000/api/schoolPortalStudents', {
          method: 'POST',
          headers: secureHeaders,
          body: JSON.stringify(studentToSave),
        });
        if (response.ok) {
          const newStudentEntry = await response.json();
          setStudents(prevStudents => [...prevStudents, newStudentEntry]);
          
          setNewlyRegisteredStudent(newStudentEntry);
          setIsRegSuccessModalOpen(true);
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to add new student.' });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
    }
    
    // Clear form and reset state for new registration
    setNewStudent(initialStudentState);
    setSubmitButtonText('Register Student');
    setIsEditing(false);
    setIsNewStudentMode(true);
    setFormErrors({});
  };
  
  const editStudent = (studentIdToEdit) => {
    const studentToEdit = students.find(s => s.admissionNo === studentIdToEdit);
    if (studentToEdit) {
      setNewStudent({ ...studentToEdit, password: '' });
      setSubmitButtonText('Update Student');
      setIsEditing(true);
      setIsNewStudentMode(false); // When editing, we treat it like an 'Old Student'
      setEditStudentId(studentToEdit._id);
      setFormErrors({});
      setMessage(null);
    }
  };
  
  const deleteStudent = async (studentIdToDelete) => {
    setStudentToDelete(studentIdToDelete);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsModalOpen(false);
    const studentToDeleteData = students.find(s => s.admissionNo === studentToDelete);
    if (!studentToDeleteData) {
      setMessage({ type: 'error', text: 'Student not found.' });
      return;
    }
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        setMessage({ type: 'error', text: 'Admin token missing. Please log in to perform this action.' });
        return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/schoolPortalStudents/${studentToDeleteData._id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${adminToken}`, 
        }
      });
      if (response.ok) {
        setStudents(prevStudents => prevStudents.filter(student => student.admissionNo !== studentToDelete));
        setMessage({ type: 'success', text: 'Student deleted successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to delete student.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setStudentToDelete(null);
  };
  
  const closeRegSuccessModal = () => {
      setIsRegSuccessModalOpen(false);
      setNewlyRegisteredStudent(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleClassFilterChange = (e) => {
    setClassFilter(e.target.value);
  };
  
  const clearSearchAndForm = () => {
    setSearchTerm('');
    setClassFilter('all');
    setNewStudent(initialStudentState);
    setSubmitButtonText('Register Student');
    setIsEditing(false);
    setIsNewStudentMode(true);
    setFormErrors({});
    setMessage(null);
  };
  
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      classFilter === 'all' || student.studentClass === classFilter;
    return matchesSearch && matchesClass;
  });
  
  const classOrder = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const classAIndex = classOrder.indexOf(a.studentClass);
    const classBIndex = classOrder.indexOf(b.studentClass);
    if (classAIndex === classBIndex) {
      return a.lastName.localeCompare(b.lastName);
    }
    return classAIndex - classBIndex;
  });
  
  const uniqueClasses = ['all', ...new Set(students.map(s => s.studentClass))].sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    return classOrder.indexOf(a) - classOrder.indexOf(b);
  });
  
  if (loadingStudents) {
      return <div className="content-section">Loading student data...</div>;
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
      <h2>Student Management</h2>
      <div className="sub-section">
        <h3>{isEditing ? 'Edit Student' : 'Register New Student'}</h3>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form id="studentForm" onSubmit={handleSubmit}>
          <div className="form-group full-width" style={{ marginBottom: '15px' }}>
            <label>Student Type:</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="radio"
                id="newStudentRadio"
                name="studentType"
                value="new"
                checked={isNewStudentMode}
                onChange={handleStudentModeChange}
              />
              <label htmlFor="newStudentRadio">New Student (Auto ID)</label>
              <input
                type="radio"
                id="oldStudentRadio"
                name="studentType"
                value="old"
                checked={!isNewStudentMode}
                onChange={handleStudentModeChange}
              />
              <label htmlFor="oldStudentRadio">Old Student (Manual ID)</label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              placeholder="First Name"
              required
              value={newStudent.firstName}
              onChange={handleChange}
              className={formErrors.firstName ? 'input-error' : ''}
            />
            {formErrors.firstName && <p className="error-text">{formErrors.firstName}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              placeholder="Last Name"
              required
              value={newStudent.lastName}
              onChange={handleChange}
              className={formErrors.lastName ? 'input-error' : ''}
            />
            {formErrors.lastName && <p className="error-text">{formErrors.lastName}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="dob">Date of Birth:</label>
            <input
              type="date"
              id="dob"
              required
              title="Date of Birth"
              value={newStudent.dob}
              onChange={handleChange}
              className={formErrors.dob ? 'input-error' : ''}
            />
            {formErrors.dob && <p className="error-text">{formErrors.dob}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="admissionNo">Admission No.:</label>
            <input
              type="text"
              id="admissionNo"
              placeholder={isNewStudentMode ? generateAdmissionNumber() : "Admission No. (Manual)"}
              // ⭐️ FIX 2: Bind value directly to state to allow manual input.
              value={newStudent.admissionNo}
              readOnly={isNewStudentMode && !isEditing}
              disabled={isNewStudentMode && !isEditing}
              onChange={handleChange}
              required={!isNewStudentMode}
              className={formErrors.admissionNo ? 'input-error' : ''}
            />
            {formErrors.admissionNo && <p className="error-text">{formErrors.admissionNo}</p>}
            {isNewStudentMode && !isEditing && (
              <p style={{ fontSize: '0.8em', color: '#555' }}>
                * Auto-generated: {generateAdmissionNumber()}
              </p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="parentName">Parent/Guardian Name:</label>
            <input
              type="text"
              id="parentName"
              placeholder="Parent/Guardian Name"
              required
              value={newStudent.parentName}
              onChange={handleChange}
              className={formErrors.parentName ? 'input-error' : ''}
            />
            {formErrors.parentName && <p className="error-text">{formErrors.parentName}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="parentPhone">Parent/Guardian Phone:</label>
            <input
              type="tel"
              id="parentPhone"
              placeholder="Parent/Guardian Phone"
              required
              value={newStudent.parentPhone}
              onChange={handleChange}
              className={formErrors.parentPhone ? 'input-error' : ''}
            />
            {formErrors.parentPhone && <p className="error-text">{formErrors.parentPhone}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="studentClass">Class:</label>
            <select
              id="studentClass"
              required
              value={newStudent.studentClass}
              onChange={handleChange}
              className={formErrors.studentClass ? 'input-error' : ''}
            >
              <option value="">Select Class</option>
              <option value="JSS1">JSS1</option>
              <option value="JSS2">JSS2</option>
              <option value="JSS3">JSS3</option>
              <option value="SS1">SS1</option>
              <option value="SS2">SS2</option>
              <option value="SS3">SS3</option>
            </select>
            {formErrors.studentClass && <p className="error-text">{formErrors.studentClass}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              required
              value={newStudent.gender}
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
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              placeholder="Student Address"
              required
              value={newStudent.address}
              onChange={handleChange}
              className={formErrors.address ? 'input-error' : ''}
            />
            {formErrors.address && <p className="error-text">{formErrors.address}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="enrollmentDate">Enrollment Date:</label>
            <input
              type="date"
              id="enrollmentDate"
              required
              value={newStudent.enrollmentDate}
              onChange={handleChange}
              className={formErrors.enrollmentDate ? 'input-error' : ''}
            />
            {formErrors.enrollmentDate && <p className="error-text">{formErrors.enrollmentDate}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password: {isEditing && <span style={{ color: '#888', fontStyle: 'italic' }}>(Leave blank to keep current)</span>}</label>
            <input
              type="password"
              id="password"
              placeholder={isEditing ? "Leave blank" : "Password"}
              required={!isEditing}
              value={newStudent.password}
              onChange={handleChange}
              className={formErrors.password ? 'input-error' : ''}
            />
            {formErrors.password && <p className="error-text">{formErrors.password}</p>}
          </div>
          <div className="form-group full-width">
            <label htmlFor="medicalNotes">Medical Notes (Optional):</label>
            <textarea
              id="medicalNotes"
              placeholder="Medical Notes (Optional)"
              rows="3"
              value={newStudent.medicalNotes}
              onChange={handleChange}
              className={formErrors.medicalNotes ? 'input-error' : ''}
            ></textarea>
            {formErrors.medicalNotes && <p className="error-text">{formErrors.medicalNotes}</p>}
          </div>
          <div className="form-group full-width">
            <label htmlFor="admissionDocument">Admission Document (PDF/Image):</label>
            <input
              type="file"
              id="admissionDocument"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className={formErrors.admissionDocument ? 'input-error' : ''}
            />
            {newStudent.admissionDocument && <p style={{ fontSize: '0.8em', color: '#555' }}>Selected: {newStudent.admissionDocument}</p>}
            {formErrors.admissionDocument && <p className="error-text">{formErrors.admissionDocument}</p>}
          </div>
          <div className="form-actions">
            <button type="submit">{submitButtonText}</button>
            <button type="button" onClick={clearSearchAndForm} className="secondary-button">Clear Form</button>
          </div>
        </form>
      </div>
      <div className="sub-section">
        <h3>Student List</h3>
        <div className="filter-controls">
          <input
            type="text"
            id="studentSearchFilter"
            placeholder="Search by Name or Admission No."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <select
            id="classFilter"
            value={classFilter}
            onChange={handleClassFilterChange}
          >
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>
                {cls === 'all' ? 'All Classes' : cls}
              </option>
            ))}
          </select>
          <button onClick={clearSearchAndForm} className="secondary-button">Clear Filter</button>
        </div>
        <div className="table-container">
          <table id="studentTable">
            <thead>
              <tr>
                <th>Admission No.</th>
                <th>Name</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Address</th>
                <th>Enrollment Date</th>
                <th>Parent Name</th>
                <th>Parent Phone</th>
                <th>Medical Notes</th>
                <th>Admission Doc</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.length > 0 ? (
                sortedStudents.map(student => (
                <tr key={student._id}>
                    <td>{student.admissionNo}</td>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.studentClass}</td>
                    <td>{student.gender}</td>
                    <td>{student.address}</td>
                    <td>{student.enrollmentDate}</td>
                    <td>{student.parentName}</td>
                    <td>{student.parentPhone}</td>
                    <td>{student.medicalNotes || 'N/A'}</td>
                    <td>{student.admissionDocument ? <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulating download of: ${student.admissionDocument}`); }}>{student.admissionDocument}</a> : 'N/A'}</td>
                    <td className="action-buttons">
                    <button
                        className="action-btn edit-btn"
                        onClick={() => editStudent(student.admissionNo)}>
                        Edit
                    </button>
                    <button
                        className="action-btn delete-btn"
                        onClick={() => deleteStudent(student.admissionNo)}>
                        Delete
                    </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="11">No students found.</td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Existing Deletion Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        message={`Are you sure you want to delete student with Admission No: ${studentToDelete}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      {/* Registration Success Modal */}
      {newlyRegisteredStudent && (
          <ConfirmModal
              isOpen={isRegSuccessModalOpen}
              message={`Success! Student ${newlyRegisteredStudent.firstName} ${newlyRegisteredStudent.lastName} has been registered with Admission No: ${newlyRegisteredStudent.admissionNo}.`}
              onConfirm={closeRegSuccessModal}
              onCancel={closeRegSuccessModal} // Both actions close the acknowledgment modal
          />
      )}
    </div>
  );
}

export default StudentManagement;