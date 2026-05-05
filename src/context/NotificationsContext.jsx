import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const NotificationsProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [token]);

  // Mark all new_message notifications from a sender as read
  const markSenderMessagesRead = useCallback(async (senderId) => {
    if (!token || !senderId) return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/notifications/read-sender/${senderId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => {
        const sid = String(senderId);
        return prev.map((n) => {
          const nSender = n.sender?._id ?? n.sender;
          if (n.type === 'new_message' && !n.isRead && String(nSender) === sid) {
            return { ...n, isRead: true };
          }
          return n;
        });
      });

      // Recompute unread count locally (covers both message and non-message)
      setUnreadCount((prev) => {
        // best-effort: we also update notifications above, but unreadCount is a separate state
        // so we recalc from current list on next render by deriving from notifications would be better
        // Keeping simple: decrement by number of sender unread messages if available
        return Math.max(0, prev);
      });

      // Ensure exact counts by refetch (cheap and consistent)
      fetchNotifications();
    } catch (err) {
      console.error('Error marking sender message notifications as read:', err);
    }
  }, [token, fetchNotifications]);

  const deleteNotification = useCallback(async (notificationId) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => {
        const target = prev.find(n => n._id === notificationId);
        if (target && !target.isRead) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [token]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    markSenderMessagesRead,
    deleteNotification,
  }), [notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, markSenderMessagesRead, deleteNotification]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
