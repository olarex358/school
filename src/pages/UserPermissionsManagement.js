// src/pages/UserPermissionsManagement.js
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

function UserPermissionsManagement() {
  // Update hook to get data from the backend
  const [users, setUsers, loadingUsers] = useLocalStorage('schoolPortalUsers', [], 'http://localhost:5000/api/schoolPortalUsers');

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: ''
  });
  const [submitButtonText, setSubmitButtonText] = useState('Add User');
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewUser(prevUser => ({
      ...prevUser,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.role) {
      alert('Please fill in all required fields.');
      return;
    }
    if (isEditing) {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.username === editUsername ? { ...newUser } : user
        )
      );
      alert('User data updated successfully!');
    } else {
      if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
        alert('A user with this username already exists. Please choose a different username.');
        return;
      }
      setUsers(prevUsers => [...prevUsers, newUser]);
      alert('New user added successfully!');
    }
    setNewUser({
      username: '',
      password: '',
      role: ''
    });
    setSubmitButtonText('Add User');
    setIsEditing(false);
    setEditUsername(null);
  };

  const editUser = (usernameToEdit) => {
    const userToEdit = users.find(u => u.username === usernameToEdit);
    if (userToEdit) {
      setNewUser(userToEdit);
      setSubmitButtonText('Update User');
      setIsEditing(true);
      setEditUsername(usernameToEdit);
    }
  };

  const deleteUser = (usernameToDelete) => {
    if (window.confirm(`Are you sure you want to delete user: ${usernameToDelete}?`)) {
      setUsers(prevUsers => prevUsers.filter(user => user.username !== usernameToDelete));
      alert('User deleted successfully!');
    }
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
    setEditUsername(null);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingUsers) {
    return <div className="content-section">Loading user data...</div>;
  }

  return (
    <div className="content-section">
      <h1>User/Permissions Management</h1>
      <div className="sub-section">
        <h2>{isEditing ? 'Edit Admin User' : 'Add/Edit Admin User'}</h2>
        <form id="userForm" onSubmit={handleSubmit}>
          <input
            type="text"
            id="username"
            placeholder="Username (e.g., admin_results)"
            required
            value={newUser.username}
            onChange={handleChange}
            readOnly={isEditing}
            disabled={isEditing}
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            required
            value={newUser.password}
            onChange={handleChange}
          />
          <select
            id="role"
            required
            value={newUser.role}
            onChange={handleChange}
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
          <button type="submit">{submitButtonText}</button>
        </form>
        <h3>Existing Admin Users</h3>
        <input
          type="text"
          id="userSearchFilter"
          placeholder="Search by Username or Role"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button onClick={clearSearchAndForm}>Clear Filter / Reset Form</button>
        <ul id="userList">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <li key={user.username}>
                <strong>{user.username}</strong> ({user.role})
                <span>
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
                </span>
              </li>
            ))
          ) : (
            <li>No admin users found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default UserPermissionsManagement;