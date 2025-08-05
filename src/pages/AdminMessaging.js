// src/pages/AdminMessaging.js
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';

function AdminMessaging() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Update hooks to get data from the backend
  const [students] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  const [staffs] = useLocalStorage('schoolPortalStaff', [], 'http://localhost:5000/api/schoolPortalStaff');
  const [adminMessages, setAdminMessages, loadingMessages] = useLocalStorage('schoolPortalAdminMessages', [], 'http://localhost:5000/api/schoolPortalAdminMessages');
  const { addNotification } = useNotifications();

  // Form states
  const [recipientType, setRecipientType] = useState('allStudents');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  // Form feedback states
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);

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
    if (!messageSubject.trim()) {
      errors.messageSubject = 'Subject cannot be empty.';
    }
    if (!messageBody.trim()) {
      errors.messageBody = 'Message body cannot be empty.';
    }
    if (recipientType === 'individualStudent' && !selectedRecipientId) {
      errors.selectedRecipientId = 'Please select a student.';
    }
    if (recipientType === 'individualStaff' && !selectedRecipientId) {
      errors.selectedRecipientId = 'Please select a staff member.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
      return;
    }
    const newMessage = {
      sender: loggedInAdmin ? loggedInAdmin.username : 'Admin',
      subject: messageSubject,
      body: messageBody,
      timestamp: new Date().toISOString(),
      recipientType: recipientType,
      recipientId: selectedRecipientId || null,
      isRead: false,
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/schoolPortalAdminMessages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        const createdMessage = await response.json();
        setAdminMessages(prevMessages => [...prevMessages, createdMessage]);
        
        let notificationTitle = `New Admin Message: ${messageSubject}`;
        let notificationBody = messageBody;
        
        if (recipientType.includes('individual')) {
          const recipientName = recipientType === 'individualStudent'
            ? (students.find(s => s.admissionNo === selectedRecipientId)?.firstName + ' ' + students.find(s => s.admissionNo === selectedRecipientId)?.lastName || selectedRecipientId)
            : (staffs.find(s => s.staffId === selectedRecipientId)?.firstname + ' ' + staffs.find(s => s.staffId === selectedRecipientId)?.surname || selectedRecipientId);
          addNotification({
            title: notificationTitle,
            body: notificationBody,
            recipientType: recipientType,
            recipientId: selectedRecipientId
          });
          setMessage({ type: 'success', text: `Message and notification sent to ${recipientName} (simulated email/WhatsApp).` });
        } else if (recipientType.includes('all')) {
          addNotification({
            title: notificationTitle,
            body: notificationBody,
            recipientType: recipientType,
            recipientId: null
          });
          setMessage({ type: 'success', text: `Message and notification sent to all ${recipientType.replace('all', '')} (simulated).` });
        } else {
          setMessage({ type: 'success', text: 'Message sent successfully (simulated).' });
        }
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to send message.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please check your network connection.' });
    }

    setSelectedRecipientId('');
    setMessageSubject('');
    setMessageBody('');
    setFormErrors({});
  };

  const getRecipientOptions = () => {
    if (recipientType === 'individualStudent') {
      return students.map(s => ({ id: s.admissionNo, name: `${s.firstName} ${s.lastName} (${s.admissionNo})` }));
    } else if (recipientType === 'individualStaff') {
      return staffs.map(s => ({ id: s.staffId, name: `${s.firstname} ${s.surname} (${s.staffId})` }));
    }
    return [];
  };

  if (!loggedInAdmin) {
    return <div className="content-section">Access Denied. Please log in as an Admin.</div>;
  }

  if (loadingMessages) {
    return <div className="content-section">Loading messages...</div>;
  }

  return (
    <div className="content-section">
      <h1>Admin Messaging</h1>
      <p>Compose and send internal messages to students and staff.</p>
      <div className="sub-section">
        <h2>Compose New Message</h2>
        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', color: 'white', backgroundColor: message.type === 'success' ? '#28a745' : '#dc3545' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSendMessage}>
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="recipientType">Send To:</label>
            <select
              id="recipientType"
              value={recipientType}
              onChange={(e) => { setSelectedRecipientId(''); setRecipientType(e.target.value); setFormErrors({}); }}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="allStudents">All Students</option>
              <option value="individualStudent">Individual Student</option>
              <option value="allStaff">All Staff</option>
              <option value="individualStaff">Individual Staff</option>
            </select>
          </div>
          {(recipientType === 'individualStudent' || recipientType === 'individualStaff') && (
            <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label htmlFor="selectedRecipientId">Select Recipient:</label>
              <select
                id="selectedRecipientId"
                value={selectedRecipientId}
                onChange={(e) => { setSelectedRecipientId(e.target.value); setFormErrors(prev => ({ ...prev, selectedRecipientId: '' })); }}
                style={{ padding: '8px', borderRadius: '4px', border: formErrors.selectedRecipientId ? 'red' : '1px solid #ccc' }}
              >
                <option value="">-- Select --</option>
                {getRecipientOptions().map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              {formErrors.selectedRecipientId && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.selectedRecipientId}</p>}
            </div>
          )}
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="messageSubject">Subject:</label>
            <input
              type="text"
              id="messageSubject"
              value={messageSubject}
              onChange={(e) => { setMessageSubject(e.target.value); setFormErrors(prev => ({ ...prev, messageSubject: '' })); }}
              style={{ padding: '8px', borderRadius: '4px', border: formErrors.messageSubject ? 'red' : '1px solid #ccc' }}
              required
            />
            {formErrors.messageSubject && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.messageSubject}</p>}
          </div>
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="messageBody">Message:</label>
            <textarea
              id="messageBody"
              value={messageBody}
              onChange={(e) => { setMessageBody(e.target.value); setFormErrors(prev => ({ ...prev, messageBody: '' })); }}
              rows="5"
              style={{ padding: '8px', borderRadius: '4px', border: formErrors.messageBody ? 'red' : '1px solid #ccc' }}
              required
            ></textarea>
            {formErrors.messageBody && <p style={{ color: 'red', fontSize: '0.8em' }}>{formErrors.messageBody}</p>}
          </div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminMessaging;