// src/pages/MarkAttendance.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import ConfirmModal from '../components/ConfirmModal';


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
  const [currentAttendance, setCurrentAttendance] = useState({});
  const [message, setMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalAlert, setIsModalAlert] = useState(false);
  const [modalAction, setModalAction] = useState(() => {});

  const showAlert = (msg) => {
    setModalMessage(msg);
    setIsModalAlert(true);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'staff' && user.role.includes('Teacher')) {
      setLoggedInStaff(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const teacherAssignedClasses = loggedInStaff?.assignedClasses || [];
  const uniqueClasses = [...new Set(teacherAssignedClasses)].sort();

  useEffect(() => {
    if (selectedClass) {
      const filtered = students.filter(student => student.studentClass === selectedClass);
      setStudentsInClass(filtered);

      const existingAttendanceForDate = attendanceRecords.filter(
        rec => rec.date === selectedDate && rec.class === selectedClass
      );

      const initialAttendanceState = {};
      filtered.forEach(student => {
        const existingRecord = existingAttendanceForDate.find(
          rec => rec.studentId === student.admissionNo
        );
        initialAttendanceState[student.admissionNo] = existingRecord ? existingRecord.status : 'Present';
      });
      setCurrentAttendance(initialAttendanceState);
    } else {
      setStudentsInClass([]);
      setCurrentAttendance({});
    }
    setMessage(null);
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
      showAlert('Please select a class and date.');
      return;
    }

    if (studentsInClass.length === 0) {
      showAlert('No students found in the selected class. Cannot mark attendance.');
      return;
    }

    const newRecords = [];
    studentsInClass.forEach(student => {
      newRecords.push({
        id: `${selectedDate}-${selectedClass}-${student.admissionNo}`,
        date: selectedDate,
        class: selectedClass,
        studentId: student.admissionNo,
        status: currentAttendance[student.admissionNo] || 'Present',
        markedBy: loggedInStaff.staffId,
        timestamp: new Date().toISOString()
      });
    });

    try {
        const recordsToDelete = attendanceRecords.filter(
            rec => rec.date === selectedDate && rec.class === selectedClass
        );
        const deletePromises = recordsToDelete.map(rec =>
            fetch(`http://localhost:5000/api/schoolPortalAttendance/${rec._id}`, {
                method: 'DELETE',
            })
        );
        await Promise.all(deletePromises);

        const createPromises = newRecords.map(rec =>
            fetch('http://localhost:5000/api/schoolPortalAttendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rec),
            })
        );
        await Promise.all(createPromises);

        const updatedResponse = await fetch('http://localhost:5000/api/schoolPortalAttendance');
        if (updatedResponse.ok) {
            const updatedRecords = await updatedResponse.json();
            setAttendanceRecords(updatedRecords);
            showAlert(`Attendance for ${selectedClass} on ${selectedDate} saved successfully!`);
        } else {
            showAlert('Failed to save attendance. Please try again.');
        }
    } catch (err) {
      showAlert('An unexpected error occurred. Please check your network connection.');
    }
  };

  const getStudentName = (admissionNo) => {
    const student = students.find(s => s.admissionNo === admissionNo);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  if (!loggedInStaff) {
    return <div className="content-section">Access Denied. Please log in as a Teacher.</div>;
  }

  const isSubmitDisabled = !selectedClass || !selectedDate || studentsInClass.length === 0;

  return (
    <div className="content-section">
      <ConfirmModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        isAlert={isModalAlert}
      />
      <h1>Mark Student Attendance</h1>
      <p>Welcome, {loggedInStaff.firstname} {loggedInStaff.surname}! Mark attendance for your assigned classes.</p>

      <div className="sub-section">
        <h2>Select Class and Date</h2>
        <form onSubmit={handleSubmitAttendance} className="attendance-form">
          <div className="form-group">
            <label htmlFor="classSelect" className="form-label">Select Class:</label>
            <select
              id="classSelect"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
              className="form-input"
            >
              <option value="">-- Select Class --</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
              {uniqueClasses.length === 0 && <option value="" disabled>No classes assigned to you.</option>}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="attendanceDate" className="form-label">Select Date:</label>
            <input
              type="date"
              id="attendanceDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {selectedClass && selectedDate && studentsInClass.length > 0 && (
            <div className="table-container form-group-full">
              <h3 className="table-title">Students in {selectedClass} on {selectedDate}</h3>
              <table className="attendance-table">
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
                    <tr key={student._id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      <td>{index + 1}</td>
                      <td>{getStudentName(student.admissionNo)}</td>
                      <td>{student.admissionNo}</td>
                      <td>
                        <select
                          value={currentAttendance[student.admissionNo] || 'Present'}
                          onChange={(e) => handleAttendanceChange(student.admissionNo, e.target.value)}
                          className="status-select"
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

          <div className="form-actions form-group-full">
            <button type="submit" disabled={isSubmitDisabled} className="form-submit-btn" style={{ opacity: isSubmitDisabled ? 0.6 : 1 }}>
              Save Attendance
            </button>
          </div>
        </form>
      </div>
      <button onClick={() => navigate('/staff-dashboard')} className="back-button">Back to Dashboard</button>
    </div>
  );
}

export default MarkAttendance;
