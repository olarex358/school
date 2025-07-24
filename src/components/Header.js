// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import styles from './Header.module.css'; // Assuming you converted to CSS Modules

function Header() {
  return (
    <header className={styles.header}>
      <nav>
        <div className={styles.logo}>Busari-alao College</div> {/* Updated logo text */}
        <ul className={styles['nav-links']}>
          <li><Link to="/dashboard">Dashboard</Link></li> {/* Use Link to */}
          <li><Link to="/student-management">Student Management</Link></li>
          <li><Link to="/staff-management">Staff Management</Link></li>
          <li><Link to="/results-management">Results Management</Link></li>
          <li><Link to="/view-reports">View Reports</Link></li>
          <li><Link to="/academic-management">Academic Management</Link></li>
          <li><Link to="/user-permissions-management">User/Permissions Management</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;