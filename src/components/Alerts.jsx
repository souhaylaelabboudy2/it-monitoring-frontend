import { useEffect, useState } from "react";
import API from "../services/api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Track alert occurrences for deduplication and escalation state
  const trackAlertHistory = (alerts) => {
    const alertMap = new Map();
    
    alerts.forEach((alert) => {
      const key = `${alert.title}_${alert.type}`;
      if (alertMap.has(key)) {
        const existing = alertMap.get(key);
        // Track escalations (e.g., warning → critical)
        if (
          existing.severity?.toLowerCase() !== alert.severity?.toLowerCase()
        ) {
          existing.escalated = true;
          existing.previousSeverity = existing.severity;
          existing.currentSeverity = alert.severity;
        }
        existing.count = (existing.count || 1) + 1;
        // Update to latest occurrence
        if (new Date(alert.last_seen) > new Date(existing.last_seen)) {
          existing.last_seen = alert.last_seen;
        }
      } else {
        alertMap.set(key, { ...alert, count: 1 });
      }
    });

    return Array.from(alertMap.values());
  };

  const fetchAlerts = () => {
    setLoading(true);
    API.get("/alerts")
      .then((res) => {
        const newData = res.data.data || [];
        setAlerts((prev) => {
          // Merge new alerts with existing ones (keep history)
          const merged = newData.map((newAlert) => {
            const existing = prev.find((p) => p.id === newAlert.id);
            if (existing) {
              // Preserve escalation tracking
              return { ...newAlert, ...existing };
            }
            return newAlert;
          });

          // Add old alerts that are no longer in new data (keep history)
          const oldAlerts = prev.filter(
            (p) => !newData.some((n) => n.id === p.id)
          );

          const combined = [...merged, ...oldAlerts];

          // Apply deduplication and escalation tracking
          return trackAlertHistory(combined)
            .sort((a, b) => {
              // Sort by severity first (critical > warning > info)
              const severityOrder = { critical: 0, warning: 1, info: 2 };
              const aSev =
                severityOrder[a.severity?.toLowerCase()] ||
                severityOrder.info;
              const bSev =
                severityOrder[b.severity?.toLowerCase()] ||
                severityOrder.info;

              if (aSev !== bSev) return aSev - bSev;

              // Then by timestamp (newest first)
              return new Date(b.last_seen) - new Date(a.last_seen);
            });
        });
        setLastRefresh(new Date());
      })
      .catch((err) => console.error("Error fetching alerts:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
    // Fetch every 45 seconds (between 30-60s as requested)
    const interval = setInterval(fetchAlerts, 45000);
    return () => clearInterval(interval);
  }, []);

  // Get severity styling with color variants
  const getSeverityStyles = (severity) => {
    const severityLower = severity?.toLowerCase() || "info";
    const styles = {
      critical: {
        icon: "🔴",
        badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        border: "border-l-4 border-red-500",
        bg: "bg-red-50 dark:bg-red-900/20",
        hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
        pill: "bg-red-200 dark:bg-red-800",
      },
      warning: {
        icon: "⚠️",
        badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        border: "border-l-4 border-yellow-500",
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
        pill: "bg-yellow-200 dark:bg-yellow-800",
      },
      info: {
        icon: "ℹ️",
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        border: "border-l-4 border-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
        pill: "bg-blue-200 dark:bg-blue-800",
      },
    };
    return styles[severityLower] || styles.info;
  };

  const getStatusBadgeColor = (status) => {
    const statusLower = status?.toLowerCase() || "open";
    if (statusLower === "resolved")
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (statusLower === "acknowledged")
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  // Format relative time (e.g., "2 minutes ago")
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return alertTime.toLocaleDateString();
  };

  // Group alerts by severity and then by type
  const groupAlertsBySeverityAndType = () => {
    const severities = { critical: {}, warning: {}, info: {} };

    alerts.forEach((alert) => {
      const severity = alert.severity?.toLowerCase() || "info";
      const type = alert.type?.toLowerCase() || "unknown";

      if (severities[severity]) {
        if (!severities[severity][type]) {
          severities[severity][type] = [];
        }
        severities[severity][type].push(alert);
      }
    });

    return severities;
  };

  // Get icon for alert type
  const getTypeIcon = (type) => {
    const typeIcons = {
      server: "🖥️",
      backup: "💾",
      nvr: "📹",
      network: "🌐",
      database: "🗄️",
      default: "📋",
    };
    return typeIcons[type?.toLowerCase()] || typeIcons.default;
  };

  // Get color for alert type (subtle background)
  const getTypeColor = (type) => {
    const typeColors = {
      server: "bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-300 dark:border-purple-700",
      backup: "bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-indigo-300 dark:border-indigo-700",
      nvr: "bg-cyan-50 dark:bg-cyan-900/10 border-l-4 border-cyan-300 dark:border-cyan-700",
      network: "bg-green-50 dark:bg-green-900/10 border-l-4 border-green-300 dark:border-green-700",
      database: "bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-300 dark:border-orange-700",
      default: "bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-700",
    };
    return typeColors[type?.toLowerCase()] || typeColors.default;
  };

  const AlertCard = ({ alert }) => {
    const styles = getSeverityStyles(alert.severity);
    const statusColor = getStatusBadgeColor(alert.status);

    return (
      <div
        className={`${styles.bg} ${styles.border} ${styles.hover} p-5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left section: Severity icon and content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5 flex-shrink-0">
                {styles.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 break-words">
                  {alert.title}
                  {alert.count > 1 && (
                    <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-bold ${styles.pill} text-gray-900 dark:text-gray-100`}>
                      x{alert.count}
                    </span>
                  )}
                </h4>

                {/* Escalation indicator */}
                {alert.escalated && (
                  <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-orange-700 dark:text-orange-300">
                    <span className="animate-pulse">↗️ ESCALATED:</span>
                    <span>
                      {alert.previousSeverity?.toUpperCase()} →{" "}
                      {alert.currentSeverity?.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles.badge}`}
                  >
                    {alert.severity?.toUpperCase() || "INFO"}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                  >
                    {alert.status?.toUpperCase() || "OPEN"}
                  </span>
                  {alert.type && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {alert.type.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right section: Timestamp */}
          <div className="text-right flex-shrink-0">
            <div className="text-xs">
              {alert.created_at && (
                <>
                  <p className="text-gray-500 dark:text-gray-500 font-medium whitespace-nowrap">
                    Created: {new Date(alert.created_at).toLocaleTimeString()}
                  </p>
                </>
              )}
              <p className="text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                {alert.last_seen
                  ? formatRelativeTime(alert.last_seen)
                  : "N/A"}
              </p>
              <p className="text-gray-500 dark:text-gray-500 mt-1">
                {alert.last_seen
                  ? new Date(alert.last_seen).toLocaleTimeString()
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SeveritySection = ({ severity, icon, title, typeGroups }) => {
    const totalInSection = Object.values(typeGroups).reduce(
      (sum, alerts) => sum + alerts.length,
      0
    );

    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-gray-300 dark:border-gray-600">
          <span className="text-3xl">{icon}</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <span className="ml-auto px-4 py-2 rounded-full text-sm font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {totalInSection}
          </span>
        </div>

        {totalInSection === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">
            ✅ No {title.toLowerCase()}
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(typeGroups).map(([type, typeAlerts]) => {
              if (typeAlerts.length === 0) return null;
              return (
                <TypeSubsection
                  key={type}
                  type={type}
                  icon={getTypeIcon(type)}
                  alerts={typeAlerts}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const TypeSubsection = ({ type, icon, alerts: typeAlerts }) => (
    <div className={`${getTypeColor(type)} p-5 rounded-lg`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h4 className="text-base font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
          {type}
        </h4>
        <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100">
          {typeAlerts.length}
        </span>
      </div>
      <div className="space-y-2 ml-6">
        {typeAlerts.map((alert) => (
          <AlertCard key={`${alert.id}_${alert.count}`} alert={alert} />
        ))}
      </div>
    </div>
  );

  const groupedAlerts = groupAlertsBySeverityAndType();
  const totalAlerts = alerts.length;
  const totalCritical = Object.values(groupedAlerts.critical).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const totalWarning = Object.values(groupedAlerts.warning).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const totalInfo = Object.values(groupedAlerts.info).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          🔔 Alerts Dashboard
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {formatRelativeTime(lastRefresh)}
          </span>
          <span
            className={`px-4 py-2 rounded-full font-semibold text-sm ${
              totalAlerts === 0
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : totalCritical > 0
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {totalAlerts > 0
              ? `${totalAlerts} Alert${totalAlerts !== 1 ? "s" : ""}`
              : "✅ All Clear"}
          </span>
        </div>
      </div>

      {/* Severity summary */}
      {totalAlerts > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-800 dark:text-red-200">
              🔴 {totalCritical}
            </div>
            <div className="text-xs text-red-700 dark:text-red-300 font-semibold">
              Critical
            </div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
              ⚠️ {totalWarning}
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold">
              Warning
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              ℹ️ {totalInfo}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
              Info
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin text-3xl">⏳</div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Fetching alerts...
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && totalAlerts === 0 && (
        <div className="text-center py-16 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-green-800 dark:text-green-200 font-semibold text-lg">
            All systems nominal
          </p>
          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
            No active alerts at this time
          </p>
        </div>
      )}

      {/* Alert sections by severity and type */}
      {!loading && totalAlerts > 0 && (
        <div>
          {totalCritical > 0 && (
            <SeveritySection
              severity="critical"
              icon="🔴"
              title="Critical Alerts"
              typeGroups={groupedAlerts.critical}
            />
          )}
          {totalWarning > 0 && (
            <SeveritySection
              severity="warning"
              icon="⚠️"
              title="Warning Alerts"
              typeGroups={groupedAlerts.warning}
            />
          )}
          {totalInfo > 0 && (
            <SeveritySection
              severity="info"
              icon="ℹ️"
              title="Info Alerts"
              typeGroups={groupedAlerts.info}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Alerts;