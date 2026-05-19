import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardNavbar from "./DashboardNavbar";

function Incidents({ onLogout, toggleTheme }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch incidents from API
  const fetchIncidents = () => {
    setLoading(true);
    API.get("/incidents")
      .then((res) => {
        const newData = res.data.data || [];
        setIncidents((prev) => {
          // Merge new incidents with existing ones, keeping history
          const merged = newData.map((newIncident) => {
            const existing = prev.find((p) => p.id === newIncident.id);
            return existing ? { ...newIncident, ...existing } : newIncident;
          });

          // Keep old incidents not in new data (preserve resolved history)
          const oldIncidents = prev.filter(
            (p) => !newData.some((n) => n.id === p.id)
          );

          const combined = [...merged, ...oldIncidents];

          // Sort: Open first (by severity), then Resolved
          return combined.sort((a, b) => {
            // Status priority: open > resolved
            const statusOrder = { open: 0, resolved: 1 };
            const aStatus = statusOrder[a.status?.toLowerCase()] || 0;
            const bStatus = statusOrder[b.status?.toLowerCase()] || 0;

            if (aStatus !== bStatus) return aStatus - bStatus;

            // Within same status, sort by severity (critical > warning > info)
            const severityOrder = { critical: 0, warning: 1, info: 2 };
            const aSev =
              severityOrder[a.severity?.toLowerCase()] ||
              severityOrder.info;
            const bSev =
              severityOrder[b.severity?.toLowerCase()] ||
              severityOrder.info;

            if (aSev !== bSev) return aSev - bSev;

            // Then by timestamp (newest first)
            return new Date(b.created_at) - new Date(a.created_at);
          });
        });
        setLastRefresh(new Date());
      })
      .catch((err) => console.error("Error fetching incidents:", err))
      .finally(() => setLoading(false));
  };

  // Resolve incident
  const resolveIncident = async (incidentId) => {
    setResolving(incidentId);
    try {
      await API.put(`/incidents/${incidentId}/resolve`, {
        status: "resolved",
      });
      // Update local state
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === incidentId
            ? { ...incident, status: "resolved" }
            : incident
        )
      );
    } catch (err) {
      console.error("Error resolving incident:", err);
    } finally {
      setResolving(null);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 300000);
    return () => clearInterval(interval);
  }, []);

  // Get severity styling
  const getSeverityStyles = (severity) => {
    const severityLower = severity?.toLowerCase() || "info";
    const styles = {
      critical: {
        icon: "🔴",
        badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        border: "border-l-4 border-red-500",
        bg: "bg-red-50 dark:bg-red-900/20",
        hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
      },
      warning: {
        icon: "⚠️",
        badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        border: "border-l-4 border-yellow-500",
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
      },
      info: {
        icon: "ℹ️",
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        border: "border-l-4 border-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
      },
    };
    return styles[severityLower] || styles.info;
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const statusLower = status?.toLowerCase() || "open";
    if (statusLower === "resolved")
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const incidentTime = new Date(timestamp);
    const diffMs = now - incidentTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return incidentTime.toLocaleDateString();
  };

  // Group incidents by status
  const groupIncidentsByStatus = () => {
    const grouped = { open: [], resolved: [] };
    incidents.forEach((incident) => {
      const status = incident.status?.toLowerCase() || "open";
      if (grouped[status]) {
        grouped[status].push(incident);
      }
    });
    return grouped;
  };

  // Incident Card Component
  const IncidentCard = ({ incident }) => {
    const styles = getSeverityStyles(incident.severity);
    const statusColor = getStatusBadgeColor(incident.status);
    const isResolved = incident.status?.toLowerCase() === "resolved";

    return (
      <div
        className={`${styles.bg} ${styles.border} ${styles.hover} p-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left section: Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <span className="text-3xl mt-0.5 flex-shrink-0">
                {styles.icon}
              </span>
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 break-words">
                  {incident.title}
                </h3>

                {/* Description */}
                {incident.description && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                    {incident.description}
                  </p>
                )}

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${styles.badge}`}
                  >
                    {incident.severity?.toUpperCase() || "INFO"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                  >
                    {incident.status?.toUpperCase() || "OPEN"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right section: Timestamp & Actions */}
          <div className="text-right flex-shrink-0 flex flex-col items-end gap-3">
            {/* Timestamp */}
            <div className="text-xs">
              <p className="text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                {incident.created_at
                  ? formatRelativeTime(incident.created_at)
                  : "N/A"}
              </p>
              <p className="text-gray-500 dark:text-gray-500 mt-1">
                {incident.created_at
                  ? new Date(incident.created_at).toLocaleTimeString()
                  : ""}
              </p>
            </div>

            {/* Resolve Button */}
            {!isResolved && (
              <button
                onClick={() => resolveIncident(incident.id)}
                disabled={resolving === incident.id}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
              >
                {resolving === incident.id ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Resolving...
                  </span>
                ) : (
                  "✓ Resolve"
                )}
              </button>
            )}

            {isResolved && (
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-semibold rounded-lg text-sm">
                ✓ Resolved
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Status Section Component
  const StatusSection = ({ status, icon, title, incidents: statusIncidents }) => {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-gray-300 dark:border-gray-600">
          <span className="text-3xl">{icon}</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <span className="ml-auto px-4 py-2 rounded-full text-sm font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {statusIncidents.length}
          </span>
        </div>

        {statusIncidents.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">
            {status === "open"
              ? "✅ No open incidents"
              : "📋 No resolved incidents"}
          </p>
        ) : (
          <div className="space-y-4">
            {statusIncidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const groupedIncidents = groupIncidentsByStatus();
  const totalIncidents = incidents.length;
  const totalOpen = groupedIncidents.open.length;
  const totalResolved = groupedIncidents.resolved.length;
  const criticalIncidents = incidents.filter(
    (i) => i.severity?.toLowerCase() === "critical"
  ).length;

  return (
    <>
      {onLogout && toggleTheme && <DashboardNavbar onLogout={onLogout} toggleTheme={toggleTheme} />}
      <div className={onLogout && toggleTheme ? "p-6 bg-white dark:bg-gray-900" : "p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg"}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            📋 Incidents Dashboard
          </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {formatRelativeTime(lastRefresh)}
          </span>
          <span
            className={`px-4 py-2 rounded-full font-semibold text-sm ${
              totalOpen === 0
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : criticalIncidents > 0
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {totalOpen > 0
              ? `${totalOpen} Open`
              : "✅ All Resolved"}
          </span>
        </div>
      </div>

      {/* Status Summary */}
      {totalIncidents > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-800 dark:text-red-200">
              🔴 {totalOpen}
            </div>
            <div className="text-xs text-red-700 dark:text-red-300 font-semibold">
              Open
            </div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              ✓ {totalResolved}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300 font-semibold">
              Resolved
            </div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
              ⚠️ {criticalIncidents}
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold">
              Critical
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
              Fetching incidents...
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && totalIncidents === 0 && (
        <div className="text-center py-16 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-green-800 dark:text-green-200 font-semibold text-lg">
            All systems operational
          </p>
          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
            No incidents to resolve
          </p>
        </div>
      )}

      {/* Incident sections by status */}
      {!loading && totalIncidents > 0 && (
        <div>
          {totalOpen > 0 && (
            <StatusSection
              status="open"
              icon="🔴"
              title="Open Incidents"
              incidents={groupedIncidents.open}
            />
          )}
          {totalResolved > 0 && (
            <StatusSection
              status="resolved"
              icon="✅"
              title="Resolved Incidents"
              incidents={groupedIncidents.resolved}
            />
          )}
        </div>
      )}
    </div>
    </>
  );
}

export default Incidents;