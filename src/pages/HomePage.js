// src/pages/HomePage.js
import React from 'react';
// Link is no longer needed here as navigation will be in the global Header
// logo import is also not needed here anymore

function HomePage() {
  return (
    <div className="home-page-container">
      {/* The global Header component will be rendered by App.js */}
      {/* The global Footer component will be rendered by App.js */}

      <section className="hero-section" id="home">
        <h1>Busari-alao College</h1>
        <p>Educating to inspire...</p>
        {/* Link to academic management page from the CTA button */}
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