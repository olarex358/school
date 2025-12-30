// src/pages/AdminFeesManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ConfirmModal from '../components/ConfirmModal';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './AdminFeesManagement.css';

function AdminFeesManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  const { feeRecords, setFeeRecords, students, loading, error } = useData();

  const [feeForm, setFeeForm] = useState({
    feeType: '',
    amount: '',
    dueDate: '',
    status: 'Unpaid',
    paymentChannel: '',
    notes: '',
    isGeneralFee: true,
    studentId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editFeeRecordId, setEditFeeRecordId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState(() => {});
  const [isModalAlert, setIsModalAlert] = useState(false);

  const uniqueFeeTypes = ['Tuition Fee', 'Development Levy', 'Sport & Extra-curricular', 'Exam Fee', 'Other'];
  const paymentChannels = ['Bank Transfer', 'Cash', 'Online Payment Gateway'];

  const showConfirm = (msg, action) => {
    setModalMessage(msg);
    setModalAction(() => action);
    setIsModalAlert(false);
    setIsModalOpen(true);
  };

  const showAlert = (msg, action = () => {}) => {
    setModalMessage(msg);
    setModalAction(() => action);
    setIsModalAlert(true);
    setIsModalOpen(true);
  };

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
    if (!feeForm.feeType) errors.feeType = 'Fee type is required.';
    if (!feeForm.amount || parseFloat(feeForm.amount) <= 0) errors.amount = 'Amount must be a positive number.';
    if (!feeForm.dueDate) errors.dueDate = 'Due date is required.';
    if (!feeForm.status) errors.status = 'Status is required.';
    if (feeForm.status !== 'Unpaid' && !feeForm.paymentChannel) errors.paymentChannel = 'Payment channel is required if not unpaid.';
    if (!feeForm.isGeneralFee && !feeForm.studentId) errors.studentId = 'Please select a student for individual fees.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFeeForm(prev => ({
        ...prev,
        [id]: checked,
        studentId: checked ? '' : prev.studentId
      }));
    } else {
      setFeeForm(prev => ({ ...prev, [id]: value }));
    }
    setFormErrors(prev => ({ ...prev, [id]: '' }));
  };

  const addNotification = async (title, body, recipientType, recipientId = null) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        body,
        recipientType,
        recipientId,
        isRead: false,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert('Please correct the errors in the form.');
      return;
    }
    const feeRecordToAddOrUpdate = {
      ...feeForm,
      amount: parseFloat(feeForm.amount),
      timestamp: new Date().toISOString()
    };
    try {
      if (isEditing) {
        const response = await fetch(`http://localhost:5000/api/schoolPortalFeeRecords/${editFeeRecordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(feeRecordToAddOrUpdate),
        });
        if (response.ok) {
          const updatedRecord = await response.json();
          setFeeRecords(prevRecords =>
            prevRecords.map(rec =>
              rec._id === updatedRecord._id ? updatedRecord : rec
            )
          );
          showAlert('Fee record updated successfully!');
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to update fee record.');
        }
      } else {
        const response = await fetch('http://localhost:5000/api/schoolPortalFeeRecords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(feeRecordToAddOrUpdate),
        });
        if (response.ok) {
          const newRecord = await response.json();
          setFeeRecords(prevRecords => [...prevRecords, newRecord]);
          showAlert('Fee record added successfully!');
          if (newRecord.isGeneralFee) {
            addNotification(
              'New School Fee Added',
              `A new fee of ₦${newRecord.amount.toLocaleString()} for ${newRecord.feeType} is due on ${newRecord.dueDate}.`,
              'allStudents'
            );
          } else {
            const student = students.find(s => s.admissionNo === newRecord.studentId);
            if (student) {
              addNotification(
                `New Fee Posted: ${newRecord.feeType}`,
                `A new fee of ₦${newRecord.amount.toLocaleString()} is due on ${newRecord.dueDate}.`,
                'individualStudent',
                student.admissionNo
              );
            }
          }
        } else {
          const errorData = await response.json();
          showAlert(errorData.message || 'Failed to add new fee record.');
        }
      }
    } catch (err) {
      showAlert('An unexpected error occurred. Please check your network connection.');
    }
    
    setFeeForm({
      feeType: '',
      amount: '',
      dueDate: '',
      status: 'Unpaid',
      paymentChannel: '',
      notes: '',
      isGeneralFee: true,
      studentId: ''
    });
    setIsEditing(false);
    setEditFeeRecordId(null);
    setFormErrors({});
  };

  const editFeeRecord = (idToEdit) => {
    const record = feeRecords.find(rec => rec.id === idToEdit);
    if (record) {
      setFeeForm(record);
      setIsEditing(true);
      setEditFeeRecordId(record._id);
      setFormErrors({});
    }
  };

  const deleteFeeRecord = (idToDelete) => {
    showConfirm(
      'Are you sure you want to delete this fee record?',
      async () => {
        const recordToDelete = feeRecords.find(rec => rec.id === idToDelete);
        if (!recordToDelete) {
          showAlert('Record not found.');
          return;
        }
        try {
          const response = await fetch(`http://localhost:5000/api/schoolPortalFeeRecords/${recordToDelete._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          });
          if (response.ok) {
            setFeeRecords(prevRecords => prevRecords.filter(rec => rec.id !== idToDelete));
            showAlert('Fee record deleted successfully!');
          } else {
            const errorData = await response.json();
            showAlert(errorData.message || 'Failed to delete fee record.');
          }
        } catch (err) {
          showAlert('An unexpected error occurred. Please check your network connection.');
        }
      }
    );
  };

  const clearForm = () => {
    setFeeForm({
      feeType: '',
      amount: '',
      dueDate: '',
      status: 'Unpaid',
      paymentChannel: '',
      notes: '',
      isGeneralFee: true,
      studentId: ''
    });
    setIsEditing(false);
    setEditFeeRecordId(null);
    setFormErrors({});
  };

  const getStudentName = (admissionNo) => {
    const student = students.find(s => s.admissionNo === admissionNo);
    return student ? `${student.firstName} ${student.lastName} (${student.admissionNo})` : 'Unknown Student';
  };

  const filteredFeeRecords = feeRecords.filter(record => {
    const matchesSearch = searchTerm ?
      (record.feeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.studentId && getStudentName(record.studentId).toLowerCase().includes(searchTerm.toLowerCase())))
      : true;
    return matchesSearch;
  });

  if (!loggedInAdmin || loading) {
    return <div className="content-section">Loading fee data...</div>;
  }

  if (error) {
    return <div className="content-section">Error loading data: {error.message}</div>;
  }

  return (
    <div className="content-section">
      <ConfirmModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={() => { modalAction(); setIsModalOpen(false); }}
        onCancel={() => setIsModalOpen(false)}
        isAlert={isModalAlert}
      />
      <h1>Fee Management</h1>
      <div className="sub-section">
        <h2>{isEditing ? 'Edit Fee Record' : 'Add New Fee Record'}</h2>
        <form onSubmit={handleSubmit} className="fees-form">
          <div className="form-group form-group-full">
            <label className="form-label-inline">Fee Scope:</label>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="isGeneralFee"
                checked={feeForm.isGeneralFee}
                onChange={handleChange}
              />
              <label htmlFor="isGeneralFee">General Fee (for all students)</label>
            </div>
          </div>
          {!feeForm.isGeneralFee && (
            <div className="form-group">
              <label htmlFor="studentId" className="form-label">Select Student:</label>
              <select
                id="studentId"
                value={feeForm.studentId}
                onChange={handleChange}
                required={!feeForm.isGeneralFee}
                className={`form-input ${formErrors.studentId ? 'form-input-error' : ''}`}
              >
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s.admissionNo} value={s.admissionNo}>{getStudentName(s.admissionNo)}</option>
                ))}
              </select>
              {formErrors.studentId && <p className="error-message">{formErrors.studentId}</p>}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="feeType" className="form-label">Fee Type:</label>
            <select
              id="feeType"
              value={feeForm.feeType}
              onChange={handleChange}
              className={`form-input ${formErrors.feeType ? 'form-input-error' : ''}`}
            >
              <option value="">-- Select Fee Type --</option>
              {uniqueFeeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {formErrors.feeType && <p className="error-message">{formErrors.feeType}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="amount" className="form-label">Amount (₦):</label>
            <input
              type="number"
              id="amount"
              value={feeForm.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="e.g., 150000.00"
              className={`form-input ${formErrors.amount ? 'form-input-error' : ''}`}
            />
            {formErrors.amount && <p className="error-message">{formErrors.amount}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">Due Date:</label>
            <input
              type="date"
              id="dueDate"
              value={feeForm.dueDate}
              onChange={handleChange}
              className={`form-input ${formErrors.dueDate ? 'form-input-error' : ''}`}
            />
            {formErrors.dueDate && <p className="error-message">{formErrors.dueDate}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="status" className="form-label">Status:</label>
            <select
              id="status"
              value={feeForm.status}
              onChange={handleChange}
              className={`form-input ${formErrors.status ? 'form-input-error' : ''}`}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
            </select>
            {formErrors.status && <p className="error-message">{formErrors.status}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="paymentChannel" className="form-label">Payment Channel (if paid/partially paid):</label>
            <select
              id="paymentChannel"
              value={feeForm.paymentChannel}
              onChange={handleChange}
              required={feeForm.status !== 'Unpaid'}
              className={`form-input ${formErrors.paymentChannel ? 'form-input-error' : ''}`}
              disabled={feeForm.status === 'Unpaid'}
            >
              <option value="">-- Select Channel --</option>
              {paymentChannels.map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
            {formErrors.paymentChannel && <p className="error-message">{formErrors.paymentChannel}</p>}
          </div>
          <div className="form-group form-group-full">
            <label htmlFor="notes" className="form-label">Notes (Optional):</label>
            <textarea
              id="notes"
              value={feeForm.notes}
              onChange={handleChange}
              placeholder="Add any relevant notes about the fee or payment."
              rows="3"
              className="form-input"
            ></textarea>
          </div>
          <div className="form-actions">
            <button type="submit" className="form-submit-btn">
              {isEditing ? 'Update Fee Record' : 'Add Fee Record'}
            </button>
            <button type="button" onClick={clearForm} className="form-clear-btn">
              Clear Form
            </button>
          </div>
        </form>
      </div>
      <div className="sub-section">
        <h2>All Fee Records</h2>
        <input
          type="text"
          placeholder="Search by Fee Type or Student ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <div className="table-container">
          <table className="fees-table">
            <thead>
              <tr>
                <th>Scope</th>
                <th>Student (ID)</th>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Channel</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeeRecords.length > 0 ? (
                filteredFeeRecords.map((record, index) => (
                  <tr key={record._id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>{record.isGeneralFee ? 'General' : 'Individual'}</td>
                    <td>{record.isGeneralFee ? 'All Students' : getStudentName(record.studentId)}</td>
                    <td>{record.feeType}</td>
                    <td>₦{record.amount.toLocaleString()}</td>
                    <td>{record.dueDate}</td>
                    <td className={`status-cell status-${record.status.toLowerCase().replace(' ', '-')}`}>{record.status}</td>
                    <td>{record.paymentChannel || 'N/A'}</td>
                    <td>{record.notes || 'N/A'}</td>
                    <td className="table-actions">
                      <button className="action-btn edit-btn" onClick={() => editFeeRecord(record.id)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => deleteFeeRecord(record.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">No fee records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminFeesManagement;
