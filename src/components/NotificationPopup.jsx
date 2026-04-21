import { useEffect, useState } from "react";
import API from "../services/api";

function NotificationPopup() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await API.get("/alerts");
        const alerts = response.data;

        // Filter new alerts (not already in notifications)
        alerts.forEach((alert) => {
          const exists = notifications.some((n) => n.id === alert.id);
          if (!exists) {
            addNotification(alert);
          }
        });
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = (alert) => {
    const id = alert.id || Date.now();
    const notification = {
      id,
      message: alert.message,
      type: alert.type || "server",
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const getAlertStyles = (type) => {
    const baseStyles =
      "flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4";

    switch (type) {
      case "server":
        return `${baseStyles} bg-red-900 border-red-500 text-red-100`;
      case "nvr":
        return `${baseStyles} bg-yellow-900 border-yellow-500 text-yellow-100`;
      case "backup":
        return `${baseStyles} bg-orange-900 border-orange-500 text-orange-100`;
      default:
        return `${baseStyles} bg-gray-800 border-gray-500 text-gray-100`;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "server":
        return "⚠️";
      case "nvr":
        return "📹";
      case "backup":
        return "💾";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getAlertStyles(
            notification.type
          )} animate-fade-in-slide pointer-events-auto max-w-sm`}
        >
          <span className="text-xl flex-shrink-0">
            {getAlertIcon(notification.type)}
          </span>
          <div className="flex-1">
            <p className="font-semibold capitalize">{notification.type} Alert</p>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
          <button
            onClick={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
            className="text-xl opacity-70 hover:opacity-100 flex-shrink-0 leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationPopup;
