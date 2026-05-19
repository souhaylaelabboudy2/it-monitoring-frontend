import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardNavbar from "./DashboardNavbar";
import echo from "../echo";

function NvrDashboard({ onLogout, toggleTheme }) {
  const [nvrs, setNvrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const fetchNvrData = async () => {
      try {
        const response = await API.get("/nvr");
        setNvrs(
          Array.isArray(response.data.data)
            ? response.data.data
            : Array.isArray(response.data)
            ? response.data
            : []
        );
        setLastRefresh(new Date());
        setLoading(false);
      } catch (error) {
        console.error("Error fetching NVR data:", error);
        setLoading(false);
      }
    };

    fetchNvrData();
    const interval = setInterval(fetchNvrData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = echo.channel("nvrs");
    channel.listen("NvrUpdated", (e) => {
      setNvrs((prev) =>
        prev.map((n) => (n.name === e.nvr.name ? e.nvr : n))
      );
    });
    return () => {
      channel.stopListening("NvrUpdated");
      echo.leaveChannel("nvrs");
    };
  }, []);

  const getStatusColor = (status) => {
    if (status?.toLowerCase() === "online" || status?.toLowerCase() === "active") {
      return { 
        bg: "bg-green-50 dark:bg-green-900/20", 
        border: "border-green-200 dark:border-green-700", 
        text: "text-green-800 dark:text-green-200", 
        dot: "bg-green-500",
        badge: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
      };
    }
    return { 
      bg: "bg-red-50 dark:bg-red-900/20", 
      border: "border-red-200 dark:border-red-700", 
      text: "text-red-800 dark:text-red-200", 
      dot: "bg-red-500",
      badge: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
    };
  };

  const getDiskUsageColor = (usage) => {
    if (usage < 50) return "bg-green-500";
    if (usage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="mt-10 text-black dark:text-white">
        <h2 className="text-2xl font-bold mb-6">NVR Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">Loading NVR data...</p>
      </div>
    );
  }

  return (
    <>
      {onLogout && toggleTheme && <DashboardNavbar onLogout={onLogout} toggleTheme={toggleTheme} />}
      <div className="mt-10 text-black dark:text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold mb-6">NVR Dashboard</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastRefresh.toLocaleString()}</div>
        </div>

      {!Array.isArray(nvrs) || nvrs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No NVR systems found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(nvrs) && nvrs.map((nvr) => {
            const statusColors = getStatusColor(nvr.status);
            const diskUsagePercent = nvr.disk_usage || 0;

            return (
              <div
                key={nvr.id}
                className={`${statusColors.bg} ${statusColors.border} border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      📹 {nvr.name}
                    </h3>
                    {nvr.location && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        📍 {nvr.location}
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusColors.badge} flex-shrink-0 ml-2`}>
                    <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${statusColors.dot}`}></span>
                    <span className="text-xs font-bold">{nvr.status?.toUpperCase()}</span>
                  </div>
                </div>

                {/* Cameras */}
                <div className="mb-5 pb-5 border-b border-gray-300 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                      🎥 Cameras
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{nvr.cameras_count || 0}</span>
                  </div>
                </div>

                {/* Disk Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                      💾 Storage
                    </span>
                    <span className={`text-sm font-bold ${
                      diskUsagePercent >= 80 ? 'text-red-600 dark:text-red-400' :
                      diskUsagePercent >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {diskUsagePercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getDiskUsageColor(diskUsagePercent)}`}
                      style={{ width: `${diskUsagePercent}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs font-medium mt-1 ${
                    diskUsagePercent >= 80 ? 'text-red-600 dark:text-red-400' :
                    diskUsagePercent >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {diskUsagePercent < 50 && "✅ Storage healthy"}
                    {diskUsagePercent >= 50 && diskUsagePercent < 80 && "⚠️ Monitor storage"}
                    {diskUsagePercent >= 80 && "🔴 Critical storage level"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}

export default NvrDashboard;