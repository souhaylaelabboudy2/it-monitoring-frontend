import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";
import ServerCard from "../components/ServerCard";
import ServerChart from "../components/ServerChart";
import { useRetryableApi } from "../hooks/useRetryableApi";

function Servers({ onLogout, toggleTheme }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { fetchWithRetry } = useRetryableApi();

  const transformZabbixHosts = (hosts) => {
    if (!Array.isArray(hosts)) return [];

    return hosts.map((host) => ({
      id: host.hostid,
      name: host.name || host.host || "Unknown Host",
      status: host.status === "0" || (host.status && String(host.status).toLowerCase() === "online") ? "online" : "offline",
      cpu_usage: host.cpu_usage !== undefined ? host.cpu_usage : null,
      ram_usage: host.ram_usage !== undefined ? host.ram_usage : null,
      disk_usage: host.disk_usage !== undefined ? host.disk_usage : null,
      host: host.host || "",
      zabbix_status: host.status,
    }));
  };

  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true);
      try {
        const result = await fetchWithRetry(
          async () => {
            const response = await API.get("/zabbix/hosts");
            const data = response.data?.value || response.data?.result || response.data;
            return data;
          },
          "Server inventory",
          3,
          1000
        );
        setServers(transformZabbixHosts(result));
      } catch (err) {
        console.error("Error fetching servers:", err);
        setServers([]);
      }
      setLastRefresh(new Date());
      setLoading(false);
    };

    fetchServers();
    const interval = setInterval(fetchServers, 300000);
    return () => clearInterval(interval);
  }, [fetchWithRetry]);

  const metrics = useMemo(() => {
    const total = servers.length;
    const online = servers.filter((s) => s.status === "online").length;
    const offline = servers.filter((s) => s.status === "offline").length;
    return { total, online, offline };
  }, [servers]);

  return (
    <>
      <DashboardNavbar onLogout={onLogout} toggleTheme={toggleTheme} />
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold">🖥️ Server Monitoring</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              A dedicated server operations view with real-time host status, CPU/RAM/Disk visibility, and server metrics.
            </p>
          </div>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div>Last refreshed: {lastRefresh.toLocaleString()}</div>
            <div>{loading ? "Loading servers..." : `${metrics.total} servers loaded`}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Total Servers</p>
            <p className="mt-4 text-4xl font-bold text-slate-900 dark:text-white">{metrics.total}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Online</p>
            <p className="mt-4 text-4xl font-bold text-emerald-600 dark:text-emerald-300">{metrics.online}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Offline</p>
            <p className="mt-4 text-4xl font-bold text-rose-600 dark:text-rose-300">{metrics.offline}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading server inventory...</div>
        ) : servers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No servers available.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {servers.map((server) => (
              <div key={server.id} className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                <ServerCard server={server} />
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{server.name} Metrics</h2>
                  <ServerChart server={server} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Servers;
