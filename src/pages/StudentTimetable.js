// src/pages/StudentTimetable.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

// Reusing calendar icon for timetable
import timetableIcon from '../icon/calender.png';

function StudentTimetable() {
  const navigate = useNavigate();
  const [loggedInStudent, setLoggedInStudent] = useState(null);

  // Load all timetable entries and subjects
  const [allTimetableEntries, , loadingTimetable] = useLocalStorage('schoolPortalTimetables', [], 'http://localhost:5000/api/schoolPortalTimetables');
  const [subjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');
  const [staffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');

  const [studentSpecificTimetable, setStudentSpecificTimetable] = useState([]);
  const [daysOfWeek] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

  // Protect the route and filter timetable
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'student') {
      setLoggedInStudent(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (loggedInStudent && allTimetableEntries.length > 0) {
      const filteredForStudent = allTimetableEntries.filter(
        entry => entry.classSelect === loggedInStudent.studentClass
      ).sort((a, b) => {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayComparison !== 0) return dayComparison;
        
        return a.startTime.localeCompare(b.startTime);
      });
      setStudentSpecificTimetable(filteredForStudent);
    } else {
      setStudentSpecificTimetable([]);
    }
  }, [loggedInStudent, allTimetableEntries]);

  // Helper functions for display
  const getSubjectName = (subjectCode) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : subjectCode;
  };

  const getTeacherName = (staffId) => {
    const teacher = staffs.find(s => s.staffId === staffId);
    return teacher ? `${teacher.firstname} ${teacher.surname}` : 'Unknown Teacher';
  };
  
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };
  
  if (!loggedInStudent || loadingTimetable) {
    return <div className="content-section">Loading timetable...</div>;
  }

  // Generate unique sorted time slots from the entries for column headers
  const uniqueTimeSlots = [...new Set(studentSpecificTimetable.map(entry => `${entry.startTime} - ${entry.endTime}`))].sort();

  // Create a grid representation for easier rendering
  const timetableGrid = {};
  daysOfWeek.forEach(day => {
      timetableGrid[day] = {};
      uniqueTimeSlots.forEach(slot => {
          timetableGrid[day][slot] = null; // Initialize as empty
      });
  });

  studentSpecificTimetable.forEach(entry => {
      const slot = `${entry.startTime} - ${entry.endTime}`;
      if (timetableGrid[entry.day] && timetableGrid[entry.day][slot] === null) {
          timetableGrid[entry.day][slot] = entry;
      }
  });

  return (
    <div className="content-section">
      <h1>My Timetable</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here is your class timetable:</p>
      
      {studentSpecificTimetable.length > 0 ? (
        <div className="timetable-responsive-table">
          <table className="timetable-table">
            <thead>
              <tr>
                <th>Time Slot</th>
                {daysOfWeek.map(day => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueTimeSlots.map(slot => (
                <tr key={slot}>
                  <td><strong>{slot}</strong></td>
                  {daysOfWeek.map(day => {
                    const entry = timetableGrid[day][slot];
                    return (
                      <td key={day} style={{
                        backgroundColor: entry ? (entry.type === 'Exam' ? 'var(--error-color)' : entry.type === 'CA' ? 'orange' : 'var(--secondary-teal)') : '#f0f0f0',
                        color: entry ? 'white' : 'var(--text-color-dark)',
                        border: entry ? '1px solid var(--secondary-teal)' : '1px dashed #ccc',
                        padding: '10px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        minWidth: '120px'
                      }}>
                        {entry ? (
                          <>
                            <p style={{ fontWeight: 'bold', margin: '0' }}>{getSubjectName(entry.subjectSelect)}</p>
                            <small style={{ display: 'block', marginTop: '5px' }}>{getTeacherName(entry.teacherSelect)}</small>
                            <small style={{ display: 'block', marginTop: '2px', fontStyle: 'italic' }}>({entry.location})</small>
                          </>
                        ) : (
                          <span style={{ color: '#888' }}>-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      ) : (
        <p>No timetable entries found for your class yet. Please contact administration.</p>
      )}

      <p style={{ marginTop: '20px' }}>
        Always refer to official school announcements for any timetable changes.
      </p>
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentTimetable;