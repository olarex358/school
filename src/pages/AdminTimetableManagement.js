// src/pages/AdminTimetableManagement.js (Complete code as provided previously)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function AdminTimetableManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Data from localStorage
  // ENSURE THIS IS PLURAL: 'schoolPortalTimetables'
  const [timetableEntries, setTimetableEntries] = useLocalStorage('schoolPortalTimetables', []);
  const [students] = useLocalStorage('schoolPortalStudents', []); // To get unique classes
  const [subjects] = useLocalStorage('schoolPortalSubjects', []);
  const [staffs] = useLocalStorage('schoolPortalStaff', []); // To get teachers

  // Form states
  const [timetableForm, setTimetableForm] = useState({
    classSelect: '',
    subjectSelect: '',
    teacherSelect: '', // staffId of the teacher
    day: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editEntryId, setEditEntryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect the route
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'admin') {
      setLoggedInAdmin(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Derived data for dropdowns
  const uniqueClasses = [...new Set(students.map(s => s.studentClass))].sort();
  const availableTeachers = staffs.filter(s => s.role.includes('Teacher')); // Only show staff with 'Teacher' role
  const uniqueSubjects = [...new Set(subjects.map(s => s.subjectCode))].sort();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Helper functions
  const getTeacherName = (staffId) => {
    const teacher = staffs.find(s => s.staffId === staffId);
    return teacher ? `${teacher.firstname} ${teacher.surname} (${teacher.staffId})` : 'Unknown Teacher';
  };

  const getSubjectName = (subjectCode) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode);
    return subject ? subject.subjectName : subjectCode;
  };

  const validateForm = () => {
    let errors = {};
    if (!timetableForm.classSelect) errors.classSelect = 'Class is required.';
    if (!timetableForm.subjectSelect) errors.subjectSelect = 'Subject is required.';
    if (!timetableForm.teacherSelect) errors.teacherSelect = 'Teacher is required.';
    if (!timetableForm.day) errors.day = 'Day is required.';
    if (!timetableForm.startTime) errors.startTime = 'Start time is required.';
    if (!timetableForm.endTime) errors.endTime = 'End time is required.';
    if (!timetableForm.location.trim()) errors.location = 'Location is required.';

    if (timetableForm.startTime && timetableForm.endTime) {
      if (timetableForm.startTime >= timetableForm.endTime) {
        errors.endTime = 'End time must be after start time.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setTimetableForm(prev => ({ ...prev, [id]: value }));
    setFormErrors(prev => ({ ...prev, [id]: '' })); // Clear error on change
    setMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
      return;
    }

    const entryToAddOrUpdate = {
      ...timetableForm,
      id: isEditing ? editEntryId : Date.now(), // Use existing ID or generate new
      timestamp: new Date().toISOString()
    };

    // Check for overlaps for the same class and day
    const isOverlap = timetableEntries.some(entry =>
      entry.id !== entryToAddOrUpdate.id && // Don't check against itself during edit
      entry.classSelect === entryToAddOrUpdate.classSelect &&
      entry.day === entryToAddOrUpdate.day &&
      (
        (entryToAddOrUpdate.startTime < entry.endTime && entryToAddOrUpdate.endTime > entry.startTime)
      )
    );

    if (isOverlap) {
      setMessage({ type: 'error', text: 'This timetable entry overlaps with an existing entry for the same class and day. Please adjust times.' });
      return;
    }

    if (isEditing) {
      setTimetableEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === editEntryId ? entryToAddOrUpdate : entry
        )
      );
      setMessage({ type: 'success', text: 'Timetable entry updated successfully!' });
    } else {
      setTimetableEntries(prevEntries => [...prevEntries, entryToAddOrUpdate]);
      setMessage({ type: 'success', text: 'New timetable entry added successfully!' });
    }

    // Reset form
    setTimetableForm({
      classSelect: '',
      subjectSelect: '',
      teacherSelect: '',
      day: '',
      startTime: '',
      endTime: '',
      location: '',
    });
    setIsEditing(false);
    setEditEntryId(null);
    setFormErrors({});
  };

  const editEntry = (idToEdit) => {
    const entry = timetableEntries.find(e => e.id === idToEdit);
    if (entry) {
      setTimetableForm(entry);
      setIsEditing(true);
      setEditEntryId(idToEdit);
      setMessage(null);
      setFormErrors({});
    }
  };

  const deleteEntry = (idToDelete) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      setTimetableEntries(prevEntries => prevEntries.filter(entry => entry.id !== idToDelete));
      setMessage({ type: 'success', text: 'Timetable entry deleted successfully!' });
    }
  };

  const clearForm = () => {
    setTimetableForm({
      classSelect: '',
      subjectSelect: '',
      teacherSelect: '',
      day: '',
      startTime: '',
      endTime: '',
      location: '',
    });
    setIsEditing(false);
    setEditEntryId(null);
    setFormErrors({});
    setMessage(null);
  };

  const filteredEntries = timetableEntries.filter(entry =>
    entry.classSelect.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSubjectName(entry.subjectSelect).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTeacherName(entry.teacherSelect).toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.location.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Sort by day of week, then by class, then by start time
    const dayOrder = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    if (dayOrder !== 0) return dayOrder;
    const classOrder = a.classSelect.localeCompare(b.classSelect);
    if (classOrder !== 0) return classOrder;
    return a.startTime.localeCompare(b.startTime);
  });
  
  if (!loggedInAdmin) {
    return <div className="content-section">Access Denied. Please log in as an Admin.</div>;
  }

  return (
    <div className="content-section">
      <h1>Timetable Management</h1>
      <div className="sub-section">
        <h2>{isEditing ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}</h2>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="classSelect" style={{ display: 'block', marginBottom: '5px' }}>Class:</label>
            <select
              id="classSelect"
              value={timetableForm.classSelect}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.classSelect ? 'red' : '' }}
            >
              <option value="">-- Select Class --</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
              {uniqueClasses.length === 0 && <option value="" disabled>No classes available. Add students.</option>}
            </select>
            {formErrors.classSelect && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.classSelect}</p>}
          </div>

          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="subjectSelect" style={{ display: 'block', marginBottom: '5px' }}>Subject:</label>
            <select
              id="subjectSelect"
              value={timetableForm.subjectSelect}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.subjectSelect ? 'red' : '' }}
            >
              <option value="">-- Select Subject --</option>
              {uniqueSubjects.map(subCode => (
                <option key={subCode} value={subCode}>{getSubjectName(subCode)}</option>
              ))}
              {uniqueSubjects.length === 0 && <option value="" disabled>No subjects available. Add subjects.</option>}
            </select>
            {formErrors.subjectSelect && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.subjectSelect}</p>}
          </div>

          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="teacherSelect" style={{ display: 'block', marginBottom: '5px' }}>Teacher:</label>
            <select
              id="teacherSelect"
              value={timetableForm.teacherSelect}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.teacherSelect ? 'red' : '' }}
            >
              <option value="">-- Select Teacher --</option>
              {availableTeachers.map(teacher => (
                <option key={teacher.staffId} value={teacher.staffId}>{getTeacherName(teacher.staffId)}</option>
              ))}
              {availableTeachers.length === 0 && <option value="" disabled>No teachers available. Add staff with 'Teacher' role.</option>}
            </select>
            {formErrors.teacherSelect && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.teacherSelect}</p>}
          </div>

          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="day" style={{ display: 'block', marginBottom: '5px' }}>Day:</label>
            <select
              id="day"
              value={timetableForm.day}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.day ? 'red' : '' }}
            >
              <option value="">-- Select Day --</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            {formErrors.day && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.day}</p>}
          </div>

          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="startTime" style={{ display: 'block', marginBottom: '5px' }}>Start Time:</label>
            <input
              type="time"
              id="startTime"
              value={timetableForm.startTime}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.startTime ? 'red' : '' }}
            />
            {formErrors.startTime && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.startTime}</p>}
          </div>

          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="endTime" style={{ display: 'block', marginBottom: '5px' }}>End Time:</label>
            <input
              type="time"
              id="endTime"
              value={timetableForm.endTime}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.endTime ? 'red' : '' }}
            />
            {formErrors.endTime && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.endTime}</p>}
          </div>

          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="location" style={{ display: 'block', marginBottom: '5px' }}>Location:</label>
            <input
              type="text"
              id="location"
              placeholder="e.g., Classroom A, Lab 1"
              value={timetableForm.location}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.location ? 'red' : '' }}
            />
            {formErrors.location && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.location}</p>}
          </div>

          <button type="submit" style={{ flex: '1 1 calc(50% - 7.5px)' }}>{isEditing ? 'Update Entry' : 'Add Entry'}</button>
          <button type="button" onClick={clearForm} style={{ flex: '1 1 calc(50% - 7.5px)', backgroundColor: '#6c757d', borderColor: '#6c757d' }}>Clear Form</button>
        </form>
      </div>

      <div className="sub-section">
        <h2>All Timetable Entries</h2>
        <input
          type="text"
          placeholder="Search by class, subject, teacher, or day"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        />
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Day</th>
                <th>Time</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.classSelect}</td>
                    <td>{getSubjectName(entry.subjectSelect)}</td>
                    <td>{getTeacherName(entry.teacherSelect)}</td>
                    <td>{entry.day}</td>
                    <td>{`${entry.startTime} - ${entry.endTime}`}</td>
                    <td>{entry.location}</td>
                    <td>
                      <button className="action-btn edit-btn" onClick={() => editEntry(entry.id)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => deleteEntry(entry.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No timetable entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminTimetableManagement;