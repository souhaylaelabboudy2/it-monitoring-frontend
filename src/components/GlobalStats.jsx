import { useEffect, useState } from "react";
import API from "../services/api";

function GlobalStats() {
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await API.get("/servers");
        const servers = response.data;

        const onlineCount = servers.filter(
          (server) =>
            server.status?.toLowerCase() === "online" ||
            server.status?.toLowerCase() === "active"
        ).length;

        setStats({
          total: servers.length,
          online: onlineCount,
          offline: servers.length - onlineCount,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching servers:", error);
        setLoading(false);
      }
    };

    fetchServers();
    const interval = setInterval(fetchServers, 5000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon, label, value, color }) => (
    <div
      className={`bg-gray-800 rounded-lg p-6 border-l-4 ${color} shadow-lg hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`text-4xl opacity-20`}>{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-20 mb-4"></div>
          <div className="h-10 bg-gray-700 rounded w-16"></div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-20 mb-4"></div>
          <div className="h-10 bg-gray-700 rounded w-16"></div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-20 mb-4"></div>
          <div className="h-10 bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        icon="📊"
        label="Total Servers"
        value={stats.total}
        color="border-blue-500"
      />
      <StatCard
        icon="✅"
        label="Online"
        value={stats.online}
        color="border-green-500"
      />
      <StatCard
        icon="❌"
        label="Offline"
        value={stats.offline}
        color="border-red-500"
      />
    </div>
  );
}

export default GlobalStats;
