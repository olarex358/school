// src/pages/AdminTimetableManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function AdminTimetableManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Update hooks to get data from the backend
  const [timetableEntries, setTimetableEntries, loadingTimetable] = useLocalStorage('schoolPortalTimetables', [], 'http://localhost:5000/api/schoolPortalTimetables');
  const [students] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  const [subjects] = useLocalStorage('schoolPortalSubjects', [], 'http://localhost:5000/api/schoolPortalSubjects');
  const [staffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');

  const [timetableForm, setTimetableForm] = useState({
    classSelect: '',
    subjectSelect: '',
    teacherSelect: '',
    day: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'Class'
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
  const availableTeachers = staffs.filter(s => s.role.includes('Teacher'));
  const uniqueSubjects = [...new Set(subjects.map(s => s.subjectCode))].sort();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
    setFormErrors(prev => ({ ...prev, [id]: '' }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
      return;
    }
    
    const entryToAddOrUpdate = {
      ...timetableForm,
      timestamp: new Date().toISOString()
    };
    
    try {
      if (isEditing) {
        const response = await fetch(`http://localhost:5000/api/schoolPortalTimetables/${editEntryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryToAddOrUpdate),
        });
        if (response.ok) {
          const updatedEntry = await response.json();
          setTimetableEntries(prevEntries =>
            prevEntries.map(entry =>
              entry._id === updatedEntry._id ? updatedEntry : entry
            )
          );
          setMessage({ type: 'success', text: 'Timetable entry updated successfully!' });
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to update timetable entry.' });
        }
      } else {
        const response = await fetch('http://localhost:5000/api/schoolPortalTimetables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryToAddOrUpdate),
        });
        if (response.ok) {
          const newEntry = await response.json();
          setTimetableEntries(prevEntries => [...prevEntries, newEntry]);
          setMessage({ type: 'success', text: 'New timetable entry added successfully!' });
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to add new timetable entry.' });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
    }
    
    setTimetableForm({
      classSelect: '',
      subjectSelect: '',
      teacherSelect: '',
      day: '',
      startTime: '',
      endTime: '',
      location: '',
      type: 'Class'
    });
    setIsEditing(false);
    setEditEntryId(null);
    setFormErrors({});
  };

  const editEntry = (idToEdit) => {
    const entry = timetableEntries.find(e => e._id === idToEdit);
    if (entry) {
      setTimetableForm(entry);
      setIsEditing(true);
      setEditEntryId(idToEdit);
      setMessage(null);
      setFormErrors({});
    }
  };

  const deleteEntry = async (idToDelete) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/schoolPortalTimetables/${idToDelete}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setTimetableEntries(prevEntries => prevEntries.filter(entry => entry._id !== idToDelete));
          setMessage({ type: 'success', text: 'Timetable entry deleted successfully!' });
        } else {
          const errorData = await response.json();
          setMessage({ type: 'error', text: errorData.message || 'Failed to delete timetable entry.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
      }
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
      type: 'Class'
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
    entry.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.type.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const dayOrder = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    if (dayOrder !== 0) return dayOrder;
    const classOrder = a.classSelect.localeCompare(b.classSelect);
    if (classOrder !== 0) return classOrder;
    return a.startTime.localeCompare(b.startTime);
  });
  
  if (!loggedInAdmin) {
    return <div className="content-section">Access Denied. Please log in as an Admin.</div>;
  }

  if (loadingTimetable) {
    return <div className="content-section">Loading timetable data...</div>;
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
            <label htmlFor="type" style={{ display: 'block', marginBottom: '5px' }}>Entry Type:</label>
            <select
              id="type"
              value={timetableForm.type}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.type ? 'red' : '' }}
            >
              <option value="Class">Class</option>
              <option value="Exam">Exam</option>
              <option value="CA">CA</option>
            </select>
            {formErrors.type && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.type}</p>}
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
                <th>Type</th>
                <th>Day</th>
                <th>Time</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map(entry => (
                  <tr key={entry._id}>
                    <td>{entry.classSelect}</td>
                    <td>{getSubjectName(entry.subjectSelect)}</td>
                    <td>{getTeacherName(entry.teacherSelect)}</td>
                    <td>{entry.type}</td>
                    <td>{entry.day}</td>
                    <td>{`${entry.startTime} - ${entry.endTime}`}</td>
                    <td>{entry.location}</td>
                    <td>
                      <button className="action-btn edit-btn" onClick={() => editEntry(entry._id)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => deleteEntry(entry._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No timetable entries found.</td>
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