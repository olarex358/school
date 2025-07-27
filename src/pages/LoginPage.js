// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage'; // Import custom hook
import logo from './logo.png'; //

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load all relevant user data from localStorage using our custom hook
  const [adminUsers] = useLocalStorage('schoolPortalUsers', []);
  const [students] = useLocalStorage('schoolPortalStudents', []);
  const [staffs] = useLocalStorage('schoolPortalStaff', []); // Load staff data

  useEffect(() => {
    setError('');
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    let loggedInUser = null;
    let userType = null;

    // 1. Try to authenticate as an Admin User
    const foundAdmin = adminUsers.find(
      user => user.username === trimmedUsername && user.password === trimmedPassword
    );
    if (foundAdmin) {
      loggedInUser = foundAdmin;
      userType = 'admin';
    }

    // 2. Try to authenticate as a Staff User
    // Note: StaffManagement uses staffId, surname, firstname, role.
    // For login, we'll use staffId as username and a default '1234' password for demo
    const foundStaff = staffs.find(
        staff => staff.staffId === trimmedUsername && '1234' === trimmedPassword // Assuming staffId as username, '1234' as demo password
    );
    if (!loggedInUser && foundStaff) { // Only check if no admin match yet
      loggedInUser = foundStaff;
      userType = 'staff';
    }

    // 3. Try to authenticate as a Student
    // Note: StudentManagement uses admissionNo, firstName, lastName, dob, etc.
    // For login, we'll use admissionNo as username and a default '1234' password for demo.
    const foundStudent = students.find(
        student => student.admissionNo === trimmedUsername && '1234' === trimmedPassword // Assuming admissionNo as username, '1234' as demo password
    );
    if (!loggedInUser && foundStudent) { // Only check if no admin/staff match yet
      loggedInUser = foundStudent;
      userType = 'student';
    }

    if (loggedInUser) {
      localStorage.setItem('loggedInUser', JSON.stringify({ ...loggedInUser, type: userType }));

      if (userType === 'admin') {
        navigate('/dashboard'); // Admin Dashboard
      } else if (userType === 'student') {
        navigate('/student-dashboard'); // Student Dashboard
      } else if (userType === 'staff') {
        navigate('/staff-dashboard'); // Staff Dashboard
      }
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="login-page">
      <header>
        <img src={logo} alt="logo" width="150px" height="150px" />
      </header>
      <div className="login-form">
        <h2>Login</h2>
        <p>Enter your login details</p>
        <form onSubmit={handleLogin}>
          <input
            className="addmin"
            type="text"
            id="username"
            placeholder="Admission No. / Staff ID / Username" // Updated for unified
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="Password"
            type="password"
            id="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
          {error && <p id="loginError" style={{ color: 'red' }}>{error}</p>}
        </form>
      </div>
      <footer>&copy;busari-alao college all rights reserved</footer>
    </div>
  );
}

export default LoginPage;
