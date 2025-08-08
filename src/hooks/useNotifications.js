// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { db } from '../firebase/firebase';
import { collection, writeBatch, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';

function useNotifications() {
  // We now get notifications from our centralized context, which is listening to Firestore
  const { notifications } = useData();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter(n => !n.isRead).length);
    }
  }, [notifications]);

  /**
   * Marks all notifications for the current user as read in Firestore.
   */
  const markAllAsRead = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const batch = writeBatch(db);
      
      const q = query(
        collection(db, 'notifications'), 
        where('recipientType', 'in', ['allStudents', `individual${loggedInUser.type.charAt(0).toUpperCase() + loggedInUser.type.slice(1)}`]),
        where('recipientId', 'in', [loggedInUser.admissionNo || loggedInUser.staffId || loggedInUser.username, null]),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((document) => {
        batch.update(document.ref, { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  /**
   * Clears all notifications for the current user from Firestore.
   */
  const clearNotifications = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const q = query(
        collection(db, 'notifications'), 
        where('recipientType', 'in', ['allStudents', `individual${loggedInUser.type.charAt(0).toUpperCase() + loggedInUser.type.slice(1)}`]),
        where('recipientId', 'in', [loggedInUser.admissionNo || loggedInUser.staffId || loggedInUser.username, null])
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications,
  };
}

export default useNotifications;
