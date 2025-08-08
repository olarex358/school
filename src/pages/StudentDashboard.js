// src/pages/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { hasPermission } from '../permissions';

// Import icons (ensure these paths are correct relative to src/pages/)
import profileIcon from '../icon/profile.png';
import attendanceIcon from '../icon/attendance.png';
import subjectIcon from '../icon/subject.png';
import resultIcon from '../icon/result.png';
import calendarIcon from '../icon/calender.png';
import feesIcon from '../icon/fees.png';
import mailsIcon from '../icon/mails.png';
import passwordIcon from '../icon/password.png';
import timetableIcon from '../icon/calender.png';
import libraryIcon from '../icon/library.png';
import certificationIcon from '../icon/certification.png';


const studentNavLinks = [
  { to: "/student-profile", text: "My profile", icon: profileIcon },
  { to: "/student-results", text: "My Results", icon: resultIcon },
  { to: "/student-syllabus", text: "My syllabus", icon: subjectIcon },
  { to: "/student-certification", text: "My certification", icon: certificationIcon },
  { to: "/student-calendar", text: "My Calender", icon: calendarIcon },
  { to: "/student-attendance", text: "My Attendance", icon: attendanceIcon },
  { to: "/student-fees", text: "My Fees", icon: feesIcon },
  { to: "/student-mails", text: "My Mails", icon: mailsIcon },
  { to: "/student-password-change", text: "Change password", icon: passwordIcon },
  { to: "/student-subjects", text: "My Subjects", icon: subjectIcon },
  { to: "/student-timetable", text: "My Timetable", icon: timetableIcon },
  { to: "/student-certification-registration", text: "Register for Certification", icon: certificationIcon },
  { to: "/student-digital-library", text: "Digital Library", icon: libraryIcon },
];

function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState(null);
  const navigate = useNavigate();

  const {
    students,
    loading,
    error
  } = useData();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'student') {
      const detailedStudentInfo = students.find(s => s.admissionNo === loggedInUser.admissionNo);
      if (detailedStudentInfo) {
        setStudentInfo(detailedStudentInfo);
      } else {
        console.error("Logged-in student not found in database.");
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      navigate('/home');
    }
  }, [navigate, students]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    navigate('/home');
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  if (!studentInfo || loading) {
    return <div className="content-section">Loading student dashboard...</div>;
  }
  
  if (error) {
    return <div className="content-section">Error loading data: {error.message}</div>;
  }

  const filteredNavLinks = studentNavLinks.filter(link => hasPermission('student', link.to));

  return (
    <div className="container">
        <aside className="sidebar">
            <h2>Busari-alao College</h2>
            <ul>
                {filteredNavLinks.map(link => (
                    <li key={link.to}><Link to={link.to}>{link.text}</Link></li>
                ))}
            </ul>
            <button type="button" onClick={handleLogout}>Logout</button>
        </aside>
        <div className="main-content">
            <h1>Student Dashboard</h1>
            <header className="top-nav">
                <h2> Welcome, <span>{studentInfo.firstName} {studentInfo.lastName}</span></h2>
                <p><strong>Class:</strong><span>{studentInfo.studentClass}</span></p>
            </header>
            <div className="cards-container">
                {filteredNavLinks.map(link => (
                    <div className="card" key={link.to} onClick={() => handleCardClick(link.to)}>
                        <img src={link.icon} alt={link.text} width="50px" height="50px" />
                        {link.text}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}

export default StudentDashboard;
