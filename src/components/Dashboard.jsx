import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import GlobalStats from "./GlobalStats";
import DashboardNavbar from "./DashboardNavbar";
import echo from "../echo";
import { useRetryableApi } from "../hooks/useRetryableApi";

function Dashboard({ onLogout, toggleTheme }) {
  const [servers, setServers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [backups, setBackups] = useState([]);
  const [nvrs, setNvrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { fetchWithRetry } = useRetryableApi();

  // Transform Zabbix host data to server format - use real backend data only
  const transformZabbixHosts = (hosts) => {
    if (!Array.isArray(hosts)) return [];

    return hosts.map((host) => ({
      id: host.hostid,
      name: host.name || "Unknown Host",
      status: host.status === "0" ? "online" : "offline", // 0=online, 1=offline
      cpu_usage: host.cpu_usage !== undefined ? host.cpu_usage : null,
      ram_usage: host.ram_usage !== undefined ? host.ram_usage : null,
      disk_usage: host.disk_usage !== undefined ? host.disk_usage : null,
      host: host.host || "",
      zabbix_status: host.status,
    }));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch Zabbix hosts with retry
        const serversData = await fetchWithRetry(
          async () => {
            const res = await API.get("/zabbix/hosts");
            return res.data?.value || res.data?.result || res.data;
          },
          "Server inventory",
          3,
          1000
        );
        setServers(transformZabbixHosts(serversData));
      } catch (err) {
        console.error("Failed to fetch servers even after retries:", err);
        setServers([]);
      }

      // Fetch other data without retry (less critical)
      Promise.all([
        API.get("/alerts").catch((err) => {
          console.error("Error fetching alerts:", err);
          return { data: { data: [] } };
        }),
        API.get("/incidents").catch((err) => {
          console.error("Error fetching incidents:", err);
          return { data: { data: [] } };
        }),
        API.get("/backups").catch((err) => {
          console.error("Error fetching backups:", err);
          return { data: { data: [] } };
        }),
        API.get("/nvrs").catch((err) => {
          console.error("Error fetching NVRs:", err);
          return { data: { data: [] } };
        }),
      ])
        .then(([alertsRes, incidentsRes, backupsRes, nvrsRes]) => {
          setAlerts((prev) => {
            const newAlerts = alertsRes.data.data || [];
            return newAlerts.length > 0 ? newAlerts : prev;
          });

          setIncidents((prev) => {
            const newIncidents = incidentsRes.data.data || [];
            return newIncidents.length > 0 ? newIncidents : prev;
          });

          setBackups((prev) => {
            const newBackups = backupsRes.data.data || [];
            return newBackups.length > 0 ? newBackups : prev;
          });

          setNvrs((prev) => {
            const newNvrs = nvrsRes.data.data || [];
            return newNvrs.length > 0 ? newNvrs : prev;
          });

          setLastRefresh(new Date());
          setLoading(false);
        });
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, [fetchWithRetry]);

  useEffect(() => {
    const channel = echo.channel("servers");
    channel.listen("ServerUpdated", (e) => {
      setServers((prev) =>
        prev.map((s) => (s.name === e.server.name ? e.server : s))
      );
    });
    return () => {
      channel.stopListening("ServerUpdated");
      echo.leaveChannel("servers");
    };
  }, []);

  // Calculate status metrics
  const getServerMetrics = () => {
    const online = servers.filter((s) => s.status === "online").length;
    const offline = servers.filter((s) => s.status === "offline").length;
    const critical = servers.filter(
      (s) => (s.cpu_usage > 80 || s.ram_usage > 80) && s.status === "online"
    ).length;
    const warning = servers.filter(
      (s) =>
        (s.cpu_usage > 60 && s.cpu_usage <= 80) ||
        (s.ram_usage > 60 && s.ram_usage <= 80)
    ).length;
    return { total: servers.length, online, offline, critical, warning };
  };

  const getAlertMetrics = () => {
    const open = alerts.filter((a) => a.status?.toLowerCase() === "open").length;
    const critical = alerts.filter(
      (a) => a.severity?.toLowerCase() === "critical"
    ).length;
    const warning = alerts.filter(
      (a) => a.severity?.toLowerCase() === "warning"
    ).length;
    return { total: alerts.length, open, critical, warning };
  };

  const getIncidentMetrics = () => {
    const open = incidents.filter(
      (i) => i.status?.toLowerCase() === "open"
    ).length;
    const resolved = incidents.filter(
      (i) => i.status?.toLowerCase() === "resolved"
    ).length;
    const critical = incidents.filter(
      (i) => i.severity?.toLowerCase() === "critical"
    ).length;
    return { total: incidents.length, open, resolved, critical };
  };

  const getBackupMetrics = () => {
    const successful = backups.filter(
      (b) => b.status?.toLowerCase() === "success"
    ).length;
    const failed = backups.filter(
      (b) => b.status?.toLowerCase() === "failed"
    ).length;
    const pending = backups.filter(
      (b) => b.status?.toLowerCase() === "pending"
    ).length;
    return { total: backups.length, successful, failed, pending };
  };

  const getNvrMetrics = () => {
    const online = nvrs.filter((n) => n.status?.toLowerCase() === "online").length;
    const offline = nvrs.filter(
      (n) => n.status?.toLowerCase() === "offline"
    ).length;
    const recording = nvrs.filter(
      (n) => n.recording_status?.toLowerCase() === "recording"
    ).length;
    return { total: nvrs.length, online, offline, recording };
  };

  const navigate = useNavigate();
  const serverMetrics = getServerMetrics();
  const alertMetrics = getAlertMetrics();
  const incidentMetrics = getIncidentMetrics();
  const backupMetrics = getBackupMetrics();
  const nvrMetrics = getNvrMetrics();

  const handleNavigate = (path) => () => navigate(path);

  // Status indicator component
  const StatusIndicator = ({ value, total, label, critical = 0, warning = 0 }) => {
    let bgColor = "bg-green-50 dark:bg-green-900/20";
    let borderColor = "border-green-200 dark:border-green-700";
    let textColor = "text-green-800 dark:text-green-200";
    let iconColor = "text-green-600";

    if (critical > 0) {
      bgColor = "bg-red-50 dark:bg-red-900/20";
      borderColor = "border-red-200 dark:border-red-700";
      textColor = "text-red-800 dark:text-red-200";
      iconColor = "text-red-600";
    } else if (warning > 0) {
      bgColor = "bg-yellow-50 dark:bg-yellow-900/20";
      borderColor = "border-yellow-200 dark:border-yellow-700";
      textColor = "text-yellow-800 dark:text-yellow-200";
      iconColor = "text-yellow-600";
    }

    return (
      <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">
              {label}
            </p>
            <p className={`text-2xl font-bold ${textColor} mt-1`}>
              {value}/{total}
            </p>
            {(critical > 0 || warning > 0) && (
              <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                {critical > 0 && <span className="text-red-600 dark:text-red-400">🔴 {critical} critical</span>}
                {warning > 0 && critical > 0 && <span className="mx-1">•</span>}
                {warning > 0 && <span className="text-yellow-600 dark:text-yellow-400">⚠️ {warning} warning</span>}
              </p>
            )}
          </div>
          <div className={`text-4xl ${iconColor}`}>
            {critical > 0 ? "🔴" : warning > 0 ? "⚠️" : "✅"}
          </div>
        </div>
      </div>
    );
  };

  // Quick stats section
  const QuickStatsCard = ({ title, icon, onClick, metrics }) => {
    const isClickable = !!onClick;
    return (
      <button
        onClick={onClick}
        disabled={!isClickable}
        className={`${
          isClickable
            ? "cursor-pointer hover:shadow-lg hover:scale-105"
            : "cursor-default"
        } bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 transition-all duration-300 text-left`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {icon}
            </h3>
          </div>
        </div>
        {metrics && (
          <div className="flex gap-4 text-xs">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                <span className="font-bold text-gray-900 dark:text-white ml-1">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </button>
    );
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <DashboardNavbar onLogout={onLogout} toggleTheme={toggleTheme} />
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold">📊 Infrastructure Monitor</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Last updated: {formatRelativeTime(lastRefresh)}
          </p>
        </div>
        <button
          onClick={handleNavigate("/reports")}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-sm hover:-translate-y-0.5"
        >
          View Reports
        </button>
      </div>

      {loading && servers.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <QuickStatsCard
              title="Servers"
              icon="🖥️"
              metrics={{
                Online: serverMetrics.online,
                Offline: serverMetrics.offline,
              }}
              onClick={handleNavigate("/servers")}
            />
            <QuickStatsCard
              title="Alerts"
              icon="🔔"
              metrics={{
                Open: alertMetrics.open,
                Critical: alertMetrics.critical,
              }}
              onClick={handleNavigate("/alerts")}
            />
            <QuickStatsCard
              title="Incidents"
              icon="⚠️"
              metrics={{
                Open: incidentMetrics.open,
                Critical: incidentMetrics.critical,
              }}
              onClick={handleNavigate("/incidents")}
            />
            <QuickStatsCard
              title="Backups"
              icon="💾"
              metrics={{
                Success: backupMetrics.successful,
                Failed: backupMetrics.failed,
              }}
              onClick={handleNavigate("/backups")}
            />
            <QuickStatsCard
              title="NVRs"
              icon="📹"
              metrics={{
                Online: nvrMetrics.online,
                Recording: nvrMetrics.recording,
              }}
              onClick={handleNavigate("/nvr")}
            />
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatusIndicator
              label="Servers"
              value={serverMetrics.online}
              total={serverMetrics.total}
              critical={serverMetrics.critical}
              warning={serverMetrics.warning}
            />
            <StatusIndicator
              label="Alerts"
              value={alertMetrics.open}
              total={alertMetrics.total}
              critical={alertMetrics.critical}
              warning={alertMetrics.warning}
            />
            <StatusIndicator
              label="Incidents"
              value={incidentMetrics.open}
              total={incidentMetrics.total}
              critical={incidentMetrics.critical}
            />
            <StatusIndicator
              label="Backups"
              value={backupMetrics.successful}
              total={backupMetrics.total}
              critical={backupMetrics.failed}
            />
            <StatusIndicator
              label="NVRs"
              value={nvrMetrics.online}
              total={nvrMetrics.total}
            />
          </div>

          {/* Global Stats */}
          <GlobalStats />


        </>
      )}
    </div>
    </>
  );
}

export default Dashboard;