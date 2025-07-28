// src/components/Header.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import styles from './Header.module.css';

// Import logo image
import logo from '../pages/logo.png';

function Header() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useLocalStorage('loggedInUser', null);

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUser'); // Ensure actual localStorage is cleared
    navigate('/home');
  };

  const renderNavLinks = () => {
    let linksToRender = [];

    if (!loggedInUser) {
      // Public / Not Logged In Links - Simplified
      linksToRender = [
        { to: "/home", text: "Home" },
        { to: "/news", text: "News" }, // Placeholder News page
        { to: "/#contact", text: "Contact" }, // Link to section ID on HomePage
        { to: "/login", text: "Login" },
      ];
    } else if (loggedInUser.type === 'admin') {
      // Admin Links - Minimalist
      linksToRender = [
        { to: "/dashboard", text: "Dashboard" },
        { to: "/news", text: "News" },
        { to: "/#contact", text: "Contact" },
        // All other management links are accessed from the Admin Dashboard sidebar/cards
      ];
    } else if (loggedInUser.type === 'student') {
      // Student Links - Minimalist (Dashboard and Profile are key)
      linksToRender = [
        { to: "/student-dashboard", text: "Dashboard" },
        { to: "/student-profile", text: "Profile" },
        { to: "/news", text: "News" },
        { to: "/#contact", text: "Contact" },
        // Other student-specific links are accessed from the Student Dashboard sidebar/cards
      ];
    } else if (loggedInUser.type === 'staff') {
      // Staff Links - Minimalist (Dashboard and Profile are key)
      linksToRender = [
        { to: "/staff-dashboard", text: "Dashboard" },
        { to: "/staff-profile", text: "Profile" },
        { to: "/news", text: "News" },
        { to: "/#contact", text: "Contact" },
        // Other staff-specific links are accessed from the Staff Dashboard sidebar/cards
      ];
    }

    return (
      <>
        {linksToRender.map(link => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => isActive ? styles.activeLink : undefined}>
              {link.text}
            </NavLink>
          </li>
        ))}
      </>
    );
  };

  return (
    <header className={styles.header}>
      {/* Top bar for user info/logout when logged in */}
      {loggedInUser && (
        <div className={styles.topBar}>
            <span className={styles.welcomeText}>
                Welcome, {loggedInUser.type === 'admin' ? loggedInUser.username : loggedInUser.firstname}!
            </span>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        </div>
      )}

      {/* Main Logo and Slogan Area - matches image_73e18b.png */}
      <div className={styles.mainHeaderContent}>
        <img src={logo} alt="Busarialao College Logo" className={styles.headerLogo} />
      
      </div>

      {/* Main Navigation - always present, content changes based on login */}
      <nav className={styles.mainNav}>
        <ul className={styles['nav-links']}>
          {renderNavLinks()}
        </ul>
      </nav>
    </header>
  );
}

export default Header;