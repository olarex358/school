// src/components/Header.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import styles from './Header.module.css';
import logo from '../pages/logo.png';
import useNotifications from '../hooks/useNotifications';
import NotificationsDropdown from './NotificationsDropdown';
import { hasPermission } from '../permissions';
import notificationIcon from '../icon/notification.png';

function Header() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useLocalStorage('loggedInUser', null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    navigate('/home');
  };

  const renderNavLinks = () => {
    const role = loggedInUser ? loggedInUser.type : 'guest';
    const baseLinks = [
      { to: "/home", text: "Home" },
      { to: "/news", text: "News" },
      { to: "/#contact", text: "Contact" },
    ];
    
    let roleSpecificLinks = [];
    if (role === 'admin') {
      roleSpecificLinks = [
        { to: "/dashboard", text: "Dashboard" },
      ];
    } else if (role === 'student') {
      roleSpecificLinks = [
        { to: "/student-dashboard", text: "Dashboard" },
        { to: "/student-profile", text: "Profile" },
      ];
    } else if (role === 'staff') {
      roleSpecificLinks = [
        { to: "/staff-dashboard", text: "Dashboard" },
        { to: "/staff-profile", text: "Profile" },
      ];
    } else {
      roleSpecificLinks = [
        { to: "/login", text: "Login" },
      ];
    }

    const allLinks = [...baseLinks, ...roleSpecificLinks];
    
    return allLinks
      .filter(link => hasPermission(role, link.to))
      .map(link => (
        <li key={link.to}>
          <NavLink to={link.to} className={({ isActive }) => isActive ? styles.activeLink : undefined}>
            {link.text}
          </NavLink>
        </li>
      ));
  };

  return (
    <header className={styles.header}>
      {loggedInUser && (
        <div className={styles.topBar}>
          <span className={styles.welcomeText}>
            Welcome, {loggedInUser.type === 'admin' ? loggedInUser.username : loggedInUser.firstname}!
          </span>
          <div className={styles.notificationContainer} onClick={() => setShowDropdown(!showDropdown)}>
            <img src={notificationIcon} alt="Notifications" className={styles.notificationIcon} />
            {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          {showDropdown && <NotificationsDropdown onClose={() => setShowDropdown(false)} />}
        </div>
      )}
      <div className={styles.mainHeaderContent}>
        <img src={logo} alt="Busarialao College Logo" className={styles.headerLogo} />
      </div>
      <nav className={styles.mainNav}>
        <ul className={styles['nav-links']}>
          {renderNavLinks()}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
