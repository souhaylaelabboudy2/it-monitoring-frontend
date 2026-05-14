function ReportTables({ alerts, incidents, backups, nvrs, servers, loading }) {
  const badgeClass = (value) => {
    const normalized = (value || "").toString().toLowerCase();
    if (normalized.includes("critical") || normalized.includes("failed") || normalized.includes("offline") || normalized.includes("open")) {
      return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200";
    }
    if (normalized.includes("warning") || normalized.includes("pending")) {
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    }
    if (normalized.includes("success") || normalized.includes("online") || normalized.includes("resolved")) {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    }
    return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
  };

  const renderTable = (title, subtitle, headers, rows, emptyMessage) => (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{subtitle}</h3>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">{rows.length} records</span>
      </div>
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm font-semibold text-slate-500 dark:text-slate-300">
                {headers.map((header) => (
                  <th key={header} className="pb-4 pr-6">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-4 pr-6 text-sm text-slate-700 dark:text-slate-200 align-top">
                      {typeof cell === "object" && cell !== null ? (
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(cell.value)}`}>
                          {cell.label}
                        </span>
                      ) : (
                        cell ?? "—"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const alertRows = alerts.map((alert) => [
    alert.title,
    alert.type || "Alert",
    { label: alert.severity, value: alert.severity },
    { label: alert.status, value: alert.status },
    alert.last_seen ? new Date(alert.last_seen).toLocaleString() : "—",
  ]);

  const incidentRows = incidents.map((incident) => [
    incident.title,
    incident.resource || incident.type || "Incident",
    { label: incident.severity, value: incident.severity },
    { label: incident.status, value: incident.status },
    incident.created_at ? new Date(incident.created_at).toLocaleString() : "—",
  ]);

  const backupRows = backups.map((backup) => [
    backup.resource || backup.server || backup.name || "Backup",
    { label: backup.status, value: backup.status },
    backup.duration ? `${backup.duration} min` : "—",
    backup.completed_at ? new Date(backup.completed_at).toLocaleString() : "—",
  ]);

  const serverRows = servers.map((server) => [
    server.name || server.host || "Server",
    { label: server.status, value: server.status },
    `${server.cpu_usage ?? "—"}%`,
    `${server.ram_usage ?? "—"}%`,
    `${server.disk_usage ?? "—"}%`,
  ]);

  const nvrRows = nvrs.map((nvr) => [
    nvr.name || "NVR",
    { label: nvr.status, value: nvr.status },
    `${nvr.cameras_count ?? "—"}`,
    `${nvr.disk_usage ?? "—"}%`,
    nvr.location || "—",
  ]);

  return (
    <>
      {renderTable(
        "Alerts",
        "Recent alert history",
        ["Title", "Type", "Severity", "Status", "Last seen"],
        alertRows,
        "No alerts match the current filters."
      )}
      {renderTable(
        "Incidents",
        "Active incident overview",
        ["Title", "Resource", "Severity", "Status", "Created"],
        incidentRows,
        "No incidents match the current filters."
      )}
      {renderTable(
        "Backups",
        "Backup outcome details",
        ["Resource", "Status", "Duration", "Completed"],
        backupRows,
        "No backup records match the current filters."
      )}
      {renderTable(
        "Servers",
        "Server connectivity and health",
        ["Name", "Status", "CPU", "RAM", "Disk"],
        serverRows,
        "No server records match the current filters."
      )}
      {renderTable(
        "NVRs",
        "Video system availability",
        ["Name", "Status", "Cameras", "Disk Usage", "Location"],
        nvrRows,
        "No NVR records match the current filters."
      )}
    </>
  );
}

export default ReportTables;
