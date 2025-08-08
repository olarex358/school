// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import ConfirmModal from '../components/ConfirmModal'; // Assuming ConfirmModal is available

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        
        // Store JWT and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('loggedInUser', JSON.stringify(data.user));
        
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

export default LoginPage;
