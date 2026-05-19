import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message, type = "info", duration = 5000, actionLabel = null, onAction = null) => {
      const id = Date.now();
      const notification = {
        id,
        message,
        type, // "info", "error", "success", "warning"
        actionLabel,
        onAction,
      };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [removeNotification]
  );

  const showError = useCallback(
    (message, duration = 5000, actionLabel = null, onAction = null) => {
      return addNotification(message, "error", duration, actionLabel, onAction);
    },
    [addNotification]
  );

  const showSuccess = useCallback(
    (message, duration = 4000) => {
      return addNotification(message, "success", duration);
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message, duration = 4000) => {
      return addNotification(message, "info", duration);
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message, duration = 5000) => {
      return addNotification(message, "warning", duration);
    },
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showError,
    showSuccess,
    showInfo,
    showWarning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
