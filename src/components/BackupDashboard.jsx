import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardNavbar from "./DashboardNavbar";

function BackupDashboard({ onLogout, toggleTheme }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const fetchBackups = () => {
      API.get("/backups")
        .then((res) => {
          setBackups(res.data.data);
          setLastRefresh(new Date());
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching backups:", err);
          setLoading(false);
        });
    };

    fetchBackups();
    const interval = setInterval(fetchBackups, 300000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "pending";
    if (statusLower === "success") {
      return {
        badge: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200",
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-700",
        icon: "✅"
      };
    } else if (statusLower === "failed") {
      return {
        badge: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200",
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-700",
        icon: "❌"
      };
    }
    return {
      badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-700",
      icon: "⏳"
    };
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin text-3xl">⏳</div>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Loading backups...</p>
      </div>
    );
  }

  // Calculate backup stats
  const totalBackups = backups.length;
  const successCount = backups.filter(b => b.status?.toLowerCase() === "success").length;
  const failedCount = backups.filter(b => b.status?.toLowerCase() === "failed").length;
  const pendingCount = backups.filter(b => b.status?.toLowerCase() === "pending").length;

  return (
    <>
      {onLogout && toggleTheme && <DashboardNavbar onLogout={onLogout} toggleTheme={toggleTheme} />}
      <div className={onLogout && toggleTheme ? "p-6 bg-white dark:bg-gray-900" : "p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              💾 Backup Dashboard
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastRefresh.toLocaleString()}
            </div>
          </div>
        
        {/* Backup Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalBackups}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Success</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{successCount}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Failed</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failedCount}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
          </div>
        </div>
      </div>

      {backups.length === 0 ? (
        <div className="p-6 text-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
            📭 No backups found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {backups.map((backup, index) => {
            const statusColor = getStatusColor(backup.status);
            return (
              <div
                key={index}
                className={`${statusColor.bg} ${statusColor.border} border rounded-lg p-4 shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                    {backup.server_name}
                  </h3>
                  <span className="text-lg flex-shrink-0">{statusColor.icon}</span>
                </div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColor.badge} mb-3`}>
                  {backup.status?.toUpperCase() || "PENDING"}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  📅 {backup.created_at ? new Date(backup.created_at).toLocaleString() : "N/A"}
                </p>
                {backup.size && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    💾 {backup.size}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}

export default BackupDashboard;
