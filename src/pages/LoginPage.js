// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// The useLocalStorage hook is no longer needed for login logic itself, but we'll keep the import for now if other parts of the file use it.
import useLocalStorage from '../hooks/useLocalStorage';
import logo from './logo.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load all relevant user data from localStorage using our custom hook
  const [adminUsers] = useLocalStorage('schoolPortalUsers', []);
  const [students] = useLocalStorage('schoolPortalStudents', []);
  const [staffs] = useLocalStorage('schoolPortalStaff', []);

  useEffect(() => {
    setError('');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Send login data to our backend API
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        
        // Determine the user type from the backend response
        let userType = user.type;

        // Store user data in localStorage, just as a flag for the frontend
        localStorage.setItem('loggedInUser', JSON.stringify({ ...user, type: userType }));
        
        // Redirect to the appropriate dashboard based on user type from backend
        if (userType === 'admin') {
          navigate('/dashboard');
        } else if (userType === 'student') {
          navigate('/student-dashboard');
        } else if (userType === 'staff') {
          navigate('/staff-dashboard');
        }
      } else {
        // Handle failed login
        const errorData = await response.json();
        setError(errorData.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
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
            placeholder="Username (e.g., admin, student1, staff1)"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="Password"
            type="password"
            id="password"
            placeholder="Password (e.g., 123)"
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