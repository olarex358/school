// src/pages/StudentCertificationRegistration.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function StudentCertificationRegistration() {
  const navigate = useNavigate();
  const [loggedInStudent, setLoggedInStudent] = useState(null);

  // Data from localStorage
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);
  const [certRegistrations, setCertRegistrations] = useLocalStorage('schoolPortalCertificationRegistrations', []);

  // Form state
  const [registrationForm, setRegistrationForm] = useState({
    subjectCode: '',
    examDate: '',
  });

  const [message, setMessage] = useState(null);

  // Protect the route
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'student') {
      setLoggedInStudent(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setRegistrationForm(prev => ({ ...prev, [id]: value }));
    setMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    const newRegistration = {
      ...registrationForm,
      id: `${loggedInStudent.admissionNo}-${registrationForm.subjectCode}`,
      studentAdmissionNo: loggedInStudent.admissionNo,
      status: 'Registered',
      timestamp: new Date().toISOString(),
    };

    // Check for duplicate registration
    if (certRegistrations.some(reg => reg.id === newRegistration.id)) {
      setMessage({ type: 'error', text: 'You are already registered for this certification exam.' });
      return;
    }

    setCertRegistrations(prev => [...prev, newRegistration]);
    setMessage({ type: 'success', text: 'Successfully registered for the certification exam!' });

    // Reset form
    setRegistrationForm({
      subjectCode: '',
      examDate: '',
    });
  };

  const getSubjectName = (subjectCode) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : subjectCode;
  };

  const studentRegistrations = certRegistrations.filter(reg => reg.studentAdmissionNo === loggedInStudent?.admissionNo);

  if (!loggedInStudent) {
    return <div className="content-section">Access Denied. Please log in as a Student.</div>;
  }

  return (
    <div className="content-section">
      <h1>Certification Exam Registration</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! You can register for an upcoming certification exam here.</p>

      <div className="sub-section">
        <h2>Register for an Exam</h2>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="subjectCode" style={{ display: 'block', marginBottom: '5px' }}>Subject:</label>
            <select
              id="subjectCode"
              value={registrationForm.subjectCode}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(subject => (
                <option key={subject.subjectCode} value={subject.subjectCode}>
                  {getSubjectName(subject.subjectCode)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="examDate" style={{ display: 'block', marginBottom: '5px' }}>Exam Date:</label>
            <input
              type="date"
              id="examDate"
              value={registrationForm.examDate}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
      </div>

      <div className="sub-section">
        <h2>My Registrations</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentRegistrations.length > 0 ? (
                studentRegistrations.map(reg => (
                  <tr key={reg.id}>
                    <td>{getSubjectName(reg.subjectCode)}</td>
                    <td>{reg.examDate}</td>
                    <td>{reg.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentCertificationRegistration;