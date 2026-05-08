import { useEffect, useState } from "react";
import API from "../services/api";
import echo from "../echo";

function GlobalStats() {
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });
  const [loading, setLoading] = useState(true);

  const computeStats = (servers) => {
    const onlineCount = servers.filter(
      (s) => s.status?.toLowerCase() === "online"
    ).length;

    setStats({
      total: servers.length,
      online: onlineCount,
      offline: servers.length - onlineCount,
    });
  };

  // Transform Zabbix hosts to server format
  const transformZabbixHosts = (hosts) => {
    if (!Array.isArray(hosts)) return [];
    
    return hosts.map((host) => ({
      id: host.hostid || Math.random(),
      name: host.name || "Unknown Host",
      status: host.status === "0" ? "online" : "offline", // 0=online, 1=offline
      host: host.host || "",
    }));
  };

  // ✅ Fetch from Zabbix API
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await API.get("/zabbix/hosts");
        // Handle Zabbix API response format: { result: [ { hostid, name, status, ... } ] }
        const hosts = response.data.result || response.data;
        const transformedServers = transformZabbixHosts(hosts);
        computeStats(transformedServers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Zabbix hosts:", error);
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
          e.previous?.status?.toLowerCase() === "online";
        const isOnline =
          e.server?.status?.toLowerCase() === "online";

        if (wasOnline === isOnline) return prev;

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

  const StatCard = ({ icon, label, value, color, bgColor, borderColor }) => (
    <div
      className={`${bgColor} ${borderColor} border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-4xl font-bold mt-3 ${color}`}>
            {value}
          </p>
          <div className="mt-2 h-1 w-12 rounded-full" style={{
            background: color === 'text-blue-600 dark:text-blue-400' ? '#3b82f6' : 
                       color === 'text-green-600 dark:text-green-400' ? '#10b981' : '#ef4444'
          }}></div>
        </div>
        <div className="text-5xl opacity-30">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-4"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard 
        icon="📊" 
        label="Total Servers" 
        value={stats.total} 
        color="text-blue-600 dark:text-blue-400"
        bgColor="bg-blue-50 dark:bg-blue-900/20"
        borderColor="border-blue-200 dark:border-blue-700"
      />
      <StatCard 
        icon="✅" 
        label="Online" 
        value={stats.online} 
        color="text-green-600 dark:text-green-400"
        bgColor="bg-green-50 dark:bg-green-900/20"
        borderColor="border-green-200 dark:border-green-700"
      />
      <StatCard 
        icon="❌" 
        label="Offline" 
        value={stats.offline} 
        color="text-red-600 dark:text-red-400"
        bgColor="bg-red-50 dark:bg-red-900/20"
        borderColor="border-red-200 dark:border-red-700"
      />
    </div>
  );
}

export default GlobalStats;