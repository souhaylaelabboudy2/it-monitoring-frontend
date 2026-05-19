import { useRef, useEffect, useState } from "react";
import { useNotificationCenter } from "../Context/NotificationCenterContext";
import { useNotification } from "../Context/NotificationContext";

function NotificationBell() {
  const { notifications, readNotificationIds, markAsRead, markAllAsRead, unreadCount, criticalUnread } = useNotificationCenter();
  const { showInfo } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [shownCriticalIds, setShownCriticalIds] = useState(new Set());
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  // Show toast for new critical alerts
  useEffect(() => {
    criticalUnread.forEach((alert) => {
      if (!shownCriticalIds.has(alert.id)) {
        showInfo(`🔴 Critical alert: ${alert.title}`, 6000);
        setShownCriticalIds((prev) => new Set([...prev, alert.id]));
      }
    });
  }, [criticalUnread, shownCriticalIds, showInfo]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-200";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200";
      case "info":
        return "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-100 dark:bg-gray-800/30 border-l-4 border-gray-500 text-gray-800 dark:text-gray-200";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "🔴";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📌";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const NotificationItem = ({ notification }) => {
    const isRead = readNotificationIds.has(notification.id);
    return (
      <div
        onClick={() => {
          markAsRead(notification.id);
        }}
        className={`p-4 border-l-4 cursor-pointer transition-all hover:shadow-md ${getSeverityColor(notification.severity)} ${
          !isRead ? "bg-opacity-60 dark:bg-opacity-40 font-medium" : "bg-opacity-30 dark:bg-opacity-20"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg flex-shrink-0">{getSeverityIcon(notification.severity)}</span>
              <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
              {!isRead && <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />}
            </div>
            {notification.message && (
              <p className="text-xs opacity-75 line-clamp-2">{notification.message}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs opacity-60">
              <span>
                {notification.type === "alert"
                  ? `${notification.alertType || "alert"}`.toUpperCase()
                  : `INCIDENT`.toUpperCase()}
              </span>
              <span>•</span>
              <span>{formatTime(notification.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-slate-800 transition"
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-12 w-96 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs px-2 py-1 rounded bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">You're all caught up! 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {notifications.slice(0, 10).map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="border-t border-gray-200 dark:border-slate-700 px-4 py-2 text-center bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing 10 of {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
