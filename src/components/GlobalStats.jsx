import { useEffect, useState } from "react";
import API from "../services/api";
import echo from "../echo";

function GlobalStats() {
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
  const [loading, setLoading] = useState(true);

  const computeStats = (servers) => {
    const onlineCount = servers.filter(
      (s) =>
        s.status?.toLowerCase() === "online" ||
        s.status?.toLowerCase() === "active"
    ).length;

    setStats({
      total: servers.length,
      online: onlineCount,
      offline: servers.length - onlineCount,
    });
  };

  // ✅ Fallback polling 15s
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await API.get("/servers");
        computeStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching servers:", error);
        setLoading(false);
      }
    };

    fetchServers();
    const interval = setInterval(fetchServers, 15000);

    return () => clearInterval(interval);
  }, []);

  // ✅ WebSocket real-time update
  useEffect(() => {
    const channel = echo.channel("servers");

    channel.listen("ServerUpdated", (e) => {
      setStats((prev) => {
        const wasOnline =
          e.previous?.status?.toLowerCase() === "online" ||
          e.previous?.status?.toLowerCase() === "active";
        const isOnline =
          e.server?.status?.toLowerCase() === "online" ||
          e.server?.status?.toLowerCase() === "active";

        if (wasOnline === isOnline) return prev; // مابدلش والو

        return {
          ...prev,
          online: isOnline ? prev.online + 1 : prev.online - 1,
          offline: isOnline ? prev.offline - 1 : prev.offline + 1,
        };
      });
    });

    return () => {
      channel.stopListening("ServerUpdated");
      echo.leaveChannel("servers");
    };
  }, []);

  const StatCard = ({ icon, label, value, color }) => (
    <div
      className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border-l-4 ${color} shadow-lg hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {label}
          </p>
          <p className="text-3xl font-bold text-black dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-4"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard icon="📊" label="Total Servers" value={stats.total} color="border-blue-500" />
      <StatCard icon="✅" label="Online" value={stats.online} color="border-green-500" />
      <StatCard icon="❌" label="Offline" value={stats.offline} color="border-red-500" />
    </div>
  );
}

export default GlobalStats;