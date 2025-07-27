// src/pages/StudentManagement.js
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

function StudentManagement() {
  const [students, setStudents] = useLocalStorage('schoolPortalStudents', []);

  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    admissionNo: '', // Will be set based on new/old student choice
    parentName: '',
    parentPhone: '',
    studentClass: '',
    // NEW: More student details
    gender: '',
    address: '',
    enrollmentDate: '',
    medicalNotes: '', // New field for medical notes
    // NEW: File upload (store filename)
    admissionDocument: '' // To store the filename of the uploaded document
  });

  const [submitButtonText, setSubmitButtonText] = useState('Register Student');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // NEW: State for form validation errors
  const [formErrors, setFormErrors] = useState({});
  // NEW: State for general success/error messages
  const [message, setMessage] = useState(null);
  // NEW: State for choosing between new or old student (manual/auto admission no)
  const [isNewStudentMode, setIsNewStudentMode] = useState(true);
  // NEW: State for class filter dropdown
  const [classFilter, setClassFilter] = useState('all');


  // Function to validate individual field (or all fields on submit)
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

  // Handle input changes
  const handleChange = (e) => {
    const { id, value, type, files } = e.target;

    if (type === 'file') {
      // For file input, store the filename
      const file = files[0];
      setNewStudent(prevStudent => ({
        ...prevStudent,
        [id]: file ? file.name : '' // Store just the file name
      }));
      // No validation for file type/size in this frontend-only demo
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: '' // Clear any previous file-related error
      }));
    } else {
      setNewStudent(prevStudent => ({
        ...prevStudent,
        [id]: value
      }));
      // Validate field immediately and clear its error
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [id]: validateField(id, value)
      }));
    }
    setMessage(null); // Clear general messages on input
  };

  // Handle change for new/old student mode
  const handleStudentModeChange = (e) => {
    const isNew = e.target.value === 'new';
    setIsNewStudentMode(isNew);
    // Reset relevant fields when switching mode
    setNewStudent(prevStudent => ({
      ...prevStudent,
      admissionNo: isNew ? '' : prevStudent.admissionNo // Clear if new, keep if old
    }));
    setFormErrors({}); // Clear errors
    setMessage(null); // Clear messages
  };

  // Generate a new unique admission number for *new* registrations
  const generateAdmissionNumber = () => {
    const currentYear = new Date().getFullYear();
    const maxCounter = students.length > 0
      ? Math.max(...students.map(s => parseInt(s.admissionNo.split('/').pop())))
      : 0;
    const nextCounter = maxCounter + 1;
    return `BAC/STD/${currentYear}/${String(nextCounter).padStart(4, '0')}`;
  };

  // Handle form submission (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    let errors = {};
    // Validate all fields on submit
    Object.keys(newStudent).forEach(key => {
      // Only validate admissionNo if in old student mode
      if (key === 'admissionNo' && isNewStudentMode) return; // Skip if auto-generated
      const error = validateField(key, newStudent[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
      return;
    }

    // Determine final admission number
    let finalAdmissionNo = newStudent.admissionNo;
    if (isNewStudentMode) {
      finalAdmissionNo = generateAdmissionNumber();
    }

    // Check for duplicate admission number (only if not editing or if ID changed during edit)
    const isDuplicate = students.some(s => s.admissionNo === finalAdmissionNo && s.id !== newStudent.id);
    if (isDuplicate) {
        setMessage({ type: 'error', text: 'Admission Number already exists. Please use a unique one.' });
        return;
    }


    if (isEditing) {
      // Update existing student
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === newStudent.id ? { ...newStudent, admissionNo: finalAdmissionNo, id: finalAdmissionNo } : student
        )
      );
      setMessage({ type: 'success', text: 'Student data updated successfully!' });
    } else {
      // Add new student
      const studentToAdd = { ...newStudent, id: finalAdmissionNo, admissionNo: finalAdmissionNo };
      setStudents(prevStudents => [...prevStudents, studentToAdd]);
      setMessage({ type: 'success', text: 'New student registered successfully!' });
    }

    // Reset form and state after submission
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
    setIsNewStudentMode(true); // Reset to new student mode
    setFormErrors({});
  };

  // Function to populate form for editing
  const editStudent = (admissionNoToEdit) => {
    const studentToEdit = students.find(s => s.admissionNo === admissionNoToEdit);
    if (studentToEdit) {
      setNewStudent(studentToEdit);
      setSubmitButtonText('Update Student');
      setIsEditing(true);
      setIsNewStudentMode(false); // When editing, assume it's an existing student
      setFormErrors({});
      setMessage(null);
    }
  };

  // Function to delete student (remains the same)
  const deleteStudent = (admissionNoToDelete) => {
    if (window.confirm(`Are you sure you want to delete student with Admission No: ${admissionNoToDelete}?`)) {
      setStudents(prevStudents => prevStudents.filter(student => student.admissionNo !== admissionNoToDelete));
      setMessage({ type: 'success', text: 'Student deleted successfully!' });
    }
  };

  // Handle search input changes (remains the same)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle class filter change
  const handleClassFilterChange = (e) => {
    setClassFilter(e.target.value);
  };

  // Clear search filter and reset form
  const clearSearchAndForm = () => {
    setSearchTerm('');
    setClassFilter('all'); // Also clear class filter
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
    setIsNewStudentMode(true); // Reset to new student mode
    setFormErrors({});
    setMessage(null);
  };

  // Filter students based on search term AND class filter
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      classFilter === 'all' || student.studentClass === classFilter;

    return matchesSearch && matchesClass;
  });

  // Sort students by class and then by last name
  const classOrder = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const classAIndex = classOrder.indexOf(a.studentClass);
    const classBIndex = classOrder.indexOf(b.studentClass);
    if (classAIndex === classBIndex) {
        return a.lastName.localeCompare(b.lastName);
    }
    return classAIndex - classBIndex;
  });

  // Get unique classes for the filter dropdown
  const uniqueClasses = ['all', ...new Set(students.map(s => s.studentClass))].sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    return classOrder.indexOf(a) - classOrder.indexOf(b);
  });


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
          {/* NEW: New/Old Student Mode Selector */}
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

          {/* Admission No. input - conditional based on mode */}
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              id="admissionNo"
              placeholder={isNewStudentMode ? "Admission No. (Auto-generated)" : "Admission No. (Manual)"}
              value={isNewStudentMode ? generateAdmissionNumber() : newStudent.admissionNo}
              readOnly={isNewStudentMode} // Read-only if auto-generated
              disabled={isNewStudentMode && !isEditing} // Disabled if auto-generated and not editing an existing
              onChange={handleChange} // Allow change only if manual mode
              required={!isNewStudentMode} // Required only for manual input
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

          {/* NEW: Additional Student Details */}
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
          <div style={{ marginBottom: '10px', flex: '1 1 100%' }}> {/* Full width for textarea */}
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
          <div style={{ marginBottom: '10px', flex: '1 1 100%' }}> {/* Full width for file input */}
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
        {/* NEW: Class Filter Dropdown */}
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
                <th>Gender</th> {/* NEW COLUMN */}
                <th>Address</th> {/* NEW COLUMN */}
                <th>Enrollment Date</th> {/* NEW COLUMN */}
                <th>Parent Name</th>
                <th>Parent Phone</th>
                <th>Medical Notes</th> {/* NEW COLUMN */}
                <th>Admission Doc</th> {/* NEW COLUMN */}
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
                    <td>{student.gender}</td> {/* Display NEW COLUMN */}
                    <td>{student.address}</td> {/* Display NEW COLUMN */}
                    <td>{student.enrollmentDate}</td> {/* Display NEW COLUMN */}
                    <td>{student.parentName}</td>
                    <td>{student.parentPhone}</td>
                    <td>{student.medicalNotes || 'N/A'}</td> {/* Display NEW COLUMN */}
                    <td>{student.admissionDocument ? <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulating download of: ${student.admissionDocument}`); }}>{student.admissionDocument}</a> : 'N/A'}</td> {/* Display NEW COLUMN */}
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
                  <td colSpan="11">No students found.</td> {/* Adjusted colspan */}
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