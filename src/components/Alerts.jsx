import { useEffect, useState } from "react";
import API from "../services/api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = () => {
    setLoading(true);
    API.get("/alerts")
      .then((res) => {
        // Sort by latest last_seen
        const allAlerts = res.data.data || [];
        const sorted = allAlerts.sort((a, b) => 
          new Date(b.last_seen) - new Date(a.last_seen)
        );
        setAlerts(sorted);
      })
      .catch((err) => console.error("Error fetching alerts:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    const severityLower = severity?.toLowerCase() || "info";
    const colors = {
      critical: { badge: "bg-red-100 text-red-800" },
      warning: { badge: "bg-yellow-100 text-yellow-800" },
      info: { badge: "bg-blue-100 text-blue-800" }
    };
    return colors[severityLower] || colors.info;
  };

  const getStatusBadgeColor = (status) => {
    const statusLower = status?.toLowerCase() || "open";
    if (statusLower === "resolved") return "bg-green-100 text-green-800";
    if (statusLower === "acknowledged") return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  // Group alerts by type and limit to 5 per group
  const getAlertsByType = (type) => {
    return alerts
      .filter((a) => a.type?.toLowerCase() === type.toLowerCase())
      .slice(0, 5);
  };

  const AlertSection = ({ title, icon, type, alerts: sectionAlerts }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <span className="ml-auto px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-full">
          {sectionAlerts.length} alerts
        </span>
      </div>

      {sectionAlerts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm py-4">
          ✅ No {title.toLowerCase()} alerts
        </p>
      ) : (
        <div className="space-y-2">
          {sectionAlerts.map((alert) => {
            const severityColors = getSeverityColor(alert.severity);
            const statusColor = getStatusBadgeColor(alert.status);
            return (
              <div
                key={alert.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                      {alert.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${severityColors.badge}`}
                      >
                        {alert.severity?.toUpperCase() || "INFO"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {alert.last_seen
                        ? new Date(alert.last_seen).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const serverAlerts = getAlertsByType("server");
  const backupAlerts = getAlertsByType("backup");
  const nvrAlerts = getAlertsByType("nvr");

  const totalAlerts = serverAlerts.length + backupAlerts.length + nvrAlerts.length;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔔 Alerts Dashboard
        </h2>
        <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
          Total: {totalAlerts}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading alerts...</p>
        </div>
      ) : totalAlerts === 0 ? (
        <div className="text-center py-12 bg-green-50 dark:bg-green-900 rounded-lg border-2 border-green-200 dark:border-green-700">
          <p className="text-green-800 dark:text-green-200 font-semibold">
            ✅ All systems normal - No alerts
          </p>
        </div>
      ) : (
        <div>
          <AlertSection
            title="Servers"
            icon="🖥️"
            type="server"
            alerts={serverAlerts}
          />
          <AlertSection
            title="Backups"
            icon="💾"
            type="backup"
            alerts={backupAlerts}
          />
          <AlertSection
            title="NVR Devices"
            icon="📹"
            type="nvr"
            alerts={nvrAlerts}
          />
        </div>
      )}
    </div>
  );
}

export default Alerts;