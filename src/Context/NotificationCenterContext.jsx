import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

const NotificationCenterContext = createContext();

export function NotificationCenterProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(new Date());

  // Load read notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("readNotifications");
    if (stored) {
      setReadNotificationIds(new Set(JSON.parse(stored)));
    }
  }, []);

  // Save read notifications to localStorage
  const saveReadNotifications = useCallback((readIds) => {
    localStorage.setItem("readNotifications", JSON.stringify(Array.from(readIds)));
  }, []);

  // Fetch alerts and incidents
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [alertsRes, incidentsRes] = await Promise.all([
        API.get("/alerts").catch(() => ({ data: { data: [] } })),
        API.get("/incidents").catch(() => ({ data: { data: [] } })),
      ]);

      const alerts = (alertsRes.data?.data || []).map((alert) => ({
        id: `alert-${alert.id}`,
        originalId: alert.id,
        type: "alert",
        title: alert.title || alert.message || "Alert",
        message: alert.message || alert.description || "",
        severity: alert.severity?.toLowerCase() || "info",
        timestamp: alert.last_seen || alert.created_at || new Date().toISOString(),
        icon: "🔔",
        alertType: alert.type?.toLowerCase() || "general",
      }));

      const incidents = (incidentsRes.data?.data || []).map((incident) => ({
        id: `incident-${incident.id}`,
        originalId: incident.id,
        type: "incident",
        title: incident.title || incident.description || "Incident",
        message: incident.description || "",
        severity: incident.severity?.toLowerCase() || "info",
        timestamp: incident.created_at || new Date().toISOString(),
        icon: "⚠️",
        status: incident.status?.toLowerCase() || "open",
      }));

      // Combine and sort by timestamp (newest first)
      const combined = [...alerts, ...incidents].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setNotifications(combined);
      setLastFetch(new Date());
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch every 5 minutes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(
    (notificationId) => {
      const newReadIds = new Set(readNotificationIds);
      newReadIds.add(notificationId);
      setReadNotificationIds(newReadIds);
      saveReadNotifications(newReadIds);
    },
    [readNotificationIds, saveReadNotifications]
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadNotificationIds(allIds);
    saveReadNotifications(allIds);
  }, [notifications, saveReadNotifications]);

  // Get unread count
  const unreadCount = notifications.filter((n) => !readNotificationIds.has(n.id)).length;

  // Get critical unread alerts
  const criticalUnread = notifications.filter(
    (n) => n.severity === "critical" && !readNotificationIds.has(n.id)
  );

  const value = {
    notifications,
    readNotificationIds,
    loading,
    lastFetch,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    criticalUnread,
  };

  return (
    <NotificationCenterContext.Provider value={value}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter() {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error(
      "useNotificationCenter must be used within NotificationCenterProvider"
    );
  }
  return context;
}
