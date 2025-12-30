// src/pages/AdminMessaging.js
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


function AdminMessaging() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  const { students, staffs, adminMessages, setAdminMessages, loading, error } = useData();

  const [recipientType, setRecipientType] = useState('allStudents');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalAlert, setIsModalAlert] = useState(false);
  const [modalAction, setModalAction] = useState(() => {});

  // Protect the route
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.type === 'admin') {
      setLoggedInAdmin(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    if (!messageSubject.trim()) {
      errors.messageSubject = 'Subject is required.';
    }
    if (!messageBody.trim()) {
      errors.messageBody = 'Message body is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    let recipients = [];
    if (recipientType === 'allStudents') {
      recipients = students.map(s => ({
        id: s.admissionNo,
        name: `${s.firstName} ${s.lastName}`,
        type: 'student'
      }));
    } else if (recipientType === 'allStaff') {
      recipients = staffs.map(s => ({
        id: s.staffId,
        name: `${s.firstname} ${s.surname}`,
        type: 'staff'
      }));
    } else if (selectedRecipientId) {
      const recipient = [...students, ...staffs].find(r => r.admissionNo === selectedRecipientId || r.staffId === selectedRecipientId);
      if (recipient) {
        recipients.push({
          id: selectedRecipientId,
          name: `${recipient.firstName || recipient.firstname} ${recipient.lastName || recipient.surname}`,
          type: recipient.type
        });
      }
    }

    if (recipients.length === 0) {
      setModalMessage('No recipients found for the selected option.');
      setIsModalAlert(true);
      setIsModalOpen(true);
      return;
    }

    const newMessage = {
      subject: messageSubject,
      body: messageBody,
      from: loggedInAdmin.username,
      fromId: loggedInAdmin.staffId,
      to: recipients.map(r => r.id),
      toNames: recipients.map(r => r.name),
      timestamp: serverTimestamp(),
      type: 'message'
    };

    try {
      // Add message to Firestore
      const docRef = await addDoc(collection(db, "adminMessages"), newMessage);
      console.log("Document written with ID: ", docRef.id);

      // Reset form
      setMessageSubject('');
      setMessageBody('');
      setSelectedRecipientId('');
      setRecipientType('allStudents');

      setModalMessage('Message sent successfully!');
      setIsModalAlert(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error sending message:", error);
      setModalMessage(`Failed to send message: ${error.message}`);
      setIsModalAlert(true);
      setIsModalOpen(true);
    }
  };

  // Helper functions for modal control
  const showConfirm = (msg, action) => {
    setModalMessage(msg);
    setModalAction(() => action);
    setIsModalAlert(false);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalMessage('');
    setModalAction(() => {});
  };

  const deleteMessage = async (messageId) => {
    showConfirm('Are you sure you want to delete this message?', async () => {
      try {
        // Implement delete logic with Firebase
        setModalMessage('Deletion successful!');
        setIsModalAlert(true);
      } catch (error) {
        setModalMessage(`Failed to delete message: ${error.message}`);
        setIsModalAlert(true);
      } finally {
        handleModalClose();
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const sortedMessages = [...adminMessages].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="admin-messaging-page">
      <ConfirmModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={isModalAlert ? handleModalClose : modalAction}
        onCancel={handleModalClose}
        isAlert={isModalAlert}
      />
      <div className="admin-content">
        <h2>Admin Messaging</h2>
        <form onSubmit={handleSendMessage} className="messaging-form">
          <div className="form-group">
            <label htmlFor="recipientType" className="form-label">Recipient Type:</label>
            <select
              id="recipientType"
              value={recipientType}
              onChange={(e) => {
                setRecipientType(e.target.value);
                setSelectedRecipientId(''); // Reset recipient ID when type changes
              }}
              className="form-select"
            >
              <option value="allStudents">All Students</option>
              <option value="allStaff">All Staff</option>
              <option value="individual">Individual</option>
            </select>
          </div>

          {recipientType === 'individual' && (
            <div className="form-group">
              <label htmlFor="selectedRecipient" className="form-label">Select Recipient:</label>
              <select
                id="selectedRecipient"
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                className="form-select"
                required
              >
                <option value="">-- Select Recipient --</option>
                {students.map(s => (
                  <option key={s.admissionNo} value={s.admissionNo}>{s.firstName} {s.lastName} (Student)</option>
                ))}
                {staffs.map(s => (
                  <option key={s.staffId} value={s.staffId}>{s.firstname} {s.surname} (Staff)</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group form-group-full">
            <label htmlFor="messageSubject" className="form-label">Subject:</label>
            <input
              type="text"
              id="messageSubject"
              value={messageSubject}
              onChange={(e) => { setMessageSubject(e.target.value); setFormErrors(prev => ({ ...prev, messageSubject: '' })); }}
              className={`form-input ${formErrors.messageSubject ? 'form-input-error' : ''}`}
              required
            />
            {formErrors.messageSubject && <p className="error-message">{formErrors.messageSubject}</p>}
          </div>
          <div className="form-group form-group-full">
            <label htmlFor="messageBody" className="form-label">Message:</label>
            <textarea
              id="messageBody"
              value={messageBody}
              onChange={(e) => { setMessageBody(e.target.value); setFormErrors(prev => ({ ...prev, messageBody: '' })); }}
              rows="5"
              className={`form-input ${formErrors.messageBody ? 'form-input-error' : ''}`}
              required
            ></textarea>
            {formErrors.messageBody && <p className="error-message">{formErrors.messageBody}</p>}
          </div>
          <div className="form-actions form-group-full">
            <button type="submit" className="form-submit-btn">
              Send Message
            </button>
          </div>
        </form>
      </div>

      <div className="admin-messaging-list">
        <h3>Sent Messages</h3>
        <div className="message-list-container">
          {sortedMessages.length > 0 ? (
            sortedMessages.map(msg => (
              <div key={msg.id} className="message-card">
                <div className="message-header">
                  <span className="message-subject">{msg.subject}</span>
                  <span className="message-date">{msg.timestamp?.toDate().toLocaleString()}</span>
                </div>
                <div className="message-recipients">
                  <strong>To:</strong> {msg.toNames.join(', ')}
                </div>
                <div className="message-body">
                  {msg.body}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteMessage(msg.id)}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="no-data">No messages sent yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMessaging;