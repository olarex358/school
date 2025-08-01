// src/pages/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Import icons (ensure these paths are correct relative to src/pages/)
import profileIcon from '../icon/profile.png'; //
import attendanceIcon from '../icon/attendance.png'; //
import subjectIcon from '../icon/subject.png'; //
import resultIcon from '../icon/result.png'; //
import calendarIcon from '../icon/calender.png'; //
import feesIcon from '../icon/fees.png'; //
import mailsIcon from '../icon/mails.png'; //
import passwordIcon from '../icon/password.png'; //
import timetableIcon from '../icon/calender.png';
import libraryIcon from '../icon/library.png';
import certificationIcon from '../icon/certification.png';


function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.type === 'student') {
      setStudentInfo(loggedInUser);
    } else {
      // If for some reason not a student or not logged in, redirect to login
      navigate('/home');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  if (!studentInfo) {
    return <div className="content-section">Loading student dashboard...</div>; //
  }

  return (
    <div className="container"> {/* Class name from student dashboard.txt for layout */}
        <aside className="sidebar"> {/* Class name from student dashboard.txt for layout */}
            <h2>Busari-alao College</h2>
            <ul>
                <li><Link to="/student-profile">My profile</Link></li> {/* Link to profile.html */}
                <li><Link to="/student-results">My Results</Link></li> {/* Link to results.html */}
                <li><Link to="/student-syllabus">My syllabus</Link></li> {/* Link to syllabus.html */}
                <li><Link to="/student-certification">My certification</Link></li> {/* Link to certification.html */}
                <li><Link to="/student-calendar">My Calender</Link></li>
                <li><Link to="/student-attendance">My Attendance</Link></li>
                <li><Link to="/student-fees">My Fees</Link></li>
                <li><Link to="/student-mails">My Mails</Link></li>
                <li><Link to="/student-password-change">Change password</Link></li>
                <li><Link to="/student-subject">My Subjects</Link></li>
                 <li><Link to="/student-timetable">My Timetable</Link></li>
                  <li><Link to="/student-certification-registration">Register for Certificatin</Link></li>
                  <li><Link to="/student-digital-library">Digital Library</Link></li>


            </ul>
            <button type="button" onClick={handleLogout}>Logout</button>
        </aside>
        <div className="main-content"> {/* Class name from student dashboard.txt for layout */}
            <header className="top-nav"> {/* Class name from student dashboard.txt for layout */}
                <h2>Dashboard</h2> {/* */}
                <div className="user-profile" id="studentInfo">
                    <h2> Welcome, <span>{studentInfo.firstName} {studentInfo.lastName}</span></h2> {/* */}
                    <p><strong>Class:</strong><span>{studentInfo.studentClass}</span></p> {/* */}
                </div>
            </header>
            <div className="cards-container"> {/* Class name from student dashboard.txt for layout */}
                <Link to="/student-profile"><div className="card"> <img src={profileIcon} alt="My profile" width="50px" height="50px" />My profile</div></Link> {/* Link and icon from student dashboard.txt */}
                <Link to="/student-attendance"><div className="card"> <img src={attendanceIcon} alt="Attendance" width="50px" height="50px" />Attendance</div></Link> {/* */}
                <Link to="/student-subjects"><div className="card"> <img src={subjectIcon} alt="My subjects" width="50px" height="50px" />My subjects </div></Link> {/* */}
                <Link to="/student-results"><div className="card"> <img src={resultIcon} alt="My results" width="50px" height="50px" />My results</div></Link> {/* */}
                <Link to="/student-calendar"><div className="card"> <img src={calendarIcon} alt="Calendar" width="50px" height="50px" />Calendar</div></Link> {/* */}
                <Link to="/student-fees"><div className="card"> <img src={feesIcon} alt="My fees" width="50px" height="50px" />My fees</div></Link> {/* */}
                <Link to="/student-mails"><div className="card"> <img src={mailsIcon} alt="Mails" width="50px" height="50px" />Mails</div></Link> {/* */}
                <Link to="/student-password-change"><div className="card"><img src={passwordIcon} alt="Password" width="50px" height="50px" /> Password</div></Link>
                <Link to="/student-timetable"><div className="card"> <img src={timetableIcon} alt="My Timetable" width="50px" height="50px" />My Timetable</div></Link>

                <Link to="/student-digital-library"><div className="card"> <img src={libraryIcon} alt="Digital library" width="50px" height="50px" />Digital Library</div></Link>
                
                 <Link to="/student-certification-registration"><div className="card"> <img src={certificationIcon} alt="certification" width="50px" height="50px" />Register for Certification</div></Link>
               
                 {/* */}
            </div>
        </div>
    </div>
  );
}

export default StudentDashboard;
