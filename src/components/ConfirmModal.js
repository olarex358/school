// src/components/ConfirmModal.js
import React from 'react';

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', /* Dark overlay */
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000 /* Ensure it's on top */
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
        color: '#333'
      }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--primary-blue-dark)' }}>Confirm Action</h3>
        <p style={{ marginBottom: '30px', fontSize: '1.1em' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 25px',
              backgroundColor: 'var(--error-color)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, transform 0.1s ease'
            }}
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 25px',
              backgroundColor: '#6c757d', /* Gray for cancel */
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, transform 0.1s ease'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;