// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import useLocalStorage from '../hooks/useLocalStorage';
=======
import { useAuth } from '../hooks/AuthContext'; // Import useAuth
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
import logo from './logo.png';
import ConfirmModal from '../components/ConfirmModal';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalAlert, setIsModalAlert] = useState(false);

  useEffect(() => {
    setError('');
  }, []);

  const showAlert = (msg) => {
    setModalMessage(msg);
    setIsModalAlert(true);
    setIsModalOpen(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
<<<<<<< HEAD
        // Determine the user type from the backend response
        let userType = user.type;

        // ⭐️⭐️ THE FIX: Check for and store the token ⭐️⭐️
        if (data.token && userType === 'admin') {
            // StudentManagement looks for 'adminToken', and the backend provides 'data.token'
            localStorage.setItem('adminToken', data.token); 
        }

        // Store user data in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify({ ...user, type: userType }));
=======
        // Use AuthContext login instead of localStorage directly
        login(data.token); // This will handle token storage and user decoding
>>>>>>> 43d3b0a7c0d7b74746bad289efef32546e041793
        
        // Redirect to the appropriate dashboard
        const userType = data.user.type;
        if (userType === 'admin') {
          navigate('/dashboard'); 
        } else if (userType === 'student') {
          navigate('/student-dashboard');
        } else if (userType === 'staff') {
          navigate('/staff-dashboard');
        }
      } else {
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
      <ConfirmModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        isAlert={isModalAlert}
      />
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
// In your browser console, check what's being sent
console.log('Username:', document.getElementById('username').value);
console.log('Password:', document.getElementById('password').value);

export default LoginPage;