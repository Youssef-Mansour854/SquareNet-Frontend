import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, MessageSquare, Star, Home, Info, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { useNavigate } from 'react-router-dom';

const typeIcon = {
  new_message: <MessageSquare size={16} className="text-blue-500" />,
  new_review: <Star size={16} className="text-amber-500" />,
  property_sold: <Home size={16} className="text-green-500" />,
  wishlist_update: <Home size={16} className="text-rose-500" />,
  system: <Info size={16} className="text-zinc-500" />,
};

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(dateStr).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
};

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    // Navigate based on type
    if (notification.type === 'new_message') {
      navigate('/chat');
    } else if (notification.property) {
      // Mongoose populate returns `id` (virtual), not `_id`
      const propertyId = typeof notification.property === 'string' 
        ? notification.property 
        : (notification.property.id || notification.property._id);
      if (propertyId) {
        navigate(`/property/${propertyId}`);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell
          size={20}
          className={`${isOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          strokeWidth={2.5}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute end-0 top-full mt-2 w-[calc(100vw-1.5rem)] max-w-[360px] max-h-[480px] bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl overflow-hidden z-[999] flex flex-col"
             style={{ animationName: 'fadeSlideDown', animationDuration: '0.2s', animationFillMode: 'forwards' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-zinc-50 dark:bg-zinc-800/50">
            <h3 className="font-bold text-foreground text-sm">الإشعارات</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
                  title="قراءة الكل"
                >
                  <CheckCheck size={14} />
                  قراءة الكل
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Bell size={40} className="opacity-30" />
                <p className="text-sm font-medium">لا توجد إشعارات حالياً</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`group flex items-start gap-3 px-4 py-3 border-b border-border/50 cursor-pointer transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                    !notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Type Icon */}
                  <div className="mt-1 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    {typeIcon[notification.type] || typeIcon.system}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-right">
                    <p className={`text-sm leading-relaxed ${!notification.isRead ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{notification.body}</p>
                    )}
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(notification._id); }}
                        className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        title="تعيين كمقروء"
                      >
                        <Check size={14} className="text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}
                      className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>

                  {/* Unread Dot */}
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationsDropdown;
