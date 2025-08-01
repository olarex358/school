// src/pages/StudentTimetable.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage'; // Import useLocalStorage

// Reusing calendar icon for timetable, or you can use a specific timetable icon if available
import timetableIcon from '../icon/calender.png';

function StudentTimetable() {
  const navigate = useNavigate();
  const [loggedInStudent, setLoggedInStudent] = useState(null);

  // Load all timetable entries, subjects, and staff (for teacher names)
  // NOW CORRECTLY READING FROM PLURAL KEY: 'schoolPortalTimetables'
  const [allTimetableEntries] = useLocalStorage('schoolPortalTimetables', []);
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);
  const [staffs] = useLocalStorage('schoolPortalStaff', []);

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
      // Defensive check for studentClass, then convert to lowercase and trim
      const studentClassLower = loggedInStudent.studentClass ? loggedInStudent.studentClass.toLowerCase().trim() : '';
      
      const filteredForStudent = allTimetableEntries.filter(
        entry => {
          // Robust comparison: Ensure entry.classSelect exists before calling toLowerCase
          const entryClassLower = entry.classSelect ? entry.classSelect.toLowerCase().trim() : '';
          return entryClassLower === studentClassLower;
        }
      ).sort((a, b) => {
        // Sort by Day then by Start Time
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayComparison !== 0) return dayComparison;
        
        // Correctly sorting by startTime
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
    navigate('/login');
  };

  if (!loggedInStudent) {
    return <div className="content-section">Loading student timetable...</div>;
  }

  // Generate unique sorted time slots from the entries for column headers
  // Now using entry.startTime and entry.endTime
  const uniqueTimeSlots = [...new Set(allTimetableEntries.map(entry => `${entry.startTime} - ${entry.endTime}`))].sort();

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
      <h1>My Class Timetable</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here is your timetable for {loggedInStudent.studentClass}:</p>

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
                    // src/pages/StudentTimetable.js (partial view)
// ...
return (
  <td key={day} style={{
    // NEW: Conditional background color based on entry type
    backgroundColor: entry ? (entry.type === 'Exam' ? 'var(--error-color)' : entry.type === 'CA' ? 'orange' : 'var(--primary-blue)') : '#f0f0f0',
    color: entry ? 'white' : 'var(--text-color-dark)',
    border: entry ? '1px solid var(--primary-blue-dark)' : '1px dashed #ccc',
    padding: '10px',
    textAlign: 'center',
    verticalAlign: 'middle',
    minWidth: '120px'
  }}>
    {entry ? (
      <>
        <p style={{ fontWeight: 'bold', margin: '0' }}>{getSubjectName(entry.subjectSelect)}</p>
        {/* NEW: Display the type of entry */}
        <p style={{ fontWeight: 'bold', margin: '5px 0 0', fontSize: '0.9em', fontStyle: 'italic' }}>{entry.type}</p>
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
        <p>No timetable entries found for your class ({loggedInStudent.studentClass}) yet. Please contact administration.</p>
      )}

      <p style={{ marginTop: '20px' }}>
        Always refer to official school announcements for any timetable changes.
      </p>
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentTimetable;