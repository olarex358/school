// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
// Assuming logo.png is directly in src/
import logo from './logo.png'; //

function HomePage() {
  // Note: The search bar in original HTML uses oninput="filterproduct()",
  // which is vanilla JS. Implementing a functional search for a static
  // home page like this isn't typical in React, but we'll include the elements.
  // For a real search, it would typically interact with a backend or local data.

  return (
    <div className="home-page-container"> {/* A wrapper for home page specific styling */}
      <header>
        <img src={logo} alt="Busari-alao College Logo" width="150px" height="150px" />
      </header>
      <header className="navbar"> {/* Class name from bac style css.txt */}
        <nav>
          <ul className="menu"> {/* Class name from bac style css.txt */}
            <li className="menu-item"><Link to="/">Home</Link></li> {/* */}
            <li className="menu-item"><Link to="/login">Login</Link></li> {/* Link to our unified login page */}
            {/* Note: Original had admin login.html and login.html. We now have one unified /login */}
            <li className="menu-item"><Link to="/news">News</Link></li> {/* Placeholder, create NewsPage later */}
            <li className="menu-item"><Link to="/#about-us">About</Link></li> {/* Link to section ID */}
            <li className="menu-item"><Link to="/#contact">Contact</Link></li> {/* Link to section ID */}
          </ul>
        </nav>
      </header>
      <header className="search-bar"> {/* Class name from index.html(bac).txt */}
        <input type="search" className="search-bar" id="search-bar" placeholder="search..." /> {/* */}
        <button type="submit">Search</button> {/* */}
      </header>

      <section className="hero-section" id="home"> {/* Class name from bac style css.txt */}
        <h1>Busari-alao College</h1>
        <p>Educating to inspire...</p>
        <a href="/academic-management" className="cta-button">Explore Our Academic Activities</a> {/* Link to Academic Management */}
      </section>

      <section id="about-us" className="about-section"> {/* Class name from bac style css.txt */}
        <h3>About Us</h3>
        <p>Busari-alao college established in 2006 with the aim <br />of providing science base knowledge</p>
      </section>

      <section id="contact" className="contact-section"> {/* Class name from bac style css.txt */}
        <h2>Contact Us</h2>
        <form action="mailto:busarioalao@gmail.com" method="post" id="contact-form"> {/* */}
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" required />
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required /> {/* Changed type to email, added required */}
          <label htmlFor="message">Message:</label>
          <textarea name="message" id="message" required></textarea>
          <button type="submit">Submit</button>
        </form>
      </section>

      <footer>&copy;busari-alao college all right reserved</footer>
    </div>
  );
}

export default HomePage;