// src/pages/StudentManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import ConfirmModal from '../components/ConfirmModal';
import { offlineApi } from '../services/offlineApi';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

function StudentManagement() {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  
  // Use local storage for state persistence
  const [students, setStudents] = useLocalStorage('schoolPortalStudents', []);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [fetchError, setFetchError] = useState(null); 
  const [syncStatus, setSyncStatus] = useState({ queued: 0, lastSync: null });
  
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isRegSuccessModalOpen, setIsRegSuccessModalOpen] = useState(false);
  const [newlyRegisteredStudent, setNewlyRegisteredStudent] = useState(null);

  // Load students using offlineApi
  useEffect(() => {
    const loadStudents = async () => {
      setLoadingStudents(true);
      setFetchError(null);
      
      try {
        const data = await offlineApi.get('schoolPortalStudents');
        
        // Ensure data is an array
        const safeData = Array.isArray(data) ? data : [];
        setStudents(safeData);
        
        // Update sync status
        const status = await offlineApi.getSyncStatus();
        setSyncStatus({
          queued: status.total,
          lastSync: new Date().toLocaleTimeString()
        });
        
      } catch (err) {
        console.error('Error loading students:', err);
        setFetchError(err.message || 'Failed to load students');
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    
    loadStudents();
    
    // Refresh sync status periodically
    const interval = setInterval(async () => {
      const status = await offlineApi.getSyncStatus();
      setSyncStatus(prev => ({ ...prev, queued: status.total }));
    }, 10000);
    
    return () => clearInterval(interval);
  }, [setStudents]);

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
    setNewStudent(prevStudent => ({
      ...prevStudent,
      admissionNo: isNew ? '' : prevStudent.admissionNo
    }));
    setFormErrors({});
    setMessage(null);
  };
  
  const generateAdmissionNumber = () => {
    const studentArray = Array.isArray(students) ? students : [];
    const currentYear = new Date().getFullYear();
    
    // Extract highest counter from existing admission numbers
    let maxCounter = 0;
    studentArray.forEach(student => {
      if (student.admissionNo) {
        const parts = student.admissionNo.split('/');
        const counter = parseInt(parts[parts.length - 1]);
        if (!isNaN(counter) && counter > maxCounter) {
          maxCounter = counter;
        }
      }
    });
    
    const nextCounter = maxCounter + 1;
    return `BAC/STD/${currentYear}/${String(nextCounter).padStart(4, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    // Validate form
    let errors = {};
    Object.keys(newStudent).forEach(key => {
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
    
    // Prepare student data
    let finalAdmissionNo = newStudent.admissionNo;
    if (!isEditing && isNewStudentMode) {
      finalAdmissionNo = generateAdmissionNumber();
    }
    
    const studentToSave = { 
      ...newStudent, 
      admissionNo: finalAdmissionNo, 
      username: finalAdmissionNo,
      password: newStudent.password || (isEditing ? undefined : 'password123'),
      type: 'student'
    };
    
    try {
      let result;
      
      if (isEditing) {
        // Update student
        result = await offlineApi.put('schoolPortalStudents', editStudentId, studentToSave);
      } else {
        // Create new student
        result = await offlineApi.post('schoolPortalStudents', studentToSave);
      }
      
      // Handle response
      if (result._queued) {
        setMessage({ 
          type: 'info', 
          text: isOnline 
            ? 'Student data saved. Syncing with server...' 
            : 'Student saved locally. Will sync when online.' 
        });
        
        // Update local state immediately for better UX
        if (isEditing) {
          setStudents(prev => prev.map(s => 
            s._id === editStudentId || s.id === editStudentId 
              ? { ...result, id: result.id || result._id } 
              : s
          ));
        } else {
          setStudents(prev => [...prev, { ...result, id: result.id || result._id }]);
          setNewlyRegisteredStudent(result);
          setIsRegSuccessModalOpen(true);
        }
      } else {
        // Direct success (online)
        setMessage({ 
          type: 'success', 
          text: isEditing 
            ? 'Student updated successfully!' 
            : 'Student registered successfully!' 
        });
        
        if (isEditing) {
          setStudents(prev => prev.map(s => 
            s._id === result._id || s.id === result.id ? result : s
          ));
        } else {
          setStudents(prev => [...prev, result]);
          setNewlyRegisteredStudent(result);
          setIsRegSuccessModalOpen(true);
        }
      }
      
      // Update sync status
      const status = await offlineApi.getSyncStatus();
      setSyncStatus(prev => ({ ...prev, queued: status.total }));
      
    } catch (err) {
      console.error('Form submission error:', err);
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
    }
    
    // Reset form
    if (!isEditing) {
      setNewStudent(initialStudentState);
      setSubmitButtonText('Register Student');
      setIsEditing(false);
      setIsNewStudentMode(true);
      setFormErrors({});
    }
  };
  
  const editStudent = (studentIdToEdit) => {
    const studentArray = Array.isArray(students) ? students : [];
    const studentToEdit = studentArray.find(s => 
      s.admissionNo === studentIdToEdit || 
      s._id === studentIdToEdit || 
      s.id === studentIdToEdit
    );
    
    if (studentToEdit) {
      setNewStudent({ ...studentToEdit, password: '' });
      setSubmitButtonText('Update Student');
      setIsEditing(true);
      setIsNewStudentMode(false);
      setEditStudentId(studentToEdit._id || studentToEdit.id);
      setFormErrors({});
      setMessage(null);
    }
  };
  
  const deleteStudent = (studentIdToDelete) => {
    setStudentToDelete(studentIdToDelete);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsModalOpen(false);
    
    const studentArray = Array.isArray(students) ? students : [];
    const studentToDeleteData = studentArray.find(s => 
      s.admissionNo === studentToDelete || 
      s._id === studentToDelete || 
      s.id === studentToDelete
    );
    
    if (!studentToDeleteData) {
      setMessage({ type: 'error', text: 'Student not found.' });
      return;
    }
    
    try {
      const result = await offlineApi.delete(
        'schoolPortalStudents', 
        studentToDeleteData._id || studentToDeleteData.id
      );
      
      if (result._queued || result.success) {
        // Remove from local state immediately
        setStudents(prev => prev.filter(student => 
          student.admissionNo !== studentToDelete && 
          student._id !== studentToDeleteData._id && 
          student.id !== studentToDeleteData.id
        ));
        
        setMessage({ 
          type: 'success', 
          text: isOnline 
            ? 'Student deleted successfully!' 
            : 'Delete request queued for sync.' 
        });
        
        // Update sync status
        const status = await offlineApi.getSyncStatus();
        setSyncStatus(prev => ({ ...prev, queued: status.total }));
      }
    } catch (err) {
      console.error('Delete error:', err);
      setMessage({ type: 'error', text: 'Failed to delete student.' });
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
  
  const handleManualSync = async () => {
    if (!isOnline) {
      setMessage({ type: 'error', text: 'Cannot sync while offline.' });
      return;
    }
    
    setMessage({ type: 'info', text: 'Syncing with server...' });
    try {
      await offlineApi.syncPendingOperations();
      const status = await offlineApi.getSyncStatus();
      setSyncStatus({
        queued: status.total,
        lastSync: new Date().toLocaleTimeString()
      });
      
      // Refresh data
      const data = await offlineApi.get('schoolPortalStudents', null, { forceRefresh: true });
      setStudents(Array.isArray(data) ? data : []);
      
      setMessage({ 
        type: 'success', 
        text: status.total === 0 
          ? 'All changes synced successfully!' 
          : `${status.total} items still queued.` 
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Sync failed. Please try again.' });
    }
  };
  
  // Filter and sort students
  const studentArray = Array.isArray(students) ? students : [];
  
  const filteredStudents = studentArray.filter(student => {
    const matchesSearch =
      (student.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.admissionNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      classFilter === 'all' || student.studentClass === classFilter;
    return matchesSearch && matchesClass;
  });
  
  const classOrder = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const classAIndex = classOrder.indexOf(a.studentClass || '');
    const classBIndex = classOrder.indexOf(b.studentClass || '');
    if (classAIndex === classBIndex) {
      return (a.lastName || '').localeCompare(b.lastName || '');
    }
    return classAIndex - classBIndex;
  });
  
  const uniqueClasses = ['all', ...new Set(studentArray.map(s => s.studentClass).filter(Boolean))].sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    return classOrder.indexOf(a) - classOrder.indexOf(b);
  });
  
  if (loadingStudents) {
    return (
      <div className="content-section">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Loading student data...</p>
        </div>
      </div>
    );
  }
  
  if (fetchError) {
    return (
      <div className="content-section">
        <div style={{ 
          color: '#dc3545', 
          fontWeight: 'bold', 
          padding: '20px', 
          border: '1px solid #dc3545', 
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <p>Error loading data: {fetchError}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="content-section">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2>Student Management</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: isOnline ? '#28a745' : '#dc3545',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {isOnline ? '🌐 Online' : '📴 Offline'}
          </div>
          {syncStatus.queued > 0 && (
            <button
              onClick={handleManualSync}
              style={{
                padding: '6px 12px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>🔄</span>
              Sync ({syncStatus.queued})
            </button>
          )}
        </div>
      </div>
      
      {/* Network Status Info */}
      <div style={{
        padding: '10px 15px',
        marginBottom: '20px',
        backgroundColor: isOnline ? '#d4edda' : '#fff3cd',
        border: `1px solid ${isOnline ? '#c3e6cb' : '#ffeaa7'}`,
        color: isOnline ? '#155724' : '#856404',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <strong>{isOnline ? '✓ Online Mode' : '⚠️ Offline Mode'}</strong>
        <div style={{ marginTop: '5px' }}>
          {isOnline 
            ? 'All changes will sync immediately with the server.'
            : 'You are offline. Changes will be saved locally and synced when you reconnect.'}
          {syncStatus.queued > 0 && ` ${syncStatus.queued} change(s) pending sync.`}
        </div>
      </div>
      
      {/* Registration/Edit Form */}
      <div className="sub-section">
        <h3>{isEditing ? 'Edit Student' : 'Register New Student'}</h3>
        
        {message && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '15px', 
            borderRadius: '5px', 
            color: 'white', 
            backgroundColor: 
              message.type === 'success' ? '#28a745' : 
              message.type === 'error' ? '#dc3545' : 
              message.type === 'info' ? '#17a2b8' : '#ffc107',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
        )}
        
        <form id="studentForm" onSubmit={handleSubmit}>
          {/* Student Type Radio */}
          <div className="form-group full-width" style={{ marginBottom: '20px' }}>
            <label>Student Type:</label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  id="newStudentRadio"
                  name="studentType"
                  value="new"
                  checked={isNewStudentMode}
                  onChange={handleStudentModeChange}
                />
                New Student (Auto-generate ID)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  id="oldStudentRadio"
                  name="studentType"
                  value="old"
                  checked={!isNewStudentMode}
                  onChange={handleStudentModeChange}
                />
                Existing Student (Manual ID)
              </label>
            </div>
          </div>
          
          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* First Name */}
            <div className="form-group">
              <label htmlFor="firstName">First Name: *</label>
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
            
            {/* Last Name */}
            <div className="form-group">
              <label htmlFor="lastName">Last Name: *</label>
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
            
            {/* Date of Birth */}
            <div className="form-group">
              <label htmlFor="dob">Date of Birth: *</label>
              <input
                type="date"
                id="dob"
                required
                value={newStudent.dob}
                onChange={handleChange}
                className={formErrors.dob ? 'input-error' : ''}
              />
              {formErrors.dob && <p className="error-text">{formErrors.dob}</p>}
            </div>
            
            {/* Admission Number */}
            <div className="form-group">
              <label htmlFor="admissionNo">Admission No.: *</label>
              <input
                type="text"
                id="admissionNo"
                placeholder={isNewStudentMode ? "Auto-generated" : "Enter admission number"}
                value={newStudent.admissionNo}
                readOnly={isNewStudentMode && !isEditing}
                onChange={handleChange}
                required={!isNewStudentMode}
                className={formErrors.admissionNo ? 'input-error' : ''}
              />
              {formErrors.admissionNo && <p className="error-text">{formErrors.admissionNo}</p>}
              {isNewStudentMode && !isEditing && (
                <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                  Will be generated as: {generateAdmissionNumber()}
                </p>
              )}
            </div>
            
            {/* Parent Name */}
            <div className="form-group">
              <label htmlFor="parentName">Parent/Guardian Name: *</label>
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
            
            {/* Parent Phone */}
            <div className="form-group">
              <label htmlFor="parentPhone">Parent/Guardian Phone: *</label>
              <input
                type="tel"
                id="parentPhone"
                placeholder="08012345678"
                required
                value={newStudent.parentPhone}
                onChange={handleChange}
                className={formErrors.parentPhone ? 'input-error' : ''}
              />
              {formErrors.parentPhone && <p className="error-text">{formErrors.parentPhone}</p>}
            </div>
            
            {/* Class */}
            <div className="form-group">
              <label htmlFor="studentClass">Class: *</label>
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
            
            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender">Gender: *</label>
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
            
            {/* Address */}
            <div className="form-group full-width">
              <label htmlFor="address">Address: *</label>
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
            
            {/* Enrollment Date */}
            <div className="form-group">
              <label htmlFor="enrollmentDate">Enrollment Date: *</label>
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
            
            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                Password: {isEditing && <span style={{ color: '#666', fontSize: '0.9em' }}>(Leave blank to keep current)</span>}
              </label>
              <input
                type="password"
                id="password"
                placeholder={isEditing ? "Leave blank to keep current" : "Password"}
                required={!isEditing}
                value={newStudent.password}
                onChange={handleChange}
                className={formErrors.password ? 'input-error' : ''}
              />
              {formErrors.password && <p className="error-text">{formErrors.password}</p>}
            </div>
          </div>
          
          {/* Medical Notes (Full Width) */}
          <div className="form-group full-width" style={{ marginTop: '20px' }}>
            <label htmlFor="medicalNotes">Medical Notes (Optional):</label>
            <textarea
              id="medicalNotes"
              placeholder="Any medical conditions, allergies, or special needs..."
              rows="3"
              value={newStudent.medicalNotes}
              onChange={handleChange}
            ></textarea>
          </div>
          
          {/* Admission Document */}
          <div className="form-group full-width" style={{ marginTop: '20px' }}>
            <label htmlFor="admissionDocument">Admission Document (Optional):</label>
            <input
              type="file"
              id="admissionDocument"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {newStudent.admissionDocument && (
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                Selected: {newStudent.admissionDocument}
              </p>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="form-actions" style={{ marginTop: '30px' }}>
            <button type="submit" style={{ padding: '12px 24px' }}>
              {submitButtonText}
            </button>
            <button 
              type="button" 
              onClick={clearSearchAndForm} 
              className="secondary-button"
              style={{ padding: '12px 24px' }}
            >
              {isEditing ? 'Cancel Edit' : 'Clear Form'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Student List */}
      <div className="sub-section" style={{ marginTop: '40px' }}>
        <h3>
          Student List 
          <span style={{ fontSize: '0.9em', color: '#666', marginLeft: '10px', fontWeight: 'normal' }}>
            ({studentArray.length} total, {filteredStudents.length} filtered)
          </span>
        </h3>
        
        {/* Filters */}
        <div className="filter-controls" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search by name or admission number..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: 1 }}
          />
          <select
            value={classFilter}
            onChange={handleClassFilterChange}
            style={{ width: '200px' }}
          >
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>
                {cls === 'all' ? 'All Classes' : `Class ${cls}`}
              </option>
            ))}
          </select>
          <button 
            onClick={clearSearchAndForm} 
            className="secondary-button"
            style={{ padding: '10px 20px' }}
          >
            Clear Filters
          </button>
        </div>
        
        {/* Student Table */}
        <div className="table-container">
          <table id="studentTable">
            <thead>
              <tr>
                <th>Admission No.</th>
                <th>Name</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Parent Phone</th>
                <th>Enrollment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.length > 0 ? (
                sortedStudents.map(student => (
                  <tr key={student._id || student.id}>
                    <td>
                      {student.admissionNo}
                      {student._queued && (
                        <span style={{
                          fontSize: '0.7em',
                          backgroundColor: '#ffc107',
                          color: '#856404',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          marginLeft: '8px'
                        }}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.studentClass}</td>
                    <td>{student.gender}</td>
                    <td>{student.parentPhone}</td>
                    <td>{student.enrollmentDate}</td>
                    <td className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => editStudent(student.admissionNo || student._id || student.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => deleteStudent(student.admissionNo || student._id || student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                    {studentArray.length === 0 
                      ? 'No students registered yet. Start by adding a new student above.' 
                      : 'No students match your search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modals */}
      <ConfirmModal
        isOpen={isModalOpen}
        message={`Are you sure you want to delete student with Admission No: ${studentToDelete}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      
      {newlyRegisteredStudent && (
        <ConfirmModal
          isOpen={isRegSuccessModalOpen}
          message={
            <div>
              <h4 style={{ marginBottom: '10px' }}>✅ Registration Successful!</h4>
              <p>
                Student <strong>{newlyRegisteredStudent.firstName} {newlyRegisteredStudent.lastName}</strong><br />
                has been registered with Admission No: <strong>{newlyRegisteredStudent.admissionNo}</strong>
              </p>
              {!isOnline && (
                <p style={{ 
                  backgroundColor: '#fff3cd',
                  padding: '10px',
                  borderRadius: '4px',
                  marginTop: '10px',
                  fontSize: '0.9em'
                }}>
                  ⚠️ <strong>Offline Mode:</strong> This registration is saved locally and will sync when you're back online.
                </p>
              )}
            </div>
          }
          onConfirm={closeRegSuccessModal}
          onCancel={closeRegSuccessModal}
          confirmText="OK"
          showCancel={false}
        />
      )}
      
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default StudentManagement;