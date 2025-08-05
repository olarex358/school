// src/pages/StaffTimetable.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage'; // Import useLocalStorage

// Reusing calendar icon for timetable, or you can use a specific timetable icon if available
import timetableIcon from '../icon/calender.png';

function StaffTimetable() {
  const navigate = useNavigate();
  const [loggedInStaff, setLoggedInStaff] = useState(null);

  // Load all timetable entries, subjects, and staff (for teacher names)
  // NOW CORRECTLY READING FROM PLURAL KEY: 'schoolPortalTimetables'
  const [allTimetableEntries, , loadingTimetable] = useLocalStorage('schoolPortalTimetables', [], 'http://localhost:5000/api/schoolPortalTimetables');
  const [subjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');
  const [staffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');

  const [staffSpecificTimetable, setStaffSpecificTimetable] = useState([]);
  const [daysOfWeek] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

  // Protect the route and filter timetable
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'staff') {
      setLoggedInStaff(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);


  useEffect(() => {
    if (loggedInStaff && allTimetableEntries.length > 0) {
      const teacherAssignedClasses = loggedInStaff.assignedClasses || [];
      const teacherAssignedSubjects = loggedInStaff.assignedSubjects || [];

      const filteredForStaff = allTimetableEntries.filter(
        entry => {
          // Robust comparison: convert both sides to lowercase and trim spaces
          const entryClassLower = entry.classSelect ? entry.classSelect.toLowerCase().trim() : '';
          const entrySubjectLower = entry.subjectSelect ? entry.subjectSelect.toLowerCase().trim() : '';

          // Check if assigned classes/subjects include the entry's class/subject (case-insensitively)
          const isAssignedClass = teacherAssignedClasses.some(cls => cls.toLowerCase().trim() === entryClassLower);
          const isAssignedSubject = teacherAssignedSubjects.some(sub => sub.toLowerCase().trim() === entrySubjectLower);

          return (
            isAssignedClass &&
            isAssignedSubject &&
            entry.teacherSelect === loggedInStaff.staffId // Ensure it's for this specific teacher
          );
        }
      ).sort((a, b) => {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayComparison !== 0) return dayComparison;
        
        return a.startTime.localeCompare(b.startTime);
      });
      setStaffSpecificTimetable(filteredForStaff);
    } else {
      setStaffSpecificTimetable([]);
    }
  }, [loggedInStaff, allTimetableEntries]);

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

  if (!loggedInStaff || loadingTimetable) {
    return <div className="content-section">Loading staff timetable...</div>;
  }

  // Generate unique sorted time slots from the entries for column headers
  const uniqueTimeSlots = [...new Set(staffSpecificTimetable.map(entry => `${entry.startTime} - ${entry.endTime}`))].sort();

  // Create a grid representation for easier rendering
  const timetableGrid = {};
  daysOfWeek.forEach(day => {
      timetableGrid[day] = {};
      uniqueTimeSlots.forEach(slot => {
          timetableGrid[day][slot] = null; // Initialize as empty
      });
  });

  staffSpecificTimetable.forEach(entry => {
      const slot = `${entry.startTime} - ${entry.endTime}`;
      if (timetableGrid[entry.day] && timetableGrid[entry.day][slot] === null) {
          timetableGrid[entry.day][slot] = entry;
      }
  });

  return (
    <div className="content-section">
      <h1>My Teaching Timetable</h1>
      <p>Welcome, {loggedInStaff.firstname} {loggedInStaff.surname}! Here is your teaching timetable:</p>

      {staffSpecificTimetable.length > 0 ? (
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
                        // NEW: Conditional background color based on entry type
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
                            {/* NEW: Display the type of entry */}
                            <p style={{ fontWeight: 'bold', margin: '5px 0 0', fontSize: '0.9em', fontStyle: 'italic' }}>{entry.type}</p>
                            <small style={{ display: 'block', marginTop: '5px' }}>{entry.classSelect}</small>
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
        <p>No timetable entries found for your assigned classes and subjects yet. Please contact administration.</p>
      )}

      <p style={{ marginTop: '20px' }}>
        Always refer to official school announcements for any timetable changes.
      </p>
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StaffTimetable;