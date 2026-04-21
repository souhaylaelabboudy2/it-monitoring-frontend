import { useEffect, useState } from "react";
import API from "../services/api";
import echo from "../echo";

function NvrDashboard() {
  const [nvrs, setNvrs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 STEP 4: Polling as fallback only (15s)
  useEffect(() => {
    const fetchNvrData = async () => {
      try {
        const response = await API.get("/nvr");
        setNvrs(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching NVR data:", error);
        setLoading(false);
      }
    };

    fetchNvrData();
    const interval = setInterval(fetchNvrData, 15000);

    return () => clearInterval(interval);
  }, []);

  // 🟢 STEP 6: WebSocket real-time updates for NVR
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
        bg: "bg-green-900",
        border: "border-green-500",
        text: "text-green-100",
        dot: "bg-green-500",
      };
    }
    return {
      bg: "bg-red-900",
      border: "border-red-500",
      text: "text-red-100",
      dot: "bg-red-500",
    };
  };

  const getDiskUsageColor = (usage) => {
    if (usage < 50) return "bg-green-500";
    if (usage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      // 🟢 STEP 1 & 2: section wrapper + dark/light mode
      <div className="mt-10 text-black dark:text-white">
        <h2 className="text-2xl font-bold mb-6">NVR Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">Loading NVR data...</p>
      </div>
    );
  }

  return (
    // 🟢 STEP 1 & 2: no more full-page wrapper, integrated section
    <div className="mt-10 text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-6">NVR Dashboard</h2>

      {nvrs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No NVR systems found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nvrs.map((nvr) => {
            const statusColors = getStatusColor(nvr.status);
            // 🟢 STEP 3: fixed field name cameras_count
            const diskUsagePercent = nvr.disk_usage || 0;

            return (
              <div
                key={nvr.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-all shadow-lg"
              >
                {/* Header with Name and Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold truncate">
                    {nvr.name}
                  </h3>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusColors.bg} ${statusColors.border} border`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusColors.dot}`}></span>
                    <span className={`text-xs font-medium ${statusColors.text}`}>
                      {nvr.status}
                    </span>
                  </div>
                </div>

                {/* Cameras Count */}
                <div className="mb-5 pb-5 border-b border-gray-300 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Cameras</span>
                    <span className="font-semibold">
                      {/* 🟢 STEP 3: cameras_count not camera_count */}
                      {nvr.cameras_count || 0}
                    </span>
                  </div>
                </div>

                {/* Disk Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Disk Usage</span>
                    <span className="font-semibold text-sm">{diskUsagePercent}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getDiskUsageColor(diskUsagePercent)}`}
                      style={{ width: `${diskUsagePercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {diskUsagePercent < 50 && "Storage healthy"}
                    {diskUsagePercent >= 50 && diskUsagePercent < 80 && "Monitor storage"}
                    {diskUsagePercent >= 80 && "Critical storage level"}
                  </p>
                </div>

                {/* Location */}
                {nvr.location && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Location: {nvr.location}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NvrDashboard;