// src/pages/UserPermissionsManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import ConfirmModal from '../components/ConfirmModal';


function UserPermissionsManagement() {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);

  // Update hook to get data from the backend
  const [users, setUsers, loadingUsers] = useLocalStorage('schoolPortalUsers', [], 'http://localhost:5000/api/schoolPortalUsers');

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: ''
  });
  const [submitButtonText, setSubmitButtonText] = useState('Add User');
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null); // To store the MongoDB _id
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState(() => {});
  const [isModalAlert, setIsModalAlert] = useState(false);

  // Helper functions for modal control
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
    if (!newUser.username.trim()) errors.username = 'Username is required.';
    if (!newUser.password.trim() && !isEditing) errors.password = 'Password is required for new users.';
    if (!newUser.role) errors.role = 'Role is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewUser(prevUser => ({
      ...prevUser,
      [id]: value
    }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [id]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!validateForm()) {
      showAlert('Please correct the errors in the form.');
      return;
    }
    try {
        if (isEditing) {
            const response = await fetch(`http://localhost:5000/api/schoolPortalUsers/${editUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            if (response.ok) {
                const updatedUser = await response.json();
                setUsers(prevUsers =>
                    prevUsers.map(user => (user._id === updatedUser._id ? updatedUser : user))
                );
                showAlert('User data updated successfully!');
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'Failed to update user.');
            }
        } else {
            const response = await fetch('http://localhost:5000/api/schoolPortalUsers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            if (response.ok) {
                const createdUser = await response.json();
                setUsers(prevUsers => [...prevUsers, createdUser]);
                showAlert('New user added successfully!');
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'Failed to add new user.');
            }
        }
    } catch (err) {
        showAlert('An unexpected error occurred. Please check your network connection.');
    }

    setNewUser({
      username: '',
      password: '',
      role: ''
    });
    setSubmitButtonText('Add User');
    setIsEditing(false);
    setEditUserId(null);
    setFormErrors({});
  };

  const editUser = (usernameToEdit) => {
    const userToEdit = users.find(u => u.username === usernameToEdit);
    if (userToEdit) {
      setNewUser(userToEdit);
      setSubmitButtonText('Update User');
      setIsEditing(true);
      setEditUserId(userToEdit._id);
      setFormErrors({});
      setMessage(null);
    }
  };

  const deleteUser = (usernameToDelete) => {
    showConfirm(
      `Are you sure you want to delete user: ${usernameToDelete}?`,
      async () => {
        const userToDelete = users.find(u => u.username === usernameToDelete);
        if (!userToDelete) {
            showAlert('User not found.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/schoolPortalUsers/${userToDelete._id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setUsers(prevUsers => prevUsers.filter(user => user.username !== usernameToDelete));
                showAlert('User deleted successfully!');
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'Failed to delete user.');
            }
        } catch (err) {
            showAlert('An unexpected error occurred. Please check your network connection.');
        }
      }
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearchAndForm = () => {
    setSearchTerm('');
    setNewUser({
      username: '',
      password: '',
      role: ''
    });
    setSubmitButtonText('Add User');
    setIsEditing(false);
    setEditUserId(null);
    setFormErrors({});
    setMessage(null);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!loggedInAdmin || loadingUsers) {
    return <div className="content-section">Loading user data...</div>;
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
      <h1>User/Permissions Management</h1>
      <div className="sub-section">
        <h2>{isEditing ? 'Edit Admin User' : 'Add/Edit Admin User'}</h2>
        {message && (
          <div className={`form-message form-message-${message.type}`}>
            {message.text}
          </div>
        )}
        <form id="userForm" onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username:</label>
            <input
              type="text"
              id="username"
              placeholder="Username (e.g., admin_results)"
              value={newUser.username}
              onChange={handleChange}
              readOnly={isEditing}
              disabled={isEditing}
              className={`form-input ${formErrors.username ? 'form-input-error' : ''}`}
            />
            {formErrors.username && <p className="error-message">{formErrors.username}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={newUser.password}
              onChange={handleChange}
              className={`form-input ${formErrors.password ? 'form-input-error' : ''}`}
            />
            {formErrors.password && <p className="error-message">{formErrors.password}</p>}
          </div>
          <div className="form-group form-group-full">
            <label htmlFor="role" className="form-label">Role:</label>
            <select
              id="role"
              value={newUser.role}
              onChange={handleChange}
              className={`form-input ${formErrors.role ? 'form-input-error' : ''}`}
            >
              <option value="">Select Role</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Student Manager">Student Manager</option>
              <option value="Staff Manager">Staff Manager</option>
              <option value="Results Manager">Results Manager</option>
              <option value="Academic Manager">Academic Manager</option>
              <option value="Fee Manager">Fee Manager</option>
              <option value="View Reports">View Reports Only</option>
            </select>
            {formErrors.role && <p className="error-message">{formErrors.role}</p>}
          </div>
          <div className="form-actions">
            <button type="submit" className="form-submit-btn">
              {submitButtonText}
            </button>
            <button type="button" onClick={clearSearchAndForm} className="form-clear-btn">
              Clear Form
            </button>
          </div>
        </form>
      </div>
      <div className="sub-section">
        <h3>Existing Admin Users</h3>
        <input
          type="text"
          id="userSearchFilter"
          placeholder="Search by Username or Role"
          value={searchTerm}
          onChange={handleSearchChange}
          className="filter-input"
        />
        <button onClick={clearSearchAndForm} className="filter-clear-btn">
          Clear Filter / Reset Form
        </button>
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user._id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td className="table-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => editUser(user.username)}>
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => deleteUser(user.username)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No admin users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserPermissionsManagement;
