// src/pages/StudentManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { uploadFile } from '../utils/uploadFile';
import ConfirmModal from '../components/ConfirmModal';


function StudentManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  const { students: studentsData, setStudents, loading, error } = useData();
  const students = Array.isArray(studentsData) ? studentsData : [];
  
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
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitButtonText, setSubmitButtonText] = useState('Register Student');
  const [isEditing, setIsEditing] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isNewStudentMode, setIsNewStudentMode] = useState(true);
  const [classFilter, setClassFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState(null);
  const [isModalAlert, setIsModalAlert] = useState(false);

  const showConfirm = (msg, action) => {
    setModalMessage(msg);
    setModalAction(() => action);
    setIsModalAlert(false);
    setIsModalOpen(true);
  };

  const showAlert = (msg) => {
    setModalMessage(msg);
    setModalAction(() => {});
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
      setSelectedFile(file);
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
  };
  
  const handleStudentModeChange = (e) => {
    const isNew = e.target.value === 'new';
    setIsNewStudentMode(isNew);
    setNewStudent(prevStudent => ({
      ...prevStudent,
      admissionNo: isNew ? '' : prevStudent.admissionNo
    }));
    setFormErrors({});
  };
  
  const generateAdmissionNumber = () => {
    const currentYear = new Date().getFullYear();
    const maxCounter = students.length > 0
      ? Math.max(...students.map(s => {
          const parts = s.admissionNo.split('/');
          return parts.length > 0 ? parseInt(parts.pop()) : 0;
        }))
      : 0;
    const nextCounter = maxCounter + 1;
    return `BAC/STD/${currentYear}/${String(nextCounter).padStart(4, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};
    Object.keys(newStudent).forEach(key => {
      if (key === 'admissionNo' && isNewStudentMode) return;
      const error = validateField(key, newStudent[key]);
      if (error) errors[key] = error;
    });
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showAlert('Please correct the errors in the form.');
      return;
    }

    let admissionDocPath = newStudent.admissionDocument;
    if (selectedFile) {
      try {
        admissionDocPath = await uploadFile(selectedFile);
      } catch (err) {
        showAlert(err.message);
        return;
      }
    }
    
    let finalAdmissionNo = newStudent.admissionNo;
    if (!isEditing && isNewStudentMode) {
      finalAdmissionNo = generateAdmissionNumber();
    } else if (!isNewStudentMode && !finalAdmissionNo) {
        showAlert('Admission number is required for an old student.');
        return;
    }

    const studentToSave = { 
        ...newStudent, 
        admissionNo: finalAdmissionNo, 
        username: finalAdmissionNo, 
        admissionDocument: admissionDocPath,
        password: '123'
    };
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      if (isEditing) {
        const response = await fetch(`http://localhost:5000/api/schoolPortalStudents/${editStudentId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(studentToSave),
        });
        if (response.ok) {
          const updatedStudent = await response.json();
          setStudents(prevStudents =>
            prevStudents.map(student =>
              student._id === updatedStudent._id ? updatedStudent : student
            )
          );
          showAlert('Student data updated successfully!');
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to update student.');
        }
      } else {
        // Corrected logic: remove the _id from the object before sending
        const { _id, ...studentWithoutId } = studentToSave;
        const response = await fetch('http://localhost:5000/api/schoolPortalStudents', {
          method: 'POST',
          headers,
          body: JSON.stringify(studentWithoutId),
        });
        if (response.ok) {
          const newStudentEntry = await response.json();
          setStudents(prevStudents => [...prevStudents, newStudentEntry]);
          showAlert('New student registered successfully!');
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to add new student.');
        }
      }
    } catch (err) {
      showAlert('An unexpected error occurred. Please check your network connection.');
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
    setSelectedFile(null);
    setSubmitButtonText('Register Student');
    setIsEditing(false);
    setIsNewStudentMode(true);
    setFormErrors({});
  };
  
  const editStudent = (studentIdToEdit) => {
    const studentToEdit = students.find(s => s.admissionNo === studentIdToEdit);
    if (studentToEdit) {
      setNewStudent(studentToEdit);
      setSubmitButtonText('Update Student');
      setIsEditing(true);
      setIsNewStudentMode(false);
      setEditStudentId(studentToEdit._id);
      setFormErrors({});
      setSelectedFile(null);
    }
  };
  
  const deleteStudent = (studentIdToDelete) => {
    showConfirm(
      `Are you sure you want to delete student with Admission No: ${studentIdToDelete}?`,
      async () => {
        const studentToDelete = students.find(s => s.admissionNo === studentIdToDelete);
        if (!studentToDelete) {
          showAlert('Student not found.');
          return;
        }
        try {
          const response = await fetch(`http://localhost:5000/api/schoolPortalStudents/${studentToDelete._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          });
          if (response.ok) {
            setStudents(prevStudents => prevStudents.filter(student => student.admissionNo !== studentIdToDelete));
            showAlert('Student deleted successfully!');
          } else {
            const errorData = await response.json();
            showAlert(errorData.message || 'Failed to delete student.');
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
    setSelectedFile(null);
    setSubmitButtonText('Register Student');
    setIsEditing(false);
    setIsNewStudentMode(true);
    setFormErrors({});
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
  
  if (!loggedInAdmin) {
    return <div className="content-section">Access Denied. Please log in as an Admin.</div>;
  }

  if (loading) {
      return <div className="content-section">Loading student data...</div>;
  }
  
  if (error) {
    return <div className="content-section">Error loading data: {error.message}</div>;
  }

  return (
    <div className="content-section">
      <ConfirmModal 
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={() => {
            if (modalAction) {
                modalAction();
            }
            setIsModalOpen(false);
        }}
        onCancel={() => setIsModalOpen(false)}
        isAlert={isModalAlert}
      />
      
      <h2>Student Management</h2>
      <div className="sub-section">
        <h3>{isEditing ? 'Edit Student' : 'Register New Student'}</h3>
        <form id="studentForm" onSubmit={handleSubmit} className="student-form">
          <div className="form-group-full student-mode-selection">
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
          <div className="form-group">
            <input
              type="text"
              id="firstName"
              placeholder="First Name"
              value={newStudent.firstName}
              onChange={handleChange}
              className={`form-input ${formErrors.firstName ? 'form-input-error' : ''}`}
            />
            {formErrors.firstName && <p className="error-message">{formErrors.firstName}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              id="lastName"
              placeholder="Last Name"
              value={newStudent.lastName}
              onChange={handleChange}
              className={`form-input ${formErrors.lastName ? 'form-input-error' : ''}`}
            />
            {formErrors.lastName && <p className="error-message">{formErrors.lastName}</p>}
          </div>
          <div className="form-group">
            <input
              type="date"
              id="dob"
              placeholder="Date of Birth"
              title="Date of Birth"
              value={newStudent.dob}
              onChange={handleChange}
              className={`form-input ${formErrors.dob ? 'form-input-error' : ''}`}
            />
            {formErrors.dob && <p className="error-message">{formErrors.dob}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              id="admissionNo"
              placeholder={isNewStudentMode ? "Admission No. (Auto-generated)" : "Admission No. (Manual)"}
              value={isNewStudentMode && !isEditing ? generateAdmissionNumber() : newStudent.admissionNo}
              readOnly={isNewStudentMode && !isEditing}
              disabled={isNewStudentMode && !isEditing}
              onChange={handleChange}
              className={`form-input ${formErrors.admissionNo ? 'form-input-error' : ''} ${isNewStudentMode ? 'form-input-disabled' : ''}`}
            />
            {formErrors.admissionNo && <p className="error-message">{formErrors.admissionNo}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              id="parentName"
              placeholder="Parent/Guardian Name"
              value={newStudent.parentName}
              onChange={handleChange}
              className={`form-input ${formErrors.parentName ? 'form-input-error' : ''}`}
            />
            {formErrors.parentName && <p className="error-message">{formErrors.parentName}</p>}
          </div>
          <div className="form-group">
            <input
              type="tel"
              id="parentPhone"
              placeholder="Parent/Guardian Phone"
              value={newStudent.parentPhone}
              onChange={handleChange}
              className={`form-input ${formErrors.parentPhone ? 'form-input-error' : ''}`}
            />
            {formErrors.parentPhone && <p className="error-message">{formErrors.parentPhone}</p>}
          </div>
          <div className="form-group">
            <select
              id="studentClass"
              value={newStudent.studentClass}
              onChange={handleChange}
              className={`form-input ${formErrors.studentClass ? 'form-input-error' : ''}`}
            >
              <option value="">Select Class</option>
              <option value="JSS1">JSS1</option>
              <option value="JSS2">JSS2</option>
              <option value="JSS3">JSS3</option>
              <option value="SS1">SS1</option>
              <option value="SS2">SS2</option>
              <option value="SS3">SS3</option>
            </select>
            {formErrors.studentClass && <p className="error-message">{formErrors.studentClass}</p>}
          </div>
          <div className="form-group">
            <select
              id="gender"
              value={newStudent.gender}
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
          <div className="form-group form-group-full">
            <input
              type="text"
              id="address"
              placeholder="Student Address"
              value={newStudent.address}
              onChange={handleChange}
              className={`form-input ${formErrors.address ? 'form-input-error' : ''}`}
            />
            {formErrors.address && <p className="error-message">{formErrors.address}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="enrollmentDate" className="form-label">Enrollment Date:</label>
            <input
              type="date"
              id="enrollmentDate"
              value={newStudent.enrollmentDate}
              onChange={handleChange}
              className={`form-input ${formErrors.enrollmentDate ? 'form-input-error' : ''}`}
            />
            {formErrors.enrollmentDate && <p className="error-message">{formErrors.enrollmentDate}</p>}
          </div>
          <div className="form-group form-group-full">
            <label htmlFor="admissionDocument" className="form-label">Admission Document (PDF/Image):</label>
            <input
              type="file"
              id="admissionDocument"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className={`form-input-file ${formErrors.admissionDocument ? 'form-input-error' : ''}`}
            />
            {newStudent.admissionDocument && <p className="file-info">Selected: {selectedFile?.name || (newStudent.admissionDocument.split('/').pop().length > 14 ? newStudent.admissionDocument.split('/').pop().substring(14) : newStudent.admissionDocument.split('/').pop())}</p>}
            {formErrors.admissionDocument && <p className="error-message">{formErrors.admissionDocument}</p>}
          </div>
          <div className="form-group form-group-full">
            <textarea
              id="medicalNotes"
              placeholder="Medical Notes (Optional)"
              rows="3"
              value={newStudent.medicalNotes}
              onChange={handleChange}
              className="form-input"
            ></textarea>
          </div>
          <div className="form-actions">
            <button type="submit" className="form-submit-btn">
              {isEditing ? 'Update Student' : 'Add Student'}
            </button>
            <button type="button" onClick={clearSearchAndForm} className="form-clear-btn">
              Clear Form
            </button>
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
            className="filter-input"
          />
          <select
            id="classFilter"
            value={classFilter}
            onChange={handleClassFilterChange}
            className="filter-select"
          >
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>
                {cls === 'all' ? 'All Classes' : cls}
              </option>
            ))}
          </select>
          <button type="button" onClick={clearSearchAndForm} className="filter-clear-btn">
            Clear Filter / Reset Form
          </button>
        </div>
        <div className="table-container">
          <table className="student-table">
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
                sortedStudents.map((student, index) => (
                <tr key={student._id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>{student.admissionNo}</td>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.studentClass}</td>
                    <td>{student.gender}</td>
                    <td>{student.address}</td>
                    <td>{student.enrollmentDate}</td>
                    <td>{student.parentName}</td>
                    <td>{student.parentPhone}</td>
                    <td>{student.medicalNotes || 'N/A'}</td>
                    <td>{student.admissionDocument ? <a href={student.admissionDocument} target="_blank" rel="noopener noreferrer">{student.admissionDocument.split('/').pop().length > 14 ? student.admissionDocument.split('/').pop().substring(14) : student.admissionDocument.split('/').pop()}</a> : 'N/A'}</td>
                    <td className="table-actions">
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
                <td colSpan="11" className="no-data">No students found.</td>
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