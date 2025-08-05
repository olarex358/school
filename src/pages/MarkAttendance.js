// src/pages/MarkAttendance.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function MarkAttendance() {
  const navigate = useNavigate();
  const [loggedInStaff, setLoggedInStaff] = useState(null);

  // Data from localStorage
  const [students] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage('schoolPortalAttendance', [], 'http://localhost:5000/api/schoolPortalAttendance');
  const [staffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');

  // Form states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [currentAttendance, setCurrentAttendance] = useState({}); // { studentId: status, ... }
  const [message, setMessage] = useState(null); // Success/Error messages

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    // Ensure logged-in user is staff and has 'Teacher' role
    if (user && user.type === 'staff' && user.role.includes('Teacher')) {
      setLoggedInStaff(user);
    } else {
      navigate('/login'); // Redirect if not authorized
    }
  }, [navigate]);

  // Derive unique classes assigned to the logged-in teacher
  const teacherAssignedClasses = loggedInStaff?.assignedClasses || [];
  const uniqueClasses = [...new Set(teacherAssignedClasses)].sort();

  // Effect to filter students when class or students data changes
  useEffect(() => {
    if (selectedClass) {
      const filtered = students.filter(student => student.studentClass === selectedClass);
      setStudentsInClass(filtered);

      // Initialize attendance for this class and date
      const existingAttendanceForDate = attendanceRecords.filter(
        rec => rec.date === selectedDate && rec.class === selectedClass
      );

      const initialAttendanceState = {};
      filtered.forEach(student => {
        const existingRecord = existingAttendanceForDate.find(
          rec => rec.studentId === student.admissionNo
        );
        initialAttendanceState[student.admissionNo] = existingRecord ? existingRecord.status : 'Present'; // Default to Present
      });
      setCurrentAttendance(initialAttendanceState);
    } else {
      setStudentsInClass([]);
      setCurrentAttendance({});
    }
    setMessage(null); // Clear messages when class/date changes
  }, [selectedClass, selectedDate, students, attendanceRecords]);


  const handleAttendanceChange = (studentId, status) => {
    setCurrentAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedClass || !selectedDate) {
      setMessage({ type: 'error', text: 'Please select a class and date.' });
      return;
    }

    if (studentsInClass.length === 0) {
      setMessage({ type: 'error', text: 'No students found in the selected class. Cannot mark attendance.' });
      return;
    }

    const newRecords = [];
    studentsInClass.forEach(student => {
      newRecords.push({
        id: `${selectedDate}-${selectedClass}-${student.admissionNo}`, // Unique ID for attendance record
        date: selectedDate,
        class: selectedClass,
        studentId: student.admissionNo,
        status: currentAttendance[student.admissionNo] || 'Present', // Ensure a status is recorded
        markedBy: loggedInStaff.staffId,
        timestamp: new Date().toISOString()
      });
    });

    try {
        // Clear existing records for the day/class combination
        const recordsToDelete = attendanceRecords.filter(
            rec => rec.date === selectedDate && rec.class === selectedClass
        );
        const deletePromises = recordsToDelete.map(rec =>
            fetch(`http://localhost:5000/api/schoolPortalAttendance/${rec._id}`, {
                method: 'DELETE',
            })
        );
        await Promise.all(deletePromises);

        // Add the new records
        const createPromises = newRecords.map(rec =>
            fetch('http://localhost:5000/api/schoolPortalAttendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rec),
            })
        );
        await Promise.all(createPromises);

        // Fetch the updated list from the backend to refresh state
        const updatedResponse = await fetch('http://localhost:5000/api/schoolPortalAttendance');
        if (updatedResponse.ok) {
            const updatedRecords = await updatedResponse.json();
            setAttendanceRecords(updatedRecords);
            setMessage({ type: 'success', text: `Attendance for ${selectedClass} on ${selectedDate} saved successfully!` });
        } else {
            setMessage({ type: 'error', text: 'Failed to save attendance. Please try again.' });
        }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
    }
  };

  const getStudentName = (admissionNo) => {
    const student = students.find(s => s.admissionNo === admissionNo);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  if (!loggedInStaff) {
    return <div className="content-section">Access Denied. Please log in as a Teacher.</div>;
  }

  // Disable submit if no class or date, or no students
  const isSubmitDisabled = !selectedClass || !selectedDate || studentsInClass.length === 0;

  return (
    <div className="content-section">
      <h1>Mark Student Attendance</h1>
      <p>Welcome, {loggedInStaff.firstname} {loggedInStaff.surname}! Mark attendance for your assigned classes.</p>

      <div className="sub-section">
        <h2>Select Class and Date</h2>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmitAttendance}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="classSelect">Select Class:</label>
            <select
              id="classSelect"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            >
              <option value="">-- Select Class --</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
              {uniqueClasses.length === 0 && <option value="" disabled>No classes assigned to you.</option>}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="attendanceDate">Select Date:</label>
            <input
              type="date"
              id="attendanceDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          {selectedClass && selectedDate && studentsInClass.length > 0 && (
            <div className="table-container" style={{ marginTop: '20px' }}>
              <h3>Students in {selectedClass} on {selectedDate}</h3>
              <table>
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Student Name</th>
                    <th>Admission No.</th>
                    <th>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsInClass.map((student, index) => (
                    <tr key={student._id}>
                      <td>{index + 1}</td>
                      <td>{getStudentName(student.admissionNo)}</td>
                      <td>{student.admissionNo}</td>
                      <td>
                        <select
                          value={currentAttendance[student.admissionNo] || 'Present'}
                          onChange={(e) => handleAttendanceChange(student.admissionNo, e.target.value)}
                          style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button type="submit" disabled={isSubmitDisabled} style={{ marginTop: '20px', opacity: isSubmitDisabled ? 0.6 : 1 }}>
            Save Attendance
          </button>
        </form>
      </div>
      <button onClick={() => navigate('/staff-dashboard')} style={{ marginTop: '20px', backgroundColor: '#6c757d', borderColor: '#6c757d' }}>Back to Dashboard</button>
    </div>
  );
}

export default MarkAttendance;