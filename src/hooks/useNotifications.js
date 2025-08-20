// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/AuthContext'; 

function useNotifications() {
  const { notifications, setNotifications } = useData();
  const { user, token } = useAuth(); // Use user from AuthContext instead of localStorage
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread count without causing re-render loops
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(n => !n.isRead).length;
      setUnreadCount(count);
    }
  }, [notifications]);

  /**
   * Marks all notifications for the current user as read via the backend.
   */
  const markAllAsRead = useCallback(async () => {
    try {
      if (!user || !token) return;

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.username, userType: user.type })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read.');
      }

      // Optimistically update the UI
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
      setNotifications(updatedNotifications);

    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, [user, token, notifications, setNotifications]); // Add all dependencies

  /**
   * Clears all notifications for the current user via the backend.
   */
  const clearNotifications = useCallback(async () => {
    try {
      if (!user || !token) return;

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notifications/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.username, userType: user.type })
      });

      if (!response.ok) {
        throw new Error('Failed to clear notifications.');
      }

      // Optimistically update the UI
      setNotifications([]);
      
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }, [user, token, setNotifications]); // Add all dependencies

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications,
  };
}

export default useNotifications;