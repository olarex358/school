// src/pages/AdminCalendarManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function AdminCalendarManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Update hook to get data from the backend
  const [calendarEvents, setCalendarEvents, loadingEvents] = useLocalStorage('schoolPortalCalendarEvents', [], 'http://localhost:5000/api/schoolPortalCalendarEvents');

  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    description: '',
    audience: 'all'
  });
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'admin') {
      setLoggedInAdmin(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const validateForm = () => {
    let errors = {};
    if (!eventForm.title.trim()) errors.title = 'Title is required.';
    if (!eventForm.date) errors.date = 'Date is required.';
    if (!eventForm.description.trim()) errors.description = 'Description is required.';
    if (!eventForm.audience) errors.audience = 'Audience is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setEventForm(prev => ({ ...prev, [id]: value }));
    setFormErrors(prev => ({ ...prev, [id]: '' }));
    setMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
      return;
    }
    const eventToAddOrUpdate = {
      ...eventForm,
      id: isEditing ? editEventId : Date.now(),
      timestamp: new Date().toISOString()
    };
    if (isEditing) {
      setCalendarEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === editEventId ? eventToAddOrUpdate : event
        )
      );
      setMessage({ type: 'success', text: 'Calendar event updated successfully!' });
    } else {
      setCalendarEvents(prevEvents => [...prevEvents, eventToAddOrUpdate]);
      setMessage({ type: 'success', text: 'Calendar event added successfully!' });
    }
    setEventForm({ title: '', date: '', description: '', audience: 'all' });
    setIsEditing(false);
    setEditEventId(null);
    setFormErrors({});
  };

  const editEvent = (idToEdit) => {
    const event = calendarEvents.find(e => e.id === idToEdit);
    if (event) {
      setEventForm(event);
      setIsEditing(true);
      setEditEventId(idToEdit);
      setMessage(null);
      setFormErrors({});
    }
  };

  const deleteEvent = (idToDelete) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setCalendarEvents(prevEvents => prevEvents.filter(event => event.id !== idToDelete));
      setMessage({ type: 'success', text: 'Event deleted successfully!' });
    }
  };

  const clearForm = () => {
    setEventForm({ title: '', date: '', description: '', audience: 'all' });
    setIsEditing(false);
    setEditEventId(null);
    setFormErrors({});
    setMessage(null);
  };

  const filteredEvents = calendarEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.date.includes(searchTerm)
  );

  if (!loggedInAdmin) {
    return <div className="content-section">Access Denied. Please log in as an Admin.</div>;
  }

  if (loadingEvents) {
    return <div className="content-section">Loading calendar events...</div>;
  }

  return (
    <div className="content-section">
      <h1>Calendar Management</h1>
      <div className="sub-section">
        <h2>{isEditing ? 'Edit Calendar Event' : 'Add New Calendar Event'}</h2>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Event Title:</label>
            <input
              type="text"
              id="title"
              value={eventForm.title}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.title ? 'red' : '' }}
            />
            {formErrors.title && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.title}</p>}
          </div>
          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '5px' }}>Date:</label>
            <input
              type="date"
              id="date"
              value={eventForm.date}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.date ? 'red' : '' }}
            />
            {formErrors.date && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.date}</p>}
          </div>
          <div style={{ marginBottom: '10px', flex: '1 1 100%' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
            <textarea
              id="description"
              value={eventForm.description}
              onChange={handleChange}
              required
              rows="3"
              style={{ borderColor: formErrors.description ? 'red' : '' }}
            ></textarea>
            {formErrors.description && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.description}</p>}
          </div>
          <div style={{ marginBottom: '10px', flex: '1 1 calc(50% - 7.5px)' }}>
            <label htmlFor="audience" style={{ display: 'block', marginBottom: '5px' }}>Audience:</label>
            <select
              id="audience"
              value={eventForm.audience}
              onChange={handleChange}
              required
              style={{ borderColor: formErrors.audience ? 'red' : '' }}
            >
              <option value="all">All (Students & Staff)</option>
              <option value="students">Students Only</option>
              <option value="staff">Staff Only</option>
            </select>
            {formErrors.audience && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.audience}</p>}
          </div>
          <button type="submit" style={{ flex: '1 1 calc(50% - 7.5px)' }}>{isEditing ? 'Update Event' : 'Add Event'}</button>
          <button type="button" onClick={clearForm} style={{ flex: '1 1 calc(50% - 7.5px)', backgroundColor: '#6c757d', borderColor: '#6c757d' }}>Clear Form</button>
        </form>
      </div>
      <div className="sub-section">
        <h2>All Calendar Events</h2>
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        />
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Description</th>
                <th>Audience</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{event.date}</td>
                    <td>{event.description}</td>
                    <td>{event.audience.charAt(0).toUpperCase() + event.audience.slice(1)}</td>
                    <td>
                      <button className="action-btn edit-btn" onClick={() => editEvent(event.id)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => deleteEvent(event.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No calendar events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminCalendarManagement;