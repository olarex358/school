// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
// Import the new secureFetch function (This is required for token management)
import { secureFetch } from '../api/fetchHelper'; 

function HomePage() {
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // 💡 FIX: Using secureFetch to automatically handle token inclusion.
    // This helper also contains the logic to clear the bad token from Local Storage 
    // when it receives an authentication error, solving the recurring 500 error.
    secureFetch('/api/hello') 
      .then(data => {
          // Success: Set the message from the backend
          setMessage(data.message)
      })
      .catch(error => {
          // Failure: Log the error and set a user-friendly message
          console.error('Failed to fetch from backend:', error.message);
          setMessage('Welcome! Please log in to explore our academic activities.');
      });
  }, []);

  return (
    <div className="home-page-container">
      {/* The global Header component will be rendered by App.js */}
      {/* The global Footer component will be rendered by App.js */}
      <section className="hero-section" id="home">
        <h1>Busari-alao College</h1>
        <p>Educating to inspire...</p>
        <p>{message}</p> {/* Display the message from the backend here */}
        <a href="/academic-management" className="cta-button">Explore Our Academic Activities</a>
      </section>
      <section id="about-us" className="about-section">
        <h3>About Us</h3>
        <p>Busari-alao college established in 2006 with the aim <br />of providing science base knowledge</p>
      </section>
      <section id="contact" className="contact-section">
        <h2>Contact Us</h2>
        <form action="mailto:busarioalao@gmail.com" method="post" id="contact-form">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" required />
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
          <label htmlFor="message">Message:</label>
          <textarea name="message" id="message" required></textarea>
          <button type="submit">Submit</button>
        </form>
      </section>
    </div>
  );
}

export default HomePage;
