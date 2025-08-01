// src/pages/AdminCertificationManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function AdminCertificationManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Data from localStorage
  const [certificationResults, setCertificationResults] = useLocalStorage('schoolPortalCertificationResults', []);
  const [students] = useLocalStorage('schoolPortalStudents', []);
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);

  // Form states
  const [resultForm, setResultForm] = useState({
    studentAdmissionNo: '',
    subjectCode: '',
    date: '',
    objScore: '', // Score for Objective
    theoryScore: '', // Score for Theory
    pracScore: '', // Score for Practical
    totalScore: 0,
    grade: '',
    qualified: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editResultId, setEditResultId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect the route
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'admin') {
      setLoggedInAdmin(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Helper functions
  const getStudentName = (admissionNo) => {
    const student = students.find(s => s.admissionNo === admissionNo);
    return student ? `${student.firstName} ${student.lastName} (${student.admissionNo})` : 'Unknown Student';
  };

  const getSubjectName = (subjectCode) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : subjectCode;
  };
  
  // Custom grading and qualification logic
  const calculateGradeAndQualification = (total) => {
    let grade = '';
    let qualified = false;

    // Scale is: 9,8 = Zenith, 7,6 = Legends, 5,4 = Economy, <4 = Not qualified
    const scaledScore = (total / 100) * 9; // Assuming total is out of 100

    if (scaledScore >= 8.0) {
      grade = 'Zenith';
      qualified = true;
    } else if (scaledScore >= 6.0) {
      grade = 'Legends';
      qualified = true;
    } else if (scaledScore >= 4.0) {
      grade = 'Economy';
      qualified = true;
    } else {
      grade = 'Not Qualified';
      qualified = false;
    }

    return { grade, qualified };
  };

  const validateForm = () => {
    let errors = {};
    if (!resultForm.studentAdmissionNo) errors.studentAdmissionNo = 'Student is required.';
    if (!resultForm.subjectCode) errors.subjectCode = 'Subject is required.';
    if (!resultForm.date) errors.date = 'Date is required.';
    if (resultForm.objScore === '' || resultForm.theoryScore === '' || resultForm.pracScore === '') {
      errors.scores = 'All scores are required.';
    }
    
    // Check if scores are valid numbers
    const scoreFields = ['objScore', 'theoryScore', 'pracScore'];
    scoreFields.forEach(field => {
      const score = parseFloat(resultForm[field]);
      if (isNaN(score) || score < 0 || score > 100) {
        errors.scores = 'Scores must be numbers between 0 and 100.';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setResultForm(prev => ({ ...prev, [id]: value }));
    setFormErrors(prev => ({ ...prev, [id]: '' }));
    setMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
      return;
    }
    
    // Calculate total score and grade
    const totalScore = parseFloat(resultForm.objScore) + parseFloat(resultForm.theoryScore) + parseFloat(resultForm.pracScore);
    const { grade, qualified } = calculateGradeAndQualification(totalScore);

    const resultToAddOrUpdate = {
      ...resultForm,
      id: isEditing ? editResultId : Date.now(),
      totalScore: totalScore,
      grade: grade,
      qualified: qualified,
      timestamp: new Date().toISOString(),
    };

    if (isEditing) {
      setCertificationResults(prev =>
        prev.map(res => (res.id === editResultId ? resultToAddOrUpdate : res))
      );
      setMessage({ type: 'success', text: 'Certification result updated successfully!' });
    } else {
      setCertificationResults(prev => [...prev, resultToAddOrUpdate]);
      setMessage({ type: 'success', text: 'New certification result added successfully!' });
    }

    // Reset form
    setResultForm({
      studentAdmissionNo: '',
      subjectCode: '',
      date: '',
      objScore: '',
      theoryScore: '',
      pracScore: '',
      totalScore: 0,
      grade: '',
      qualified: false,
    });
    setIsEditing(false);
    setEditResultId(null);
    setFormErrors({});
  };

  const editResult = (idToEdit) => {
    const result = certificationResults.find(res => res.id === idToEdit);
    if (result) {
      setResultForm(result);
      setIsEditing(true);
      setEditResultId(idToEdit);
      setMessage(null);
      setFormErrors({});
    }
  };

  const deleteResult = (idToDelete) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      setCertificationResults(prev => prev.filter(res => res.id !== idToDelete));
      setMessage({ type: 'success', text: 'Certification result deleted successfully!' });
    }
  };

  const clearForm = () => {
    setResultForm({
      studentAdmissionNo: '',
      subjectCode: '',
      date: '',
      objScore: '',
      theoryScore: '',
      pracScore: '',
      totalScore: 0,
      grade: '',
      qualified: false,
    });
    setIsEditing(false);
    setEditResultId(null);
    setFormErrors({});
    setMessage(null);
  };

  const filteredResults = certificationResults.filter(res =>
    getStudentName(res.studentAdmissionNo).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSubjectName(res.subjectCode).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (!loggedInAdmin) {
    return <div className="content-section">Access Denied. Please log in as an Admin.</div>;
  }

  return (
    <div className="content-section">
      <h1>Certification Management</h1>
      <div className="sub-section">
        <h2>{isEditing ? 'Edit Certification Result' : 'Add New Certification Result'}</h2>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="studentAdmissionNo" style={{ display: 'block', marginBottom: '5px' }}>Student:</label>
            <select
              id="studentAdmissionNo"
              value={resultForm.studentAdmissionNo}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.studentAdmissionNo ? 'red' : '' }}
              disabled={isEditing}
            >
              <option value="">-- Select Student --</option>
              {students.map(student => (
                <option key={student.admissionNo} value={student.admissionNo}>
                  {getStudentName(student.admissionNo)}
                </option>
              ))}
            </select>
            {formErrors.studentAdmissionNo && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.studentAdmissionNo}</p>}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="subjectCode" style={{ display: 'block', marginBottom: '5px' }}>Subject:</label>
            <select
              id="subjectCode"
              value={resultForm.subjectCode}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.subjectCode ? 'red' : '' }}
              disabled={isEditing}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(subject => (
                <option key={subject.subjectCode} value={subject.subjectCode}>{getSubjectName(subject.subjectCode)}</option>
              ))}
            </select>
            {formErrors.subjectCode && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.subjectCode}</p>}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '5px' }}>Date:</label>
            <input
              type="date"
              id="date"
              value={resultForm.date}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.date ? 'red' : '' }}
            />
            {formErrors.date && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.date}</p>}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="objScore" style={{ display: 'block', marginBottom: '5px' }}>Obj Score:</label>
            <input
              type="number"
              id="objScore"
              value={resultForm.objScore}
              onChange={handleChange}
              required
              min="0"
              max="100"
              placeholder="Objective Score"
              style={{ borderColor: formErrors.scores ? 'red' : '' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="theoryScore" style={{ display: 'block', marginBottom: '5px' }}>Theory Score:</label>
            <input
              type="number"
              id="theoryScore"
              value={resultForm.theoryScore}
              onChange={handleChange}
              required
              min="0"
              max="100"
              placeholder="Theory Score"
              style={{ borderColor: formErrors.scores ? 'red' : '' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="pracScore" style={{ display: 'block', marginBottom: '5px' }}>Practical Score:</label>
            <input
              type="number"
              id="pracScore"
              value={resultForm.pracScore}
              onChange={handleChange}
              required
              min="0"
              max="100"
              placeholder="Practical Score"
              style={{ borderColor: formErrors.scores ? 'red' : '' }}
            />
          </div>

          {formErrors.scores && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.scores}</p>}

          <button type="submit">{isEditing ? 'Update Result' : 'Add Result'}</button>
          <button type="button" onClick={clearForm} style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>Clear Form</button>
        </form>
      </div>

      <div className="sub-section">
        <h2>All Certification Results</h2>
        <input
          type="text"
          placeholder="Search by student or subject"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        />
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Std No.</th>
                <th>Student Name</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Obj</th>
                <th>Theory</th>
                <th>Prac</th>
                <th>Total</th>
                <th>Grade</th>
                <th>Qualified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map(res => (
                  <tr key={res.id}>
                    <td>{res.studentAdmissionNo}</td>
                    <td>{getStudentName(res.studentAdmissionNo)}</td>
                    <td>{getSubjectName(res.subjectCode)}</td>
                    <td>{res.date}</td>
                    <td>{res.objScore}</td>
                    <td>{res.theoryScore}</td>
                    <td>{res.pracScore}</td>
                    <td><strong>{res.totalScore}</strong></td>
                    <td style={{color: res.qualified ? 'green' : 'red'}}><strong>{res.grade}</strong></td>
                    <td style={{color: res.qualified ? 'green' : 'red'}}>{res.qualified ? 'Yes' : 'No'}</td>
                    <td>
                      <button className="action-btn edit-btn" onClick={() => editResult(res.id)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => deleteResult(res.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11">No certification results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminCertificationManagement;