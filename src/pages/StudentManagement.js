// src/pages/StudentManagement.js
import React, {useState} from 'react'; 
import useLocalStorage from '../hooks/useLocalStorage';

function StudentManagement() {
  // State for the list of students
  const [students, setStudents] = useLocalStorage('schoolPortalStudents',[]);

  // State for new student form inputs
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    admissionNo: '', // Will be used for editing an existing student's ID
    parentName: '',
    parentPhone: '',
    studentClass: ''
  });

  // State to control button text (Register/Update)
  const [submitButtonText, setSubmitButtonText] = useState('Register Student');
  // State to keep track if we are in edit mode
  const [isEditing, setIsEditing] = useState(false);
  // State for search filter
  const [searchTerm, setSearchTerm] = useState('');

  useLocalStorage(()=>{
    const storedStudents=localStorage.getItem('schoolPortalStudents');
    if(storedStudents){setStudents(JSON.parse(storedStudents));

    }
  },[]);

  useLocalStorage(()=>{if(students.length>0||localStorage.getItem('schoolPortalStudents')) {
    localStorage.setItem('schoolPortalStudents',JSON.stringify(students));

  }
},[students]);

  // Handle input changes for the form
  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewStudent(prevStudent => ({
      ...prevStudent,
      [id]: value
    }));
  };

  // Generate a new unique admission number for *new* registrations
  const generateAdmissionNumber = () => {
    const currentYear = new Date().getFullYear();
    // Simple ID generation for tutorial. In a real app, use a UUID or backend ID.
    const maxCounter=students.length>0 ?
    Math.max(...students.map(s=>parseInt(s.admissionNo.split('/').pop())))
    :0;

    const nextCounter= maxCounter + 1;
    return `BAC/STD/${currentYear}/${String(nextCounter).padStart(4,'0')}`;
  };

  // Handle form submission (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !newStudent.firstName ||
      !newStudent.lastName ||
      !newStudent.dob ||
      !newStudent.parentName ||
      !newStudent.parentPhone ||
      !newStudent.studentClass
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (isEditing) {
      // Update existing student
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === newStudent.id ? { ...newStudent, admissionNo: newStudent.id } : student
        )
      );
      alert('Student data updated successfully!');
    } else {
      // Add new student
      const studentAdmissionNo = generateAdmissionNumber();
      const studentToAdd = { ...newStudent, id: studentAdmissionNo, admissionNo: studentAdmissionNo };
      setStudents(prevStudents => [...prevStudents, studentToAdd]);
      alert('New student registered successfully!');
    }

    // Reset form and state after submission
    setNewStudent({
      firstName: '',
      lastName: '',
      dob: '',
      admissionNo: '',
      parentName: '',
      parentPhone: '',
      studentClass: ''
    });
    setSubmitButtonText('Register Student');
    setIsEditing(false);
  };

  // Function to populate form for editing
  const editStudent = (admissionNoToEdit) => {
    const studentToEdit = students.find(s => s.admissionNo === admissionNoToEdit);
    if (studentToEdit) {
      setNewStudent(studentToEdit); // Populate the form state with student data
      setSubmitButtonText('Update Student');
      setIsEditing(true);
    }
  };

  // Function to delete student
  const deleteStudent = (admissionNoToDelete) => {
    if (window.confirm(`Are you sure you want to delete student with Admission No: ${admissionNoToDelete}?`)) {
      setStudents(prevStudents => prevStudents.filter(student => student.admissionNo !== admissionNoToDelete));
      alert('Student deleted successfully!');
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search filter and reset form if in edit mode
  const clearSearchAndForm = () => {
    setSearchTerm('');
    setNewStudent({
      firstName: '',
      lastName: '',
      dob: '',
      admissionNo: '',
      parentName: '',
      parentPhone: '',
      studentClass: ''
    });
    setSubmitButtonText('Register Student');
    setIsEditing(false);
  };

  // Filter students based on search term (case-insensitive)
  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort students by class and then by last name (matching admin.js logic)
  const classOrder = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const classAIndex = classOrder.indexOf(a.studentClass);
    const classBIndex = classOrder.indexOf(b.studentClass);
    if (classAIndex === classBIndex) {
        return a.lastName.localeCompare(b.lastName);
    }
    return classAIndex - classBIndex;
  });


  return (
    <div className="content-section">
      <h2>Student Management</h2>

      <div className="sub-section">
        <h3>{isEditing ? 'Edit Student' : 'Register New Student'}</h3>
        <form id="studentForm" onSubmit={handleSubmit}>
          <input
            type="text"
            id="firstName"
            placeholder="First Name"
            required
            value={newStudent.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            id="lastName"
            placeholder="Last Name"
            required
            value={newStudent.lastName}
            onChange={handleChange}
          />
          <input
            type="date"
            id="dob"
            required
            title="Date of Birth"
            value={newStudent.dob}
            onChange={handleChange}
          />
          <input
            type="text"
            id="admissionNo"
            placeholder="Admission No. (Auto-generated)"
            value={isEditing ? newStudent.admissionNo : generateAdmissionNumber()}
            readOnly
            disabled={!isEditing} // Only disabled for new registrations, enabled for edit to show existing
          />
          <input
            type="text"
            id="parentName"
            placeholder="Parent/Guardian Name"
            required
            value={newStudent.parentName}
            onChange={handleChange}
          />
          <input
            type="tel"
            id="parentPhone"
            placeholder="Parent/Guardian Phone"
            required
            value={newStudent.parentPhone}
            onChange={handleChange}
          />
          <select
            id="studentClass"
            required
            value={newStudent.studentClass}
            onChange={handleChange}
          >
            <option value="">Select Class</option>
            <option value="JSS1">JSS1</option>
            <option value="JSS2">JSS2</option>
            <option value="JSS3">JSS3</option>
            <option value="SS1">SS1</option>
            <option value="SS2">SS2</option>
            <option value="SS3">SS3</option>
          </select>
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
        <button onClick={clearSearchAndForm}>Clear Filter / Reset Form</button> {/* Combined button */}
        <div className="table-container">
          <table id="studentTable">
            <thead>
              <tr>
                <th>Admission No.</th>
                <th>Name</th>
                <th>Class</th>
                <th>DOB</th>
                <th>Parent Name</th>
                <th>Parent Phone</th>
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
                    <td>{student.dob}</td>
                    <td>{student.parentName}</td>
                    <td>{student.parentPhone}</td>
                    <td>
                      <button
                        className="action-btn edit-btn" // Add classes for styling if you adapt admin.css
                        onClick={() => editStudent(student.admissionNo)}>
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn" // Add classes for styling if you adapt admin.css
                        onClick={() => deleteStudent(student.admissionNo)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No students found.</td>
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