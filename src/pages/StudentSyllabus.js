// src/pages/StudentSyllabus.js
import React, { useState, useEffect } from 'react'; // Corrected '=>' to 'from'
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

// Import the syllabus icon
import syllabusIcon from '../icon/sylabus.png'; // Corrected spelling

function StudentSyllabus() {
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const navigate = useNavigate();
  // Load syllabus entries
  const [allSyllabusEntries] = useLocalStorage('schoolPortalSyllabusEntries', []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'student') {
      setLoggedInStudent(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  if (!loggedInStudent) {
    return <div className="content-section">Loading syllabus...</div>;
  }

  // Filter syllabus entries relevant to this student (all, or specific class/subject)
  const studentRelevantSyllabus = allSyllabusEntries.filter(entry =>
    (entry.audience === 'all' || entry.audience === 'students') &&
    (entry.applicableClass === 'all' || entry.applicableClass === loggedInStudent.studentClass)
  ).sort((a, b) => a.applicableClass.localeCompare(b.applicableClass) || a.applicableSubject.localeCompare(b.applicableSubject));


  return (
    <div className="content-section">
      <h1>My Syllabus</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here are your relevant syllabus outlines:</p>

      {studentRelevantSyllabus.length > 0 ? (
        studentRelevantSyllabus.map(entry => (
          <div key={entry.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img src={syllabusIcon} alt="Syllabus Icon" width="40px" height="40px" style={{ marginRight: '15px', flexShrink: 0 }} />
              <div>
                <h3>{entry.title}</h3>
                <p><strong>Class:</strong> {entry.applicableClass === 'all' ? 'All Classes' : entry.applicableClass}</p>
                <p><strong>Subject:</strong> {entry.applicableSubject === 'all' ? 'All Subjects' : entry.applicableSubject}</p>
                <p style={{ marginTop: '5px' }}>{entry.description.substring(0, 150)}...</p>
              </div>
            </div>
            <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#555' }}>Audience: {entry.audience.charAt(0).toUpperCase() + entry.audience.slice(1)}</p>
          </div>
        ))
      ) : (
        <p>No syllabus entries posted for you yet.</p>
      )}

      <p style={{ marginTop: '20px' }}>
        For detailed subject-specific syllabus and learning objectives, please refer to the academic department or your subject teachers.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentSyllabus;