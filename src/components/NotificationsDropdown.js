// src/components/NotificationsDropdown.js
import React, { useEffect, useRef } from 'react';
import useNotifications from '../hooks/useNotifications';
import styles from './Header.module.css';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function NotificationsDropdown({ onClose }) {
  const { notifications, markAllAsRead, clearNotifications } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleClearAll = () => {
    clearNotifications();
  };

  return (
    <div ref={dropdownRef} className={styles.notificationsDropdown}>
      <div className={styles.dropdownHeader}>
        <h4>Notifications</h4>
        <button className={styles.clearBtn} onClick={handleClearAll}>Clear All</button>
      </div>
      <div className={styles.notificationList}>
        {notifications.length > 0 ? (
          notifications.map(n => (
            <div key={n.id} className={styles.notificationItem}>
              <div className={styles.notificationTitle}>{n.title}</div>
              <div className={styles.notificationBody}>{n.body}</div>
              <div className={styles.notificationTimestamp}>
                {new Date(n.timestamp.seconds * 1000).toLocaleDateString()} at {new Date(n.timestamp.seconds * 1000).toLocaleTimeString()}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noNotifications}>No new notifications.</div>
        )}
      </div>
    </div>
  );
}

export default NotificationsDropdown;
