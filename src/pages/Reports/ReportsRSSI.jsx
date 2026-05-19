import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import API from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import ReportSummaryCards from "./components/ReportSummaryCards";
import ReportFilters from "./components/ReportFilters";
import ReportCharts from "./components/ReportCharts";
import ReportTables from "./components/ReportTables";
import ExportPDFModal from "./components/ExportPDFModal";
import { useRetryableApi } from "../../hooks/useRetryableApi";

function ReportsRSSI({ onLogout, toggleTheme }) {
  const [summaryData, setSummaryData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [backups, setBackups] = useState([]);
  const [nvrs, setNvrs] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    severity: "all",
    status: "all",
    resource: "all",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const alertRef = useRef(null);
  const incidentRef = useRef(null);
  const backupRef = useRef(null);
  const serverRef = useRef(null);
  const nvrRef = useRef(null);
  const autoRefreshIntervalRef = useRef(null);
  const { fetchWithRetry } = useRetryableApi();

  const AUTO_REFRESH_INTERVAL = 300000; // 5 minutes

  const transformServerHosts = (hosts) => {
    if (!Array.isArray(hosts)) return [];
    return hosts.map((host) => ({
      id: host.hostid,
      name: host.name || host.host || "Server",
      status: host.status === "0" || host.status?.toLowerCase() === "online" ? "online" : "offline",
      cpu_usage: host.cpu_usage !== undefined ? host.cpu_usage : null,
      ram_usage: host.ram_usage !== undefined ? host.ram_usage : null,
      disk_usage: host.disk_usage !== undefined ? host.disk_usage : null,
      host: host.host || host.name || "",
      created_at: host.created_at || host.last_seen || "",
    }));
  };

  const fetchAllData = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch RSSI summary
      const summaryRes = await API.get("/reports/rssi-summary").catch((error) => ({ error }));

      // Fetch Zabbix hosts with retry
      const serversRes = await fetchWithRetry(
        async () => {
          const res = await API.get("/zabbix/hosts");
          return res;
        },
        "Zabbix hosts",
        2,
        800
      ).catch((error) => ({ error }));

      // Extract data using correct backend structure
      const summary = summaryRes.error ? {} : summaryRes.data?.summary || {};
      const details = summaryRes.error ? {} : summaryRes.data?.details || {};

      const alertsData = details.alerts || [];
      const incidentsData = details.incidents || [];
      const backupsData = details.backups || [];
      const nvrsData = details.nvrs || [];
      
      const hostsData = serversRes.error
        ? []
        : serversRes.data?.value || serversRes.data?.result || serversRes.data || [];

      setSummaryData(summary);
      setAlerts(alertsData);
      setIncidents(incidentsData);
      setBackups(backupsData);
      setNvrs(nvrsData);
      setServers(transformServerHosts(hostsData));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load RSSI report data:", err);
      setError("Unable to load report data. Please try again later.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchWithRetry]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    autoRefreshIntervalRef.current = setInterval(() => {
      fetchAllData(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [fetchAllData]);

  const parseDate = useCallback((timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }, []);

  const inDateRange = useCallback(
    (timestamp) => {
      if (!filters.fromDate && !filters.toDate) return true;
      const recordDate = parseDate(timestamp);
      if (!recordDate) return true;
      const from = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00`) : null;
      const to = filters.toDate ? new Date(`${filters.toDate}T23:59:59`) : null;
      if (from && recordDate < from) return false;
      if (to && recordDate > to) return false;
      return true;
    },
    [filters.fromDate, filters.toDate, parseDate]
  );

  const filterBySeverity = useCallback(
    (item) => {
      if (filters.severity === "all") return true;
      return (item.severity || "").toLowerCase() === filters.severity;
    },
    [filters.severity]
  );

  const filterByStatus = useCallback(
    (item) => {
      if (filters.status === "all") return true;
      return (item.status || "").toLowerCase() === filters.status;
    },
    [filters.status]
  );

  const filteredAlerts = useMemo(
    () =>
      alerts.filter(
        (item) =>
          inDateRange(item.last_seen || item.created_at) &&
          filterBySeverity(item) &&
          filterByStatus(item) &&
          (filters.resource === "all" || filters.resource === "alerts")
      ),
    [alerts, filters, filterBySeverity, filterByStatus, inDateRange]
  );

  const filteredIncidents = useMemo(
    () =>
      incidents.filter(
        (item) =>
          inDateRange(item.created_at || item.updated_at) &&
          filterBySeverity(item) &&
          filterByStatus(item) &&
          (filters.resource === "all" || filters.resource === "incidents")
      ),
    [incidents, filters, filterBySeverity, filterByStatus, inDateRange]
  );

  const filteredBackups = useMemo(
    () =>
      backups.filter(
        (item) =>
          inDateRange(item.completed_at || item.created_at) &&
          filterByStatus(item) &&
          (filters.resource === "all" || filters.resource === "backups")
      ),
    [backups, filters, filterByStatus, inDateRange]
  );

  const filteredServers = useMemo(
    () =>
      servers.filter(
        (item) =>
          inDateRange(item.created_at) &&
          filterByStatus(item) &&
          (filters.resource === "all" || filters.resource === "servers")
      ),
    [servers, filters, filterByStatus, inDateRange]
  );

  const filteredNvrs = useMemo(
    () =>
      nvrs.filter(
        (item) =>
          inDateRange(item.created_at || item.updated_at) &&
          filterByStatus(item) &&
          (filters.resource === "all" || filters.resource === "nvrs")
      ),
    [nvrs, filters, filterByStatus, inDateRange]
  );

  const summaryMetrics = useMemo(() => ({
    // Prefer real Zabbix hosts when available (servers array). Fallback to summaryData when empty.
    totalServers: (Array.isArray(servers) && servers.length) ? servers.length : (summaryData?.total_servers || 0),
    onlineServers: (Array.isArray(servers) && servers.length)
      ? servers.filter((s) => (s.status || "").toLowerCase() === "online").length
      : (summaryData?.online_servers || 0),
    offlineServers: (Array.isArray(servers) && servers.length)
      ? servers.filter((s) => (s.status || "").toLowerCase() === "offline").length
      : (summaryData?.offline_servers || 0),
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter((a) => (a.severity || "").toLowerCase() === "critical").length,
    warningAlerts: alerts.filter((a) => (a.severity || "").toLowerCase() === "warning").length,
    infoAlerts: alerts.filter((a) => (a.severity || "").toLowerCase() === "info").length,
    openIncidents: incidents.filter((i) => (i.status || "").toLowerCase() === "open").length,
    resolvedIncidents: incidents.filter((i) => (i.status || "").toLowerCase() === "resolved").length,
    backupSuccess: backups.filter((b) => (b.status || "").toLowerCase() === "success").length,
    backupFailed: backups.filter((b) => (b.status || "").toLowerCase() === "failed").length,
    totalNvrs: nvrs.length,
    onlineNvrs: nvrs.filter((item) => (item.status || "").toLowerCase() === "online").length,
    offlineNvrs: nvrs.filter((item) => (item.status || "").toLowerCase() === "offline").length,
  }), [summaryData, alerts, incidents, backups, nvrs, servers]);

  const chartData = useMemo(() => ({
    alertSeverity: {
      labels: ["Critical", "Warning", "Info"],
      datasets: [{
        label: "Alerts",
        data: [
          alerts.filter((a) => (a.severity || "").toLowerCase() === "critical").length,
          alerts.filter((a) => (a.severity || "").toLowerCase() === "warning").length,
          alerts.filter((a) => (a.severity || "").toLowerCase() === "info").length,
        ],
        backgroundColor: ["#e11d48", "#f59e0b", "#2563eb"],
        borderWidth: 0,
      }],
    },
    incidentStatus: {
      labels: ["Open", "Resolved"],
      datasets: [{
        label: "Incidents",
        data: [
          incidents.filter((i) => (i.status || "").toLowerCase() === "open").length,
          incidents.filter((i) => (i.status || "").toLowerCase() === "resolved").length,
        ],
        backgroundColor: ["#f97316", "#22c55e"],
      }],
    },
    backupOutcome: {
      labels: ["Success", "Failed"],
      datasets: [{
        label: "Backups",
        data: [
          backups.filter((b) => (b.status || "").toLowerCase() === "success").length,
          backups.filter((b) => (b.status || "").toLowerCase() === "failed").length,
        ],
        backgroundColor: ["#22c55e", "#ef4444"],
      }],
    },
    serverStatus: {
      labels: ["Online", "Offline"],
      datasets: [{
        label: "Servers",
        data: [
          servers.filter((s) => (s.status || "").toLowerCase() === "online").length,
          servers.filter((s) => (s.status || "").toLowerCase() === "offline").length,
        ],
        backgroundColor: ["#14b8a6", "#f87171"],
      }],
    },
    nvrStatus: {
      labels: ["Online", "Offline"],
      datasets: [{
        label: "NVRs",
        data: [
          nvrs.filter((item) => (item.status || "").toLowerCase() === "online").length,
          nvrs.filter((item) => (item.status || "").toLowerCase() === "offline").length,
        ],
        backgroundColor: ["#38bdf8", "#f97316"],
      }],
    },
  }), [alerts, incidents, backups, servers, nvrs]);

  const buildPdf = async (selected) => {
    setPdfLoading(true);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = 50;

    const addHeading = (title, subtitle) => {
      doc.setFontSize(18);
      doc.setTextColor(17, 24, 39);
      doc.text(title, margin, y);
      y += 24;
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.text(subtitle, margin, y);
      y += 20;
    };

    const addFooter = () => {
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i += 1) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Page ${i} of ${pageCount}`, margin, doc.internal.pageSize.height - 30);
      }
    };

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, doc.internal.pageSize.width, 60, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Infrastructure Monitoring System", margin, 38);
    doc.setFontSize(12);
    doc.text(`RSSI Report · ${new Date().toLocaleString()}`, margin, 55);
    y = 90;

    if (selected.summary) {
      addHeading("RSSI Summary", "High-level totals for servers, alerts, incidents, backups, and NVR systems.");
      const summaryRows = [
        ["Total Servers", String(summaryMetrics.totalServers)],
        ["Online Servers", String(summaryMetrics.onlineServers)],
        ["Offline Servers", String(summaryMetrics.offlineServers)],
        ["Total Alerts", String(summaryMetrics.totalAlerts)],
        ["Critical Alerts", String(summaryMetrics.criticalAlerts)],
        ["Open Incidents", String(summaryMetrics.openIncidents)],
        ["Backup Success", String(summaryMetrics.backupSuccess)],
        ["Backup Failed", String(summaryMetrics.backupFailed)],
        ["Total NVRs", String(summaryMetrics.totalNvrs)],
        ["Online NVRs", String(summaryMetrics.onlineNvrs)],
        ["Offline NVRs", String(summaryMetrics.offlineNvrs)],
      ];
      doc.autoTable({
        startY: y,
        theme: "grid",
        head: [["Metric", "Value"]],
        body: summaryRows,
        headStyles: { fillColor: [15, 23, 42], textColor: 255 },
        styles: { cellPadding: 6, fontSize: 10 },
      });
      y = doc.previousAutoTable.finalY + 20;
    }

    if (selected.charts) {
      const chartEntries = [
        { ref: alertRef, title: "Alerts by severity" },
        { ref: incidentRef, title: "Incidents by status" },
        { ref: backupRef, title: "Backup success vs failed" },
        { ref: serverRef, title: "Servers online/offline" },
        { ref: nvrRef, title: "NVR status" },
      ];
      for (const chartEntry of chartEntries) {
        const chart = chartEntry.ref.current;
        if (!chart) continue;
        const imageData = chart.toBase64Image();
        if (y + 260 > doc.internal.pageSize.height) {
          doc.addPage();
          y = margin;
        }
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39);
        doc.text(chartEntry.title, margin, y);
        y += 18;
        doc.addImage(imageData, "PNG", margin, y, doc.internal.pageSize.width - margin * 2, 180);
        y += 200;
      }
    }

    const addTableSection = (title, dataRows, headers) => {
      if (y + 120 > doc.internal.pageSize.height) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text(title, margin, y);
      y += 18;
      doc.autoTable({
        startY: y,
        head: [headers],
        body: dataRows,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], textColor: 255 },
        styles: { cellPadding: 5, fontSize: 9 },
        didDrawPage: () => {},
      });
      y = doc.previousAutoTable.finalY + 20;
    };

    if (selected.alerts) {
      addTableSection(
        "Alerts",
        filteredAlerts.map((item) => [
          item.title || "—",
          item.type || "—",
          item.severity || "—",
          item.status || "—",
          item.last_seen ? new Date(item.last_seen).toLocaleString() : "—",
        ]),
        ["Title", "Type", "Severity", "Status", "Last seen"]
      );
    }

    if (selected.incidents) {
      addTableSection(
        "Incidents",
        filteredIncidents.map((item) => [
          item.title || "—",
          item.resource || item.type || "—",
          item.severity || "—",
          item.status || "—",
          item.created_at ? new Date(item.created_at).toLocaleString() : "—",
        ]),
        ["Title", "Resource", "Severity", "Status", "Created"]
      );
    }

    if (selected.backups) {
      addTableSection(
        "Backups",
        filteredBackups.map((item) => [
          item.resource || item.server || item.name || "—",
          item.status || "—",
          item.duration ? `${item.duration} min` : "—",
          item.completed_at ? new Date(item.completed_at).toLocaleString() : "—",
        ]),
        ["Resource", "Status", "Duration", "Completed"]
      );
    }

    if (selected.servers) {
      addTableSection(
        "Servers",
        filteredServers.map((item) => [
          item.name || item.host || "—",
          item.status || "—",
          `${item.cpu_usage ?? "—"}%`,
          `${item.ram_usage ?? "—"}%`,
          `${item.disk_usage ?? "—"}%`,
        ]),
        ["Name", "Status", "CPU", "RAM", "Disk"]
      );
    }

    if (selected.nvrs) {
      addTableSection(
        "NVRs",
        filteredNvrs.map((item) => [
          item.name || "—",
          item.status || "—",
          `${item.cameras_count ?? "—"}`,
          `${item.disk_usage ?? "—"}%`,
          item.location || "—",
        ]),
        ["Name", "Status", "Cameras", "Disk usage", "Location"]
      );
    }

    addFooter();
    doc.save(`RSSI_Report_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "_")}.pdf`);
    setPdfLoading(false);
  };

  const handleGeneratePdf = (selected) => {
    setModalOpen(false);
    buildPdf(selected).catch((err) => {
      console.error("PDF generation error", err);
      setPdfLoading(false);
    });
  };

  return (
    <>
      {onLogout && toggleTheme && <DashboardNavbar onLogout={onLogout} toggleTheme={toggleTheme} />}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm overflow-hidden mb-8">
        <div className="h-1 bg-rose-600" />
        <div className="p-8 lg:p-10 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm uppercase tracking-[0.35em] text-rose-600">RSSI REPORTING</p>
            <h1 className="mt-4 text-5xl font-semibold text-slate-950 dark:text-white">Infrastructure Monitoring System</h1>
            <div className="mx-auto mt-4 h-2 w-28 rounded-full bg-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.24)]" />
            <p className="mt-5 text-slate-600 dark:text-slate-300 leading-7">
              Comprehensive RSSI reporting with dynamic charts, tables, filters, and export-ready PDF output for operations and executive insights. Data auto-refreshes every 5 minutes.
            </p>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              {isRefreshing && <span className="inline-block w-2 h-2 bg-rose-600 rounded-full animate-pulse" />}
              Last refreshed: {lastUpdated.toLocaleString()}
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-500"
            >
              <span className="text-base">⬇️</span>
              Export report
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 dark:border-rose-700 dark:bg-rose-950 p-6 mb-8 text-rose-900 dark:text-rose-200">
          {error}
        </div>
      )}

      <ReportFilters filters={filters} onFilterChange={setFilters} onRefresh={fetchAllData} isRefreshing={isRefreshing} />
      <ReportSummaryCards metrics={summaryMetrics} loading={loading} />
      <ReportCharts chartRefs={{
        alertSeverityRef: alertRef,
        incidentStatusRef: incidentRef,
        backupOutcomeRef: backupRef,
        serverStatusRef: serverRef,
        nvrStatusRef: nvrRef,
      }} data={chartData} />
      <ReportTables
        alerts={filteredAlerts}
        incidents={filteredIncidents}
        backups={filteredBackups}
        nvrs={filteredNvrs}
        servers={filteredServers}
        loading={loading}
      />
      <ExportPDFModal open={modalOpen} onClose={() => setModalOpen(false)} onGenerate={handleGeneratePdf} loading={pdfLoading} />
    </div>
    </>
  );
}

export default ReportsRSSI;
