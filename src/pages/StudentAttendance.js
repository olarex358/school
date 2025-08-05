// src/pages/StudentAttendance.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage'; // Import useLocalStorage

// Import the attendance icon
import attendanceIcon from '../icon/attendance.png';

function StudentAttendance() {
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const navigate = useNavigate();

  // Load all attendance records
  const [allAttendanceRecords, , loadingAttendance] = useLocalStorage('schoolPortalAttendance', [], 'http://localhost:5000/api/schoolPortalAttendance');

  // State to store filtered attendance for the student
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    totalRecords: 0,
    percentage: 0
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    // Ensure user is logged in and is a student
    if (user && user.type === 'student') {
      setLoggedInStudent(user);
    } else {
      navigate('/home'); // Redirect if not logged in as a student
    }
  }, [navigate]);

  useEffect(() => {
    if (loggedInStudent && allAttendanceRecords.length > 0) {
      // Filter records for the logged-in student
      const filteredRecords = allAttendanceRecords.filter(
        record => record.studentId === loggedInStudent.admissionNo
      ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

      setStudentAttendance(filteredRecords);

      // Calculate summary
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      filteredRecords.forEach(record => {
        if (record.status === 'Present') {
          presentCount++;
        } else if (record.status === 'Absent') {
          absentCount++;
        } else if (record.status === 'Late') {
          lateCount++;
        }
      });

      const total = presentCount + absentCount + lateCount;
      const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(2) : 0;

      setAttendanceSummary({
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        totalRecords: total,
        percentage: parseFloat(percentage) // Store as number
      });
    } else {
        setStudentAttendance([]);
        setAttendanceSummary({
            present: 0,
            absent: 0,
            late: 0,
            totalRecords: 0,
            percentage: 0
        });
    }
  }, [loggedInStudent, allAttendanceRecords]);


  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  if (!loggedInStudent || loadingAttendance) {
    return <div className="content-section">Loading attendance records...</div>;
  }

  return (
    <div className="content-section">
      <h1>My Attendance Records</h1>
      <p>Welcome, {loggedInStudent.firstName} {loggedInStudent.lastName}! Here is your attendance overview:</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <img src={attendanceIcon} alt="Attendance Icon" width="80px" height="80px" style={{ marginRight: '20px' }} />
        <div>
          <h3>Attendance Summary</h3>
          <p><strong>Total Days Recorded:</strong> {attendanceSummary.totalRecords}</p>
          <p><strong>Present:</strong> {attendanceSummary.present}</p>
          <p><strong>Absent:</strong> {attendanceSummary.absent}</p>
          <p><strong>Late:</strong> {attendanceSummary.late}</p>
          <p style={{ marginTop: '10px', color: attendanceSummary.percentage >= 80 ? 'green' : attendanceSummary.percentage >= 60 ? 'orange' : 'red', fontWeight: 'bold' }}>
            Attendance Rate: {attendanceSummary.percentage}%
          </p>
        </div>
      </div>

      <h2>Detailed Records</h2>
      {studentAttendance.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Status</th>
                <th>Marked By (Teacher ID)</th>
              </tr>
            </thead>
            <tbody>
              {studentAttendance.map(record => (
                <tr key={record._id}>
                  <td>{record.date}</td>
                  <td>{record.class}</td>
                  <td style={{ color: record.status === 'Present' ? 'green' : record.status === 'Absent' ? 'red' : 'orange' }}>
                    {record.status}
                  </td>
                  <td>{record.markedBy}</td> {/* Display teacher ID for now */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No attendance records found for you yet.</p>
      )}

      <p style={{ marginTop: '20px' }}>
        For any discrepancies or detailed attendance breakdown by subject, please contact your class teacher.
      </p>
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default StudentAttendance;