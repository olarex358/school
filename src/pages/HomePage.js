// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';

function HomePage() {
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Make a GET request to our backend API
    fetch('http://localhost:5000/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Failed to fetch from backend:', error));
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