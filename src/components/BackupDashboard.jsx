import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardNavbar from "./DashboardNavbar";

function BackupDashboard({ onLogout, toggleTheme }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [dataCleared, setDataCleared] = useState(localStorage.getItem("backup_data_cleared") === "true");

  // Fetch backups - called on mount only
  useEffect(() => {
    // Clear mock data one-time on first load
    if (!dataCleared) {
      clearMockData();
      localStorage.setItem("backup_data_cleared", "true");
      setDataCleared(true);
    } else {
      fetchBackups();
    }
  }, [dataCleared]);

  const clearMockData = () => {
    // Clear backups from backend
    API.post("/backups/clear", {}).catch((err) => {
      console.log("Note: Backend may not have clear endpoint yet", err);
    });
    setBackups([]);
    setLastRefresh(new Date());
    setLoading(false);
  };

  const fetchBackups = () => {
    API.get("/backups")
      .then((res) => {
        setBackups(res.data.data || []);
        setLastRefresh(new Date());
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching backups:", err);
        setLoading(false);
      });
  };

  // Check if server has backup for today
  const hasBackupToday = (serverName) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const serverBackups = backups.filter((b) => b.server_name === serverName);
    return serverBackups.some((backup) => {
      const backupDate = new Date(backup.created_at);
      backupDate.setHours(0, 0, 0, 0);
      return backupDate.getTime() === today.getTime();
    });
  };

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
    } else if (statusLower === "running") {
      return {
        badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-700",
        icon: "🔄"
      };
    }
    return {
      badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-700",
      icon: "⏳"
    };
  };

  // Group backups by server and get latest for each
  const groupedBackups = backups.reduce((acc, backup) => {
    const serverName = backup.server_name || "Unknown Server";
    if (!acc[serverName]) {
      acc[serverName] = [];
    }
    acc[serverName].push(backup);
    return acc;
  }, {});

  // Get latest backup per server, sorted by date
  const latestBackups = Object.entries(groupedBackups).reduce((acc, [server, backupList]) => {
    if (backupList.length > 0) {
      const sorted = [...backupList].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      acc[server] = sorted[0];
    }
    return acc;
  }, {});

  const handleShowHistory = () => {
    setShowHistoryModal(true);
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
  const runningCount = backups.filter(b => b.status?.toLowerCase() === "running").length;
  const pendingCount = backups.filter(b => b.status?.toLowerCase() === "pending" || !b.status).length;

  return (
    <>
      {onLogout && toggleTheme && <DashboardNavbar onLogout={onLogout} toggleTheme={toggleTheme} />}
      <div className={onLogout && toggleTheme ? "p-6 bg-white dark:bg-gray-900" : "p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              💾 Backup Dashboard
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastRefresh.toLocaleString()}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Note:</span> Automatic backups run daily at 00:00 (midnight) with duplicate prevention
              </div>
              <div className="flex gap-2 whitespace-nowrap">
                <button
                  onClick={handleShowHistory}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 dark:hover:from-indigo-800 dark:hover:to-indigo-950 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  📜 View History
                </button>
              </div>
          </div>

          {/* Backup Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Backups</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalBackups}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Successful</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{successCount}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Failed</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{failedCount}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Running</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{runningCount}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Servers Grid */}
        {Object.keys(latestBackups).length === 0 ? (
          <div className="p-8 text-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-dashed border-yellow-200 dark:border-yellow-700">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
              No backups found
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Create your first backup to see it here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(latestBackups).map(([serverName, backup]) => {
              const statusColor = getStatusColor(backup.status);
              const serverBackups = groupedBackups[serverName] || [];

              return (
                <div
                  key={serverName}
                  className={`${statusColor.bg} ${statusColor.border} border-2 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer`}
                  onClick={() => { setSelectedServer(serverName); setShowHistoryModal(true); }}
                >
                  {/* Server Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      🖥️ {serverName}
                    </h3>
                    <span className="text-3xl flex-shrink-0">{statusColor.icon}</span>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${statusColor.badge} mb-4 w-fit`}>
                    {backup.status?.toUpperCase() || "PENDING"}
                  </span>

                  {/* Today's Backup Indicator */}
                  {hasBackupToday(serverName) && (
                    <div className="mb-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                      <p className="text-xs font-semibold text-green-800 dark:text-green-200">
                        ✓ Backup completed today - No duplicate will be created
                      </p>
                    </div>
                  )}

                  {/* Latest Backup Info */}
                  <div className="space-y-2 mb-6 flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">📅 Latest Backup:</span> {backup.created_at ? new Date(backup.created_at).toLocaleString() : "N/A"}
                    </p>
                    {backup.size && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">💾 Size:</span> {backup.size}
                      </p>
                    )}
                    {backup.duration && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">⏱️ Duration:</span> {backup.duration}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">📊 Total Backups:</span> {serverBackups.length}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <BackupHistoryModal
          groupedBackups={groupedBackups}
          onClose={() => { setShowHistoryModal(false); setSelectedServer(null); }}
          getStatusColor={getStatusColor}
          selectedServer={selectedServer}
        />
      )}
    </>
  );
}

// Backup History Modal Component - Collapsible servers with status filters
function BackupHistoryModal({ groupedBackups, onClose, getStatusColor, selectedServer }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedServers, setExpandedServers] = useState({});
  const [statusFilters, setStatusFilters] = useState({});

  // Filter servers by search term or by selectedServer if provided
  let filteredServers = Object.keys(groupedBackups).filter((serverName) =>
    serverName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (selectedServer) {
    filteredServers = filteredServers.includes(selectedServer) ? [selectedServer] : [];
  }

  // Auto-expand selected server when modal opens for a specific server
  useEffect(() => {
    if (selectedServer) {
      setExpandedServers({ [selectedServer]: true });
      setStatusFilters((prev) => ({ ...prev, [selectedServer]: "all" }));
    }
  }, [selectedServer]);

  const totalServers = Object.keys(groupedBackups).length;
  const totalHistoryBackups = Object.values(groupedBackups).reduce((sum, backups) => sum + backups.length, 0);

  // Toggle server expansion
  const toggleServerExpand = (serverName) => {
    setExpandedServers((prev) => ({
      ...prev,
      [serverName]: !prev[serverName],
    }));
    // Initialize status filter to "all" if not set
    if (!statusFilters[serverName]) {
      setStatusFilters((prev) => ({
        ...prev,
        [serverName]: "all",
      }));
    }
  };

  // Set status filter for a server
  const setStatusFilter = (serverName, status) => {
    setStatusFilters((prev) => ({
      ...prev,
      [serverName]: status,
    }));
  };

  // Get backups for a server filtered by status
  const getFilteredBackups = (serverName) => {
    const allBackups = groupedBackups[serverName] || [];
    const filter = statusFilters[serverName] || "all";

    const sorted = [...allBackups].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (filter === "all") return sorted;
    return sorted.filter((b) => b.status?.toLowerCase() === filter.toLowerCase());
  };

  const getBackupsGroupedByStatus = (serverName) => {
    const backups = groupedBackups[serverName] || [];
    const groups = {
      success: [],
      failed: [],
      running: [],
      pending: [],
      other: [],
    };

    [...backups]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .forEach((backup) => {
        const status = backup.status?.toLowerCase();
        if (status === "success" || status === "failed" || status === "running" || status === "pending") {
          groups[status].push(backup);
        } else {
          groups.other.push(backup);
        }
      });

    return groups;
  };

  // Get backup counts by status
  const getBackupCounts = (serverName) => {
    const backups = groupedBackups[serverName] || [];
    return {
      all: backups.length,
      success: backups.filter((b) => b.status?.toLowerCase() === "success").length,
      failed: backups.filter((b) => b.status?.toLowerCase() === "failed").length,
      running: backups.filter((b) => b.status?.toLowerCase() === "running").length,
      pending: backups.filter((b) => b.status?.toLowerCase() === "pending").length,
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-900 text-white p-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">📜 Backup History</h2>
            <p className="text-sm text-indigo-100 mt-1">
              {totalServers} servers • {totalHistoryBackups} total backups
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Search servers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 transition"
            />
            {searchTerm && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Showing {filteredServers.length} of {totalServers} servers
              </p>
            )}
          </div>

          {/* Servers List */}
          {filteredServers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No servers found matching your search" : "No backup history available"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServers.map((serverName) => {
                const isExpanded = expandedServers[serverName];
                const backupCounts = getBackupCounts(serverName);
                const filteredBackups = getFilteredBackups(serverName);
                const currentFilter = statusFilters[serverName] || "all";

                return (
                  <div
                    key={serverName}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300"
                  >
                    {/* Server Header - Clickable */}
                    <button
                      onClick={() => toggleServerExpand(serverName)}
                      className="w-full bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 hover:from-gray-150 hover:to-gray-100 dark:hover:from-gray-650 dark:hover:to-gray-650 px-6 py-4 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <span className={`text-2xl transform transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}>
                          ▶️
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            🖥️ {serverName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {backupCounts.all} backup{backupCounts.all !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges Preview */}
                      <div className="flex gap-2">
                        {backupCounts.success > 0 && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-bold rounded-full">
                            ✅ {backupCounts.success}
                          </span>
                        )}
                        {backupCounts.failed > 0 && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-bold rounded-full">
                            ❌ {backupCounts.failed}
                          </span>
                        )}
                        {backupCounts.running > 0 && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-full">
                            🔄 {backupCounts.running}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
                        {/* Status Filter Tabs */}
                        <div className="mb-6 flex flex-wrap gap-2">
                          <button
                            onClick={() => setStatusFilter(serverName, "all")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              currentFilter === "all"
                                ? "bg-indigo-600 dark:bg-indigo-700 text-white shadow-lg"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            All ({backupCounts.all})
                          </button>
                          <button
                            onClick={() => setStatusFilter(serverName, "success")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              currentFilter === "success"
                                ? "bg-green-600 dark:bg-green-700 text-white shadow-lg"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-green-300 dark:border-green-700"
                            }`}
                          >
                            ✅ Success ({backupCounts.success})
                          </button>
                          <button
                            onClick={() => setStatusFilter(serverName, "failed")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              currentFilter === "failed"
                                ? "bg-red-600 dark:bg-red-700 text-white shadow-lg"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-red-300 dark:border-red-700"
                            }`}
                          >
                            ❌ Failed ({backupCounts.failed})
                          </button>
                          <button
                            onClick={() => setStatusFilter(serverName, "running")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              currentFilter === "running"
                                ? "bg-blue-600 dark:bg-blue-700 text-white shadow-lg"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-blue-300 dark:border-blue-700"
                            }`}
                          >
                            🔄 Running ({backupCounts.running})
                          </button>
                          <button
                            onClick={() => setStatusFilter(serverName, "pending")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              currentFilter === "pending"
                                ? "bg-yellow-600 dark:bg-yellow-700 text-white shadow-lg"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-yellow-300 dark:border-yellow-700"
                            }`}
                          >
                            ⏳ Pending ({backupCounts.pending})
                          </button>
                        </div>

                        {/* Backups List */}
                        {currentFilter === "all" ? (
                          <div className="space-y-6 max-h-96 overflow-y-auto">
                            {Object.entries(getBackupsGroupedByStatus(serverName)).map(([statusKey, statusGroup]) => {
                              if (statusGroup.length === 0) return null;
                              const statusDisplay = {
                                success: "✅ Success",
                                failed: "❌ Failed",
                                running: "🔄 Running",
                                pending: "⏳ Pending",
                                other: "⚪ Other",
                              }[statusKey] || statusKey;
                              return (
                                <div key={statusKey} className="space-y-3">
                                  <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{statusDisplay}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{statusGroup.length} backup{statusGroup.length !== 1 ? "s" : ""}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    {statusGroup.map((backup, idx) => {
                                      const statusColor = getStatusColor(backup.status);
                                      return (
                                        <div
                                          key={`${statusKey}-${idx}`}
                                          className={`${statusColor.bg} ${statusColor.border} border-2 rounded-lg p-4 hover:shadow-md transition-all`}
                                        >
                                          <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{statusColor.icon}</span>
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColor.badge}`}>
                                                  {backup.status?.toUpperCase() || "PENDING"}
                                                </span>
                                              </div>
                                              <p className="font-semibold text-gray-900 dark:text-white">
                                                📅 {backup.created_at ? new Date(backup.created_at).toLocaleString() : "N/A"}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                                            <div className="bg-white/60 dark:bg-black/30 rounded p-2">
                                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Size</p>
                                              <p className="font-semibold text-gray-900 dark:text-white text-xs">{backup.size || "N/A"}</p>
                                            </div>
                                            <div className="bg-white/60 dark:bg-black/30 rounded p-2">
                                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Duration</p>
                                              <p className="font-semibold text-gray-900 dark:text-white text-xs">{backup.duration || "N/A"}</p>
                                            </div>
                                            <div className="bg-white/60 dark:bg-black/30 rounded p-2">
                                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Type</p>
                                              <p className="font-semibold text-gray-900 dark:text-white text-xs">{backup.type || "Full"}</p>
                                            </div>
                                            <div className="bg-white/60 dark:bg-black/30 rounded p-2">
                                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Location</p>
                                              <p className="font-semibold text-gray-900 dark:text-white text-xs">{backup.location || "Local"}</p>
                                            </div>
                                          </div>
                                          {backup.stages && backup.stages.length > 0 && (
                                            <div className="mb-3 bg-white dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
                                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">📋 Stages:</p>
                                              <div className="space-y-1">
                                                {backup.stages.map((stage, stageIdx) => (
                                                  <div key={stageIdx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <span className="min-w-fit">
                                                      {stage.status?.toLowerCase() === "success" && "✅"}
                                                      {stage.status?.toLowerCase() === "failed" && "❌"}
                                                      {stage.status?.toLowerCase() === "running" && "🔄"}
                                                      {!stage.status && "⏳"}
                                                    </span>
                                                    <span className="font-medium">{stage.name}</span>
                                                    {stage.duration && <span className="text-gray-500">({stage.duration})</span>}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {backup.logs && (
                                            <div className="mb-2 bg-gray-900 dark:bg-black rounded p-2 border border-gray-700">
                                              <p className="text-xs font-bold text-gray-300 mb-1">📝 Logs:</p>
                                              <div className="text-green-400 text-xs font-mono overflow-x-auto max-h-20">
                                                <pre className="whitespace-pre-wrap break-words">{backup.logs}</pre>
                                              </div>
                                            </div>
                                          )}
                                          {backup.error && (
                                            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded p-2">
                                              <p className="text-xs font-bold text-red-900 dark:text-red-200">❌ Error:</p>
                                              <p className="text-xs text-red-800 dark:text-red-300 mt-1">{backup.error}</p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : filteredBackups.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                              No {currentFilter !== "all" ? currentFilter : ""} backups found
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {filteredBackups.map((backup, idx) => {
                              const statusColor = getStatusColor(backup.status);
                              return (
                                <div
                                  key={idx}
                                  className={`${statusColor.bg} ${statusColor.border} border-2 rounded-lg p-4 hover:shadow-md transition-all`}
                                >
                                  {/* Backup Info Header */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{statusColor.icon}</span>
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColor.badge}`}>
                                          {backup.status?.toUpperCase() || "PENDING"}
                                        </span>
                                      </div>
                                      <p className="font-semibold text-gray-900 dark:text-white">
                                        📅 {backup.created_at ? new Date(backup.created_at).toLocaleString() : "N/A"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Backup Details Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                                    <div className="bg-white/60 dark:bg-black/30 rounded p-2">
                                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Size</p>
                                      <p className="font-semibold text-gray-900 dark:text-white text-xs">{backup.size || "N/A"}</p>
                                    </div>
                                    <div className="bg-white/60 dark:bg-black/30 rounded p-2">
                                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Duration</p>
                                      <p className="font-semibold text-gray-900 dark:text-white text-xs">{backup.duration || "N/A"}</p>
                                    </div>
                                    <div className="bg-white/60 dark:bg-black/30 rounded p-2">
                                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Type</p>
                                      <p className="font-semibold text-gray-900 dark:text-white text-xs">{backup.type || "Full"}</p>
                                    </div>
                                    <div className="bg-white/60 dark:bg-black/30 rounded p-2">
                                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Location</p>
                                      <p className="font-semibold text-gray-900 dark:text-white text-xs">{backup.location || "Local"}</p>
                                    </div>
                                  </div>

                                  {/* Backup Stages/Steps */}
                                  {backup.stages && backup.stages.length > 0 && (
                                    <div className="mb-3 bg-white dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
                                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">📋 Stages:</p>
                                      <div className="space-y-1">
                                        {backup.stages.map((stage, stageIdx) => (
                                          <div key={stageIdx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="min-w-fit">
                                              {stage.status?.toLowerCase() === "success" && "✅"}
                                              {stage.status?.toLowerCase() === "failed" && "❌"}
                                              {stage.status?.toLowerCase() === "running" && "🔄"}
                                              {!stage.status && "⏳"}
                                            </span>
                                            <span className="font-medium">{stage.name}</span>
                                            {stage.duration && <span className="text-gray-500">({stage.duration})</span>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Logs */}
                                  {backup.logs && (
                                    <div className="mb-2 bg-gray-900 dark:bg-black rounded p-2 border border-gray-700">
                                      <p className="text-xs font-bold text-gray-300 mb-1">📝 Logs:</p>
                                      <div className="text-green-400 text-xs font-mono overflow-x-auto max-h-20">
                                        <pre className="whitespace-pre-wrap break-words">{backup.logs}</pre>
                                      </div>
                                    </div>
                                  )}

                                  {/* Error */}
                                  {backup.error && (
                                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded p-2">
                                      <p className="text-xs font-bold text-red-900 dark:text-red-200">❌ Error:</p>
                                      <p className="text-xs text-red-800 dark:text-red-300 mt-1">{backup.error}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BackupDashboard;
