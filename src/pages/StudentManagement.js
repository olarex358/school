// src/pages/StudentManagement.js
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

function StudentManagement() {
  // Update the hook to fetch data from the backend
  const [students, setStudents, loadingStudents] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  
  const [newStudent, setNewStudent] = useState({
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
    admissionDocument: ''
  });
  const [submitButtonText, setSubmitButtonText] = useState('Register Student');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isNewStudentMode, setIsNewStudentMode] = useState(true);
  const [classFilter, setClassFilter] = useState('all');

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
        if (!value.trim()) error = 'Parent phone is required.';
        if (!/^\d{10,15}$/.test(value)) error = 'Invalid phone number (10-15 digits).';
        break;
      case 'studentClass':
      case 'gender':
        if (!value) error = 'Please select an option.';
        break;
      case 'admissionNo':
        if (!isNewStudentMode && !value.trim()) error = 'Admission number is required for old students.';
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
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: ''
      }));
    } else {
      setNewStudent(prevStudent => ({
        ...prevStudent,
        [id]: value
      }));
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: validateField(id, value)
      }));
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
    const currentYear = new Date().getFullYear();
    const maxCounter = students.length > 0
      ? Math.max(...students.map(s => parseInt(s.admissionNo.split('/').pop())))
      : 0;
    const nextCounter = maxCounter + 1;
    return `BAC/STD/${currentYear}/${String(nextCounter).padStart(4, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);
    let errors = {};
    Object.keys(newStudent).forEach(key => {
      if (key === 'admissionNo' && isNewStudentMode) return;
      const error = validateField(key, newStudent[key]);
      if (error) errors[key] = error;
    });
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
      return;
    }
    let finalAdmissionNo = newStudent.admissionNo;
    if (isNewStudentMode) {
      finalAdmissionNo = generateAdmissionNumber();
    }
    const isDuplicate = students.some(s => s.admissionNo === finalAdmissionNo && s.id !== newStudent.id);
    if (isDuplicate) {
      setMessage({ type: 'error', text: 'Admission Number already exists. Please use a unique one.' });
      return;
    }
    if (isEditing) {
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === newStudent.id ? { ...newStudent, admissionNo: finalAdmissionNo, id: finalAdmissionNo } : student
        )
      );
      setMessage({ type: 'success', text: 'Student data updated successfully!' });
    } else {
      const studentToAdd = { ...newStudent, id: finalAdmissionNo, admissionNo: finalAdmissionNo };
      setStudents(prevStudents => [...prevStudents, studentToAdd]);
      setMessage({ type: 'success', text: 'New student registered successfully!' });
    }
    setNewStudent({
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
      admissionDocument: ''
    });
    setSubmitButtonText('Register Student');
    setIsEditing(false);
    setIsNewStudentMode(true);
    setFormErrors({});
  };
  
  const editStudent = (admissionNoToEdit) => {
    const studentToEdit = students.find(s => s.admissionNo === admissionNoToEdit);
    if (studentToEdit) {
      setNewStudent(studentToEdit);
      setSubmitButtonText('Update Student');
      setIsEditing(true);
      setIsNewStudentMode(false);
      setFormErrors({});
      setMessage(null);
    }
  };
  
  const deleteStudent = (admissionNoToDelete) => {
    if (window.confirm(`Are you sure you want to delete student with Admission No: ${admissionNoToDelete}?`)) {
      setStudents(prevStudents => prevStudents.filter(student => student.admissionNo !== admissionNoToDelete));
      setMessage({ type: 'success', text: 'Student deleted successfully!' });
    }
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
    setNewStudent({
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
      admissionDocument: ''
    });
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
          <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flex: '1 1 100%', alignItems: 'center' }}>
            <label>Student Type:</label>
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
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="firstName"
              placeholder="First Name"
              required
              value={newStudent.firstName}
              onChange={handleChange}
              style={{ borderColor: formErrors.firstName ? 'red' : '' }}
            />
            {formErrors.firstName && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.firstName}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="lastName"
              placeholder="Last Name"
              required
              value={newStudent.lastName}
              onChange={handleChange}
              style={{ borderColor: formErrors.lastName ? 'red' : '' }}
            />
            {formErrors.lastName && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.lastName}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="date"
              id="dob"
              required
              title="Date of Birth"
              value={newStudent.dob}
              onChange={handleChange}
              style={{ borderColor: formErrors.dob ? 'red' : '' }}
            />
            {formErrors.dob && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.dob}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="admissionNo"
              placeholder={isNewStudentMode ? "Admission No. (Auto-generated)" : "Admission No. (Manual)"}
              value={isNewStudentMode ? generateAdmissionNumber() : newStudent.admissionNo}
              readOnly={isNewStudentMode}
              disabled={isNewStudentMode && !isEditing}
              onChange={handleChange}
              required={!isNewStudentMode}
              style={{ borderColor: formErrors.admissionNo ? 'red' : '' }}
            />
            {formErrors.admissionNo && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.admissionNo}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="parentName"
              placeholder="Parent/Guardian Name"
              required
              value={newStudent.parentName}
              onChange={handleChange}
              style={{ borderColor: formErrors.parentName ? 'red' : '' }}
            />
            {formErrors.parentName && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.parentName}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="tel"
              id="parentPhone"
              placeholder="Parent/Guardian Phone"
              required
              value={newStudent.parentPhone}
              onChange={handleChange}
              style={{ borderColor: formErrors.parentPhone ? 'red' : '' }}
            />
            {formErrors.parentPhone && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.parentPhone}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <select
              id="studentClass"
              required
              value={newStudent.studentClass}
              onChange={handleChange}
              style={{ borderColor: formErrors.studentClass ? 'red' : '' }}
            >
              <option value="">Select Class</option>
              <option value="JSS1">JSS1</option>
              <option value="JSS2">JSS2</option>
              <option value="JSS3">JSS3</option>
              <option value="SS1">SS1</option>
              <option value="SS2">SS2</option>
              <option value="SS3">SS3</option>
            </select>
            {formErrors.studentClass && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.studentClass}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <select
              id="gender"
              required
              value={newStudent.gender}
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
            <input
              type="text"
              id="address"
              placeholder="Student Address"
              required
              value={newStudent.address}
              onChange={handleChange}
              style={{ borderColor: formErrors.address ? 'red' : '' }}
            />
            {formErrors.address && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.address}</p>}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="enrollmentDate" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#555' }}>Enrollment Date:</label>
            <input
              type="date"
              id="enrollmentDate"
              required
              value={newStudent.enrollmentDate}
              onChange={handleChange}
              style={{ borderColor: formErrors.enrollmentDate ? 'red' : '' }}
            />
            {formErrors.enrollmentDate && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.enrollmentDate}</p>}
          </div>
          <div style={{ marginBottom: '10px', flex: '1 1 100%' }}>
            <textarea
              id="medicalNotes"
              placeholder="Medical Notes (Optional)"
              rows="3"
              value={newStudent.medicalNotes}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', borderColor: formErrors.medicalNotes ? 'red' : '' }}
            ></textarea>
            {formErrors.medicalNotes && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.medicalNotes}</p>}
          </div>
          <div style={{ marginBottom: '10px', flex: '1 1 100%' }}>
            <label htmlFor="admissionDocument" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: '#555' }}>Admission Document (PDF/Image):</label>
            <input
              type="file"
              id="admissionDocument"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', borderColor: formErrors.admissionDocument ? 'red' : '' }}
            />
            {newStudent.admissionDocument && <p style={{ fontSize: '0.8em', color: '#555' }}>Selected: {newStudent.admissionDocument}</p>}
            {formErrors.admissionDocument && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.admissionDocument}</p>}
          </div>
          <button type="submit">{submitButtonText}</button>
        </form>
      </div>
      <div className="sub-section">
        <h3>Student List</h3>
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
          style={{ padding: '0.6rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 48%' }}
        >
          {uniqueClasses.map(cls => (
            <option key={cls} value={cls}>
              {cls === 'all' ? 'All Classes' : cls}
            </option>
          ))}
        </select>
        <button onClick={clearSearchAndForm}>Clear Filter / Reset Form</button>
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
                <tr key={student.id}>
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
                    <td>
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
    </div>
  );
}

export default StudentManagement;